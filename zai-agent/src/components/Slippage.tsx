import React, {useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {slippage_buy_key, slippage_sell_key} from "@/utils/constants";
import Image from "next/image";
import arrowDownImg from "@/assets/ic_arrow_down.svg";
import {isLogin, updateUser, useUserStore} from "@/store/userStore";
import {toDecimalsDiv, toDecimalsMul} from "@/utils/decimalUtil";
import {updateSlippage} from "@/apis/trading";
import {useDialog} from "@/hooks/useDialog";

interface Props {
    type: number;
    disable: boolean;
    callback: (data: string) => void;
}

const Slippage: React.FC<Props> = ({type, disable, callback}) => {
    const { t } = useTranslation();
    const [numVal, setNumVal] = useState('');
    const [selectedTab, setSelectedTab] = React.useState(1);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [showSlippage, setShowSlippage] = useState(false);
    const userInfo = useUserStore((state) => state.userInfo);
    const defaultSlippage = "10%";
    const [slippage, setSlippage] = useState(defaultSlippage);
    const { showLoginDialog } = useDialog();

    const handleChange = (v: string) => {
        if (disable) return;
        let val = v;
        // if (/^\d*\.?\d*$/.test(val)) {
        //     setNumVal(val);
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
        setNumVal(val);
    };

    const onInputBlur = () => {
        const input = inputRef.current?.value;
        if (!input) return;
        if (Number(input) > 80) {
            setNumVal("80");
        }
    }

    const onDone = () => {
        if (disable) return;
        if (!isLogin()) {
            showLoginDialog();
            return;
        }
        const inputValue = Number(inputRef.current?.value);
        const result = selectedTab === 0 || inputValue <= 0 ? -1 : inputValue;
        window.localStorage.setItem(type === 0 ? slippage_buy_key : slippage_sell_key, result.toString());
        callback(result.toString());
        if (result >= 0) {
            setSlippage(`${result}%`);
        } else {
            setSelectedTab(0);
            setSlippage(t("trading.auto"));
        }
        requestUpdateSlippage();
        switchSlippage();
    }

    const requestUpdateSlippage = () => {
        let buySlippage = "1000";
        let sellSlippage = "1000";
        const localBuySlippage = window.localStorage.getItem(slippage_buy_key);
        const localSellSlippage = window.localStorage.getItem(slippage_sell_key);
        if (localBuySlippage) {
            buySlippage = Number(localBuySlippage) > 0 ? toDecimalsMul(localBuySlippage, 100) : "-1";
        }
        if (localSellSlippage) {
            sellSlippage = Number(localSellSlippage) > 0 ? toDecimalsMul(localSellSlippage, 100) : "-1";
        }

        updateSlippage({buySlippageBps: buySlippage, sellSlippageBps: sellSlippage}).then(() => {
            if (userInfo) {
                userInfo.slippage.buySlippageBps = Number(buySlippage);
                userInfo.slippage.sellSlippageBps = Number(sellSlippage);
                updateUser(userInfo);
            }
        })
    }

    const switchSlippage = () => {
        setShowSlippage(!showSlippage)
    }

    const changeTab = (pos: number) => {
        if (disable) return;
        setSelectedTab(pos);
    }

    useEffect(() => {
        setNumVal("");
        const localSlippage = window.localStorage.getItem(type === 0 ? slippage_buy_key : slippage_sell_key);
        if (localSlippage) {
            const value = Number(localSlippage);
            if (value >= 0) {
                setNumVal(value.toString());
                setSlippage(`${value}%`);
                setSelectedTab(1);
            } else {
                setSelectedTab(0);
                setSlippage(t("trading.auto"));
            }
        } else {
            setSlippage(defaultSlippage);
            setNumVal(defaultSlippage.replace("%", ""))
        }
        callback(slippage);
    }, [type, userInfo]);

    useEffect(() => {
        if (userInfo && userInfo.slippage) {
            const buySlippage = userInfo.slippage.buySlippageBps;
            const sellSlippage = userInfo.slippage.sellSlippageBps;
            window.localStorage.setItem(slippage_buy_key, buySlippage > 0 ? toDecimalsDiv(buySlippage, 100) : buySlippage.toString());
            window.localStorage.setItem(slippage_sell_key, sellSlippage > 0 ? toDecimalsDiv(userInfo.slippage.sellSlippageBps, 100) : sellSlippage.toString());
        }
    }, [userInfo]);

    return (
        <div>
            <div className="flex mt-2.5">
                <span className="text-sm text-[#666666]">{t("trading.slippage")}</span>
                <div className="flex cursor-pointer" onClick={() => switchSlippage()}>
                    <span className="text-sm text-black font-semibold ml-1 underline">{slippage}</span>
                    <Image className={`w-4 h-4 ml-2 ${showSlippage ? "rotate-180" : ""}`} src={arrowDownImg} width={16}
                           height={16} alt=""/>
                </div>
            </div>

            {
                showSlippage && (
                    <div>
                        <div className="flex items-center border-t border-[#E4E4E7] pt-2 mt-3.5">
                            <span className="text-sm text-[#666666]">{t("trading.slippage")}</span>
                            <div className="flex ml-auto gap-2">
                                <div
                                    className={`flex items-center justify-center w-22 h-7 text-sm border rounded-lg cursor-pointer
                    ${selectedTab === 0 ? "border-[#18181B] text-black" : "border-[#E4E4E7] text-[#666666]"}`}
                                    onClick={() => changeTab(0)}>{t("trading.auto")}
                                </div>
                                <div
                                    className={`flex w-20 h-7 items-center gap-2 border rounded-lg px-1 ${selectedTab === 1 ? "border-[#18181B] text-black" : "border-[#E4E4E7] text-[#666666]"}`}
                                    onClick={() => changeTab(1)}>
                                    <input ref={inputRef} className={"flex-1 w-full min-w-0 text-sm"}
                                           type="text" value={numVal} onChange={e => handleChange(e.target.value)} onBlur={() => onInputBlur()}/>
                                    <span
                                        className={"text-[#00000099] text-sm font-semibold flex-shrink-0 whitespace-nowrap"}>%</span>
                                </div>
                            </div>
                        </div>
                        <div
                            className="flex h-9.5 items-center bg-[#18181B] justify-center border border-[#E4E4E7] rounded-[19px] text-white text-sm mt-2.5 cursor-pointer"
                            onClick={() => onDone()}>{t("trading.confirm")}</div>
                    </div>
                )
            }
        </div>
    )
}

export default Slippage;