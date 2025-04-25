import DialogTemplate from "@/components/Dialog/DialogTemplate";
import setSlippageImg from "@/assets/ic_set_slippage.svg";
import closeImg from "@/assets/ic_dialog_close_light.svg";
import Image from "next/image";
import React, {useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {transactionSwap, TrendInfo} from "@/apis/trading";
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
import {useCyptoRateStore} from "@/store/cryptoRateStore";
import {userTokenStore} from "@/store/userTokenStore";
import ChooseRatio from "@/components/ChooseRatio";
import TransactionKeyboard from "@/components/TransactionKeyboard";
import swapLoadingImg from "@/assets/ic_swap_loading.svg";
import {isLogin, useUserStore} from "@/store/userStore";
import {showToast} from "@/store/toastStore";
import {checkTransStatus} from "@/apis/transaction";
import {BNB_ADDRESS, slippage_buy_key, slippage_sell_key, SOL_ADDRESS} from "@/utils/constants";
import {useDialog} from "@/hooks/useDialog";
import SlippageDialog from "@/components/Dialog/SlippageDialog";
import BigNumber from "bignumber.js";

interface Props {
    type: number,
    trendInfo: TrendInfo
}

const TransactionDialog: React.FC<Props> = ({type, trendInfo}) => {

    const { t } = useTranslation();
    const solPrice = useCyptoRateStore((state) => state.sol);
    const bnbPrice = useCyptoRateStore((state) => state.bnb);
    const userTokens = userTokenStore((state) => state.tokens);
    const [transTipsType, setTransTipsType] = useState(0);
    const [inputContent, setInputContent] = useState('');
    const [showSwapLoading, setShowSwapLoading] = useState(false);
    const [slippage, setSlippage] = useState(10);
    const { showLoginDialog, hideDialog } = useDialog();
    const [visible, setVisible] = useState(false);
    const userInfo = useUserStore((state) => state.userInfo);
    const selectRatioRef = useRef(0);

    const getTokenRate = () => {
        const token = toDecimalsDiv(1, trendInfo.price);
        const p = toDecimalsMul(getUnitPrice(), token, 2);
        return translateAmount(Number(p));
    }

    const getTokenAmount = () => {
        if (userTokens && userTokens.length > 0) {
            const token = userTokens.filter(it => it.address === trendInfo.address);
            if (token.length > 0) {
                const t = token[0];
                return translateAmount(Number(formatPrice(toDecimalsDiv(t.amountStr, Math.pow(10, t.decimals)), 2)));
            }
        }
        return 0;
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

    const getBtnText = () => {
        if (type === 0) {
            if (Number(inputContent) > 0) {
                const price = toDecimalsMul(getUnitPrice(), inputContent, 3);
                return `${t("trading.buy")} ${formatPriceAndNumber(inputContent, 3)} ${getAmountUnit(trendInfo.network)} ($${formatPriceAndNumber(price, 2)})`;
            }
            return `${t("trading.buy")}`
        } else {
            if (Number(inputContent) > 0) {
                const tokenPrice = toDecimalsMul(inputContent, trendInfo.price);
                const price = formatPrice(toDecimalsDiv(tokenPrice, getUnitPrice()), 3);
                return `${t("trading.sell")} ${formatNumber(price)} ${getAmountUnit(trendInfo.network)} ($${formatPrice(tokenPrice, 3)})`;
            }
            return `${t("trading.sell")}`
        }
    }

    const getUnitPrice = () => {
        switch (trendInfo.network) {
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
        const slip = slippage;
        let relSlippage = "-1";
        if (Number(slip) > 0) {
            relSlippage = toDecimalsMul(slip, 100);
        }
        let amount: string;
        if (type === 0) {
            amount = inputContent;
        } else {
            const tokenBalance = getTokenBalance();
            if (selectRatioRef.current === 1) {
                amount = tokenBalance;
            } else {
                amount = toDecimalsMul(tokenBalance, selectRatioRef.current);
            }
        }
        transactionSwap({mintAddress: trendInfo.address, realAmount: amount, swapType: type, slippageBps: relSlippage}).then((res) => {
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
        showToast("success", type === 0 ? t("trading.buy_success") : t("trading.sell_success"), 4000);
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
        const balance = type === 0 ? getAccountBalance() : getTokenBalance();
        const input = BigNumber(inputContent);
        // <=
        return input.isLessThanOrEqualTo(balance);
    }

    const checkBalance = (input: string) => {
        if (input === "") return;
        const balance = type === 0 ? getAccountBalance() : getTokenBalance();
        // >
        if (BigNumber(input).isGreaterThan(balance)) {
            setTransTipsType(-4)
        } else {
            setTransTipsType(0)
        }
    }

    const getTokenBalance = () => {
        return getBalance(trendInfo.address);
    }

    const getSolBalance = () => {
        return getBalance(SOL_ADDRESS);
    }

    const getBnbBalance = () => {
        return getBalance(BNB_ADDRESS);
    }

    const getAccountBalance = () => {
        if (getNetwork(trendInfo.network) === "BSC") {
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

    const onRatioChange = (ratio: number) => {
        if (showSwapLoading) return;
        if (!isLogin()) {
            showLoginDialog();
            return;
        }
        selectRatioRef.current = ratio;
        if (type === 0) {
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

    const onInputChange = (input: string) => {
        if (showSwapLoading) return;
        if (!isLogin()) {
            showLoginDialog();
            return;
        }
        if ((input === "." && inputContent.includes(".")) || (input !== "-1" && inputContent.length >= 20)) {
            return;
        }
        if (input !== "-1") {
            if (inputContent === "" && input === ".") {
                updateInputContent("0.")
            } else if (inputContent.startsWith("0")) {
                if (input === "." || inputContent.includes(".")) {
                    updateInputContent(inputContent + input);
                } else if (input !== "0") {
                    updateInputContent(input)
                }
            } else if (input === "." || inputContent.includes(".")) {
                updateInputContent(inputContent + input);
            } else {
                updateInputContent(inputContent + input);
            }
        } else if (inputContent.length > 0) {
            updateInputContent(inputContent.substring(0, inputContent.length - 1))
        }
    }

    const updateInputContent = (data: string) => {
        setInputContent(data);
        checkBalance(data);
    }

    const getSlippage = () => {
        if (slippage > 0) {
            return `${slippage}%`;
        }
        return t("trading.auto")
    }

    const clickSlippage = ()=> {
        if (showSwapLoading) return;
        setVisible(true);
    }

    useEffect(() => {
        const localSlippage = window.localStorage.getItem(type === 0 ? slippage_buy_key : slippage_sell_key);
        if (localSlippage) {
            const value = Number(localSlippage);
            if (value >= 0) {
                setSlippage(value)
            } else {
                setSlippage(-1)
            }
        }
    }, [type, userInfo]);

    return (
        <DialogTemplate className="bg-background rounded-t-[24px] rounded-b-none w-screen flex flex-col items-center px-5">
            <div className="flex w-full justify-between mt-5">
                <Image className="w-6 h-6" src={setSlippageImg} alt={""} onClick={() =>  clickSlippage()}/>
                <span className="text-[20px] text-[#13122A] font-medium">{type === 0 ? t("trading.buy") : t("trading.sell")}</span>
                <Image className="w-6 h-6" src={closeImg} alt={""} onClick={() => hideDialog()}/>
            </div>

            <div className="flex w-full justify-between items-center mt-5.5">
                <span className="text-black font-semibold text-base">{type === 0 ? trendInfo.network === "bsc" ? t("trading.amount_bnb") : t("trading.amount_sol") : t("trading.amount")}</span>
                {
                    <span className={`text-sm ${type === 0 ? "text-[#666666]" : "text-black"}`}>{type === 0 ? `1 ${getAmountUnit(trendInfo.network)} ≈ ${getTokenRate()} ${trendInfo.symbol}` : `${t("trading.bal")}${getTokenAmount()} ${trendInfo.symbol}`}</span>
                }
            </div>

            <div className="flex w-full items-center border border-[#E4E4E7] rounded-[14px] py-1 px-1.5 mt-2 relative">
                <div className="flex-1 min-w-0 w-full overflow-hidden text-ellipsis whitespace-nowrap">
                    <span className={`text-[22px] text-[#B6B6B6] ${inputContent.length > 0 ? 'hidden' : '' }`}>0.0</span>
                    <span className={`text-[22px] text-black  ${inputContent.length > 0 ? '' : 'hidden' }`} >{inputContent}</span>
                </div>
                <span className="text-base mr-1.5">{type === 0 ? getAmountUnit(trendInfo.network) : trendInfo.symbol}</span>
            </div>

            <div className="flex w-full mt-7">
                {
                    <ChooseRatio type={type} callback={onRatioChange}/>
                }
            </div>

            <div className="flex w-full mt-4">
                <TransactionKeyboard onInputChange={onInputChange} />
            </div>

            <div className="flex w-full mt-2 justify-center">
                <span className={`h-[17px] ${transTipsType < -1 ? "text-[#FF4B92]" : "text-[#666666]"} text-[14px]`}>
                    {
                        inputContent ? getStatusText() : ""
                    }
                </span>
            </div>

            <div className="flex w-full mt-1.5">
                <div className={`flex w-full items-center justify-center rounded-3xl py-3 text-[18px] relative
                ${Number(inputContent) > 0 && transTipsType !== -4 ? "bg-[#18181B] text-white cursor-pointer" : "bg-[#E4E4E7]"} text-[#00000099]`} onClick={() => requestSwap()}>
                    <span>{getBtnText()}</span>
                    {
                        showSwapLoading && (
                            <Image className="w-5 h-5 absolute right-5 circle-progress" src={swapLoadingImg} width={20} height={20} alt=""/>
                        )
                    }
                </div>
            </div>

            <div className="flex w-full mt-2 mb-7">
                <span className="text-sm text-[#666666]">{t("trading.slippage")}</span>
                <span className="text-sm text-black font-semibold ml-1 underline">{getSlippage()}</span>
            </div>
            {
                visible && (
                    <SlippageDialog type={type} visible={visible} callback={(slippage) => setSlippage(Number(slippage)) } onHide={() => setVisible(false)} />
                )
            }
        </DialogTemplate>
    );
}

export default TransactionDialog;