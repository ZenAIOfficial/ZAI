import { analyzeImageUrl } from "@/utils/constants";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

export function generateMetadata({ params }: { params: { address: string, shareId: string } }): Metadata {
    const { address } = params;

    return {
        title: "Explore ZAI: The Zen AI Agent Swarm Redefining Crypto Trading at Zencoin.ai",
        description: "Discover ZAI at Zencoin.ai: A decentralized AI Agent Swarm transforming crypto trading with 15M+ users, on-chain analytics, and dynamic learning. Join now!",
        keywords: "ZAI, Zen Agent, Zencoin, Zen AI Agent, decentralized AI framework, crypto trading, collaborative AI network, multimodal data integration, blockchain analytics",
        twitter: {
          title: "ZAI",
          description: "Unlock crypto freedom with AI",
          card: "summary_large_image",
          images: `${analyzeImageUrl}/${address}.png`
        }
    };
}
const ClientComponent = dynamic(() => import("@/components/Whale"), {
  ssr: false,
});

export default function Whale() {
    return (
        <ClientComponent></ClientComponent>
    )
}