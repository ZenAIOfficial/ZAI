import { http } from "@/apis/core";

export interface CoinGeckoInfo {
  id: number;
  coinGeckoId: number;
  name: string;
  address: string;
  symbol: string;
  image: string;
  mktCap: number;
  description: string;
  totalSupply: string;
  decimals: string;
  holders: string;
  deployTime: string;
  price: number;
  twitterScreenName: string;
  volumePast24h: string;
  price24hChange: number;
  circulatingSupply: string;
  category: string;
  lastTimestamp: number;
  lastDateTime: number;
  amount: number;
  buy_volume_5m: number | null;
  sell_volume_5m: number | null;
  spotlightDesc: string;
  content: string; // banner image url
  contentKey: string; // image key
  type: number;
}
export interface TransactionInfo {
  day: number;
  tokenDetailId: number;
  transId: string;
  symbol: string;
  image: string;
  type: number;
  status: number;
  value: number;
  createdTime: number;
}

export interface UserTokenInfo {
  accountIncreaseRate: number;
  address: string;
  amount: number;
  boughtPrice: number;
  decimals: number;
  image: string;
  name: string;
  price: number;
  symbol: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function requestTrendList(params?: object): Promise<any> {
  return http.requestList({
    url: "/token/page",
    method: "get",
    params,
  });
}