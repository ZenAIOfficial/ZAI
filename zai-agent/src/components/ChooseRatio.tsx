import React, {useEffect, useRef, useState} from "react";

interface Props {
    type: number;
    callback: (data: number) => void;
}

const ChooseRatio: React.FC<Props> = ({type, callback}) => {

    interface RationInfo {
        name: string;
        value: number;
    }

    const buyRationList = useRef([
        {name: "0.01", value: 0.01},
        {name: "0.1", value: 0.1},
        {name: "0.5", value: 0.5},
        {name: "1", value: 1},
    ])

    const rationList = useRef([
        {name: "25%", value: 0.25},
        {name: "50%", value: 0.5},
        {name: "75%", value: 0.75},
        {name: "100%", value: 1},
    ])

    const [currentList, setCurrentList] = useState<RationInfo[]>([]);

    const changeRatio = (value: number) => {
        callback(value);
    }

    useEffect(() => {
        if (type === 0) {
            setCurrentList(buyRationList.current);
        } else {
            setCurrentList(rationList.current)
        }

    }, [type]);

    return (
        <div className="w-full grid grid-cols-4 gap-1.5">
            {
                currentList.map((item) => (
                    <div className="flex h-10 md:h-7 items-center justify-center bg-[#F4F4F5] rounded-[20px] md:bg-transparent md:border md:border-[#E4E4E7] md:rounded-lg text-[18px] md:text-[15px]
                        text-[#18181B] font-medium hover:bg-[#F4F4F5] cursor-pointer active:scale-80 md:active:scale-100" key={item.name} onClick={() => changeRatio(item.value)}>
                        <span>{item.name}</span>
                    </div>
                ))
            }
        </div>
    )
}

export default ChooseRatio;