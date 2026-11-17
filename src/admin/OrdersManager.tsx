import React, { useMemo, useState } from 'react'
import { ChevronRight, CreditCard, MapPin, RefreshCw, Search, ShoppingCart, Trash2 } from 'lucide-react'
import { useAdmin } from './AdminStore'
import { Button, Card, CardHeader, EmptyState, Pill, inputClass } from './ui'
import type { AdminOrder, FulfillmentStatus, PaymentStatus } from './types'
import {
  FULFILLMENT_STYLES,
  PAYMENT_LABELS,
  PAYMENT_STYLES,
  cn,
  formatDateTime,
  formatINR,
  timeAgo,
} from './utils'

const FULFILLMENT_FLOW: FulfillmentStatus[] = ['pending', 'processing', 'completed']
const PAYMENT_OPTIONS: PaymentStatus[] = ['pending', 'completed', 'failed']

type FulfillmentFilter = 'all' | FulfillmentStatus

const OrderDetail: React.FC<{ order: AdminOrder }> = ({ order }) => {
  const { setFulfillment, setPaymentStatus, deleteOrder } = useAdmin()
  const stepIndex = FULFILLMENT_FLOW.indexOf(order.fulfillment)
  const nextStep = FULFILLMENT_FLOW[stepIndex + 1]
  const canFulfill = order.status === 'completed'

  return (
    <div className="space-y-5 border-t border-ink-24/40 bg-ink/[0.02] px-4 py-5">
      {/* Fulfillment stepper */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-48">Fulfillment</p>
        <div className="flex flex-wrap items-center gap-2">
          {FULFILLMENT_FLOW.map((s, i) => (
            <React.Fragment key={s}>
              <button
                type="button"
                onClick={() => setFulfillment(order.id, s)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium capitalize ring-1 ring-inset transition',
                  i <= stepIndex ? FULFILLMENT_STYLES[s] : 'bg-white text-ink-48 ring-ink-24 hover:text-ink'
                )}
              >
                {i + 1}. {s}
              </button>
              {i < FULFILLMENT_FLOW.length - 1 && <ChevronRight className="size-3.5 text-ink-24" />}
            </React.Fragment>
          ))}
          {nextStep && (
            <Button
              size="sm"
              variant="primary"
              className="ml-auto"
              disabled={!canFulfill}
              title={canFulfill ? undefined : 'Payment must be received before advancing fulfillment'}
              onClick={() => setFulfillment(order.id, nextStep)}
            >
              Mark {nextStep}
            </Button>
          )}
        </div>
        {!canFulfill && order.fulfillment === 'pending' && (
          <p className="mt-1.5 text-[11px] text-amber-700">Awaiting payment confirmation before fulfillment can begin.</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="md:col-span-2">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-48">Items</p>
          <ul className="divide-y divide-ink-24/40 rounded-xl border border-ink-24/40 bg-white">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 p-3">
                <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-ink/5">
                  {item.product.image && <img src={item.product.image} alt="" className="size-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{item.product.name}</p>
                  <p className="text-xs text-ink-48">
                    UK {item.size} · Qty {item.quantity} · {formatINR(item.product.price)} each
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums text-ink">
                  {formatINR(item.product.price * item.quantity)}
                </span>
              </li>
            ))}
            <li className="flex justify-between p-3 text-sm font-semibold text-ink">
              <span>Total</span>
              <span className="tabular-nums">{formatINR(order.amount)}</span>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-48">
              <MapPin className="size-3.5" /> Customer
            </p>
            <div className="space-y-0.5 text-sm text-ink">
              <p className="font-medium">{order.customer.name}</p>
              <p className="text-ink-64">{order.customer.email}</p>
              <p className="text-ink-64">{order.customer.phone}</p>
              <p className="text-ink-64">
                {order.customer.address}, {order.customer.city} {order.customer.pincode}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-48">
              <CreditCard className="size-3.5" /> Payment record
            </p>
            <dl className="space-y-1 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-ink-48">Razorpay order</dt>
                <dd className="truncate font-mono text-ink">{order.razorpayOrderId}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-ink-48">Payment ID</dt>
                <dd className="truncate font-mono text-ink">{order.razorpayPaymentId ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-ink-48">Placed</dt>
                <dd className="text-ink">{formatDateTime(order.createdAt)}</dd>
              </div>
            </dl>
            <label className="mt-2 flex items-center justify-between gap-2 text-xs text-ink-64">
              Payment status
              <select
                value={order.status}
                onChange={(e) => setPaymentStatus(order.id, e.target.value as PaymentStatus)}
                className="rounded-md border border-ink-24 bg-white px-2 py-1 text-xs text-ink"
              >
                {PAYMENT_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {PAYMENT_LABELS[p]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <Button
            size="sm"
            variant="ghost"
            className="text-rose-600 hover:text-rose-700"
            onClick={() => {
              if (window.confirm(`Delete order ${order.id}? This cannot be undone.`)) deleteOrder(order.id)
            }}
          >
            <Trash2 className="size-3.5" /> Delete order
          </Button>
        </div>
      </div>
    </div>
  )
}

export const OrdersManager: React.FC = () => {
  const { orders, refreshOrders, lastSyncedAt, newOrderIds } = useAdmin()
  const [query, setQuery] = useState('')
  const [fulfillmentFilter, setFulfillmentFilter] = useState<FulfillmentFilter>('all')
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentStatus>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const counts = useMemo(() => {
    const c: Record<FulfillmentFilter, number> = { all: orders.length, pending: 0, processing: 0, completed: 0 }
    orders.forEach((o) => c[o.fulfillment]++)
    return c
  }, [orders])

  const paymentTotals = useMemo(() => {
    const t: Record<PaymentStatus, number> = { pending: 0, completed: 0, failed: 0 }
    orders.forEach((o) => (t[o.status] += o.amount))
    return t
  }, [orders])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders.filter((o) => {
      if (fulfillmentFilter !== 'all' && o.fulfillment !== fulfillmentFilter) return false
      if (paymentFilter !== 'all' && o.status !== paymentFilter) return false
      if (!q) return true
      return (
        o.id.toLowerCase().includes(q) ||
        o.razorpayOrderId.toLowerCase().includes(q) ||
        (o.razorpayPaymentId ?? '').toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q) ||
        o.items.some((i) => i.product.name.toLowerCase().includes(q))
      )
    })
  }, [orders, query, fulfillmentFilter, paymentFilter])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PAYMENT_OPTIONS.map((p) => (
          <Card key={p} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-48">{PAYMENT_LABELS[p]}</span>
              <Pill className={PAYMENT_STYLES[p]}>{orders.filter((o) => o.status === p).length} orders</Pill>
            </div>
            <p className="mt-2 text-xl font-semibold tabular-nums text-ink">{formatINR(paymentTotals[p])}</p>
          </Card>
        ))}
      </div>

      <Card className="p-0">
        <div className="p-5 pb-0">
          <CardHeader
            title="Orders"
            subtitle={`Auto-refreshing · last sync ${lastSyncedAt.toLocaleTimeString('en-IN')}`}
            icon={<ShoppingCart className="size-4" />}
            action={
              <Button size="sm" onClick={refreshOrders}>
                <RefreshCw className="size-3.5" /> Refresh
              </Button>
            }
          />

          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-wrap items-center gap-1 rounded-lg bg-ink/5 p-1">
              {(['all', ...FULFILLMENT_FLOW] as FulfillmentFilter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFulfillmentFilter(f)}
                  className={cn(
                    'rounded-md px-3 py-1 text-xs font-medium capitalize',
                    fulfillmentFilter === f ? 'bg-white text-ink shadow-sm' : 'text-ink-64 hover:text-ink'
                  )}
                >
                  {f} <span className="tabular-nums text-ink-48">{counts[f]}</span>
                </button>
              ))}
            </div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as 'all' | PaymentStatus)}
              className="h-9 rounded-lg border border-ink-24 bg-white px-2 text-sm text-ink"
            >
              <option value="all">All payments</option>
              {PAYMENT_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {PAYMENT_LABELS[p]}
                </option>
              ))}
            </select>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-48" />
              <input
                className={cn(inputClass, 'pl-9')}
                placeholder="Search order, payment ID, customer or product…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-5 pt-0">
            <EmptyState icon={<ShoppingCart className="size-5" />} title="No orders match" body="Adjust filters or wait for new orders." />
          </div>
        ) : (
          <ul className="border-t border-ink-24/40">
            {filtered.map((o) => {
              const open = expanded === o.id
              const units = o.items.reduce((n, i) => n + i.quantity, 0)
              return (
                <li key={o.id} className="border-b border-ink-24/40 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => setExpanded(open ? null : o.id)}
                    aria-expanded={open}
                    className="grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 px-5 py-3 text-left hover:bg-ink/[0.02] md:grid-cols-[1.4fr_1fr_auto_auto_auto]"
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate text-sm font-medium text-ink">
                        <ChevronRight className={cn('size-3.5 shrink-0 text-ink-48 transition', open && 'rotate-90')} />
                        {o.customer.name}
                        {newOrderIds.has(o.id) && <Pill className="bg-accent-teal/50 text-ink ring-accent-teal">new</Pill>}
                      </p>
                      <p className="truncate pl-5 font-mono text-[11px] text-ink-48">{o.id}</p>
                    </div>
                    <p className="hidden text-xs text-ink-64 md:block">
                      {units} item{units === 1 ? '' : 's'} · {timeAgo(o.createdAt)}
                    </p>
                    <span className="text-right text-sm font-semibold tabular-nums text-ink md:order-none">
                      {formatINR(o.amount)}
                    </span>
                    <div className="col-span-2 flex gap-1.5 pl-5 md:col-span-1 md:pl-0">
                      <Pill className={PAYMENT_STYLES[o.status]}>{PAYMENT_LABELS[o.status]}</Pill>
                    </div>
                    <div className="hidden md:block">
                      <Pill className={FULFILLMENT_STYLES[o.fulfillment]}>{o.fulfillment}</Pill>
                    </div>
                  </button>
                  {open && <OrderDetail order={o} />}
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}

export default OrdersManager
