import React, { useEffect, useRef, MouseEvent } from "react";
import downImg from "@/assets/ic_down.svg";
import userWalletImg from "@/assets/ic_user_wallet.svg";
import userWalletSolImg from "@/assets/ic_user_wallet_sol.svg";
import userWalletCopyImg from "@/assets/ic_user_wallet_copy.svg";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { logout, logoutAndClearEnv, setKickOut, useUserStore } from "@/store/userStore";
import { copyText, splitWalletAddress } from "@/utils/utils";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { usePathname, useRouter } from "next/navigation";
import { useDialog } from "@/hooks/useDialog";
import Image from "next/image"
import { userTokenStore } from "@/store/userTokenStore";
import { useWallet } from "@solana/wallet-adapter-react";
import BigNumber from "bignumber.js";
import {SOL_ADDRESS} from "@/utils/constants";


interface Props {
  setRightOpen: (isOpen: boolean) => void;
}

const WalletStatus: React.FC<Props> = ({ setRightOpen }) => {
  const { disconnect } = useWallet();
  // const { showLoginDialog, showDialog, hideDialog } = useDialog();
  const menuRef = useRef<Menu>(null);
  const userInfo = useUserStore((state) => state.userInfo);
  const tokens = userTokenStore((state) => state.tokens);
  const kickOutValue = useUserStore((state) => state.kickOut);
  const totalBalance = userTokenStore((state) => state.totalBalance);
  const router = useRouter();
  const pathname = usePathname();
  const { showLoginDialog } = useDialog();

  const rightMenuClick = () => {
    if (userInfo) {
      setRightOpen(true);
      return;
    }
    showLoginDialog();
  }

  const signOut = () => {
    logoutAndClearEnv();
    disconnect();
    logout();
    if (pathname.startsWith("/c/")) {
      router.push("/");
    }
  }

  const items: MenuItem[] = [
    {
      label: "Sign out",
      icon: 'pi pi-sign-out',
      className: 'hover:bg-[#0000000A] focus:bg-white mx-0.75 rounded',
      command: () => {
        signOut();
      },
      template: (item, options) => {
        return (
          <span className={`w-full flex flex-row items-center ml-3 py-1`} onClick={(e) => options.onClick(e)} ><i className={`${item.icon} mr-2.5`} />{item.label}</span>
        );
      },
    },
  ];

  const getBalance = () => {
    if (!tokens) {
      return "0"
    }
    const lamports = tokens.find((res) => res.address === SOL_ADDRESS)?.amountStr;
    if (!lamports || Number(lamports) === 0) {
      return "0";
    }
    const amount = new BigNumber(lamports);
    const divisor = new BigNumber(LAMPORTS_PER_SOL);
    const result = amount
      .div(divisor)
      .decimalPlaces(5, BigNumber.ROUND_HALF_UP);

    return `${result}`;
  }

  const getTotalBalance = () => {
    if (totalBalance === 0) {
      return '0.00';
    }
    return `${new BigNumber(totalBalance).decimalPlaces(2, BigNumber.ROUND_HALF_UP)}`;
  }

  useEffect(() => {
    if (kickOutValue) {
      signOut();
      setKickOut(false);
    }
  }, [kickOutValue])

  const handleCopy = (e: MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    if (userInfo) {
      copyText(userInfo.address);
    }
  }

  return (
    <div className="flex items-center gap-2 h-full px-3 border border-[#E4E4E7] rounded-xl cursor-pointer hover:bg-[#0000000A] select-none"
      onClick={() => rightMenuClick()}>
      {
        userInfo ? (
          <>
            <Image className="w-5 h-5 md:flex" width={20} height={20} src={userWalletImg} alt="" />
            <div className="flex flex-col">
              <div className="flex flex-row items-center gap-1">
                {/*<Image className="w-3 h-3 rounded-full" width={12} height={12} src={userWalletSolImg} alt="" />*/}
                <span className="text-[14px] leading-4 text-black">${getTotalBalance()}</span>
              </div>
              {/*<div className="flex-row items-center gap-0.5 hidden md:flex">
                <span className="text-[#66666680] text-xs">{splitWalletAddress(userInfo?.address)}</span>
                <Image className="w-4" src={userWalletCopyImg} width={16} height={16} onClick={handleCopy} alt="" />
              </div>*/}
            </div>
            <Image className="w-4 h-4 -ml-1" width={16} height={16} src={downImg} alt="" /></>
        ) : (<span className="text-primary2 text-14px whitespace-nowrap">Sign In</span>)
      }

      <Menu className="text-[14px] mt-1.5 w-[140px] p-1" ref={menuRef} model={items} popup popupAlignment="left" />
    </div>
  );
};

export default WalletStatus;