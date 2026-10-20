import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import {
  login as loginRequest,
  logout as logoutRequest,
  getStoredUser,
  getStoredToken,
  fetchCurrentUser,
} from '../services/authService';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On first load, restore the session from localStorage rather than
  // forcing a fresh login on every page refresh.
  useEffect(() => {
    const storedUser = getStoredUser();
    const storedToken = getStoredToken();
    if (storedUser && storedToken) {
      setUser(storedUser);
      // Then pick up changes an admin made since login (e.g. a new team or role).
      // A rejected token is handled by the api interceptor, which signs the user out.
      fetchCurrentUser()
        .then(setUser)
        .catch(() => {
          /* Keep the stored user if the server can't be reached. */
        });
    }
    setLoading(false);
  }, []);

  async function login(identifier: string, password: string) {
    const { user: loggedInUser } = await loginRequest(identifier, password);
    setUser(loggedInUser);
  }

  function logout() {
    logoutRequest();
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, loading, login, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
