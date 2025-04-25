import {useEffect, useState} from "react";

export function useMedia() {
  // const [isSmallPhone] = useState(() => {
  //   // sm
  //   return window.innerWidth < 640;
  // });

  const [ isPhone, setIsPhone ] = useState(() => {
    // md
    return window.innerWidth < 768;
  });

  const [ isWeb, setIsWeb ] = useState(() => {
    return window.innerWidth >= 768;
  });

  const handleResize = ()=> {
    setIsPhone(window.innerWidth < 768);
    setIsWeb(window.innerWidth >= 768);
  }

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    }
  })

  return { isPhone, isWeb }
}