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
    Luxury: 'bg-[#D4AF37] text-black font-bold border border-[#F2D675]',
    Royal: 'bg-[#0B0A08] text-[#F3E6D0] border border-[#D4AF37]/50',
    Classic: 'bg-[#F3E6D0] text-black border border-[#D4AF37]/40'
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.slug || product.id}`)}
      className="group cursor-pointer relative bg-[#0B0A08]/80 border border-[#D4AF37]/15 hover:border-[#D4AF37]/60 transition-all duration-500 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-[0_15px_35px_rgba(0,0,0,0.85)] hover:-translate-y-1 rounded-sm"
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
            : 'bg-black/60 text-[#F3E6D0] hover:bg-[#D4AF37] hover:text-black border border-[#D4AF37]/20 shadow-sm'
        }`}
      >
        <Heart className={`w-3.5 h-3.5 transition-transform duration-200 ${isSaved ? 'fill-current' : ''}`} />
      </button>

      {/* Flacon Image Container with Full Editorial Background */}
      <div className="relative aspect-[3/4] bg-[#0B0A08] overflow-hidden flex items-center justify-center">
        <img
          src={product.originalImage || product.images?.[0] || product.cutoutImage || '/products/black_diamond_gold.png'}
          alt={displayName}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Ambient subtle vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A08]/70 via-transparent to-black/20 pointer-events-none" />

        {/* Quick Add Bar on Desktop Hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out hidden md:block z-10">
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`group/btn relative w-full py-3 px-4 rounded-full font-cinzel font-bold text-[11px] uppercase tracking-[0.22em] flex items-center justify-center gap-2 transition-all duration-400 overflow-hidden cursor-pointer ${
              isOutOfStock
                ? 'bg-neutral-900/90 text-neutral-500 border border-neutral-800 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] hover:from-[#F2D675] hover:via-[#D4AF37] hover:to-[#F2D675] text-white hover:text-black border border-[#F2D675]/50 hover:border-white shadow-[0_8px_25px_rgba(140,98,57,0.45)] hover:shadow-[0_12px_35px_rgba(212,175,55,0.65)] hover:scale-[1.02]'
            }`}
          >
            {/* Subtle Light Glint */}
            <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

            <ShoppingBag className="w-3.5 h-3.5 relative z-10 transition-transform duration-300 group-hover/btn:scale-110" />
            <span className="relative z-10 drop-shadow-sm">{isOutOfStock ? (t('shop.outOfStock') || 'Out of Stock') : (t('shop.addToBag') || 'Add to Bag')}</span>
          </button>
        </div>
      </div>

      {/* Details Area */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-[#0B0A08]/95 border-t border-[#D4AF37]/10">
        <div>
          {/* Scent family / volume */}
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[#D8BE99] mb-1.5">
            <span>{product.fragranceFamily || product.scentFamily || 'Haute Parfumerie'}</span>
            <span>{product.size || '60 ml'}</span>
          </div>

          {/* Title */}
          <h3 className="font-cinzel font-semibold text-[#F3E6D0] group-hover:text-[#D4AF37] transition-colors text-sm sm:text-base leading-snug line-clamp-1">
            {displayName}
          </h3>

          {/* Tagline / short description */}
          <p className="text-[12px] text-[#D8BE99] line-clamp-2 mt-1 font-sans leading-relaxed">
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
            <span className="font-medium text-[#F3E6D0]">{product.rating || '5.0'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
