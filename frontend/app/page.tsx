'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { ShoppingBag, Zap, Shield, Cpu, Database, Server, GitBranch, ArrowRight, CheckCircle2, Terminal } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex-1 flex flex-col justify-center">
        
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-sky-500/20 to-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

        {/* Top Tech Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-sky-500/30 text-sky-400 text-xs font-bold uppercase tracking-wider mb-8 mx-auto shadow-lg shadow-sky-500/10">
          <Zap className="w-4 h-4" /> Next.js 14 + FastAPI + Redis + Celery + PostgreSQL
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          Scalable Real-Time <br />
          <span className="gradient-text">E-Commerce Order Platform</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
          High-performance distributed order processing architecture featuring async Celery workers, Redis rate limiting, optimistic database stock locks, role-based access control (RBAC), and interactive Next.js control center.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/store"
            className="px-8 py-4 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-xl shadow-sky-500/25 flex items-center gap-3 transition-all hover:scale-105"
          >
            Launch Storefront <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 rounded-2xl font-bold text-base text-slate-200 glass-card hover:bg-slate-800 border-slate-700 flex items-center gap-2 transition-all hover:scale-105"
          >
            Demo Accounts <Terminal className="w-5 h-5 text-sky-400" />
          </Link>
        </div>

        {/* Tech Stack Grid Cards */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          
          <div className="glass-card p-5 rounded-2xl border-slate-800">
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 w-fit mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">FastAPI Backend</h4>
            <p className="text-xs text-slate-400 mt-1">Async Pydantic v2 REST APIs with JWT & OpenAPI docs.</p>
          </div>

          <div className="glass-card p-5 rounded-2xl border-slate-800">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit mb-3">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">Celery Workers</h4>
            <p className="text-xs text-slate-400 mt-1">Async queue for stock reservation and payment execution.</p>
          </div>

          <div className="glass-card p-5 rounded-2xl border-slate-800">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 w-fit mb-3">
              <Server className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">Redis Caching</h4>
            <p className="text-xs text-slate-400 mt-1">Catalog response caching & Slowapi rate limiting.</p>
          </div>

          <div className="glass-card p-5 rounded-2xl border-slate-800">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-3">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">PostgreSQL</h4>
            <p className="text-xs text-slate-400 mt-1">Indexed schema with audit logs and transaction safety.</p>
          </div>

        </div>

      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <p>© 2026 NexusCommerce Order Platform. Built with Python, FastAPI, Docker, and Next.js.</p>
      </footer>
    </div>
  );
}
