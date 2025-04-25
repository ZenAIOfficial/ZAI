import React from "react";
import {ExtensionInfo} from "@/apis/trading";
import xImg from "@/assets/ic_about_x.svg";
import websiteImg from "@/assets/ic_about_website.svg";
import tgImg from "@/assets/ic_about_tg.svg";
import shareImg from "@/assets/ic_about_share_gary.svg";
import Image from "next/image";

interface Props {
    data: string;
    twitterName: string;
}

const TokenAboutLinkComponent: React.FC<Props> = ({data, twitterName}) => {

    const getLink = () => {
        const list = [];
        if (data && data.length > 1) {
            const extensionObj = JSON.parse(data) as ExtensionInfo;
            if (extensionObj.twitter) {
                list.push({id: 1, name: twitterName ? twitterName : "X", img: xImg, link: extensionObj.twitter});
            }
            if (extensionObj.website) {
                list.push({id: 2, name: "Website", img: websiteImg, link: extensionObj.website});
            }
            if (extensionObj.telegram) {
                list.push({id: 3, name: "Telegram", img: tgImg, link: extensionObj.telegram});
            }
        }
        return <div className="flex flex-wrap w-full mb-3 gap-2">
            {
                list && list.length > 0 ? list.map((it, index) => (
                    <div className="flex w-fit flex-row items-center border border-[#E4E4E7] rounded-[20px] py-1 pl-1 pr-4 cursor-pointer" key={index}
                         onClick={(event) => gotoLink(it.link, event) }>
                        <Image className="w-7 h-7 cursor-pointer" src={it.img} width={28} height={28}
                               alt="" />
                        <span className="flex-1 ml-3 text-[#666666] text-xs whitespace-nowrap overflow-hidden text-ellipsis">{it.name}</span>
                        <Image className="w-4 h-4 ml-10" src={shareImg} width={16} height={16}
                               alt="" />
                    </div>

                )) : <></>
            }
        </div>
    }

    const gotoLink = (link: string, event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        window.open(link);
    }

    return (
        <>
            {
                getLink()
            }
        </>
    )
}

export default TokenAboutLinkComponent;