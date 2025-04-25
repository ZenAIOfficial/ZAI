import { ReactNode } from "react";

const DialogTemplate: React.FC<{ children: ReactNode, className: string }> = ({children, className}) => {

    return (
        <div className={`${className}`}>
            {children}
        </div>
    )
}

export default DialogTemplate;