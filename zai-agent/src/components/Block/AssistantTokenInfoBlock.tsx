import tokenInfoSvg from "@/assets/ic_token_info.svg";
import React from "react";
import Image from "next/image"
import TokenImage from "@/components/TokenImage";

interface TokenInfo {
    name: string;
    img: string;
    des: string;
    text: string;
    network: string;
}

interface Props {
    token: TokenInfo;
}

const AssistantTokenInfoBlock: React.FC<Props> = ({token}) => {

  return (
      <div className="bg-white border border-b-normal rounded-2xl pl-4 pr-10 py-3 w-fit shadow-border-message">
        <div className="flex flex-row">
          <Image className="w-5 h-5" width={20} src={tokenInfoSvg} height={20} alt={""}/>
          <span className="ml-2 text-primary2 text-4 font-medium">Token Info</span>
        </div>
        <div className="flex row mt-2.5">
          {/*<Image className="mr-3 rounded-full w-8 h-8" width={32} height={32} src={token.img} alt={""}/>*/}
          <div className="mr-3">
             <TokenImage className="w-8 h-8 rounded-full shrink-1" image={token.img} width={32} height={32} name={token.name} chain={token.network} />
          </div>
          <div className="flex flex-col ml-2 text-3.5 font-medium">
            <span className="text-primary2 leading-none">{token.name}</span>
            <span className="text-color_text_middle leading-none mt-1">{token.des}</span>
            <div className="text-color_text_middle mt-2 leading-normal">
                {token.text}
            </div>
          </div>
        </div>
      </div>
  );
};

export default AssistantTokenInfoBlock;
