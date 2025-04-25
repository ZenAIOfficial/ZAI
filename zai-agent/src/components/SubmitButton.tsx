import React from 'react';
import Image from "next/image";
import sendIcon from "@/assets/ic_send.svg";

interface SubmitButtonProps {
    loading: boolean;
    disabled: boolean;
    name?: string;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ loading, disabled, name }) => {

    return (
        <button
            name={name}
            type="submit"
            disabled={loading || disabled}
            className="mr-3 md:mr-4 rounded-full text-primary2 disabled:opacity-40 relative z-10"
        >
            <Image src={sendIcon as string} alt={''} />
        </button>
    );
};
