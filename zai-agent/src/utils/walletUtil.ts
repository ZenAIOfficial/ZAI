/* eslint-disable @typescript-eslint/no-explicit-any */
import { useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import type { WalletName } from "@solana/wallet-adapter-base";
import bs58 from 'bs58'
import { showToast, TOAST_TIME } from "@/store/toastStore";
import { t } from "i18next";
import { getBlockhash } from "@/apis/transaction";
import { useCallback } from "react";

export const signMessageWithWallet = async (signMessage: ((message: Uint8Array) => Promise<Uint8Array>) | undefined, nonce: string) => {
    if (!signMessage) {
        throw new Error('Wallet does not support message signing!');
    }
    try {
        const message = `By signing, you agree to ZAI's Terms of Use and Privacy Policy. Your authentication nonce is:${nonce}`
        // console.log("message:", message)
        const encodedMessage = new TextEncoder().encode(message);
        const signedMessage = await signMessage(encodedMessage);
        const signature = bs58.encode(signedMessage);
        // console.log("signature:", signature)
        return signature;
    } catch (error) {
        console.error('sign message error:', error);
        throw new Error('sign message error, please try again');
    }
}

export const useIsWalletConnected = () => {
    const { wallet, connected } = useWallet();
    console.log("useIsWalletConnected:", wallet?.readyState, connected)
    return wallet && connected;
};
export const useConnectWallet = () => {
    const { wallet, wallets, connecting, connected, select, connect } = useWallet();

    return useCallback(
        async (walletName: WalletName, downloadUrl: string) => {
            console.log(wallets.map((it) => it.adapter.name), walletName, downloadUrl, wallet?.adapter.name)
            if (wallets && wallets.filter((it) => it.adapter.name === walletName).length === 0) {
                window.open(downloadUrl);
                return;
            }
            console.log('2222', walletName, downloadUrl, connected, connecting)
            if (!connected && !connecting) {
                select(walletName);
                await connect();
            }
        }, []
    );
};

const versionedTransactionToBase64 = (transaction: VersionedTransaction) => {
    const serializedTransaction = transaction.serialize();
    const binaryString = String.fromCharCode(...serializedTransaction);
    return btoa(binaryString);
}


export const walletSignTransaction = async (transactionStr: string, signTransaction: any) => {
    const transaction = VersionedTransaction.deserialize(Buffer.from(transactionStr, 'base64'));
    console.log(transaction);
    if (!signTransaction) {
        showToast("error", t("home.sign_not_available"), TOAST_TIME);
        return;
    }

    // const { blockhash, lastValidBlockHeight } = await mainConnection.getLatestBlockhash();
    // console.info('10000000000000333:', mainConnection);
    // console.info('10000000000000111:', blockhash);
    // console.info('10000000000000222:', lastValidBlockHeight);
    // transaction.message.recentBlockhash = blockhash;
    // console.log("kkkkkkkkkk:", transaction)

    try {
        const blockhashInfo = await getBlockhash();
        if (blockhashInfo && blockhashInfo.blockhash) {
            transaction.message.recentBlockhash = blockhashInfo.blockhash;
        }
    } catch (e) {
        console.log(e)
    }

    const signedTransaction = await signTransaction(transaction);
    return versionedTransactionToBase64(signedTransaction);
    // const serializedTransaction = signedTransaction.serialize();
    // const signature = await connection.sendTransaction(xxx, {maxRetries: 2, preflightCommitment: "confirmed"});
    // return {signature, xxx};
}
