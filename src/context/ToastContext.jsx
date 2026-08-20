import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3800) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, success: (msg) => addToast(msg, 'success'), error: (msg) => addToast(msg, 'error'), info: (msg) => addToast(msg, 'info') }}>
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
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
