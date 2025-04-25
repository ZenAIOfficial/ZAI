/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { User } from "@/apis/user";
import { useUserInfoChangeCallback } from "@/hooks/useUser";
import { refreshUserInfo } from "@/store/userStore";
import { cancelHandleUserToken, handleUserToken } from "@/store/userTokenStore";

export default function UserInit() {

  useUserInfoChangeCallback((newVal: User | null | undefined, oldVal: User | null | undefined) => {
    if (newVal) {
      console.log('UserInfo login:', newVal);
      refreshUserInfo();
      handleUserToken();
    } else {
      console.log('UserInfo logout:', oldVal);
      cancelHandleUserToken();
    }
  });
  return (
    <>
    </>

  );
}
