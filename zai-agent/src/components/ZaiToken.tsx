import React from "react";
import girlIcon from "@/assets/ic_zai_girl.webp";
import copyImg from "@/assets/ic_zai_copy.svg";
import linkImg from "@/assets/ic_zai_link.svg";

import Image from "next/image"
import { copyText } from "@/utils/utils";
import { buyUrl2, walletAddress } from "@/utils/constants";

type Props = object

const ZaiToken: React.FC<Props> = () => {

  const handleOnCopy = () => {
    copyText(walletAddress)
  }

  const handleOnLink = () => {
        window.open(buyUrl2);
  }
  return (
    <div className="flex items-center h-full pl-1.5 pr-1.5 rounded-xl border border-b-normal select-none">
      <Image className="w-7 h-7 rounded-full" width={28} height={28} src={girlIcon} alt="" />
      <span className="ml-2 text-[13px] leading-4 font-medium">CA:</span>
      <span className="mr-4 text-[13px] leading-4 font-medium text-color_text_middle">8vwqx...M2yWb13e</span>
      <Image className="w-7 h-7 mr-1 cursor-pointer" width={28} height={28} src={copyImg} alt="copy" onClick={handleOnCopy} />
      <Image className="w-7 h-7 cursor-pointer" width={28} height={28} src={linkImg} alt="link" onClick={handleOnLink} />
    </div>
  );
};

export default ZaiToken;