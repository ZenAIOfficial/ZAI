/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import {Toast, ToastMessage} from "primereact/toast";
import doneIcon from "@/assets/toast_done.png"
import failIcon from "@/assets/toast_fail.png"
import React, {useEffect, useRef} from "react";
import {useToastStore} from "@/store/toastStore";
import Image from "next/image"

type Props = object

const CustomToast: React.FC<Props> = () => {
    const toast = useRef<Toast>(null)
    const toastShowing = useToastStore(state => state.showing)
    const toastData = useToastStore(state => state.toast)

    function showToast(){
        if (toast.current) {
            toast.current.show({severity: toastData?.severity, detail: toastData?.detail, life: toastData?.life, closable: false,
                style:{
                    marginLeft: "15px",
                    marginRight: "15px",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    color: "white",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0px 2px 6px 0px rgba(0, 0, 0, 0.3)",
                    padding: "0 8px",
                    borderRadius: "16px",
                    border: 0,
                    lineHeight: "19px",
                    fontSize: "16px",
                },
                    content: (prop: any) => (
                    <div className="w-full flex flex-row items-center"><Image src={toastData?.severity === 'success' ? doneIcon : failIcon} width={18} height={18} alt=""/>
                        <div className="ml-2.5">{prop.message.detail}</div>
                    </div>
                )
            } as unknown as ToastMessage)
        }
    }

    useEffect(() => {
        if (toastShowing) {
            showToast()
            useToastStore.setState?.({showing: false})
        }
    }, [toastShowing]);
    return (
        <Toast ref={toast} position="top-center"/>
    );
}
export default CustomToast
