'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ShoppingBag, ShoppingCart, User as UserIcon, LogOut, ShieldCheck, Layers } from 'lucide-react';

interface NavbarProps {
  cartItemCount?: number;
  onOpenCart?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ cartItemCount = 0, onOpenCart }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Nexus<span className="gradient-text">Commerce</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link href="/store" className="hover:text-sky-400 transition-colors">
              Storefront
            </Link>
            {user && (
              <Link href="/orders" className="hover:text-sky-400 transition-colors">
                My Orders
              </Link>
            )}
            {user && (user.role === 'ADMIN' || user.role === 'MANAGER') && (
              <Link href="/admin" className="flex items-center gap-1 text-sky-400 font-semibold hover:text-sky-300 transition-colors">
                <ShieldCheck className="w-4 h-4" />
                Admin Portal
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            
            {/* Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl glass-card text-slate-200 hover:text-white hover:border-sky-500/40 transition-all"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 shadow">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-white">{user.full_name}</span>
                  <span className="text-[10px] text-sky-400 font-medium uppercase tracking-wider">{user.role}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 rounded-xl shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02]"
                >
                  Get Started
                </Link>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
