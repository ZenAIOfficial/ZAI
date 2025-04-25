/* eslint-disable @typescript-eslint/no-explicit-any */
import { isDebugEnvironment } from "@/utils/utils";
import { sendGAEvent } from "@next/third-parties/google";

let globalParam = {};
export const addLogParams = (param: any) => {
  console.error("log event, param: ", param);
  if (!isDebugEnvironment()) {
    globalParam = { ...globalParam, ...param };
  }
};
export const logEvent = (eventName: string, param: any) => {
  console.error("log event: ", eventName, param);
  if (!isDebugEnvironment()) {
    sendGAEvent("event", eventName, { ...param, ...globalParam });
  }
};


