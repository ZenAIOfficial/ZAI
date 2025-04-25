/* eslint-disable @typescript-eslint/no-explicit-any */
import WalletContext from "@/components/Context/WalletContext";
import CustomToast from "@/components/CustomToast";
import dynamic from "next/dynamic";
import UserInit from "@/components/UserInit";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZAI Agent",
  description: "Discover ZAI at Zencoin.ai: A decentralized AI Agent Swarm transforming crypto trading with 15M+ users, on-chain analytics, and dynamic learning. Join now!",
  keywords: "ZAI, Zen Agent, Zencoin, Zen AI Agent, decentralized AI framework, crypto trading, collaborative AI network, multimodal data integration, blockchain analytics",
  twitter: {
    title: "ZAIAgents",
    description: "Your MCP-Driven Omnichain DeFAI Hub, Amplified by Social Networks.",
    card: "summary",
    images: `${process.env.APP_CHAT_AI}logo192.png`
  }
};

const MainLayout = dynamic(() => import("@/components/MainLayout"), {
  ssr: false,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <WalletContext>
      <MainLayout>
          <UserInit />
          {children}
      </MainLayout>
      <CustomToast/>
    </WalletContext>
  );
}
