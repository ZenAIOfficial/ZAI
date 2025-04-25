import React from "react";
import {ExtensionInfo} from "@/apis/trading";
import xImg from "@/assets/ic_gary_x.svg";
import websitImg from "@/assets/ic_gary_websit.svg";
import tgImg from "@/assets/ic_gary_tg.svg";
import Image from "next/image";

interface Props {
    data: string;
}

const TokenLinkComponent: React.FC<Props> = ({data}) => {

    const getLink = () => {
        const list = [];
        if (data && data.length > 1) {
            const extensionObj = JSON.parse(data) as ExtensionInfo;
            if (extensionObj.twitter) {
                list.push({img: xImg, link: extensionObj.twitter});
            }
            if (extensionObj.website) {
                list.push({img: websitImg, link: extensionObj.website});
            }
            if (extensionObj.telegram) {
                list.push({img: tgImg, link: extensionObj.telegram});
            }
        }
        return <div className="flex ml-2">
            {
                list && list.length > 0 ? list.map((it, index) => (
                    <Image className="w-3 h-3 ml-1 cursor-pointer" src={it.img} width={12} height={12}
                           alt="" onClick={(event) => gotoLink(it.link, event) } key={index} />
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

export default TokenLinkComponent;