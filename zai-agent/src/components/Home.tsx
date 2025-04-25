/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SendGuide from "./SendGuide";
import MainQuestion from "./MainQuestion";
import Chat from "./Chat";
import { v4 as uuidv4 } from 'uuid';
import { aiChat, ChatMessage, createTextChunk, getChatLog, MessageType, postShareInfoUser, Role, WebAnalyzeShareInfoReq } from "@/apis/ai/chat";
import MessageBox, { MessageBoxHandles } from "./MessageBox";
import { debounceCallback } from "@/utils/utils";
import { clearTempQuestion, getTempQuestion, requestChatList, setTempQuestion } from "@/store/chatStore";
import { clearNextWebAnalyzeShareInfoReq, clearTransferCode, clearWebAnalyzeShareInfoReq, getLoginType, getNextWebAnalyzeShareInfoReq, getTransferCode, getWebAnalyzeShareInfoReq, isLogin, setLoginType, setNextWebAnalyzeShareInfoReq } from "@/store/userStore";
import { useDialog } from "@/hooks/useDialog";
import MessageProvider from "./Context/MessageProvider";
import { checkReceivedCrypto } from "@/apis/user";
import { getShareInfo } from "@/apis/ai/chat";
import { useTranslation } from "react-i18next";
import { registerCallApp, unRegisterCallApp } from "@/hooks/message";

interface CompletionChunk {
  action: string;
  text: string;
  oneQuestId: number;
  id: string;
  object: string;
  created: number;
  model: string;
  choices: CompletionChunkChoice[];
}

interface CompletionChunkChoice {
  index: number;
  delta: {
    content: string;
  };
  finish_reason: null | string; // If there can be other values than 'null', use appropriate type instead of string.
}

export default function Home() {  
  const { chatId } = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { showLoginDialog, showThirdLoginLoadingDialog, showLoginShareDialog } = useDialog();
  const [loading, setLoading] = useState(false);
  const messageBoxRef = useRef<MessageBoxHandles>(null);
  const [chatListLoading, setChatListLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [allowAutoScroll, setAllowAutoScroll] = useState(true);
  const [chatError, setChatError] = useState("");
  const [analyzeShareInfoReq, setAnalyzeShareInfoReq] = useState<WebAnalyzeShareInfoReq | undefined>(getWebAnalyzeShareInfoReq());

  useEffect(() => {
    registerCallApp(callApp);
    return () => {
      unRegisterCallApp();
    };
  }, []);
  
  useEffect(() => {
    if (chatId) {
      clearWebAnalyzeShareInfoReq();
      return;
    }
    if (handleLoginCallback() || handleWebAnalyzeShareInfoReq() || handleTransferCode()) {
      return;
    }
  }, []);

  useEffect(() => {
    console.log("Home useEffect", chatId, !isLogin());
    if (chatId) {
      if (!isLogin()) {
        router.push("/");
        return;
      }
      setChatListLoading(true);
      const lastQuestion = getTempQuestion();
      if (lastQuestion !== "") {
        clearTempQuestion();
        getChatLog(chatId as string).then((res) => {
          setChatListLoading(false);
          console.log("xxx", res);
          setMessages(res);
          callApp(lastQuestion);
          handleUserScroll(true);
        });
      } else {
        getChatLog(chatId as string).then((res) => {
          setChatListLoading(false);
          console.log("xxx", res);
          setMessages(res);
          if (res.length === 0) {
            router.push("/");
          }
          handleUserScroll(true);
        });
      }
    } else {
      setChatListLoading(false);
    }
  }, [chatId]);

  const handleWebAnalyzeShareInfoReq = (): boolean => {
    if (analyzeShareInfoReq) {
      clearWebAnalyzeShareInfoReq();
      if (!isLogin()) {
        setNextWebAnalyzeShareInfoReq(analyzeShareInfoReq);
      }
      setChatListLoading(true);
      getShareInfo(analyzeShareInfoReq)
      .then((res) => {
        console.log('getShareInfo', res);
        setMessages(res);
      })
      .catch((err) => {
        setAnalyzeShareInfoReq(undefined);
        console.log('getShareInfo error', err);
      });
      return true;
    }
    const req = getNextWebAnalyzeShareInfoReq();
    if (req) {
      clearNextWebAnalyzeShareInfoReq();
    }

    return false;
  }

  const handleTransferCode = (): boolean => {
    const transferCode = getTransferCode();
    if (transferCode && !isLogin()) {
      clearTransferCode();
      
      setLoginType("4");
      showThirdLoginLoadingDialog("4");
      return true;
    }
    if (isLogin()) {
      clearTransferCode();
      checkReceivedCrypto("").then((res) => {
        console.log("xxxxx", res);
        if (res) {
          showLoginShareDialog(res);
        }
      });
    }
    return false;
  };

  const handleLoginCallback = (): boolean => {
    const urlParams = new URLSearchParams(window.location.search);
    const state = urlParams.get('state');
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const from = urlParams.get('from');
    if (from && from === "catchthebig") {
      callApp("Find whales");
      return true;
    }
    const loginType = getLoginType();
    if (state && loginType) {
      showThirdLoginLoadingDialog(loginType, state, code, error);
      return true;
    }
    return false;
  }

  const callApp = async (message: string) => {
    if (message === "") {
      return;
    }
    if (!isLogin()) {
      showLoginDialog();
      return;
    }

    console.log("callApp", chatId);
    if (!chatId) {
      const messageId = uuidv4();
      if (analyzeShareInfoReq) {
        await postShareInfoUser({
          address: analyzeShareInfoReq.address,
          shareId: analyzeShareInfoReq.shareId,
          messageId: messageId,
        });
        setAnalyzeShareInfoReq(undefined);
      }
      setTempQuestion(message);
      router.push("/c/" + messageId);
      return;
    }
    setLoading(true);
    const chunk = {
      action: "text",
      text: message,
    }
    handleUserScroll(true);
    addMessage(Role.User, MessageType.Normal, message, JSON.stringify(chunk), sendMessage);
  };

  const addMessage = (role: Role, messageType: MessageType, content: string, chunk: string, callback?: (callback: ChatMessage[]) => void) => {
    setMessages((prevMessages: ChatMessage[]) => {
      const message: ChatMessage = {
        id: prevMessages.length + 1,
        role: role,
        messageType: messageType,
        content: content,
        showContent: chunk,
      };
      // console.log(message);
      return [...prevMessages, message];
    });

    const newMessage: ChatMessage = {
      id: messages.length + 1,
      role: role,
      messageType: messageType,
      content: content,
      showContent: chunk,
    };
    const updatedMessages = [...messages, newMessage];

    if (callback) {
      callback(updatedMessages);
    }
  };

  // content: 
  const handleStreamedResponse = (content: string[]) => {
    setMessages(prevMessages => {
      let isNew: boolean = false;
      try {
        // todo: this shouldn't be necessary
        if (prevMessages.length == 0) {
          console.error('prevMessages should not be empty in handleStreamedResponse.');
          return [];
        }
        if ((prevMessages[prevMessages.length - 1].role == Role.User)) {
          isNew = true;
        }
      } catch (e) {
        console.error('Error getting the role')
        console.error('prevMessages = ' + JSON.stringify(prevMessages));
        console.error(e);
      }
      const chunks = content.map(res => JSON.parse(res));
      // console.log("isNew", isNew);
      if (isNew) {
        const message: ChatMessage = {
          id: prevMessages.length + 1,
          role: Role.Assistant,
          messageType: MessageType.Normal,
          content: "content",
          showContent: JSON.stringify(chunks),
        };
        // console.log("new....", message);
        return [...prevMessages, message];
      } else {
        // Clone the last message and update its content
        const showContent = prevMessages[prevMessages.length - 1].showContent;
        // console.log("update...", showContent)
        let chunkList = JSON.parse(showContent);
        let lastChunk = chunkList[chunkList.length - 1];

        let newChunks: any[] = [];
        newChunks.push(lastChunk);
        chunks.forEach((chunk) => {
          // console.log("update...chunk", chunk)
          if (lastChunk.text === "Thinking...") {
            lastChunk = chunk;
            newChunks = [lastChunk];
          } else if (chunk.action !== "text" || lastChunk.action !== "text") {
            newChunks.push(chunk);
            lastChunk = chunk;
          } else {
            lastChunk = createTextChunk(lastChunk.text + chunk.text);
            newChunks = [...newChunks.slice(0, -1), lastChunk];
          }
        });

        chunkList = [...chunkList.slice(0, -1), ...newChunks];
        const updatedMessage = {
          ...prevMessages[prevMessages.length - 1],
          content: "content",
          showContent: JSON.stringify(chunkList),
        };

        // console.log("updatedMessage", updatedMessage);
        // Replace the old last message with the updated one
        return [...prevMessages.slice(0, -1), updatedMessage];
      }
    });
  };

  const handleManualResponse = (qId: string, content: any[]) => {
    setMessages(prevMessages => {
      if (prevMessages.length == 0) {
        console.error('prevMessages should not be empty in handleManualResponse.');
        return [];
      }
      // Clone the last message and update its content
      const newMessages = prevMessages.reverse().map((res) => {
        if (res.role === Role.Assistant && res.showContent) {
          let chunkList = JSON.parse(res.showContent);
          if (chunkList && chunkList.length > 0) {
            if (chunkList[0].oneQuestId === qId) {
              chunkList = [...chunkList, ...content];
              const updatedMessage = {
                ...res,
                showContent: JSON.stringify(chunkList),
              };
              return updatedMessage;
            }
          }
        }
        return res;
      }).reverse();
      // Replace the old last message with the updated one
      return [...newMessages];
    });
  }

  async function sendMessage(updatedMessages: ChatMessage[]) {
    setLoading(true);
    setChatError("");
    clearInputArea();

    const msg = updatedMessages[updatedMessages.length - 1].content;
    const debouncedCb = debounceCallback(handleStreamedResponse);
    debouncedCb([JSON.stringify(createTextChunk("Thinking..."))]);
    const response = await aiChat(msg, chatId as string);
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let partialDecodedChunk = undefined;
    try {
      while (true) {
        const streamChunk = await reader.read();
        const { done, value } = streamChunk;
        if (done) {
          break;
        }
        let DONE = false;
        let decodedChunk = decoder.decode(value);
        if (typeof partialDecodedChunk !== 'undefined') {
          // console.log('yyy 2', partialDecodedChunk);
          decodedChunk = "data:" + partialDecodedChunk + decodedChunk;
          partialDecodedChunk = undefined;
        }

        // console.log('yyy 1', decodedChunk);
        const rawData = decodedChunk.split("\n").filter(line => line.startsWith("data:")).map(line => line.replace(/^data:\s?/, ""));
        // console.log('yyy 2', rawData);
        const chunks: CompletionChunk[] = rawData.map((chunk, index) => {
          partialDecodedChunk = undefined;
          chunk = chunk.trim();
          if (chunk.length == 0) {
            // decodedChunk only 'data:'
            if (index === rawData.length - 1) { // Check if this is the last element
              partialDecodedChunk = chunk;
            }
            return;
          }
          let o;
          try {
            o = JSON.parse(chunk);
            if (o.action === 'stop') {
              DONE = true;
              return;
            }
          } catch (err) {
            if (index === rawData.length - 1) { // Check if this is the last element
              partialDecodedChunk = chunk;
            } else if (err instanceof Error) {
              console.error(err.message);
            }
          }
          return o;
        }).filter(Boolean); // Filter out undefined values which may be a result of the [DONE] term check

        console.log("chunks size", chunks.length);
        const accumulatedContetList: string[] = [];
        chunks.forEach(chunk => {
          accumulatedContetList.push(JSON.stringify(chunk));
        });
        if (accumulatedContetList.length !== 0) {
          debouncedCb(accumulatedContetList);
        }

        if (DONE) {
          return;
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // User aborted the stream, so no need to propagate an error.
      } else if (error instanceof Error) { /* empty */ } else {
        console.error('An unexpected error occurred');
      }
      setChatError("Network error or server exception, please try again later!");
      return;
    } finally {
      setLoading(false); // Stop loading here, whether successful or not
      requestChatList();
    }
  }

  const clickQuickQuestion = (question: string) => {
    if (loading) {
      return;
    }
    messageBoxRef.current?.askQuickQuestion(question);
  };

  const handleUserScroll = (isAtBottom: boolean) => {
    setAllowAutoScroll(isAtBottom);
  };

  const clearInputArea = () => {
    messageBoxRef.current?.clearInputValue();
  };

  const canShowChatList = (): boolean => {
    if (chatId || analyzeShareInfoReq) {
      return true;
    } else {
      return false;
    }
  }

  const renderContent = () => {
    if (!canShowChatList()) {
      return (<div className="w-full h-full flex justify-center items-center md:max-w-3xl m-auto"><SendGuide
        callApp={callApp}
        clickQuickQuestion={clickQuickQuestion}
        loading={loading}
        setLoading={setLoading}
      /></div>);
    }
    if (chatListLoading) {
      return (<div className="w-full h-full flex justify-center items-center"><i className="pi pi-spin pi-spinner text-gray-600" style={{ fontSize: '2rem' }}></i></div>);
    }

    return (
      <MessageProvider callApp={callApp}>
        <Chat chatBlocks={messages} onChatScroll={handleUserScroll} allowAutoScroll={allowAutoScroll}
          handleManualResponse={handleManualResponse}
          error={chatError}
          loading={loading} />
      </MessageProvider>
    );
  }

  return (
    <>
      <div className="flex flex-1 overflow-hidden">
        {/* <Turnstile siteKey='1x00000000000000000000AA' onSuccess={onVerify} onWidgetLoad={onWidgetLoad} /> */}

        {
          renderContent()
        }
      </div>
      <div className={`w-full ${canShowChatList() ? '' : 'hidden'}`} style={{ zIndex: 4 }}>
        <MainQuestion loading={loading} clickQuickQuestion={clickQuickQuestion} />
      </div>
      <div className={`${canShowChatList() ? '' : 'hidden'}`}>
        <MessageBox
          ref={messageBoxRef}
          callApp={callApp}
          loading={loading}
          setLoading={setLoading}
          placeholder={t('home.send_a_message')} />
      </div>
    </>

  );
}
