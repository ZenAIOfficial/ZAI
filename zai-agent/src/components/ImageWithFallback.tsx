import Image from "next/image";
import { useState } from "react";

interface Props {
  className: string;
  width: number;
  height: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  src: string | { image: string } | any;

  fallbackSrc: string;
}
const ImageWithFallback: React.FC<Props> = ({ className, width, height, src, fallbackSrc, ...props }) => {
  const [imgSrc, setImgSrc] = useState(() => {
    if (typeof src === "string") {
      return src;
    } else {
      if (src && src.image) {
        return src.image;
      }
      if (src) {
        return src;
      }
      return fallbackSrc;
    }
  });

  return (
    <Image
      className={className}
      width={width}
      height={height}
      {...props}
      src={imgSrc}
      onError={() => setImgSrc(fallbackSrc)}
      alt=""
    />
  );
};

export default ImageWithFallback;