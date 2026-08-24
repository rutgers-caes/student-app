import React, { useEffect, useState } from 'react';

export const ERROR_TOAST_DURATION = 10000;
export const DEFAULT_TOAST_DURATION = 5000;

export type MessageLevel = 'Info' | 'Warn' | 'Error' | 'Success';

type ToastPosition = 'top' | 'bottom';

type ToastMessage = {
  id: number;
  type: MessageLevel;
  message: string;
  position: ToastPosition;
  duration: number;
};

const toastEventName = 'itac-student-toast';

const toastStyles: Record<MessageLevel, React.CSSProperties> = {
  Success: { backgroundColor: '#049a58', color: '#fff' },
  Error: { backgroundColor: '#8e2828', color: '#fff' },
  Warn: { backgroundColor: '#ac8a00', color: '#fff' },
  Info: { backgroundColor: '#009bfb', color: '#fff' },
};

export function showToast(
  type: MessageLevel,
  message: string,
  position: ToastPosition = 'bottom',
  duration: number = DEFAULT_TOAST_DURATION,
) {
  window.dispatchEvent(new CustomEvent<ToastMessage>(toastEventName, {
    detail: {
      id: Date.now() + Math.random(),
      type,
      message,
      position,
      duration,
    },
  }));
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

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const toast = (event as CustomEvent<ToastMessage>).detail;
      setToasts((current) => [...current, toast]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, toast.duration);
    };

    const handleDismiss = (event: Event) => {
      const toastId = (event as CustomEvent<number>).detail;
      setToasts((current) => current.filter((item) => item.id !== toastId));
    };

    window.addEventListener(toastEventName, handleToast);
    window.addEventListener(`${toastEventName}:dismiss`, handleDismiss);
    return () => {
      window.removeEventListener(toastEventName, handleToast);
      window.removeEventListener(`${toastEventName}:dismiss`, handleDismiss);
    };
  }, []);

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(ToastStack, {
      position: 'top',
      toasts: toasts.filter((toast) => toast.position === 'top'),
    }),
    React.createElement(ToastStack, {
      position: 'bottom',
      toasts: toasts.filter((toast) => toast.position === 'bottom'),
    }),
  );
}

function ToastStack({ position, toasts }: { position: ToastPosition; toasts: ToastMessage[] }) {
  if (!toasts.length) return null;

  return React.createElement(
    'div',
    {
      style: {
        position: 'fixed',
        right: 20,
        [position]: 20,
        zIndex: 1000,
        display: 'grid',
        gap: 10,
        maxWidth: 360,
      },
      role: 'status',
      'aria-live': 'polite',
    },
    toasts.map((toast) => React.createElement(
      'button',
      {
        key: toast.id,
        type: 'button',
        onClick: () => window.dispatchEvent(new CustomEvent(`${toastEventName}:dismiss`, { detail: toast.id })),
        style: {
          ...toastStyles[toast.type],
          border: 0,
          borderRadius: 6,
          boxShadow: '0 12px 28px rgb(15 23 42 / 22%)',
          cursor: 'pointer',
          font: '600 14px/1.4 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          padding: '12px 14px',
          textAlign: 'left',
        },
      },
      toast.message,
    )),
  );
}
