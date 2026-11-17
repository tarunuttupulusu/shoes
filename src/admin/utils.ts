import type { Product, ShoeSize } from '../types'
import type { FulfillmentStatus, PaymentStatus } from './types'

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export const formatINR = (amount: number): string => inr.format(Number.isFinite(amount) ? amount : 0)

export const formatDateTime = (iso: string): string => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

export const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime()
  if (!Number.isFinite(diff)) return '—'
  const s = Math.max(0, Math.floor(diff / 1000))
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export const makeSku = (productId: string, size: ShoeSize): string => {
  const base = productId
    .replace(/^shoe-/, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .toUpperCase()
  return `AEV-${base}-${size}`
}

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const makeProductId = (name: string, existing: Product[]): string => {
  const base = `shoe-${slugify(name) || 'new'}`
  let id = base
  let i = 2
  while (existing.some((p) => p.id === id)) id = `${base}-${i++}`
  return id
}

export const uid = (prefix: string): string =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`

export const cn = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter(Boolean).join(' ')

export const FULFILLMENT_STYLES: Record<FulfillmentStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  processing: 'bg-sky-50 text-sky-700 ring-sky-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
}

export const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  failed: 'bg-rose-50 text-rose-700 ring-rose-200',
}

export const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  pending: 'Awaiting payment',
  completed: 'Paid',
  failed: 'Failed',
}

export const readJSON = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export const writeJSON = (key: string, value: unknown): void => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.warn(`[admin] failed to persist ${key}`, err)
  }
}
