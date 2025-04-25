import React from "react";
import Image from "next/image";
import giftImg from "@/assets/ic_reward_gift.png";
import referralImg from "@/assets/ic_reward_referral.svg";
import shareImg from "@/assets/ic_share_white.svg";
import {useTranslation} from "react-i18next";
import {isLogin, useUserStore} from "@/store/userStore";
import {formatPrice} from "@/utils/utils";
import {useDialog} from "@/hooks/useDialog";
import {userTokenStore} from "@/store/userTokenStore";
import backImg from "@/assets/ic_back.svg";
import {useMedia} from "@/hooks/useMedia";
import {useRouter} from "next/navigation";

export default function Rewards() {
  const { t } = useTranslation();
    const userInfo = useUserStore((state) => state.userInfo);
    const userTokens = userTokenStore((state) => state);
    const { showRewardShareDialog, showLoginDialog } = useDialog();
    const {isPhone} = useMedia();
    const router = useRouter();

    const showShareDialog = () => {
        if (!isLogin()) {
            showLoginDialog();
            return;
        }
        showRewardShareDialog();
    }

  return (
      <div className="flex flex-col items-center md:justify-center w-full h-full md:overflow-hidden relative">
          {
              isPhone && (
                  <div className="flex w-full justify-between mx-2 mt-1.5">
                      <Image className="w-6 h-6 ml-3" src={backImg} width={24} height={24} onClick={() => router.push("/trading")}
                             alt=""/>
                  </div>
              )
          }
        <div className="w-full px-4 md:px-0 md:w-112 flex flex-col items-center mt-5 md:mt-[-80px]">
            <Image className="w-85 h-48.5 md:w-100 md:h-57" src={giftImg} width={400} height={228} alt=""/>
            <p className="text-black text-center text-xl md:text-2xl font-semibold mt-[-20px] md:mt-6">{t("rewards.make_money")}</p>
            <div className="w-full md:w-102 flex mt-5 items-center justify-between">
                <div className="flex flex-col items-center">
                    <span className="text-[#666666] text-sm md:text-base">{t("rewards.lifetime_rewards")}</span>
                    <span className="text-[28px] font-semibold mt-1.5">${formatPrice(userTokens?.commissionTotalUsdc, 2)}</span>
                </div>
                <div className="w-[1px] h-10 bg-black" />
                <div className="flex flex-col items-center">
                    <span className="text-[#666666] text-sm md:text-base">{t("rewards.friends_referred")}</span>
                    <span className="text-[28px] font-semibold mt-1.5">{userTokens?.invitedFriends}</span>
                </div>
            </div>
            <div className="w-full border-t border-[#E4E4E7] mt-6" />
            <div className="flex w-full mt-6 md:pl-10">
                <Image className="w-5.5 h-6" src={referralImg} width={22} height={24} alt=""/>
                <span className="text-base text-black font-medium ml-1.5">{t("rewards.your_referral_code")}</span>
            </div>
            <div className={`w-full md:w-[calc(100%-46px)] border border-[#0000001A] rounded-xl text-base text-black font-medium
                mt-3 px-4 py-2 whitespace-nowrap overflow-hidden text-ellipsis ${userInfo?.shareUrl ? "" : "hidden"}`}>{userInfo?.shareUrl}</div>

            <div className="w-full md:w-[calc(100%-120px)] flex justify-center bg-[#18181B] py-2.5 gap-2.5 rounded-[21px] mt-6 cursor-pointer" onClick={() => showShareDialog()}>
                <Image className="w-5 h-5" src={shareImg} width={20} height={20} alt=""/>
                <span className="text-white text-sm font-semibold">{t("rewards.invite_friends")}</span>
            </div>

            <div className="mt-5 text-[#666666] text-xs md:text-base">
                <span>{t("rewards.invite_friends_earn1")}</span>
                <span className="font-semibold">50%</span>
                <span>{t("rewards.invite_friends_earn2")}</span>
            </div>
        </div>
        <div className="w-full md:w-103.5 h-103.5 absolute mb-[-350px] bottom-0 blur-[500px] bg-[#FF86E1] z-[-1] hidden md:flex translate-3d" />
      </div>

  );
}
