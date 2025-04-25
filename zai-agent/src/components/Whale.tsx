'use client'

import { setWebAnalyzeShareInfoReq } from "@/store/userStore";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";


export default function Whale() {
  const { address, shareId } = useParams();
  const navigate = useRouter();
  useEffect(() => {
      console.log('Whale', address, shareId);
      if (address && shareId) {
          setWebAnalyzeShareInfoReq({
              address: address as string,
              shareId: shareId as string
          });
          setTimeout(() => {
              navigate.push("/");
          }, 0);
      }
  })
  return (
    <>
    </>

  );
}
