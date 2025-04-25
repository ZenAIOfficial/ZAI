import IcBalanceCheckSvg from "@/assets/ic_balance_check.svg";
import IcSolanaLogoSvg from "@/assets/ic_solana_logo.svg";
import bscImg from "@/assets/ic_bsc_logo.svg";
import insufficientSvg from "@/assets/ic_insufficient.svg";
import sufficientSvg from "@/assets/ic_sufficient.svg";
import Image from "next/image"
import {getNetwork} from "@/utils/utils";

interface BalanceCheckInfo {
  symbol: string;
  needCoin: number;
  userBalanceCoin: number;
  network: string;
}

interface Props {
  data: BalanceCheckInfo;
}

const AssistantBalanceCheckBlock: React.FC<Props> = ({ data }) => {

  return (
    <div className="bg-white border border-b-normal rounded-2xl pl-4 pr-10 py-3 w-fit shadow-border-message">
      <div className="flex flex-row">
        <Image className="w-5 h-5" width={20} src={IcBalanceCheckSvg as string} alt={""} />
        <span className="ml-2 text-primary2 text-4 font-medium">Balance Check</span>
      </div>
      <div className="flex flex-row mt-2.5">
        <Image className="mr-3 w-8 h-8" src={data.network === "bsc" ? bscImg : IcSolanaLogoSvg} width={32} height={32} alt={""} />
        <div className="flex flex-col ml-2 text-3.5 font-medium">
          <div className="flex flex-row items-center">
            <span className="text-primary2">{data.userBalanceCoin} {data.symbol}</span>
            {
              data.needCoin > data.userBalanceCoin ? (
                <>
                  <Image className="w-5 h-5 ml-2 mr-1" width={20} src={insufficientSvg as string} alt={""} />
                  <span className="text-red_text">Insufficient</span></>
                  
              ) : (<>
                <Image className="w-5 h-5 ml-2 mr-1" width={20} src={sufficientSvg as string} alt={""} />
                <span className="text-[#29CA53]">Sufficient</span></>)
            }
          </div>
          <span className="text-color_text_middle">{getNetwork(data.network)}</span>
        </div>
      </div>
    </div>
  );
};

export default AssistantBalanceCheckBlock;
