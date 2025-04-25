'use client'
import React, {useEffect} from "react";
import {TrendInfo} from "@/apis/trading";
import {useTranslation} from "react-i18next";
import {formatDateTime, formatPrice, translateAmount, translateNumber} from "@/utils/utils";

interface Props {
    data: TrendInfo;
}

interface DataInfo {
    name: string;
    value: string;
}

const TokenDataComponent: React.FC<Props> = ({data}) => {
    const { t } = useTranslation();

    const [dataList, setDataList] = React.useState<DataInfo[]>([]);

    useEffect(() => {
        const list: DataInfo[] = []
        if (data) {
            if (data.liquidity) {
                list.push({name: "Liquidity", value: translateAmount(Number(formatPrice(data.liquidity, 2)))})
            }
            // if (data.mktCap) {
            //     list.push({name: "Mkt Cap", value: translateAmount(Number(formatPrice(data.mktCap, 2)))})
            // }
            if (data.price24hChange) {
                let chg;
                if (data.price24hChange > 0) {
                    chg = `+${translateNumber(Number(formatPrice(Math.abs(data.price24hChange), 2)))}%`;
                } else {
                    chg = `-${translateNumber(Number(formatPrice(Math.abs(data.price24hChange), 2)))}%`;
                }
                list.push({name: "24h Chg", value: chg})
            }
            if (data.holders) {
                list.push({name: "Holders", value: translateAmount(Number(formatPrice(data.holders, 2)))})
            }
            if (data.deployTime) {
                list.push({name: "Created", value: formatDateTime(data.deployTime)})
            }
            if (data.volumePast24h) {
                list.push({name: "24h vol", value: `$${translateAmount(data.volumePast24h)}`})
            }
            setDataList(list);
        }
    }, [data]);

    return (
        <div className="flex flex-col w-full border border-[#0000000F] rounded-2xl">
            <div className="bg-[#F7F3FF] px-3 w-full h-11 rounded-t-2xl text-base text-black font-semibold flex items-center">
                <span>{t("trading.token_data")}</span>
            </div>

            <div className="grid grid-cols-4 px-4 gap-y-3.5 pt-3.5 pb-5">
                {
                    dataList.map((item, index) => (
                        <div className={`flex flex-col ${dataList.length % 4 > 0 && index < 4 ? "border-b border-[#E4E4E7] pb-3.5" : ""}`} key={item.name}>
                            <span className="text-[#666666] text-xs">{item.name}</span>
                            <span className="text-black text-sm font-semibold mt-2">{item.value}</span>
                        </div>
                    ))
                }
            </div>

        </div>
    )
};

export default TokenDataComponent;