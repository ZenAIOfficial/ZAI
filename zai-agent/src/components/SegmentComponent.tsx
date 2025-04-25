'use client'

import React from "react";

export interface SegmentInfo {
    id: number;
    name: string;
    selected: boolean;
}

interface Props {
    list: SegmentInfo[];
    callback: (data: SegmentInfo) => void;
}

const SegmentComponent: React.FC<Props> = ({list, callback}) => {

    const [selectPos, setSelectPos] = React.useState(list.filter((it) => it.selected)[0].id);

    const changeSegment = (item: SegmentInfo) => {
        if (selectPos === item.id) return;
        setSelectPos(item.id)
        callback(item);
    };

    return (
        <div className="flex">
            <div className="flex bg-[#F7F3FF] rounded-lg p-[2px]">
                {
                    list.map((item) => (
                        <span className={`cursor-pointer text-sm px-1.5 md:px-2.5 py-1 ${selectPos === item.id ? 
                            "text-black bg-white rounded-md shadow-[0_3px_5px_0_rgba(0,0,0,0.1)]" : 
                            "text-[#666666]"}`} onClick={() => changeSegment(item)} key={item.id}>{item.name}</span>
                    ))
                }
            </div>
        </div>
    )
};

export default SegmentComponent;