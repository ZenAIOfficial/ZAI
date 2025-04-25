/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from "@/apis/core";

export enum Role {
  System = 'system',
  User = 'user',
  Assistant = 'assistant',
}

export interface ChatMessage {
  id?: number;
  role: Role;
  messageType: MessageType;
  content: string;
  showContent: string;
  name?: string;
}

export interface ChatCompletionChoice {
  message: ChatMessage;
  finish_reason: string;
  index: number;
}

export interface WebAnalyzeShareInfoReq {
  address: string;
  shareId: string;
}

export interface WebAnalyzeShareInfoUserReq {
  messageId: string;
  address: string;
  shareId: string;
}

export function getRole(roleString: string): Role {
  return Role[roleString as keyof typeof Role];
}

export enum MessageType {
  Normal = 'normal',
  Error = 'error',
}

export function getMessageType(messageTypeString: string): MessageType {
  return MessageType[messageTypeString as keyof typeof MessageType];
}

export interface ChatChunk {
  oneQuestId: string;
  action: string;
  text?: string;
}

export const createTextChunk = (msg: string) => {
  return {
    action: "text",
    text: msg,
  }

}


export function aiChat(question: string, messageId: string): Promise<any> {
  return http.chat(`/ai/chat?content=${question}&messageId=${messageId}`);
}

export function getHistoryList(): Promise<Array<any>> {
  return http.requestList({
    url: "/ai/chat/list",
    method: "get",
  });
}

export function getChatLog(messageId: string): Promise<Array<ChatMessage>> {
  return http.requestList({
    url: "/ai/chat/log",
    method: "get",
    params: {
      messageId,
    }
  });
}

export function getChatPre() {
  return http.requestList({
    url: "/ai/chatPre",
    method: "get",
  });
}

export function delChat(messageId: string) {
  return http.requestList({
    url: "/ai/chat/del",
    method: "post",
    data: {
      messageId
    }
  });
}

export function getShareInfo(data: WebAnalyzeShareInfoReq): Promise<Array<ChatMessage>> {
  return http.requestObject({
    url: "/web/analyze/shareInfo",
    method: "post",
    data,
  });
}

export function postShareInfoUser(data: WebAnalyzeShareInfoUserReq): Promise<Array<ChatMessage>> {
  return http.requestObject({
    url: "/web/analyze/shareInfoUser",
    method: "post",
    data,
  });
}