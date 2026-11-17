import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthContextType,
  AuthModalMode,
} from './types'
import { authService } from './authService'
import { AuthModal } from './AuthModal'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
  /**
   * If true, automatically renders the managed AuthModal inside the provider.
   * Defaults to true.
   */
  renderModal?: boolean
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  renderModal = true,
}) => {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser())
  const [token, setToken] = useState<string | null>(() => authService.getToken())
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<AuthModalMode>('login')

  useEffect(() => {
    authService.init()
    const storedUser = authService.getCurrentUser()
    const storedToken = authService.getToken()
    if (storedUser) {
      setUser(storedUser)
      setToken(storedToken)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const openAuthModal = useCallback((mode: AuthModalMode = 'login') => {
    setModalMode(mode)
    setError(null)
    setIsAuthModalOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false)
    setError(null)
  }, [])

  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authService.login(credentials)
      setUser(response.user)
      setToken(response.token)
      setIsAuthModalOpen(false)
      return response.user
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed.'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loginWithEmail = useCallback(
    async (email: string, password: string): Promise<User> => {
      return login({ email, password })
    },
    [login]
  )

  const register = useCallback(
    async (credentials: RegisterCredentials): Promise<User> => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await authService.register(credentials)
        setUser(response.user)
        setToken(response.token)
        setIsAuthModalOpen(false)
        return response.user
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Registration failed.'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const registerWithEmail = useCallback(
    async (name: string, email: string, password: string): Promise<User> => {
      return register({ name, email, password })
    },
    [register]
  )

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    try {
      await authService.logout()
      setUser(null)
      setToken(null)
      setError(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateUserProfile = useCallback(
    async (data: Partial<Pick<User, 'name' | 'avatarUrl'>>): Promise<User> => {
      if (!user) {
        throw new Error('No authenticated user.')
      }
      setIsLoading(true)
      setError(null)
      try {
        const updated = await authService.updateProfile(user.id, data)
        setUser(updated)
        return updated
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update profile.'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [user]
  )

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    error,
    isAuthModalOpen,
    modalMode,
    openAuthModal,
    closeAuthModal,
    setModalMode,
    login,
    loginWithEmail,
    register,
    registerWithEmail,
    logout,
    updateUserProfile,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      {renderModal && <AuthModal />}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
