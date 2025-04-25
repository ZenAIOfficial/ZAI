'use client'
import { UserToken } from "@/apis/user";
import BigNumber from "bignumber.js";
import { useRouter } from "next/navigation";
import TokenImage from "@/components/TokenImage";
import React from "react";
import {BNB_ADDRESS, SOL_ADDRESS} from "@/utils/constants";

interface Props {
  item: UserToken
  toggleSidebar: () => void;
}

const UserTokenItem: React.FC<Props> = ({ item, toggleSidebar }) => {
  const router = useRouter();
  const getAmount = () => {
    try {
      const amount = new BigNumber(item.amountStr);
      const decimals = new BigNumber(item.decimals);

      const divisor = new BigNumber(10).pow(decimals);
      if (amount.isZero()) {
        return '0';
      }
      const result = amount
        .div(divisor)
        .decimalPlaces(5, BigNumber.ROUND_HALF_UP);
      if (result.isLessThan(0.00001)) {
        return `≈0`
      }
      return `${result}`
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return 0;
    }
  }

  const getBalance = () => {
    try {
      const amount = new BigNumber(item.amountStr);
      const price = new BigNumber(item.price);
      const decimals = new BigNumber(item.decimals);
      const divisor = new BigNumber(10).pow(decimals);
      if (amount.isZero()) {
        return `\$0.00`;
      }
      const result = amount
        .times(price)
        .div(divisor)
        .decimalPlaces(2, BigNumber.ROUND_HALF_UP);
      return `\$${result}`
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return "$0.00";
    }
  };

  const handleTokenDetail = () => {
    if (item.address !== SOL_ADDRESS && item.address !== BNB_ADDRESS) {
      router.push(`/trading/${item.address}`);
      toggleSidebar();
    }
  }

  return (
    <div className="flex flex-row items-center h-12.5 mt-2 mx-2.5 pl-2.5 pr-1.5 rounded-xl hover:bg-[#F7F3FF]" onClick={handleTokenDetail}>
      <div>
        {/*<ImageWithFallback className="w-9 h-9 rounded-full" src={item} width={36} height={36} fallbackSrc={imageErrorImg} />*/}
        <TokenImage className="w-9 h-9 rounded-full shrink-1" image={item.image} width={36} height={36} name={item.symbol} chain={item.network} />
      </div>
      <div className="ml-4 flex flex-col justify-center">
        <div className="font-medium">{item.symbol}</div>
        <div className="text-xs text-text_5">{getAmount()} {item.symbol}</div>
      </div>
      <div className="ml-auto">{getBalance()}</div>
    </div>
  );
}
export default UserTokenItem;