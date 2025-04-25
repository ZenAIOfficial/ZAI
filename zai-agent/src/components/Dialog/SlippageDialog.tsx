import React, {useEffect, useRef, useState} from "react";
import DialogTemplate from "@/components/Dialog/DialogTemplate";
import {useTranslation} from "react-i18next";
import {Dialog} from "primereact/dialog";
import {hideDialogCallback} from "@/utils/dialogs";
import {slippage_buy_key, slippage_sell_key} from "@/utils/constants";
import {isLogin, updateUser, useUserStore} from "@/store/userStore";
import {useDialog} from "@/hooks/useDialog";
import {toDecimalsDiv, toDecimalsMul} from "@/utils/decimalUtil";
import {updateSlippage} from "@/apis/trading";

interface Props {
    type: number;
    visible: boolean;
    onHide: () => void;
    callback: (slippage: string) => void;
}

const SlippageDialog: React.FC<Props> = ({type, visible, onHide, callback}) => {
    const { t } = useTranslation();
    const [progress, setProgress] = useState(10);
    const progressCurRef = useRef(10);
    const [selectedTab, setSelectedTab] = useState<number>(0);
    const progressRef = useRef(null);
    const total = 80;
    const isDragging = useRef(false);
    const [dialogVisible, setDialogVisible] = useState(visible);
    const { showLoginDialog } = useDialog();
    const userInfo = useUserStore((state) => state.userInfo);

    const updateProgress = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (!progressRef.current) return;
        const proRef = progressRef.current as HTMLElement;
        const { left, width } = proRef.getBoundingClientRect();
        let offsetX = 0;
        if ('clientX' in event) {
            offsetX = event.clientX - left;
        } else if ('touches' in event && event.touches.length > 0) {
            offsetX = event.touches[0].clientX - left;
        }
        const pro = Math.ceil((Math.min(100, Math.max(1, (offsetX / width) * 100)) * total) / 100)
        setProgress(pro);
        progressCurRef.current = pro;
    };

    const startDrag = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        isDragging.current = true;
        updateProgress(event);
    }

    const onDrag = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (isDragging.current) {
            updateProgress(event);
        }
    }

    const onDone = () => {
        if (!isLogin()) {
            showLoginDialog();
            return;
        }

        const result = selectedTab === 1 ? -1 : progress;
        window.localStorage.setItem(type === 0 ? slippage_buy_key : slippage_sell_key, result.toString());
        requestUpdateSlippage();
        callback(result.toString());
        hideDialog();
    };

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

    const hideDialog = () => {
        onHide();
        hideDialogCallback();
        // setDialogVisible(false);
    }

    useEffect(() => {
        setDialogVisible(visible)
    }, [visible]);

    useEffect(() => {
        const localSlippage = window.localStorage.getItem(type === 0 ? slippage_buy_key : slippage_sell_key);
        if (localSlippage) {
            const value = Number(localSlippage);
            if (value >= 0) {
                setProgress(value);
                progressCurRef.current = value;
                // setSelectedTab(0);
            } else {
                setSelectedTab(1);
                progressCurRef.current = -1;
                // setProgress(t("trading.auto"));
            }
        }
        callback(progressCurRef.current.toString());
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
        <Dialog
            contentClassName="bg-transparent p-0 m-0"
            showHeader={false}
            visible={dialogVisible}
            onHide={hideDialog}
            position="bottom"
            modal
            dismissableMask={true}
        >
            <DialogTemplate className="bg-background rounded-t-[24px] rounded-b-none w-screen flex flex-col items-center px-5">
                <div className="flex w-full items-center mt-8">
                    <span className="text-base text-black font-semibold">{t("trading.slippage_text")}</span>
                    <div className="ml-auto">
                    <span className={`px-2 py-1 rounded-[6px] text-sm font-semibold 
                        ${selectedTab === 0 ? "bg-[#18181B] text-white" : "bg-[#F4F4F5] text-black"}`}
                          onClick={() => setSelectedTab(0)}>{t("trading.manual", {progress: progress})}</span>
                        <span className={`ml-2 px-2 py-1 rounded-[6px] text-sm font-semibold 
                        ${selectedTab === 1 ? "bg-[#18181B] text-white" : "bg-[#F4F4F5] text-black"}`}
                              onClick={() => setSelectedTab(1)}>{t("trading.auto")}</span>
                    </div>
                </div>
                <div className="flex w-full mt-4">{t("trading.slippage_des")}</div>
                {
                    selectedTab === 0 && (
                        <div ref={progressRef} className="w-full h-5 mt-6 relative"
                             onClick={startDrag}
                             onTouchMove={onDrag}
                             onTouchStart={() => isDragging.current = true}
                             onTouchEnd={() => isDragging.current = false}>
                            <div className="w-full h-1 bg-[#ebebf4] rounded-lg absolute top-[50%] -translate-y-1/2" />
                            <div className={`w-10 h-1 bg-[#3cb81b] rounded-lg absolute top-[50%] -translate-y-1/2`} style={{width: `${(progress / total) * 100}%`}} />
                            <div className={`absolute h-4.5 w-4.5 rounded-full bg-[#3cb81b] top-[50%] -translate-1/2`} style={{left: `${(progress / total) * 100}%`}} />
                        </div>
                    )
                }
                <div className="flex w-full h-9.5 bg-[#18181B] rounded-[20px] mt-5 mb-10 items-center justify-center text-white" onClick={() => onDone()}>{t("trading.done")}</div>
            </DialogTemplate>
        </Dialog>
    )
}

export default SlippageDialog;