'use client'
import dynamic from "next/dynamic";

const RewardsComp = dynamic(() => import("@/components/Rewards"), {
  ssr: false,
});

export default function Rewards() {
  return (
    <RewardsComp />
  );
}
