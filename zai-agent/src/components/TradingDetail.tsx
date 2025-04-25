import React, {useEffect, useRef, useState} from "react";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import {
    addWatch,
    ChartData,
    ChartDotInfo, HolderInfo, holderTopTen, removeWatch,
    trendChartData,
    trendDetail,
    trendFourHoursChartData,
    TrendInfo,
    trendLiveChartData, trendOneDayChartData, whaleAnalysis, WhaleInfo
} from "@/apis/trading";
import Image from "next/image";
import loadingImg from "@/assets/ic_loading_purple.svg";
import copyImg from "@/assets/ic_copy_gary.svg";
import backImg from "@/assets/ic_back.svg";
import collectImg from "@/assets/ic_collect.svg";
import unCollectImg from "@/assets/ic_uncollect.svg";
import buyImg from "@/assets/ic_transaction_buy.svg";
import sellImg from "@/assets/ic_transaction_sell.svg";
import whaleAnalysisImg from "@/assets/ic_detail_whale_analysis.png";
import arrowRightImg from "@/assets/ic_arrow_right_black.svg";
import {copyText, formatPrice, splitWalletAddress, translateAmount, translateNumber} from "@/utils/utils";
import TradingChartComponent from "@/components/TradingChartComponent";
import SegmentComponent, {SegmentInfo} from "@/components/SegmentComponent";
import {useTranslation} from "react-i18next";
import TokenDataComponent from "@/components/TokenDataComponent";
import TransactionComponent from "@/components/TransactionComponent";
import {toDecimalsMul} from "@/utils/decimalUtil";
import TokenLinkComponent from "@/components/TokenLinkComponent";
import TokenAboutLinkComponent from "@/components/TokenAboutLinkComponent";
import AssistantTextBlock from "@/components/Block/AssistantTextBlock";
import AssistantShareTokenInfoBlock from "@/components/Block/AssistantShareTokenInfoBlock";
import {useMedia} from "@/hooks/useMedia";
import {isLogin} from "@/store/userStore";
import {useDialog} from "@/hooks/useDialog";
import TokenImage from "@/components/TokenImage";

export default function TradingDetail() {
    const { t } = useTranslation();
    const { address } = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { showLoginDialog, showTransactionDialog } = useDialog();

    const [showLoading, setShowLoading] = useState(true);
    const [trendInfo, setTrendInfo] = useState<TrendInfo>({} as TrendInfo);
    const [chartDotList, setChartDotList] = useState<ChartDotInfo[]>([] as ChartDotInfo[]);
    const chartData = useRef<ChartData>({} as ChartData);
    const trendInfoRef = useRef<TrendInfo>({} as TrendInfo);
    const selectTime = useRef<SegmentInfo>({} as SegmentInfo);
    const [selectCategory, setSelectCategory] = useState<SegmentInfo>({} as SegmentInfo);
    const aboutCategory = useRef([
        t("trading.about"),
        t("trading.holders"),
        t("trading.whale_analysis"),
    ])
    const [selectAboutCategory, setSelectAboutCategory] = useState(0);
    const { isPhone, isWeb } = useMedia();

    const [categoryList] = useState<SegmentInfo[]>([
        {id: 1, name: t("trading.price"), selected: true},
        {id: 2, name: isPhone ? t("trading.category_m_cap") : t("trading.category_market_cap"), selected: false},
    ]);

    const [timeList, setTimeList] = useState<SegmentInfo[]>([]);
    const [tokenPrice, setTokenPrice] = useState("");
    const [showChartLoading, setShowChartLoading] = useState(false);
    const tokenPriceRef = useRef("");
    let isComponentActive = true;
    const trendDetailLoaded = useRef<boolean>(false);
    const trendChartDataLoaded = useRef<boolean>(false);

    const [holderList, setHolderList] = useState<HolderInfo[]>([]);
    const [showHolderLoading, setShowHolderLoading] = useState(false);
    const [whaleList, setWhaleList] = useState<WhaleInfo[]>([]);
    const [showWhaleLoading, setShowWhaleLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const requestTrendDetail = () => {
        trendDetail({address}).then((res) => {
            if (res) {
                if (!isComponentActive) return;
                if (Object.keys(trendInfoRef.current).length === 0) {
                    startIntervalDetailData();
                    // setShowLoading(false);

                    setShowLoading(() => {
                        handleWhale();
                        return false;
                    });
                    // startIntervalChangePrice();
                }
                setTrendInfo(res);
                trendInfoRef.current = res;
                trendDetailLoaded.current = true;
                setTokenPrice(formatPrice(res.price, 6));
                tokenPriceRef.current = formatPrice(res.price, 6);
                if (trendChartDataLoaded.current && Object.keys(chartData.current).length !== 0) {
                    trendChartDataLoaded.current = false;
                    setTimeListData(chartData.current);
                    setTimeout(() => {
                        setChartDotList(chartData.current.oneDay);
                    })

                } else if (Object.keys(chartData.current).length === 0) {
                    setShowChartLoading(true);
                }
            }
        });
    };

    const requestTrendChartData = () => {
        trendChartData({address}).then((res) => {
            if (res) {
                if (Object.keys(chartData.current).length === 0) {
                    startInterval1ChardData();
                    startInterval5ChardData();
                }
                trendChartDataLoaded.current = true;
                chartData.current = res;
                updateChartData();
                if (trendDetailLoaded.current) {
                    trendDetailLoaded.current = false;
                    trendChartDataLoaded.current = false;
                    setTimeListData(res);
                    setShowChartLoading(false);
                    setTimeout(() => {
                        setChartDotList(res.oneDay);
                    })
                }
            }
        })
    };

    const updateChartData = () => {
        setChartMktCap(chartData.current.live);
        setChartMktCap(chartData.current.fourHours);
        setChartMktCap(chartData.current.oneDay);
        setChartMktCap(chartData.current.oneWeek);
        setChartMktCap(chartData.current.oneMonth);
        setChartMktCap(chartData.current.oneYear);
        setChartMktCap(chartData.current.max);
    }

    const setChartMktCap = (list: ChartDotInfo[]) => {
        if (list && list.length > 0) {
            for (const item of list) {
                if (Number(trendInfoRef.current.circulatingSupply) > 0) {
                    item.mktCap = toDecimalsMul(item.closePrice, trendInfoRef.current.circulatingSupply, 2);
                    item.mktOpenPrice = toDecimalsMul(item.openPrice, trendInfoRef.current.circulatingSupply, 2);
                    item.mktClosePrice = toDecimalsMul(item.closePrice, trendInfoRef.current.circulatingSupply, 2);
                    item.mktHighPrice = toDecimalsMul(item.highPrice, trendInfoRef.current.circulatingSupply, 2);
                    item.mktLowPrice = toDecimalsMul(item.lowPrice, trendInfoRef.current.circulatingSupply, 2);
                } else {
                    item.mktCap = toDecimalsMul(item.closePrice, trendInfoRef.current.totalSupply, 2);
                    item.mktOpenPrice = toDecimalsMul(item.openPrice, trendInfoRef.current.totalSupply, 2);
                    item.mktClosePrice = toDecimalsMul(item.closePrice, trendInfoRef.current.totalSupply, 2);
                    item.mktHighPrice = toDecimalsMul(item.highPrice, trendInfoRef.current.totalSupply, 2);
                    item.mktLowPrice = toDecimalsMul(item.lowPrice, trendInfoRef.current.totalSupply, 2);
                }
            }
        }
    }
    
    const setTimeListData = (result: ChartData) => {
        if (timeList.length > 0) return;
        if (result.live.length > 0) {
            timeList.push({id: 1, name: "LIVE", selected: false});
        }
        if (result.fourHours.length > 0) {
            timeList.push({id: 2, name: "4H", selected: false});
        }
        if (result.oneDay.length > 0) {
            timeList.push({id: 3, name: "1D", selected: true});
        }
        if (result.oneWeek.length > 0) {
            timeList.push({id: 4, name: "1W", selected: false});
        }
        if (result.oneMonth.length > 0) {
            timeList.push({id: 5, name: "1M", selected: false});
        }
        if (result.oneYear.length > 0) {
            timeList.push({id: 6, name: "1Y", selected: false});
        }
        if (result.max.length > 0) {
            timeList.push({id: 7, name: "MAX", selected: false});
        }
        setTimeList(timeList);
        selectTime.current = timeList.filter(it => it.selected)[0];
        // selectCategory.current = categoryList[0];
        setSelectCategory(categoryList[0]);
    };

    const onCategoryChange = (item: SegmentInfo) => {
        setSelectCategory(item);
    }

    const onTimeCategoryChange = (item: SegmentInfo) => {
        selectTime.current = item;
        switch (item.id) {
            case 1:
                setChartDotList(chartData.current.live);
                break;
            case 2:
                setChartDotList(chartData.current.fourHours);
                break;
            case 3:
                setChartDotList(chartData.current.oneDay);
                break;
            case 4:
                setChartDotList(chartData.current.oneWeek);
                break;
            case 5:
                setChartDotList(chartData.current.oneMonth);
                break;
            case 6:
                setChartDotList(chartData.current.oneYear);
                break;
            case 7:
                setChartDotList(chartData.current.max);
                break;
        }
    }

    const changeAboutCategory = (index: number) => {
        setSelectAboutCategory(index);
        if (index === 1 && holderList.length === 0) {
            getHolderTopTenList();
        } else if (index === 2 && whaleList.length === 0) {
            requestWhales();
        }
    }

    const getHolderTopTenList = () => {
        setShowHolderLoading(true);
        holderTopTen({tokenAddress: trendInfo.address}).then((res) => {
            setHolderList(res.items)
            setShowHolderLoading(false);
        })
    };

    let oneIntervalId: NodeJS.Timeout;
    let fiveIntervalId: NodeJS.Timeout;
    // let changePriceIntervalId: NodeJS.Timeout;
    let interval5Seconds: NodeJS.Timeout;
    const startInterval1ChardData = () => {
        if (!isComponentActive) return;
        stopOneInterval();
        oneIntervalId = setInterval(() => {
            requestLiveChartData();
            requestFourHoursChartData();
        }, 60000);
    };

    const startInterval5ChardData = () => {
        if (!isComponentActive) return;
        stopFiveInterval();
        fiveIntervalId = setInterval(() => {
            requestOneDayChartData();
        }, 300000);
    };

    const stopOneInterval = () => {
        if (oneIntervalId) {
            clearInterval(oneIntervalId);
        }
    };

    const stopFiveInterval = () => {
        if (fiveIntervalId) {
            clearInterval(fiveIntervalId);
        }
    };

    const requestLiveChartData = () => {
        trendLiveChartData({ address: address }).then((res) => {
            if (!isComponentActive) return;
            if (res && res.length > 0) {
                setChartMktCap(res);
                chartData.current.live = res;
                if (selectTime.current.id === 1) {
                    setChartDotList(res)
                }
            }
        });
    };

    const requestFourHoursChartData = () => {
        trendFourHoursChartData({ address: address }).then((res) => {
            if (!isComponentActive) return;
            if (res && res.length > 0) {
                setChartMktCap(res);
                chartData.current.fourHours = res;
                if (selectTime.current.id === 2) {
                    setChartDotList(res);
                }
            }
        });
    };

    const requestOneDayChartData = () => {
        trendOneDayChartData({ address: address }).then((res) => {
            if (!isComponentActive) return;
            if (res && res.length > 0) {
                setChartMktCap(res);
                chartData.current.oneDay = res;
                if (selectTime.current.id === 3) {
                    setChartDotList(res);
                }
            }
        });
    };

    const requestWhales = () => {
        if (showWhaleLoading) return;
        setShowWhaleLoading(true);
        whaleAnalysis({address: address}).then((res) => {
            if (!isComponentActive) return;
            if (res && res.length > 0) {
                setWhaleList(res);
            }
        }).finally(() => {
            setShowWhaleLoading(false);
        })
    }

    // const startIntervalChangePrice = () => {
    //     if (changePriceIntervalId) return;
    //     stopIntervalChangePrice();
    //     changePriceIntervalId = setInterval(() => {
    //         const price = tokenPriceRef.current;
    //         // console.log("1111111:", price, tokenPriceRef.current)
    //         const r = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
    //         const random = toDecimalsDiv(r, 10000);
    //         let result;
    //         const randomPlusOrMinus = Math.random();
    //         if (randomPlusOrMinus > 0.5) {
    //             result = toDecimalsPlus(toDecimalsMul(price, random), price);
    //         } else {
    //             result = toDecimalsMinus(price, toDecimalsMul(price, random));
    //         }
    //         // console.log("wwwwwwwwwww111:", r, random, result, randomPlusOrMinus, trendInfo.price);
    //         setTokenPrice(formatPrice(result, 6));
    //     }, 1000);
    // };
    //
    // const stopIntervalChangePrice = () => {
    //     if (changePriceIntervalId) {
    //         clearInterval(changePriceIntervalId);
    //     }
    // };

    const startIntervalDetailData = () => {
        if (!isComponentActive) return;
        // stopIntervalDetailData();
        interval5Seconds = setInterval(() => {
            requestTrendDetail();
        }, 5000);
    };

    const stopIntervalDetailData = () => {
        if (interval5Seconds) {
            clearInterval(interval5Seconds);
        }
    };

    const copyAddress = (address: string, event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        copyText(address);
    };

    const changeCollect = () => {
        if (!isLogin()) {
            showLoginDialog();
            return;
        }
        if (trendInfo.isWatch) {
            removeWatch({address: trendInfo.address}).then(() => {
                trendInfo.isWatch = false;
            })
        } else {
            addWatch({address: trendInfo.address}).then(() => {
                trendInfo.isWatch = true;
            })
        }
    };

    const handleWhale = () => {
        const open = searchParams.get("open");
        if (open && open === "whale") {
            scrollToWhale();
        }
    }

    const scrollToWhale = () => {
        changeAboutCategory(2);
        setTimeout(() => {
            // if (scrollRef.current) {
            //     // scrollRef.current.scrollIntoView({ behavior: "smooth" });
            //     scrollRef.current?.scrollTo({
            //         top: scrollRef.current.scrollHeight,
            //         behavior: 'smooth',
            //     });
            // }
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth',
            });

        }, 100)
    }

    useEffect(() => {
        isComponentActive = true;
        requestTrendDetail();
        requestTrendChartData();
        return () => {
            isComponentActive = false;
            stopOneInterval();
            stopFiveInterval();
            // stopIntervalChangePrice();
            stopIntervalDetailData();
        }
    }, []);

    const renderWhale = (item: WhaleInfo) => {
        const token = {
            img: item.image,
            text: item.text,
            chineseText: item.chineseText,
            shareFindWhalesUrl: item.shareFindWhalesUrl,
        }

        return <div className="mb-15 md:mb-2">
            <AssistantShareTokenInfoBlock token={token} />
        </div>
    }

    const renderWhalesProbability = () => {
        return <div className={`w-full flex important-questions-bg text-white rounded-[16px] items-center px-3 py-2.5`}>
            <Image className="w-8 h-8" width={32} height={32} src={whaleAnalysisImg} alt="" />
            <div className="flex flex-col ml-3">
                <span className="text-[14px]">{t("trading.whale_pump_odds")}</span>
                <span className="text-[18px] font-[700]">{trendInfo.whalesProbability ? trendInfo.whalesProbability : "??%"}</span>
            </div>
            <div className="flex items-center bg-white text-black text-[12px] rounded-[16px] font-semibold py-1.5 pl-3 pr-1.5 ml-auto cursor-pointer" onClick={() => scrollToWhale()}>
                <span>{t("trading.intelligent_analysis")}</span>
                <Image className="w-4 h-4" src={arrowRightImg} alt="" />
            </div>
        </div>
    }

    return (
        <div  className="flex justify-center w-full flex-col md:flex-row min-h-[calc(100dvh-56px)] pt-2 md:pt-4">
            {
                isPhone && (
                    <div className="flex items-center justify-between mx-2 mt-2.5">
                        <Image className="w-6 h-6" src={backImg} width={24} height={24} onClick={() => router.push("/trading")}
                               alt=""/>
                        <Image className="w-5 h-5 mr-2" src={trendInfo && trendInfo.isWatch ? collectImg : unCollectImg} width={20} height={20}
                               onClick={() => changeCollect()}
                               alt=""/>
                    </div>
                )
            }

            <div ref={scrollRef} className="flex min-h-full flex-col md:w-full md:max-w-7xl mx-2 md:mx-4 md:h-full ">
                {
                    showLoading ?
                        <div className="flex flex-col w-full h-40 justify-center items-center mt-20">
                            <Image className="w-10 h-10 md:w-18 md:h-18 circle-progress" src={loadingImg}
                                   alt=""/>
                        </div> :

                        <div className="w-full flex flex-col md:flex-row mt-2 mb-17.5 md:mb-0">
                            <div className="w-full md:w-[70.3%]">
                                <div className="flex flex-col md:border md:border-[#0000000F] rounded-2xl">
                                    <div
                                        className="flex bg-linear-to-l rounded-2xl md:rounded-t-2xl md:rounded-b-none from-[#89BCFF66] to-[#FF86E10F] px-3 py-1.5 md:px-6 md:py-4">
                                        <div
                                            className="flex items-center justify-center border-2 border-[#E4E4E7] rounded-[32px] w-16 h-16">
                                            {/*<Image className="w-14 h-14 rounded-[28px]" src={trendInfo.image} width={56}*/}
                                            {/*       height={56} alt=""/>*/}
                                            {/*<TokenDefaultImage className="w-14 h-14 rounded-[28px]" image={trendInfo.image} width={56} height={56} name={trendInfo.symbol} />*/}
                                            <TokenImage className="w-14 h-14 rounded-[28px] shrink-1" image={trendInfo.image} width={56} height={56} name={trendInfo.symbol} chain={trendInfo.network} />
                                        </div>

                                        <div className="flex flex-col">
                                            <div className="ml-2.5">
                                                <span className="text-xl font-medium">{trendInfo.symbol}</span>
                                                <span className="text-sm text-[#666666] ml-1.5">${trendInfo.name}</span>
                                            </div>
                                            <div className="flex ml-2.5 mt-2">
                                                <div className="flex items-center cursor-pointer" onClick={(event) => copyAddress(trendInfo.address, event)}>
                                                    <div
                                                        className="flex items-center border-1 border-solid border-[#E4E4E7] rounded-[6px] px-2 h-[22px]">
                                                        <span
                                                            className="text-xs text-[#666666]">{splitWalletAddress(trendInfo.address)}</span>
                                                        <Image className="w-3 h-3 ml-2" src={copyImg} width={12}
                                                               height={12}
                                                               alt=""/>
                                                    </div>
                                                    <TokenLinkComponent data={ trendInfo.extensions } />
                                                </div>
                                            </div>
                                        </div>

                                        {
                                            isWeb && (
                                                <div className="ml-auto flex gap-6">
                                                    <div className="flex flex-col justify-center">
                                                        <span className="text-[#666666] text-sm">{t("trading.price")}</span>
                                                        <span className="text-black text-base font-semibold mt-0.5">${tokenPrice}</span>
                                                        <span className="text-sm text-[#666666]">
                                                        <span
                                                            className={`font-medium ${trendInfo.price24hChange > 0 ? "text-[#29CA53]" : "text-[#FF4B92]"}`}>
                                                        {trendInfo.price24hChange > 0 ? "+" : "-"}{translateNumber(Number(formatPrice(Math.abs(trendInfo.price24hChange), 2)))}%
                                                        </span>(24h)
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[#666666] text-sm">{t("trading.category_market_cap")}</span>
                                                        <span className="text-black text-base font-semibold mt-0.5">${translateAmount(Number(formatPrice(trendInfo.mktCap, 2)))}</span>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </div>

                                    {
                                        isPhone && (
                                            <div className="flex gap-2 mt-4 border-b border-[#6666661A] pb-3">
                                                <div className="flex flex-1 flex-col justify-center border border-[#0000000F] rounded-lg px-3 pt-1 pb-2">
                                                    <span className="text-[#666666] text-sm">{t("trading.price")}</span>
                                                    <span className="text-black text-base font-semibold mt-0.5">${tokenPrice}</span>
                                                    <span className="text-sm text-[#666666]">
                                                        <span
                                                            className={`font-medium ${trendInfo.price24hChange > 0 ? "text-[#29CA53]" : "text-[#FF4B92]"}`}>
                                                        {trendInfo.price24hChange > 0 ? "+" : "-"}{translateNumber(Number(formatPrice(Math.abs(trendInfo.price24hChange), 2)))}%
                                                        </span>(24h)
                                                        </span>
                                                </div>
                                                <div className="flex flex-1 flex-col border border-[#0000000F] rounded-lg px-3 pt-1 pb-2">
                                                    <span className="text-[#666666] text-sm">{t("trading.category_market_cap")}</span>
                                                    <span className="text-black text-base font-semibold mt-0.5">${translateAmount(Number(formatPrice(trendInfo.mktCap, 2)))}</span>
                                                </div>
                                            </div>
                                        )
                                    }

                                    {
                                        timeList && timeList.length > 0 && (
                                            <div className="flex mt-5.5 mx-0 md:mx-6">
                                                <SegmentComponent list={categoryList} callback={onCategoryChange}/>
                                                <div className="ml-auto">
                                                    <SegmentComponent list={timeList} callback={onTimeCategoryChange}/>
                                                </div>
                                            </div>
                                        )
                                    }

                                    {
                                        !showChartLoading ? <div className=" mt-10 md:mx-6 mb-4 md:mt-15">
                                                <TradingChartComponent list={chartDotList} type={selectTime.current.id} category={selectCategory.id}/>
                                            </div> :
                                            <div
                                                className="flex flex-col w-full h-[445px] justify-center items-center mb-4">
                                                <Image className="w-10 h-10 md:w-18 md:h-18 circle-progress" src={loadingImg}
                                                       alt=""/>
                                            </div>
                                    }

                                </div>

                                {
                                    isPhone && (
                                        <div className="flex flex-col">
                                            <TokenDataComponent data={trendInfo}/>
                                            <div className="mt-5">
                                                {
                                                    renderWhalesProbability()
                                                }
                                            </div>
                                        </div>
                                    )
                                }

                                <div className="mt-5">
                                    <div className="flex border-b border-[#E4E4E7]">
                                        {
                                            aboutCategory.current.map((item, index) => (
                                                <div className={`${index === aboutCategory.current.length - 1 ? "w-45" : "w-20"} pb-2.5 flex justify-center relative text-base cursor-pointer`} key={item} onClick={() => changeAboutCategory(index)}>
                                                    <span className={`${selectAboutCategory === index ? "text-black font-semibold" : "text-[#00000099] font-normal"}`}>{item}</span>

                                                    {
                                                        index === 2 ? <div className="h-3.5 ml-1 flex items-center rounded-[10px] bg-[#F93A37] px-1.5"><span className="text-[10px] font-medium text-white select-none">New</span></div> : <></>
                                                    }

                                                    {
                                                        selectAboutCategory === index && (<div
                                                            className="w-full h-0.75 bg-linear-to-r from-[#FF86E1] to-[#89BCFF] absolute bottom-0"/>)
                                                    }

                                                </div>
                                            ))
                                        }
                                    </div>
                                    {
                                        selectAboutCategory === 0 ?
                                            <div className="max-h-100 overflow-auto pb-18 md:pb-5">
                                                <div className="mt-6 text-[#1F2328] text-sm">
                                                    {
                                                        <div className="mt-6">
                                                            <TokenAboutLinkComponent data={trendInfo.extensions}
                                                                                     twitterName={trendInfo.twitterScreenName}/>
                                                        </div>
                                                    }
                                                    <span>{trendInfo.description}</span>
                                                </div>
                                            </div>
                                            :
                                            selectAboutCategory === 1 ?
                                                <div className="mt-4 pb-18 md:pb-5">
                                                    <span className="text-base ml-4 font-semibold">{t("trading.top_ten_hint")}</span>
                                                    <div className="border border-[#0000000F] rounded-xl mt-3 max-h-100 overflow-auto">
                                                        {
                                                            showHolderLoading ? <div
                                                                    className="flex flex-col w-full h-[325px] items-center mb-4 mt-15">
                                                                    <Image className="w-10 h-10 md:w-18 md:h-18 circle-progress"
                                                                           src={loadingImg} alt=""/>
                                                                </div> :
                                                                <>
                                                                    {
                                                                        holderList.map((item, index) => (
                                                                            <div
                                                                                className={`flex justify-between py-5 mx-4 hover:bg-[#F7F3FF] ${index !== 0 ? "border-t border-[#E4E4E7]" : ""}`}
                                                                                key={index}>
                                                                                <div>
                                                                                    <span
                                                                                        className="text-[#666666] text-sm">#{index + 1}</span>
                                                                                    <span
                                                                                        className="text-black text-sm ml-2 font-medium">{splitWalletAddress(item.owner)}</span>
                                                                                </div>
                                                                                <span
                                                                                    className="text-black text-sm font-semibold">{item.holding}%</span>
                                                                            </div>
                                                                        ))
                                                                    }
                                                                </>
                                                        }
                                                    </div>
                                                </div>
                                                :
                                                <div className="mt-4 mx-4">
                                                    <div className="max-h-114 overflow-auto pb-5">
                                                        {
                                                            showWhaleLoading ?
                                                                <div className="flex flex-col w-full h-[365px] items-center mb-4 mt-15">
                                                                    <Image className="w-10 h-10 md:w-18 md:h-18 circle-progress"
                                                                           src={loadingImg} alt=""/>
                                                                </div>
                                                                :
                                                                <>
                                                                    {
                                                                        whaleList.map((item, index) => (
                                                                            <div key={index}>
                                                                                {
                                                                                    item.action === "text" ?
                                                                                        <AssistantTextBlock key={`block-id-${index}`} text={item.text} loading={false} role='' />
                                                                                        :
                                                                                        renderWhale(item)
                                                                                }
                                                                            </div>
                                                                        ))
                                                                    }
                                                                </>
                                                        }
                                                    </div>
                                                </div>
                                    }

                                </div>
                            </div>

                            {
                                isWeb && (
                                    <div className="flex flex-1 flex-col ml-4 gap-4">
                                        <div className="flex border border-[#0000000F] rounded-2xl pt-4 pb-3 px-6">

                                            <TransactionComponent data={trendInfo}/>
                                        </div>
                                        <TokenDataComponent data={trendInfo}/>

                                        {
                                            renderWhalesProbability()
                                        }
                                    </div>
                                )
                            }
                        </div>


                }

            </div>

            {
                isPhone && Object.keys(trendInfo).length > 0 && (
                    <div className="flex w-full fixed bottom-0 bg-[#FFFFFF33] backdrop-blur-[4px] gap-[9px] p-2">

                        <div className="flex flex-1 bg-[#29CA53] justify-center py-3.5 rounded-[12px]" onClick={() => showTransactionDialog(0, trendInfo)}>
                            <Image width={20} height={20} src={buyImg} alt="" />
                            <span className="text-white font-base font-semibold ml-0.5">{t("trading.buy")}</span>
                        </div>
                        {
                            trendInfo.amount && (
                                <div className="flex flex-1 bg-[#FF4B92] justify-center py-3.5 rounded-[12px]" onClick={() => showTransactionDialog(1, trendInfo)}>
                                    <Image width={20} height={20} src={sellImg} alt="" />
                                    <span className="text-white font-base font-semibold ml-0.5">{t("trading.sell")}</span>
                                </div>
                            )
                        }

                    </div>
                )
            }

        </div>
    )
}