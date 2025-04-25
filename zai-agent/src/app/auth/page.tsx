'use client'
import { turnstileVerifier } from '@/apis/user';
import { log } from '@/utils/utils';
import { Turnstile } from '@marsidev/react-turnstile'
import girlIcon from "@/assets/ic_auth_logo.webp";
import Image from 'next/image';

export default function Auth() {

  const onVerify = async (token: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirectUrl');
    log("onVerify", token, redirectUrl);
    if (token) {
      const res = await turnstileVerifier(token);
      log("onVerify", res, typeof res);
      if (res) {
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          window.location.href = "/";
        }
      }
    }
  };
  const onWidgetLoad = (widgetID: string) => {
    log("onWidgetLoad", widgetID)
  };

  return (
    <div className="bg-white w-full h-screen flex">
      <div className='w-240 flex flex-col items-start mt-30 px-6 ml-auto mr-auto'>
        <div className='flex flex-row items-center'>
          <Image className="w-10 h-10 mr-2.5" width={40} height={40} src={girlIcon} alt={''} />
          <span className='text-[42px]  font-bold'>ZAI</span>
        </div>
        <div className='text-xl text-[#181818] mt-2'>Please complete the following steps to verify you are human.</div>
        <div className='h-30 mt-6'>
          <Turnstile siteKey={process.env.APP_TURNSTILE_SITEKEY ?? ''} onSuccess={onVerify} onWidgetLoad={onWidgetLoad} />
        </div>
        <div className='text-xl text-[#181818]'>Before proceeding, ZAI needs to check the security of your connection.</div>
      </div>
    </div>
  )
}