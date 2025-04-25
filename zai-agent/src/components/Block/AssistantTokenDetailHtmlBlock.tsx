/* eslint-disable @typescript-eslint/no-explicit-any */
import BigNumber from "bignumber.js";
import React from "react";
import IcLogoCookie from "@/assets/ic_logo_cookie.webp";
import whaleAnalysisImg from "@/assets/ic_detail_whale_analysis.png";
import imageErrorImg from "@/assets/ic_image_error.svg";

import Image from "next/image"
import ChartComponent from "../ChartComponent";
import { useMessage } from "../Context/MessageProvider";
import TokenDefaultImage from "@/components/TokenDefaultImage";
import TokenImage from "@/components/TokenImage";

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

const AssistantTokenDetailHtmlBlock: React.FC<Props> = ({token}) => {

  const message = useMessage();

  const prices = [
    {
      key: '1m',
      value: token.infoDetail.priceChange1m + '%',
      status: token.infoDetail.priceChange1m >= 0 ? "up" : "down",
    },
    {
      key: '5m',
      value: token.infoDetail.priceChange5m + '%',
      status: token.infoDetail.priceChange5m >= 0 ? "up" : "down",
    },
    {
      key: '1h',
      value: token.infoDetail.priceChange1h + '%',
      status: token.infoDetail.priceChange1h >= 0 ? "up" : "down",
    },
  ];
  const vols = [
    {
      key: '30m',
      value: token.infoDetail.volume30mUsdStr,
    },
    {
      key: '1h',
      value: token.infoDetail.volume1hUsdStr,
    },
    {
      key: '8h',
      value: token.infoDetail.volume8hUsdStr,
    },
    {
      key: '24h',
      value: token.infoDetail.volume24hUsdStr,
    },
  ];

  const showInfoDetailMindShare = (value: BigNumber.Value) => {
    if (value) {
      return BigNumber(value).toFixed(2) + '%'
    }
    return '--';
  }

  const showTimeAgo = (value: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - value;

    const days = Math.floor(diff / (24 * 3600));
    const hours = Math.floor((diff % (24 * 3600)) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);

    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0 || days > 0) result += `${hours}h `;
    if (minutes > 0 || hours > 0 || days > 0) result += `${minutes}m ago`;

    return result.trim();
  };

  const showDateTime = (value: number) => {
    const date = new Date(value * 1000);

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }
  
  const showIntelligentAnalysis = () => {
    const text = `Find whales, token address is ${token.list[0].address}`;
    message.callApp(text);
  };

  const tokenImage = () => {
    if (token.img) {
      return token.img;
    }
    return imageErrorImg;
  };

  return (
      <div className="bg-white border border-b-normal rounded-2xl w-full shadow-border-message">
        <div className="flex flex-row token_detail_html_header px-4 pt-4 pb-1.5 rounded-t-2xl">
          {/*<Image className="mr-3 rounded-full w-8 h-8 self-center" width={32} height={32} src={tokenImage()} alt={""}/>*/}
          <div className="mr-3 self-center">
            <TokenImage className="w-8 h-8 rounded-full shrink-1" image={token.img} width={32} height={32} markClassName="w-3 h-3" name={token.name} chain={token.infoDetail.network} />
          </div>
          <div className="flex flex-col w-full">
            <div className="flex flex-row w-full items-baseline">
              <div className="text-black leading-none font-medium">{token.name}</div>
              <div className="text-color_text_middle text-sm leading-none ml-2">{token.des}</div>
              <div className="text-black text-sm leading-none ml-auto hidden sm:flex">Top 10 holdings: <span className="font-bold ml-1">{token.infoDetail.top10holdingStr}</span></div>
            </div><div className="flex flex-row mt-1 items-baseline">
              <span className="text-black text-[32px] leading-none font-bold">${token.infoDetail.priceStr}</span>
              <span className={`${token.infoDetail.priceChange24h >= 0 ? 'text-[#29CA53]' : 'text-[#F93A37]'} text-sm leading-none ml-3 font-medium`}>{token.infoDetail.priceChange24h}%</span>
            </div>

            <div className="text-black text-sm leading-none mt-2 flex sm:hidden">Top 10 holdings: <span className="font-bold ml-1">{token.infoDetail.top10holdingStr}</span></div>
            
          </div>
        </div>

        {
          token.infoDetail.whalesProbability && (
            <div className="flex flex-col md:flex-row md:items-center text-white mx-4 mt-3 md:h-12 whale_bg rounded-xl py-3 md:py-0">
              <div className="ml-2 flex justify-center items-center"><Image className="w-8 h-8" width={32} height={32} alt={""} src={whaleAnalysisImg}/></div>
              <div className="ml-2 md:ml-4.5 flex items-center">
                <span className="font-medium">Whale Pump Odds</span>
                <span className="ml-2 text-[22px] font-bold">{token.infoDetail.whalesProbability}</span>
              </div>

              <div className="flex ml-2 md:ml-auto md:mr-2">
                <span className="flex-wrap text-[12px] bg-white font-semibold text-black px-2 py-1 rounded-full cursor-pointer select-none" onClick={showIntelligentAnalysis}>
                  {`Intelligent analysis >`}
                </span>
              </div>
            </div>
          )
        }

        <div className="flex flex-row items-center mx-4 mt-3 bg-[#F7F3FF] overflow-hidden rounded-xl py-2">
          <Image className="m-1 w-6 h-6" src={IcLogoCookie} width={24} height={24} alt={""} />
          <div className="flex flex-col md:flex-row gap-2 md:gap-0">
            <div className="ml-2 text-color_text_middle text-sm leading-none mt-1 md:font-medium mr-auto">Token Mindshare: <span className="font-bold text-black">{showInfoDetailMindShare(token.infoDetail.mindshare)}</span></div>
            <div className="ml-2 text-color_text_middle text-sm leading-none mt-1 md:font-medium mr-auto">Followers: <span className="font-bold text-black">{showInfoDetailMindShare(token.infoDetail.followersCount)}</span></div>
            <div className="ml-2 text-color_text_middle text-sm leading-none mt-1 md:font-medium mr-auto">Smart followers: <span className="font-bold text-black">{showInfoDetailMindShare(token.infoDetail.smartFollowersCount)}</span></div>
          </div>

        </div>

        <div className="flex flex-row mx-4 mt-3 overflow-hidden">
          <div className="text-color_text_middle text-sm leading-none mr-auto">
            <div>Market Cap</div>
            <div className="text-black font-bold mt-0.5">{token.infoDetail.mktCapStr}</div>
          </div>
          <div className="text-color_text_middle text-sm leading-none mr-auto">
            <div>Holders</div>
            <div className="text-black font-bold mt-0.5">{token.infoDetail.holdersStr}</div>
          </div>
          <div className="text-color_text_middle text-sm leading-none mr-auto hidden sm:flex flex-col">
            <div>ATH</div>
            <div className="text-black font-bold mt-0.5 flex flex-row items-baseline">{token.infoDetail.allTimeHighStr} <span className="text-[#B6B6B6] ml-0.5 font-normal text-[12px] ">({showTimeAgo(token.infoDetail.allTimeHighTime)})</span></div>
          </div>
          <div className="text-color_text_middle text-sm leading-none hidden sm:flex flex-col">
            <div>Age</div>
            <div className="text-black font-bold mt-0.5 flex flex-row items-baseline">{showTimeAgo(token.infoDetail.deployTime)} <span className="text-[#B6B6B6] ml-0.5 text-[12px] font-normal hidden sm:flex">({showDateTime(token.infoDetail.deployTime)})</span></div>
          </div>
        </div>
        <div className="flex flex-row mx-4 mt-3 overflow-hidden sm:hidden">
          <div className="text-color_text_middle text-sm leading-none mr-auto">
            <div>ATH</div>
            <div className="text-black font-bold mt-0.5">{token.infoDetail.allTimeHighStr} <span className="text-[#B6B6B6] font-normal text-[12px] ">({showTimeAgo(token.infoDetail.allTimeHighTime)})</span></div>
          </div>
          <div className="text-color_text_middle text-sm leading-none mr-auto ">
            <div>Age</div>
            <div className="text-black font-bold mt-0.5">{showTimeAgo(token.infoDetail.deployTime)} <span className="text-[#B6B6B6] font-normal hidden sm:flex">({showDateTime(token.infoDetail.deployTime)})</span></div>
          </div>
        </div>

        <div className="px-4 w-full mt-3">
          <div className="h-[0.5px] w-full bg-[#E4E4E7]"></div>
        </div>
        

        <div className="font-bold mx-4 mt-3">Price</div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mx-4 mt-2 overflow-hidden">
          {
            prices.map((res, index) => {
              return (
                <div key={`price_${index}`} className="flex flex-col h-[42px] justify-center text-sm items-center bg-[#F7F3FF] rounded-xl">
                  <span className="text-color_text_middle leading-none font-medium">{res.key}</span>
                  <span className={`font-bold leading-none mt-0.5 ${res.status === "down" ? 'text-[#F93A37] ' : 'text-[#29CA53]'}`}>{res.value}</span>
                </div>
              )
            })
          }
        </div>

        <div className="font-bold mx-4 mt-3 ">Vol</div>
        
        <div className="grid grid-cols-4 h-[42px] mx-4 mt-2 overflow-hidden border border-[#E4E4E7] rounded-xl">
          {
            vols.map((res, index) => {
              return (
                <div key={`vol_${index}`} className="flex flex-col h-full justify-center text-sm items-center border-r border-[#E4E4E7] last:border-none">
                  <span className="text-color_text_middle leading-none font-medium">{res.key}</span>
                  <span className="text-black font-bold leading-none">{res.value}</span>
                </div>
              )
            })
          }
        </div>

        <div className="ml-4 mt-6 mr-4 mb-2">
          <ChartComponent list={token.list}/>
        </div>
      </div>
  );
};

export default AssistantTokenDetailHtmlBlock;
