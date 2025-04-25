'use client'
import { getTransactionHistory, UserTransferResponse } from "@/apis/user";
import UserTransferItem from "./UserTransferItem";
import {useEffect, useRef, useState} from "react";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "react-i18next";
import {formatTimestampToMouth2, getRealChain} from "@/utils/utils";

interface Props {
  network: string;
}

const UserTransferList: React.FC<Props> = ({network}) => {

  const [userTransferList, setUserTransferList] = useState<UserTransferResponse[] | null>(null);
  const [uniqueDays, setUniqueDays] = useState<number[] | null>(null);
  const [userTransferGroupMap, setUserTransferGroupMap] = useState<Partial<Record<number, UserTransferResponse[]>>>({});
  const [loadEnd, setLoadEnd] = useState(true);
  const { ref, inView } = useInView({ threshold: 0 });
  // const [pageNumber, setPageNumber] = useState(1);
  const pageNumberRef = useRef(1);
  const { t } = useTranslation();

  useEffect(() => {
    pageNumberRef.current = 1;
    console.log('UserTransferList', userTransferList);
    requestUserTransactionHistory();
  }, [network]);

  useEffect(() => {
    console.log('UserTransferList inView', inView);
    if (inView) {
      requestUserTransactionHistory(true);
    }
  }, [inView]);

  useEffect(() => {
    if (userTransferList) {
      console.log('UserTransferList userTransferList', userTransferList);
      const seen = new Set();
      const days = userTransferList.filter(({ day }) => {
        const isNew = !seen.has(day);
        seen.add(day);
        return isNew;
      }).map(item => item.day);
      // const grouped = Object.groupBy(userTransferList, ({ day }) => day);
      const grouped: Record<number, typeof userTransferList> = userTransferList.reduce((acc, item) => {
        const { day } = item;
        if (!acc[day]) {
          acc[day] = [];
        }
        acc[day].push(item);
        return acc;
      }, {} as Record<number, typeof userTransferList>);
      setUniqueDays(days);
      setUserTransferGroupMap(grouped);
      console.log('UserTransferList userTransferList grouped', days, grouped);
    }
  }, [userTransferList])

  const requestUserTransactionHistory = async (loadMore: boolean = false) => {
    let pn = pageNumberRef.current;
    if (loadMore) {
      pn = pn + 1;
    } else {
      pn = 1;
    }
    // setPageNumber(pn);
    pageNumberRef.current = pn;
    let params: Record<string, unknown> = {pageNum: pn, pageSize: 10};
    if (network !== "OmniChain") {
      params["network"] = getRealChain(network);
    }
    const res = await getTransactionHistory(params);
    console.log('UserTransferList', res);
    if (loadMore) {
      if (!userTransferList) {
        setUserTransferList([...res.list]);
        return;
      }
      if (userTransferList.length + res.list.length >= res.total) {
        setLoadEnd(true);
      }
      setUserTransferList([...userTransferList, ...res.list]);
    } else {
      setUserTransferList(res.list);
      setLoadEnd(false);
    }
  }

  const renderUserTransferList = (day: number) => {
    return (
      userTransferGroupMap[day]?.map((item, index) => (<UserTransferItem key={`${day}-${index}`} item={item} />))
    )
  }

  return (
    <div className="flex flex-col">
      {
        (uniqueDays && uniqueDays.length === 0) ? <div className="mt-4.5 mx-auto text-text_5">{`You don't have any transaction records`}</div> : <></>
      }
      {
        uniqueDays && uniqueDays.length > 0 && uniqueDays.map((item) => (
          <div key={`${item}`}>
            <div className="text-xs text-text_5 ml-5  mt-4.5">{formatTimestampToMouth2(item*1000)}</div>
            {renderUserTransferList(item)}
            <div className=" mt-4 w-[calc(100%-32px)] mx-4 h-0.25 bg-b-normal"></div></div>
        ))
      }

      {!loadEnd ? <div ref={ref} className="text-center pb-3 text-[#888]">
          {userTransferList && userTransferList.length > 0 ? t("trading.loading") : ""}
      </div> : <></>}
    </div>
  );
}
export default UserTransferList;