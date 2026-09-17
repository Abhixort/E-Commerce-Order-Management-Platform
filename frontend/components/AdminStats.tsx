'use client';

import React from 'react';
import { DashboardStats } from '@/lib/types';
import { DollarSign, ShoppingBag, AlertTriangle, Layers, CheckCircle2, Clock } from 'lucide-react';

interface AdminStatsProps {
  stats: DashboardStats;
}

export const AdminStats: React.FC<AdminStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      
      {/* Total Revenue */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
          <DollarSign className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-slate-400 font-medium block">Total Revenue</span>
          <span className="text-xl font-black text-white">${stats.total_revenue.toFixed(2)}</span>
        </div>
      </div>

      {/* Total Orders */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-slate-400 font-medium block">Total Orders</span>
          <span className="text-xl font-black text-white">{stats.total_orders}</span>
        </div>
      </div>

      {/* Completed Orders */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-slate-400 font-medium block">Completed</span>
          <span className="text-xl font-black text-white">{stats.completed_orders_count}</span>
        </div>
      </div>

      {/* Pending Queue */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-slate-400 font-medium block">Pending Tasks</span>
          <span className="text-xl font-black text-white">{stats.pending_orders_count}</span>
        </div>
      </div>

      {/* Catalog Products */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-slate-400 font-medium block">Products</span>
          <span className="text-xl font-black text-white">{stats.total_products}</span>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs text-slate-400 font-medium block">Low Stock Alerts</span>
          <span className="text-xl font-black text-white">{stats.low_stock_products_count}</span>
        </div>
      </div>

    </div>
  );
};
