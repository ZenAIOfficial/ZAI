/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import IcToggleSidbar from "@/assets/ic_toggle_sidebar.svg";
import IcNewChat from "@/assets/ic_new_chat.svg";
import IcHistoryChat from "@/assets/ic_history_chat.svg";
import { Tooltip } from 'primereact/tooltip';
import { getChatPre } from '@/apis/ai/chat';
import { isLogin } from "@/store/userStore";
import { usePathname, useRouter } from 'next/navigation';
import Image from "next/image";
import WalletStatus from './WalletStatus';
import { useDialog } from '@/hooks/useDialog';
import HistoryChat from './HistoryChat';
import ChainStatus from './ChainStatus';
import SearchStatus from './SearchStatus';
import ZaiToken from './ZaiToken';
import {useMedia} from "@/hooks/useMedia";
import searchTokenImg from "@/assets/ic_search_gary.svg";

interface Props {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  setRightOpen: (isOpen: boolean) => void;
}
const MainHeader: React.FC<Props> = ({ isOpen, setOpen, setRightOpen }) => {
  // const location = useLocation();
  const router = useRouter();
  const { showLoginDialog, showSearchDialog } = useDialog();
  const pathname = usePathname();
  const [isOpenHistoryChat, setIsOpenHistoryChat] = useState(false);
  const { isWeb } = useMedia();

  const toggleSidebar = () => {
    setOpen(!isOpen);
  };

  const newChatSidebar = async () => {
    if (!isLogin()) {
      showLoginDialog();
      return;
    }
    await getChatPre();
    router.push("/");
  }

  const showHistoryChat = () => {
    setIsOpenHistoryChat(true);
  }

  return (
    <div className='sticky top-0 bg-white z-10 flex flex-row justify-between items-center w-full h-[56px] border-b md:border-b-0 border-[#6666661A]'>
      <div className='flex flex-row md:justify-between items-center w-full h-[56px]'>
        <div className="px-2 md:px-4 flex flex-row">
          <button onClick={toggleSidebar} className={`transition-all duration-200 text-black ${isOpen ? 'hidden' : 'opacity-100'}`}>
            <Image className="w-[34px] h-[34px]" width={34} src={IcToggleSidbar} alt="" />
          </button>
          {
            pathname === '/' || pathname.includes('/c') ? <>
              <button onClick={newChatSidebar} className={`tips ml-2 text-black focus:outline-none`} data-pr-tooltip="New Chat" >
                <Image className="w-[34px] h-[34px]" width={34} src={IcNewChat} alt="" />
              </button>
              <Tooltip target=".tips" position='bottom' />
            </> : <></>
          }
          {
            /*isWeb && pathname === '/trading' ? <>
              <div className='font-semibold text-lg md:text-2xl'>Trading</div>
            </> : <></>*/
          }

          {
            pathname === '/' || pathname.includes('/c') ? <>
              <button onClick={showHistoryChat} className={`ml-2 text-black focus:outline-none cursor-pointer`} >
                <Image className="w-[34px] h-[34px]" width={34} src={IcHistoryChat} alt="" />
              </button>
            </> : <></>
          }

        </div>
        {
          isOpenHistoryChat ? <HistoryChat isOpen={isOpenHistoryChat} setOpen={setIsOpenHistoryChat}></HistoryChat> : <></>
        }

          {
              (pathname === '/' || pathname.includes('/c')) && isWeb ?
                  <div className={`items-center h-10 flex mr-2`}>
                      <ZaiToken />
                  </div> : <></>
          }

        {
          pathname.includes('/trading') ?
            <div className='flex-1 relative hidden md:flex'>
              <SearchStatus />
            </div> : <div className='flex-1'></div>
        }

        <div className={`items-center h-9 flex mr-2 ml-auto`}>
          <ChainStatus />
        </div>

        {
          pathname.includes('/trading') ?
              <Image className="w-5.5 h-5.5 fill-[#666666] ml-0.5 mr-2.5 md:hidden" width={22} height={22}
                     src={searchTokenImg} alt="" onClick={() => showSearchDialog()} />
              : <></>
        }

        <div className={`items-center h-10 mr-2 md:mr-4 flex`}>
          <WalletStatus setRightOpen={setRightOpen} />
        </div>
      </div>
    </div>
  );
}

export default MainHeader;