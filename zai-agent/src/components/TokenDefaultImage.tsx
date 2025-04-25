import React from "react";
import Image from "next/image";

interface Props {
    image: string;
    className?: string;
    width: number;
    height: number;
    name: string;
}

const TokenDefaultImage: React.FC<Props> = ({image, className, width, height, name}) => {

    const [loading, setLoading] = React.useState(true);
    const [loadError, setLoadError] = React.useState(false);

    const getName = () => {
        const result = name.substring(0, 2).toUpperCase();
        return result;
    }

    return (
        <div className={`${className} relative`}>
            {
                (image && !loadError) && (
                    <Image className={`${className}`}
                           src={image}
                           width={width}
                           height={height}
                           onLoad={() => setLoading(false)}
                           onError={() => setLoadError(true)}
                           alt=""/>
                )
            }

            {
                (!image || loading || loadError) && (
                    <div className={`${className} absolute top-0 bg-black flex items-center justify-center`}>
                        <span className="text-white text-lg font-medium">{getName()}</span>
                    </div>
                    /*<Image className={`${className} absolute top-0`}
                           src={defaultImg}
                           alt=""/>*/
                )
            }
        </div>
    )
}

export default TokenDefaultImage;