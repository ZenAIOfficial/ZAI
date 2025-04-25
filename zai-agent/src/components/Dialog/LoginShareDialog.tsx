
import recvCryptoImg from "@/assets/ic_recv_crypto.svg";
import shareTiktokImg from "@/assets/ic_share_tiktok.svg";
import { ReceivedCrypto } from "@/apis/user";
import { showWalletAddress } from "@/utils/utils";
import DialogTemplate from "./DialogTemplate";
import Image from "next/image"
import { useDialog } from "@/hooks/useDialog";
import { useRouter } from "next/navigation";

interface Props {
  canBackRoot: boolean;
  receivedCrypto: ReceivedCrypto;
}

const LoginShareDialog: React.FC<Props> = ({ canBackRoot, receivedCrypto }) => {
  const router = useRouter();
  const { hideDialog } = useDialog();

  const handleContiune = () => {
    hideDialog();
    if (canBackRoot) {
      router.push("/");
    }
  }
  const getFromTitle = () => {
    if (receivedCrypto.source === 2) {
      return showWalletAddress(receivedCrypto.fromAddress);
    } else {
      return receivedCrypto.fromUsername;
    }
  }

  return (
    <DialogTemplate className="relative bg-background rounded-[24px] w-full md:w-[360px] flex flex-col items-center">
      <div className="share_card_bg z-0 absolute w-[300px] h-[30px] top-0 left-30"></div>

      <div className="p-4 w-full flex flex-col items-center z-1">
        <Image className="mr-auto w-10 h-10 cursor-pointer" width={40} height={40} src={recvCryptoImg} alt="" />

        <div className="text-black font-[600] mt-2 mr-auto">
          <span className="text-color_text_middle font-normal mr-1">you</span>
          <span className="">received crypto</span>
        </div>
        <div className="flex flex-row items-center mt-1 text-color_text_middle text-sm text-center mb-4 mr-auto">
          <span className="text-color_text_middle font-normal mr-1">from</span>
          <div className="flex flex-row items-center text-sm bg-[#EA2EFE1A] p-[3px] rounded-full">
            <Image className="w-4.5 h-4.5 mr-2 rounded-full" width={18} height={18} src={receivedCrypto.fromImageUrl} alt="" />
            <span className="font-medium mr-1 text-black">{getFromTitle()}</span>
            <span className={`text-color_text_middle font-medium mr-2 ${receivedCrypto.source === 2 ? 'hidden' : ''} `}>{receivedCrypto.fromName}</span>
          </div>
        </div>

        <div className="w-full h-10.5 flex flex-row px-4 justify-between items-center border border-[#0000000F] rounded-lg">
          <div className="text-sm">SOL</div>
          <div className="font-bold text-black">{receivedCrypto.needAmount} {receivedCrypto.symbol}</div>
        </div>

        <div className={`mt-4 mr-auto text-black text-sm ${!receivedCrypto.newUser ? 'hidden' : ''}`}>
          <div>ZAI <span className="text-color_text_middle">created crypto</span>  wallet <span className="text-color_text_middle">for your</span> </div>
          <div className="flex flex-row items-center h-full"><Image className="w-15 mr-2 h-15" width={60} height={60} src={shareTiktokImg} alt="" />username</div>
        </div>
      </div>

      <div className="h-[1px] w-full mt-3 mb-4 bg-[#F4F4F5]"></div>

      <div className="px-4 w-full flex flex-col items-center">
        <div className="bg-black border rounded-full w-full flex justify-center items-center py-2.5 cursor-pointer mb-4 hover:bg-[#00000080]" onClick={() => handleContiune()}>
          <span className="text-white text-14px font-[600]">Contiune</span>
        </div>
      </div>
    </DialogTemplate>
  );
}

export default LoginShareDialog;