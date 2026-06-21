'use client';

import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  const showToast = useCallback((msg, t = 'info') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(msg);
    setType(t);
    setVisible(true);
    timerRef.current = setTimeout(() => setVisible(false), 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      <div className={`toast ${type} ${visible ? 'show' : ''}`}>
        <span className="material-symbols-outlined mr-2">
          {type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
        </span>
        {message}
      </div>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}