'use client'
import dynamic from "next/dynamic";

const ClientComponent = dynamic(() => import("@/components/Home"), {
    ssr: false,
});

export default function Chat() {
    return (<ClientComponent />
    );
}
