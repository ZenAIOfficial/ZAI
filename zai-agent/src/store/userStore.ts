'use client'
import { create } from "zustand";
import {ChainInfo, login, sync, syncUserInfo, TokenRecent, User} from "@/apis/user"
import { WebAnalyzeShareInfoReq } from "@/apis/ai/chat";
import { getLanguage } from "@/utils/utils";
import { v4 as uuidv4 } from 'uuid';
import {userTokenStore} from "@/store/userTokenStore";
import { LAST_LOGIN_WALLET_PLATFORM } from "@/utils/constants";

const KEY_DEVICE_ID_KEY = 'key_device_id';
const FIRST_KEY = '__newton_first_launch__';
const USER_LOGIN_REDIRECT_KEY = '__user_login_redirect__';
const USER_KEY = 'user_store';
const LOCAL_TIME_KEY = 'local_time';
const LOGIN_TYPE = '__login_type__';
const TRANSFER_CODE = '__transfer_code__';
const WEB_ANALYZE_SHARE_INFO_CODE = '__web_analyze_shore_info__';
const NEXT_WEB_ANALYZE_SHARE_INFO_CODE = '__next_web_analyze_shore_info__';
const LOCAL_ADDRESS_RECENTS = '__local_address_recents__';
const USER_LANG = '__lang__';
const LOCAL_CHAIN = 'local_chain';
const testToken = '';
let tokenValue = '';

export const token = () => {
    return tokenValue;
}
export const localDate = () => {
    const strDate = localStorage.getItem(LOCAL_TIME_KEY);
    if (strDate) {
        return Number(strDate);
    } else {
        return 0;
    }
}

export const setLoginType = (type: string) => {
    localStorage.setItem(LOGIN_TYPE, type);
}

export const setTransferCode = (code: string) => {
    localStorage.setItem(TRANSFER_CODE, code);
}

export const getTransferCode = () => {
    return localStorage.getItem(TRANSFER_CODE);
}

export const getSelectLang = () => {
    const lang = localStorage.getItem(USER_LANG);
    if (lang) {
        return lang;
    } else {
        return getLanguage()
    }
}

export const setSelectLang = (lang: string) => {
    localStorage.setItem(USER_LANG, lang);
}

export const setUserLoginRedirectUrl = (url: string) => {
    localStorage.setItem(USER_LOGIN_REDIRECT_KEY, url);
}
export const getUserLoginRedirectUrl = () => {
    const url = localStorage.getItem(USER_LOGIN_REDIRECT_KEY);
    if (url) {
        localStorage.removeItem(USER_LOGIN_REDIRECT_KEY);
        return url;
    }
    return '/';
}
export const addSearchRecent = (tokenRecent: TokenRecent) => {
    if (tokenRecent.address === undefined || tokenRecent.address === null || tokenRecent.address === "") {
        return;
      }
      let index = -1;
      const localRecents: Array<TokenRecent> = [...useUserStore.getState().recent];
      for (let i = 0; i < localRecents.length; i++) {
        if (localRecents[i].address === tokenRecent.address) {
          index = i;
          break;
        }
      }
      if (index >= 0) {
        localRecents.splice(index, 1);
      }
      localRecents.unshift({ symbol: tokenRecent.symbol, image: tokenRecent.image, address: tokenRecent.address, network: tokenRecent.network });
      if (localRecents.length > 5) {
        localRecents.splice(5, localRecents.length - 5);
      }
      useUserStore.setState({ recent: localRecents });
      window.localStorage.setItem(LOCAL_ADDRESS_RECENTS, JSON.stringify(localRecents));
}

export const getSearchRecentList = () => {
    return JSON.parse(window.localStorage.getItem(LOCAL_ADDRESS_RECENTS) || "[]");
}

export const getLocalChain = (): ChainInfo => {
    return JSON.parse(window.localStorage.getItem(LOCAL_CHAIN) || "{}");
}

export const updateLocalChain = (chainInfo: ChainInfo) => {
    useUserStore.setState({chain: chainInfo});
    return window.localStorage.setItem(LOCAL_CHAIN, JSON.stringify(chainInfo));
}

export const clearSearchRecent = () => {
    useUserStore.setState({ recent: [] });
    window.localStorage.setItem(LOCAL_ADDRESS_RECENTS, JSON.stringify([]));
}

export const getDeviceId = () => {
    const deviceId = localStorage.getItem(KEY_DEVICE_ID_KEY);
    if (deviceId) {
        return deviceId;
    } else {
        const newDeviceId = uuidv4();
        localStorage.setItem(KEY_DEVICE_ID_KEY, newDeviceId);
        return newDeviceId;
    }
}

export const saveDeviceId = (deviceId: string) => {
    localStorage.setItem(KEY_DEVICE_ID_KEY, deviceId);
}

export const logoutAndClearEnv = () => {
        const tmp = localStorage.getItem(LAST_LOGIN_WALLET_PLATFORM) || "";
        const deviceId = getDeviceId();
        window.localStorage.clear();
        localStorage.setItem(LAST_LOGIN_WALLET_PLATFORM, tmp);
        saveDeviceId(deviceId);
}
export const getWebAnalyzeShareInfoReq = (): WebAnalyzeShareInfoReq | undefined => {
    const str = localStorage.getItem(WEB_ANALYZE_SHARE_INFO_CODE);
    if (str) {
        return JSON.parse(str);
    } else {
        return undefined;
    }
}

export const clearWebAnalyzeShareInfoReq = () => {
    localStorage.removeItem(WEB_ANALYZE_SHARE_INFO_CODE);
}

export const setWebAnalyzeShareInfoReq = (req: WebAnalyzeShareInfoReq) => {
    localStorage.setItem(WEB_ANALYZE_SHARE_INFO_CODE, JSON.stringify(req));
}

export const getNextWebAnalyzeShareInfoReq = (): WebAnalyzeShareInfoReq | undefined => {
    const str = localStorage.getItem(NEXT_WEB_ANALYZE_SHARE_INFO_CODE);
    if (str) {
        return JSON.parse(str);
    } else {
        return undefined;
    }
}

export const clearNextWebAnalyzeShareInfoReq = () => {
    localStorage.removeItem(NEXT_WEB_ANALYZE_SHARE_INFO_CODE);
}

export const setNextWebAnalyzeShareInfoReq = (req: WebAnalyzeShareInfoReq) => {
    localStorage.setItem(NEXT_WEB_ANALYZE_SHARE_INFO_CODE, JSON.stringify(req));
}

export const clearTransferCode = () => {
    localStorage.removeItem(TRANSFER_CODE);
}

export const getLoginType = () => {
    return localStorage.getItem(LOGIN_TYPE);
}

export const clearLoginType = () => {
    localStorage.removeItem(LOGIN_TYPE);
}

export const refreshUserInfo = async () => {
    const user = await syncUserInfo();
    if (user) {
        user.token = useUserStore.getState().userInfo?.token || "";
        useUserStore.setState({ userInfo: user });
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
}

export const updateUser = (user: User) => {
    if (user) {
        useUserStore.setState({ userInfo: user });
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
}
export const loginToService = async (address: string, signature: string, walletName: string, ref: string | null) => {
    const userString = localStorage.getItem(USER_KEY);
    if (userString) {
        const user: User = JSON.parse(userString);
        tokenValue = user.token;
        const newUser = await sync();

        if (newUser) {
            newUser.token = tokenValue;
            useUserStore.setState({ userInfo: newUser });
            localStorage.setItem(LOCAL_TIME_KEY, Date.now() + '')
            localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        }
    } else {
        let user;
        if (testToken.length == 0) {
            let sourceSubType = 1
            if (walletName === "OKX Wallet") {
                sourceSubType = 2;
            } else if (walletName === "Solflare") {
                sourceSubType = 3;
            }
            if (ref) {
                user = await login({ address: address, signature: signature, source: 2, sourceSubType: sourceSubType, inviter: ref });
            } else {
                user = await login({ address: address, signature: signature, source: 2, sourceSubType: sourceSubType });
            }
        } else {
            tokenValue = testToken;
            user = await sync();
            user.token = testToken;
        }
        if (user) {
            tokenValue = user.token;
            useUserStore.setState({ userInfo: user });
            localStorage.setItem(LOCAL_TIME_KEY, Date.now() + '')
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
    }
};

export const loginXToService = async (state: string, code: string, ref: string | null) => {
    // console.error("loginXToService")
    const userString = localStorage.getItem(USER_KEY);
    if (userString) {
        const user: User = JSON.parse(userString);
        tokenValue = user.token;
        const newUser = await sync();

        if (newUser) {
            newUser.token = tokenValue;
            useUserStore.setState({ userInfo: newUser });
            localStorage.setItem(LOCAL_TIME_KEY, Date.now() + '')
            localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        }
    } else {
        let user;
        if (testToken.length == 0) {
            if (ref) {
                user = await login({ state: state, code: code, source: 3, inviter: ref });
            } else {
                user = await login({ state: state, code: code, source: 3 });
            }
        } else {
            tokenValue = testToken;
            user = await sync();
            user.token = testToken;
        }
        if (user) {
            tokenValue = user.token;
            useUserStore.setState({ userInfo: user });
            localStorage.setItem(LOCAL_TIME_KEY, Date.now() + '')
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
    }
}

export const loginTiktokToService = async (state: string, code: string, ref: string | null) => {
    // console.error("loginXToService")
    const userString = localStorage.getItem(USER_KEY);
    if (userString) {
        const user: User = JSON.parse(userString);
        tokenValue = user.token;
        const newUser = await sync();

        if (newUser) {
            newUser.token = tokenValue;
            useUserStore.setState({ userInfo: newUser });
            localStorage.setItem(LOCAL_TIME_KEY, Date.now() + '')
            localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        }
    } else {
        let user;
        if (testToken.length == 0) {
            if (ref) {
                user = await login({ state: state, code: code, source: 4, inviter: ref });
            } else {
                user = await login({ state: state, code: code, source: 4 });
            }
        } else {
            tokenValue = testToken;
            user = await sync();
            user.token = testToken;
        }
        if (user) {
            tokenValue = user.token;
            useUserStore.setState({ userInfo: user });
            localStorage.setItem(LOCAL_TIME_KEY, Date.now() + '')
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
    }
}

export const addUserCoin = (price: number) => {
    const user = useUserStore.getState().userInfo;
    if (user) {
        const newUser = {
            ...user,
            totalCoins: user.totalCoins + price,
        };
        console.log('addUserCoin', price, newUser);
        useUserStore.setState({ userInfo: newUser });
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    }
}

export const isLogin = () => {
    // console.log("tttt:", useUserStore.getState().userInfo)
    return useUserStore.getState().userInfo;
}

export const pushFirstComplete = () => {
    useUserStore.setState({ first: false });
    localStorage.setItem(FIRST_KEY, "1");
}

export const pushStartLayout = () => {
    useUserStore.setState({ startLayout: true });
}
export const getFirstKeyInfo = () => {
    const isFirst = localStorage.getItem(FIRST_KEY) || "";
    return isFirst === "2";
}
export const pushSecondComplete = () => {
    useUserStore.setState({ first: false });
    localStorage.setItem(FIRST_KEY, "2");
}

export const logout = () => {
    tokenValue = "";
    useUserStore.setState({
        userInfo: undefined,
    });
    userTokenStore.setState({
        totalBalance: 0.00,
        tokens: [],
        commissionTotalUsdc: 0,
        invitedFriends: 0,
    })
}

export const setKickOut = (value: boolean) => {
    console.error('hahahah');
    useUserStore.setState({
        kickOut: value
    })
}


interface UserInner {
    userInfo: User | undefined;
    first: boolean;
    startLayout: boolean;
    kickOut: boolean;
    recent: Array<TokenRecent>;
    chain: ChainInfo | undefined;
}

const initialState = () => {
    if (typeof window === "undefined") {
        return {
            userInfo: undefined,
            first: false,
            startLayout: false,
            kickOut: false,
            recent: [],
            chain: undefined,
        }
    }

    const isFirst = localStorage.getItem(FIRST_KEY) || "";
    const userString = localStorage.getItem(USER_KEY);
    if (userString) {
        const user: User = JSON.parse(userString);
        tokenValue = user.token;
        return {
            userInfo: user,
            first: isFirst.length === 0,
            startLayout: false,
            kickOut: false,
            recent: getSearchRecentList(),
            chain: getLocalChain(),
        }
    }
    return {
        userInfo: undefined,
        first: isFirst.length === 0,
        startLayout: false,
        kickOut: false,
        recent: getSearchRecentList(),
        chain: getLocalChain(),
    }
};
export const useUserStore = create<UserInner>(() => ({
    ...initialState()
}));