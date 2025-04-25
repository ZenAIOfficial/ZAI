import Axios, {
    type AxiosInstance,
    type AxiosError,
    type AxiosResponse,
    type AxiosRequestConfig,
    InternalAxiosRequestConfig,
} from "axios";
import { aesDecrypted, aesEncode, generateRandom, generateSign, rsaEncode } from "./crucpto";
import { showToast, TOAST_TIME } from "@/store/toastStore.ts";
import { isDebugEnvironment } from "@/utils/utils";
import { token } from "@/store/userStore";
import {TrendParams} from "@/api/trading";

const server_time_key = "server_time_key";
const time_difference = "time_difference";

/**
* @description: ContentType
*/
export enum ContentTypeEnum {
    // form-data qs
    FORM_URLENCODED = "application/x-www-form-urlencoded;charset=UTF-8",
    // form-data upload
    FORM_DATA = "multipart/form-data;charset=UTF-8",
    // json
    JSON = "application/json;charset=UTF-8"
}

export enum HeaderParamsEnum {
    // token key
    ACCESS_TOKEN = "Access-Token"
}

/**
 * @description: code
 */
export enum ResultEnum {
    SUCCESS = 200
}

// default axios instance config
const configDefault = {
    headers: {
        "Content-Type": ContentTypeEnum.JSON,
    },
    timeout: 0,
    baseURL: import.meta.env.VITE_BASE_API,
    data: {},
};

// path white list
const whiteList = ["/auth/me", "/health-check"];
const ignoreToastList = ["/user/info"];

class Http {
    private static axiosInstance: AxiosInstance;
    private static axiosConfigDefault: AxiosRequestConfig;

    private getHeader(): Record<string, string> {
        const tokenVal = token();
        if (tokenVal) {
            return {
                "token": tokenVal,
                "lang": "en",
                "SVC": "zshot",
            };
        } else {
            return {
                "lang": "en",
                "SVC": "zshot",
            }
        }
    }
    private httpInterceptorsRequest(): void {
        Http.axiosInstance.interceptors.request.use(
            (config) => {
                const header = this.getHeader();
                for (const [key, value] of Object.entries(header)) {
                    config.headers[key] = value;
                }
                this.signAndEncrypted(config);
                return config;
            },
            (error: AxiosError) => {
                showToast("error", error.message, TOAST_TIME)
                return Promise.reject(error);
            },
        );
    }

    private httpInterceptorsResponse(): void {
        Http.axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => {
                if (response.config.url === "/ai/chat") {
                    return response;
                }
                // const toast = getToastInstance();
                const { code } = response.data;
                const isSuccess = Reflect.has(response.data, "code") && code === ResultEnum.SUCCESS;
                if (isSuccess) {
                    const serverTime = response.headers.date;
                    if (serverTime) {
                        const serverTimeStamp = Date.parse(serverTime) / 1000;
                        const clientTimeStamp = Date.now() / 1000;
                        // console.log("server",serverTimeStamp,clientTimeStamp)
                        window.localStorage.setItem(time_difference, clientTimeStamp - serverTimeStamp + "");
                    }
                    if (response.data.timeStamp) {
                        window.localStorage.setItem(server_time_key, response.data.timeStamp + "");
                    }
                    if (!response.data.result || response.data.result === "") {
                        return { result: "", code: response.data.code, message: response.data.message };
                    }
                    if (response.config.headers.has("aesKey")) {
                        const key = response.config.headers["aesKey"];
                        const aesKey = this.keys.get(key) || '';
                        this.keys.delete(key);
                        const result = JSON.parse(aesDecrypted(aesKey, response.data.result));
                        if (isDebugEnvironment()) {
                            console.log("response", response.config.url);
                            console.log(result);
                        }
                        return { result: result, code: response.data.code, message: response.data.message };
                    }
                    if (isDebugEnvironment()) {
                        console.log("response", response.config.url);
                        console.log(response.data);
                    }
                    return response.data;
                } else {
                    if (response.config.url === "/web/transaction/status") {
                        return Promise.reject(response.data);
                    }
                    if (code === 401) {
                        showToast("error", `${response.data.message}`, TOAST_TIME);
                    } else {
                        showToast("error", `${response.data.message}`, TOAST_TIME);
                    }
                    return Promise.reject(response.data);
                }
            },
            (error: AxiosError) => {
                let message = "";
                // HTTP status code
                const status = error.response?.status;
                switch (status) {
                    case 400:
                        message = "Request error";
                        break;
                    case 403:
                        message = "Access denied";
                        break;
                    case 404:
                        message = `Not Found: ${error.response?.config.url}`;
                        break;
                    case 500:
                        message = "Server internal error";
                        break;
                    default:
                        message = "Network connection failure";
                }
                showToast("error", message, TOAST_TIME);
                console.log(message);
                return Promise.reject(error);
            },
        );
    }

    constructor(config: AxiosRequestConfig) {
        Http.axiosConfigDefault = config;
        Http.axiosInstance = Axios.create(config);
        this.httpInterceptorsRequest();
        this.httpInterceptorsResponse();
    }

    private keys: Map<string, string> = new Map<string, string>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private signAndEncrypted(config: InternalAxiosRequestConfig<any>) {
        if (config.url && hasWhiteList(config.url)) {
            return;
        }
        if (config.headers.has("aesKey")) {
            return;
        }
        const aesKey = generateRandom(16);
        const enEncryptAesKey = rsaEncode(aesKey).toString();
        this.keys.set(enEncryptAesKey, aesKey);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const map: any = {};
        map["timestamp"] = new Date().getTime();
        map["nonce"] = generateRandom(36);
        map["aesKey"] = enEncryptAesKey;
        map["appVersion"] = process.env.VITE_APP_VERSION;
        const res = Object.keys(map).sort((a, b) => a.localeCompare(b));
        const stringBuffer = res
            .map((key) => {
                return `${key}${map[key]}`;
            })
            .join("");

        map["sign"] = generateSign(stringBuffer);
        for (const key in map) {
            config.headers[key] = map[key];
        }

        if (config.method === "post" && config.data) {
            if (isDebugEnvironment()) {
                console.log("request", config.url, config.data);
            }
            config.data = {
                encryptBody: aesEncode(aesKey, JSON.stringify(config.data)),
            };
        }
    }

    // common request method
    public request<T>(paramConfig: AxiosRequestConfig): Promise<T> {
        const config = { ...Http.axiosConfigDefault, ...paramConfig };
        return new Promise((resolve, reject) => {
            Http.axiosInstance
                .request(config)
                .then((response: unknown) => {
                    resolve(response as T);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    public requestObject<T>(paramConfig: AxiosRequestConfig): Promise<T> {
        const config = { ...Http.axiosConfigDefault, ...paramConfig };
        return new Promise((resolve, reject) => {
            Http.axiosInstance
                .request(config)
                .then((response: unknown) => {
                    resolve((response as ObjectResult<T>).result);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    public requestList<T>(paramConfig: AxiosRequestConfig): Promise<Array<T>> {
        const config = { ...Http.axiosConfigDefault, ...paramConfig };
        return new Promise((resolve, reject) => {
            Http.axiosInstance
                .request(config)
                .then((response: unknown) => {
                    resolve((response as ListResult<T>).result);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    public requestTokenList<T>(paramConfig: AxiosRequestConfig): Promise<T> {
        const config = { ...Http.axiosConfigDefault, ...paramConfig };
        return new Promise((resolve, reject) => {
            Http.axiosInstance
                .request(config)
                .then((response: unknown) => {
                    if (typeof response === "object" && response !== null) {
                        (response as ObjectResult2<T>)["params"] = config.params;
                    }
                    resolve((response as T));
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    public async chat(path: string) {
        const config = this.getHeader();
        return fetch(configDefault.baseURL + path, {
            method: "GET",
            headers: config,
        });
    }
}


const hasWhiteList = (url: string) => {
    return whiteList.includes(url);
}

export const http = new Http(configDefault);


export interface ListResult<T> {
    code: number;
    message: string;
    result: Array<T>;
}

export interface ObjectResult<T> {
    code: number;
    message: string;
    result: T;
}

export interface ObjectResult2<T> {
    code: number;
    message: string;
    params: TrendParams;
    result: T;
}