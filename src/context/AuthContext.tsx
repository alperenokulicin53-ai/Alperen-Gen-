import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAdmin: boolean;
  adminName: string | null;
  login: (username: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AUTH_KEY = 'alperen_genc_admin_auth_v1';
const EXPECTED_USER = 'Alperen Genç';
const EXPECTED_PASS = 'anzerli5331';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    try {
      if (isAdmin) {
        localStorage.setItem(AUTH_KEY, 'true');
      } else {
        localStorage.removeItem(AUTH_KEY);
      }
    } catch {
      // ignore
    }
  }, [isAdmin]);

  const login = (username: string, pass: string) => {
    const cleanUser = username.trim();
    const cleanPass = pass.trim();

    if (cleanUser === EXPECTED_USER && cleanPass === EXPECTED_PASS) {
      setIsAdmin(true);
      setIsLoginModalOpen(false);
      return { success: true };
    }
    return { success: false, error: 'Hatalı Yönetici Adı veya Şifre girdiniz.' };
  };

  const logout = () => {
    setIsAdmin(false);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        adminName: isAdmin ? EXPECTED_USER : null,
        login,
        logout,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
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
