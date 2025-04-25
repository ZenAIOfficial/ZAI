import {create} from "zustand";

export const TOAST_TIME = 3000;

export const showToast = (severity: string, detail: string, life: number) => {
        useToastStore.setState?.({toast: {detail:detail, severity: severity, life: life}, showing: true})
};

export interface Toast {
    detail: string;
    severity: string;
    life: number;
}
interface ToastInner{
    toast: Toast | undefined,
    showing: boolean,
}
const initialState = {
    toast: undefined as Toast|undefined,
    showing: false,
};

export const useToastStore = create<ToastInner>(() => ({
    ...initialState
}));