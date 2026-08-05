/// <reference types="vite/client" />

declare module 'dompurify' {
  const DOMPurify: {
    sanitize: (html: string, options?: unknown) => string;
  };

  export default DOMPurify;
}

declare module 'react-toastify' {
  import type { CSSProperties } from 'react';

  export type ToastOptions = {
    autoClose?: number;
    hideProgressBar?: boolean;
    closeOnClick?: boolean;
    pauseOnHover?: boolean;
    draggable?: boolean;
    position?: string;
    style?: CSSProperties;
  };

  export const toast: {
    error: (message: string, options?: ToastOptions) => void;
    success: (message: string, options?: ToastOptions) => void;
    warn: (message: string, options?: ToastOptions) => void;
    info: (message: string, options?: ToastOptions) => void;
  };
}

declare module 'react-toastify/dist/ReactToastify.css';
