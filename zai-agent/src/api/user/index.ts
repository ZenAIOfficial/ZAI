import { http, PageRequest, PageResult  } from "@/apis/core";

export interface User {
  tgUserId: number;
  tgUserIdStr: string;
  imgUrl: string;
  isPremium: boolean;
  friendTgUserId: number;
  walletAddress: string;
  totalCoins: number;
  totalUserNum: number;
  shareUrl: string;
  copyShareUrl: string;
  beginTime: number;
  endTime: number;
  name: string;
  token: string;
  source: number;
  lamports: number;
  uniqueId: string;
  progress: number;
  address: string;
  slippage: SlippageInfo;
  invitedFriends: number;
  commission: number;
  userWalletAddress: WalletAddressInfo[];
}

export interface WalletAddressInfo {
  balance: number;
  decimals: number;
  id: string;
  network: string;
  walletAddress: string;
}

export interface SlippageInfo {
  buySlippageBps: number;
  sellSlippageBps: number;
}

export interface TokenRecent {
  symbol: string;
  image: string;
  address: string;
  network: string;
}

export interface NonceInfo {
  uId: string,
}

interface AuthTwitterResp {
  authorizeUrl: string,
}

export interface ReceivedCrypto {
  fromAddress: string;
  fromImageUrl: string;
  fromUserId: string;
  fromUsername: string;
  fromName: string;
  source: number;
  needAmount: number;
  newUser: boolean;
  symbol: string;

}
export interface UserToken {
  symbol: string;
  image: string;
  decimals: number;
  amount: number;
  price: number;
  address: string;
  network: string;
  amountStr: string;
}

export interface UserTokensResponse {
  tokenList: Array<UserToken>;
  totalBalance: number;
  commissionTotalUsdc: number;
  invitedFriends: number;
}

export interface UserTransferResponse {
  createdTime: number;
  day: number;
  image: string;
  symbol: string;
  value: number;
  equivalentSymValue: number;
  equivalentSymbol: string;
  type: number;
  markup: number;
  tokenAddress: string;
  network: string;
}

export interface ChainInfo{
  id: number;
  name: string;
  icon: string;
}

export function login(data?: object): Promise<User> {
  return http.requestObject({
    url: "/auth/me2",
    method: "post",
    data
  });
}

export function syncUserInfo(): Promise<User> {
  return http.requestObject({
    url: "/auth/userInfo",
    method: "get",
  });
}

export function getToken(): Promise<string> {
  return http.requestObject({
    url: "/user/info",
    method: "get",
  });
}

export function sync(): Promise<User> {
  return http.requestObject({
    url: "/clicker/sync",
    method: "get",
  });
}

export function setWalletAddress(walletAddress: string): Promise<User> {
  return http.requestObject({
    url: "/clicker/walletAddress",
    method: "post",
    data: {
      walletAddress,
    }
  });
}

export function getSignNonce(params?: object): Promise<NonceInfo> {
  return http.requestObject({
    url: "/auth/verify_number",
    method: "get",
    params
  });
}

export function authTwitter(): Promise<AuthTwitterResp> {
  return http.requestObject({
    url: "/auth/twitter/authorizeUrl",
    method: "get"
  });
}

export function authTiktok(): Promise<AuthTwitterResp> {
  return http.requestObject({
    url: "/auth/tikTok/authorizeUrl",
    method: "get"
  });
}

export function checkReceivedCrypto(uid: string): Promise<ReceivedCrypto> {
  return http.requestObject({
    url: "/auth/checkReceivedCrypto",
    method: "get",
    params: {
      uid,
    }
  });
}

export function requestUserTokens(): Promise<UserTokensResponse> {
  return http.requestObject({
    url: "/web/webBot/user/tokens",
    method: "post"
  });
}

export function getTransactionHistory(params: object): Promise<PageResult<UserTransferResponse>> {
  return http.requestPage({
    url: "/web/webBot/transactionHistory",
    method: "get",
    params,
  });
}

export function turnstileVerifier(token: string): Promise<string> {
  return http.requestObject({
    url: "/web/webBot/turnstileVerifier",
    method: "get",
    params: {
      responseToken: token,
    }
  });
}

export function topupSignal(): Promise<string> {
  return http.requestObject({
    url: "/web/webBot/orderIt",
    method: "get",
  });
}
