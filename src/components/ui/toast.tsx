"use client";

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";

interface Toast {
  id: string;
  message: string;
  variant: "success" | "error" | "info";
}

interface ToastContextValue {
  toast: (message: string, variant?: Toast["variant"]) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, variant: Toast["variant"] = "info") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, variant }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext value={{ toast: addToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-20 left-4 right-4 z-50 flex flex-col gap-1.5 sm:bottom-6 sm:left-auto sm:right-6 sm:w-72"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const variantStyles = {
    success: "border-profit/25 bg-velvet-900 text-velvet-100",
    error: "border-loss/25 bg-velvet-900 text-velvet-100",
    info: "border-velvet-700/60 bg-velvet-900 text-velvet-100",
  };

  const dot = {
    success: "bg-profit",
    error: "bg-loss",
    info: "bg-velvet-500",
  };

  return (
    <div
      role="status"
      className={`animate-slide-up flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm shadow-xl shadow-black/40 ${variantStyles[toast.variant]}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot[toast.variant]}`} />
      {toast.message}
    </div>
  );
}
