/* eslint-disable @typescript-eslint/no-explicit-any */
import tokenInfoSvg from "@/assets/ic_token_info.svg";
import BigNumber from "bignumber.js";
import React from "react";
import Image from "next/image"
import ChartComponent from "../ChartComponent";

interface TokenInfo {
    name: string;
    img: string;
    des: string;
    text: string;
    list: any[];
    infoDetail: any;
}

interface Props {
    token: TokenInfo;
}

const AssistantTokenDetailBlock: React.FC<Props> = ({token}) => {

  const showInfoDetailMindShare = (value: any) => {
    if (value) {
      return BigNumber(value).toFixed(2) + '%'
    }
    return '--';
  }
  return (
      <div className="bg-white border border-b-normal rounded-2xl p-3 w-full shadow-border-message">
        <div className="flex flex-row">
          <Image className="w-5 h-5" width={20} src={tokenInfoSvg} alt={""}/>
          <span className="ml-2 text-primary2 text-4 font-medium">Token Info</span>
        </div>
        <div className="flex row mt-2.5 overflow-hidden">
          <Image className="mr-3 rounded-24px w-8 h-8" width={32} src={token.img} alt={""}/>
          <div className="flex flex-col text-3.5 flex-1 overflow-auto">
            <span className="text-primary2 text-sm leading-none font-medium">{token.name}</span>
            <span className="text-color_text_middle text-sm leading-none mt-1 font-medium">{token.des}</span>
            <div className="text-primary2 mt-2 text-sm leading-normal whitespace-pre flex-1">
              💸 Token Mindshare: {showInfoDetailMindShare(token.infoDetail.mindshare)}<br/>
              🥰 Followers: {token.infoDetail.followersCount ? token.infoDetail.followersCount : '--'}<br/>
              🧐 Smart followers: {token.infoDetail.smartFollowersCount ? token.infoDetail.smartFollowersCount : '--'}<br/>
              {`      (Source: `}<a className="text-[#7AB7FF] underline" href="https://www.cookie.fun/" target="_blank">Cookie Fun</a>)
            </div>
            <div className="text-primary2 mt-4 text-sm leading-normal whitespace-pre flex-1">
                {token.text}
            </div>
          </div>
        </div>
        <div className="ml-12 mt-4 mr-5 mb-2">
          <ChartComponent list={token.list}/>
        </div>
      </div>
  );
};

export default AssistantTokenDetailBlock;
