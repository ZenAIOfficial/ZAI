/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import { addSearchRecent, clearSearchRecent, useUserStore } from '@/store/userStore';
import { TokenRecent } from '@/apis/user';
import ImageWithFallback from './ImageWithFallback';
import imageErrorImg from "@/assets/ic_image_error.svg";
import { useRouter } from 'next/navigation';
import { sortMktCap, TrendInfo } from '@/apis/trading';
import { formatPrice, translateAmount, translateNumber } from '@/utils/utils';
import {useDialog} from "@/hooks/useDialog";
import TokenImage from "@/components/TokenImage";

interface Props {
  isOpen: boolean;
  trendInfos: TrendInfo[];
  setOpen: (isOpen: boolean) => void;
  handleSearchContentTap: () => void;
  onSuccess: () => void;
}
const SearchContent: React.FC<Props> = ({ isOpen, trendInfos, setOpen, handleSearchContentTap, onSuccess }) => {
  const router = useRouter();
  const historyChatRef = useRef<HTMLDivElement>(null);
  const recentList = useUserStore((status) => status.recent);
  const [trendInfoList, setTrendInfoList] = useState<TrendInfo[]>([]);
  const { hideDialog } = useDialog();

  useEffect(() => {
    if (trendInfoList.length === 0) {
      sortMktCap().then((res) => {
        setTrendInfoList(res.list);
      });
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  console.log('trendInfos', trendInfos);

  const handleClickOutside = (event: any) => {
    if (isOpen) {
      if (historyChatRef.current && !historyChatRef.current.contains(event.target)) {
        handleSearchContentTap();
      }
    }
  };

  const renderRecentItem = (item: TokenRecent) => {
    return (
      <div key={item.address} className='flex flex-row items-center cursor-pointer' onClick={() => handleGotoTrading(item)}>
        {/*<ImageWithFallback className="w-5 h-5 rounded-full" width={20} height={20} src={item.image} fallbackSrc={imageErrorImg} />*/}
        <TokenImage className="w-5 h-5 rounded-full shrink-1" markClassName="w-2.5 h-2.5" image={item.image} width={20} height={20} name={item.symbol} chain={item.network} />
        <div className='ml-1'>{item.symbol}</div>
      </div>
    );
  }

  const renderRecentList = () => {
    if (trendInfos.length !== 0) {
      return (<></>)
    }
    return recentList.length !== 0 && (
      <>
      <div className='ml-1.5 mt-4 text-lg font-medium'>Recent</div>
        <div className='ml-1.5 mt-3 flex flex-row gap-x-3.5 gap-y-1 flex-wrap max-h-13 '>
        {
          recentList.map((item) => (renderRecentItem(item)))
        }
        <div className='h-6 flex px-0.5 rounded-sm items-center text-center text-sm text-[#666666] font-medium hover:bg-b-hover cursor-pointer' onClick={handleClearRecentList}>Clear</div>
      </div></>
    )
  }

  const handleClearRecentList = () => {
    clearSearchRecent();
  };

  const handleGotoTrading = (item: TokenRecent) => {
    onSuccess();
    setOpen(false);
    addSearchRecent({
      symbol: item.symbol,
      image: item.image,
      address: item.address,
      network: item.network,
    });
    router.push(`/trading/${item.address}`);
    hideDialog();
  };


  const renderTopMarketCapItem = (item: TrendInfo) => {
    return (
      <div key={item.address} className='h-15 rounded-xl px-1.5 flex flex-row items-center cursor-pointer hover:bg-b-hover' onClick={() => handleGotoTrading(item)}>
        {/*<ImageWithFallback className="w-9 h-9 rounded-full" width={36} height={36} src={item.image} fallbackSrc={imageErrorImg} />*/}
        <TokenImage className="w-9 h-9 rounded-full shrink-1" image={item.image} width={36} height={36} name={item.symbol} chain={item.network} />
        <div className='flex flex-col ml-3'>
          <div className='font-medium'>{item.symbol}</div>
          <div className='text-xs text-text_5'>{`Volume \$${translateAmount(Number(formatPrice(item.volumePast24h, 2)))}`}</div>
        </div>
        <div className='flex flex-col justify-end items-end ml-auto'>
          <div className='font-medium'>{`\$${formatPrice(item.price, 3)}`}</div>
          <div className={`font-medium ${item.price24hChange > 0 ? "text-[#29CA53]" : "text-[#FF4B92]"}`}>
            {item.price24hChange > 0 ? "+" : "-"}{translateNumber(Number(formatPrice(Math.abs(item.price24hChange), 2)))}%
          </div>
        </div>
        
     </div>
    )
  }
  const renderTopMarketCaps = () => {
    if (trendInfos.length !== 0) {
      return (
        <>
          <div className='mt-3 flex flex-col gap-y-1'>
          {
            trendInfos.map((item) => (renderTopMarketCapItem(item)))
          }
        </div></>
      )
    }
    return trendInfoList.length !== 0 && (
      <>
      <div className='ml-1.5 mt-5 text-lg font-medium'>Top Market Caps</div>
        <div className='mt-3 flex flex-col gap-y-1'>
        {
          trendInfoList.map((item) => (renderTopMarketCapItem(item)))
        }
      </div></>
    )
  }

  return (
    <div ref={historyChatRef} className='flex flex-col w-full h-[calc(90vh-104px)]  md:absolute md:top-[56px] md:h-115 overflow-auto md:w-85 md:left-auto md:right-auto md:rounded-xl md:border md:border-b-normal md:shadow-lg md:bg-white md:px-3 text-14px'>
      {
        renderRecentList()
      }
      {
        renderTopMarketCaps()
      }
    </div>
  );
}

export default SearchContent;