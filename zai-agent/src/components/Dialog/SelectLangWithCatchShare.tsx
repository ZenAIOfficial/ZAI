
import IcSelectLangEn from "@/assets/ic_select_lang_en.svg";
import IcSelectLangZh from "@/assets/ic_select_lang_zh.svg";
import IcSelectLangShare from "@/assets/ic_select_lang_share.svg";
import IcSelectLangSelected from "@/assets/ic_select_lang_selected.svg";
import DialogTemplate from "./DialogTemplate";
import Image from "next/image"
import { useDialog } from "@/hooks/useDialog";
import TitleDialog from "./TitleDialog";
import { useState } from "react";
import { getSelectLang, setSelectLang } from "@/store/userStore";

interface Props {
  onConfirm?: (lang: string) => void;
}

const SelectLangWithCatchShare: React.FC<Props> = ({ onConfirm }) => {
  const { hideDialog } = useDialog();

  const [lang, setLang] = useState(() => getSelectLang());

  const chooseLang = (lang: string) => {
    setLang(lang);
  }

  const handleShare = () => {
    setSelectLang(lang);
    hideDialog();
    if (onConfirm) {
      onConfirm(lang);
    }
  }

  return (
    <DialogTemplate className="bg-background rounded-[24px] pt-6 w-full md:w-[360px] flex flex-col items-center px-5 pb-6">
      
      <TitleDialog className="" onCancel={() => hideDialog()} />

      <Image className="-mt-6" src={IcSelectLangShare} alt="" width={40} height={40} />

      <div className="mt-3.5 text-black text-xl font-semibold">Select language</div>

      <div className="flex flex-row mt-6 gap-3">
        <div className="w-39 h-13 pl-4 pr-2.5 flex flex-row justify-start items-center border border-b-normal hover:bg-b-hover rounded-[14px] cursor-pointer" onClick={() => chooseLang("en")}>
          <Image src={IcSelectLangEn} alt="recvCryptoImg" width={24} height={24} />
          <div className="ml-4">English</div>
          {
            lang === "en" ? 
            <Image className="ml-auto" src={IcSelectLangSelected} alt="recvCryptoImg" width={18} height={18} /> : (<></>
            )
          }
        </div>
        <div className="w-39 h-13 pl-4 pr-2.5 flex flex-row justify-start items-center border border-b-normal hover:bg-b-hover rounded-[14px] cursor-pointer" onClick={() => chooseLang("zh")}>
          <Image src={IcSelectLangZh} alt="recvCryptoImg" width={24} height={24} />
          <div className="ml-4">简体中文</div>
          {
            lang === "zh" ? 
            <Image className="ml-auto" src={IcSelectLangSelected} alt="recvCryptoImg" width={18} height={18} /> : (<></>
            )
          }
        </div>
      </div>

      <div className="h-0.25 w-full bg-b-normal mt-4 opacity-30"></div>

      <div className="px-5 py-2.5 w-full text-center transfer_bg text-white font-semibold rounded-full mt-4 hover:opacity-80 " onClick={handleShare}>Share</div>
    </DialogTemplate>
  );
}

export default SelectLangWithCatchShare;