/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import logo from "@/assets/agent/logo.webp";
import IcDeFAISidebar from "@/assets/ic_defai_sidebar.svg";
import IcDownSidebar from "@/assets/ic_down_sidebar.svg";
import IcDeFAILendingSidebar from "@/assets/ic_defai_lending_sidebar.svg";
import IcDeFAIStakingSidebar from "@/assets/ic_defai_staking_sidebar.svg";
import IcChatSidebar from "@/assets/ic_chat_sidebar.svg";
import IcTradingSidebar from "@/assets/ic_trading_sidebar.svg";
import IcRewardsSidebar from "@/assets/ic_rewards_sidebar.svg";
import IcToggleSidbar from "@/assets/ic_toggle_sidebar.svg";
import IcLogoCookie from "@/assets/ic_logo_cookie.webp";
import IcLogoJupiter from "@/assets/ic_logo_jupiter.webp";
import IcLogoRaydium from "@/assets/ic_logo_raydium.webp";
import IcLogoDeepseek from "@/assets/ic_logo_deepseek.webp";
import IcLogoTiktok from "@/assets/ic_logo_tiktok.webp";
import IcLogoGrok from "@/assets/ic_logo_grok.svg";
import IcLogoX from "@/assets/ic_logo_x.svg";
import IcLogoGithub from "@/assets/ic_logo_github.svg";
import IcLogoYtb from "@/assets/ic_logo_ytb.svg";
import IcDocsX from "@/assets/ic_logo_docs.svg";
import IcLogoTapestry from "@/assets/ic_logo_tapestry.webp";
import { clearChatList, requestChatList } from "@/store/chatStore";
import { isLogin, useUserStore } from "@/store/userStore";
import { docsLink, githubLink, homeLink, xLink, youtubeLink } from "@/utils/constants";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { isDev } from "@/utils/env";
import { useMessage } from "@/hooks/message";
import { usePathname, useRouter } from "next/navigation";

interface Props {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<Props> = ({ isOpen, setOpen }) => {
  const { callApp } = useMessage();
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const userInfo = useUserStore((state) => state.userInfo);
  const pathname = usePathname();
  const [openDeFAI, setOpenDeFAI] = useState(false);

  const pathnameToActive = (pathname: string) => {
    if (pathname.startsWith("/trading")) {
      return 1;
    } else if (pathname === "/rewards") {
      return 2;
    }
    return 0;
  };
  const [active, setActive] = useState(() => pathnameToActive(pathname));

  useEffect(() => {
    // requestChatList();
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setActive(pathnameToActive(pathname));
  }, [pathname]);

  useEffect(() => {
    console.log("Sidebar userInfo useEffect", userInfo);
    if (!userInfo) {
      clearChatList();
    } else {
      requestChatList();
    }
  }, [userInfo]);


  const handleClickOutside = (event: any) => {
    const isMdScreen = window.matchMedia("(min-width: 768px)").matches;
    if (isOpen && !isMdScreen) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpen(!isOpen);
      }
    }
  };

  const toggleSidebar = () => {
    setOpen(!isOpen);
  };
  
  const toX = () => {
    window.open(xLink);
  }
  const toGithub = () => {
    window.open(githubLink);
  }
  const toYoutube = () => {
    window.open(youtubeLink);
  }
  const toDocs = () => {
    window.open(docsLink);
  }

  const toHome = () => {
    window.open(homeLink);
  }
  const toTrading = () => {
    // if (!isLogin()) {
    //   showLoginDialog();
    //   return;
    // }
    router.push("/trading");
  }
  const toggerDeFAI = () => {
    setOpenDeFAI(!openDeFAI)
  }
  
  const toReward = () => {
    // if (!isLogin()) {
    //   showLoginDialog();
    //   return;
    // }
    router.push("/rewards");
  }
  const catchTheBig = async () => {
    if (pathname !== "/") {
      router.push("/?from=catchthebig");
      return;
    }
    const text = `Find whales`;
    callApp(text);

  };

  return (
      <div className={`fixed left-0 top-0 h-full z-11  ${isOpen ? 'w-screen md:w-auto' : ''} flex transition-all ease-in-out`} style={{transform: isOpen ? "" : "translateX(-100%)"}}>
        <div
            className={`bg-[#FBF9FF] text-grap-200   flex flex-col duration-200 md:shadow-none w-64`}
            ref={sidebarRef}
        >
          <div className="flex justify-between items-center px-4 h-[56px] w-64">
            <Image src={logo} className="h-[34px] cursor-pointer" height={34} onClick={toHome} priority alt={""}/>

            <button onClick={toggleSidebar} className={`text-black focus:outline-none ${isOpen ? '' : 'hidden'}`}>
              <Image className="w-[34px] h-[34px]" src={IcToggleSidbar} width={34} alt={""} />
            </button>

          </div>
          {/*<div className="flex justify-start items-center mt-8 pl-4 h-25px w-64 text-[#56637E] text-12px">
        <span>Today</span>
      </div>*/}

          <div className={`flex items-center h-9 mt-4 px-2 mx-4 cursor-pointer ${active === 0 ? 'bg-[#EFE7FF]' : ''} rounded-lg`} onClick={() => router.push("/")}>
            <Image className="w-4.5 h-4.5" src={IcChatSidebar} width={18} alt={""} />
            <span className="ml-3 text-black">Smart Trading</span>
          </div>

          <div className={`flex items-center h-9 mt-2.5 px-2 mx-4 cursor-pointer ${active === 1 ? 'bg-[#EFE7FF]' : ''} rounded-lg`} onClick={() => toTrading()}>
            <Image className="w-4.5 h-4.5" src={IcTradingSidebar} width={18} alt={""} />
            <span className="ml-3 text-black select-none">Pro Trading</span>
            <div className="ml-2 flex rounded-[7px] bg-[#F93A37] px-1.5"><span className="text-[10px] font-medium text-white select-none">Hot</span></div>
          </div>

          <div className={`flex items-center h-9 mt-2.5 px-2 mx-4 cursor-pointer rounded-lg`} onClick={() => toggerDeFAI()}>
            <Image className="w-4.5 h-4.5" src={IcDeFAISidebar} width={18} alt={""} />
            <span className="ml-3 text-black select-none">DeFAI</span>
            <span className="ml-auto transition-transform duration-200" style={{ transform: openDeFAI ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
          <Image className="w-4 h-4" src={IcDownSidebar} width={16} alt={""} />
        </span>
          </div>
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openDeFAI ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className={`group flex items-center h-8 mt-1 px-2 mx-4 cursor-pointer rounded-lg`}>
              <Image className="ml-7.5 w-4.5 h-4.5" src={IcDeFAILendingSidebar} width={18} alt={""} />
              <span className="ml-1.5 text-[14px] text-black select-none">Lending</span>
              <div className="flex ml-2 rounded-[10px] px-2 defai_bg md:px-0.75 md:hidden md:group-hover:flex"><span className="text-[10px] text-white select-none">Coming Soon</span></div>
            </div>
            <div className={`group flex items-center h-8 mt-1 px-2 mx-4 cursor-pointer rounded-lg`}>
              <Image className="ml-7.5 w-4.5 h-4.5" src={IcDeFAIStakingSidebar} width={18} alt={""} />
              <span className="ml-1.5 text-[14px] text-black select-none">Staking</span>
              <div className="flex ml-2 rounded-[10px] px-2 defai_bg md:px-0.75 md:hidden md:group-hover:flex"><span className="text-[10px] text-white select-none">Coming Soon</span></div>
            </div>
          </div>

          <div className={`flex items-center h-9 mt-2.5 px-2 mx-4 cursor-pointer ${active === 2 ? 'bg-[#EFE7FF]' : ''} rounded-lg`} onClick={() => toReward()}>
            <Image className="w-4.5 h-4.5" src={IcRewardsSidebar} width={18} alt={""} />
            <span className="ml-3 text-black select-none">Rewards</span>
          </div>

          {/*<div className="flex items-center h-9 mt-2.5 px-2 mx-4 cursor-pointer" onClick={catchTheBig}>
        <Image className="w-4.5 h-4.5" src={IcCatchTheBigSidebar} width={18} alt={""} />
        <span className="ml-3">Catch The Big</span>
        <div className="ml-2 bg-[#F93A37] w-6 h-3 flex items-center justify-center rounded-[3px]">
          <span className="text-white text-[10px]">Hot</span>
        </div>

      </div>*/}
          <div className="flex flex-col flex-1 justify-start items-start mt-4 px-2 text-14px overflow-auto">
          </div>

          <div className="mx-2 px-2 mb-4 text-sm">

            <div className="mb-2">
              <div className="h-9 text-black flex flex-row items-center cursor-pointer hover:bg-b-hover" onClick={toDocs}>
                <Image className="mr-2.5" src={IcDocsX} width={18} alt={""}/>Docs
              </div>
            </div>

            <div className="mb-3.5">
              <div className="h-[0.5px] w-full bg-[#E4E4E7] mb-3.5"></div>
              <div className="h-7 text-color_text_middle">DeFAI Integrations</div>
              <div className="h-7 flex flex-row items-center">
                <Image className="w-6 h-6 mr-5" src={IcLogoCookie} width={24} alt={""}/>
                <Image className="w-6 h-6 mr-5" src={IcLogoJupiter} width={24} alt={""}/>
                <Image className="w-6 h-6 mr-5" src={IcLogoRaydium} width={24} alt={""}/>
                <Image className="w-6 h-6 mr-5" src={IcLogoDeepseek} width={24} alt={""}/>
                <Image className="w-6 h-6" src={IcLogoTiktok} width={24} alt={""}/>
              </div>
              <div className="h-7 mt-2 flex flex-row items-center">
                <Image className="w-6 h-6 mr-5" src={IcLogoTapestry} width={24} alt={""}/>
                <Image className="w-6 h-6" src={IcLogoGrok} width={24} alt={""}/>
              </div>
            </div>

            <div className="h-[0.5px] w-full bg-[#E4E4E7] mb-1.25"></div>

            <div className="h-9 flex flex-row items-center">
              <div className="text-color_text_middle">Follow Us</div>
              <div className="flex flex-row items-center ml-auto">
                <Image className="w-4.5 h-4.5 mr-3 cursor-pointer" src={IcLogoX} width={18} alt={"x"} onClick={toX}/>
                <Image className="w-4.5 h-4.5 mr-3 cursor-pointer" src={IcLogoGithub} width={18} alt={"github"} onClick={toGithub}/>
                <Image className="w-4.5 h-4.5 mr-3.5 cursor-pointer" src={IcLogoYtb} width={18} alt={"youtube"} onClick={toYoutube}/>
              </div>
            </div>

            <div>
              {
                isDev ? <div className="absolute bottom-0.5 text-[10px] text-color_text_middle">{`V${process.env.APP_VERSION} (build: ${process.env.APP_BUILD_TIME})`}</div> : <></>
              }
            </div>
          </div>
        </div>
        <div className="bg-[#00000066] backdrop-blur-[4px] md:bg-transparent flex-1" onClick={toggleSidebar} />
      </div>

  );
};

export default Sidebar;