import React from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { Heart, ShoppingBag, Star, Sparkles } from 'lucide-react';

export default function ProductCard({ product, layout = 'grid' }) {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const isSaved = isInWishlist(product.id);
  const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.stock === 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, '100ml', 1);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group cursor-pointer relative bg-[#1C120E] border border-[#C6A15B]/20 hover:border-[#C6A15B]/60 transition-all duration-500 flex flex-col justify-between overflow-hidden"
      style={{
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
      }}
    >
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {product.featured && (
          <span className="bg-[#C6A15B] text-[#0F0D0C] text-[10px] font-bold font-cinzel tracking-widest uppercase px-2 py-0.5 shadow">
            Featured
          </span>
        )}
        {product.discount > 0 && (
          <span className="bg-[#4A2F22] text-[#DFBF7A] border border-[#C6A15B]/40 text-[10px] font-sans font-semibold tracking-wider px-2 py-0.5">
            -{product.discount}%
          </span>
        )}
        {isOutOfStock && (
          <span className="bg-[#0F0D0C]/90 text-red-400 border border-red-500/40 text-[10px] font-sans uppercase tracking-wider px-2 py-0.5">
            {t('shop.outOfStock')}
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        aria-label="Save to Wishlist"
        className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
          isSaved
            ? 'bg-[#C6A15B] text-[#0F0D0C] shadow-lg'
            : 'bg-[#0F0D0C]/60 text-[#F3EEE5] hover:bg-[#C6A15B] hover:text-[#0F0D0C]'
        }`}
      >
        <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
      </button>

      {/* Image Container with Subtle Zoom */}
      <div className="relative aspect-[4/5] bg-[#140D0A] overflow-hidden">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />

        {/* Subtle Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C120E] via-transparent to-transparent opacity-60 pointer-events-none" />

        {/* Quick Add Overlay on Desktop Hover */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block">
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`w-full py-2.5 text-xs uppercase tracking-widest font-cinzel font-semibold flex items-center justify-center gap-2 transition-all ${
              isOutOfStock
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'luxury-btn-gold shadow-xl'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? t('shop.outOfStock') : t('shop.addToBag')}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-gradient-to-b from-[#1C120E] to-[#241712]">
        <div>
          {/* Fragrance Family & Arabic Script */}
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-[#C6A15B] mb-1.5">
            <span className="font-sans font-medium">{product.fragranceFamily}</span>
            <span className="font-arabic text-xs text-[#DFBF7A]">{product.familyArabic}</span>
          </div>

          {/* Product Name & Arabic Title */}
          <h3 className="font-cinzel text-base font-semibold text-[#F3EEE5] group-hover:text-[#C6A15B] transition-colors leading-snug">
            {product.name}
          </h3>
          <p className="font-arabic text-xs text-[#C5B8A8] mt-0.5">
            {product.arabicName}
          </p>

          {/* Key Notes */}
          <p className="text-xs text-[#C5B8A8]/80 line-clamp-1 mt-2 font-sans tracking-wide">
            {product.topNotes?.slice(0, 2).join(' • ')} • {product.baseNotes?.[0]}
          </p>
        </div>

        {/* Rating & Price Row */}
        <div className="mt-4 pt-3 border-t border-[#C6A15B]/15 flex items-center justify-between">
          {/* Rating */}
          <div className="flex items-center gap-1 text-[#C6A15B]">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-semibold text-[#F3EEE5]">{product.rating}</span>
            <span className="text-[10px] text-[#C5B8A8]">({product.reviewsCount})</span>
          </div>

          {/* Price */}
          <div className="text-right">
            {product.originalPrice && product.originalPrice > product.price ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#C5B8A8] line-through font-mono">
                  ${product.originalPrice}
                </span>
                <span className="font-cinzel text-base font-bold text-[#C6A15B]">
                  ${product.price}
                </span>
              </div>
            ) : (
              <span className="font-cinzel text-base font-bold text-[#C6A15B]">
                ${product.price}
              </span>
            )}
          </div>
        </div>

        {/* Mobile Quick Add Button */}
        <div className="mt-3 md:hidden">
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`w-full py-2 text-xs uppercase tracking-widest font-cinzel font-semibold flex items-center justify-center gap-1.5 border ${
              isOutOfStock
                ? 'border-neutral-800 text-neutral-500'
                : 'border-[#C6A15B] text-[#C6A15B] bg-[#C6A15B]/10 active:bg-[#C6A15B] active:text-[#0F0D0C]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? t('shop.outOfStock') : t('shop.addToBag')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
