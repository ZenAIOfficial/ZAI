import React, { useState } from "react";
import IcBalanceCheckSvg from "@/assets/ic_balance_check.svg";
import {checkTransactionCanRetry, handleTransactionFailedToast, sleep} from "@/utils/utils";
import { checkTransStatus, pushTransStatus, sendTransaction } from "@/apis/transaction";
import sufficientSvg from "@/assets/ic_sufficient.svg";
import transferSuccessImg from "@/assets/ic_transaction_success.svg";
import { refreshUserInfo } from "@/store/userStore";
import Image from "next/image"

interface TransferInfo {
    oneQuestId: string;
    name: string;
    img: string;
    text: string;
    needAmount: string;
    symbol: string;
    targetAccount: string;
    transferStatus: number;
    code: number;
}

interface Props {
    token: TransferInfo;
    handleManualResponse: (qId: string, content: any[]) => void;
}
const AssistantTransferBlock: React.FC<Props> = ({ token, handleManualResponse }) => {

    const [loading, setLoading] = useState(false);
    const [transferStatus, setTransferStatus] = useState(token.transferStatus || 0); // 0: creating 1: failed 2: successfull
    const [newCode, setNewCode] = useState(token.code);

    const toBuy = async () => {
        console.log("toBuy", token);
        if (loading) {
            return;
        }
        if (transferStatus === 2 || transferStatus === 3) {
            return;
        }
        try {
            setLoading(true);
            const res = await sendTransaction(token.oneQuestId);
            if (res.transaction) {
                checkTransferStatus(res.transaction);
            } else {
                setLoading(false);
                setNewCode(res.code);
                if (checkTransactionCanRetry(res.code)) {
                    toTransferFailure();
                } else {
                    toTransferFailureNotRetry();
                }
                return;
            }
        } catch (e) {
            console.log(e);
            setLoading(false);
        }
    };

    const checkTransferStatus = (transaction: string) => {
        checkStatus(transaction).then((status) => {
            if (status === "success") {
                toTransferSuccess();
            } else {
                toTransferFailure();
            }
        }).finally(() => {
            setLoading(false);
        })
    }

    const toTransferSuccess = async () => {
        console.log("toTransferSuccess", token.oneQuestId);
        setTransferStatus(2);
        const res = await pushTransStatus({
            "action": "transferConfirmation",
            "oneQuestId": token.oneQuestId,
            "transferStatus": 2
        });
        handleManualResponse(token.oneQuestId, res.list);
        refreshUserInfo();
    };

    const toTransferFailure = () => {
        console.log("toTransferFailure", token.oneQuestId);
        setTransferStatus(1);
        pushTransStatus({
            "action": "transferConfirmation",
            "oneQuestId": token.oneQuestId,
            "transferStatus": 1
        });
    };

    const toTransferFailureNotRetry = () => {
        console.log("toTransferFailureNotRetry", token.oneQuestId);
        setTransferStatus(3);
        pushTransStatus({
            "action": "transferConfirmation",
            "oneQuestId": token.oneQuestId,
            "transferStatus": 3
        });
    };

    const checkStatus = async (transaction: string) => {
        let num = 0;
        while (num < 15) {
            try {
                await sleep(5000);
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

    const transferStatusDiv = () => {
        if (transferStatus === 0) {
            return <span>Sign Transaction</span>
        }
        if (transferStatus === 1) {
            return <span>Retry</span>
        }
        if (transferStatus === 2) {
            return (<div className="flex items-center justify-center gap-1.5">
                <Image className="w-5 h-5" width={20} src={transferSuccessImg} alt={""}/>
                <span>Transfer Successful</span>
            </div>)
        }
        return <span>Transfer Failed</span>
    }

    return (
        <div className="flex flex-col">
            <div className="bg-white border border-b-normal rounded-2xl pb-3 px-4 pt-4 w-full shadow-border-message">
                <div className="flex flex-row">
                    <Image className="w-5 h-5" width={20} src={IcBalanceCheckSvg} alt={""} />
                    <span className="ml-2 text-primary2 text-4 font-medium">Transfer Confirmation</span>
                </div>
                <div className="flex flex-row font-medium mt-2">
                    <div className="text-color_text_middle">Amount</div>
                    <div className="flex-1 text-end">{token.needAmount} {token.symbol}</div>
                    {
                        transferStatus === 2 ? (
                            <>
                            <Image className="w-5 h-5 ml-2 mr-1" width={20} src={sufficientSvg} alt={""} />
                            <span className="text-[#29CA53]">Sufficient</span></>
                        ) : (<></>)
                    }
                </div>
                <div className="flex flex-row font-medium mt-2">
                    <div className="text-color_text_middle">To:</div>
                    <div className="flex-1 text-end overflow-hidden">{token.targetAccount}</div>
                </div>

                <div onClick={toBuy}
                    className={`rounded-full w-full h-[38px] mt-4 flex items-center justify-center ${transferStatus === 0 ? "transfer_bg text-white hover:opacity-70 cursor-pointer" : transferStatus === 1 ? "bg-primary1 hover:bg-[#EA2EFE80] cursor-pointer text-white" : transferStatus === 2 ? "bg-green_5 text-green" : "bg-black_60 text-white"}`}>
                    {loading ? <><span>Sign Transaction...</span><i className="pi pi-spin pi-spinner text-white ml-2"></i></> : transferStatusDiv()}
                </div>
                <span className="text-red_text">{transferStatus === 1 || transferStatus === 3 ? handleTransactionFailedToast(newCode) : ""}</span>
            </div>
        </div>
    );
};

export default AssistantTransferBlock;
