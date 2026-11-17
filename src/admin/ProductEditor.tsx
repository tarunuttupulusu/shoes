import React, { useEffect, useMemo, useState } from 'react'
import { Image as ImageIcon, PencilLine, Plus, RotateCcw, Save, Trash2, Upload, X } from 'lucide-react'
import { useAdmin } from './AdminStore'
import { Button, Card, CardHeader, EmptyState, Field, Pill, inputClass } from './ui'
import { ALL_SIZES } from './types'
import type { Product, ShoeSize } from '../types'
import { cn, formatINR, makeProductId } from './utils'

const MAX_UPLOAD_BYTES = 1.5 * 1024 * 1024

const blankProduct = (): Product => ({
  id: '',
  name: '',
  tagline: '',
  description: '',
  price: 0,
  category: '',
  sizes: [...ALL_SIZES],
  image: '',
  badge: '',
  features: [],
})

type Errors = Partial<Record<'name' | 'price' | 'category' | 'sizes' | 'image', string>>

const validate = (p: Product): Errors => {
  const e: Errors = {}
  if (!p.name.trim()) e.name = 'Name is required'
  if (!Number.isFinite(p.price) || p.price <= 0) e.price = 'Price must be greater than 0'
  if (!p.category.trim()) e.category = 'Category is required'
  if (!p.sizes.length) e.sizes = 'Offer at least one size'
  if (!p.image.trim()) e.image = 'Add an image URL or upload one'
  return e
}

export const ProductEditor: React.FC = () => {
  const { products, inventory, saveProduct, deleteProduct, resetCatalog } = useAdmin()
  const [selectedId, setSelectedId] = useState<string | null>(products[0]?.id ?? null)
  const [draft, setDraft] = useState<Product>(() => products[0] ?? blankProduct())
  const [newFeature, setNewFeature] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [notice, setNotice] = useState<string | null>(null)
  const [imgFailed, setImgFailed] = useState(false)

  const isNew = selectedId === null
  const original = useMemo(() => products.find((p) => p.id === selectedId) ?? null, [products, selectedId])
  const dirty = isNew ? draft.name !== '' || draft.price !== 0 : JSON.stringify(original) !== JSON.stringify(draft)

  useEffect(() => setImgFailed(false), [draft.image])

  useEffect(() => {
    if (!notice) return
    const t = window.setTimeout(() => setNotice(null), 2500)
    return () => window.clearTimeout(t)
  }, [notice])

  const select = (p: Product | null) => {
    if (dirty && !window.confirm('Discard unsaved changes?')) return
    setSelectedId(p?.id ?? null)
    setDraft(p ? { ...p, features: [...p.features], sizes: [...p.sizes] } : blankProduct())
    setErrors({})
    setNewFeature('')
  }

  const update = <K extends keyof Product>(key: K, value: Product[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const toggleSize = (size: ShoeSize) => {
    const sizes = draft.sizes.includes(size)
      ? draft.sizes.filter((s) => s !== size)
      : [...draft.sizes, size].sort((a, b) => a - b)
    update('sizes', sizes)
  }

  const addFeature = () => {
    const f = newFeature.trim()
    if (!f || draft.features.includes(f)) return
    update('features', [...draft.features, f])
    setNewFeature('')
  }

  const moveFeature = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= draft.features.length) return
    const next = [...draft.features]
    ;[next[i], next[j]] = [next[j], next[i]]
    update('features', next)
  }

  const onUpload = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors((e) => ({ ...e, image: 'File must be an image' }))
      return
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setErrors((e) => ({ ...e, image: 'Image must be under 1.5 MB' }))
      return
    }
    const reader = new FileReader()
    reader.onload = () => update('image', String(reader.result))
    reader.readAsDataURL(file)
  }

  const save = () => {
    const cleaned: Product = {
      ...draft,
      name: draft.name.trim(),
      tagline: draft.tagline.trim(),
      description: draft.description.trim(),
      category: draft.category.trim(),
      image: draft.image.trim(),
      badge: draft.badge?.trim() || undefined,
      price: Math.round(draft.price),
    }
    const errs = validate(cleaned)
    setErrors(errs)
    if (Object.keys(errs).length) return
    if (isNew) cleaned.id = makeProductId(cleaned.name, products)
    saveProduct(cleaned)
    setSelectedId(cleaned.id)
    setDraft(cleaned)
    setNotice(isNew ? 'Product created' : 'Changes saved')
  }

  const remove = () => {
    if (!original) return
    if (!window.confirm(`Delete "${original.name}"? Its inventory records will be removed.`)) return
    deleteProduct(original.id)
    const next = products.find((p) => p.id !== original.id) ?? null
    setSelectedId(next?.id ?? null)
    setDraft(next ?? blankProduct())
    setErrors({})
  }

  const reset = () => {
    if (!window.confirm('Reset the catalog and inventory to the default products? Custom products will be lost.')) return
    resetCatalog()
    setSelectedId(null)
    setDraft(blankProduct())
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="h-fit">
        <CardHeader
          title="Catalog"
          subtitle={`${products.length} product${products.length === 1 ? '' : 's'}`}
          icon={<PencilLine className="size-4" />}
          action={
            <Button size="sm" variant="primary" onClick={() => select(null)}>
              <Plus className="size-3.5" /> New
            </Button>
          }
        />
        {products.length === 0 ? (
          <EmptyState title="Catalog is empty" body="Create your first product." />
        ) : (
          <ul className="space-y-1.5">
            {products.map((p) => {
              const units = p.sizes.reduce((n, s) => n + (inventory[p.id]?.sizes[s]?.stock ?? 0), 0)
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => select(p)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl p-2 text-left transition',
                      selectedId === p.id ? 'bg-accent-teal/40' : 'hover:bg-ink/5'
                    )}
                  >
                    <div className="size-11 shrink-0 overflow-hidden rounded-lg bg-ink/5">
                      {p.image && <img src={p.image} alt="" className="size-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                      <p className="truncate text-xs text-ink-48">
                        {formatINR(p.price)} · {units} in stock
                      </p>
                    </div>
                    {p.badge && <Pill className="bg-white text-ink-64 ring-ink-24">{p.badge}</Pill>}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        <Button size="sm" variant="ghost" className="mt-4 w-full" onClick={reset}>
          <RotateCcw className="size-3.5" /> Reset to default catalog
        </Button>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader
          title={isNew ? 'New product' : `Edit ${original?.name ?? ''}`}
          subtitle={isNew ? 'Fill in the details and save to add to the catalog' : `ID: ${draft.id}`}
          action={
            <div className="flex items-center gap-2">
              {notice && <span className="text-xs font-medium text-emerald-600">{notice}</span>}
              {!isNew && (
                <Button size="sm" variant="ghost" onClick={remove} className="text-rose-600 hover:text-rose-700">
                  <Trash2 className="size-3.5" /> Delete
                </Button>
              )}
              {!isNew && dirty && original && (
                <Button size="sm" onClick={() => setDraft(original)}>
                  Discard
                </Button>
              )}
              <Button size="sm" variant="primary" onClick={save} disabled={!dirty}>
                <Save className="size-3.5" /> {isNew ? 'Create' : 'Save'}
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Product name" className="md:col-span-2">
            <input
              className={cn(inputClass, errors.name && 'border-rose-400')}
              value={draft.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="AEVION …"
            />
            {errors.name && <span className="mt-1 block text-[11px] text-rose-600">{errors.name}</span>}
          </Field>

          <Field label="Tagline" className="md:col-span-2">
            <input className={inputClass} value={draft.tagline} onChange={(e) => update('tagline', e.target.value)} />
          </Field>

          <Field label="Description" className="md:col-span-2">
            <textarea
              rows={3}
              className={cn(inputClass, 'resize-y')}
              value={draft.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </Field>

          <Field label="Price (₹ INR)" hint={draft.price > 0 ? `Displays as ${formatINR(draft.price)}` : undefined}>
            <input
              type="number"
              min={0}
              step={100}
              className={cn(inputClass, errors.price && 'border-rose-400')}
              value={draft.price || ''}
              onChange={(e) => update('price', Number(e.target.value))}
            />
            {errors.price && <span className="mt-1 block text-[11px] text-rose-600">{errors.price}</span>}
          </Field>

          <Field label="Category">
            <input
              className={cn(inputClass, errors.category && 'border-rose-400')}
              value={draft.category}
              onChange={(e) => update('category', e.target.value)}
              placeholder="Trail / Kinetic"
              list="admin-categories"
            />
            <datalist id="admin-categories">
              {[...new Set(products.map((p) => p.category))].map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            {errors.category && <span className="mt-1 block text-[11px] text-rose-600">{errors.category}</span>}
          </Field>

          <Field label="Badge" hint="Optional label, e.g. “New Release”">
            <input className={inputClass} value={draft.badge ?? ''} onChange={(e) => update('badge', e.target.value)} />
          </Field>

          <div>
            <span className="mb-1 block text-xs font-medium text-ink-64">Sizes offered (UK)</span>
            <div className="flex flex-wrap gap-1.5">
              {ALL_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSize(s)}
                  className={cn(
                    'h-9 min-w-9 rounded-lg px-2 text-sm font-medium ring-1 ring-inset transition',
                    draft.sizes.includes(s) ? 'bg-ink text-white ring-ink' : 'bg-white text-ink-64 ring-ink-24 hover:ring-ink'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            {errors.sizes && <span className="mt-1 block text-[11px] text-rose-600">{errors.sizes}</span>}
          </div>

          <div className="md:col-span-2">
            <span className="mb-1 block text-xs font-medium text-ink-64">Image</span>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ink-24/60 bg-ink/5">
                {draft.image && !imgFailed ? (
                  <img src={draft.image} alt="Preview" className="size-full object-cover" onError={() => setImgFailed(true)} />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-ink-48">
                    <ImageIcon className="size-6" />
                    <span className="text-[10px]">{imgFailed ? 'Failed to load' : 'No image'}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  className={cn(inputClass, errors.image && 'border-rose-400')}
                  placeholder="https://… or /path/in/public.jpg"
                  value={draft.image.startsWith('data:') ? '(uploaded image)' : draft.image}
                  onChange={(e) => update('image', e.target.value)}
                  readOnly={draft.image.startsWith('data:')}
                />
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-medium text-ink ring-1 ring-inset ring-ink-24 hover:bg-ink/5">
                    <Upload className="size-3.5" /> Upload file
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        onUpload(e.target.files?.[0])
                        e.target.value = ''
                      }}
                    />
                  </label>
                  {draft.image && (
                    <Button size="sm" variant="ghost" onClick={() => update('image', '')}>
                      <X className="size-3.5" /> Clear
                    </Button>
                  )}
                </div>
                {errors.image && <span className="block text-[11px] text-rose-600">{errors.image}</span>}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <span className="mb-1 block text-xs font-medium text-ink-64">Features</span>
            <ul className="mb-2 space-y-1.5">
              {draft.features.map((f, i) => (
                <li key={`${f}-${i}`} className="flex items-center gap-2 rounded-lg bg-ink/[0.04] px-3 py-1.5 text-sm text-ink">
                  <span className="flex-1 truncate">{f}</span>
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={i === 0}
                    onClick={() => moveFeature(i, -1)}
                    className="text-xs text-ink-48 hover:text-ink disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={i === draft.features.length - 1}
                    onClick={() => moveFeature(i, 1)}
                    className="text-xs text-ink-48 hover:text-ink disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${f}`}
                    onClick={() => update('features', draft.features.filter((_, j) => j !== i))}
                    className="text-ink-48 hover:text-rose-600"
                  >
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input
                className={inputClass}
                placeholder="Add a feature, e.g. Carbon Plate"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addFeature()
                  }
                }}
              />
              <Button onClick={addFeature} disabled={!newFeature.trim()}>
                <Plus className="size-4" /> Add
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ProductEditor
