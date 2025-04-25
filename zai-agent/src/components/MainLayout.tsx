
'use client'
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { useParams, usePathname } from "next/navigation";
import MainHeader from "./MainHeader";
import DialogProvider from "./Context/DialogProvider";
import RightSidebar from "./RightSidebar";
import { initLocales } from "@/utils/locales";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { chatId } = useParams();
  const [isRightOpen, setRightOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(() => {
    return window.innerWidth >= 768;
  });

  useEffect(() => {
    initLocales();
    return () => {
    };
  })
  const showBg = () => {
    if (pathname === '/') {
      if (chatId) {
        return true;
      }
    }
    return false;
  }

  return (
    <DialogProvider>
      <main className="h-svh md:h-screen flex">
        <Sidebar isOpen={isOpen} setOpen={setIsOpen} />
        {
          showBg() ? (<div className={`absolute t-0 l-0 b-0 b-0 h-svh md:h-screen w-full overflow-hidden root_chat`}></div>) : <></>
        }

        <div className={`h-svh md:h-screen w-full relative flex flex-col transition-all duration-200 ease-in-out ${isOpen ? 'md:ml-64' : 'ml-0'}`}>
          <MainHeader isOpen={isOpen} setOpen={setIsOpen} setRightOpen={setRightOpen} />
          {
            children
          }
        </div>

        <RightSidebar isOpen={isRightOpen} setOpen={setRightOpen} />

      </main>
    </DialogProvider>
  );
}
