import shareIconImg from "@/assets/ic_share_dialog.svg";
import shareImg from "@/assets/ic_reward_share_img.webp";
import closeImg from "@/assets/ic_reward_share_close.svg";
import xImg from "@/assets/ic_logo_x.webp";
import copyImg from "@/assets/ic_share_copy.svg";
import DialogTemplate from "./DialogTemplate";
import Image from "next/image"
import {useDialog} from "@/hooks/useDialog";
import {useTranslation} from "react-i18next";
import React from "react";
import {copyText} from "@/utils/utils";
import {useUserStore} from "@/store/userStore";

const RewardShareDialog = () => {
    const {  hideDialog } = useDialog();
    const { t } = useTranslation();
    const userInfo = useUserStore((state) => state.userInfo);

    const copy = () => {
        if (userInfo && userInfo.shareUrl) {
            copyText(userInfo?.shareUrl);
        }
    }

    const shareToX = () => {
        if (userInfo && userInfo.shareUrl) {
            const shareText = `The Omnichain Agent for all, powered by mainstream social media. Earn 50% Trading Fee Rewards by inviting others!`;
            window.open(`https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(userInfo.shareUrl)}`);
        }
    }

    return (
        <DialogTemplate className={"px-5 bg-background rounded-2xl pt-4.5 pb-6 w-[calc(100vw-40px)] md:w-auto flex flex-col relative items-center"}>
            {/*<div className="w-[calc(100%-100px)] md:w-90 h-90 absolute mt-[-340px] top-0 blur-[30px] md:blur-[40px] bg-[#FF86E1] translate-3d"/>*/}
            <div className="w-full flex items-center">
                <Image className="w-5 h-5" src={shareIconImg} alt={""}/>
                <span className="text-base text-black font-[600] ml-3">{t("rewards.share")}</span>
                <Image className="w-6 h-6 ml-auto cursor-pointer" src={closeImg} alt={""} onClick={() => hideDialog()}/>
            </div>
            <Image className="w-120 h-auto mt-4" src={shareImg} alt={""}/>
            <div className="flex items-center justify-center mt-4 gap-4">
                <div className="flex items-center justify-center border border-[#E4E4E7] rounded-[20px] py-2 w-35 cursor-pointer" onClick={() => shareToX()}>
                    <Image className="w-6 h-6" src={xImg} alt={""}/>
                    <span className="text-[14px] text-black font-[600] ml-1.5">Twitter</span>
                </div>
                <div className="flex items-center justify-center border border-[#E4E4E7] rounded-[20px] py-2 w-35 cursor-pointer" onClick={() => copy()}>
                    <Image className="w-6 h-6" src={copyImg} alt={""}/>
                    <span className="text-[14px] text-black font-[600] ml-1.5">{t("rewards.copy_link")}</span>
                </div>
            </div>
        </DialogTemplate>
    );
}

export default RewardShareDialog;