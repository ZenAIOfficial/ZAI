let _callApp: ((msg: string) => void) | undefined = undefined;


export const registerCallApp = (func: (msg: string) => void) => {
  _callApp = func;
}

export const unRegisterCallApp = () => {
  _callApp = undefined;
}

export const useMessage = () => {
  const callApp = (msg: string) => {
    if (_callApp) {
      _callApp(msg);
    }
  }
  return {callApp};
}