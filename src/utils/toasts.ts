import type { CSSProperties } from 'react';

export const ERROR_TOAST_DURATION: number = 10000; // 30 seconds
export const DEFAULT_TOAST_DURATION: number = 5000; // 5 seconds

export type MessageLevel = "Info" | "Warn" | "Error" | "Success";
export type ToastPosition = "top" | "bottom";
export type AppToast = {
    id: number;
    duration: number;
    message: string;
    position: ToastPosition;
    style: CSSProperties;
    type: MessageLevel;
};

type ToastListener = (toast: AppToast) => void;

const listeners = new Set<ToastListener>();

export function subscribeToasts(listener: ToastListener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function getStyle(type: MessageLevel): CSSProperties {
    let style: CSSProperties;
    switch (type) {
        case "Success":
            style = { backgroundColor: "var(--color-status-success-solid)", color: "var(--color-primary-text)" };
            break;
        case "Error":
            style = { backgroundColor: "var(--color-status-error-solid)", color: "var(--color-primary-text)" };
            break;
        case "Warn":
            style = { backgroundColor: "var(--color-status-warn-solid)", color: "var(--color-primary-text)" };
            break;
        default:
            style = { backgroundColor: "var(--color-status-info-solid)", color: "var(--color-primary-text)" };
    }
    return style;
}

export function showToast(
    type: MessageLevel,
    message: string,
    position: ToastPosition = "bottom",
    duration: number = DEFAULT_TOAST_DURATION,
) {
    const toast = {
        id: Date.now() + Math.random(),
        duration,
        message,
        position,
        style: getStyle(type),
        type,
    };
    listeners.forEach((listener) => listener(toast));
}

export function errorToast(
  message: string,
  position: ToastPosition = 'bottom',
  duration: number = ERROR_TOAST_DURATION,
) {
  showToast('Error', message, position, duration);
}

export function successToast(message: string, position: ToastPosition = 'bottom') {
  showToast('Success', message, position);
}

export function warnToast(message: string, position: ToastPosition = 'bottom') {
  showToast('Warn', message, position);
}

export function infoToast(message: string, position: ToastPosition = 'bottom') {
  showToast('Info', message, position);
}
