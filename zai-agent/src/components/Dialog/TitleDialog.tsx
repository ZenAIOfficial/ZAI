// import dialogCloseImg from "@/assets/ic_dialog_close.svg";
import dialogCloseImg from "@/assets/ic_dialog_close_light.svg";
import dialogBackImg from "@/assets/ic_login_back.svg";
import Image from "next/image";

interface Props {
    className?: string;
    title?: string | null;
    onBack?: (() => void) | null;
    onCancel?: (() => void) | null;
}
const TitleDialog: React.FC<Props> = ({ className, title, onBack, onCancel }) => {

    return (
        <div className={`flex flex-row items-center w-full ${className}`}>
            {
                onBack && <Image className="w-6 h-6 mr-auto cursor-pointer" src={dialogBackImg} onClick={() => onBack()} alt={""} />
            }
            {
                title && <span className="flex-1 text-xl text-black font-semibold text-center">{ title }</span>
            }
            {
                onCancel && <Image className="ml-auto w-6 h-6 cursor-pointer" src={dialogCloseImg} onClick={() => onCancel()} alt={""} />
            }
        </div>
    );
};

export default TitleDialog;