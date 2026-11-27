import React, { createContext, useCallback, useContext, useState } from 'react';

interface ToastContextValue {
  showToast: (message: string, kind?: 'info' | 'error') => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; kind: 'info' | 'error' } | null>(null);

  const showToast = useCallback((message: string, kind: 'info' | 'error' = 'info') => {
    setToast({ message, kind });
    window.setTimeout(() => setToast(null), 2800);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-control border text-xs font-medium shadow-popover ${
            toast.kind === 'error'
              ? 'bg-[#2a1216] border-danger/50 text-red-200'
              : 'bg-surface-elevated border-border-strong text-text'
          }`}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
