import { User } from "@/apis/user";
import { cancelHandleCryptoRate, handleCryptoRate } from "@/store/cryptoRateStore";
import { useUserStore } from "@/store/userStore";
import { useEffect, useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useUserInfoChangeCallback(callback: ((newVal: User | null | undefined, oldVal: User | null | undefined) => void)) {
  const prevUserInfoRef = useRef<User | null | undefined>(null);
  const userInfo = useUserStore((state) => state.userInfo);

  useEffect(() => {
    handleCryptoRate();
    return () => {
      cancelHandleCryptoRate();
    }
  }, []);
  
  useEffect(() => {
    const prevUserInfo = prevUserInfoRef.current;

    if (!prevUserInfo && userInfo) {
      callback(userInfo, null);
    }
    else if (prevUserInfo && !userInfo) {
      callback(null, prevUserInfo);
    }

    prevUserInfoRef.current = userInfo;
  }, [userInfo, callback]);
}