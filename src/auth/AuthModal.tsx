import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  Shield,
  Check,
} from 'lucide-react'
import { AuthContext } from './AuthContext'
import { authService } from './authService'
import type { AuthModalMode } from './types'

export interface AuthModalProps {
  isOpen?: boolean
  onClose?: () => void
  initialMode?: AuthModalMode
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen: explicitIsOpen,
  onClose: explicitOnClose,
  initialMode = 'login',
}) => {
  const authContext = React.useContext(AuthContext)

  // Determine whether modal is controlled by props or context
  const isOpen = explicitIsOpen !== undefined ? explicitIsOpen : (authContext?.isAuthModalOpen ?? false)
  const close = explicitOnClose || authContext?.closeAuthModal || (() => {})

  const [mode, setMode] = useState<AuthModalMode>(authContext?.modalMode || initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')

  // Local feedback
  const [localError, setLocalError] = useState<string | null>(null)
  const [localSuccess, setLocalSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const emailInputRef = useRef<HTMLInputElement>(null)
  const modalBoxRef = useRef<HTMLDivElement>(null)

  // Sync mode if context mode changes
  useEffect(() => {
    if (authContext?.modalMode) {
      setMode(authContext.modalMode)
    }
  }, [authContext?.modalMode])

  // Reset form when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setLocalError(null)
      setLocalSuccess(null)
      authContext?.clearError()
      setTimeout(() => {
        emailInputRef.current?.focus()
      }, 50)
    }
  }, [isOpen, mode])

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, close])

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const activeError = localError || authContext?.error

  const handleTabChange = (newMode: AuthModalMode) => {
    setMode(newMode)
    setLocalError(null)
    setLocalSuccess(null)
    authContext?.clearError()
    authContext?.setModalMode(newMode)
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    setLocalSuccess(null)

    if (!loginEmail.trim()) {
      setLocalError('Please enter your email address.')
      return
    }
    if (!loginPassword) {
      setLocalError('Please enter your password.')
      return
    }

    setIsSubmitting(true)
    try {
      if (authContext) {
        await authContext.login({ email: loginEmail, password: loginPassword })
      } else {
        await authService.login({ email: loginEmail, password: loginPassword })
        close()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please verify credentials.'
      setLocalError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    setLocalSuccess(null)

    if (!regName.trim()) {
      setLocalError('Please enter your full name.')
      return
    }
    if (!regEmail.trim()) {
      setLocalError('Please enter an email address.')
      return
    }
    if (!regPassword || regPassword.length < 6) {
      setLocalError('Password must be at least 6 characters.')
      return
    }
    if (regPassword !== regConfirmPassword) {
      setLocalError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      if (authContext) {
        await authContext.register({
          name: regName,
          email: regEmail,
          password: regPassword,
          confirmPassword: regConfirmPassword,
        })
      } else {
        await authService.register({
          name: regName,
          email: regEmail,
          password: regPassword,
          confirmPassword: regConfirmPassword,
        })
        close()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.'
      setLocalError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const fillDemoAccount = (email: string, pass: string) => {
    setLoginEmail(email)
    setLoginPassword(pass)
    setLocalError(null)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24363F]/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          close()
        }
      }}
    >
      <div
        ref={modalBoxRef}
        className="relative w-full max-w-md bg-[#FDFDFD] border border-[#24363F]/20 rounded-xl shadow-2xl overflow-hidden text-[#24363F]"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#24363F]/10 bg-[#24363F]/[0.02]">
          <div className="flex items-center gap-2 font-mono text-[11px] tracking-wider uppercase text-[#24363F]/70">
            <Shield className="w-3.5 h-3.5 text-[#24363F]/80" />
            <span id="auth-modal-title">AEVION // AUTH_GATEWAY</span>
          </div>
          <button
            type="button"
            onClick={close}
            className="p-1 rounded-md text-[#24363F]/60 hover:text-[#24363F] hover:bg-[#24363F]/10 transition-colors focus:outline-none focus:ring-1 focus:ring-[#24363F]/30"
            aria-label="Close authentication modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-[#24363F]/10 bg-[#24363F]/[0.03] font-mono text-xs">
          <button
            type="button"
            onClick={() => handleTabChange('login')}
            className={`flex-1 py-3 text-center transition-all border-b-2 font-medium ${
              mode === 'login'
                ? 'border-[#24363F] text-[#24363F] bg-white'
                : 'border-transparent text-[#24363F]/60 hover:text-[#24363F] hover:bg-white/50'
            }`}
          >
            [ 01 // SIGN IN ]
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('register')}
            className={`flex-1 py-3 text-center transition-all border-b-2 font-medium ${
              mode === 'register'
                ? 'border-[#24363F] text-[#24363F] bg-white'
                : 'border-transparent text-[#24363F]/60 hover:text-[#24363F] hover:bg-white/50'
            }`}
          >
            [ 02 // CREATE ACCOUNT ]
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Error Message Banner */}
          {activeError && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-900 font-sans">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{activeError}</div>
            </div>
          )}

          {/* Success Message Banner */}
          {localSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-900 font-sans">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{localSuccess}</div>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#24363F]/70 mb-1.5">
                  Operator Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#24363F]/40">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    ref={emailInputRef}
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="alex.vance@aevion.io"
                    required
                    autoComplete="email"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#24363F]/20 rounded-md text-sm text-[#24363F] placeholder-[#24363F]/35 focus:outline-none focus:border-[#24363F] focus:ring-1 focus:ring-[#24363F] transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-[#24363F]/70">
                    Access Key / Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#24363F]/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full pl-9 pr-10 py-2 bg-white border border-[#24363F]/20 rounded-md text-sm text-[#24363F] placeholder-[#24363F]/35 focus:outline-none focus:border-[#24363F] focus:ring-1 focus:ring-[#24363F] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#24363F]/40 hover:text-[#24363F] focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 px-4 bg-[#24363F] hover:bg-[#24363F]/90 text-white rounded-md font-mono text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-2 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#24363F]/40 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <>
                    <span>AUTHENTICATE OPERATOR</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* Demo Accounts Quick-Select */}
              <div className="mt-5 pt-4 border-t border-[#24363F]/10">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#24363F]/50 mb-2">
                  // QUICK ACCESS MOCK ACCOUNTS:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('alex.vance@aevion.io', 'password123')}
                    className="text-left p-2 rounded border border-[#24363F]/15 bg-white hover:bg-[#24363F]/5 hover:border-[#24363F]/30 transition-all text-xs"
                  >
                    <div className="font-semibold text-[11px] text-[#24363F]">Alex Vance</div>
                    <div className="text-[10px] text-[#24363F]/60 truncate font-mono">Commander</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('sarah.chen@aevion.io', 'password123')}
                    className="text-left p-2 rounded border border-[#24363F]/15 bg-white hover:bg-[#24363F]/5 hover:border-[#24363F]/30 transition-all text-xs"
                  >
                    <div className="font-semibold text-[11px] text-[#24363F]">Sarah Chen</div>
                    <div className="text-[10px] text-[#24363F]/60 truncate font-mono">LIDAR Lead</div>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#24363F]/70 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#24363F]/40">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    ref={emailInputRef}
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Marcus Reid"
                    required
                    autoComplete="name"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#24363F]/20 rounded-md text-sm text-[#24363F] placeholder-[#24363F]/35 focus:outline-none focus:border-[#24363F] focus:ring-1 focus:ring-[#24363F] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#24363F]/70 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#24363F]/40">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="operator@company.com"
                    required
                    autoComplete="email"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#24363F]/20 rounded-md text-sm text-[#24363F] placeholder-[#24363F]/35 focus:outline-none focus:border-[#24363F] focus:ring-1 focus:ring-[#24363F] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#24363F]/70 mb-1.5">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#24363F]/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    autoComplete="new-password"
                    className="w-full pl-9 pr-10 py-2 bg-white border border-[#24363F]/20 rounded-md text-sm text-[#24363F] placeholder-[#24363F]/35 focus:outline-none focus:border-[#24363F] focus:ring-1 focus:ring-[#24363F] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#24363F]/40 hover:text-[#24363F] focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#24363F]/70 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#24363F]/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    autoComplete="new-password"
                    className="w-full pl-9 pr-10 py-2 bg-white border border-[#24363F]/20 rounded-md text-sm text-[#24363F] placeholder-[#24363F]/35 focus:outline-none focus:border-[#24363F] focus:ring-1 focus:ring-[#24363F] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#24363F]/40 hover:text-[#24363F] focus:outline-none"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Register Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 px-4 bg-[#24363F] hover:bg-[#24363F]/90 text-white rounded-md font-mono text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-2 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#24363F]/40 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>PROVISIONING CREDENTIALS...</span>
                  </>
                ) : (
                  <>
                    <span>REGISTER NEW OPERATOR</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer note */}
          <div className="mt-4 pt-3 text-center text-[10px] font-mono text-[#24363F]/50 flex items-center justify-center gap-1.5">
            <span className="size-1 rounded-full bg-emerald-500"></span>
            <span>END-TO-END SIMULATED SESSION ENCRYPTION</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthModal
