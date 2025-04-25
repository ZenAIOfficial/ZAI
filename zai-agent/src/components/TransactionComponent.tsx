'use client'
import React, {useEffect, useRef, useState} from "react";
import {transactionSwap, TrendInfo} from "@/apis/trading";
import {useTranslation} from "react-i18next";
import ChooseRatio from "@/components/ChooseRatio";
import Slippage from "@/components/Slippage";
import {userTokenStore} from "@/store/userTokenStore";
import {useCyptoRateStore} from "@/store/cryptoRateStore";
import {toDecimalsDiv, toDecimalsMul} from "@/utils/decimalUtil";
import {
    formatNumber,
    formatPrice,
    formatPriceAndNumber,
    getAmountUnit,
    getNetwork,
    sleep,
    translateAmount
} from "@/utils/utils";
import {checkTransStatus} from "@/apis/transaction";
import {showToast} from "@/store/toastStore";
import swapLoadingImg from "@/assets/ic_swap_loading_white.svg";
import Image from "next/image";
import {BNB_ADDRESS, slippage_buy_key, slippage_sell_key, SOL_ADDRESS} from "@/utils/constants";
import BigNumber from "bignumber.js";
import {useDialog} from "@/hooks/useDialog";
import {isLogin, useUserStore} from "@/store/userStore";

interface Props {
    data: TrendInfo;
}

const TransactionComponent: React.FC<Props> = ({data}) => {
    const { t } = useTranslation();
    const [segmentList] = useState([t("trading.buy"), t("trading.sell"),]);
    const [selectPos, setSelectPos] = React.useState(0);
    const swapType = useRef(0);
    const [inputContent, setInputContent] = useState('');
    const [slippage, setSlippage] = useState("10%");
    const solPrice = useCyptoRateStore((state) => state.sol);
    const bnbPrice = useCyptoRateStore((state) => state.bnb);
    const userTokens = userTokenStore((state) => state.tokens);
    const [showSwapLoading, setShowSwapLoading] = useState(false);
    const [transTipsType, setTransTipsType] = useState(0);
    const userInfo = useUserStore((state) => state.userInfo);
    const { showLoginDialog } = useDialog();

    const handleChange = (v: string) => {
        if (showSwapLoading) return;
        if (!isLogin()) {
            showLoginDialog();
            return;
        }
        let val = v;
        // if (/^\d*\.?\d*$/.test(val)) {
        //     setInputContent(val);
        // }

        val = val.replace(/[^\d.]/g, "");
        val = val.replace(/^(\d*\.\d*)\./, "$1");
        if (val.startsWith("00")) {
            val = "0";
        } else if (val.startsWith("0") && val.length > 1 && val[1] !== ".") {
            val = val.slice(1);
        }
        if (val.startsWith(".")) {
            val = "0" + val;
        }
        setInputContent(val);
        checkBalance(val);
        if (val === "") {
            setTransTipsType(0);
        }
    };

    useEffect(() => {
        setSlippageData();
    }, []);

    useEffect(() => {
        setInputContent("");
    }, [userInfo]);

    const changeSegment = (index: number) => {
        if (selectPos === index || showSwapLoading) return;
        swapType.current = index;
        setSelectPos(index);
        setInputContent("");
        setTransTipsType(0);
    };

    const onSlippageChange = (data: string) => {
        updateSlippage(data);
    }

    const setSlippageData = () => {
        const localSlippage = selectPos === 0 ? window.localStorage.getItem(slippage_buy_key) : window.localStorage.getItem(slippage_sell_key);
        if (localSlippage) {
            updateSlippage(localSlippage);
        }
    }

    const updateSlippage = (data: string) => {
        if (Number(data) > 0) {
            setSlippage(`${data}%`);
        } else {
            setSlippage(t("trading.auto"));
        }
    }

    const getTokenAmount = () => {
        if (userTokens && userTokens.length > 0) {
            const token = userTokens.filter(it => it.address === data.address);
            if (token.length > 0) {
                const t = token[0];
                return translateAmount(Number(formatPrice(toDecimalsDiv(t.amountStr, Math.pow(10, t.decimals)), 2)));
            }
        }
        return 0;
    }

    const getTokenRate = () => {
        const token = toDecimalsDiv(1, data.price);
        const p = toDecimalsMul(getUnitPrice(), token, 2);
        return translateAmount(Number(p));
    }

    const getBtnText = () => {
        if (selectPos === 0) {
            if (Number(inputContent) > 0) {
                const price = toDecimalsMul(getUnitPrice(), inputContent, 3);
                return `${t("trading.buy")} ${formatPriceAndNumber(inputContent, 3)} ${getAmountUnit(data.network)} ($${formatPriceAndNumber(price, 2)})`;
            }
            return `${t("trading.buy")}`
        } else {
            if (Number(inputContent) > 0) {
                const tokenPrice = toDecimalsMul(inputContent, data.price);
                const price = formatPrice(toDecimalsDiv(tokenPrice, getUnitPrice()), 3);
                return `${t("trading.sell")} ${formatNumber(price)} ${getAmountUnit(data.network)} ($${formatPrice(tokenPrice, 3)})`;
            }
            return `${t("trading.sell")}`
        }
    }

    const getUnitPrice = () => {
        switch (data.network) {
            case "bsc":
                return bnbPrice;
            case "solana":
                return solPrice;
            default:
                return solPrice;
        }
    }

    let intervalSwapLoading: NodeJS.Timeout;
    const startSwapLoadingCountdown = () => {
        const time = Date.now() + 60000;
        setTransTipsType(60);
        intervalSwapLoading = setInterval(() => {
            const countdown = Math.ceil((time - Date.now()) / 1000);
            setTransTipsType(countdown);
            if (Number(countdown) <= 0) {
                stopSwapLoadingCountdown();
                setShowSwapLoading(false);
                toTransferFailure(t("trading.transaction_timeout"));
                setTransTipsType(-3);
            }
        }, 1000);
    }

    const stopSwapLoadingCountdown = () => {
        if (intervalSwapLoading) {
            clearInterval(intervalSwapLoading);
        }
    }

    const requestSwap = () => {
        if (!inputContent || inputContent.length === 0 || showSwapLoading || !checkEnableBtn()) return;
        if (!isLogin()) {
            showLoginDialog();
            return;
        }
        setShowSwapLoading(true);
        startSwapLoadingCountdown();
        const slip = slippage.replace("%", "");
        let relSlippage = "-1";
        if (Number(slip) > 0) {
            relSlippage = toDecimalsMul(slip, 100);
        }
        transactionSwap({mintAddress: data.address, realAmount: inputContent, swapType: swapType.current, slippageBps: relSlippage}).then((res) => {
            if (res && res.transaction) {
                checkTransactionStatus(res.transaction);
            }
        }).catch(() => {
            stopSwapLoadingCountdown();
            setTransTipsType(-2);
            setShowSwapLoading(false);
        })
    }

    const checkTransactionStatus = async (transaction: string) => {
        try {
            await checkTransferStatus(transaction);
        } catch (e) {
            console.log(e)
            setShowSwapLoading(false);
        }
    }

    const checkTransferStatus = async (transaction: string) => {
        const status = await checkStatus(transaction);
        setShowSwapLoading(false);
        stopSwapLoadingCountdown();
        if (status === "success") {
            toTransferSuccess();
        } else {
            toTransferFailure(t("trading.transaction_failed"));
        }
    }

    const toTransferSuccess = () => {
        showToast("success", selectPos === 0 ? t("trading.buy_success") : t("trading.sell_success"), 4000);
        setTransTipsType(-1);
        setInputContent("")
    }

    const toTransferFailure = (msg: string) => {
        showToast("error", msg, 4000);
        setTransTipsType(-2);
    }

    const checkStatus = async (transaction: string) => {
        let num = 0;
        while (num < 30) {
            try {
                await sleep(2000);
                const res = await checkTransStatus({
                    transaction,
                });
                console.log(res);
                if (res.confirmationStatus === "confirmed") {
                    return "success";
                }
            } catch (e) {
                console.log(e);
            } finally {
                num++;
            }
        }

        return "failure";
    };
    
    const checkEnableBtn = () => {
        const balance = selectPos === 0 ? getAccountBalance() : getTokenBalance();
        const input = BigNumber(inputContent);
        // <=
        return input.isLessThanOrEqualTo(balance);
    }

    const checkBalance = (input: string) => {
        if (input === "") return;
        const balance = selectPos === 0 ? getAccountBalance() : getTokenBalance();
        // >
        if (BigNumber(input).isGreaterThan(balance)) {
            setTransTipsType(-4)
        } else {
            setTransTipsType(0)
        }
    }

    const getTokenBalance = () => {
        return getBalance(data.address);
    }

    const getSolBalance = () => {
        return getBalance(SOL_ADDRESS);
    }

    const getBnbBalance = () => {
        return getBalance(BNB_ADDRESS);
    }

    const getAccountBalance = () => {
        if (getNetwork(data.network) === "BSC") {
            return getBnbBalance();
        }
        return getSolBalance();
    }

    const getBalance = (address: string) => {
        const filterList = userTokens.filter((it) => it.address === address);
        if (filterList.length > 0) {
            const solInfo = filterList[0];
            // >
            if (BigNumber(solInfo.amountStr).isGreaterThan(0)) {
                return toDecimalsDiv(solInfo.amountStr, Math.pow(10, solInfo.decimals));
            }
        }
        return "0";
    }

    const getStatusText = () => {
        let text = "";
        switch (transTipsType) {
            case 0:
                text = "";
                break;
            case -1:
                text = t("trading.buy_success");
                break;
            case -2:
                text = t("trading.transaction_failed");
                break;
            case -3:
                text = t("trading.transaction_timeout");
                break;
            case -4:
                text = t("trading.transaction_exceeds_balance");
                break;
            default:
                text = t("trading.transaction_execution", {time: transTipsType});
        }
        return text;
    }

    const onRatioChange = (ratio: number) => {
        if (showSwapLoading) return;
        if (!isLogin()) {
            showLoginDialog();
            return;
        }
        if (selectPos === 0) {
            checkBalance(ratio.toString())
            setInputContent(ratio.toString());
        } else {
            const balance = getTokenBalance();
            // >
            if (BigNumber(balance).isGreaterThan(0)) {
                if (ratio === 1) {
                    setInputContent(balance.toString());
                } else {
                    setInputContent(toDecimalsMul(balance, ratio))
                }
            }
        }
    }

    return (
        <div className="flex flex-col w-full">
            <div className="flex w-full bg-[#F7F3FF] rounded-[14px] p-0.75">
                {
                    segmentList.map((item, index) => (
                        <div className={`flex flex-1 h-9.5 rounded-xl items-center justify-center cursor-pointer
                        ${selectPos === index ? `text-white ${selectPos === 0 ? "bg-[#29CA53]" : "bg-[#FF4B92]"}` : "text-black"}`}
                             key={index}
                             onClick={() => changeSegment(index)}>
                            {
                                index === 0 ?
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M10.3534 17.677L15.881 9.19356C16.098 8.86024 16.01 8.40976 15.684 8.1877C15.5677 8.10833 15.431 8.066 15.2912 8.06606H10.9451V2.72534C10.9451 2.32484 10.6278 2 10.2364 2C9.99931 2 9.77814 2.12117 9.64658 2.32295L4.11903 10.8064C3.902 11.1398 3.99001 11.59 4.31579 11.8123C4.43216 11.8917 4.56893 11.9342 4.70883 11.9342H9.05494V17.2747C9.05494 17.6752 9.37219 18 9.76362 18C10.0007 18 10.2221 17.8788 10.3534 17.677Z"
                                            fill={selectPos === index ? "white" : "black"}/>
                                    </svg> :
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                              d="M10.5888 3.05829C10.0704 3.06472 9.57506 3.27398 9.20828 3.64147L3.58178 9.28606C2.80207 10.0682 2.80676 11.3405 3.59183 12.128L7.8566 16.4063C8.64167 17.1938 9.90991 17.1985 10.6896 16.4167L16.3235 10.765C16.6855 10.4014 16.8937 9.91152 16.9045 9.39766L17 5.02531L16.9993 4.98262C16.9876 4.44872 16.7664 3.94103 16.3837 3.56982C16.001 3.19862 15.4877 2.9939 14.9554 3.00014L10.5888 3.05829ZM11.2753 6.49416C11.3622 6.28943 11.4887 6.10403 11.6475 5.94872C11.9635 5.64257 12.3867 5.47351 12.8259 5.47734C13.2652 5.48117 13.6854 5.65792 13.996 5.96952C14.3067 6.28113 14.4828 6.70265 14.4867 7.14331C14.4905 7.58397 14.3216 8.0085 14.0164 8.32548C13.8616 8.48477 13.6768 8.61164 13.4727 8.69873C13.2685 8.78581 13.0492 8.83137 12.8274 8.83276C12.6057 8.83415 12.3858 8.79136 12.1806 8.70685C11.9754 8.62234 11.789 8.4978 11.6322 8.34046C11.4754 8.18312 11.3513 7.99611 11.2671 7.79027C11.1828 7.58444 11.1402 7.36388 11.1416 7.14139C11.1431 6.91889 11.1885 6.6989 11.2753 6.49416Z"
                                              fill={selectPos === index ? "white" : "black"}/>
                                    </svg>
                            }
                            <span className={`px-2.5 font-semibold text-base}`}>{item}</span>
                        </div>

                    ))
                }
            </div>
            <div className="flex justify-between mt-6.25">
                <span className="text-black font-semibold text-sm">{selectPos === 0 ? data.network === "bsc" ? t("trading.amount_bnb") : t("trading.amount_sol") : t("trading.amount")}</span>
                {
                    <span className={`text-sm ${selectPos === 0 ? "text-[#666666]" : "text-black"}`}>{selectPos === 0 ? `1 ${getAmountUnit(data.network)} ≈ ${getTokenRate()} ${data.symbol}` : `${t("trading.bal")}${getTokenAmount()} ${data.symbol}`}</span>
                }
            </div>
            <div className="flex max-w-full items-center gap-2 border border-[#E4E4E7] rounded-[14px] h-12 mt-3.5 px-3">
                <input className={"flex-1 w-full min-w-0 text-[22px] text-black transfer"} placeholder="0.0"
                       type="text" value={inputContent} onChange={e => handleChange(e.target.value)}/>
                <span
                    className={"text-[#666666] text-base font-semibold flex-shrink-0 whitespace-nowrap"}>{selectPos === 0 ? getAmountUnit(data.network) : data.symbol}</span>
            </div>
            <div className="flex w-full mt-3.5">
                {
                    <ChooseRatio type={selectPos} callback={onRatioChange}/>
                }
            </div>

            <span className={`mt-4 h-[17px] ${transTipsType < -1 ? "text-[#FF4B92]" : "text-black"}`}>
                {
                    inputContent ? getStatusText() : ""
                }
            </span>

            <div className={`flex items-center justify-center rounded-3xl py-3 text-base mt-3 relative
                ${Number(inputContent) > 0 && transTipsType !== -4 ? (selectPos === 0 ? "bg-[#29CA53] text-white cursor-pointer" : "bg-[#FF4B92] text-white cursor-pointer") : "bg-[#E4E4E7]"} text-[#00000099]`} onClick={() => requestSwap()}>
                <span>{getBtnText()}</span>
                {
                    showSwapLoading && (
                        <Image className="w-5 h-5 absolute right-5 circle-progress" src={swapLoadingImg} width={20} height={20} alt=""/>
                    )
                }
            </div>

            <Slippage type={selectPos} callback={onSlippageChange} disable={showSwapLoading} />
        </div>
    )
}

export default TransactionComponent;