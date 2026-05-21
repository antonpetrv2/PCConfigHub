import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';

import { loginRequest, logoutRequest, meRequest, type ApiUser } from '@/services/api';

const TOKEN_STORAGE_KEY = 'pc-config-hub.auth-token';
let memoryToken: string | null = null;

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  token: string | null;
  user: ApiUser | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const readStoredToken = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  return memoryToken;
};

const writeStoredToken = (token: string | null) => {
  memoryToken = token;

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    if (token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
      return;
    }

    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const storedToken = readStoredToken();
      if (!storedToken) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const currentUser = await meRequest(storedToken);
        if (isMounted) {
          setToken(storedToken);
          setUser(currentUser);
        }
      } catch {
        writeStoredToken(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginRequest(email, password);
    writeStoredToken(result.token);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest(token);
    } catch {
      // The mobile session is Bearer-token based, so local cleanup is enough if the API is unreachable.
    }

    writeStoredToken(null);
    setToken(null);
    setUser(null);
  }, [token]);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      logout,
      token,
      user,
    }),
    [isLoading, login, logout, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return value;
}
