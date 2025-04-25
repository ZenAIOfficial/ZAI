import { createContext, ReactNode, useContext } from "react";

export interface MessageContextState {
  callApp: (message: string) => void;
}

export const MessageContext = createContext<MessageContextState | undefined>(undefined);

export function useMessage(): MessageContextState {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('messageContext must be used within a MessageProvider');
  }
  return context;
}

const MessageProvider: React.FC<{ children: ReactNode, callApp:  (message: string) => void }> = ({ children, callApp }) => {

  return (
    <MessageContext.Provider value={{ callApp }}>
      {children}
    </MessageContext.Provider>
  );
};

export default MessageProvider;
