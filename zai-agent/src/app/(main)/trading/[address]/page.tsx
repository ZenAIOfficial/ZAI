'use client'
import dynamic from "next/dynamic";

const TradingDetailComp = dynamic(() => import("@/components/TradingDetail"), {
  ssr: false,
});

export default function Trading() {
  return (
    <TradingDetailComp />
  );
}
