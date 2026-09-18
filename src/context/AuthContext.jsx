import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const refreshAuth = async () => {
      const current = authService.getCurrentUser();
      if (!current) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(current);
      setLoading(false);

      try {
        const fresh = await authService.fetchLatestProfile();
        if (fresh) {
          setUser(fresh);
        }
      } catch (err) {
        console.warn('Background profile refresh notice:', err?.message || err);
      }
    };

    refreshAuth();

    window.addEventListener('arabian_sheikh_auth_changed', refreshAuth);
    window.addEventListener('storage', refreshAuth);

    return () => {
      window.removeEventListener('arabian_sheikh_auth_changed', refreshAuth);
      window.removeEventListener('storage', refreshAuth);
    };
  }, []);

  const login = async (email, password) => {
    const loggedUser = await authService.login(email, password);
    setUser(loggedUser);
    return loggedUser;
  };

  const signup = async (payload) => {
    const newUser = await authService.signup(payload);
    setUser(newUser);
    return newUser;
  };

  const logout = (redirectTo = '/login') => {
    setUser(null);
    authService.logout();
    if (typeof window !== 'undefined' && redirectTo) {
      window.location.href = redirectTo;
    }
  };

  const updateProfile = async (updates) => {
    const updated = await authService.updateProfile(updates);
    setUser(updated);
    return updated;
  };

  const isSuperAdmin = Boolean(
    user?.isSuperAdmin === true ||
    user?.role === 'SUPER_ADMIN' ||
    (user?.email && user.email.toLowerCase().includes('superadmin'))
  );

  const isAdmin = Boolean(
    isSuperAdmin ||
    user?.role === 'ADMIN' ||
    (user?.email && (user.email.toLowerCase().includes('admin') || user.email.toLowerCase().includes('perfumestore')))
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isSuperAdmin,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
