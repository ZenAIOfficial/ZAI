import { create } from "zustand";
import { isOnServerSide } from "@/utils/env";
import { setIntervalAndimmediately } from "@/utils/utils";
import { token } from "./userStore";
import { requestUserTokens, UserToken, UserTokensResponse } from "@/apis/user";


const USER_TOKENS_KEY = 'user_tokens';


interface UserTokenInner {
    tokens: Array<UserToken>;
    totalBalance: number;
    commissionTotalUsdc: number;
    invitedFriends: number;
}
let intervalId: string | number | NodeJS.Timeout | undefined = undefined;
export const handleUserToken = async () => {
    if (isOnServerSide) {
        return;
    }
    const tokenVal = token();
    if (!tokenVal) {
        return;
    }

    cancelHandleUserToken();
    intervalId = setIntervalAndimmediately(async () => {
        const res = await requestUserTokens();
        localStorage.setItem(USER_TOKENS_KEY, JSON.stringify(res));
        userTokenStore.setState({ tokens: res.tokenList, totalBalance: res.totalBalance, commissionTotalUsdc: res.commissionTotalUsdc, invitedFriends: res.invitedFriends });
    }, 15000);
};

export const cancelHandleUserToken = () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = undefined;
    }
};

const initialState = () => {
    if (isOnServerSide) {
        return {
            totalBalance: 0.00,
            tokens: [],
            commissionTotalUsdc: 0,
            invitedFriends: 0,
        }
    }
    const rateString = localStorage.getItem(USER_TOKENS_KEY);
    if (rateString) {
        const res: UserTokensResponse = JSON.parse(rateString);
        return {
            totalBalance: res.totalBalance,
            tokens: res.tokenList,
            commissionTotalUsdc: res.commissionTotalUsdc,
            invitedFriends: res.invitedFriends,
        };
    }
    return {
        totalBalance: 0.00,
        tokens: [],
        commissionTotalUsdc: 0,
        invitedFriends: 0,
    }
};
export const userTokenStore = create<UserTokenInner>(() => ({
    ...initialState()
}));