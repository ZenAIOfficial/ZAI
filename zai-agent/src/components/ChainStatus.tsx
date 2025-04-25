import React, {useEffect, useRef, useState} from "react";
import downImg from "@/assets/ic_down.svg";
import sol from "@/assets/ic_wallet_sol.webp";
import base from "@/assets/ic_wallet_base.svg";
import eth from "@/assets/ic_wallet_eth.svg";
import bsc from "@/assets/ic_wallet_bsc.svg";
import tron from "@/assets/ic_wallet_tron.svg";
import allChain from "@/assets/ic_all_chain.svg";

import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import Image from "next/image"
import {updateLocalChain, useUserStore} from "@/store/userStore";
import {ChainInfo} from "@/apis/user";

type Props = object

const ChainStatus: React.FC<Props> = () => {
  const menuRef = useRef<Menu>(null);
    const chainListRef = useRef<Array<ChainInfo>>([
        {id: 1, name: "OmniChain", icon: allChain},
        {id: 2, name: "BSC", icon: bsc},
        {id: 3, name: "SOL", icon: sol},
        {id: 4, name: "Coming Soon", icon: ""},
        {id: 5, name: "Base", icon: base},
        {id: 6, name: "ETH", icon: eth},
        {id: 7, name: "Tron", icon: tron},
    ]);

    const userChain = useUserStore((state) => state.chain);

    const [currentChain, setCurrentChain] = React.useState<ChainInfo>(chainListRef.current[0]);

    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

    const changeChain = (item: ChainInfo) => {
        setCurrentChain(item);
        updateLocalChain(item);
    }

    useEffect(() => {
        if (!userChain || Object.keys(userChain).length === 0) {
            setCurrentChain(chainListRef.current[0]);
            updateLocalChain(chainListRef.current[0]);
        }
        const items: MenuItem[] = chainListRef.current.map((chain) => ({
            command: () => {
                changeChain(chain);
            },
            template: (item, options) => (
                <>
                    {
                        chain.id === 4 ?
                            <div className="flex flex-row items-center ml-4 mt-1 h-7.5">
                                <span className="text-[#666666] text-sm">Coming Soon</span>
                            </div>
                            :
                            <div className={`flex flex-row items-center ml-2 mt-0.5 h-7.5 px-2 mr-2 ${chain.id < 4 ? 'cursor-pointer hover:bg-[#F4F4F5]' : ''}`}
                                 onClick={(e) => {
                                     if (chain.id < 4) {
                                         options.onClick(e)
                                     }
                                 }}>
                                <Image className="w-5 h-5 rounded-full" width={20} height={20} src={chain.icon} alt="" />
                                <span className="text-black text-sm ml-1">{chain.name}</span>
                            </div>
                    }
                </>

            ),
        }));

        setMenuItems(items);
    }, []);

  // const items: MenuItem[] = [
  //     {
  //         template: () => {
  //             return (
  //                 <div className="flex flex-row items-center ml-2 mt-0.5 h-7.5 px-2 mr-2 cursor-pointer">
  //                     <Image className="w-5 h-5 rounded-full" width={20} height={20} src={allChain} alt="" />
  //                     <span className="text-black text-sm ml-1">OmniChain</span>
  //                 </div>
  //             );
  //         },
  //     },
  //     {
  //         template: () => {
  //             return (
  //                 <div className="flex flex-row items-center ml-2 mt-0.5 h-7.5 px-2 mr-2 cursor-pointer">
  //                     <Image className="w-5 h-5 rounded-full" width={20} height={20} src={bsc} alt="" />
  //                     <span className="text-black text-sm ml-1">BSC</span>
  //                 </div>
  //             );
  //         },
  //     },
  //   {
  //     template: () => {
  //       return (
  //         <div className="flex flex-row items-center ml-2 mt-0.5 h-7.5 px-2 bg-[#F4F4F5] rounded-lg mr-2">
  //           <Image className="w-5 h-5 rounded-full" width={20} height={20} src={sol} alt="" />
  //           <span className="text-black text-sm ml-1">SOL</span>
  //         </div>
  //       );
  //     },
  //   },
  //   {
  //     template: () => {
  //       return (
  //         <div className="flex flex-row items-center ml-4 mt-1 h-7.5">
  //           <span className="text-[#666666] text-sm">Coming Soon</span>
  //         </div>
  //       );
  //     },
  //   },
  //   {
  //     template: () => {
  //       return (
  //         <div className="flex flex-row items-center ml-2 mt-0.5 h-7.5 px-2 mr-2">
  //           <Image className="w-5 h-5 rounded-full" width={20} height={20} src={base} alt="" />
  //           <span className="text-black text-sm ml-1">Base</span>
  //         </div>
  //       );
  //     },
  //   },
  //   {
  //     template: () => {
  //       return (
  //         <div className="flex flex-row items-center ml-2 mt-0.5 h-7.5 px-2 mr-2">
  //           <Image className="w-5 h-5 rounded-full" width={20} height={20} src={eth} alt="" />
  //           <span className="text-black text-sm ml-1">ETH</span>
  //         </div>
  //       );
  //     },
  //   },
  //   {
  //     template: () => {
  //       return (
  //         <div className="flex flex-row items-center ml-2 mt-0.5 h-7.5 px-2 mr-2">
  //           <Image className="w-5 h-5 rounded-full" width={20} height={20} src={tron} alt="" />
  //           <span className="text-black text-sm ml-1">Tron</span>
  //         </div>
  //       );
  //     },
  //   }
  // ];
  function rightMenuClick(e: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>): void {
    menuRef.current?.toggle(e);
  }

  return (
    <div className="flex items-center gap-2 h-full pl-2 pr-2 bg-[#F4F4F5] rounded-xl cursor-pointer hover:bg-[#F4F4F580] select-none"
      onClick={(e) => rightMenuClick(e)}>
      <Image className="w-5 h-5 rounded-full" width={20} height={20} src={userChain?.icon || ""} alt="" />
      <span className="text-[13px] leading-4 font-[500] hidden md:flex">{userChain?.name}</span>
      <Image className="w-4 h-4 -ml-1" width={16} height={16} src={downImg} alt="" />

      <div><Menu className="p-menu-chain mt-1.5" ref={menuRef} model={menuItems} popup popupAlignment="left" /></div>
      
    </div>
  );
};

export default ChainStatus;