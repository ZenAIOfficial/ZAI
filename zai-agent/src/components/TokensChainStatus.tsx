import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import downImg from "@/assets/ic_down.svg";
import sol from "@/assets/ic_wallet_sol.webp";
import base from "@/assets/ic_wallet_base.svg";
import eth from "@/assets/ic_wallet_eth.svg";
import bsc from "@/assets/ic_wallet_bsc.svg";
import tron from "@/assets/ic_wallet_tron.svg";
import allChain from "@/assets/ic_all_chain.svg";

import { Menu } from "primereact/menu";
import {MenuItem, MenuItemCommandEvent} from "primereact/menuitem";
import Image from "next/image"
import {ChainInfo} from "@/apis/user";

interface Props {
    callback: (chain: string) => void;
}

const TokensChainStatus:React.FC<Props> = ({callback}) => {
  const menuRef = useRef<Menu>(null);
  const chainListRef = useRef<Array<ChainInfo>>([
      {id: 1, name: "OmniChain", icon: allChain},
      {id: 2, name: "BSC", icon: bsc},
      {id: 3, name: "SOL", icon: sol},
  ]);
  const [currentChain, setCurrentChain] = React.useState<ChainInfo>(chainListRef.current[0]);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const changeChain = (item: ChainInfo) => {
      setCurrentChain(item);
      callback(item.name);
  }

    useEffect(() => {
        const items: MenuItem[] = chainListRef.current.map((chain) => ({
            command: () => {
                changeChain(chain);
            },
            template: (item, options) => (
                <div className="flex flex-row items-center ml-2 mt-0.5 h-7.5 px-2 mr-2 cursor-pointer" onClick={(e) => options.onClick(e)}>
                    <Image className="w-5 h-5 rounded-full" width={16} height={16} src={chain.icon} alt="" />
                    <span className="text-black text-sm ml-1">{chain.name}</span>
                </div>
            ),
        }));

        setMenuItems(items);
    }, []);

    function rightMenuClick(e: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>): void {
    menuRef.current?.toggle(e);
  }

  return (
    <div className="flex items-center gap-2 h-7.5 pl-2 pr-2 border border-[#E4E4E7] rounded-[15px] cursor-pointer hover:bg-[#F4F4F580] select-none"
      onClick={(e) => rightMenuClick(e)}>
      <Image className="w-5 h-5 rounded-full" width={16} height={16} src={currentChain.icon} alt="" />
      {/*<span className="text-[13px] leading-4 text-black font-[500]">{currentChain.name}</span>*/}
      <Image className="w-4 h-4 -ml-1" width={16} height={16} src={downImg} alt="" />

        <Menu className="p-menu-chain mt-1.5" ref={menuRef} model={menuItems} popup popupAlignment="left" />

    </div>
  );
};

export default TokensChainStatus;