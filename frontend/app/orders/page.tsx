'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { OrderTracker } from '@/components/OrderTracker';
import { Order } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Package, RefreshCw, AlertCircle } from 'lucide-react';

export default function UserOrdersPage() {
  const { user } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await apiClient.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Auto refresh every 5 seconds to track background Celery worker state changes
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">Order Tracking & History</h1>
            <p className="text-xs text-slate-400 mt-1">Live status updates from Celery async queue</p>
          </div>

          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-xl glass-card text-slate-300 hover:text-white flex items-center gap-2 text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-400' : ''}`} /> Refresh
          </button>
        </div>

        {!user ? (
          <div className="glass-card rounded-3xl p-12 text-center text-slate-400">
            <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-bold text-white">Sign in required</p>
            <p className="text-xs text-slate-400 mt-1">Please log in to view your placed order history.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center text-slate-400">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-bold text-white">No orders placed yet</p>
            <p className="text-xs text-slate-400 mt-1">Head over to the storefront catalog to place your first order!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((ord) => (
              <OrderTracker key={ord.id} order={ord} onRefresh={fetchOrders} />
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
