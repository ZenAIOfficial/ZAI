import React, {useEffect} from 'react';
import girlIcon from "@/assets/ic_zai_girl.webp";
import FunctionsIcon from "@/assets/ic_functions.svg";
import transferIcon from "@/assets/ic_transfer.svg";
import searchCrytoIcon from "@/assets/ic_search_crypto.svg";
import tradeCryptoIcon from "@/assets/ic_trade_crypto.svg";
import transferTiktokIcon from "@/assets/ic_transfer_tiktok.svg";
import catchTheBigIcon from "@/assets/ic_whale_analysis.svg";
import Image from "next/image";
import MessageBox from './MessageBox';
import {useTranslation} from "react-i18next";
import {useMedia} from "@/hooks/useMedia";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  callApp: Function;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  clickQuickQuestion: (q: string) => void;
}

const SendGuide: React.FC<Props> = ( { callApp, loading, setLoading, clickQuickQuestion }) => {

  const { t } = useTranslation();
  const { isPhone } = useMedia();

  const suggestionQuestion = [
    {
      id: 5,
      title: 'Whale Analysis',
      icon: catchTheBigIcon,
      q: 'Find whales'
    },
    // {
    //   id: 4,
    //   title: 'Send to TikTok user',
    //   icon: transferTiktokIcon,
    //   q: 'Send to TikTok user'
    // },
    {
      id: 2,
      title: 'Search token / contract',
      icon: searchCrytoIcon,
      q: 'Search token / contract'
    },
    {
      id: 3,
      title: 'Trade Crypto',
      icon: tradeCryptoIcon,
      q: 'Initiate a transaction task on the Solana or BSC chain!'
    },
    {
      id: 1,
      title: 'Transfer',
      icon: transferIcon,
      q: 'Initiate a transfer task on the Solana or BSC chain!'
    },
    {
      id: 0,
      title: 'What can you do?',
      icon: FunctionsIcon,
      q: 'What can you do?'
    },
  ];

  useEffect(() => {
  }, []);

  return (
    <div className="w-full flex flex-col justify-center items-center -mt-[54px]">
        <Image className="w-16" src={girlIcon} alt={''} />
        <div className="text-[20px] md:text-2xl font-semibold color-black leading-normal mt-6 px-3 md:px-0 text-center">Is there anything I can help with?</div>
        <div className="text-sm font-normal text-[#1B1B1B] md:text-[#03001c] leading-normal mt-2 text-center px-3 md:px-0 whitespace-pre-wrap">{isPhone ? t("home.send_message_hint") : t("home.send_message_hint")}</div>
        <div className='w-full mt-6'>
            <MessageBox
                callApp={callApp}
                loading={loading}
                setLoading={setLoading}
                placeholder={"Ask ZAI anything..."} />
        </div>
        {/*<div className='grid grid-cols-[auto_auto] sm:grid-cols-[auto_auto_auto_auto] gap-2 px-3 md:px-0 -mt-1 place-items-center'>
          {
            suggestionQuestion.filter((res,index) => index < 3).map((item, index) => {
              return <div className={`flex justify-center items-center ${index === 3 ? '' : ''}`} key={`mid-q-${item.id}`}>
              <div
                className={`flex flex-row justify-start rounded-2xl ${item.id === 5 ? 'important-questions-bg text-white hover:opacity-80':'border border-b-normal'} ${loading ? 'opacity-40' : 'hover:bg-[#ffffff70]'} items-center text-color_text_dark text-[12px] md:text-sm w-auto px-3 py-2 md:py-2.5 whitespace-nowrap `}
                 onClick={() => clickQuickQuestion(item.q)}>
                {
                  <>{item.title}</>
                }
              </div>
              </div>
            })
          }
        </div>
        <div className='flex flex-row px-3 md:px-0 mt-2'>
          {
            suggestionQuestion.filter((res,index) => index >= 3).map((item, index) => {
              return <div className={`flex justify-center mr-2 items-center ${index === 3 ? '' : ''}`} key={`mid-q-${item.id}`}>
              <div
                className={`flex flex-row justify-start rounded-2xl border border-b-normal ${loading ? 'opacity-40' : 'hover:bg-[#ffffff70]'} items-center text-color_text_dark text-[12px] md:text-sm w-auto px-3 py-2 md:py-2.5 whitespace-nowrap `}
                onClick={() => clickQuickQuestion(item.q)}>
                {
                  <>{item.title}</>
                }
              </div>
              </div>
            })
          }
        </div>*/}
        <div className='flex flex-row flex-wrap px-3 mt-[-4px] md:mt-0 md:px-0 justify-center w-full gap-2'>
          {
            suggestionQuestion.map((item, index) => {
              return <div className={`flex justify-center items-center ${index === 3 ? '' : ''}`} key={`mid-q-${item.id}`}>
              <div
                className={`flex flex-row justify-start rounded-2xl  ${item.id === 5 ? 'important-questions-bg text-white hover:opacity-80':'border border-b-normal'} ${loading ? 'opacity-40' : 'hover:bg-[#ffffff70]'} items-center text-color_text_dark text-[13px] md:text-sm w-auto px-3 py-2 md:py-2.5 whitespace-nowrap `}
                onClick={() => clickQuickQuestion(item.q)}>
                {
                  <>{item.title}</>
                }
              </div>
              </div>
            })
          }
        </div>
    </div>
  );
};

export default SendGuide;
