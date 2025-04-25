import { createI18nNext } from "@/locales/create";
import { isOnServerSide } from "./env";


const i18n = createI18nNext();

export const initLocales = () => {
  if (isOnServerSide) {
      i18n.init();
    } else {
      // if on browser side, init i18n instance only once
      if (!i18n.instance.isInitialized)
      i18n.init();
    }
}

export const getI18n = () => {
  return i18n.instance
}