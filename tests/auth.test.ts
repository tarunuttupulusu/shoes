import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { authService } from '../src/auth/authService.ts'
import { setupMockBrowser, type MockBrowserEnv } from './helpers/mockStorage.ts'

describe('Auth Regression Suite - Authentication & Session Management', () => {
  let mockEnv: MockBrowserEnv

  beforeEach(() => {
    mockEnv = setupMockBrowser()
    ;(authService as any).simulateLatency = () => Promise.resolve()
    authService.init()
  })

  afterEach(() => {
    mockEnv.cleanup()
  })

  describe('1. User Signup (Registration)', () => {
    it('successfully registers a new user with valid credentials', async () => {
      const response = await authService.register({
        name: 'Major Nathan Frost',
        email: 'nathan.frost@aevion.io',
        password: 'securePassword2026',
        confirmPassword: 'securePassword2026',
      })

      assert.ok(response.user, 'User object must be returned')
      assert.ok(response.user.id.startsWith('usr-'), 'User ID must start with usr-')
      assert.equal(response.user.name, 'Major Nathan Frost')
      assert.equal(response.user.email, 'nathan.frost@aevion.io')
      assert.ok(response.user.avatarUrl?.includes('api.dicebear.com'))
      assert.ok(response.token.startsWith(`aev_tok_${response.user.id}_`))

      // Verify passwordHash is stripped
      assert.equal((response.user as any).passwordHash, undefined)

      // Verify active session was persisted
      assert.equal(authService.getCurrentUser()?.id, response.user.id)
      assert.equal(authService.getToken(), response.token)
    })

    it('normalizes email to lowercase and trims whitespace on signup', async () => {
      const response = await authService.register({
        name: '  Cadet Elena Rostova  ',
        email: '  ELENA.ROSTOVA@AEVION.IO  ',
        password: 'password123',
      })

      assert.equal(response.user.name, 'Cadet Elena Rostova')
      assert.equal(response.user.email, 'elena.rostova@aevion.io')
    })

    it('rejects registration when full name is empty', async () => {
      await assert.rejects(
        async () => {
          await authService.register({
            name: '   ',
            email: 'test@aevion.io',
            password: 'password123',
          })
        },
        {
          message: 'Full name is required.',
        }
      )
    })

    it('rejects registration when email address is empty', async () => {
      await assert.rejects(
        async () => {
          await authService.register({
            name: 'Valid Name',
            email: '   ',
            password: 'password123',
          })
        },
        {
          message: 'Email address is required.',
        }
      )
    })

    it('rejects registration when email format is invalid', async () => {
      const invalidEmails = ['invalid-email', 'user@', 'user@domain', '@domain.com', 'user with space@domain.com']

      for (const invalidEmail of invalidEmails) {
        await assert.rejects(
          async () => {
            await authService.register({
              name: 'Valid Name',
              email: invalidEmail,
              password: 'password123',
            })
          },
          {
            message: 'Please enter a valid email address.',
          },
          `Should reject invalid email: ${invalidEmail}`
        )
      }
    })

    it('rejects registration when password is shorter than 6 characters', async () => {
      await assert.rejects(
        async () => {
          await authService.register({
            name: 'Valid Name',
            email: 'valid@aevion.io',
            password: '12345',
          })
        },
        {
          message: 'Password must be at least 6 characters.',
        }
      )
    })

    it('rejects registration when confirmPassword does not match password', async () => {
      await assert.rejects(
        async () => {
          await authService.register({
            name: 'Valid Name',
            email: 'mismatch@aevion.io',
            password: 'password123',
            confirmPassword: 'differentPassword456',
          })
        },
        {
          message: 'Passwords do not match.',
        }
      )
    })

    it('rejects registration when an account with the email already exists', async () => {
      // Try to register with an existing initial demo email
      await assert.rejects(
        async () => {
          await authService.register({
            name: 'Alex Duplicate',
            email: 'alex.vance@aevion.io',
            password: 'newpassword123',
          })
        },
        {
          message: 'An account with this email already exists.',
        }
      )
    })
  })

  describe('2. Password Authentication (Login)', () => {
    it('authenticates initial mock accounts with valid credentials', async () => {
      const demoUsers = authService.getDemoAccounts()
      assert.ok(demoUsers.length >= 3)

      for (const demo of demoUsers) {
        const result = await authService.login({
          email: demo.email,
          password: demo.password,
        })

        assert.equal(result.user.email, demo.email.toLowerCase())
        assert.ok(result.token.startsWith(`aev_tok_${result.user.id}_`))
        assert.equal((result.user as any).passwordHash, undefined)
      }
    })

    it('authenticates a newly registered user with their password', async () => {
      const email = 'new.user.auth@aevion.io'
      const password = 'mySecretPassword99'

      await authService.register({
        name: 'New Auth Tester',
        email,
        password,
      })

      // Log out first
      await authService.logout()
      assert.equal(authService.getCurrentUser(), null)

      // Now log in
      const loginResult = await authService.login({ email, password })
      assert.equal(loginResult.user.email, email)
      assert.equal(authService.getCurrentUser()?.email, email)
      assert.equal(authService.getToken(), loginResult.token)
    })

    it('supports case-insensitive email during login', async () => {
      const result = await authService.login({
        email: '  ALEX.VANCE@AEVION.IO  ',
        password: 'password123',
      })

      assert.equal(result.user.email, 'alex.vance@aevion.io')
    })

    it('rejects login with wrong password', async () => {
      await assert.rejects(
        async () => {
          await authService.login({
            email: 'alex.vance@aevion.io',
            password: 'incorrectPassword',
          })
        },
        {
          message: 'Invalid email or password.',
        }
      )
    })

    it('rejects login with non-existent email', async () => {
      await assert.rejects(
        async () => {
          await authService.login({
            email: 'ghost.user@nowhere.com',
            password: 'password123',
          })
        },
        {
          message: 'Invalid email or password.',
        }
      )
    })

    it('rejects login with missing email or password', async () => {
      await assert.rejects(
        async () => {
          await authService.login({ email: '', password: 'password123' })
        },
        {
          message: 'Email is required.',
        }
      )

      await assert.rejects(
        async () => {
          await authService.login({ email: 'alex.vance@aevion.io', password: '' })
        },
        {
          message: 'Password is required.',
        }
      )
    })
  })

  describe('3. Session Tokens & Session Management', () => {
    it('generates well-formed tokens and persists session in localStorage', async () => {
      const res = await authService.login({
        email: 'alex.vance@aevion.io',
        password: 'password123',
      })

      // Pattern: aev_tok_<userId>_<timestamp>_<randomHex>
      const tokenParts = res.token.split('_')
      assert.equal(tokenParts[0], 'aev')
      assert.equal(tokenParts[1], 'tok')
      assert.equal(tokenParts[2], res.user.id)
      assert.ok(Number(tokenParts[3]) > 0)
      assert.ok(tokenParts[4].length >= 4)

      assert.equal(mockEnv.storage.getItem('aevion_auth_token'), res.token)
      assert.equal(mockEnv.storage.getItem('aevion_auth_user'), JSON.stringify(res.user))
    })

    it('updates user profile and updates active session if currently logged in', async () => {
      const res = await authService.login({
        email: 'alex.vance@aevion.io',
        password: 'password123',
      })

      const updated = await authService.updateProfile(res.user.id, {
        name: 'General Alex Vance',
        avatarUrl: 'https://example.com/avatar.png',
      })

      assert.equal(updated.name, 'General Alex Vance')
      assert.equal(updated.avatarUrl, 'https://example.com/avatar.png')

      // Check current user in memory / localStorage
      const currentUser = authService.getCurrentUser()
      assert.equal(currentUser?.name, 'General Alex Vance')
      assert.equal(currentUser?.avatarUrl, 'https://example.com/avatar.png')
    })

    it('rejects profile update for non-existent user ID', async () => {
      await assert.rejects(
        async () => {
          await authService.updateProfile('usr-nonexistent', { name: 'Nobody' })
        },
        {
          message: 'User not found.',
        }
      )
    })

    it('logs out user by clearing session tokens and user data from localStorage', async () => {
      await authService.login({
        email: 'alex.vance@aevion.io',
        password: 'password123',
      })

      assert.ok(authService.getCurrentUser() !== null)
      assert.ok(authService.getToken() !== null)

      await authService.logout()

      assert.equal(authService.getCurrentUser(), null)
      assert.equal(authService.getToken(), null)
      assert.equal(mockEnv.storage.getItem('aevion_auth_user'), null)
      assert.equal(mockEnv.storage.getItem('aevion_auth_token'), null)
    })
  })

  describe('4. LocalStorage Mock Persistence', () => {
    it('initializes users database into localStorage if empty', () => {
      mockEnv.storage.clear()
      assert.equal(mockEnv.storage.getItem('aevion_mock_users_db'), null)

      authService.init()

      const raw = mockEnv.storage.getItem('aevion_mock_users_db')
      assert.ok(raw !== null)
      const users = JSON.parse(raw!)
      assert.ok(users.length >= 3)
      assert.equal(users[0].email, 'alex.vance@aevion.io')
    })

    it('persists newly registered users into localStorage across operations', async () => {
      const email = 'persistence.test@aevion.io'
      await authService.register({
        name: 'Persistence Tester',
        email,
        password: 'password123',
      })

      const raw = mockEnv.storage.getItem('aevion_mock_users_db')
      assert.ok(raw !== null)
      const users = JSON.parse(raw!)
      const found = users.find((u: any) => u.email === email)
      assert.ok(found !== undefined)
      assert.equal(found.name, 'Persistence Tester')
    })
  })
})
