import React from "react";
import delImg from "@/assets/ic_del.svg";
import Image from "next/image";

interface Props {
    onInputChange: (input: string) => void;
}

const TransactionKeyboard: React.FC<Props> = ({onInputChange}) => {

    const inputList = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "-1"];

    const onInputItemClick = (item: string) => {
        onInputChange(item)
    }

    return (
        <div className="w-full grid grid-cols-3 rounded-[20px]">
            {
                inputList.map((item, i) => (
                    <div className="flex items-center justify-center h-[9.5vh]" key={i} onClick={() => onInputItemClick(item)}>
                        {
                            item !== "-1" ?
                                <span className="text-[32px] text-[#13122A]">{item}</span> : <Image className="w-7 h-5" src={delImg} alt={""}/>
                        }
                    </div>
                ))
            }
        </div>
    )
}

export default TransactionKeyboard;