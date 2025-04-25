/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import { delChat } from '@/apis/ai/chat';
import { useParams, useRouter } from 'next/navigation';
import Image from "next/image";
import { useDialog } from '@/hooks/useDialog';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { requestChatList, useChatStore } from '@/store/chatStore';
import arrowRightIcon from "@/assets/ic_arrow_right.svg";
import IcMore from "@/assets/ic_more.svg";
import IcDelete from "@/assets/ic_delete.svg";
import { OverlayPanel } from 'primereact/overlaypanel';

interface Props {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}
const HistoryChat: React.FC<Props> = ({ isOpen, setOpen }) => {
  const router = useRouter();
  const historyChatRef = useRef<HTMLDivElement>(null);
  const { showDelectDialog, hideDialog } = useDialog();
  const chatList = useChatStore((state) => state.chatList);
  const [activeIndex, setActiveIndex] = useState(0);
  const op = useRef<OverlayPanel>(null);
  const [currentDelTarget, setCurrentDelTarget] = useState(null);
  const { chatId } = useParams();

  useEffect(() => {
    // requestChatList();
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event: any) => {
    if (isOpen) {
      if (op.current && op.current.isVisible()) {
        return;
      }
      if (historyChatRef.current && !historyChatRef.current.contains(event.target)) {
        setOpen(!isOpen);
      }
    }
  };

  const customHeader = (options: any, index: number) => {
    return (
      <div className="flex justify-between items-center w-full cursor-pointer">
        <span className="text-[12px] font-medium text-[#56637E] border-none">{options.header}</span>
        <Image src={arrowRightIcon} width={10} height={10}
          className={`w-2.5 h-2.5 transition-transform duration-300 ${activeIndex === index ? "rotate-90" : "rotate-0"}`} alt={""} />
      </div>
    );
  };

  const handleTabChange = (e: any) => {
    setActiveIndex(e.index);
  };

  const toChatPage = (messageId: string) => {
    router.push("/c/" + messageId);
  };

  const handleMore = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, item: any) => {
    e.stopPropagation();
    setCurrentDelTarget(item);
    op.current?.toggle(e);
  };

  const delChatGroup = () => {
    console.log('delChatGroup', currentDelTarget, chatId);
    if (currentDelTarget) {
      const messageId = (currentDelTarget as any).messageId;
      delChat(messageId).then(() => {
        op.current?.hide();
        requestChatList();
        if (chatId === messageId) {
          router.push("/");
        }
      });
    }
    hideDialog();
  }

  const openDelChatGroupDialog = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    showDelectDialog(delChatGroup);
  }

  return (
    <div ref={historyChatRef} className='absolute top-[56px] w-64 left-16 rounded-xl border border-b-normal shadow-lg  bg-white px-2 text-14px'>
      <div className='ml-1 mt-4'>Chat History</div>
      <div className="mt-3 h-[0.5px] w-full bg-[#E4E4E7] mb-2"></div>
      <div className='w-full h-80 text-14px  overflow-auto'>
        <Accordion className="w-full" activeIndex={activeIndex} onTabChange={handleTabChange} >
          {
            chatList.map((item: any, index: any) => (
              <AccordionTab key={item.header} header={item.header} headerTemplate={(options) => customHeader(options, index)}
                pt={{
                  headerIcon: {
                    style: {
                      display: "none"
                    }
                  },
                  headerAction: {
                    style: {
                      padding: "0.5rem",
                      backgroundColor: "transparent"
                    }
                  },
                  content: {
                    style: {
                      padding: "0",
                      fontSize: "14px",
                      color: "black",
                      border: "none",
                      backgroundColor: "transparent"
                    }
                  },
                }}>
                {item.children.map((block: any) => (
                  <div key={`chat-block-${block.messageId}`}
                    className="group w-full flex flex-row h-[34px] px-2 justify-start items-center hover:bg-[#f7f3ff] hover:rounded-[8px]"
                    onClick={() => toChatPage(block.messageId)}>
                    <div className="flex-1 w-full flex justify-start items-center">
                      <span className="w-full whitespace-nowrap overflow-hidden text-ellipsis">
                        {block.title}
                      </span>
                      <Image src={IcMore}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white_hover"
                        onClick={(e) => handleMore(e, block)} alt={""} />
                    </div>
                  </div>
                ))}
              </AccordionTab>
            ))
          }
        </Accordion>
      </div>

      <OverlayPanel ref={op}>
        <div className="flex flex-row bg-background px-4 py-2 -mt-1 cursor-pointer hover:bg-white_hover border rounded-lg border-b-normal shadow" onClick={openDelChatGroupDialog}>
          <Image src={IcDelete} width={16} height={24} alt={""} />
          <span className="p-0 ml-2">Delete</span>
        </div>
      </OverlayPanel>
    </div>
  );
}

export default HistoryChat;