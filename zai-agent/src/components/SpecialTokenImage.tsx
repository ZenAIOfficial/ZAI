import React from "react";
import TokenDefaultImage from "@/components/TokenDefaultImage";
import Image from "next/image";
import bscImg from "@/assets/ic_bsc_logo.svg";
import solImg from "@/assets/ic_sol_mark.svg";
import specialMaskImg from "@/assets/ic_special_token_mask.png";
import {StaticImport} from "next/dist/shared/lib/get-img-props";

interface Props {
    image: string;
    className?: string;
    width: number;
    height: number;
    name: string;
    chain: string;
    markClassName?: string;
}

const TokenImage: React.FC<Props> = ({image, className, width, height, name, chain, markClassName}) => {

    const getChainMark = () => {
        let mark: string | StaticImport = solImg
        switch (chain) {
            case "bsc":
                mark = bscImg;
                break;
            case "solana":
                mark = solImg;
                break;
        }
        return mark;
    }

    return (
        <div className="flex">
            <div className="flex relative">
                <TokenDefaultImage className={className} image={image} width={width} height={height} name={name} />
                <Image className={`absolute bottom-0 right-0 z-1 ${markClassName ? markClassName : 'w-3.5 h-3.5'}`} src={getChainMark()} alt="" />
            </div>
            <Image className={`absolute special-token-mask left-0 w-22.5 h-22.5 object-fill special-token-mask-circle-animation`} width={90} height={90} src={specialMaskImg} alt="" />
        </div>

    )
}

export default TokenImage;