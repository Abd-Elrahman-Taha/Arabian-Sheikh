import React from 'react';
import { useRouter } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { Heart, ShoppingBag, Star, Sparkles, Scale } from 'lucide-react';

export default function ProductCard({ product, onCompare }) {
  const { navigate } = useRouter();
  const { t, language, isRtl } = useTranslation();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist, heartAnimatedId } = useWishlist();
  const { isDark } = useTheme();

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
    Royal: isDark ? 'bg-[#0B0A08] text-[#F3E6D0] border border-[#D4AF37]/50' : 'bg-[#FAF7F2] text-[#120B06] border border-[#D4AF37]/50',
    Classic: isDark ? 'bg-[#F3E6D0] text-black border border-[#D4AF37]/40' : 'bg-[#F0E8DC] text-[#120B06] border border-[#D4AF37]/40'
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.slug || product.id}`)}
      className={`group cursor-pointer relative border transition-all duration-500 flex flex-col justify-between overflow-hidden rounded-2xl hover:-translate-y-1 ${
        isDark
          ? 'bg-[#0B0A08]/80 border-[#D4AF37]/15 hover:border-[#D4AF37]/60 shadow-lg hover:shadow-[0_15px_35px_rgba(0,0,0,0.85)]'
          : 'bg-white border-[#D4AF37]/30 hover:border-[#D4AF37] shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_35px_rgba(212,175,55,0.2)]'
      }`}
    >
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {product.tier && (
          <span className={`text-[10px] uppercase font-cinzel tracking-widest px-2.5 py-0.5 rounded-full shadow-md ${tierBadges[product.tier] || 'bg-[#D4AF37] text-black'}`}>
            {product.tier}
          </span>
        )}
        {product.featured && !product.tier && (
          <span className="bg-[#D4AF37]/90 text-black text-[10px] font-bold font-cinzel tracking-widest uppercase px-2 py-0.5 rounded-full shadow-md">
            Featured
          </span>
        )}
        {isOutOfStock && (
          <span className="bg-red-950/90 text-red-300 border border-red-500/40 text-[10px] font-sans uppercase tracking-wider px-2 py-0.5 rounded-full">
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
            : isDark
            ? 'bg-black/60 text-[#F3E6D0] hover:bg-[#D4AF37] hover:text-black border border-[#D4AF37]/20 shadow-sm'
            : 'bg-white/80 text-[#120B06] hover:bg-[#D4AF37] hover:text-black border border-black/10 shadow-sm'
        }`}
      >
        <Heart className={`w-3.5 h-3.5 transition-transform duration-200 ${isSaved ? 'fill-current' : ''}`} />
      </button>

      {/* Flacon Image Container with Full Editorial Background */}
      <div className={`relative aspect-[3/4] overflow-hidden flex items-center justify-center ${
        isDark ? 'bg-[#0B0A08]' : 'bg-[#FAF7F2]'
      }`}>
        <img
          src={product.originalImage || product.images?.[0] || product.cutoutImage || '/products/black_diamond_gold.png'}
          alt={displayName}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Ambient subtle vignette */}
        <div className={`absolute inset-0 pointer-events-none ${
          isDark
            ? 'bg-gradient-to-t from-[#0B0A08]/70 via-transparent to-black/20'
            : 'bg-gradient-to-t from-black/20 via-transparent to-transparent'
        }`} />

        {/* Quick Add Bar on Desktop Hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out hidden md:block z-10">
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`group/btn relative w-full py-3 px-4 rounded-full font-cinzel font-bold text-[11px] uppercase tracking-[0.22em] flex items-center justify-center gap-2 transition-all duration-400 overflow-hidden cursor-pointer ${
              isOutOfStock
                ? 'bg-neutral-900/90 text-neutral-500 border border-neutral-800 cursor-not-allowed'
                : isDark
                ? 'bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] hover:from-[#F2D675] hover:via-[#D4AF37] hover:to-[#F2D675] text-white hover:text-black border border-[#F2D675]/50 shadow-[0_8px_25px_rgba(140,98,57,0.45)] hover:scale-[1.02]'
                : 'bg-gradient-to-r from-[#2C180F] via-[#120B06] to-[#2C180F] hover:from-[#D4AF37] hover:via-[#F2D675] hover:to-[#D4AF37] text-[#FFFDF9] hover:text-[#120B06] border border-[#D4AF37]/50 shadow-[0_8px_25px_rgba(0,0,0,0.15)] hover:scale-[1.02]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 relative z-10 transition-transform duration-300 group-hover/btn:scale-110" />
            <span className="relative z-10 drop-shadow-sm">{isOutOfStock ? (t('shop.outOfStock') || 'Out of Stock') : (t('shop.addToBag') || 'Add to Bag')}</span>
          </button>
        </div>
      </div>

      {/* Details Area */}
      <div className={`p-4 sm:p-5 flex flex-col flex-1 justify-between border-t ${
        isDark ? 'bg-[#0B0A08]/95 border-[#D4AF37]/10' : 'bg-white border-[#D4AF37]/20'
      }`}>
        <div>
          {/* Scent family / volume */}
          <div className={`flex items-center justify-between text-[11px] uppercase tracking-[0.18em] mb-1.5 font-medium ${
            isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'
          }`}>
            <span>{product.fragranceFamily || product.scentFamily || 'Haute Parfumerie'}</span>
            <span>{product.size || '60 ml'}</span>
          </div>

          {/* Title */}
          <h3 className={`font-cinzel font-semibold transition-colors text-sm sm:text-base leading-snug line-clamp-1 ${
            isDark ? 'text-[#F3E6D0] group-hover:text-[#D4AF37]' : 'text-[#120B06] group-hover:text-[#D4AF37]'
          }`}>
            {displayName}
          </h3>

          {/* Tagline / short description */}
          <p className={`text-[12px] line-clamp-2 mt-1 font-sans leading-relaxed ${
            isDark ? 'text-[#D8BE99]' : 'text-[#2C180F]'
          }`}>
            {product.tagline || product.description}
          </p>
        </div>

        {/* Bottom Price & Rating */}
        <div className="pt-3 mt-3 border-t border-black/10 dark:border-white/5 flex items-center justify-between">
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
            <span className={`font-medium ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>{product.rating || '5.0'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
