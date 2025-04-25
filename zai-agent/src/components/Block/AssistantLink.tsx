import React from "react";
import copySvg from "@/assets/ic_copy.svg";
import { copyText } from "@/utils/utils";
import Image from "next/image";

interface TransferInfo {
    oneQuestId: string;
    text: string;
}

interface Props {
    token: TransferInfo;
}
const AssistantLink: React.FC<Props> = ({ token }) => {

    const handleCopy = (e: React.MouseEvent<HTMLImageElement>) => {
        e.stopPropagation();
        copyText(token.text);
    }
    return (
        <div className="flex flex-col">
            <div className="bg-white flex flex-col border border-b-normal rounded-2xl pb-3 px-4 pt-4 sm:w-fit shadow-border-message">
                <div className="font-semibold">Share Link Created!</div>
                <div className="text-color_text_middle text-sm mt-4">our recipient can use this link to claim their tokens:</div>

                <div className="flex flex-row items-center mt-1 bg-message_bg rounded-full h-[42px] pl-4">
                    <div className="truncate mr-3">{ token.text }</div>
                    <div className="mr-3 sm:mr-10"><Image className="min-w-6 w-6 h-6" src={copySvg} onClick={handleCopy} alt="" /></div>

                </div>
            </div>
        </div>
    );
};

export default AssistantLink;
