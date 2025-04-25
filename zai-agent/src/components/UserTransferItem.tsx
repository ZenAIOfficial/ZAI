'use client'
import { UserTransferResponse } from "@/apis/user";
import imageErrorImg from "@/assets/ic_image_error.svg";
import transferRecordTopupImg from "@/assets/ic_transfer_record_topup.svg";
import transferRecordTransferImg from "@/assets/ic_transfer_record_transfer.svg";
import ImageWithFallback from "./ImageWithFallback";
import { formatTimestampToHours2 } from "@/utils/utils";
import TokenImage from "@/components/TokenImage";
import React from "react";
import TokenDefaultImage from "@/components/TokenDefaultImage";

interface Props {
  item: UserTransferResponse
}

const UserTransferItem: React.FC<Props> = ({ item }) => {

  const getImage = () => {
    if (item.type === 1 || item.type === 2) {
      return item.image;
    }
    if (item.type === 4 && item.markup === 2) {
      return transferRecordTopupImg;
    }
    return transferRecordTransferImg
  };

  const getBalance = () => {
    try {
      if (item.type === 1) {
        return `+${item.value} ${item.symbol}`
      } else if (item.type === 2) {
        return `-${item.value} ${item.symbol}`
      } else {
        return `${item.value} ${item.symbol}`
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return "$0.00";
    }
  };

  const getAmount = () => {
    return `${item.equivalentSymValue} ${item.equivalentSymbol}`
  };

  const getTitle = () => {
    if (item.type === 4 && item.markup === 2) {
      return "Deposit"
    }
    if (item.type === 1) {
      return `Bought`;
    }
    if (item.type === 2) {
      return `Sold`;
    }
      return "Transfer"
  };

  const getTime = () => {
    return formatTimestampToHours2(item.createdTime * 1000);
  }

  return (
    <div className="flex flex-row items-center h-9 mt-4.5 ml-5 mr-4">
      <div className="relative">
        {/*<ImageWithFallback className="w-9 h-9 rounded-full" src={getImage()} width={36} height={36} fallbackSrc={imageErrorImg} />*/}
        {/* <Image className="w-3 h-3 rounded-full absolute bottom-0 right-0" src={(item.type === 1 || item.type === 4) ? transferRecordInImg : transferRecordOutImg} width={12} height={12} alt="" /> */}
        {
            (item.type === 1 || item.type === 2) ?
                <TokenImage className="w-9 h-9 rounded-full shrink-1" image={item.image} width={36} height={36} name={item.symbol} chain={item.network} />
                :
                <ImageWithFallback className="w-9 h-9 rounded-full" src={getImage()} width={36} height={36} fallbackSrc={imageErrorImg} />
        }
      </div>
      <div className="ml-4 flex flex-col justify-center">
        <div className="font-medium">{getTitle()}</div>
        <div className="text-xs text-text_5">{getTime()}</div>
      </div>
      <div className="flex flex-col ml-auto">
        <div className="ml-auto">{getBalance()}</div>
        <div className={`ml-auto text-xs text-text_5 ${item.type === 3 || item.type === 4 ? 'hidden': ''}`}>{getAmount()}</div>
      </div>
    </div>
  );
}
export default UserTransferItem;