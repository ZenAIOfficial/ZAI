import { createContext, ReactNode, useContext, useState } from "react";
import {Dialog, DialogProps} from 'primereact/dialog';
import { hideDialogCallback, showDialogCallback } from "@/utils/dialogs";

export interface DialogContextState {
  showDialog: ({ content, position }: { content: ReactNode, position?: DialogProps["position"] }) => void;
  hideDialog: () => void;
}

export const DailogContext = createContext<DialogContextState | undefined>(undefined);

export function useDialogContextState(): DialogContextState {
  const context = useContext(DailogContext);
  if (!context) {
    throw new Error('dialogContext must be used within a DialogProvider');
  }
  return context;
}

const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [dialogData, setDialogData] = useState<{ visible: boolean, content: ReactNode | null, position?: DialogProps["position"] }>({
    visible: false,
    content: null,
    position: "center"
  });

  const showDialog = ({ content, position = "center" }: { content: ReactNode, position?: DialogProps["position"] }) => {
    showDialogCallback();
    setDialogData({ visible: true, content, position });
  };

  const hideDialog = () => {
    hideDialogCallback();
    setDialogData({ visible: false, content: null });
  };

  return (
    <DailogContext.Provider value={{ showDialog, hideDialog }}>
      {children}
      <Dialog
        contentClassName="bg-transparent p-0 m-0"
        showHeader={false}
        visible={dialogData.visible}
        onHide={hideDialog}
        position={dialogData.position}
        modal
      >
        {dialogData.content}
      </Dialog>
    </DailogContext.Provider>
  );
};

export default DialogProvider;
