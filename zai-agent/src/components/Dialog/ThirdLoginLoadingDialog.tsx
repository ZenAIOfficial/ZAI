import { authTiktok, authTwitter, checkReceivedCrypto } from "@/apis/user";
import loginLoadingImg from "@/assets/ic_login_loading.webp";
import { clearLoginType, clearWebAnalyzeShareInfoReq, getUserLoginRedirectUrl, getWebAnalyzeShareInfoReq, loginTiktokToService, loginXToService, setUserLoginRedirectUrl } from "@/store/userStore";
import { useDialog } from "@/hooks/useDialog";
import {  XImg, tiktokImg, log } from "@/utils/utils";
import { useEffect, useState } from "react";
import DialogTemplate from "./DialogTemplate";
import TitleDialog from "./TitleDialog";
import Image from "next/image";
import {usePathname, useRouter, useSearchParams} from "next/navigation";

interface Props {
    loginType: string;
    state?: string | null;
    code?: string | null;
    error?: string | null;
}

const ThirdLoginLoadingDialog: React.FC<Props> = ({ loginType, state, code, error }) => {
    const router = useRouter();
    const { showLoginShareDialog, hideDialog } = useDialog();
    const [flag, setFlag] = useState(false);
    const [status, setStatus] = useState("0"); // 0: init 1: success 2: failure
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const REF_KEY = "ref_key";

    useEffect(()=>{
        setFlag(true);
    }, []);

    useEffect(() => {
        if (flag) {
            console.log("ThirdLoginLoadingDialog start...." , loginType);
            if (loginType === "4") {
                if (state) {
                    if (code) {
                        handleCallback();
                        return;
                    }
                    if (error) {
                        setStatus("2");
                    }
                    return;
                }
                setLocalRef();
                authTiktok().then((res) => {
                    log("authTiktok:", res.authorizeUrl);
                    setUserLoginRedirectUrl(pathname);
                    window.location.href = res.authorizeUrl;
                });
            } else {
                if (state) {
                    if (code) {
                        handleCallback();
                        return;
                    }
                    if (error) {
                        setStatus("2");
                    }
                    return;
                }
                setLocalRef();
                authTwitter().then((res) => {
                    log("authTwitter:", res.authorizeUrl);
                    try {
                        setUserLoginRedirectUrl(pathname);
                        window.location.href = res.authorizeUrl;
                      } catch (error) {
                        console.error('auth twitter error:', error);
                      }
                });
            }
        }
    }, [flag]);

    const setLocalRef = () => {
        window.localStorage.removeItem(REF_KEY);
        const ref = searchParams.get("ref");
        if (ref) {
            window.localStorage.setItem(REF_KEY, ref);
        }
    }

    useEffect(() => {
        getSignInTitle();
        getSignInDesc();
    }, [status]);

    const handleCallback = () => {
        handleLogin();
    };

    const handleLogin = async () => {
        console.log("handleLogin");
        if (!state || !code) return;
        try {
            if (loginType === "4") {
                await handleTiktok();
            } else {
                await handleTwitter();
            }
        } catch (error) {
            console.error('sign error:', error);
            setStatus("2");
        }
    }

    const handleTiktok = async () => {
        if (!state || !code) return;
        const ref = window.localStorage.getItem(REF_KEY);
        await loginTiktokToService(state, code, ref);
        setStatus("1");
        
        const res = await checkReceivedCrypto("");
        clearLoginType();
        hideDialog();
        if (res) {
            showLoginShareDialog(res, true);
        } else {
            const req = getWebAnalyzeShareInfoReq();
            if (req) {
                clearWebAnalyzeShareInfoReq();
                router.push(`/whale/${req.address}/${req.shareId}`);
            } else {
                const redirectUrl = getUserLoginRedirectUrl();
                router.push(redirectUrl);
            }
        }
    }

    const handleTwitter = async () => {
        if (!state || !code) return;
        const ref = window.localStorage.getItem(REF_KEY);
        await loginXToService(state, code, ref);
        setStatus("1");
        setTimeout(() => {
            hideDialog();
            const req = getWebAnalyzeShareInfoReq();
            if (req) {
                clearWebAnalyzeShareInfoReq();
                router.push(`/whale/${req.address}/${req.shareId}`);
            } else {
                const redirectUrl = getUserLoginRedirectUrl();
                router.push(redirectUrl);
            }
        }, 1500);
    }

    const closeDialog = (toRootPath: boolean = false) => {
        setFlag(false);
        setStatus("0");
        hideDialog();
        if (toRootPath) {
            router.push("/");
        }
    };

    const handleRetry = () => {
        closeDialog();
        if (loginType === "4") {
            authTiktok().then((res) => {
                log("authTiktok:", res.authorizeUrl);
                window.location.href = res.authorizeUrl;
            });
        } else {
            authTwitter().then((res) => {
                log("authTwitter:", res.authorizeUrl);
                window.location.href = res.authorizeUrl;
            });
        }
    }

    const getPlatformImage = () => {
        if (loginType === "4") {
            return tiktokImg;
        }
        return XImg;
    }

    const getSignInTitle = () => {
        if (status === "0") {
            return "Unlocking Crypto Freedom with AI for Normies";
        }
        if (status === "1") {
            if (loginType === "4") {
                return "Successfully connected with Tiktok";
            }
            return "Successfully connected with X";
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

            <TitleDialog className="" onCancel={() => closeDialog(true)} />

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

export default ThirdLoginLoadingDialog;