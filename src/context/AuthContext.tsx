import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  login,
  logout,
  register,
  setAccessToken,
  refreshToken,
} from '../api/client';
import { getCurrentUser, User } from '../api/users';

interface AuthContextType {
  user: User | null | undefined;
  loginUser: (username: string, password: string) => Promise<void>;
  registerUser: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logoutUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  const refreshUser = async () => {
    try {
      const data = await getCurrentUser();
      setUser(data);
    } catch {
      setUser(null);
    }
  };

  const loginUser = async (username: string, password: string) => {
    await login(username, password);
    await refreshUser();
  };

  const registerUser = async (
    username: string,
    email: string,
    password: string
  ) => {
    await register(username, email, password);
    await refreshUser();
  };

  const logoutUser = async () => {
    try {
      await logout();
      setAccessToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setAccessToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshToken();
        await refreshUser();
      } catch {
        setUser(null);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loginUser, registerUser, logoutUser, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
