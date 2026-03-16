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
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
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
    success: "border-profit/30 bg-profit/10 text-profit",
    error: "border-loss/30 bg-loss/10 text-loss",
    info: "border-velvet-600 bg-velvet-800 text-velvet-200",
  };

  return (
    <div
      role="status"
      className={`animate-slide-in rounded-lg border px-4 py-3 text-sm shadow-lg ${variantStyles[toast.variant]}`}
    >
      {toast.message}
    </div>
  );
}
