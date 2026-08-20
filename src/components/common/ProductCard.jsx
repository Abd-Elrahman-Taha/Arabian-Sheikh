import React from 'react';
import { useRouter } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { Heart, ShoppingBag, Star, Sparkles, Scale } from 'lucide-react';

export default function ProductCard({ product, onCompare }) {
  const { navigate } = useRouter();
  const { t, language, isRtl } = useTranslation();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist, heartAnimatedId } = useWishlist();

  if (!product) return null;

  const isSaved = isInWishlist(product.id);
  const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.stock === 0;
  const isHeartPopping = heartAnimatedId === product.id;

  const displayName = language === 'bg' && product.bulgarianName
    ? product.bulgarianName
    : language === 'es' && product.spanishName
    ? product.spanishName
    : product.name;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, product.size || '60 ml', 1);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  // Tier color styling
  const tierBadges = {
    Luxury: 'bg-[#D4AF37] text-black font-bold border border-[#FFDF73]',
    Royal: 'bg-[#1A1A1C] text-[#E5E0D8] border border-[#D4AF37]/50',
    Classic: 'bg-[#F8F5F0] text-black border border-[#D4AF37]/40'
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.slug || product.id}`)}
      className="group cursor-pointer relative bg-[#121010]/80 border border-[#D4AF37]/15 hover:border-[#D4AF37]/60 transition-all duration-500 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-[0_15px_35px_rgba(0,0,0,0.85)] hover:-translate-y-1 rounded-sm"
    >
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {product.tier && (
          <span className={`text-[10px] uppercase font-cinzel tracking-widest px-2.5 py-0.5 rounded-xs shadow-md ${tierBadges[product.tier] || 'bg-[#D4AF37] text-black'}`}>
            {product.tier}
          </span>
        )}
        {product.featured && !product.tier && (
          <span className="bg-[#D4AF37]/90 text-black text-[10px] font-bold font-cinzel tracking-widest uppercase px-2 py-0.5 shadow-md">
            Featured
          </span>
        )}
        {isOutOfStock && (
          <span className="bg-red-950/90 text-red-300 border border-red-500/40 text-[10px] font-sans uppercase tracking-wider px-2 py-0.5">
            {t('shop.outOfStock') || 'Out of Stock'}
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        aria-label="Save to Wishlist"
        className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
          isHeartPopping ? 'animate-bounce' : ''
        } ${
          isSaved
            ? 'bg-[#D4AF37] text-black shadow-md scale-105'
            : 'bg-black/60 text-[#E5E0D8] hover:bg-[#D4AF37] hover:text-black border border-[#D4AF37]/20 shadow-sm'
        }`}
      >
        <Heart className={`w-3.5 h-3.5 transition-transform duration-200 ${isSaved ? 'fill-current' : ''}`} />
      </button>

      {/* Flacon Image Container with Soft Ambient Dark Background */}
      <div className="relative aspect-[3/4] bg-gradient-to-b from-[#181515] to-[#0D0B0B] overflow-hidden flex items-center justify-center p-6">
        <img
          src={product.cutoutImage || product.images?.[0] || '/products/black_diamond_gold.png'}
          alt={displayName}
          className="max-h-[88%] w-auto object-contain filter drop-shadow-[0_15px_20px_rgba(0,0,0,0.9)] group-hover:scale-108 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Ambient shadow glow beneath bottle */}
        <div className="absolute bottom-4 w-28 h-4 bg-black/80 rounded-full blur-md pointer-events-none" />

        {/* Quick Add Bar on Desktop Hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out hidden md:block z-10">
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`w-full py-2.5 text-[11px] uppercase tracking-[0.2em] font-cinzel font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isOutOfStock
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-[#D4AF37] text-black hover:bg-[#E5C07B] shadow-lg font-bold'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? (t('shop.outOfStock') || 'Out of Stock') : (t('shop.addToBag') || 'Add to Bag')}</span>
          </button>
        </div>
      </div>

      {/* Details Area */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-[#121010]/95 border-t border-[#D4AF37]/10">
        <div>
          {/* Scent family / volume */}
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[#8C6D37] mb-1.5">
            <span>{product.fragranceFamily || product.scentFamily || 'Haute Parfumerie'}</span>
            <span>{product.size || '60 ml'}</span>
          </div>

          {/* Title */}
          <h3 className="font-cinzel font-semibold text-[#F8F5F0] group-hover:text-[#D4AF37] transition-colors text-sm sm:text-base leading-snug line-clamp-1">
            {displayName}
          </h3>

          {/* Tagline / short description */}
          <p className="text-[12px] text-[#A69E94] line-clamp-2 mt-1 font-sans leading-relaxed">
            {product.tagline || product.description}
          </p>
        </div>

        {/* Bottom Price & Rating */}
        <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-cinzel text-base sm:text-lg font-bold text-[#D4AF37]">
              €{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-neutral-500 line-through">
                €{product.originalPrice}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[#D4AF37] text-xs">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="font-medium text-[#E5E0D8]">{product.rating || '5.0'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
