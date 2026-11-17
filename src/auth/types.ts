import type { User } from '../types'

export type { User }

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
  confirmPassword?: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface AuthSession {
  user: User
  token: string
  expiresAt: number
}

export type AuthModalMode = 'login' | 'register'

export interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  isAuthModalOpen: boolean
  modalMode: AuthModalMode
  openAuthModal: (mode?: AuthModalMode) => void
  closeAuthModal: () => void
  setModalMode: (mode: AuthModalMode) => void
  login: (credentials: LoginCredentials) => Promise<User>
  loginWithEmail: (email: string, password: string) => Promise<User>
  register: (credentials: RegisterCredentials) => Promise<User>
  registerWithEmail: (name: string, email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  updateUserProfile: (data: Partial<Pick<User, 'name' | 'avatarUrl'>>) => Promise<User>
  clearError: () => void
}
