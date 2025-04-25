import React, {useEffect, useState} from "react";
import DialogTemplate from "@/components/Dialog/DialogTemplate";
import SearchStatus from "@/components/SearchStatus";
import closeImg from "@/assets/ic_dialog_close_light.svg";
import Image from "next/image";
import {useDialog} from "@/hooks/useDialog";
import searchTokenImg from "@/assets/ic_search_token.svg";
import SearchContent from "@/components/SearchContent";
import {requestSearchList, TrendInfo} from "@/apis/trading";
import {getRealChain} from "@/utils/utils";

interface Props {

}

const SearchDialog: React.FC<Props> = () => {

    const { showLoginDialog, hideDialog } = useDialog();

    const [searchText, setSearchText] = useState("");
    const [openSearchContent, setOpenSearchContent] = useState(false);
    const [inputBlur, setInputBlur] = useState(false);
    const [searchContentTap, setSearchContentTap] = useState(false);
    const [trendInfos, setTrendInfos] = useState<TrendInfo[]>([]);

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
        setInputBlur(true);
        if (searchContentTap) {
            setOpenSearchContent(false);
        }
    }

    const handleSearchContentTap = () => {
        setSearchContentTap(true);
    }

    const handleSearchContentSuccess = () => {
        setSearchText("");
        setTrendInfos([]);
    }

    return (
        <DialogTemplate className="bg-background rounded-t-[24px] rounded-b-none w-screen h-[90vh] flex flex-col items-center px-5">
            <div className="flex w-full justify-between mt-5">
                <span className="text-[20px] font-medium text-[#13122A]">Search</span>
                <Image className="w-6 h-6" src={closeImg} alt={""} onClick={() => hideDialog()}/>
            </div>

            <div className="w-full h-10 shrink border border-b-normal rounded-full flex items-center mt-4">
                <Image className="w-5.5 h-5.5 mx-3" width={22} height={22} src={searchTokenImg} alt="" />
                <input className="flex-1 w-full text-sm text-black search" placeholder="Search token / contract" value={searchText} onChange={handleInputChange}
                       onFocus={handleInputFocus}
                       onBlur={handleInputBlur} />

            </div>

            <div className={"w-full"}>
                <SearchContent isOpen={openSearchContent} handleSearchContentTap={handleSearchContentTap} trendInfos={trendInfos} setOpen={setOpenSearchContent} onSuccess={handleSearchContentSuccess} />
            </div>
        </DialogTemplate>
    )
}

export default SearchDialog;