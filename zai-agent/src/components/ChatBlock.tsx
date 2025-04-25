import React, { useRef } from 'react';
import Image from "next/image";
import zaiGirlImg from "@/assets/ic_zai_girl.webp";
import { ChatMessage } from '@/apis/ai/chat';
import UserContentBlock from './UserContentBlock';
import AssistantContentBlock from './AssistantContentBlock';

interface Props {
  block: ChatMessage;
  loading: boolean;
  isLastBlock: boolean;
  onTyping?: () => void;
  handleManualResponse: (qId: string, content: any[]) => void;
}

const ChatBlock: React.FC<Props> = ({ block, loading, isLastBlock, onTyping, handleManualResponse }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div key={`chat-block-${block.id}`}
      className={`group w-full text-primary2`}>
      <div className="text-base w-full py-5 flex lg:px-0 m-auto flex-col">
        <div className="w-full flex">
          <div className="w-[30px] flex flex-col relative items-end mr-4">
            <div className="relative flex h-[30px] w-[30px] p-0 rounded-sm items-center justify-center">
              {block.role === 'user' ? (
                <div />
              ) : block.role === 'assistant' ? (
                <Image className="w-8" width={32} src={zaiGirlImg} alt={''} />
              ) : null}
            </div>
          </div>
          <div className="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-full">
            <div id={`message-block-${block.id}`} className="flex flex-grow flex-col gap-3">
              <div
                className="min-h-[20px] flex flex-col items-start gap-4">
                <div ref={contentRef} className="w-full break-words light flex flex-row" style={{ justifyContent: block.role === "user" ? "end" : "start" }}>
                  {block.role === 'user' ? (
                    <div className="bg-message_bg px-3 rounded-3xl"><UserContentBlock text={block.content} /></div>
                  ) : (
                    <AssistantContentBlock text={block.showContent} onTyping={onTyping} handleManualResponse={handleManualResponse} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {!(isLastBlock && loading) && (
          <div id={`action-block-${block.id}`} className="flex justify-start items-center ml-10">
            {/* {block.role === 'assistant' && (
                    <TextToSpeechButton content={block.content}/>
                )} */}
            <div className="copy-button">
              {/* <CopyButton mode={CopyButtonMode.Compact} text={block.content}/> */}
            </div>
            {/*          {block.role === 'assistant' && (
                    <div className="regenerate-button text-gray-400 visible">
                        <button className="flex gap-2" onClick={handleRegenerate}>
                            <ArrowPathRoundedSquareIcon {...iconProps}/>
                        </button>
                    </div>
                  )}
                  <div className="regenerate-button text-gray-400 visible">
                      <button className="flex gap-2" onClick={handleEdit}>
                          <PencilSquareIcon {...iconProps}/>
                      </button>
                  </div>*/}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBlock;
