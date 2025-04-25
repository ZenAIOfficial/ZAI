// import dialogCloseImg from "@/assets/ic_dialog_close.svg";
import addFundsTipsImg from "@/assets/ic_add_funds_tips.svg";
import solanaLogoImg from "@/assets/ic_solana_logo.svg";
import copyImg from "@/assets/ic_copy_black.svg";
import bscImg from "@/assets/ic_bsc_logo.svg";
import { copyText } from "@/utils/utils";
import { useUserStore } from "@/store/userStore";
import { QRCodeSVG } from 'qrcode.react';
import DialogTemplate from "./DialogTemplate";
import TitleDialog from "./TitleDialog";
import { useTranslation } from "react-i18next";
import { useDialog } from "@/hooks/useDialog";
import Image from "next/image";
import {useRef, useState} from "react";

type Props = object
const DepositCodeDialog: React.FC<Props> = ({ }) => {
    const { t } = useTranslation();
    const { showAddFundsDialog, hideDialog } = useDialog();
    const userInfo = useUserStore((state) => state.userInfo);
    const categoryListRef = useRef([
        {id: 1, name: "BSC", icon: bscImg},
        {id: 2, name: "Solana", icon: solanaLogoImg},
    ]);
    const [selectCategoryId, setSelectCategoryId] = useState(1);

    const handleBack = () => {
        hideDialog();
        showAddFundsDialog();
    }

    const handleCopy = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        if (userInfo) {
            copyText(getAddress(0));
        }
    }

    const changeCategory = (item: { id: number; name?: string; icon?: string; }) => {
        setSelectCategoryId(item.id);
    }

    const getAddress = (type: number) => {
        let address = "";
        switch (selectCategoryId) {
            case 1:
                address = `${userInfo?.userWalletAddress[0].walletAddress}`;
                break;
            case 2:
                if (type === 1) {
                    address = `solana:${userInfo?.userWalletAddress[1].walletAddress}`
                } else {
                    address = `${userInfo?.userWalletAddress[1].walletAddress}`;
                }
                break;
        }
        return address;
    }

    return (
        <DialogTemplate className="bg-background rounded-[24px] pt-6 w-[calc(100vw-60px)] md:w-[360px] flex flex-col items-center px-5 pb-4">
            <TitleDialog title={t("home.deposit")} onBack={handleBack} onCancel={hideDialog} />

            <div className="flex w-full border border-[#0000000F] rounded-[10px] p-1.25 mt-5 gap-1.5">
                {
                    categoryListRef.current.map((item) => (
                        <div className={`flex flex-1  rounded-[8px] py-1.5 cursor-pointer 
                            ${selectCategoryId === item.id ? 'bg-[#18181B] text-white' : 'bg-[#F4F4F5] text-black'}`}
                             key={item.id} onClick={() => changeCategory(item)}>
                            <Image className="w-5 h-5 ml-2.5" width={20} height={20} src={item.icon} alt="" />
                            <span className="text-[14px] font-semibold ml-2">{item.name}</span>
                        </div>
                    ))
                }
            </div>

            <div className="mt-3 text-color_text_middle text-xs text-center">{t("trading.deposit_code_hint", {chain: selectCategoryId === 1 ? "BSC" : "Solana"})}</div>

            <div className="mt-2.5 border-2 border-black rounded-[10px] p-2.5 relative">
                <QRCodeSVG value={getAddress(1)} size={160} level="H" />

                <Image className="absolute inset-0 m-auto w-10 h-10" width={40} height={40}  src={selectCategoryId === 1 ? bscImg : solanaLogoImg} alt="" />
            </div>

            <div className="mt-4 flex flex-row items-center px-4 rounded-xl w-full border border-[#0000000F]">
                <div className="flex flex-col flex-1 py-2.5 mr-4 overflow-hidden">
                    <div className="text-color_text_middle text-sm">Your wallet</div>
                    <div className="text-black text-sm font-medium break-words">{getAddress(0)}</div>
                </div>

                <div className="w-[34px] h-[34px] flex justify-center items-center bg-[#F4F4F5] rounded-lg cursor-pointer" onClick={handleCopy}>
                    <Image className="w-4 h-4" width={16} height={16} src={copyImg} alt="" />
                </div>
            </div>

            <div className="mt-2.5 bg-[#EA2EFE1A] flex flex-row items-center px-3.5 rounded-lg h-8 w-full">
                <Image className="w-4 h-4 mr-2" width={16} height={16} src={addFundsTipsImg} alt="" />
                <div className="text-primary1 text-sm">Make sure to send funds on {selectCategoryId === 1 ? "BSC" : "Solana"}.</div>
            </div>
        </DialogTemplate>
    );
};

export default DepositCodeDialog;