// contexts/AuthContext.jsx
'use client';

import { createContext, useContext, useState, useMemo } from 'react';

const AuthContext = createContext(undefined);

const DEMO_USER = {
  id: 1,
  email: 'demo@clinic.com',
  clinicName: 'Demo Clinic',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEMO_USER);
  const [loading, setLoading] = useState(false);

  const login = async () => DEMO_USER;
  const signup = async () => DEMO_USER;
  const logout = () => { /* no‑op */ };

  const value = useMemo(() => ({ user, loading, login, signup, logout }), [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}