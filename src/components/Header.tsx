import React from 'react'
import { ShoppingBag, User as UserIcon, Shield } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../auth/AuthContext'

interface HeaderProps {
  telemetryState?: string
  fps?: number
  onOpenAuth?: () => void
}

export const Header: React.FC<HeaderProps> = ({ 
  telemetryState = "ACTIVE",
  onOpenAuth
}) => {
  const { totalItems, toggleCart } = useCart()
  const { user } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 md:px-8 font-mono text-[11px] md:text-[12px] tracking-tight uppercase text-[#24363F]/80 backdrop-blur-md bg-[#FDFDFD]/85 border-b border-[#24363F]/10">
      {/* Brand / Title */}
      <div className="flex items-center gap-3">
        <a 
          href="#top" 
          className="font-bold text-[#24363F] hover:opacity-70 transition-opacity flex items-center gap-1.5"
        >
          <span className="text-[#24363F]/40">[</span>
          <span>aevion</span>
          <span className="text-[#24363F]/40">]</span>
        </a>
        <div className="hidden sm:flex items-center gap-2 text-[#24363F]/50 pl-2 border-l border-[#24363F]/20">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>FOOTWEAR & KINETICS</span>
        </div>
      </div>

      {/* Center Navigation Links */}
      <nav className="hidden lg:flex items-center gap-6 text-[#24363F]/70 font-semibold tracking-wider">
        <a href="#footwear" className="hover:text-[#24363F] transition-colors">
          COLLECTION
        </a>
        <span className="text-[#24363F]/20">/</span>
        <a href="#mens" className="hover:text-[#24363F] transition-colors">
          MEN'S
        </a>
        <span className="text-[#24363F]/20">/</span>
        <a href="#womens" className="hover:text-[#24363F] transition-colors">
          WOMEN'S
        </a>
        <span className="text-[#24363F]/20">/</span>
        <a href="#admin" className="hover:text-emerald-600 transition-colors flex items-center gap-1 text-[#24363F]/60">
          <Shield className="size-3" />
          <span>ADMIN</span>
        </a>
      </nav>

      {/* Right Controls: Auth, Admin, and Bag */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Admin Link for Mobile/Tablet */}
        <a
          href="#admin"
          className="lg:hidden flex items-center gap-1 text-[10px] text-[#24363F]/70 hover:text-emerald-600 px-2 py-1 rounded border border-[#24363F]/10"
        >
          <Shield className="size-3" />
          <span className="hidden xs:inline">ADMIN</span>
        </a>

        {/* User Auth Trigger */}
        <button
          onClick={onOpenAuth}
          type="button"
          aria-label={user ? `Logged in as ${user.name}` : "Sign In"}
          className="flex items-center gap-1.5 bg-[#24363F]/5 hover:bg-[#24363F]/10 text-[#24363F] px-2.5 py-1.5 rounded-full text-[10px] font-semibold transition-colors cursor-pointer"
        >
          <UserIcon className="size-3" />
          <span className="max-w-[70px] truncate hidden sm:inline">
            {user ? user.name.split(' ')[0] : 'SIGN IN'}
          </span>
        </button>

        {/* Apple-style Cart Trigger Button */}
        <button
          onClick={toggleCart}
          type="button"
          aria-label={`Toggle shopping cart with ${totalItems} items`}
          className="group relative flex items-center gap-2 bg-[#24363F] text-white hover:bg-[#1a2830] px-3.5 py-1.5 rounded-full font-mono text-[11px] font-semibold tracking-wider transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
        >
          <ShoppingBag className="size-3.5 group-hover:scale-110 transition-transform" />
          <span className="hidden xs:inline">BAG</span>
          <span
            className={`min-w-4.5 px-1 h-4.5 rounded-full text-[10px] flex items-center justify-center font-bold transition-colors ${
              totalItems > 0
                ? 'bg-emerald-500 text-white'
                : 'bg-white/20 text-white/90'
            }`}
          >
            {totalItems}
          </span>
        </button>
      </div>
    </header>
  )
}
