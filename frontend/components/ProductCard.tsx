'use client';

import React from 'react';
import { Product } from '@/lib/types';
import { ShoppingCart, PackageCheck, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all" />

      <div>
        {/* Category & Stock Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
            {product.category?.name || 'General'}
          </span>
          {isOutOfStock ? (
            <span className="text-[11px] font-medium text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
              <PackageCheck className="w-3 h-3" /> Only {product.stock_quantity} left
            </span>
          ) : (
            <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              In Stock ({product.stock_quantity})
            </span>
          )}
        </div>

        {/* Product SKU */}
        <div className="text-[10px] font-mono text-slate-500 mb-1">SKU: {product.sku}</div>

        {/* Product Title */}
        <h3 className="font-bold text-lg text-white mb-2 line-clamp-1 group-hover:text-sky-300 transition-colors">
          {product.title}
        </h3>

        {/* Product Description */}
        <p className="text-sm text-slate-400 line-clamp-2 mb-4">
          {product.description || 'Premium high quality product item.'}
        </p>
      </div>

      {/* Footer Price & Add to Cart Action */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
        <div>
          <span className="text-xs text-slate-400 block">Price</span>
          <span className="text-xl font-black text-white">
            ${product.price.toFixed(2)}
          </span>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          disabled={isOutOfStock}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            isOutOfStock
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/20 active:scale-95'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};
