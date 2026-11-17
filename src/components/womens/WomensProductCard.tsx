import React, { useState } from 'react'
import {
  Check,
  ShoppingBag,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Activity,
} from 'lucide-react'
import { WomensProduct, WomensShoeSize, Colorway } from './types'
import { useCart } from '../../context/CartContext'
import { Product, ShoeSize } from '../../types'

interface WomensProductCardProps {
  product: WomensProduct
  initialSelectedSize?: WomensShoeSize
  onQuickView?: (product: WomensProduct) => void
}

export const WomensProductCard: React.FC<WomensProductCardProps> = ({
  product,
  initialSelectedSize,
  onQuickView,
}) => {
  const { addToCart } = useCart()

  // Colorway selector state
  const [selectedColorwayIndex, setSelectedColorwayIndex] = useState(0)

  // Size selector state: default to initialSelectedSize or first available size
  const [selectedSize, setSelectedSize] = useState<WomensShoeSize>(
    initialSelectedSize && product.sizes.includes(initialSelectedSize)
      ? initialSelectedSize
      : product.sizes[0] || 7
  )

  // Feedback state for Add to Cart
  const [isAdded, setIsAdded] = useState(false)
  const [showSpecs, setShowSpecs] = useState(false)
  const [imageError, setImageError] = useState(false)

  const currentColorway: Colorway =
    product.colorways[selectedColorwayIndex] || product.colorways[0]

  const handleSizeSelect = (size: WomensShoeSize) => {
    setSelectedSize(size)
  }

  const handleAddToCart = () => {
    // Construct standard Product object for CartContext
    const cartProduct: Product = {
      id: `${product.id}-${currentColorway.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: `${product.name} - ${currentColorway.name}`,
      tagline: product.tagline,
      description: product.description,
      price: product.price,
      category: `Women's ${product.category}`,
      sizes: product.sizes as unknown as ShoeSize[],
      image: currentColorway.image,
      badge: currentColorway.badge || product.badge,
      features: product.features,
    }

    addToCart(cartProduct, selectedSize as unknown as ShoeSize)

    setIsAdded(true)
    setTimeout(() => {
      setIsAdded(false)
    }, 2000)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-[#24363F]/15 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#24363F]/35">
      {/* Top Telemetry & Badge Bar */}
      <div className="flex items-center justify-between p-4 pb-2 border-b border-[#24363F]/5">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[#24363F]/60">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{product.category}</span>
          <span className="text-[#24363F]/25">•</span>
          <span>{product.activity}</span>
        </div>

        {/* Badge */}
        {(currentColorway.badge || product.badge) && (
          <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#24363F]/8 text-[#24363F] border border-[#24363F]/15 font-semibold">
            {currentColorway.badge || product.badge}
          </span>
        )}
      </div>

      {/* Shoe Visual Showcase with Image */}
      <div className="relative w-full aspect-4/3 bg-[#F8F9FA] overflow-hidden flex items-center justify-center p-6">
        <img
          src={imageError ? '/apple-icon.png' : currentColorway.image}
          alt={`${product.name} - ${currentColorway.name}`}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Floating Technical Highlights */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
          <span className="font-mono text-[9px] px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-[#24363F] border border-[#24363F]/10 font-medium">
            Arch: {product.archSupport}
          </span>
          <span className="font-mono text-[9px] px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-[#24363F] border border-[#24363F]/10 font-medium">
            Cushion: {product.cushioning}
          </span>
        </div>

        {/* Specs Toggle Button */}
        <button
          type="button"
          onClick={() => setShowSpecs((prev) => !prev)}
          className="absolute top-3 right-3 size-7 rounded-full bg-white/85 backdrop-blur-sm border border-[#24363F]/15 flex items-center justify-center text-[#24363F]/70 hover:text-[#24363F] hover:bg-white transition-colors cursor-pointer"
          title="Toggle Technical Specs"
          aria-label="Toggle Technical Specs"
        >
          <Info className="size-3.5" />
        </button>

        {/* Overlay Specs Drawer */}
        {showSpecs && (
          <div className="absolute inset-0 bg-[#24363F]/95 text-white p-5 flex flex-col justify-between text-xs font-mono z-20 backdrop-blur-sm animate-in fade-in duration-200">
            <div>
              <div className="flex justify-between items-center pb-2 border-b border-white/20 mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                  Technical Telemetry
                </span>
                <button
                  type="button"
                  onClick={() => setShowSpecs(false)}
                  className="text-white/60 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-white/60">WEIGHT:</span>
                  <span className="text-white font-medium">{product.specs.weight}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">ENERGY RETURN:</span>
                  <span className="text-white font-medium">{product.specs.energyReturn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">STACK HEIGHT:</span>
                  <span className="text-white font-medium">{product.specs.stackHeight}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">HEEL-TO-TOE DROP:</span>
                  <span className="text-white font-medium">{product.specs.drop}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/20">
              <span className="text-[10px] text-white/50 block mb-1">KEY FEATURES</span>
              <ul className="text-[10px] text-white/80 space-y-0.5 list-disc pl-3">
                {product.features.slice(0, 2).map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        {/* Title, Tagline & Price */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="font-light text-lg sm:text-xl text-[#24363F] leading-snug group-hover:text-black transition-colors">
              {product.name}
            </h3>
            <span className="font-mono text-sm sm:text-base font-semibold text-[#24363F] shrink-0">
              {formatPrice(product.price)}
            </span>
          </div>

          <p className="text-xs text-[#24363F]/70 font-light leading-relaxed mb-4 line-clamp-2">
            {product.tagline}
          </p>
        </div>

        <div className="space-y-4 pt-3 border-t border-[#24363F]/10">
          {/* Colorway Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5 font-mono text-[11px]">
              <span className="text-[#24363F]/60 uppercase tracking-wider">
                Colorway:
              </span>
              <span className="text-[#24363F] font-medium truncate max-w-[170px]">
                {currentColorway.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {product.colorways.map((cw, idx) => {
                const isSelected = idx === selectedColorwayIndex
                return (
                  <button
                    key={cw.name}
                    type="button"
                    onClick={() => {
                      setSelectedColorwayIndex(idx)
                      setImageError(false)
                    }}
                    title={cw.name}
                    aria-label={`Select colorway ${cw.name}`}
                    className={`group/color relative size-7 rounded-full p-0.5 border transition-all cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? 'border-[#24363F] scale-110 shadow-sm ring-2 ring-[#24363F]/20'
                        : 'border-[#24363F]/20 hover:border-[#24363F]/60'
                    }`}
                  >
                    <span
                      className="w-full h-full rounded-full border border-black/10"
                      style={{
                        backgroundColor: cw.hex,
                        backgroundImage: cw.accentHex
                          ? `linear-gradient(135deg, ${cw.hex} 50%, ${cw.accentHex} 50%)`
                          : undefined,
                      }}
                    />
                    {isSelected && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check
                          className={`size-3 stroke-[3] ${
                            cw.hex === '#FAF8F5' || cw.hex === '#F1F5F9' || cw.hex === '#F5F5F0'
                              ? 'text-black'
                              : 'text-white'
                          }`}
                        />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Size Selector (Sizes 5 to 11) */}
          <div>
            <div className="flex items-center justify-between mb-1.5 font-mono text-[11px]">
              <span className="text-[#24363F]/60 uppercase tracking-wider">
                Select US Size:
              </span>
              <span className="font-semibold text-[#24363F]">
                US W {selectedSize}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {product.sizes.map((size) => {
                const isSelected = size === selectedSize
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeSelect(size)}
                    className={`h-7 px-2 rounded-lg font-mono text-[11px] font-medium border transition-all cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#24363F] text-white border-[#24363F] shadow-xs'
                        : 'bg-white border-[#24363F]/15 text-[#24363F]/80 hover:border-[#24363F]/40 hover:bg-[#24363F]/5'
                    }`}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Action Buttons: Add to Cart & Optional Quick View */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-mono text-xs uppercase tracking-wider font-semibold transition-all duration-300 cursor-pointer shadow-xs active:scale-[0.98] ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#24363F] text-white hover:bg-[#1b2930]'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="size-4 stroke-[2.5]" />
                  <span>Added to Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="size-4" />
                  <span>Add to Bag • {formatPrice(product.price)}</span>
                </>
              )}
            </button>

            {onQuickView && (
              <button
                type="button"
                onClick={() => onQuickView(product)}
                aria-label="Quick View Details"
                className="size-10 rounded-xl border border-[#24363F]/20 hover:border-[#24363F] hover:bg-[#24363F]/5 flex items-center justify-center text-[#24363F] transition-colors cursor-pointer"
              >
                <ArrowRight className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
