import React from "react";
import DialogTemplate from "@/components/Dialog/DialogTemplate";
import {useTranslation} from "react-i18next";
import closeImg from "@/assets/ic_dialog_close_light.svg";
import addressDialogImg from "@/assets/ic_address_dialog.webp";
import copyImg from "@/assets/ic_copy_black.svg";
import Image from "next/image";
import {useDialog} from "@/hooks/useDialog";
import {useUserStore} from "@/store/userStore";
import {copyText, getNetwork} from "@/utils/utils";

interface Props {
}

const AddressDialog: React.FC<Props> = () => {

    const { t } = useTranslation();
    const { hideDialog } = useDialog();
    const userInfo = useUserStore((state) => state.userInfo);

    return (
        <DialogTemplate className="bg-background rounded-[24px] md:w-[360px] flex flex-col items-center px-4">
            <div className="flex items-center justify-center w-full relative mt-6">
                <span className="text-black text-[20px] font-semibold">{t("home.your_account")}</span>
                <Image className="w-6 h-6 absolute right-0 cursor-pointer" src={closeImg} alt={""} onClick={() => hideDialog()}/>
            </div>
            <Image className="mt-5" width={324} height={95} src={addressDialogImg} alt="" />

            <div className="w-full mt-3 pb-7.5">
                {
                    userInfo?.userWalletAddress.map((item) => (
                        <div className="flex flex-col w-full mt-5" key={item.walletAddress}>
                            <span className="text-base text-black font-semibold ml-3.5">{getNetwork(item.network)} Address</span>
                            <div className="flex w-full break-all mt-1.5 bg-[#F4F4F5] rounded-[14px] py-2.5 pl-3.5">
                                <span className="text-[14px] text-[#666666]">{item.walletAddress}</span>
                                <Image className="ml-10 mr-5 cursor-pointer" width={20} height={20} src={copyImg} alt="" onClick={() => copyText(item.walletAddress)} />
                            </div>
                        </div>
                    ))
                }
            </div>
        </DialogTemplate>
    )
}

export default AddressDialog;