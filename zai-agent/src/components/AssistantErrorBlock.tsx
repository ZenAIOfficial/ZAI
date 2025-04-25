import Image from 'next/image';
import React from 'react';

import IcAssistantError from "@/assets/ic_assistant_error.svg";

interface AssistantContentBlockProps {
  text: string;
}

const AssistantErrorBlock: React.FC<AssistantContentBlockProps> = ({ text }) => {
  return (
    <div className="w-full px-11.5 h-14">
      <div className='w-fit flex flex-row px-4 items-center bg-[#F93A370D] border border-[#F93A3733] rounded-2xl h-14'>
      <Image className='w-5 h-5' src={IcAssistantError} width={20} height={20} alt='' />
      <span className='text-[#F93A37] ml-3.5'>{text}</span>
      </div>
    </div>
  );
};

export default AssistantErrorBlock;
