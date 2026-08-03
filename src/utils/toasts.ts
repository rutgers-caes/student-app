import { toast, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const ERROR_TOAST_DURATION: number = 10000; // 30 seconds
export const DEFAULT_TOAST_DURATION: number = 5000; // 5 seconds

export type MessageLevel = "Info" | "Warn" | "Error" | "Success";

function getOptions(type: MessageLevel, position: "top" | "bottom", duration: number = 3000): ToastOptions {
    let style: React.CSSProperties;
    switch (type) {
        case "Success":
            style = { backgroundColor: "#049a58", color: "#fff" };
            break;
        case "Error":
            style = { backgroundColor: "#8e2828", color: "#fff" };
            break;
        case "Warn":
            style = { backgroundColor: "#ac8a00", color: "#fff" };
            break;
        default:
            style = { backgroundColor: "#009bfb", color: "#fff" };
    }
    return {
        autoClose: duration,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        position: position === "top" ? "top-right" : "bottom-right",
        style,
    };
}

export function showToast(
    type: MessageLevel,
    message: string,
    position: "top" | "bottom" = "bottom",
    duration: number = DEFAULT_TOAST_DURATION,
) {
    const opts = getOptions(type, position, duration);
    switch (type) {
        case "Error":
            toast.error(message, opts);
            break;
        case "Success":
            toast.success(message, opts);
            break;
        case "Warn":
            toast.warn(message, opts);
            break;
        case "Info":
            toast.info(message, opts);
            break;
    }
}

export function errorToast(
    message: string,
    position: "top" | "bottom" = "bottom",
    duration: number = ERROR_TOAST_DURATION,
) {
    showToast("Error", message, position, duration);
}

export function successToast(message: string, position: "top" | "bottom" = "bottom") {
    showToast("Success", message, position);
}

export function warnToast(message: string, position: "top" | "bottom" = "bottom") {
    showToast("Warn", message, position);
}

export function infoToast(message: string, position: "top" | "bottom" = "bottom") {
    showToast("Info", message, position);
}
