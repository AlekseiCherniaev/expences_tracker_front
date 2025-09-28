import { createContext, useContext, useState, ReactNode } from "react";
import { login, logout, register, setAccessToken } from "../api/client";

interface AuthContextType {
  user: string | null;
  loginUser: (username: string, password: string) => Promise<void>;
  registerUser: (username: string, email: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);

  const loginUser = async (username: string, password: string) => {
    const res = await login(username, password);
    setUser(res?.username || username);
  };

  const registerUser = async (username: string, email: string, password: string) => {
    const res = await register(username, email, password);
    setUser(res?.username || username);
  };

  const logoutUser = async () => {
    await logout();
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, registerUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
