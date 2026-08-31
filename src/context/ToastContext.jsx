import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success', duration = 3800) => {
    if (!message) return;
    const msgStr = String(message);

    setToasts(prev => {
      // Prevent identical message spam in a short window
      if (prev.some(t => t.message === msgStr)) {
        return prev;
      }
      const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
      const next = [...prev.slice(-4), { id, message: msgStr, type }]; // Keep max 5 toasts

      if (duration > 0) {
        setTimeout(() => {
          setToasts(current => current.filter(t => t.id !== id));
        }, duration);
      }

      return next;
    });
  }, []);

  const success = useCallback((msg, duration) => addToast(msg, 'success', duration), [addToast]);
  const error = useCallback((msg, duration) => addToast(msg, 'error', duration), [addToast]);
  const info = useCallback((msg, duration) => addToast(msg, 'info', duration), [addToast]);

  const value = useMemo(() => ({
    addToast,
    removeToast,
    success,
    error,
    info
  }), [addToast, removeToast, success, error, info]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Luxury Toast Notification Display */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 border shadow-2xl backdrop-blur-md transition-all duration-300 animate-fade-in ${
              toast.type === 'error'
                ? 'bg-[var(--color-desert-light)] border-rose-500/50 text-[var(--color-earth-dark)]'
                : toast.type === 'info'
                ? 'bg-[var(--color-desert-light)] border-[var(--color-terracotta)]/50 text-[var(--color-earth-dark)]'
                : 'bg-[var(--color-desert-light)] border-[var(--color-terracotta)] text-[var(--color-earth-dark)]'
            }`}
            style={{
              boxShadow: '0 20px 40px -15px rgba(93, 29, 1, 0.3), 0 0 25px rgba(180, 86, 37, 0.2)'
            }}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-500" />
              ) : toast.type === 'info' ? (
                <Info className="w-5 h-5 text-[var(--color-terracotta)]" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-[var(--color-terracotta)]" />
              )}
            </div>
            <div className="flex-1 text-xs sm:text-sm font-sans tracking-wide leading-relaxed font-bold">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[var(--color-terracotta-deep)] hover:text-[var(--color-earth-dark)] transition-colors p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      addToast: () => {},
      removeToast: () => {},
      success: () => {},
      error: () => {},
      info: () => {}
    };
  }
  return context;
}

