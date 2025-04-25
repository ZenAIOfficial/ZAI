import { useEffect, useRef, useState } from "react";
import DialogTemplate from "./DialogTemplate";
import sol from "@/assets/ic_wallet_sol.webp";
import usdcImg from "@/assets/ic_wallet_usdc.svg";
import downArrowImg from "@/assets/ic_wallet_down_arrow.svg";
import TitleDialog from "./TitleDialog";
import { useDialog } from "@/hooks/useDialog";
import { useTranslation } from "react-i18next";
import { select_wallet_deposit_way } from "@/utils/constants";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletName } from "@solana/wallet-adapter-base";
import { useCyptoRateStore } from "@/store/cryptoRateStore";
import { useUserStore } from "@/store/userStore";
import { checkTransStatus, createTransfer, sendTrans } from "@/apis/transaction";
import { walletSignTransaction } from "@/utils/walletUtil";
import { sleep } from "@/utils/utils";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import Image from "next/image"
import { showToast } from "@/store/toastStore";
import { topupSignal } from "@/apis/user";

interface Props {
    walletName: string;
}

const DepositWalletAmountDialog: React.FC<Props> = ({ walletName }) => {
    const { wallet, connected, select, signTransaction, publicKey } = useWallet();
    const { t } = useTranslation();
    const { showSelectWalletDialog, hideDialog } = useDialog();
    const [canConnect, setCanConnect] = useState(false);
    const [amount, setAmount] = useState("1");
    const solPrice = useCyptoRateStore((state) => state.sol);
    const [usdc, setUsdc] = useState(solPrice * 1);
    const userInfo = useUserStore((state) => state.userInfo);
    const [isLoading, setIsLoading] = useState(false);
    const [depositWay, setDepositWay] = useState("SOL");

    const menuRef = useRef<Menu>(null);

    const items: MenuItem[] = [
        {
            command: () => {
                setDepositWay("SOL");
            },
            template: (item, options) => {
                return (
                    <div className={`flex flex-row items-center ml-2 mt-0.5 h-7.5 px-2 ${depositWay === 'SOL' ? 'bg-[#F4F4F5]' : ''} rounded-lg mr-2`} onClick={(e) => options.onClick(e)}>
                        <Image className="w-5 h-5 rounded-full" width={20} height={20} src={sol} alt="" />
                        <span className="text-black text-sm ml-1.5">SOL</span>
                    </div>
                );
            },
        },
        {
            command: () => {
                setDepositWay("USDC(Solana)");
            },
            template: (item, options) => {
                return (
                    <div className={`flex flex-row items-center ml-2 mt-0.5 h-7.5 px-2 ${depositWay !== 'SOL' ? 'bg-[#F4F4F5]' : ''} rounded-lg mr-2`} onClick={(e) => options.onClick(e)}>
                        <Image className="w-5 h-5 rounded-full" width={20} height={20} src={usdcImg} alt="" />
                        <span className="text-black text-sm ml-1.5">USDC(Solana)</span>
                    </div>
                );
            },
        },
    ];

    useEffect(() => {
        if (solPrice && amount) {
            if (depositWay === "SOL") {
                setUsdc(solPrice * (amount as unknown as number));
            } else {
                setUsdc((amount as unknown as number));
            }
        }
    }, [solPrice, amount, depositWay]);
    const handleBack = () => {
        hideDialog();
        showSelectWalletDialog(select_wallet_deposit_way);
    }

    const handleContiune = async () => {
        const value = amount as unknown as number
        if (value <= 0) {
            return;
        }
        connectWallet();
    }
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(event.target.value);
    };

    const connectWallet = () => {
        if (wallet) {
            if (connected && wallet.adapter.name === walletName) {
                handleCallback();
                return;
            }
        }
        setCanConnect(true);
        select(walletName as WalletName);
        return;
    };

    const handleCallback = () => {
        handleTransfer();
    };

    const handleTransfer = async () => {
        console.log("handleTransfer");
        if (!publicKey || !userInfo?.address) return;
        setIsLoading(true);
        try {
            const transferResp = await createTransfer({
                fromAddress: publicKey.toBase58(),
                realAmount: amount as unknown as number,
                coinType: depositWay === "SOL" ? 0 : 1,
            });
            const serializedTransaction = await walletSignTransaction(transferResp.transaction, signTransaction);
            const res = await sendTrans({ transaction: serializedTransaction });
            await checkTransferStatus(res.result.transaction);
        } catch (err) {
            toTransferFailure();
        } finally {
            setIsLoading(false);
        }
    }

    const checkTransferStatus = async (transaction: string) => {
        topupSignal();
        const status = await checkStatus(transaction)
        if (status === "success") {
            toTransferSuccess();
        } else {
            toTransferFailure();
        }
    }

    const checkStatus = async (transaction: string) => {
        let num = 0;
        while (num < 15) {
            try {
                await sleep(5000);
                const res = await checkTransStatus({
                    transaction,
                });
                console.log(res);
                if (res.confirmationStatus === "confirmed") {
                    return "success";
                }
            } catch (e) {
                console.log(e);
            } finally {
                num++;
            }
        }

        return "failure";
    };

    const toTransferSuccess = () => {
        console.log("toTransferSuccess");
        showToast("success", "Deposit Success, please wait for a moment!", 2000);
        hideDialog();
    };

    const toTransferFailure = () => {
        console.log("toTransferFailure");
    };

    function rightMenuClick(e: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>): void {
        menuRef.current?.toggle(e);
    }

    return (
        <DialogTemplate className="bg-background rounded-[24px] pt-6 w-full md:w-[360px] flex flex-col items-center px-5 pb-4">
            <TitleDialog title={t("home.receive_sol_with_wallet_amount_title")} onBack={handleBack} onCancel={hideDialog} />

            <div className="mt-5 text-black font-medium self-start">Amount</div>


            <div className="flex flex-row items-center w-full mt-3 px-4 rounded-lg border border-b-normal h-[42px]">
                <input className="flex-1 w-full text-xl font-medium text-black mr-2" type="number" value={amount} onChange={handleInputChange} />
                <div className="ml-auto flex flex-row items-center">
                    <div className="text-sm text-color_text_middle">{depositWay}</div>
                    <Image className="w-4 h-4 rounded-full cursor-pointer" width={16} height={16} src={downArrowImg} alt="" onClick={rightMenuClick} />
                </div>
            </div>

            <div className="mt-3 text-sm text-color_text_middle self-start">{`US\$${usdc} USD`}</div>

            {

                isLoading ? (<div
                    className={`rounded-full w-full h-[38px] mt-4 flex items-center justify-center text-3.5 bg-[#00000099] text-white cursor-pointer "}`}>
                    Signing<i className="pi pi-spin pi-spinner ml-2 text-white" style={{ fontSize: '1rem' }}></i>
                </div>) : (
                    <div
                        className={`rounded-full w-full h-[38px] mt-4 flex items-center justify-center text-3.5 transfer_bg text-white hover:opacity-70 cursor-pointer"}`} onClick={handleContiune}>
                        Contiune
                    </div>
                )
            }

            <div><Menu className="p-menu-select-chain mt-1.5" ref={menuRef} model={items} popup popupAlignment="right" /></div>

        </DialogTemplate>
    );
};

export default DepositWalletAmountDialog;