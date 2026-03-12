"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_STYLES = {
  success: {
    bg: "bg-green-500/15",
    border: "border-green-500/30",
    icon: "text-green-400",
    text: "text-green-300",
    progress: "bg-green-500",
  },
  error: {
    bg: "bg-red-500/15",
    border: "border-red-500/30",
    icon: "text-red-400",
    text: "text-red-300",
    progress: "bg-red-500",
  },
  warning: {
    bg: "bg-yellow-500/15",
    border: "border-yellow-500/30",
    icon: "text-yellow-400",
    text: "text-yellow-300",
    progress: "bg-yellow-500",
  },
  info: {
    bg: "bg-blue-500/15",
    border: "border-blue-500/30",
    icon: "text-blue-400",
    text: "text-blue-300",
    progress: "bg-blue-500",
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const style = TOAST_STYLES[toast.type];
  const Icon = TOAST_ICONS[toast.type];
  const [isExiting, setIsExiting] = React.useState(false);

  React.useEffect(() => {
    const exitTimer = setTimeout(() => setIsExiting(true), toast.duration - 300);
    const removeTimer = setTimeout(onRemove, toast.duration);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.duration, onRemove]);

  return (
    <div
      className={`relative flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg shadow-black/20 min-w-[320px] max-w-[420px] overflow-hidden transition-all duration-300 ${style.bg} ${style.border} ${
        isExiting
          ? "opacity-0 translate-x-full"
          : "opacity-100 translate-x-0 animate-[slideIn_0.3s_ease-out]"
      }`}
    >
      <Icon size={20} className={`${style.icon} shrink-0 mt-0.5`} />
      <p className={`text-sm font-medium flex-1 ${style.text}`}>{toast.message}</p>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(onRemove, 300);
        }}
        className="text-gray-500 hover:text-white transition-colors shrink-0 mt-0.5"
      >
        <X size={14} />
      </button>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
        <div
          className={`h-full ${style.progress} rounded-full`}
          style={{
            animation: `shrink ${toast.duration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration: number = 3500) => {
      counterRef.current += 1;
      const id = `toast-${counterRef.current}-${Date.now()}`;
      setToasts((prev) => [...prev.slice(-4), { id, message, type, duration }]);
    },
    []
  );

  const success = useCallback(
    (message: string, duration?: number) => showToast(message, "success", duration),
    [showToast]
  );
  const error = useCallback(
    (message: string, duration?: number) => showToast(message, "error", duration),
    [showToast]
  );
  const warning = useCallback(
    (message: string, duration?: number) => showToast(message, "warning", duration),
    [showToast]
  );
  const info = useCallback(
    (message: string, duration?: number) => showToast(message, "info", duration),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, success, error, warning, info, removeToast }}
    >
      {children}

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={() => removeToast(toast.id)} />
          </div>
        ))}
      </div>

      {/* Keyframe animation */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}
