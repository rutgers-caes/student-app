import { useEffect, useState } from 'react';
import type { AppToast } from './toasts';
import { subscribeToasts } from './toasts';

export function ToastViewport() {
  const [toasts, setToasts] = useState<AppToast[]>([]);

  useEffect(() => {
    return subscribeToasts((toast) => {
      setToasts((current) => [...current, toast]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, toast.duration);
    });
  }, []);

  return (
    <>
      <ToastStack position="top" toasts={toasts.filter((toast) => toast.position === 'top')} />
      <ToastStack position="bottom" toasts={toasts.filter((toast) => toast.position === 'bottom')} />
    </>
  );
}

function ToastStack({ position, toasts }: { position: 'top' | 'bottom'; toasts: AppToast[] }) {
  if (!toasts.length) return null;

  return (
    <div
      className={`fixed right-5 z-[100] grid w-[min(420px,calc(100vw-40px))] gap-3 ${position === 'top' ? 'top-5' : 'bottom-5'}`}
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          className="rounded-md px-4 py-3 text-sm font-semibold shadow-[0_18px_45px_rgb(15_23_42_/_22%)]"
          key={toast.id}
          style={toast.style}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
