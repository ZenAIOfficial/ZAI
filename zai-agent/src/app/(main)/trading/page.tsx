'use client'
import dynamic from "next/dynamic";

const TradingComp = dynamic(() => import("@/components/Trading"), {
  ssr: false,
});

export default function Trading() {
  return (
    <TradingComp />
  );
}
