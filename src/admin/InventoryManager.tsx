import React, { useEffect, useMemo, useState } from 'react'
import { Boxes, History, Minus, Plus, Search, TriangleAlert } from 'lucide-react'
import { useAdmin } from './AdminStore'
import { Button, Card, CardHeader, EmptyState, Pill, inputClass } from './ui'
import { ALL_SIZES } from './types'
import type { ShoeSize } from '../types'
import { cn, timeAgo } from './utils'

/** Number input that commits on blur / Enter so typing doesn't spam the adjustment log. */
const StockInput: React.FC<{ value: number; onCommit: (v: number) => void; disabled?: boolean; label: string }> = ({
  value,
  onCommit,
  disabled,
  label,
}) => {
  const [draft, setDraft] = useState(String(value))
  useEffect(() => setDraft(String(value)), [value])
  const commit = () => {
    const n = parseInt(draft, 10)
    if (Number.isNaN(n) || n < 0) setDraft(String(value))
    else if (n !== value) onCommit(n)
  }
  return (
    <input
      aria-label={label}
      type="number"
      min={0}
      inputMode="numeric"
      disabled={disabled}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
      }}
      className="w-14 rounded-md border border-ink-24 bg-white px-1.5 py-1 text-center text-sm tabular-nums text-ink focus:border-ink focus:outline-none disabled:bg-transparent disabled:text-ink-24"
    />
  )
}

const SkuInput: React.FC<{ value: string; onCommit: (v: string) => void; label: string }> = ({
  value,
  onCommit,
  label,
}) => {
  const [draft, setDraft] = useState(value)
  useEffect(() => setDraft(value), [value])
  return (
    <input
      aria-label={label}
      value={draft}
      onChange={(e) => setDraft(e.target.value.toUpperCase())}
      onBlur={() => {
        const v = draft.trim()
        if (v && v !== value) onCommit(v)
        else setDraft(value)
      }}
      className="w-full min-w-0 truncate rounded border border-transparent bg-transparent px-1 py-0.5 text-center font-mono text-[10px] text-ink-48 hover:border-ink-24 focus:border-ink focus:text-ink focus:outline-none"
    />
  )
}

type Filter = 'all' | 'low' | 'out'

export const InventoryManager: React.FC = () => {
  const { products, inventory, adjustments, lowStockAlerts, adjustStock, setStock, setSku, setThreshold } = useAdmin()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [step, setStep] = useState(1)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      const inv = inventory[p.id]
      if (!inv) return false
      const matches =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        ALL_SIZES.some((s) => inv.sizes[s].sku.toLowerCase().includes(q))
      if (!matches) return false
      if (filter === 'all') return true
      return p.sizes.some((s) =>
        filter === 'out' ? inv.sizes[s].stock === 0 : inv.sizes[s].stock <= inv.lowStockThreshold
      )
    })
  }, [products, inventory, query, filter])

  const restockAllLow = () => {
    for (const a of lowStockAlerts) {
      const target = a.threshold * 3 || 10
      adjustStock(a.product.id, a.size, target - a.stock, 'restock')
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
      <div className="space-y-6 xl:col-span-3">
        {lowStockAlerts.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-amber-900">
              <TriangleAlert className="size-4 shrink-0" />
              <span>
                <strong>{lowStockAlerts.length}</strong> size{lowStockAlerts.length === 1 ? '' : 's'} at or below threshold
                {' — '}
                {lowStockAlerts.filter((a) => a.stock === 0).length} out of stock.
              </span>
            </div>
            <Button size="sm" variant="primary" onClick={restockAllLow}>
              Restock all to 3× threshold
            </Button>
          </div>
        )}

        <Card>
          <CardHeader
            title="Stock levels"
            subtitle="Adjust per size (UK 7–12). Changes apply instantly and are logged."
            icon={<Boxes className="size-4" />}
          />

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-48" />
              <input
                className={cn(inputClass, 'pl-9')}
                placeholder="Search product, category or SKU…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-ink/5 p-1">
              {(['all', 'low', 'out'] as Filter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    'rounded-md px-3 py-1 text-xs font-medium capitalize',
                    filter === f ? 'bg-white text-ink shadow-sm' : 'text-ink-64 hover:text-ink'
                  )}
                >
                  {f === 'all' ? 'All' : f === 'low' ? 'Low stock' : 'Out of stock'}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-xs text-ink-64">
              Step
              <select
                value={step}
                onChange={(e) => setStep(Number(e.target.value))}
                className="rounded-md border border-ink-24 bg-white px-2 py-1 text-sm text-ink"
              >
                {[1, 5, 10, 25].map((n) => (
                  <option key={n} value={n}>
                    ±{n}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {rows.length === 0 ? (
            <EmptyState icon={<Search className="size-5" />} title="No matching inventory" body="Try a different search or filter." />
          ) : (
            <div className="space-y-4">
              {rows.map((p) => {
                const inv = inventory[p.id]
                const units = p.sizes.reduce((n, s) => n + inv.sizes[s].stock, 0)
                return (
                  <div key={p.id} className="rounded-xl border border-ink-24/40 p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                        <p className="text-xs text-ink-48">
                          {p.category} · {units} units on hand
                        </p>
                      </div>
                      <label className="flex items-center gap-2 text-xs text-ink-64">
                        Low-stock threshold
                        <input
                          type="number"
                          min={0}
                          value={inv.lowStockThreshold}
                          onChange={(e) => setThreshold(p.id, Number(e.target.value))}
                          className="w-14 rounded-md border border-ink-24 px-1.5 py-1 text-center text-sm tabular-nums text-ink"
                        />
                      </label>
                    </div>

                    <div className="-mx-1 overflow-x-auto px-1">
                      <div className="grid min-w-[560px] grid-cols-6 gap-2">
                        {ALL_SIZES.map((size: ShoeSize) => {
                          const slot = inv.sizes[size]
                          const offered = p.sizes.includes(size)
                          const state = !offered
                            ? 'off'
                            : slot.stock === 0
                              ? 'out'
                              : slot.stock <= inv.lowStockThreshold
                                ? 'low'
                                : 'ok'
                          return (
                            <div
                              key={size}
                              className={cn(
                                'flex flex-col items-center gap-1.5 rounded-lg border p-2',
                                state === 'off' && 'border-dashed border-ink-24/60 opacity-60',
                                state === 'out' && 'border-rose-300 bg-rose-50/60',
                                state === 'low' && 'border-amber-300 bg-amber-50/60',
                                state === 'ok' && 'border-ink-24/40'
                              )}
                            >
                              <div className="flex w-full items-center justify-between">
                                <span className="text-xs font-semibold text-ink">UK {size}</span>
                                {state === 'out' && <Pill className="bg-rose-100 text-rose-700 ring-rose-200">out</Pill>}
                                {state === 'low' && <Pill className="bg-amber-100 text-amber-800 ring-amber-200">low</Pill>}
                              </div>
                              {offered ? (
                                <>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      aria-label={`Decrease UK ${size}`}
                                      disabled={slot.stock === 0}
                                      onClick={() => adjustStock(p.id, size, -step)}
                                      className="flex size-6 items-center justify-center rounded-md text-ink-64 hover:bg-ink/5 disabled:opacity-30"
                                    >
                                      <Minus className="size-3.5" />
                                    </button>
                                    <StockInput
                                      label={`Stock for ${p.name} UK ${size}`}
                                      value={slot.stock}
                                      onCommit={(v) => setStock(p.id, size, v)}
                                    />
                                    <button
                                      type="button"
                                      aria-label={`Increase UK ${size}`}
                                      onClick={() => adjustStock(p.id, size, step)}
                                      className="flex size-6 items-center justify-center rounded-md text-ink-64 hover:bg-ink/5"
                                    >
                                      <Plus className="size-3.5" />
                                    </button>
                                  </div>
                                  <SkuInput
                                    label={`SKU for ${p.name} UK ${size}`}
                                    value={slot.sku}
                                    onCommit={(v) => setSku(p.id, size, v)}
                                  />
                                </>
                              ) : (
                                <span className="py-3 text-[11px] text-ink-48">Not offered</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      <Card className="h-fit xl:sticky xl:top-4">
        <CardHeader title="Adjustment log" subtitle="Most recent 50 changes" icon={<History className="size-4" />} />
        {adjustments.length === 0 ? (
          <EmptyState title="No adjustments yet" />
        ) : (
          <ul className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
            {adjustments.map((a) => (
              <li key={a.id} className="rounded-lg bg-ink/[0.03] px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-mono text-[11px] text-ink-64">{a.sku}</span>
                  <span
                    className={cn(
                      'text-xs font-semibold tabular-nums',
                      a.delta > 0 ? 'text-emerald-600' : 'text-rose-600'
                    )}
                  >
                    {a.delta > 0 ? '+' : ''}
                    {a.delta}
                  </span>
                </div>
                <p className="truncate text-xs text-ink">
                  {a.productName} · UK {a.size}
                </p>
                <p className="text-[11px] text-ink-48">
                  <span className="capitalize">{a.reason}</span> · now {a.resultingStock} · {timeAgo(a.at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export default InventoryManager
