import React, { useEffect, useState } from "react";
import searchTokenImg from "@/assets/ic_search_token.svg";
import Image from "next/image"
import SearchContent from "./SearchContent";
import { requestSearchList, TrendInfo } from "@/apis/trading";
import {getRealChain} from "@/utils/utils";

type Props = object

const SearchStatus: React.FC<Props> = () => {
  const [searchText, setSearchText] = useState("");
  const [openSearchContent, setOpenSearchContent] = useState(false);
  const [inputBlur, setInputBlur] = useState(false);
  const [searchContentTap, setSearchContentTap] = useState(false);
  const [trendInfos, setTrendInfos] = useState<TrendInfo[]>([]);

  useEffect(() =>{
    // if (searchText.length > 0) {
    //   setOpenSearchContent(true);
    // } else {
    //   setOpenSearchContent(false);
    // }
  }, [searchText]);

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
    if (event.target.value.length === 0) {
      setTrendInfos([]);
      return;
    }
    const params: Record<string, unknown> = {addressOrSymbol: event.target.value};
    const localChain = getRealChain();
    if (localChain) {
      params["network"] = localChain;
    }
    const res = await requestSearchList(params);
    setTrendInfos(res);
  };

  const handleInputFocus = () => {
    setOpenSearchContent(true);
    setInputBlur(false);
    setSearchContentTap(false);
  };

  const handleInputBlur = () => {
    console.log("handleInputBlur", inputBlur, searchContentTap);
    setInputBlur(true);
    if (searchContentTap) {
      setOpenSearchContent(false);
    }
  }

  const handleSearchContentTap = () => {
    console.log("handleSearchContentTap", inputBlur, searchContentTap);
    setSearchContentTap(true);
  }

  const handleSearchContentSuccess = () => {
    setSearchText("");
    setTrendInfos([]);
  }

  return (
    <div className="flex items-center w-full justify-center">
      <div className="w-85 h-10 border border-b-normal rounded-full flex items-center">
        <Image className="w-5.5 h-5.5 mx-3" width={22} height={22} src={searchTokenImg} alt="" />
        <input className="flex-1 w-full text-sm text-black search" placeholder="Search token / contract" value={searchText} onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur} />
      </div>
      {
        openSearchContent ? <SearchContent isOpen={openSearchContent} handleSearchContentTap={handleSearchContentTap} trendInfos={trendInfos} setOpen={setOpenSearchContent} onSuccess={handleSearchContentSuccess}></SearchContent> :<></>
      }

    </div>
  );
};

export default SearchStatus;