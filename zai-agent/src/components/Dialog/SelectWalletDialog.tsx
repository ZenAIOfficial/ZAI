
import { okxImg, phantomImg, solflareImg } from "@/utils/utils";
import TitleDialog from "./TitleDialog";
import DialogTemplate from "./DialogTemplate";
import Image from "next/image";
import { useDialog } from "@/hooks/useDialog";
import { LAST_LOGIN_WALLET_PLATFORM, select_wallet_deposit_way } from "@/utils/constants";

interface Props {
    way: string; // login,deposit
}
const SelectWalletDialog: React.FC<Props> = ({ way }) => {
    const { showLoginDialog, showLoginLoadingDialog, showAddFundsDialog, showDepositWalletAmountDialog, hideDialog } = useDialog();
    const recentWalletName = localStorage.getItem(LAST_LOGIN_WALLET_PLATFORM) || "";
    
    // const { showLoginDialog } = useDialog();
    const walletList = [
        { name: "Phantom", id: 1, img: phantomImg, downloadUrl: "https://phantom.com/download", walletName: "Phantom" },
        { name: "OKX", id: 2, img: okxImg, downloadUrl: "https://www.okx.com/download", walletName: "OKX Wallet" },
        { name: "Solflare", id: 3, img: solflareImg, downloadUrl: "https://solflare.com", walletName: "Solflare" },
    ];

    const newWalletList = [
        ...walletList.filter((res) => recentWalletName === res.walletName),
        ...walletList.filter((res) => recentWalletName !== res.walletName),
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setVisible = async (item: any) => {
        hideDialog();
        if (way === select_wallet_deposit_way) {
            showDepositWalletAmountDialog(item.walletName);
        } else {
            showLoginLoadingDialog(item.walletName);
        }
    }

    const handleBack = () => {
        hideDialog();
        if (way === select_wallet_deposit_way) {
            showAddFundsDialog();
        } else {
            showLoginDialog();
        }
    }

    return (
        <DialogTemplate className={"px-5 bg-background rounded-[24px] pt-6 pb-10 w-full md:w-[360px] flex flex-col items-center "}>
            <TitleDialog className="mb-4" title={"Connect wallet"} onBack={() => handleBack()} onCancel={() => hideDialog()}/>
            {
                newWalletList.map((item, index) => {
                    return <div
                        className="flex items-center w-full px-4 py-1.5 cursor-pointer border border-b-normal mt-2.5 sm:mt-3 mx-6 rounded-[18px] hover:bg-b-hover"
                        key={index}
                        onClick={() => setVisible(item)}>
                        <Image className="w-10" width={40} height={40} src={item.img} alt={""}/>
                        <span className="text-primary2 ml-4 font-600 text-sm sm:text-base">{`${item.name}`}</span>
                        {
                            recentWalletName === item.walletName ? <div className="flex-1 flex flex-row justify-end"><span className="text-sm bg-[#0000000F] rounded px-1.5 py-0.5">Recent</span></div> : <></>
                        }
                        
                    </div>
                })
            }
        </DialogTemplate>
    );
};

export default SelectWalletDialog;