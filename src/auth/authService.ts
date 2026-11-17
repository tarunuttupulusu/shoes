import type { User, LoginCredentials, RegisterCredentials, AuthResponse } from './types'

interface StoredUserRecord extends User {
  passwordHash: string
  createdAt: string
}

const STORAGE_KEYS = {
  USER: 'aevion_auth_user',
  TOKEN: 'aevion_auth_token',
  USERS_DB: 'aevion_mock_users_db',
} as const

const INITIAL_MOCK_USERS: StoredUserRecord[] = [
  {
    id: 'usr-001',
    name: 'Commander Alex Vance',
    email: 'alex.vance@aevion.io',
    passwordHash: 'password123',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-002',
    name: 'Sarah Chen',
    email: 'sarah.chen@aevion.io',
    passwordHash: 'password123',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-003',
    name: 'Aevion Test Pilot',
    email: 'pilot@aevion.io',
    passwordHash: 'password123',
    createdAt: new Date().toISOString(),
  },
]

class MockAuthService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  }

  private simulateLatency(ms: number = 350): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private getUsersDb(): StoredUserRecord[] {
    if (!this.isBrowser()) return INITIAL_MOCK_USERS

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USERS_DB)
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(INITIAL_MOCK_USERS))
        return INITIAL_MOCK_USERS
      }
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed : INITIAL_MOCK_USERS
    } catch {
      return INITIAL_MOCK_USERS
    }
  }

  private saveUsersDb(users: StoredUserRecord[]): void {
    if (!this.isBrowser()) return
    try {
      localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users))
    } catch (err) {
      console.warn('Failed to save user database to localStorage', err)
    }
  }

  private createToken(userId: string): string {
    const timestamp = Date.now()
    const randomHex = Math.random().toString(36).substring(2, 10)
    return `aev_tok_${userId}_${timestamp}_${randomHex}`
  }

  private stripPassword(record: StoredUserRecord): User {
    const { passwordHash: _, ...user } = record
    return user
  }

  /**
   * Initializes mock database if not already present.
   */
  public init(): void {
    if (!this.isBrowser()) return
    if (!localStorage.getItem(STORAGE_KEYS.USERS_DB)) {
      this.saveUsersDb(INITIAL_MOCK_USERS)
    }
  }

  /**
   * Returns current authenticated user from storage, or null if unauthenticated.
   */
  public getCurrentUser(): User | null {
    if (!this.isBrowser()) return null
    try {
      const rawUser = localStorage.getItem(STORAGE_KEYS.USER)
      if (!rawUser) return null
      return JSON.parse(rawUser) as User
    } catch {
      return null
    }
  }

  /**
   * Returns current active auth token from storage.
   */
  public getToken(): string | null {
    if (!this.isBrowser()) return null
    try {
      return localStorage.getItem(STORAGE_KEYS.TOKEN)
    } catch {
      return null
    }
  }

  /**
   * Authenticates user against mock database.
   */
  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await this.simulateLatency(300)

    const email = credentials.email.trim().toLowerCase()
    const password = credentials.password

    if (!email) {
      throw new Error('Email is required.')
    }
    if (!password) {
      throw new Error('Password is required.')
    }

    const users = this.getUsersDb()
    const record = users.find((u) => u.email.toLowerCase() === email)

    if (!record || record.passwordHash !== password) {
      throw new Error('Invalid email or password.')
    }

    const user = this.stripPassword(record)
    const token = this.createToken(user.id)

    if (this.isBrowser()) {
      try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
        localStorage.setItem(STORAGE_KEYS.TOKEN, token)
      } catch (err) {
        console.warn('Failed to persist session to localStorage', err)
      }
    }

    return { user, token }
  }

  /**
   * Registers a new user into mock database and signs them in.
   */
  public async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    await this.simulateLatency(400)

    const name = credentials.name.trim()
    const email = credentials.email.trim().toLowerCase()
    const password = credentials.password

    if (!name) {
      throw new Error('Full name is required.')
    }
    if (!email) {
      throw new Error('Email address is required.')
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address.')
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.')
    }
    if (credentials.confirmPassword !== undefined && credentials.confirmPassword !== password) {
      throw new Error('Passwords do not match.')
    }

    const users = this.getUsersDb()
    const existing = users.find((u) => u.email.toLowerCase() === email)
    if (existing) {
      throw new Error('An account with this email already exists.')
    }

    const newRecord: StoredUserRecord = {
      id: `usr-${Math.random().toString(36).substring(2, 9)}`,
      name,
      email,
      passwordHash: password,
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(email)}`,
      createdAt: new Date().toISOString(),
    }

    users.push(newRecord)
    this.saveUsersDb(users)

    const user = this.stripPassword(newRecord)
    const token = this.createToken(user.id)

    if (this.isBrowser()) {
      try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
        localStorage.setItem(STORAGE_KEYS.TOKEN, token)
      } catch (err) {
        console.warn('Failed to persist session to localStorage', err)
      }
    }

    return { user, token }
  }

  /**
   * Signs out current user and clears session tokens.
   */
  public async logout(): Promise<void> {
    await this.simulateLatency(150)
    if (this.isBrowser()) {
      try {
        localStorage.removeItem(STORAGE_KEYS.USER)
        localStorage.removeItem(STORAGE_KEYS.TOKEN)
      } catch (err) {
        console.warn('Failed to clear session from localStorage', err)
      }
    }
  }

  /**
   * Updates profile information for the specified user.
   */
  public async updateProfile(
    userId: string,
    data: Partial<Pick<User, 'name' | 'avatarUrl'>>
  ): Promise<User> {
    await this.simulateLatency(200)

    const users = this.getUsersDb()
    const index = users.findIndex((u) => u.id === userId)
    if (index === -1) {
      throw new Error('User not found.')
    }

    const updatedRecord: StoredUserRecord = {
      ...users[index],
      ...(data.name ? { name: data.name.trim() } : {}),
      ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
    }

    users[index] = updatedRecord
    this.saveUsersDb(users)

    const updatedUser = this.stripPassword(updatedRecord)

    // If updating current active user session, update stored session
    const current = this.getCurrentUser()
    if (current && current.id === userId && this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser))
    }

    return updatedUser
  }

  /**
   * Returns list of pre-configured sample credentials for testing / demo purposes.
   */
  public getDemoAccounts(): Array<{ name: string; email: string; password: string; role: string }> {
    return [
      {
        name: 'Commander Alex Vance',
        email: 'alex.vance@aevion.io',
        password: 'password123',
        role: 'Mission Commander',
      },
      {
        name: 'Sarah Chen',
        email: 'sarah.chen@aevion.io',
        password: 'password123',
        role: 'LIDAR Payload Operator',
      },
      {
        name: 'Aevion Test Pilot',
        email: 'pilot@aevion.io',
        password: 'password123',
        role: 'UAV Test Pilot',
      },
    ]
  }
}

export const authService = new MockAuthService()
export default authService
