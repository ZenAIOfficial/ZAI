/* eslint-disable @typescript-eslint/no-explicit-any */
import CryptoJS from 'crypto-js';
import {showToast} from "@/store/toastStore";
import BigNumber from "bignumber.js";
import {getLocalChain} from "@/store/userStore";


export const phantomImg = "https://cdn.zencoin.ai/images/ic_phantom.webp";
export const okxImg = "https://cdn.zencoin.ai/images/ic_okx.webp";
export const solflareImg = "https://cdn.zencoin.ai/images/ic_solflare.webp";
export const XImg = "https://cdn.zencoin.ai/images/ic_x.webp";
export const tiktokImg = "https://cdn.zencoin.ai/images/ic_tiktok.webp";

export const isDebugEnvironment = () => {
  return process.env.BUILD_ENV !== 'production'
}
 
export const log = (message?: any, ...optionalParams: any[]): void => {
  if (!isDebugEnvironment()) {
    return;
  }
  console.log(message, ...optionalParams);
}
export const getUrlParam = (name: string) => {
  const query = new URLSearchParams(window.location.search);
  return query.get(name);
};

export const md5 = (value: string) => {
  const wordArray = CryptoJS.enc.Utf8.parse(value);
  const md5WordArray = CryptoJS.MD5(wordArray);
  return CryptoJS.enc.Hex.stringify(md5WordArray);

}

export function resizeViewPort() {
  const overflow = 10;
  document.body.style.overflowY = "hidden";
  document.body.style.marginTop = `${overflow}px`;
  document.body.style.height = window.innerHeight + overflow + "px";
  document.body.style.paddingBottom = `${overflow}px`;
  document.documentElement.scrollTo(0, overflow);
}

export const formatNumberWithSpaces = (num: any) => {
  return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export const formatPriceToString = (num: number) => {
  if (num >= 1e12) {
    return formatLargeNumber(num, 1e12, 'T');
  } else if (num >= 1e9) {
    return formatLargeNumber(num, 1e9, 'B');
  } else if (num >= 1e6) {
    return formatLargeNumber(num, 1e6, 'M');
  } else if (num >= 1e3) {
    return formatLargeNumber(num, 1e3, 'K');
  } else {
    return formatNumberWithSpaces(num);
  }
}

export const formatPriceToString9 = (num?: number) => {
  if (!num) {
    return 0;
  }
  if (num >= 1e15) {
    return formatLargeNumber(num, 1e12, 'T', 1);
  } else if (num >= 1e12) {
    return formatLargeNumber(num, 1e9, 'B', 1);
  } else if (num >= 1e9) {
    return formatLargeNumber(num, 1e6, 'M', 1);
  } else if (num >= 1e6) {
    return formatLargeNumber(num, 1e3, 'K', 1);
  } else {
    return formatNumberWithSpaces(num);
  }
}

const formatLargeNumber = (num: any, divisor: any, suffix: any, digits = 2) => {
  let formatted = (num / divisor).toFixed(digits);
  formatted += suffix;
  formatted = formatNumberWithSpaces(formatted)
  return formatted;
}

export const copyText = (text: string) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
          .writeText(text)
          .then(() => {
          })
          .catch(() => {
            fallbackCopyText(text);
          });
    } else {
      fallbackCopyText(text);
    }
    showToast("success", "Copy Success!", 2000)
  } catch (err) {
    fallbackCopyText(text);
    showToast("success", "Copy Success!", 2000)
    console.error("Failed to copy text: ", err);
  }
};

export const copyImage = async (imageUrl: string) => {
  try {
    if (!window.ClipboardItem || !navigator.clipboard?.write) {
      showToast("error", "Long-press the image and choose 'Save Image' to download!", 2000);
      return;
    }
    const response = await fetch(imageUrl, { mode: 'cors' });
    const blob = await response.blob();

    const clipboardItem = new ClipboardItem({ [blob.type]: blob });
    await navigator.clipboard.write([clipboardItem]);
    showToast("success", "Copy Success!", 2000);
  } catch (err) {
    console.error("Failed to copy image: ", err);
  }
}

export const downloadImage = async (imageUrl: string, fileName = "image.png") => {
  try {
    const response = await fetch(imageUrl, { mode: 'cors' });
    const blob = await response.blob();

    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);

    // showToast("success", "Copy Success!", 2000);
  } catch (err) {
    console.error("Failed to download image: ", err);
  }
}

const fallbackCopyText = (text: string) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
};

export const delay = async (time: number) => {
  return new Promise(resolve => setTimeout(resolve, time));
}

let lastCallbackTime: number = 0;
let callDeferred: number | null = null;
let accumulatedContent: string[] = []; // To accumulate content between debounced calls

const CHAT_STREAM_DEBOUNCE_TIME = 250;

export const debounceCallback = (callback: (content: string[]) => void, delay: number = CHAT_STREAM_DEBOUNCE_TIME) => {
  return (content: string[]) => {
    accumulatedContent.push(...content); // Accumulate content on each call
    const now = Date.now();
    const timeSinceLastCall = now - lastCallbackTime;

    if (callDeferred !== null) {
      clearTimeout(callDeferred);
    }

    callDeferred = window.setTimeout(() => {
      callback(accumulatedContent); // Pass the accumulated content to the original callback
      lastCallbackTime = Date.now();
      accumulatedContent = []; // Reset the accumulated content after the callback is called
    }, delay - timeSinceLastCall < 0 ? 0 : delay - timeSinceLastCall);  // Ensure non-negative delay

    lastCallbackTime = timeSinceLastCall < delay ? lastCallbackTime : now; // Update last callback time if not within delay
  };
}

export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const showWalletAddress = (address: string | undefined) => {
  if (!address) {
    return "";
  }
  const len = address.length;
  return address.substring(0, 4) + "..." + address.substring(len - 4, len);
};

// export const checkSignMessage = (wallet: Wallet | null, connected: boolean, publicKey: PublicKey | null, signMessage: ((message: Uint8Array) => Promise<Uint8Array>) | undefined, disconnect: any, callback: any) => {
//   if (wallet && connected && !isLogin()) {
//     getSignNonce({ walletAddress: publicKey?.toBase58() }).then(async (res) => {
//       if (res) {
//         try {
//           const signedMessage = await signMessageWithWallet(signMessage, res.uId);
//           console.log("signed message:", signedMessage);
//           if (!publicKey) return;
//           await loginToService(publicKey.toBase58(), signedMessage, wallet?.adapter.name);
//           showToast("success", t("home.connect_success"), TOAST_TIME);
//           callback("success");
//         } catch (error) {
//           console.error('sign error:', error);
//           disconnect();
//           window.localStorage.clear();
//           logout();
//           callback("failure");
//         }
//       }
//     });
//   }
// }

export function timestampToDateFormat(timestamp: any) {
  const dateObj = new Date(timestamp);
  const formattedDate = dateObj.toISOString().slice(0, 10);
  const [year, month, day] = formattedDate.split("-");
  return `${year}-${month}-${day}`;
}

export const handleTransactionFailedToast = (code: number) => {
  let errorMsg = "";
  switch (code) {
    case 491:
      errorMsg = "Slippage exceeds the limit. Adjust the slippage or try again later.";
      break;
    case 504:
      errorMsg = "Transaction request timed out. Please check your network and try again.";
      break;
    case 471:
      errorMsg = "Insufficient amount for exchange. Please adjust the amount and try again.";
      break;
    case 461:
      errorMsg = "Invalid address entered. Please check and re-enter.";
      break;
    case 500:
      errorMsg = "Transaction failed. Please try again later or contact support.";
      break;
    case 400:
      errorMsg = "System error. Please try again later or contact support.";
      break;
    case 472:
      errorMsg = "Your cash account balance is insufficient to cover the transaction fee. Please make a deposit in time.";
      break;
    default:
      errorMsg = "The price may have changed too quickly or the network may be slow.";
  }
  return errorMsg;
};

export const checkTransactionCanRetry = (code: number) => {
  return code === 491 || code === 492 || code === 493;
}

export function formatPrice(number: any, decimal: number): string {
  if (number < 0) return number;
  if (number === 0) return "0.00";
  const num = new BigNumber(number).toFixed();
  const numStr = num.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  if (!numStr.includes(".")) {
    return numStr + ".00";
  }
  const dotIndex = numStr.indexOf(".");
  const integer = numStr.substring(0, dotIndex);
  if (Number(integer) > 0) {
    return BigNumber(number).toFixed(2);
  }
  const splice = numStr.substring(dotIndex + 1, numStr.length);
  let result = "";
  let hasNum = false;
  let resCount = 0;
  for (const s of splice) {
    if (s !== "0") {
      hasNum = true;
    }
    if (hasNum) {
      resCount++;
    }
    if (resCount === decimal) {
      if (s === "0") {
        result = result + "1";
      } else {
        result = result + s;
      }
      break;
    } else {
      result = result + s;
    }
  }
  if (result === "") {
    result = result + "00";
  } else if (result.length === 1) {
    result = result + "0";
  }
  return `${integer}.${result}`;
}

export function formatNumber(num: any) {
  if (Number(num) >= 0.0001) return num.toString();
  const str = new BigNumber(num).toFixed();
  const firstNonZeroIndex = str.split('').findIndex((char, index) => char !== '0' && index > str.indexOf('.'));
  if (firstNonZeroIndex === -1) return str;
  const subscript = firstNonZeroIndex - str.indexOf('.') - 1;
  const formatted =
      str.slice(0, str.indexOf('.') + 1) +
      '0' +
      subscriptToUnicode(subscript) +
      str.slice(firstNonZeroIndex);

  return formatted;
}

function subscriptToUnicode(num: number) {
  const subscriptDigits = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
  return num.toString().split('').map((digit) => subscriptDigits[Number(digit)]).join('');
}

export const splitWalletAddress = (address: string | null | undefined) => {
  if (address) {
    return address.substring(0, 5) + "..." + address.substring(address.length - 4);
  }
  return "";
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const setIntervalAndimmediately = (callback: Function, delay?: number,) => {
  const intervalId = setInterval(callback, delay);
  callback();
  return intervalId;
}
export const getLanguage = () => {
  const defaultLanguage = "en";
  const userLanguage = navigator.language;

  if (userLanguage.startsWith("zh")) {
    return "zh";
  } else if (userLanguage.startsWith("en")) {
    return "en";
  } else {
    return defaultLanguage;
  }
}

export const checkServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    if (
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      ((window.navigator as any).standalone === true)
    ) {
      console.log('PWA is installed and running in standalone mode.');
    } else {
      console.log('Running in browser tab, Service Worker not registered.');
      // window.addEventListener('load', () => {
        // navigator.serviceWorker.register('/sw.js')
        //   .then(registration => {
        //     console.log('Service Worker registered:', registration);
        //   })
        //   .catch(error => {
        //     console.error('Service Worker registration failed:', error);
        //   });
      // });
      // navigator.serviceWorker.getRegistrations().then(registrations => {
      //   registrations.forEach(registration => {
      //     registration.unregister().then(success => {
      //       if (success) {
      //         console.log('Service Worker unregistered successfully.');
      //       } else {
      //         console.log('Service Worker unregistration failed.');
      //       }
      //     });
      //   });
      // }).catch(error => {
      //   console.error('Error fetching Service Worker registrations:', error);
      // });
    }
  }
}

export function formatDateTime(timestamp: number): string {
  let time = Date.now();
  const serverTime = window.localStorage.getItem("server_time_key");
  if (serverTime) {
    time = Number(serverTime) * 1000;
  }
  if (timestamp.toString().length === 10) {
    timestamp = timestamp * 1000;
  }
  const diffTime = time - timestamp;
  const diff = Math.abs(diffTime);
  // console.log(`time:${time}, diffTime:${diffTime}, timestamp:${timestamp}`);

  const years = Math.floor(diff / (365 * 24 * 60 * 60 * 1000));
  const months = Math.floor((diff % (365 * 24 * 60 * 60 * 1000)) / (30 * 24 * 60 * 60 * 1000));
  const days = Math.floor((diff % (30 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  // const seconds = Math.floor((diff % (60 * 1000)) / 1000);
  let result = "";
  if (years > 0) {
    result = `${years}y ${months}mo ${days}d`;
  } else if (months > 0) {
    result = `${months}mo ${days}d`;
  } else if (days > 0) {
    result = `${days}d ${hours}h`;
  } else if (hours > 0) {
    result = `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    result = `${minutes}m`;
  }
  return result;
}

export const translateNumber = (amount: number): string => {
  if (amount >= 1000) {
    return (Math.floor(amount / 1000 * 100) / 100) + "K";
  }
  return amount + "";
};

export function formatTimestampToMouth(timestamp: string) {
  const date = new Date(timestamp);
  const timeOptions: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "numeric", hour12: true };
  const dateOptions: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };

  const timePart = new Intl.DateTimeFormat("en-US", timeOptions).format(date);
  const datePart = new Intl.DateTimeFormat("en-US", dateOptions).format(date);

  return `${timePart}, ${datePart}`;
}

// Thu. Feb 13
export function formatTimestampToMouth2(timestamp: any) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',   // "Thu"
    month: 'short',     // "Feb"
    day: 'numeric'      // "13"
  }).replace(',', '.');
}

export function formatTimestampToYear(timestamp: string) {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

export function formatTimestampToHours(timestamp: string) {
  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}
export function formatTimestampToHours2(timestamp: number) {
  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

export const translateAmount = (amount: number): string => {
  return translateAmountInner(amount, toDecimal2);
};

const translateAmountInner = (amount: number, fn: (arg0: number) => number = toDecimal2): string => {
  if (amount >= 1e12) {
    return fn(amount / 1e12) + "T";
  }
  if (amount >= 1e9) {
    return fn(amount / 1e9) + "B";
  }
  if (amount >= 1e6) {
    return fn(amount / 1e6) + "M";
  }
  if (amount >= 1000) {
    return fn(amount / 1000) + "K";
  }
  return amount + "";
};

function toDecimal2(num: number): number {
  return Math.floor(num * 100) / 100;
}

export const formatPriceAndNumber = (data: any, decimal: number) => {
  const price = BigNumber(formatPrice(data, decimal));
  if (Number(price) > 1) {
    return translateAmount(Number(price));
  }
  return formatNumber(price);
}

export const getRealChain = (data?: string) => {
  if (data) {
    return handleChain(data)
  } else {
    const localChain = getLocalChain();
    if (localChain) {
      return handleChain(localChain.name)
    }
  }
  return "";
}

const handleChain = (data: string) => {
  let chain = "";
  switch (data) {
    case "BSC":
      chain = "bsc";
      break;
    case "SOL":
      chain = "solana";
      break;
  }
  return chain;
}

export const getAmountUnit = (network: string) => {
  let result = "SOL";
  switch (network) {
    case "bsc":
      result = "BNB";
      break;
    case "solana":
      result = "SOL";
      break;
  }
  return result;
}

export const getNetwork = (network: string) => {
  let result = "Solana";
  switch (network) {
    case "bsc":
      result = "BSC";
      break;
    case "solana":
      result = "Solana";
      break;
  }
  return result;
}
