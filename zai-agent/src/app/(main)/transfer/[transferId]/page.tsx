'use client'
import { setTransferCode } from "@/store/userStore";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";


export default function Transfer() {
    const navigate = useRouter();
    const { transferId } = useParams();

    useEffect(() => {
        if (transferId) {
            setTransferCode(transferId as string)
        }
        setTimeout(() => {
            navigate.push("/");
        }, 0);
    })
    return (
        <></>
    )
}