// import dialogCloseImg from "@/assets/ic_dialog_close.svg";
import receiveFundsImg from "@/assets/ic_receive_funds.svg";
import transferFromWalletImg from "@/assets/ic_transfer_from_wallet.svg";
import solImg from "@/assets/ic_solana_logo.svg";
import bscImg from "@/assets/ic_bsc_logo.svg";
import DialogTemplate from "./DialogTemplate";
import Image from "next/image"
import { useDialog } from "@/hooks/useDialog";
import TitleDialog from "./TitleDialog";
import { select_wallet_deposit_way } from "@/utils/constants";
import { topupSignal } from "@/apis/user";

type Props = object
const AddFundsDialog: React.FC<Props> = () => {
    const { showDepositCodeDialog, showSelectWalletDialog, hideDialog } = useDialog();

    const openAddFundsCodeDialog = () => {
        topupSignal();
        showDepositCodeDialog();
    }

    const openAddFundsWalletDialog = () => {
        showSelectWalletDialog(select_wallet_deposit_way);
    }

    return (
        <DialogTemplate className="bg-white rounded-[24px] pt-6 pb-10 w-full md:w-[360px] flex flex-col items-center px-5">

            <TitleDialog className="mb-4" title={"Add funds to your\n ZAI wallet"} onCancel={() => hideDialog()}/>

            <div className="mt-2.5 flex flex-row items-center px-4 rounded-xl w-full h-[52px] border border-b-normal hover:bg-b-hover cursor-pointer" onClick={openAddFundsCodeDialog}>
                <Image className="w-6 h-6 mr-4" src={receiveFundsImg} alt={""} />
                <span>Receive funds</span>
                <div className="flex ml-auto">
                    <div className="bg-white rounded-full p-1 z-2">
                        <Image className="w-5 h-5" src={bscImg} alt={""} />
                    </div>
                    <div className="bg-white rounded-full p-1 ml-[-6px]">
                        <Image className="w-5 h-5" src={solImg} alt={""} />
                    </div>
                </div>
            </div>

            <div className="mt-2 flex flex-row items-center px-4 rounded-xl w-full h-[52px] border border-b-normal hover:bg-b-hover cursor-pointer" onClick={openAddFundsWalletDialog}>
                <Image className="w-6 h-6 mr-4" src={transferFromWalletImg} alt={""} />
                <span>Transfer from wallet</span>
                <div className="flex ml-auto">
                    <div className="bg-white rounded-full p-1 ml-[-6px]">
                        <Image className="w-5 h-5" src={solImg} alt={""} />
                    </div>
                </div>
            </div>

        </DialogTemplate>
    );
};

export default AddFundsDialog;