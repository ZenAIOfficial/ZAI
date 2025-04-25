import { getSignNonce } from "@/apis/user";
import loginLoadingImg from "@/assets/ic_login_loading.webp";
import { loginToService } from "@/store/userStore";
import { useDialog } from "@/hooks/useDialog";
import { LAST_LOGIN_WALLET_PLATFORM, select_wallet_login_way } from "@/utils/constants";
import { phantomImg, okxImg, solflareImg, log } from "@/utils/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import DialogTemplate from "./DialogTemplate";
import TitleDialog from "./TitleDialog";
import Image from "next/image";
import { WalletName } from "@solana/wallet-adapter-base";
import { signMessageWithWallet } from "@/utils/walletUtil";
import { useSearchParams } from "next/navigation";

interface Props {
    walletName: string;
}

const LoginLoadingDialog: React.FC<Props> = ({ walletName }) => {
    const { wallet, disconnecting, connecting, connected, select, signMessage, publicKey } = useWallet();
    const { showSelectWalletDialog, hideDialog } = useDialog();
    const [flag, setFlag] = useState(false);
    const [status, setStatus] = useState("0"); // 0: init 1: success 2: failure
    const [canConnect, setCanConnect] = useState(false);
    const searchParams = useSearchParams();

    useEffect(()=>{
        setFlag(true);
    }, []);

    useEffect(() => {
        if (flag) {
            log("LoginLoadingDialog start...." , wallet?.adapter.name, walletName);
            connectWallet();
        }
    }, [flag])

    useEffect(() => {
        getSignInTitle();
        getSignInDesc();
    }, [status]);

    useEffect(() => {
        log("LoginLoadingDialog[useEffect]", wallet?.adapter.name, connecting, disconnecting, connected);
        if (canConnect) {
            if (wallet) {
                if (connected && wallet.adapter.name === walletName) {
                    setCanConnect(false);
                    handleCallback();
                    return;
                }
            } else {
                if (!connected && !connecting) {
                    setCanConnect(false);
                    setStatus("2");
                }
            }
        }
        return () => {
            // console.log("SelectWalletDialog[useEffect:cancel]", disconnecting);
        };
    }, [connecting, disconnecting, connected]);


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
        handleLogin();

    };

    const handleLogin = async () => {
        console.log("handleLogin");
        if (!publicKey) return;
        try {
            const res = await getSignNonce({ walletAddress: publicKey.toBase58() });
            if (res) {
                const signedMessage = await signMessageWithWallet(signMessage, res.uId);
                console.log("signed message:", signedMessage);
                const ref = searchParams.get("ref");
                await loginToService(publicKey.toBase58(), signedMessage, walletName, ref);
            }

            localStorage.setItem(LAST_LOGIN_WALLET_PLATFORM, walletName);
            setStatus("1");
            setTimeout(() => {
                closeDialog()
            }, 2000);
        } catch (error) {
            console.error('sign error:', error);
            setStatus("2");
        }
    }

    const closeDialog = () => {
        setFlag(false);
        setStatus("0");
        hideDialog();
    };

    const handleRetry = () => {
        closeDialog();
        showSelectWalletDialog(select_wallet_login_way);
    }

    const getPlatformImage = () => {
        if (walletName === "Phantom") {
            return phantomImg;
        } else if (walletName === "OKX Wallet") {
            return okxImg;
        } else if (walletName === "Solflare") {
            return solflareImg;
        }

        // if (getLoginType() === "4") {
        //     return tiktokImg;
        // }
        return phantomImg;
    }

    const getSignInTitle = () => {
        if (status === "0") {
            return "Unlocking Crypto Freedom with AI for Normies";
        }
        if (status === "1") {
            return "Successfully connected with " + walletName;
        }
        return "Sign in Failed.";
    }
    const getSignInDesc = () => {
        if (status === "0") {
            return "";
        }
        if (status === "1") {
            return "You're good to go!";
        }
        return "Something went wrong. Please try again.";
    }

    const getSignInBg = () => {
        if (status === "0") {
            return (<Image className={`circle-progress w-[92px] h-[92px]`}  width={92} height={92} src={loginLoadingImg} alt="" />);
        }
        if (status === "1") {
            return (<div className={`rounded-full border-4 border-[#29CA53] w-[92px] h-[92px]`}/>);
        }
        return (<div className={`rounded-full border-4 border-[#F93A37] w-[92px] h-[92px]`}/>);
    }

    return (
        <DialogTemplate className="bg-background rounded-[24px] pt-6 w-full md:w-[360px] flex flex-col items-center px-5 pb-4">

            <TitleDialog className="" onCancel={() => closeDialog()} />

            <div className="relative flex justify-center items-center w-[92px] h-[92px]">
                <div className="absolute">
                    <Image className="w-14 h-14" width={56} height={56} src={getPlatformImage()} alt="" />
                </div>
                {
                    getSignInBg()
                }
            </div>

            <span className="text-black font-[600] mt-6 text-center">{getSignInTitle()}</span>

            <span className="mt-1 text-color_text_middle text-sm text-center">{getSignInDesc()}</span>

            <div className={`rounded-full w-full h-[42px] mt-5 text-sm flex items-center justify-center bg-[#18181b] hover:opacity-80 cursor-pointer text-white ${status === "2" ? '' : 'hidden'}`} onClick={handleRetry}>
                Retry
            </div>
        </DialogTemplate>
    )
}

export default LoginLoadingDialog;