'use client';

import React, { useState } from 'react';
import { Cart, Product } from '@/lib/types';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart | null;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemoveItem: (itemId: number) => void;
  onCheckout: (address: string, paymentMethod: string) => Promise<void>;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  const [shippingAddress, setShippingAddress] = useState('100 Silicon Way, San Francisco, CA');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await onCheckout(shippingAddress, paymentMethod);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Order checkout failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md glass-card border-l border-slate-800 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Your Shopping Cart</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium">
                {errorMsg}
              </div>
            )}

            {!cart || cart.items.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-3">
                <ShoppingBag className="w-12 h-12 mx-auto text-slate-600 stroke-[1.5]" />
                <p className="text-base font-medium">Your cart is currently empty.</p>
                <p className="text-xs text-slate-500">Explore our storefront catalog and add items!</p>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl glass-card flex items-center justify-between gap-3 border border-slate-800"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-white truncate">{item.product.title}</h4>
                    <p className="text-xs text-sky-400 font-mono mt-0.5">${item.product.price.toFixed(2)} each</p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 bg-slate-900/90 rounded-lg p-1 border border-slate-800">
                    <button
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-white px-1.5">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Item Total & Delete */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Footer Form */}
          {cart && cart.items.length > 0 && (
            <form onSubmit={handleCheckoutSubmit} className="p-6 border-t border-slate-800/80 space-y-4 bg-slate-950/60">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Shipping Address</label>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                  placeholder="Street Address, City, State, ZIP"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CREDIT_CARD')}
                    className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'CREDIT_CARD'
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Credit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PAYPAL')}
                    className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'PAYPAL'
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> PayPal
                  </button>
                </div>
              </div>

              {/* Total & Checkout Action */}
              <div className="pt-2">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-slate-400">Order Subtotal</span>
                  <span className="font-extrabold text-lg text-white">${cart.total_amount.toFixed(2)}</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'Processing Checkout...'
                  ) : (
                    <>
                      Place Order <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
