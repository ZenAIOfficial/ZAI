import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Dialog } from 'primereact/dialog';
import { isOnServerSide } from "@/utils/env";
import { createI18nNext } from "@/locales/create";

export type AppContextState = object

export const AppContext = createContext<AppContextState | undefined>(undefined);

export function useApp(): AppContextState {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('appContext must be used within a AppProvider');
  }
  return context;
}

const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [i18n] = useState(createI18nNext());
  const [dialogData, setDialogData] = useState<{ visible: boolean, content: ReactNode | null }>({
    visible: false,
    content: null,
  });

  console.log("AppProvider....");
  useEffect(() => {
    if (isOnServerSide) {
      i18n.init();
    } else {
      // if on browser side, init i18n instance only once
      if (!i18n.instance.isInitialized)
      i18n.init();
    }
  })

  const showDialog = ({ content }: { content: ReactNode }) => {
    setDialogData({ visible: true, content });
  };

  const hideDialog = () => {
    setDialogData({ visible: false, content: null });
  };

  return (
    <AppContext.Provider value={{ showDialog, hideDialog }}>
      {children}
      <Dialog
        contentClassName="bg-transparent p-0"
        showHeader={false}
        visible={dialogData.visible}
        onHide={hideDialog}
        modal
      >
        {dialogData.content}
      </Dialog>
    </AppContext.Provider>
  );
};

export default AppProvider;
