// src/context/AuthContext.jsx

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiClient } from "../services/apiClient";

const AuthContext = createContext(null);

const STORAGE_KEY = "estateportal.session";

// Where to redirect after login based on role
const defaultRedirectByRole = {
  admin: "/admin",
  owner: "/owners",
  agent: "/brokers",
  buyer: "/marketplace",
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [hydrating, setHydrating] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Save token + user in memory + localStorage + apiClient
  const persistSession = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    apiClient.setAuthToken(nextToken);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: nextToken, user: nextUser })
    );
  }, []);

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    apiClient.clearAuthToken();
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // When app loads → try to restore session from localStorage
  const hydrateSession = useCallback(async () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setHydrating(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored);

      if (!parsed?.token) {
        clearSession();
        setHydrating(false);
        return;
      }

      apiClient.setAuthToken(parsed.token);

      try {
        // Ask backend "who am I?"
        const remoteUser = await apiClient.get("/api/user");
        if (remoteUser) {
          persistSession(parsed.token, remoteUser);
        } else {
          clearSession();
        }
      } catch {
        clearSession();
      }
    } catch {
      clearSession();
    } finally {
      setHydrating(false);
    }
  }, [clearSession, persistSession]);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // ---------- LOGIN ----------
  const login = useCallback(
    async (credentials) => {
      setAuthError(null);
      setAuthLoading(true);

      try {
        const response = await apiClient.post("/api/login", {
          email: credentials.email,
          password: credentials.password,
        });

        if (!response?.token || !response?.user) {
          throw new Error("Invalid login response from server");
        }

        persistSession(response.token, response.user);
        return response.user;
      } catch (error) {
        const message = error.message || "Unable to login right now";
        setAuthError(message);
        throw new Error(message);
      } finally {
        setAuthLoading(false);
      }
    },
    [persistSession]
  );

  // ---------- REGISTER / SIGNUP ----------
  const register = useCallback(
    async (payload) => {
      setAuthError(null);
      setAuthLoading(true);

      try {
        const response = await apiClient.post("/api/signup", {
          name: payload.name,
          email: payload.email,
          role: payload.role,
          password: payload.password,
          password_confirmation: payload.password, // Laravel's "confirmed" rule
        });

        if (!response?.token || !response?.user) {
          throw new Error("Invalid registration response");
        }

        persistSession(response.token, response.user);
        return response.user;
      } catch (error) {
        const message = error.message || "Unable to register right now";
        setAuthError(message);
        throw new Error(message);
      } finally {
        setAuthLoading(false);
      }
    },
    [persistSession]
  );

  // ---------- LOGOUT ----------
  const logout = useCallback(async () => {
    setAuthError(null);
    setAuthLoading(true);

    try {
      await apiClient.post("/api/logout");
    } catch (error) {
      console.warn("Logout failed on server, clearing local session anyway.", error);
    } finally {
      clearSession();
      setAuthLoading(false);
    }
  }, [clearSession]);

  // ---------- REFRESH PROFILE (optional helper) ----------
  const refreshProfile = useCallback(async () => {
    if (!token) return null;

    try {
      const refreshedUser = await apiClient.get("/api/user");
      if (refreshedUser) {
        persistSession(token, refreshedUser);
      }
      return refreshedUser;
    } catch (error) {
      console.warn("Unable to refresh profile", error);
      return null;
    }
  }, [persistSession, token]);

  // For now, we’ll skip profile update / change password (no backend yet)
  const updateProfile = async () => {
    throw new Error("Profile update API not implemented yet.");
  };

  const changePassword = async () => {
    throw new Error("Change password API not implemented yet.");
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      hydrating,
      authLoading,
      authError,
      login,
      register,
      logout,
      refreshProfile,
      updateProfile,
      changePassword,
      clearAuthError,
      defaultRedirectByRole,
    }),
    [
      user,
      token,
      hydrating,
      authLoading,
      authError,
      login,
      register,
      logout,
      refreshProfile,
      updateProfile,
      changePassword,
      clearAuthError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
