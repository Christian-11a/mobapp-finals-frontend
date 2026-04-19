import React, { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react';

export type ToastPosition = 'top' | 'bottom' | 'center';
export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  message: string;
  type: ToastType;
  position: ToastPosition;
  duration: number;
}

interface ToastContextType {
  toast: Toast | null;
  showToast: (
    message: string, 
    type?: ToastType, 
    position?: ToastPosition, 
    duration?: number
  ) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: null,
  showToast: () => {},
  hideToast: () => {}
});

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<Toast | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  const showToast = useCallback((
    message: string, 
    type: ToastType = 'info', 
    position: ToastPosition = 'top',
    duration: number = 3000
  ) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    setToast({ message, type, position, duration });
    
    timerRef.current = setTimeout(() => {
      setToast(null);
    }, duration);
  }, []);

  const value = useMemo(() => ({
    toast,
    showToast,
    hideToast
  }), [toast, showToast, hideToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
