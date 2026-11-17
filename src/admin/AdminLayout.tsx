import React, { useEffect, useState } from 'react'
import { ArrowLeft, Boxes, LayoutDashboard, PencilLine, ShoppingCart } from 'lucide-react'
import { AdminProvider, useAdmin } from './AdminStore'
import { AdminDashboard } from './AdminDashboard'
import { InventoryManager } from './InventoryManager'
import { ProductEditor } from './ProductEditor'
import { OrdersManager } from './OrdersManager'
import type { AdminTab } from './types'
import { cn } from './utils'

const TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="size-4" /> },
  { id: 'inventory', label: 'Inventory', icon: <Boxes className="size-4" /> },
  { id: 'products', label: 'Products', icon: <PencilLine className="size-4" /> },
  { id: 'orders', label: 'Orders', icon: <ShoppingCart className="size-4" /> },
]

const HASH_PREFIX = '#admin/'

const readTabFromHash = (): AdminTab | null => {
  if (typeof window === 'undefined') return null
  const id = window.location.hash.startsWith(HASH_PREFIX) ? window.location.hash.slice(HASH_PREFIX.length) : ''
  return TABS.some((t) => t.id === id) ? (id as AdminTab) : null
}

export interface AdminLayoutProps {
  initialTab?: AdminTab
  /** Optional handler for the "Back to store" link. */
  onExit?: () => void
  /** Sync the active tab with `#admin/<tab>` in the URL. Defaults to true. */
  syncHash?: boolean
}

const AdminShell: React.FC<AdminLayoutProps> = ({ initialTab = 'dashboard', onExit, syncHash = true }) => {
  const [tab, setTab] = useState<AdminTab>(() => (syncHash && readTabFromHash()) || initialTab)
  const { lowStockAlerts, orders, newOrderIds } = useAdmin()

  useEffect(() => {
    if (!syncHash) return
    const onHash = () => {
      const t = readTabFromHash()
      if (t) setTab(t)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [syncHash])

  const go = (next: AdminTab) => {
    setTab(next)
    if (syncHash && window.location.hash !== HASH_PREFIX + next) {
      window.history.replaceState(null, '', HASH_PREFIX + next)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pendingOrders = orders.filter((o) => o.fulfillment === 'pending' && o.status !== 'failed').length
  const badges: Partial<Record<AdminTab, { count: number; tone: string }>> = {
    inventory: { count: lowStockAlerts.length, tone: 'bg-amber-500 text-white' },
    orders: { count: pendingOrders, tone: newOrderIds.size ? 'bg-emerald-500 text-white' : 'bg-ink text-white' },
  }

  const current = TABS.find((t) => t.id === tab)!

  return (
    <div className="min-h-screen bg-[#F5F7F8] font-sans text-ink">
      <header className="sticky top-0 z-30 border-b border-ink-24/40 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-ink font-mono text-xs font-bold text-accent-teal">
              AE
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight">AEVION Admin</p>
              <p className="text-[11px] leading-tight text-ink-48">Footwear operations</p>
            </div>
          </div>
          {onExit ? (
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-ink-64 hover:bg-ink/5 hover:text-ink"
            >
              <ArrowLeft className="size-3.5" /> Back to store
            </button>
          ) : (
            <a
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-ink-64 hover:bg-ink/5 hover:text-ink"
            >
              <ArrowLeft className="size-3.5" /> Back to store
            </a>
          )}
        </div>

        <nav aria-label="Admin sections" className="mx-auto max-w-7xl px-2 sm:px-4">
          <div role="tablist" className="-mb-px flex overflow-x-auto [scrollbar-width:none]">
            {TABS.map((t) => {
              const active = t.id === tab
              const badge = badges[t.id]
              return (
                <button
                  key={t.id}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  aria-controls={`admin-panel-${t.id}`}
                  onClick={() => go(t.id)}
                  className={cn(
                    'flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition sm:px-4',
                    active ? 'border-ink text-ink' : 'border-transparent text-ink-48 hover:text-ink'
                  )}
                >
                  {t.icon}
                  <span className={cn(!active && 'hidden sm:inline')}>{t.label}</span>
                  {badge && badge.count > 0 && (
                    <span className={cn('min-w-5 rounded-full px-1.5 text-center text-[10px] font-semibold leading-5', badge.tone)}>
                      {badge.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </nav>
      </header>

      <main id={`admin-panel-${tab}`} role="tabpanel" className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <h1 className="mb-5 text-xl font-semibold tracking-tight sm:text-2xl">{current.label}</h1>
        {tab === 'dashboard' && <AdminDashboard onNavigate={go} />}
        {tab === 'inventory' && <InventoryManager />}
        {tab === 'products' && <ProductEditor />}
        {tab === 'orders' && <OrdersManager />}
      </main>
    </div>
  )
}

export const AdminLayout: React.FC<AdminLayoutProps> = (props) => (
  <AdminProvider>
    <AdminShell {...props} />
  </AdminProvider>
)

export default AdminLayout
