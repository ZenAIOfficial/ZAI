import React from "react";
import IcBalanceCheckSvg from "@/assets/ic_balance_check.svg";
import Image from "next/image"
import { useDialog } from "@/hooks/useDialog";

type Props = object
const AssistantTopUpAccount: React.FC<Props> = () => {

    const { showAddFundsDialog } = useDialog();

    const handleAddFundsDialog = () => {
        showAddFundsDialog();
    }
    
    return (
        <div className="flex flex-col">
            <div className="bg-white border border-b-normal rounded-2xl pb-3 px-3 pt-4 w-fit shadow-border-message">
                <div className="flex flex-row items-center">
                    <div className="w-[34px] h-[34px] bg-[#F4F4F5] rounded-lg flex justify-center items-center">
                        <Image className="w-5 h-5" width={20} src={IcBalanceCheckSvg} alt={""} />
                    </div>
                    <div className="ml-3 flex flex-col flex-1 mr-8">
                        <span className="text-primary2 text-4 font-bold">Deposit Account</span>
                        <span className="text-color_text_middle">Add funds to continue using the service</span>
                    </div>
                    <div className="px-4 py-2 flex justify-center items-center transfer_bg text-white hover:opacity-70 cursor-pointer rounded-full" onClick={handleAddFundsDialog}>Deposit</div>
                </div>
            </div>
        </div>
    );
};

export default AssistantTopUpAccount;
