
import { ReceivedCrypto } from "@/apis/user";
import { useDialogContextState } from "@/components/Context/DialogProvider";
import AddFundsDialog from "@/components/Dialog/AddFundsDialog";
import DelectDialog from "@/components/Dialog/DeleteDialog";
import DepositCodeDialog from "@/components/Dialog/DepositCodeDialog";
import DepositWalletAmountDialog from "@/components/Dialog/DepositWalletAmountDialog";
import LoginDialog from "@/components/Dialog/LoginDialog";
import LoginLoadingDialog from "@/components/Dialog/LoginLoadingDialog";
import LoginShareDialog from "@/components/Dialog/LoginShareDialog";
import SelectLangWithCatchShare from "@/components/Dialog/SelectLangWithCatchShare";
import SelectWalletDialog from "@/components/Dialog/SelectWalletDialog";
import ThirdLoginLoadingDialog from "@/components/Dialog/ThirdLoginLoadingDialog";
import RewardShareDialog from "@/components/Dialog/RewardShareDialog";
import TransactionDialog from "@/components/Dialog/TransactionDialog";
import {TrendInfo} from "@/apis/trading";
import SlippageDialog from "@/components/Dialog/SlippageDialog";
import SearchDialog from "@/components/Dialog/SearchDialog";
import AddressDialog from "@/components/Dialog/AddressDialog";


export function useDialog() {
  const { showDialog, hideDialog } = useDialogContextState();

  const showLoginDialog = () => {
    showDialog({
      content: (<LoginDialog />)
    });
  };

  const showSelectWalletDialog = (way: string) => {
    showDialog({
      content: (<SelectWalletDialog way={way} />)
    });
  }

  const showLoginLoadingDialog = (walletName: string) => {
    showDialog({
      content: (<LoginLoadingDialog walletName={walletName} />)
    });
  }

  const showThirdLoginLoadingDialog = (loginType: string, state: string | null = null, code: string | null = null, error: string | null = null) => {
    showDialog({
      content: (<ThirdLoginLoadingDialog loginType={loginType} state={state} code={code} error={error} />)
    });
  };

  const showDelectDialog = (onConfirm: () => void) => {
    showDialog({
      content: (<DelectDialog onConfirm={onConfirm} />)
    });
  }

  const showLoginShareDialog = (receivedCrypto: ReceivedCrypto, canBackRoot: boolean = false) => {
    showDialog({
      content: (<LoginShareDialog receivedCrypto={receivedCrypto} canBackRoot={canBackRoot} />)
    });
  }

  const showAddFundsDialog = () => {
    showDialog({
      content: (<AddFundsDialog />),
    });
  }

  const showDepositWalletAmountDialog = (walletName: string) => {
    showDialog({
      content: (<DepositWalletAmountDialog walletName={walletName} />),
    });
  }

  const showDepositCodeDialog = () => {
    showDialog({
      content: (<DepositCodeDialog />),
    });
  }

  const showSelectLangWithCatchShare = (onConfirm?: (lang: string) => void) => {
    showDialog({
      content: (<SelectLangWithCatchShare onConfirm={onConfirm}/>)
    });

  }

  const showRewardShareDialog = () => {
    showDialog({
      content: (<RewardShareDialog />)
    });

  }

  const showTransactionDialog = (type: number, trendInfo: TrendInfo) => {
    showDialog({
      content: (<TransactionDialog type={type} trendInfo={trendInfo} />),
      position: "bottom"
    });
  }

  const showSearchDialog = () => {
    showDialog({
      content: (<SearchDialog />),
      position: "bottom"
    });
  }

  const showAddressDialog = () => {
    showDialog({
      content: (<AddressDialog />),
    });
  }

  return {
    showDialog, hideDialog,
    showLoginDialog,
    showSelectWalletDialog,
    showLoginLoadingDialog,
    showDelectDialog,
    showThirdLoginLoadingDialog,
    showLoginShareDialog,
    showAddFundsDialog,
    showDepositWalletAmountDialog,
    showDepositCodeDialog,
    showSelectLangWithCatchShare,
    showRewardShareDialog,
    showTransactionDialog,
    showSearchDialog,
    showAddressDialog
  };
}