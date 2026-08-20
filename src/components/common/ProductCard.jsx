import React from 'react';
import { useRouter } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { Heart, ShoppingBag, Star, Sparkles, ArrowUpRight } from 'lucide-react';

export default function ProductCard({ product, layout = 'grid' }) {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist, heartAnimatedId } = useWishlist();

  if (!product) return null;

  const isSaved = isInWishlist(product.id);
  const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.stock === 0;
  const isHeartPopping = heartAnimatedId === product.id;

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
      className="group cursor-pointer relative bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-[var(--color-terracotta-deep)] transition-all duration-400 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5"
    >
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {product.featured && (
          <span className="bg-[var(--color-terracotta)] text-[#F8D188] text-[10px] font-bold font-cinzel tracking-widest uppercase px-2.5 py-0.5 shadow-md">
            Featured
          </span>
        )}
        {product.discount > 0 && (
          <span className="bg-[var(--color-earth-dark)] text-[var(--color-desert-light)] border border-[var(--color-terracotta)]/40 text-[10px] font-sans font-semibold tracking-wider px-2 py-0.5">
            -{product.discount}%
          </span>
        )}
        {isOutOfStock && (
          <span className="bg-[var(--color-earth-dark)]/90 text-rose-200 border border-rose-400/40 text-[10px] font-sans uppercase tracking-wider px-2 py-0.5">
            {t('shop.outOfStock')}
          </span>
        )}
      </div>

      {/* Wishlist Button with Heart Animation */}
      <button
        onClick={handleWishlistToggle}
        aria-label="Save to Wishlist"
        className={`absolute top-3 right-3 z-10 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${
          isHeartPopping ? 'animate-heart-pop' : ''
        } ${
          isSaved
            ? 'bg-[var(--color-terracotta)] text-[#F8D188] shadow-md scale-105'
            : 'bg-[#F8D188]/90 text-[var(--color-earth-dark)] hover:bg-[var(--color-terracotta)] hover:text-[#F8D188] shadow-sm'
        }`}
      >
        <Heart className={`w-4 h-4 transition-transform duration-200 ${isSaved ? 'fill-current' : ''}`} />
      </button>

      {/* Image Container with Subtle Zoom */}
      <div className="relative aspect-[4/5] bg-[var(--bg-primary)] overflow-hidden">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Desktop Quick Add Reveal Bar */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out hidden md:block z-10">
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`w-full py-2.5 text-[11px] uppercase tracking-[0.2em] font-cinzel font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isOutOfStock
                ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                : 'luxury-btn-gold shadow-lg hover:shadow-[var(--color-terracotta)]/30'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? t('shop.outOfStock') : t('shop.addToBag')}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-[var(--bg-card)]">
        <div>
          {/* Fragrance Family & Arabic Script */}
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-[var(--color-terracotta-deep)] font-semibold mb-1.5">
            <span className="font-sans font-medium">{product.fragranceFamily}</span>
            <span className="font-arabic text-xs text-[var(--color-terracotta)] font-bold">{product.familyArabic}</span>
          </div>

          {/* Product Name & Arabic Title */}
          <h3 className="font-cinzel text-base font-semibold text-[var(--color-earth-dark)] group-hover:text-[var(--color-terracotta)] transition-colors leading-snug">
            {product.name}
          </h3>
          <p className="font-arabic text-xs text-[var(--text-muted)] mt-0.5">
            {product.arabicName}
          </p>

          {/* Key Notes */}
          <p className="text-xs text-[var(--text-muted)] line-clamp-1 mt-2 font-sans tracking-wide">
            {product.topNotes?.slice(0, 2).join(' • ')} • {product.baseNotes?.[0]}
          </p>
        </div>

        {/* Rating & Price Row */}
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
          {/* Rating */}
          <div className="flex items-center gap-1 text-[var(--color-terracotta)]">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-semibold text-[var(--color-earth-dark)]">{product.rating}</span>
            <span className="text-[10px] text-[var(--text-muted)]">({product.reviewsCount})</span>
          </div>

          {/* Price (Terracotta #B45625) */}
          <div className="text-right">
            {product.originalPrice && product.originalPrice > product.price ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[var(--text-muted)] line-through font-mono">
                  ${product.originalPrice}
                </span>
                <span className="font-cinzel text-base font-bold text-[var(--color-terracotta)]">
                  ${product.price}
                </span>
              </div>
            ) : (
              <span className="font-cinzel text-base font-bold text-[var(--color-terracotta)]">
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
            className={`w-full py-2.5 text-xs uppercase tracking-widest font-cinzel font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
              isOutOfStock
                ? 'border-neutral-400 text-neutral-400 bg-transparent'
                : 'border-[var(--color-terracotta)] text-[var(--color-terracotta)] bg-[var(--color-terracotta)]/10 active:bg-[var(--color-terracotta)] active:text-[#F8D188]'
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
