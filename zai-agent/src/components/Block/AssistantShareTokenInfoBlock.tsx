import shareTokenInfoSvg from "@/assets/ic_share_token_info.svg";
import shareCopyIcon from "@/assets/ic_share_copy.svg";
import shareCopyTextIcon from "@/assets/ic_share_copy_text.svg";
import shareDownloadIcon from "@/assets/ic_share_download.svg";
import shareXIcon from "@/assets/ic_share_x.svg";
import shareCopyPhoneIcon from "@/assets/ic_share_copy_phone.svg";
import shareCopyTextPhoneIcon from "@/assets/ic_share_copy_text_phone.svg";
import shareDownloadPhoneIcon from "@/assets/ic_share_download_phone.svg";
import shareXPhoneIcon from "@/assets/ic_share_x_phone.svg";
import React from "react";
import Image from "next/image"
import { copyImage, copyText, downloadImage } from "@/utils/utils";
import { useDialog } from "@/hooks/useDialog";
import {useMedia} from "@/hooks/useMedia";
import {showToast} from "@/store/toastStore";

interface TokenInfo {
    img: string;
    text: string;
    chineseText: string;
    shareFindWhalesUrl: string;
}

interface Props {
    token: TokenInfo;
}

const AssistantShareTokenInfoBlock: React.FC<Props> = ({token}) => {

  const { showSelectLangWithCatchShare } = useDialog();
  const { isPhone } = useMedia();

  const shareX = () => {
    showSelectLangWithCatchShare((lang: string) => {
      const chineseText = token.chineseText ?? token.text;
      const text = (lang === "zh" ? chineseText : token.text) + " " + token.shareFindWhalesUrl;
      const url = `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
      window.open(url);
    });
  };
  const shareCopy = () => {
    copyImage(token.img);
  };
  const shareCopyText = () => {
    const text = token.text + " " + token.shareFindWhalesUrl;
    copyText(text);
  };
  const shareDownload = () => {
      if (isPhone) {
          showToast("error", "Long-press the image and choose 'Save Image' to download!", 4000);
      } else {
          downloadImage(token.img);
      }
  };

  return (
      <div className="bg-white border border-b-normal rounded-2xl pl-4 pr-4 py-3 w-fit shadow-border-message mt-6">
        <div className="flex flex-row">
          <Image className="w-5 h-5" width={20} src={shareTokenInfoSvg} height={20} alt={""}/>
          <span className="ml-2 text-primary2 text-4 font-medium">Share</span>
        </div>
        <Image className="mt-3 w-full h-auto rounded-2xl" sizes="100vw" width={0} height={0}  src={token.img} alt={""}/>

        <div className="flex row mt-4 justify-between items-center ml-auto mr-auto w-full md:max-w-149 md:gap-3">
          <div className="flex-1 text-center md:w-35 md:h-10 gap-1.5 flex flex-col md:flex-row md:justify-center items-center cursor-pointer md:border md:border-b-normal rounded-full hover:bg-b-hover" onClick={shareX}>
              {
                  isPhone ?
                      <Image className="w-9 h-9" width={36} height={36} src={shareXPhoneIcon} alt={""}/> :
                      <Image className="w-6 h-6" width={24} height={24} src={shareXIcon} alt={""}/>
              }
            <span className="text-[12px] md:text-[14px] font-medium">Twitter</span>
          </div>
          <div className="flex-1 text-center md:w-35 md:h-10 gap-1.5 flex flex-col md:flex-row md:justify-center items-center cursor-pointer md:border md:border-b-normal rounded-full hover:bg-b-hover" onClick={shareCopyText}>
              {
                  isPhone ?
                      <Image className="w-9 h-9" width={36} height={36} src={shareCopyTextPhoneIcon} alt={""}/> :
                      <Image className="w-6 h-6" width={24} height={24} src={shareCopyTextIcon} alt={""}/>
              }
            <span className="text-[12px] md:text-[14px] font-medium">Copy Text</span>
          </div>
            {
                !isPhone && (
                    <div className="flex-1 text-center md:w-35 md:h-10 gap-1.5 flex flex-col md:flex-row md:justify-center items-center cursor-pointer md:border md:border-b-normal rounded-full hover:bg-b-hover" onClick={() => shareCopy()}>
                        {
                            isPhone ?
                                <Image className="w-9 h-9" width={36} height={36} src={shareCopyPhoneIcon} alt={""}/> :
                                <Image className="w-6 h-6" width={24} height={24} src={shareCopyIcon} alt={""}/>
                        }
                        <span className="text-[12px] md:text-[14px] font-medium">Copy Image</span>
                    </div>
                )
            }

          <div className="flex-1 text-center md:w-35 md:h-10 gap-1.5 flex flex-col md:flex-row md:justify-center items-center cursor-pointer md:border md:border-b-normal rounded-full hover:bg-b-hover" onClick={() => shareDownload()}>
              {
                  isPhone ?
                      <Image className="w-9 h-9" width={36} height={36} src={shareDownloadPhoneIcon} alt={""}/> :
                      <Image className="w-6 h-6" width={24} height={24} src={shareDownloadIcon} alt={""}/>
              }
            <span className="text-[12px] md:text-[14px] font-medium">Download</span>
          </div>
        </div>
      </div>
  );
};

export default AssistantShareTokenInfoBlock;
