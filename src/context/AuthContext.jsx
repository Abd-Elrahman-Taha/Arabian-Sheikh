import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refreshAuth = () => {
      const current = authService.getCurrentUser();
      setUser(current);
      setLoading(false);
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

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const updated = await authService.updateProfile(updates);
    setUser(updated);
    return updated;
  };

  const isAdmin = Boolean(
    user?.role === 'ADMIN' ||
    user?.role === 'SUPER_ADMIN' ||
    user?.isSuperAdmin === true ||
    (user?.email && (user.email.toLowerCase().includes('admin') || user.email.toLowerCase().includes('perfumestore')))
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
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
