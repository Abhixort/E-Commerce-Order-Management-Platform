'use client';

import React from 'react';
import { Order, OrderStatus } from '@/lib/types';
import { Clock, RefreshCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface OrderTrackerProps {
  order: Order;
  onRefresh?: () => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ order, onRefresh }) => {
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Completed
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center gap-1.5 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin" /> Processing (Celery Worker)
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Pending Queued
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-1.5">
            <XCircle className="w-4 h-4" /> Failed / Declined
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 border border-slate-500/30 text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Cancelled
          </span>
        );
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-extrabold text-lg text-white">Order #{order.id}</h3>
            {getStatusBadge(order.status)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Placed on {new Date(order.created_at).toLocaleString()}</p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Task Worker Execution Metadata */}
      {order.celery_task_id && (
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Async Task Execution ID:</span>
          <span className="font-mono text-sky-400 font-semibold">{order.celery_task_id}</span>
        </div>
      )}

      {/* Order Items Table */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Order Items</span>
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between items-center text-sm py-1.5 border-b border-slate-800/40">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sky-400">{item.quantity}x</span>
              <span className="text-slate-200">{item.product?.title || `Product #${item.product_id}`}</span>
            </div>
            <span className="font-mono text-slate-300">${(item.unit_price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Total Amount & Shipping */}
      <div className="pt-3 flex justify-between items-end border-t border-slate-800">
        <div>
          <span className="text-[11px] text-slate-400 block">Shipping Address</span>
          <span className="text-xs text-slate-300 font-medium">{order.shipping_address}</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block">Total Amount</span>
          <span className="text-xl font-black text-white">${order.total_amount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
