import React, { useRef } from 'react';
import Image from "next/image";
import messageGirl from "@/assets/ic_message_girl.png";
import FunctionsIcon from "@/assets/ic_functions.svg";
import transferIcon from "@/assets/ic_transfer.svg";
import searchCrytoIcon from "@/assets/ic_search_crypto.svg";
import tradeCryptoIcon from "@/assets/ic_trade_crypto.svg";
import transferTiktokIcon from "@/assets/ic_transfer_tiktok.svg";
import catchTheBigIcon from "@/assets/ic_whale_analysis.svg";
import questionMoreIcon from "@/assets/ic_question_more.svg";
import { OverlayPanel } from 'primereact/overlaypanel';

interface Props {
  loading: boolean;
  clickQuickQuestion: (q: string) => void;
}
const MainQuestion: React.FC<Props> = ({ loading, clickQuickQuestion }) => {
  const op = useRef<OverlayPanel>(null);
  
  const suggestionQuestion = [
    {
      id: 5,
      title: 'Whale Analysis',
      icon: catchTheBigIcon,
      q: 'Find whales'
    },
    // {
    //   id: 4,
    //   title: 'Send',
    //   icon: transferTiktokIcon,
    //   q: 'Send to TikTok user'
    // },
    {
      id: 2,
      title: 'Token Insight',
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
      title: 'Functions',
      icon: FunctionsIcon,
      q: 'What can you do?'
    },
  ];

  const handleClick = (item: string) => {
    op.current?.hide();
    clickQuickQuestion(item);
  };

  const handleMore = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    if (loading) {
      return;
    }
    op.current?.toggle(e);
  };

  return (
    <div
      className="flex flex-row items-end m-auto w-full md:max-w-3xl px-3 md:px-0 pt-3">
      <div className="w-fit flex flex-row justify-end items-end -mb-3 ml-3 mt-[-1px] md:ml-0 md:mt-0">
        <Image className="w-16 ml:1 md:ml-5" src={messageGirl} alt={''} />
        <div className="bg-primary1 shrink-0 text-white flex items-center justify-center" style={{
          borderRadius: "9px 9px 9px 0",
          width: "18px",
          height: "18px",
          fontSize: "10px",
          paddingTop: "2px",
          marginLeft: "-7px",
          marginBottom: "60px",
        }}>Hi
        </div>
      </div>
      <div className={`flex flex-col ml-1 md:ml-2 h-full items-start w-full overflow-y-auto`}>
        <div className={`flex flex-row mt-2 flex-nowrap w-full overflow-x-auto`}>
          {
            suggestionQuestion.slice(0,4).map((item) => {
              return <div
                key={`quesstion-${item.id}`}
                className={`flex flex-row shrink-0 mr-2 justify-start rounded-xl ${item.id === 5 ? 'important-questions-bg text-white hover:opacity-80':''} border border-b-normal ${loading ? 'opacity-40' : 'hover:bg-b-hover'} items-center text-black text-[12px] md:text-[14px] px-2.5 py-2 whitespace-nowrap`}
                onClick={() => clickQuickQuestion(item.q)}>
                  <Image className="w-[12px] md:w-5" src={item.icon} alt={''} /><span className="ml-1 md:ml-2.5">{item.title}</span>
              </div>
            })
          }
          <div
              className={`flex flex-row shrink-0 mr-2 justify-start rounded-xl border border-b-normal ${loading ? 'opacity-40' : 'hover:bg-b-hover'} items-center text-black text-[12px] md:text-[14px] px-2.5 py-2 whitespace-nowrap`}
              onClick={(e) => handleMore(e)}>
                <Image className="w-[12px] md:w-5" src={questionMoreIcon} alt={''} />
            </div>
        </div>

        <OverlayPanel ref={op} className='-translate-y-[80px]'>
          <div className="flex flex-col"  onClick={()=>{}}>
          {
            suggestionQuestion.slice(4,6).map((item) => {
              return <div
                key={`quesstion-${item.id}`}
                className={`flex flex-row shrink-0 last:mt-1 justify-start rounded-xl border border-b-normal ${loading ? 'opacity-40' : 'hover:bg-b-hover'} items-center text-black text-[12px] md:text-[14px] px-2.5 py-2 whitespace-nowrap`}
                onClick={() => handleClick(item.q)}>
                  <Image className="w-[12px] md:w-5" src={item.icon} alt={''} /><span className="ml-1 md:ml-2.5">{item.title}</span>
              </div>
            })
          }
          </div>
        </OverlayPanel>
      </div>
    </div>
  );
}

export default MainQuestion;