
import zaiGirlImg from "@/assets/ic_zai_girl.webp";
import loginXImg from "@/assets/ic_login_x.svg";
import loginTiktokImg from "@/assets/ic_login_tiktok.svg";
import { clearLoginType, clearNextWebAnalyzeShareInfoReq, getNextWebAnalyzeShareInfoReq, setLoginType, setWebAnalyzeShareInfoReq } from "@/store/userStore";
import DialogTemplate from "./DialogTemplate";
import Image from "next/image"
import TitleDialog from "./TitleDialog";
import { useDialog } from "@/hooks/useDialog";
import { select_wallet_login_way } from "@/utils/constants";

const LoginDialog = () => {
    const { showThirdLoginLoadingDialog, showSelectWalletDialog, hideDialog } = useDialog();

    const loginWithX = () => {
        const req = getNextWebAnalyzeShareInfoReq();
        if (req) {
            clearNextWebAnalyzeShareInfoReq();
            setWebAnalyzeShareInfoReq(req);
        }
        clearLoginType();
        setLoginType("3");
        showThirdLoginLoadingDialog("3");
    }

    const loginWithTiktok = () => {
        const req = getNextWebAnalyzeShareInfoReq();
        if (req) {
            clearNextWebAnalyzeShareInfoReq();
            setWebAnalyzeShareInfoReq(req);
        }
        clearLoginType();
        setLoginType("4");
        showThirdLoginLoadingDialog("4");
    }

  const toPrivacyPolicy = () => {
    window.open(`${process.env.APP_HOST}privacy-policy.html`);
  }
  const toTermsOfService = () => {
    window.open(`${process.env.APP_HOST}terms-of-service.html`);
  }

    const loginWithWallet = () => {
        const req = getNextWebAnalyzeShareInfoReq();
        if (req) {
            clearNextWebAnalyzeShareInfoReq();
        }
        clearLoginType();
        hideDialog();
        showSelectWalletDialog(select_wallet_login_way);
    }

    return (
        <DialogTemplate className={"px-5 bg-background rounded-[24px] pt-6 pb-10 w-[calc(100vw-60px)] md:w-[360px] flex flex-col items-center "}>
            <TitleDialog onCancel={() => hideDialog()} />

            <Image className="w-20 h-20 mt-6" src={zaiGirlImg} alt={""} />

            <span className="text-2xl text-black font-[600] mt-6">Welcome to ZAI</span>
            <span className="mt-4 text-color_text_middle text-sm mx-53px text-center mb-6 ">Unlock crypto freedom with AI</span>

            <div className="bg-black border rounded-[24px] w-full flex justify-center items-center py-2.5 cursor-pointer mb-4 hover:bg-[#00000080]" onClick={() => loginWithX()}>
                <Image className="w-5 h-5 mr-2.5" src={loginXImg} alt={""} />
                <span className="text-white text-14px font-[400]">Sign in with X</span>
            </div>

            <div className="bg-black border rounded-[24px] w-full hidden justify-center items-center py-2.5 cursor-pointer mb-4 hover:bg-[#00000080]" onClick={() => loginWithTiktok()}>
                <Image className="w-5 h-5 mr-2.5" src={loginTiktokImg} alt={""} />
                <span className="text-white text-14px font-[400]">Sign in with Tik Tok</span>
            </div>

            <div className="bg-background border-solid border border-b-normal rounded-[24px] w-full flex justify-center items-center py-2.5 mb-4 cursor-pointer hover:bg-b-hover" onClick={() => loginWithWallet()}>
                <span className="text-black text-14px font-[400]">Continue with a wallet</span>
            </div>

            <div className="h-7 text-[12px] text-color_text_middle flex flex-row items-center">
                <div className="underline cursor-pointer" onClick={toPrivacyPolicy}>Privacy Policy</div>
                <div className="ml-4 underline cursor-pointer" onClick={toTermsOfService}>Terms of Service</div>
            </div>
        </DialogTemplate>
    );
}

export default LoginDialog;