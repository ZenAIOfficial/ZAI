import { create } from "zustand";
import { requestCryptoRates } from "@/apis/trading"
import { isOnServerSide } from "@/utils/env";
import { setIntervalAndimmediately } from "@/utils/utils";


const CRYPTO_RATE_KEY = 'crypto_rate_store';

interface CryptoRateInner {
    sol: number;
    ton: number;
    bnb: number;
}

let intervalId: string | number | NodeJS.Timeout | undefined = undefined;
export const handleCryptoRate = async () => {
    if (isOnServerSide) {
        return;
    }

    cancelHandleCryptoRate();
    intervalId = setIntervalAndimmediately(async () => {
        const rates = await requestCryptoRates();
        const sol = rates.find(item => item.symbol === 'SOLUSDT')?.price || 0;
        const ton = rates.find(item => item.symbol === 'TONUSDT')?.price || 0;
        const bnb = rates.find(item => item.symbol === 'BNBUSDT')?.price || 0;
        const cryptoRate: CryptoRateInner = {
            sol,
            ton,
            bnb
        };
        localStorage.setItem(CRYPTO_RATE_KEY, JSON.stringify(cryptoRate));
        useCyptoRateStore.setState({ sol, ton, bnb });
    }, 15000);
};

export const cancelHandleCryptoRate = () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = undefined;
    }
};

const initialState = () => {
    if (isOnServerSide) {
        return {
            sol: 0.0,
            ton: 0.0,
            bnb: 0.0,
        }
    }
    const rateString = localStorage.getItem(CRYPTO_RATE_KEY);
    if (rateString) {
        const rate: CryptoRateInner = JSON.parse(rateString);
        return rate;
    }
    return {
        sol: 0.0,
        ton: 0.0,
        bnb: 0.0,
    }
};
export const useCyptoRateStore = create<CryptoRateInner>(() => ({
    ...initialState()
}));