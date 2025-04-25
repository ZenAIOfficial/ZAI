import React from "react";
import { tiktokImg } from "@/utils/utils";
import Image from "next/image";

interface TransferInfo {
    oneQuestId: string;
    username: string;
    name: string;
    img: string;
    desc: string;
    followerCount: string;
    followingCount: string;
    likesCount: string;
}

interface Props {
    token: TransferInfo;
}
const AssistantTiktokUser: React.FC<Props> = ({ token }) => {


    const showTiktokInfo = (value: any) => {
        if (value >= 0) {
            return value
        }
        return '--';
    }
    const showTiktokImg = (value: any) => {
        if (value) {
            return value
        }
        return tiktokImg;
    }

    return (
        <div className="flex flex-col">
            <div className="bg-white flex flex-row border border-b-normal rounded-2xl pb-3 px-4 pt-4 w-fit shadow-border-message">
                <div><Image className="w-14 h-14 rounded-full" width={56} height={56} src={showTiktokImg(token.img)} alt="" /></div>
                <div className="flex flex-col ml-3.5">
                    <div className="">
                        <span className="font-bold">{token.username}</span>
                        <span className="ml-2 text-sm">{token.name}</span>
                    </div>
                    <div className="mt-1.5 text-sm text-color_text_middle"><span className="font-bold text-black ">{showTiktokInfo(token.followerCount)}</span> followers <span className="font-bold text-black">{showTiktokInfo(token.followingCount)}</span> following <span className="font-bold text-black">{showTiktokInfo(token.likesCount)}</span> Likes</div>
                    <div className="text-color_text_middle text-sm">{token.desc}</div>
                </div>
            </div>
        </div>
    );
};

export default AssistantTiktokUser;
