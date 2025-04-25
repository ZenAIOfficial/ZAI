import React, {useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import Image from "next/image";
import collectImg from "@/assets/ic_collect.svg";
import unCollectImg from "@/assets/ic_uncollect.svg";
import starImg from "@/assets/ic_star.svg";
import copyImg from "@/assets/ic_copy_gary.svg";
import clockImg from "@/assets/ic_clock.svg";
import noFavoritesImg from "@/assets/ic_no_favorites.svg";
import loadingImg from "@/assets/ic_loading_purple.svg";
import sprcialTokenImg from "@/assets/ic_special_token.svg";
import whalePurpleImg from "@/assets/ic_whale_purple.svg";
import {addWatch, removeWatch, requestTrendList, TrendInfo} from "@/apis/trading";
import {
    copyText,
    formatDateTime, formatNumber,
    formatPrice, getRealChain,
    splitWalletAddress,
    translateAmount,
    translateNumber
} from "@/utils/utils";
import {useInView} from "react-intersection-observer";
import {useRouter} from "next/navigation";
import TokenLinkComponent from "@/components/TokenLinkComponent";
import TokenDefaultImage from "@/components/TokenDefaultImage";
import {isLogin, useUserStore} from "@/store/userStore";
import {useDialog} from "@/hooks/useDialog";
import {useMedia} from "@/hooks/useMedia";
import TokenImage from "@/components/TokenImage";
import {ZAI_ADDRESS} from "@/utils/constants";
import SpecialTokenImage from "@/components/SpecialTokenImage";
import {Button} from "primereact/button";
import {Tooltip} from "primereact/tooltip";
import IcNewChat from "@/assets/ic_new_chat.svg";

export default function Trading() {
    interface Category {
        name: string;
        id: number;
        list: TrendInfo[];
        page: number;
        loadEnd: boolean;
    }

    const { t } = useTranslation();
    let page = 1;
    const pageSize = 20;
    const [loadEnd, setLoadEnd] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const { showLoginDialog } = useDialog();

    const router = useRouter();
    const { ref, inView } = useInView({ threshold: 0 });
    const userInfo = useUserStore((state) => state.userInfo);
    const chainInfo = useUserStore((state) => state.chain);
    const { isPhone } = useMedia();
    const categoryContainerRef = useRef(null);
    const loadingListRef = useRef(false);

    const [selectCategoryPos, setSelectCategoryPos] = useState(0);
    const selectCategoryPosRef = useRef(0);
    const selectCategoryId = useRef(2);
    const [categoryList, setCategoryList] = useState<Category[]>([
        { name: t("trading.category_hot"), id: 2, list: [], page: 1, loadEnd: false },
        { name: t("trading.category_new"), id: 5, list: [], page: 1, loadEnd: false },
        { name: t("trading.category_vol"), id: 6, list: [], page: 1, loadEnd: false },
        { name: t("trading.category_market_cap"), id: 7, list: [], page: 1, loadEnd: false },
        { name: t("trading.category_watchlist"), id: 1, list: [], page: 1, loadEnd: false },
    ]);

    const categoryChange = (index: number) => {
        if (selectCategoryPosRef.current === index) return;
        setSelectCategoryPos(index);
        categoryScrollToCenter(index);
        selectCategoryPosRef.current = index;
        const currentCategory = categoryList[index];
        selectCategoryId.current = currentCategory.id;
        setLoadEnd(currentCategory.loadEnd);
        const currentList = currentCategory.list;
        if (currentList.length === 0) {
            getTradingList();
        }
    };

    const categoryScrollToCenter = (index: number) => {
        if (!categoryContainerRef.current) return;
        const container = categoryContainerRef.current as HTMLElement;
        const wrapper = container.children[0] as HTMLElement;
        const node = wrapper?.children[index] as HTMLElement;
        if (!node) return;
        const distance = node.offsetLeft - (container.offsetWidth - node.offsetWidth) / 2;
        container.scrollTo({ left: distance, behavior: "smooth" });
    };

    const changeCollect = (index: number, event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (!isLogin()) {
            showLoginDialog();
            return;
        }
        const trendInfo = categoryList[selectCategoryPosRef.current].list[index];
        if (trendInfo.isWatch) {
            removeWatch({address: trendInfo.address}).then(() => {
                trendInfo.isWatch = false;
                refreshTokenCollectStatus(trendInfo, false);
            })
        } else {
            addWatch({address: trendInfo.address}).then(() => {
                trendInfo.isWatch = true;
                refreshTokenCollectStatus(trendInfo, true);
            })
        }
    };

    const refreshTokenCollectStatus = (trendInfo: TrendInfo, isWatch: boolean) => {
        for (const category of categoryList) {
            for (let i = 0;i < category.list.length;i++) {
                const item = category.list[i];
                if (item.address === trendInfo.address) {
                    item.isWatch = isWatch;
                    if (category.id === 1 && !isWatch) {
                        category.list.splice(i, 1);
                    }
                }
            }
        }
        setCategoryList([...categoryList]);
        if (isWatch) {
            refreshWatchList();
        }
    }

    const toDetail = (index: number) => {
        const address = categoryList[selectCategoryPosRef.current].list[index].address;
        router.push("/trading/" + address);
    };

    const toDetailWhale = (index: number, event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const address = categoryList[selectCategoryPosRef.current].list[index].address;
        router.push(`/trading/${address}?open=whale`);
    };

    const copyAddress = (address: string, event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        copyText(address);
    };

    const getTradingList = () => {
        // if (loadEnd) return;
        loadingListRef.current = true;
        setShowLoading(true);
        const currentCategory = categoryList[selectCategoryPosRef.current];
        const params: Record<string, unknown> = { tabType: selectCategoryId.current, pageNum: currentCategory.page, pageSize: pageSize };
        const localChain = getRealChain();
        if (localChain) {
            params["network"] = localChain;
        }
        requestTrendList(params).then((res) => {
            const paramsPage = res.params.pageNum;
            const paramsId = res.params.tabType;
            if (paramsId === selectCategoryId.current) {
                const category = categoryList.filter((it) => it.id === selectCategoryId.current)[0];
                if (paramsPage === 1) {
                    category.page = 1;
                    category.list = [];
                }
                if (res.result.list.length > 0) {
                    category.page++;
                }
                page = category.page;
                setShowLoading(false);

                setLoadEnd(page > res.result.pages);
                category.loadEnd = page > res.result.pages;
                category.page = page;
                res.result.list.forEach((item) => {
                    category.list.push(item);
                });
            } else {
                const list = categoryList.filter((it) => it.id === paramsId)[0];
                res.result.list.forEach((item) => {
                    list.list.push(item);
                });
            }
        }).finally(() => {
            loadingListRef.current = false;
        });
    };

    const refreshWatchList = () => {
        const params: Record<string, unknown> = { tabType: 1, pageNum: 1, pageSize: pageSize };
        const localChain = getRealChain();
        if (localChain) {
            params["network"] = localChain;
        }
        requestTrendList(params).then((res) => {
            const category = categoryList.filter((it) => it.id === 1)[0];
            category.page = 1;
            category.list = [];
            if (res.result.list.length > 0) {
                category.page++;
            }
            page = category.page;
            setShowLoading(false);

            setLoadEnd(page > res.result.pages);
            category.loadEnd = page > res.result.pages;
            category.page = page;
            res.result.list.forEach((item) => {
                category.list.push(item);
            });
            setCategoryList([...categoryList]);
        }).finally(() => {

        });
    }

    useEffect(() => {
        // console.log("inView value:", inView)
        if (inView && !loadingListRef.current) {
            getTradingList();
        }
    }, [inView]);

    const getPrice = (price: number) => {
        return formatNumber(formatPrice(price, 3))
    }

    useEffect(() => {
        for (const category of categoryList) {
            category.list = [];
            category.page = 1;
            category.loadEnd = false;
        }
        page = 1;
        setLoadEnd(false);
        setSelectCategoryPos(0);
        selectCategoryPosRef.current = 0;
        selectCategoryId.current = 2;
        getTradingList();
    }, [userInfo, chainInfo]);

    const isZAI = (address: string) => {
        return address === ZAI_ADDRESS;
    }

    return (
        <div className="flex justify-center w-full">
            <div className="flex flex-col w-full md:max-w-7xl md:mt-4 mx-4">
                {/*<span className="font-semibold text-lg mt-1.5 ml-2 md:hidden">Trending</span>*/}
                <div ref={categoryContainerRef} className="flex w-full min-w-0 overflow-x-scroll">
                    <div className="flex  whitespace-nowrap mt-2 md:mt-0">
                        {
                            categoryList.map((item, index) => (
                                <div className={`flex px-3 md:px-3.5 py-[5.5px] rounded-2xl text-xs md:text-sm cursor-pointer w-fit shrink items-center
                                        ${selectCategoryPos === index ? "text-white bg-[#18181B] font-semibold" : "text-[#00000099]"} 
                                        ${index === 0 ? "ml-2 md:ml-6" : ""} ${index === categoryList.length - 1 ? "mr-2 md:mr-6" : ""}`}
                                     key={item.id}
                                     onClick={() => categoryChange(index)}>
                                    <div className={`w-[14px] h-[14px] mr-1 shrink-0 flex items-center justify-center ${item.id === 1 ? "" : "hidden"}`}>
                                        <Image src={starImg} width={14} height={14} alt="" />
                                    </div>
                                    <span>{item.name}</span>
                                </div>
                            ))
                        }
                    </div>
                </div>


                <div className="flex flex-col mt-4">
                    {
                        isPhone ?
                            <>
                                <div className="flex border-b border-[#0000000F] text-xs text-[#666666] font-medium justify-between items-center mx-2 pb-1 relative whitespace-pre-wrap">
                                    <span>{t("trading.token")} / MC</span>
                                    {
                                        selectCategoryId.current === 5 && (
                                            <span className="absolute left-[50%]">{t("trading.created")}</span>
                                        )
                                    }

                                    <div className="flex items-end whitespace-pre-wrap">
                                        <span>{t("trading.price")}</span>
                                        <span> / {t("trading.chg")}</span>
                                    </div>
                                </div>
                                <div className="h-[calc(100dvh-127px)] md:h-[calc(100vh-150px)] overflow-auto">
                                    {
                                        categoryList[selectCategoryPos].list.map((item, index) => (
                                            <div className={`flex mx-2   items-center justify-between md:hover:bg-[#F7F3FF] cursor-pointer border-[#0000000F] relative ${index !== 0 ? "border-t" : ""} ${isZAI(item.address) ? "gradient-box" : ""}`}
                                                 key={item.address} onClick={() => toDetail(index)}>
                                                <div className={`flex w-full items-center px-1.5 py-[10px] z-1 ${isZAI(item.address) ? "gradient-inner" : ""}`}>
                                                    {
                                                        isZAI(item.address) && (
                                                            <Image className="w-10 h-17 absolute right-1" src={sprcialTokenImg} width={40} height={68} alt="" />
                                                        )
                                                    }
                                                    <div className="flex w-full items-center">
                                                        {/*<TokenDefaultImage className="w-9.5 h-9.5 rounded-[25px] shrink-1" image={item.image} width={50} height={50} name={item.symbol} />*/}
                                                        <TokenImage className="w-9.5 h-9.5 rounded-[25px] shrink-1" image={item.image} width={50} height={50} name={item.name} chain={item.network} />
                                                        <div className="flex-col ml-2">
                                                            <span className="text-black text-base font-medium">{item.symbol}</span>
                                                            <p className="text-[#666666] text-[14px]">${translateAmount(Number(formatPrice(item.mktCap, 2)))}</p>
                                                        </div>
                                                    </div>

                                                    {
                                                        selectCategoryId.current === 5 && (
                                                            <div className="flex items-center absolute left-[50%]">
                                                                <Image className="w-4 h-4" src={clockImg} width={16} height={16} alt=""/>
                                                                <span className="ml-0.5 text-[#666666] text-xs">{formatDateTime(item.deployTime)}</span>
                                                            </div>
                                                        )
                                                    }

                                                    <div className="flex flex-col items-end">
                                                        <span className="text-base font-semibold">${getPrice(item.price)}</span>
                                                        <span className={`text-[14px] font-semibold ${item.price24hChange > 0 ? "text-[#29CA53]" : "text-[#FF4B92]"}`}>{item.price24hChange > 0 ? "+" : "-"}{ translateNumber(Number(formatPrice(Math.abs(item.price24hChange), 2))) }%</span>
                                                    </div>
                                                </div>

                                            </div>
                                        ))
                                    }

                                    {
                                        (selectCategoryPos === categoryList.length - 1 && categoryList[selectCategoryPos].list.length === 0 && !showLoading) ?
                                            <div className="flex flex-col w-full h-full justify-center items-center whitespace-pre-wrap text-center">
                                                <Image className="w-30 h-20" src={noFavoritesImg} width={120} height={80} alt=""/>
                                                <p className="mt-3">{t("trading.no_favorites")}</p>
                                            </div> : <></>
                                    }

                                    {
                                        (categoryList[selectCategoryPos].list.length === 0 && showLoading) ?
                                            <div className="flex flex-col w-full h-full justify-center items-center">
                                                <Image className={`w-10 h-10 md:w-18 md:h-18 circle-progress`} src={loadingImg} alt=""/>
                                            </div> : <></>
                                    }

                                    {(!loadEnd && categoryList[selectCategoryPos].list.length > 0) ? <div ref={ref} className="text-center pb-3 text-[#888]">
                                        {t("trading.loading")}
                                    </div> : <></>}
                                </div>
                            </>
                            :
                            <>
                                <div className="flex border-t border-b border-[#0000000F] text-[13px] py-2 text-[#666666] font-semibold">
                                    <span className="w-[36.1%] pl-6">{t("trading.token")}</span>
                                    <span className="w-[11.8%]">{t("trading.price")}</span>
                                    <span className="w-[13.2%]">{t("trading.liq")}</span>
                                    <span className="w-[13.6%]">{t("trading.chg")}</span>
                                    <span className="w-[13.3%]">{t("trading.holders")}</span>
                                    <span className="">{t("trading.created")}</span>
                                </div>
                                <div className="h-[calc(100vh-160px)] overflow-auto">
                                    {
                                        categoryList[selectCategoryPos].list.map((item, index) => (
                                            <div className={`flex w-full  hover:bg-[#F7F3FF] cursor-pointer border-[#0000000F] relative ${index !== 0 ? "border-t" : ""} ${isZAI(item.address) ? "gradient-box" : ""}`}
                                                 key={item.address} onClick={() => toDetail(index)}>
                                                <div className={`flex w-full py-[15px] items-center z-1 ${isZAI(item.address) ? "gradient-inner" : ""}`}>
                                                    {
                                                        isZAI(item.address) && (
                                                            <Image className="w-14 h-21.5 absolute right-1" src={sprcialTokenImg} width={56} height={86} alt="" />
                                                        )
                                                    }
                                                    <Image className="w-3.5 h-3.5 ml-3 z-2" src={item.isWatch ? collectImg : unCollectImg} width={14} height={14} alt="" onClick={(event) => changeCollect(index, event)}/>
                                                    <div className="flex w-[33.3%] ml-2.5">

                                                        {
                                                            isZAI(item.address) ?
                                                                <SpecialTokenImage className="w-12.5 h-12.5 rounded-[25px] shrink-1" image={item.image} width={50} height={50} name={item.name} chain={item.network} />
                                                                :
                                                                <TokenImage className="w-12.5 h-12.5 rounded-[25px] shrink-1" image={item.image} width={50} height={50} name={item.name} chain={item.network} />
                                                        }

                                                        <div className="flex-col ml-3">
                                                            <div className="flex items-baseline">
                                                                <span className="text-black text-base font-medium">{item.symbol}</span>
                                                                <span className="text-[#666666] text-xs ml-1.5 align-bottom">${item.name}</span>

                                                                <Button onClick={(event) => toDetailWhale(index, event)} className={`tips ml-2 text-black focus:outline-none cursor-pointer `} tooltip="Whale Analysis" tooltipOptions={{position: 'top'}} unstyled >
                                                                    <Image className="w-3.5 h-3.5" src={whalePurpleImg} width={14} height={14}
                                                                           alt=""/>
                                                                </Button>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <div
                                                                    className="flex items-center border-1 border-solid border-[#E4E4E7] rounded-[6px] px-2 h-[22px]" onClick={(event) => copyAddress(item.address, event)}>
                                                                    <span className="text-xs text-[#666666]">{splitWalletAddress(item.address)}</span>
                                                                    <Image className="w-3 h-3 ml-2" src={copyImg} width={12} height={12}
                                                                           alt=""/>
                                                                </div>
                                                                <TokenLinkComponent data={ item.extensions } />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <span className="w-[11.8%] text-[14px] font-medium">${getPrice(item.price)}</span>

                                                    <div className="w-[13.2%] flex-col">
                                                        <p className="text-black text-[14px] font-medium">{translateAmount(Number(formatPrice(item.liquidity, 2)))}</p>
                                                        <p className="text-[#158FFC] text-[14px]">${translateAmount(Number(formatPrice(item.mktCap, 2)))}</p>
                                                    </div>

                                                    <span className={`w-[13.6%] text-[14px] font-medium ${item.price24hChange > 0 ? "text-[#29CA53]" : "text-[#FF4B92]"}`}>{item.price24hChange > 0 ? "+" : "-"}{ translateNumber(Number(formatPrice(Math.abs(item.price24hChange), 2))) }%</span>

                                                    <span className="w-[13.3%] text-[14px] text-black font-medium">{translateAmount(Number(formatPrice(item.holders, 2)))}</span>

                                                    <div className="flex items-center">
                                                        <Image className="w-4 h-4 ml-1" src={clockImg} width={16} height={16} alt=""/>
                                                        <span className="ml-1.5 text-[#666666] text-[14px]">{formatDateTime(item.deployTime)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }

                                    {
                                        (selectCategoryPos === categoryList.length - 1 && categoryList[selectCategoryPos].list.length === 0 && !showLoading) ?
                                            <div className="flex flex-col w-full h-full justify-center items-center whitespace-pre-wrap text-center">
                                                <Image className="w-30 h-20" src={noFavoritesImg} width={120} height={80} alt=""/>
                                                <p className="mt-3">{t("trading.no_favorites")}</p>
                                            </div> : <></>
                                    }

                                    {
                                        (categoryList[selectCategoryPos].list.length === 0 && showLoading) ?
                                            <div className="flex flex-col w-full h-full justify-center items-center">
                                                <Image className="w-18 h-18 circle-progress" src={loadingImg} width={72} height={72} alt=""/>
                                            </div> : <></>
                                    }

                                    {(!loadEnd && categoryList[selectCategoryPos].list.length > 0) ? <div ref={ref} className="text-center pb-3 text-[#888]">
                                        {t("trading.loading")}
                                    </div> : <></>}
                                </div>
                            </>
                    }


                </div>
            </div>
        </div>

    );
}
