import React, { useState } from "react";
import tokenInfoSvg from "@/assets/ic_token_info.svg";
import { checkTransStatus, pushTransStatus, sendTransaction } from "@/apis/transaction";
import {checkTransactionCanRetry, getAmountUnit, handleTransactionFailedToast, sleep} from "@/utils/utils";
import transferSuccessImg from "@/assets/ic_transaction_success.svg";
import Image from "next/image"

interface SwapTokenInfo {
    oneQuestId: string;
    name: string;
    img: string;
    needSol: string;
    text: string;
    transferStatus: number;
    code: number;
    network: string;
    needAmount: string;
}

interface Props {
    token: SwapTokenInfo;
}
const AssistantBuyBlock: React.FC<Props> = ({ token }) => {
    const [loading, setLoading] = useState(false);
    const [transferStatus, setTransferStatus] = useState(token.transferStatus || 0); // 0: creating 1: failed retry 2: successfull 3: failed
    const [newCode, setNewCode] = useState(token.code);
    const toBuy = async () => {
        console.log("toBuy", token);
        if (loading || transferStatus === 2 || transferStatus === 3) {
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
                    toBuyFailure();
                } else {
                    toBuyFailureNotRetry();
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
                toBuySuccess();
            } else {
                toBuyFailure();
            }
        }).finally(() => {
            setLoading(false);
        })
    }

    const toBuySuccess = () => {
        console.log("toBuySuccess", token.oneQuestId);
        setTransferStatus(2);
        pushTransStatus({
            "action": "buyToken",
            "oneQuestId": token.oneQuestId,
            "transferStatus": 2
        });
    };

    const toBuyFailure = () => {
        console.log("toBuyFailure", token.oneQuestId);
        setTransferStatus(1);
        pushTransStatus({
            "action": "buyToken",
            "oneQuestId": token.oneQuestId,
            "transferStatus": 1
        });
    };

    const toBuyFailureNotRetry = () => {
        console.log("toBuyFailureNotRetry", token.oneQuestId);
        setTransferStatus(3);
        pushTransStatus({
            "action": "buyToken",
            "oneQuestId": token.oneQuestId,
            "transferStatus": 3
        });
    };

    const checkStatus = async (transaction: string) => {
        let num = 0;
        await sleep(2000);
        while (num < 15) {
            try {
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
                await sleep(2000);
            }
        }

        return "failure";
    };

    const transferStatusDiv = () => {
        if (transferStatus === 0) {
            return <span>Buy</span>
        }
        if (transferStatus === 1) {
            return <span>Retry</span>
        }
        if (transferStatus === 2) {
            return (<div className="flex items-center justify-center gap-1.5">
                <Image className="w-5 h-5" width={20} src={transferSuccessImg} alt={""} />
                <span>Transaction Successful</span>
            </div>)
        }
        return <span>Transaction Failed</span>
    }


    return (
        <div className="flex flex-col">
            <div className="bg-white border border-b-normal rounded-2xl pb-3 px-4 pt-4 w-full shadow-border-message">
                <div className="flex flex-row">
                    <Image className="w-5 h-5" width={20} src={tokenInfoSvg} alt={""} />
                    <span className="ml-2 text-primary2 text-4 font-medium">Buy Token</span>
                </div>
                <div className="text-color_text_middle text-sm leading-none mt-2">
                    <span>Amount:<span className="mr-1">{token.needAmount}</span>{getAmountUnit(token.network)}</span>
                </div>
                <div onClick={toBuy}
                    className={`rounded-full w-full h-[38px] mt-4 flex items-center justify-center text-3.5 ${transferStatus === 0 ? "transfer_bg text-white hover:opacity-70 cursor-pointer" : transferStatus === 1 ? "bg-primary1 hover:bg-[#EA2EFE80] cursor-pointer text-white" : transferStatus === 2 ? "bg-green_5 text-green" : "bg-black_60 text-white"}`}>
                    {loading ? <><span>Buy...</span><i className="pi pi-spin pi-spinner text-white ml-2"></i></> : transferStatusDiv()}
                </div>
                <span className="text-red_text">{transferStatus === 1 || transferStatus === 3 ? handleTransactionFailedToast(newCode) : ""}</span>
            </div>
            <span className="font-medium text-3.5 leading-normal text-primary2 mt-2">{transferStatus === 1 || transferStatus === 3 ? "An unknown error occurred with this transaction." : ""}</span>
        </div>
    );
};

export default AssistantBuyBlock;
