import {http, ObjectResult2, PageResult} from "@/apis/core";

export interface TokenRate {
  symbol: string;
  price: number;
}

export interface TrendParams {
  tabType: number;
  pageNum: number;
  pageSize: number;
}

export interface TrendResult {
  total: number;
  list: TrendInfo[];
  pages: number;
}

export interface TrendInfo {
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
  deployTime: number;
  price: number;
  twitterScreenName: string;
  volumePast24h: number;
  price24hChange: number;
  circulatingSupply: string;
  category: string;
  lastTimestamp: number;
  lastDateTime: number;
  amount: number;
  buy_volume_5m: number | null;
  sell_volume_5m: number | null;
  spotlightDesc: string;
  isWatch: boolean;
  liquidity: number;
  extensions: string;
  network: string;
  whalesProbability: string;
}

export interface ExtensionInfo {
  telegram: string;
  twitter: string;
  website: string;
}

export interface ChartData {
  oneDay: ChartDotInfo[];
  fourHours: ChartDotInfo[];
  oneWeek: ChartDotInfo[];
  oneMonth: ChartDotInfo[];
  oneYear: ChartDotInfo[];
  max: ChartDotInfo[];
  live: ChartDotInfo[];
}

export interface ChartDotInfo {
  address: string;
  closePrice: string;
  currentDay: string;
  highPrice: number;
  id: string;
  lastDateTime: string;
  lastTimestamp: number;
  lowPrice: number;
  openPrice: number;
  price: number;
  unixTime: number;
  volume: number;
  mktCap: string;
  mktOpenPrice: string;
  mktClosePrice: string;
  mktHighPrice: string;
  mktLowPrice: string;
}

export interface HolderResp {
  items: HolderInfo[];
}

export interface HolderInfo {
  amount: string;
  decimals: number;
  mint: string;
  owner: string;
  token_account: string;
  ui_amount: string;
  holding: number;
}

export interface SwapInfo {
  id: string;
  transaction: string;
  transactionHash: string;
}

export interface WhaleInfo {
  action: string;
  oneQuestId: string;
  text: string;
  chineseText: string;
  image: string;
  shareFindWhalesUrl: string;
}

export function sortMktCap(): Promise<PageResult<TrendInfo>> {
  return http.requestPage({
    url: "/web/webBot/tokens/mktCap",
    method: "get",
  });
}

export function requestSearchList(params?: object): Promise<Array<TrendInfo>> {
  return http.requestList({
    url: "/web/webBot/tokens/search",
    method: "get",
    params,
  });
}

export function requestCryptoRates(): Promise<TokenRate[]> {
  return http.requestList({
    url: "/tonRates/tokensRate",
    method: "get",
  });
}

export function requestTrendList(params?: object): Promise<ObjectResult2<TrendResult>> {
  return http.requestTokenList({
    url: "/web/webBot/tokens/page",
    method: "get",
    params,
  });
}

export function trendDetail(params?: object): Promise<TrendInfo> {
  return http.requestObject({
    url: "/web/webBot/token/detail",
    method: "get",
    params,
  });
}

export function trendChartData(params?: object): Promise<ChartData> {
  return http.requestObject({
    url: "/web/webBot/price/tendencyAll",
    method: "get",
    params,
  });
}

export function addWatch(data?: object): Promise<unknown> {
  return http.request({
    url: "/token/user/watch/add",
    method: "post",
    data,
  });
}

export function removeWatch(data?: object): Promise<unknown> {
  return http.request({
    url: "/token/user/watch/remove",
    method: "post",
    data,
  });
}

export function trendLiveChartData(params?: object): Promise<ChartDotInfo[]> {
  return http.requestList({
    url: "/web/webBot/price/tendencyLive",
    method: "get",
    params,
  });
}

export function trendFourHoursChartData(params?: object): Promise<ChartDotInfo[]> {
  return http.requestList({
    url: "/web/webBot/price/tendencyFourHours",
    method: "get",
    params,
  });
}

export function trendOneDayChartData(params?: object): Promise<ChartDotInfo[]> {
  return http.requestList({
    url: "/web/webBot/price/tendencyOneDay",
    method: "get",
    params,
  });
}

export function holderTopTen(data?: object): Promise<HolderResp> {
  return http.requestObject({
    url: "/web/webBot/holder/top10",
    method: "post",
    data,
  });
}

export function transactionSwap(data?: object): Promise<SwapInfo> {
  return http.requestObject({
    url: "/web/transaction/swapTrustee",
    method: "post",
    data,
  });
}

export function updateSlippage(data?: object): Promise<SwapInfo> {
  return http.requestObject({
    url: "/web/webBot/slippageUpdate",
    method: "post",
    data,
  });
}

export function whaleAnalysis(params?: object): Promise<WhaleInfo[]> {
  return http.requestObject({
    url: "/web/webBot/token/findWhales",
    method: "get",
    params,
  });
}