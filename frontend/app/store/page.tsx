'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { ProductCard } from '@/components/ProductCard';
import { CartDrawer } from '@/components/CartDrawer';
import { Product, Category, Cart } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Search, Filter, RefreshCw, ShoppingBag, CheckCircle2 } from 'lucide-react';

export default function StorefrontPage() {
  const { user } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [cart, setCart] = useState<Cart | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState('');

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory) params.category_id = selectedCategory;

      const response = await apiClient.get('/products', { params });
      setProducts(response.data);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/products/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchCart = async () => {
    if (!user) return;
    try {
      const res = await apiClient.get('/cart');
      setCart(res.data);
    } catch (err) {
      console.error('Failed to load cart', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory]);

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      alert('Please sign in or use a demo account to add items to your cart.');
      return;
    }
    try {
      const res = await apiClient.post('/cart/items', {
        product_id: product.id,
        quantity: 1,
      });
      setCart(res.data);
      setIsCartOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to add item to cart');
    }
  };

  const handleUpdateCartQuantity = async (itemId: number, quantity: number) => {
    try {
      const res = await apiClient.put(`/cart/items/${itemId}`, { quantity });
      setCart(res.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update quantity');
    }
  };

  const handleRemoveCartItem = async (itemId: number) => {
    try {
      const res = await apiClient.delete(`/cart/items/${itemId}`);
      setCart(res.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to remove item');
    }
  };

  const handleCheckoutOrder = async (shippingAddress: string, paymentMethod: string) => {
    const res = await apiClient.post('/orders', {
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
    });
    setOrderSuccessMsg(`Order #${res.data.id} placed successfully! Async Celery task processing stock & payment.`);
    setCart(null);
    fetchProducts(); // Refresh catalog stock levels
    setTimeout(() => setOrderSuccessMsg(''), 8000);
  };

  const cartItemCount = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar cartItemCount={cartItemCount} onOpenCart={() => setIsCartOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        
        {/* Banner Notification */}
        {orderSuccessMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-semibold flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              {orderSuccessMsg}
            </div>
            <a href="/orders" className="underline hover:text-white font-bold">Track Orders →</a>
          </div>
        )}

        {/* Catalog Search & Category Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by title or SKU..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); fetchProducts(); }}
                className="absolute right-3 top-3 text-xs text-slate-500 hover:text-white"
              >
                Clear
              </button>
            )}
          </form>

          {/* Categories Pill Filter */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === null
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                  : 'glass-card text-slate-400 hover:text-white'
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                    : 'glass-card text-slate-400 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

        </div>

        {/* Product Catalog Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-sky-400" />
            <span className="text-sm font-medium">Fetching catalog from Redis cache & PostgreSQL...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center glass-card rounded-3xl p-12 max-w-lg mx-auto">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No products found</h3>
            <p className="text-xs text-slate-400 mt-1">Try resetting search filter or select another category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((prod) => (
              <ProductCard key={prod.id} product={prod} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}

      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleCheckoutOrder}
      />
    </div>
  );
}
