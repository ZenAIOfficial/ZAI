'use client'
import dynamic from "next/dynamic";
import { useEffect } from "react";

const ClientComponent = dynamic(() => import("@/components/Home"), {
  ssr: false,
});

export default function Home() {
  useEffect(() => {
    console.log(`Build: ${process.env.APP_VERSION}(${process.env.APP_BUILD_TIME}) ${process.env.NODE_ENV}`)
  });
  return (
    <ClientComponent />
  );
}
