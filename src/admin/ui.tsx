import React from 'react'
import { cn } from './utils'

export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <section className={cn('rounded-2xl border border-ink-24/40 bg-white p-5 shadow-sm', className)}>{children}</section>
)

export const CardHeader: React.FC<{
  title: string
  subtitle?: string
  action?: React.ReactNode
  icon?: React.ReactNode
}> = ({ title, subtitle, action, icon }) => (
  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
    <div className="flex items-start gap-2.5">
      {icon && <span className="mt-0.5 text-ink-64">{icon}</span>}
      <div>
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {subtitle && <p className="text-xs text-ink-48">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
)

export const Pill: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ring-1 ring-inset',
      className
    )}
  >
    {children}
  </span>
)

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-white hover:bg-ink/90',
  secondary: 'bg-white text-ink ring-1 ring-inset ring-ink-24 hover:bg-ink/5',
  ghost: 'text-ink-64 hover:bg-ink/5 hover:text-ink',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
}

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: 'sm' | 'md' }
> = ({ variant = 'secondary', size = 'md', className, type = 'button', ...rest }) => (
  <button
    type={type}
    className={cn(
      'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40',
      size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-9 px-3.5 text-sm',
      VARIANTS[variant],
      className
    )}
    {...rest}
  />
)

export const inputClass =
  'w-full rounded-lg border border-ink-24 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-48 focus:border-ink focus:outline-none focus:ring-2 focus:ring-accent-teal'

export const Field: React.FC<{ label: string; hint?: string; className?: string; children: React.ReactNode }> = ({
  label,
  hint,
  className,
  children,
}) => (
  <label className={cn('block', className)}>
    <span className="mb-1 block text-xs font-medium text-ink-64">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-[11px] text-ink-48">{hint}</span>}
  </label>
)

export const EmptyState: React.FC<{ icon?: React.ReactNode; title: string; body?: string }> = ({
  icon,
  title,
  body,
}) => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-ink-24 px-6 py-10 text-center">
    {icon && <span className="text-ink-48">{icon}</span>}
    <p className="text-sm font-medium text-ink">{title}</p>
    {body && <p className="max-w-sm text-xs text-ink-48">{body}</p>}
  </div>
)
