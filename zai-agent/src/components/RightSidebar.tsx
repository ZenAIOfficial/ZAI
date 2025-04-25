/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import sol from "@/assets/ic_wallet_sol.webp";
import userWalletCopyImg from "@/assets/ic_user_wallet_copy.svg";
import userSettingsImg from "@/assets/ic_user_settings.svg";
import dialogCloseImg from "@/assets/ic_dialog_close_light.svg";
import userInfoImg from "@/assets/ic_user_info.svg";
import addressImg from "@/assets/ic_address.svg";
import signOutImg from "@/assets/ic_sign_out.svg";
import { setKickOut, useUserStore } from "@/store/userStore";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { copyText, splitWalletAddress } from "@/utils/utils";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { useDialog } from "@/hooks/useDialog";
import { getVisible } from "@/utils/dialogs";
import UserTokenItem from "./UserTokenItem";
import { userTokenStore } from "@/store/userTokenStore";
import BigNumber from "bignumber.js";
import UserTransferList from "./UserTransferList";
import TokensChainStatus from "@/components/TokensChainStatus";

interface Props {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}
const RightSidebar: React.FC<Props> = ({ isOpen, setOpen }) => {
  const { showAddFundsDialog, showAddressDialog } = useDialog();
  const menuRef = useRef<Menu>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const userInfo = useUserStore((state) => state.userInfo);
  const [active, setActive] = useState(0);
  const userTokens = userTokenStore((state) => state.tokens);
  const totalBalance = userTokenStore((state) => state.totalBalance);
  const [currentUserTokens, setCurrentUserTokens] = useState(userTokens);
  const currentChainRef = useRef("OmniChain");

  useEffect(() => {
    // requestChatList();
  }, []);

  // useEffect(() => {
  //   // requestChatList();
  //   if (isOpen) {
  //     document.addEventListener("mousedown", handleClickOutside1);
  //   }
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside1);
  //   }
  // }, [isOpen]);

  useEffect(() => {
    if (!userInfo) {
    } else {
    }
  }, [userInfo]);

  // const handleClickOutside1 = (event: any) => {
  //   if (isOpen && !getVisible()) {
  //     if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
  //       setOpen(!isOpen);
  //     }
  //   }
  // };

  const handleTopup = () => {
    showAddFundsDialog();
  }

  const signOut = () => {
    setKickOut(true);
  }

  const toggleSidebar = () => {
    setOpen(!isOpen);
  };

  const items: MenuItem[] = [
    {
      label: "Address",
      className: 'hover:bg-[#0000000A] focus:bg-white mx-0.75 rounded cursor-pointer',
      command: () => {
        showAddressDialog();
      },
      template: (item, options) => {
        return (
            <div className="flex ml-3 py-1">
              <Image height={16} width={16} src={addressImg} alt="" />
              <span className={`w-full flex flex-row items-center ml-2.5 text-black`} onClick={(e) => options.onClick(e)} >{item.label}</span>
            </div>
        );
      },
    },
    {
      label: "Sign out",
      icon: 'pi pi-sign-out',
      className: 'hover:bg-[#0000000A] focus:bg-white mx-0.75 rounded cursor-pointer',
      command: () => {
        signOut();
      },
      template: (item, options) => {
        return (
            <div className="flex ml-3 py-1">
              <Image height={16} width={16} src={signOutImg} alt="" />
              <span className={`w-full flex flex-row items-center ml-2.5 text-black`} onClick={(e) => options.onClick(e)} >{item.label}</span>
            </div>
        );
      },
    },
  ];

  const onChainChange = (chain: string) => {
    currentChainRef.current = chain;
    const filterList = userTokens.filter((item) => chain === "OmniChain" || item.network === chain.toLowerCase() || (chain === "SOL" && item.network === "solana"));
    if (filterList.length > 0) {
      setCurrentUserTokens(filterList);
    }
  }

  useEffect(() => {
    onChainChange(currentChainRef.current);
  }, [userTokens]);

  const handleCopy = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    if (userInfo) {
      copyText(userInfo.address);
    }
  }

  const handleMore = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    menuRef.current?.toggle(e);
  }

  const handleActive = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    e.stopPropagation();
    setActive(index);
  }

  const getTotalBalance = () => {
    if (totalBalance === 0) {
      return '0.00';
    }
    return `${new BigNumber(totalBalance).decimalPlaces(2, BigNumber.ROUND_HALF_UP)}`;
  }
  return (
    <div className={`fixed right-0 top-0 h-full z-11 ${isOpen ? 'w-screen' : ''} flex justify-end transition-all ease-in-out`} style={{transform: isOpen ? "" : "translateX(100%)"}}>
      <div className="bg-[#00000066] backdrop-blur-[4px] md:backdrop-blur-none md:bg-transparent flex-1" onClick={toggleSidebar} />
      <div
          className={`bg-white text-grap-200 flex flex-col duration-200 h-screen shadow-lg w-80 md:w-88.5`}
          ref={sidebarRef}
      >
        <div className="flex justify-between items-center h-14 w-80 md:w-88.5">
          {/*<div className="h-10 bg-[#f4f4f5] rounded-xl flex flex-row items-center px-3 ml-2 select-none ">
            <Image className="w-7.5 h-7.5 rounded-full mr-2" width={30} height={30} src={sol} alt="" />
            <span className="text-black text-sm mr-2">{splitWalletAddress(userInfo?.address)}</span>
            <Image className="w-4 cursor-pointer" src={userWalletCopyImg} width={16} height={16} onClick={handleCopy} alt="" />
          </div>

          <div className="mr-auto ml-2 rounded-full curor-pointer hover:bg-b-hover cursor-pointer" onClick={handleMore}>
            <Image className="w-8.5 h-8.5" src={userSettingsImg} width={34} height={34} alt="" />
          </div>*/}

          <div className="mr-auto ml-4 rounded-full curor-pointer hover:bg-b-hover cursor-pointer" onClick={handleMore}>
            <Image className="w-7.5 h-7.5" src={userInfoImg} width={30} height={30} alt="" />
          </div>


          <button onClick={toggleSidebar} className={`mr-4 text-black cursor-pointer focus:outline-none ${isOpen ? '' : 'hidden'}`}>
            <Image className="w-6 h-6" src={dialogCloseImg} width={24} height={24} alt={""} />
          </button>

        </div>

        <div className="mt-7 flex justify-center items-center text-[46px] font-semibold">
          <span className="text-[#B6B6B6]">$</span>
          {
            getTotalBalance()
          }
        </div>

        <div className="mt-4.5 flex justify-center items-center text-white">
          <div className="topup_bg w-25.5 h-9.5 flex justify-center items-center rounded-full hover:opacity-80 cursor-pointer select-none" onClick={handleTopup}>Deposit</div>
        </div>

        <div className="mt-7 flex flex-row items-center select-none border-b border-t border-[#E4E4E7] ">
          <div className="w-25 flex justify-center items-center font-medium relative py-2.5 cursor-pointer" onClick={(e) => handleActive(e, 0)}>
            <span className={`${active === 0 ? 'text-black' : 'text-color_text_middle'}`}>Tokens</span>
            {
              active === 0 && <div className="w-full h-0.5 bg-linear-to-r from-[#FF86E1] to-[#89BCFF] absolute bottom-0" />
            }

          </div>
          <div className="w-25 flex justify-center items-center relative py-2.5 cursor-pointer" onClick={(e) => handleActive(e, 1)}>
            <span className={`${active === 1 ? 'text-black' : 'text-color_text_middle'}`}>History</span>
            {
                active === 1 && <div className="w-full h-0.5 bg-linear-to-r from-[#FF86E1] to-[#89BCFF] absolute bottom-0" />
            }
          </div>
          <div className="ml-auto mr-4">
            <TokensChainStatus callback={onChainChange} />
          </div>
        </div>
        {/*<div className="w-50 mt-1.5 flex flex-row">
          {
              active === 1 && <div className="flex-1 bg-b-normal h-0.25"></div>
          }
          <div className="w-25 topup_bg h-0.5"></div>
          {
              active === 0 && <div className="flex-1 bg-b-normal h-0.25"></div>
          }
        </div>*/}

        <div className="pt-2 flex-1 h-full overflow-auto">

          {
              active === 0 && <div>
                {
                  currentUserTokens.map((item) => (<UserTokenItem key={item.symbol} toggleSidebar={toggleSidebar} item={item} />))
                }
              </div>
          }

          {
              active === 1 && <UserTransferList network={currentChainRef.current} />
          }

        </div>
        <Menu className="p-menu-chain mt-1.5 p-menu-signout" ref={menuRef} model={items} popup popupAlignment="left" />
      </div>
    </div>
  );
};

export default RightSidebar;