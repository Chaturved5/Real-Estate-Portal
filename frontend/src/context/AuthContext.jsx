import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiClient } from '../services/apiClient'
import { mockAuth } from '../services/mockAuth'

const AuthContext = createContext(null)

const STORAGE_KEY = 'estateportal.session'

const defaultRedirectByRole = {
  admin: '/admin',
  owner: '/owners',
  agent: '/brokers',
  buyer: '/marketplace'
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [hydrating, setHydrating] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState(null)

  const persistSession = useCallback((nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)
    apiClient.setAuthToken(nextToken)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }))
  }, [])

  const clearSession = useCallback(() => {
    setToken(null)
    setUser(null)
    apiClient.clearAuthToken()
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const hydrateSession = useCallback(async () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      setHydrating(false)
      return
    }

    try {
      const parsed = JSON.parse(stored)
      if (!parsed?.token) {
        clearSession()
        setHydrating(false)
        return
      }

      apiClient.setAuthToken(parsed.token)

      if (apiClient.isEnabled) {
        try {
          const remoteUser = await apiClient.get('/auth/me')
          if (remoteUser) {
            persistSession(parsed.token, remoteUser)
          } else {
            clearSession()
          }
        } catch {
          clearSession()
        }
      } else {
        const localUser = await mockAuth.getUserFromToken(parsed.token)
        if (localUser) {
          persistSession(parsed.token, localUser)
        } else {
          clearSession()
        }
      }
    } catch {
      clearSession()
    } finally {
      setHydrating(false)
    }
  }, [clearSession, persistSession])

  useEffect(() => {
    hydrateSession()
  }, [hydrateSession])

  const clearAuthError = useCallback(() => {
    setAuthError(null)
  }, [])

  const login = useCallback(
    async (credentials) => {
      setAuthError(null)
      setAuthLoading(true)

      try {
        const response = apiClient.isEnabled
          ? await apiClient.post('/auth/login', credentials)
          : await mockAuth.login(credentials)

        if (!response?.token || !response?.user) {
          throw new Error('Unexpected response from authentication service')
        }

        persistSession(response.token, response.user)
        return response.user
      } catch (error) {
        const message = error.message || 'Unable to login right now'
        setAuthError(message)
        throw new Error(message)
      } finally {
        setAuthLoading(false)
      }
    },
    [persistSession]
  )

  const register = useCallback(
    async (payload) => {
      setAuthError(null)
      setAuthLoading(true)

      try {
        const response = apiClient.isEnabled
          ? await apiClient.post('/auth/register', payload)
          : await mockAuth.register(payload)

        if (!response?.token || !response?.user) {
          throw new Error('Unexpected response from registration service')
        }

        persistSession(response.token, response.user)
        return response.user
      } catch (error) {
        const message = error.message || 'Unable to register right now'
        setAuthError(message)
        throw new Error(message)
      } finally {
        setAuthLoading(false)
      }
    },
    [persistSession]
  )

  const logout = useCallback(async () => {
    setAuthError(null)
    setAuthLoading(true)

    try {
      if (apiClient.isEnabled) {
        await apiClient.post('/auth/logout')
      } else {
        await mockAuth.logout()
      }
    } catch (error) {
      console.warn('Failed to invalidate session remotely', error)
    } finally {
      clearSession()
      setAuthLoading(false)
    }
  }, [clearSession])

  const refreshProfile = useCallback(async () => {
    if (!token) {
      return null
    }

    try {
      const refreshedUser = apiClient.isEnabled
        ? await apiClient.get('/auth/me')
        : await mockAuth.getUserFromToken(token)

      if (refreshedUser) {
        persistSession(token, refreshedUser)
      }

      return refreshedUser
    } catch (error) {
      console.warn('Unable to refresh profile', error)
      return null
    }
  }, [persistSession, token])

  const updateProfile = useCallback(
    async (updates) => {
      if (!token) {
        throw new Error('No active session. Please sign in again.')
      }

      try {
        const response = apiClient.isEnabled
          ? await apiClient.patch('/auth/profile', updates)
          : await mockAuth.updateProfile(token, updates)

        if (!response) {
          throw new Error('Profile service returned an empty response')
        }

        persistSession(token, response)
        return response
      } catch (error) {
        const message = error.message || 'Unable to update profile right now'
        throw new Error(message)
      }
    },
    [persistSession, token]
  )

  const changePassword = useCallback(
    async (payload) => {
      if (!token) {
        throw new Error('No active session. Please sign in again.')
      }

      try {
        if (apiClient.isEnabled) {
          await apiClient.post('/auth/change-password', payload)
        } else {
          await mockAuth.changePassword(token, payload)
        }
        return true
      } catch (error) {
        const message = error.message || 'Unable to update password right now'
        throw new Error(message)
      }
    },
    [token]
  )

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
      defaultRedirectByRole
    }),
    [
      authError,
      authLoading,
      changePassword,
      clearAuthError,
      defaultRedirectByRole,
      hydrating,
      login,
      logout,
      refreshProfile,
      register,
      token,
      updateProfile,
      user
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
