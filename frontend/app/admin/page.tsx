'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { AdminStats } from '@/components/AdminStats';
import { DashboardStats, Product, Order } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { ShieldCheck, Plus, Package, RefreshCw, AlertTriangle, Layers, Edit2, ArrowUpRight } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stock Adjustment Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjAmount, setAdjAmount] = useState<number>(10);
  const [adjReason, setAdjReason] = useState<string>('Restock Inventory Shipment');
  const [isAdjModalOpen, setIsAdjModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, prodRes, lowStockRes, ordersRes] = await Promise.all([
        apiClient.get('/analytics/dashboard'),
        apiClient.get('/products?limit=100'),
        apiClient.get('/analytics/low-stock'),
        apiClient.get('/orders?limit=20'),
      ]);
      setStats(statsRes.data);
      setProducts(prodRes.data);
      setLowStock(lowStockRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error('Failed to load admin analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'MANAGER')) {
      fetchDashboardData();
    }
  }, [user]);

  const handleAdjustInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      await apiClient.post('/inventory/adjust', {
        product_id: selectedProduct.id,
        change_amount: adjAmount,
        reason: adjReason
      });
      setIsAdjModalOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Stock adjustment failed');
    }
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="glass-card rounded-3xl p-12 max-w-md">
            <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white">Access Restricted</h2>
            <p className="text-xs text-slate-400 mt-2">
              You must be logged in as an <strong>ADMIN</strong> or <strong>MANAGER</strong> to access the control panel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-sky-400" />
              <h1 className="text-2xl font-black text-white">Admin & Inventory Control Panel</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">Real-time overview of revenue, stock levels, and order pipelines</p>
          </div>

          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl glass-card text-slate-300 hover:text-white flex items-center gap-2 text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-400' : ''}`} /> Refresh Stats
          </button>
        </div>

        {/* Dashboard Metrics */}
        {stats && <AdminStats stats={stats} />}

        {/* Inventory Stock Management Table */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-white">Product Catalog & Inventory Levels</h3>
              <p className="text-xs text-slate-400">Manage stock quantities, prices, and SKUs</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Product Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock Qty</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-mono text-xs text-sky-400 font-semibold">{prod.sku}</td>
                    <td className="py-3 px-4 font-semibold text-white">{prod.title}</td>
                    <td className="py-3 px-4 text-xs text-slate-400">{prod.category?.name || 'General'}</td>
                    <td className="py-3 px-4 font-mono">${prod.price.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        prod.stock_quantity === 0
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : prod.stock_quantity <= 10
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {prod.stock_quantity} units
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => { setSelectedProduct(prod); setIsAdjModalOpen(true); }}
                        className="px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 font-bold text-xs hover:bg-sky-500/20 transition-colors"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Stock Adjustment Modal */}
      {isAdjModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">Adjust Stock: {selectedProduct.title}</h3>
            <p className="text-xs text-slate-400">Current Stock Level: <strong>{selectedProduct.stock_quantity} units</strong></p>

            <form onSubmit={handleAdjustInventorySubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Stock Change Amount (+ or -)</label>
                <input
                  type="number"
                  required
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Audit Log</label>
                <input
                  type="text"
                  required
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdjModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 text-xs font-bold hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-500 text-white font-bold text-xs hover:bg-sky-400 shadow-lg shadow-sky-500/20"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
