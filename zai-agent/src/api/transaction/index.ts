/* eslint-disable @typescript-eslint/no-explicit-any */
import { http, ObjectResult } from "@/apis/core";

interface Trans {
  transaction: string;
  code: number;
}

interface TransactionStatus {
  account: string;
  confirmationStatus: string;
}
interface WebBotTransactionStatus {
  list: any[];
}

interface BlockhashInfo {
  blockhash: string;
  lastValidBlockHeight: number;
}

interface CreateTransferRequest {
  fromAddress: string;
  realAmount: number;
  coinType: number; // 0:sol 1:usdc
}

export function sendTrans(data: any): Promise<ObjectResult<any>> {
  return http.request({
    url: "/web/transaction/send",
    method: "post",
    data,
  });
}

export function createTransfer(data: CreateTransferRequest): Promise<any> {
  return http.requestObject({
    url: "/web/transaction/transfer",
    method: "post",
    data,
  });
}
export function checkTransStatus(data: any): Promise<TransactionStatus> {
  return http.requestObject({
    url: "/web/transaction/status",
    method: "post",
    data,
  });
}

export function sendTransaction(transactionId: string): Promise<Trans> {
  return http.requestObject({
    url: "/web/webBot/transaction",
    method: "post",
    data : {
      transactionId: transactionId,
    }
  });
}

export function pushTransStatus(data: any): Promise<WebBotTransactionStatus> {
  return http.requestObject({
    url: "/web/webBot/msg/status",
    method: "post",
    data,
  });
}

export function getBlockhash(): Promise<BlockhashInfo> {
  return http.requestObject({
    url: "/solana/latestBlockHash",
    method: "get",
  });
}