import React from "react";
import smallBSCImg from "@/assets/ic_small_bsc.svg";
import smallSOLImg from "@/assets/ic_small_sol.svg";
import imageErrorImg from "@/assets/ic_image_error.svg";
import Image from "next/image"
import ChartComponent from "../ChartComponent";

interface TokenInfo {
    name: string;
    img: string;
    des: string;
    priceStr: string;
    network?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    list: any[];
}

interface Props {
    token: TokenInfo;
}

const AssistantTokenOHLCBlock: React.FC<Props> = ({token}) => {

  const smallImg = (network: string) => {
    if (network === "bsc") {
      return smallBSCImg;
    }
    return smallSOLImg;
  }

  const tokenImage = () => {
    if (token.img) {
      return token.img;
    }
    return imageErrorImg;
  };
  return (
      <div className="bg-white border border-b-normal rounded-2xl w-full shadow-border-message">
        <div className="flex flex-row items-center token_detail_html_header px-4 rounded-t-2xl  h-13">
          <div className="mr-3 relative w-9 h-9">
            <Image className="rounded-full max-w-9 w-9 h-9" width={36} height={36} src={tokenImage()} alt={""}/>
            {
              token.network && <Image className="absolute bottom-0 right-0 rounded-full w-3.5 h-3.5" width={14} height={14} src={smallImg(token.network)} alt={""}/>
            }
          </div>
          <div className="flex flex-col w-full">
            <div className="flex flex-row w-full items-baseline">
              <div className="text-black leading-none font-medium">{token.name}</div>
              <div className="text-color_text_middle text-sm leading-none ml-2">{token.des}</div>
            </div><div className="flex flex-row mt-1 items-baseline">
              <span className="text-black leading-none font-semibold">${token.priceStr}</span>
            </div>
          </div>
        </div>

        <div className="ml-4 mt-6 mr-4 mb-2">
          <ChartComponent list={token.list}/>
        </div>
      </div>
  );
};

export default AssistantTokenOHLCBlock;
