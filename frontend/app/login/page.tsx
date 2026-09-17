'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { ShoppingBag, Lock, Mail, ShieldCheck, UserCheck, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await apiClient.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const { access_token, role, user_id, full_name } = response.data;
      login(access_token, { id: user_id, email, full_name, role, is_active: true });

      if (role === 'ADMIN' || role === 'MANAGER') {
        router.push('/admin');
      } else {
        router.push('/store');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid login credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetLogin = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative">
      
      <div className="w-full max-w-md space-y-6">
        
        {/* Logo Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              Nexus<span className="gradient-text">Commerce</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign in to your account</h2>
          <p className="text-sm text-slate-400 mt-1">Access storefront catalog or admin analytics portal</p>
        </div>

        {/* Demo Account Presets */}
        <div className="glass-card rounded-2xl p-4 border border-sky-500/20 bg-sky-500/5 space-y-2">
          <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider block mb-1">
            ⚡ Quick Demo Logins:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handlePresetLogin('admin@example.com', 'admin123')}
              className="px-2.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-sky-500 text-[11px] font-bold text-slate-200 flex flex-col items-center transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400 mb-0.5" />
              Admin
            </button>

            <button
              type="button"
              onClick={() => handlePresetLogin('manager@example.com', 'manager123')}
              className="px-2.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500 text-[11px] font-bold text-slate-200 flex flex-col items-center transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-400 mb-0.5" />
              Manager
            </button>

            <button
              type="button"
              onClick={() => handlePresetLogin('customer@example.com', 'customer123')}
              className="px-2.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500 text-[11px] font-bold text-slate-200 flex flex-col items-center transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400 mb-0.5" />
              Customer
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="glass-card rounded-2xl p-8 border border-slate-800 space-y-5">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link href="/register" className="text-sky-400 font-semibold hover:underline">
            Register here
          </Link>
        </p>

      </div>

    </div>
  );
}
