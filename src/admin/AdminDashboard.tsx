import React, { useEffect, useMemo, useState } from 'react'
import { Activity, Boxes, IndianRupee, ShoppingCart, TriangleAlert, Radio, ChevronRight } from 'lucide-react'
import { useAdmin } from './AdminStore'
import { Card, CardHeader, EmptyState, Pill } from './ui'
import type { AdminTab } from './types'
import { FULFILLMENT_STYLES, PAYMENT_LABELS, PAYMENT_STYLES, cn, formatINR, timeAgo } from './utils'

const KpiCard: React.FC<{
  label: string
  value: string
  detail: string
  icon: React.ReactNode
  tone?: 'default' | 'warn'
  onClick?: () => void
}> = ({ label, value, detail, icon, tone = 'default', onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'group flex flex-col gap-3 rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:shadow-md',
      tone === 'warn' ? 'border-amber-300' : 'border-ink-24/40'
    )}
  >
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-48">{label}</span>
      <span
        className={cn(
          'flex size-8 items-center justify-center rounded-lg',
          tone === 'warn' ? 'bg-amber-50 text-amber-600' : 'bg-accent-teal/40 text-ink'
        )}
      >
        {icon}
      </span>
    </div>
    <span className="text-2xl font-semibold tabular-nums text-ink">{value}</span>
    <span className="flex items-center gap-1 text-xs text-ink-48">
      {detail}
      {onClick && <ChevronRight className="size-3 opacity-0 transition group-hover:opacity-100" />}
    </span>
  </button>
)

export const AdminDashboard: React.FC<{ onNavigate?: (tab: AdminTab) => void }> = ({ onNavigate }) => {
  const { orders, products, inventory, lowStockAlerts, lastSyncedAt, newOrderIds } = useAdmin()
  const [, tick] = useState(0)

  // Re-render periodically so relative timestamps stay fresh.
  useEffect(() => {
    const t = window.setInterval(() => tick((n) => n + 1), 15000)
    return () => window.clearInterval(t)
  }, [])

  const metrics = useMemo(() => {
    const paid = orders.filter((o) => o.status === 'completed')
    const revenue = paid.reduce((sum, o) => sum + o.amount, 0)
    const dayAgo = Date.now() - 86400000
    const revenue24h = paid
      .filter((o) => new Date(o.createdAt).getTime() >= dayAgo)
      .reduce((sum, o) => sum + o.amount, 0)
    const openOrders = orders.filter((o) => o.fulfillment !== 'completed' && o.status !== 'failed').length
    return {
      revenue,
      revenue24h,
      avgOrder: paid.length ? revenue / paid.length : 0,
      openOrders,
    }
  }, [orders])

  const health = useMemo(
    () =>
      products.map((p) => {
        const inv = inventory[p.id]
        const threshold = inv?.lowStockThreshold ?? 0
        const slots = p.sizes.map((s) => ({ size: s, stock: inv?.sizes[s]?.stock ?? 0 }))
        const units = slots.reduce((sum, s) => sum + s.stock, 0)
        const out = slots.filter((s) => s.stock === 0).length
        const low = slots.filter((s) => s.stock > 0 && s.stock <= threshold).length
        return { product: p, slots, units, out, low, threshold }
      }),
    [products, inventory]
  )

  const totalUnits = health.reduce((sum, h) => sum + h.units, 0)
  const outCount = lowStockAlerts.filter((a) => a.stock === 0).length
  const feed = orders.slice(0, 8)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Revenue"
          value={formatINR(metrics.revenue)}
          detail={`${formatINR(metrics.revenue24h)} in last 24h · avg ${formatINR(metrics.avgOrder)}`}
          icon={<IndianRupee className="size-4" />}
          onClick={() => onNavigate?.('orders')}
        />
        <KpiCard
          label="Orders"
          value={String(orders.length)}
          detail={`${metrics.openOrders} awaiting fulfillment`}
          icon={<ShoppingCart className="size-4" />}
          onClick={() => onNavigate?.('orders')}
        />
        <KpiCard
          label="Low stock items"
          value={String(lowStockAlerts.length)}
          detail={`${outCount} out of stock`}
          icon={<TriangleAlert className="size-4" />}
          tone={lowStockAlerts.length ? 'warn' : 'default'}
          onClick={() => onNavigate?.('inventory')}
        />
        <KpiCard
          label="Units on hand"
          value={totalUnits.toLocaleString('en-IN')}
          detail={`${products.length} products · ${health.reduce((n, h) => n + h.slots.length, 0)} SKUs`}
          icon={<Boxes className="size-4" />}
          onClick={() => onNavigate?.('inventory')}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader
            title="Inventory health"
            subtitle="Stock per size against each product's low-stock threshold"
            icon={<Boxes className="size-4" />}
          />
          {health.length === 0 ? (
            <EmptyState title="No products in catalog" body="Add a product in the Products tab." />
          ) : (
            <ul className="space-y-5">
              {health.map(({ product, slots, units, out, low, threshold }) => {
                const max = Math.max(1, ...slots.map((s) => s.stock))
                const status = out ? 'critical' : low ? 'watch' : 'healthy'
                return (
                  <li key={product.id}>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{product.name}</p>
                        <p className="text-xs text-ink-48">
                          {units} units · threshold ≤ {threshold}
                        </p>
                      </div>
                      <Pill
                        className={
                          status === 'critical'
                            ? 'bg-rose-50 text-rose-700 ring-rose-200'
                            : status === 'watch'
                              ? 'bg-amber-50 text-amber-700 ring-amber-200'
                              : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                        }
                      >
                        {status}
                        {out ? ` · ${out} out` : low ? ` · ${low} low` : ''}
                      </Pill>
                    </div>
                    <div className="grid grid-cols-6 gap-1.5">
                      {slots.map((s) => {
                        const tone =
                          s.stock === 0 ? 'bg-rose-400' : s.stock <= threshold ? 'bg-amber-400' : 'bg-emerald-400'
                        return (
                          <div key={s.size} className="flex flex-col items-center gap-1" title={`UK ${s.size}: ${s.stock}`}>
                            <div className="flex h-12 w-full items-end overflow-hidden rounded-md bg-ink/5">
                              <div
                                className={cn('w-full rounded-md transition-all', tone)}
                                style={{ height: `${Math.max(6, (s.stock / max) * 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] tabular-nums text-ink-48">
                              {s.size} · {s.stock}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Live order feed"
            subtitle={`Synced ${lastSyncedAt.toLocaleTimeString('en-IN')}`}
            icon={<Activity className="size-4" />}
            action={
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                Live
              </span>
            }
          />
          {feed.length === 0 ? (
            <EmptyState icon={<Radio className="size-5" />} title="Waiting for orders" body="New orders appear here automatically." />
          ) : (
            <ul className="divide-y divide-ink-24/40">
              {feed.map((o) => {
                const units = o.items.reduce((n, i) => n + i.quantity, 0)
                return (
                  <li key={o.id} className="flex items-start justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate text-sm font-medium text-ink">
                        {o.customer.name}
                        {newOrderIds.has(o.id) && <Pill className="bg-accent-teal/50 text-ink ring-accent-teal">new</Pill>}
                      </p>
                      <p className="truncate text-xs text-ink-48">
                        {units} item{units === 1 ? '' : 's'} · {o.customer.city} · {timeAgo(o.createdAt)}
                      </p>
                      <div className="mt-1.5 flex gap-1.5">
                        <Pill className={PAYMENT_STYLES[o.status]}>{PAYMENT_LABELS[o.status]}</Pill>
                        <Pill className={FULFILLMENT_STYLES[o.fulfillment]}>{o.fulfillment}</Pill>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">{formatINR(o.amount)}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>

      {lowStockAlerts.length > 0 && (
        <Card>
          <CardHeader
            title="Low-stock alerts"
            subtitle="Sizes at or below threshold"
            icon={<TriangleAlert className="size-4 text-amber-600" />}
          />
          <div className="flex flex-wrap gap-2">
            {lowStockAlerts.slice(0, 12).map((a) => (
              <button
                key={`${a.product.id}-${a.size}`}
                type="button"
                onClick={() => onNavigate?.('inventory')}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs ring-1 ring-inset',
                  a.stock === 0 ? 'bg-rose-50 text-rose-700 ring-rose-200' : 'bg-amber-50 text-amber-800 ring-amber-200'
                )}
              >
                <span className="font-mono">{a.sku}</span> · {a.stock === 0 ? 'out of stock' : `${a.stock} left`}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default AdminDashboard
