import React, { useState, useEffect } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { Heart, ShoppingBag, Star, Sparkles, Scale, Percent, Tag } from 'lucide-react';
import { promotionService } from '../../services/promotionService';

export default function ProductCard({ product, onCompare }) {
  const { navigate } = useRouter();
  const { t, language, isRtl } = useTranslation();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist, heartAnimatedId } = useWishlist();
  const { isDark } = useTheme();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [promoInfo, setPromoInfo] = useState(null);

  useEffect(() => {
    let isMounted = true;
    promotionService.getActivePromotions().then(promos => {
      if (isMounted && product) {
        const info = promotionService.calculateProductPromotion(product, promos);
        setPromoInfo(info);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, [product]);

  if (!product) return null;

  const isSaved = isInWishlist(product.id);
  const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.stock === 0;
  const isHeartPopping = heartAnimatedId === product.id;

  const currentPrice = promoInfo?.hasPromotion ? promoInfo.price : product.price;
  const strikePrice = promoInfo?.hasPromotion ? promoInfo.originalPrice : (product.originalPrice || null);
  const discountPct = promoInfo?.hasPromotion ? promoInfo.discountPercent : (product.discountPercent || 0);

  const displayName = language === 'bg' && product.bulgarianName
    ? product.bulgarianName
    : language === 'es' && product.spanishName
    ? product.spanishName
    : product.name;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    const itemToAdd = {
      ...product,
      price: currentPrice,
      originalPrice: strikePrice
    };
    addToCart(itemToAdd, product.size || '60 ml', 1);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleCardClick = () => {
    navigate(`/product/${product.slug || product.id}`);
  };

  const imageSrc = product.originalImage || product.images?.[0] || product.cutoutImage || '/products/luxury_designs/07_arabian_gold.webp';

  // Tier color styling
  const tierBadges = {
    Luxury: 'bg-[#D4AF37] text-black font-bold border border-[#F2D675]',
    Royal: isDark ? 'bg-[#180F08] text-[#F5EAD3] border border-[#D4AF37]/50' : 'bg-[#E2D5BC] text-[#704622] border border-[#A8853B]/40',
    Classic: isDark ? 'bg-[#F5EAD3] text-black border border-[#D4AF37]/40' : 'bg-[#FBF6EC] text-[#704622] border border-[#A8853B]/30'
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col justify-between border-2 cursor-pointer transition-all duration-500 rounded-2xl overflow-hidden hover:-translate-y-1.5 ${
        isDark
          ? 'bg-gradient-to-br from-[#D4AF37]/55 via-[#F2D675]/35 to-[#8C6239]/65 border-[#F2D675] hover:border-[#FFFDF8] shadow-[0_14px_45px_rgba(212,175,55,0.45)] hover:shadow-[0_22px_65px_rgba(242,214,117,0.75)]'
          : 'bg-[#FFFDF8] hover:bg-[#FBF6EC] border-[#A8853B]/35 hover:border-[#A8853B] shadow-[0_10px_30px_-5px_rgba(112,70,34,0.08)] hover:shadow-[0_15px_35px_rgba(112,70,34,0.14)]'
      }`}
    >
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {promoInfo?.hasPromotion ? (
          <span className="bg-gradient-to-r from-amber-600 via-[#D4AF37] to-amber-700 text-black text-[10px] font-bold font-cinzel tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-lg border border-[#F2D675] flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>-{discountPct}% • {promoInfo.promotionName}</span>
          </span>
        ) : (product.hasDiscount || (product.discountPercent && product.discountPercent > 0) || (product.originalPrice && product.originalPrice > product.price)) ? (
          <span className="bg-gradient-to-r from-red-700 via-amber-600 to-red-800 text-white text-[10px] font-bold font-cinzel tracking-widest uppercase px-2.5 py-0.5 rounded-full shadow-lg border border-amber-300/50 flex items-center gap-1">
            <Percent className="w-2.5 h-2.5" />
            <span>-{product.discountPercent || Math.round((1 - product.price / product.originalPrice) * 100)}%</span>
          </span>
        ) : null}
        {product.tier && (
          <span className={`text-[10px] uppercase font-cinzel tracking-widest px-2.5 py-0.5 rounded-full shadow-md ${tierBadges[product.tier] || 'bg-[#D4AF37] text-black'}`}>
            {t('tiers.' + product.tier.toLowerCase()) || product.tier}
          </span>
        )}
        {product.featured && !product.tier && (
          <span className="bg-[#D4AF37] text-black text-[10px] font-bold font-cinzel tracking-widest uppercase px-2 py-0.5 rounded-full shadow-md">
            {t('shop.featured') || 'Featured'}
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
            ? 'bg-black/75 text-[#FFF2B2] hover:bg-[#D4AF37] hover:text-black border border-[#F2D675]/60 shadow-sm'
            : 'bg-[#FFFDF8]/90 text-[#704622] hover:bg-[#A8853B] hover:text-white border border-[#A8853B]/40 shadow-sm'
        }`}
      >
        <Heart className={`w-3.5 h-3.5 transition-transform duration-200 ${isSaved ? 'fill-current' : ''}`} />
      </button>

      {/* Flacon Image Container with Full Editorial Background */}
      <div className={`relative aspect-[3/4] overflow-hidden flex items-center justify-center ${
        isDark ? 'bg-gradient-to-b from-[#2D1B0B] via-[#1F1308] to-[#140C05]' : 'bg-gradient-to-b from-[#FFFDF8] to-[#EAE0CC]/40'
      }`}>
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/15 via-[#F2D675]/30 to-[#D4AF37]/15 animate-pulse" />
        )}
        <img
          src={imageSrc}
          alt={displayName}
          onLoad={() => setImgLoaded(true)}
          decoding="async"
          loading="lazy"
          className={`w-full h-full object-cover group-hover:scale-108 transition-all duration-500 ease-out ${
            imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-98'
          }`}
        />

        {/* Ambient subtle vignette */}
        <div className={`absolute inset-0 pointer-events-none ${
          isDark
            ? 'bg-gradient-to-t from-[#140C03]/80 via-transparent to-black/20'
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
                ? 'bg-[#0B0A08] hover:bg-[#1A1008] text-[#FFF2B2] hover:text-[#D4AF37] border-2 border-[#F2D675] shadow-[0_8px_25px_rgba(0,0,0,0.7)] hover:border-[#FFFDF8] hover:scale-[1.02]'
                : 'bg-[#704622] hover:bg-[#4A2A14] text-[#FFFDF8] hover:text-[#FFDF8A] border border-[#A8853B]/50 shadow-[0_8px_25px_rgba(112,70,34,0.18)] hover:scale-[1.02]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 relative z-10 transition-transform duration-300 group-hover/btn:scale-110" />
            <span className="relative z-10 drop-shadow-sm">{isOutOfStock ? (t('shop.outOfStock') || 'Out of Stock') : (t('shop.addToBag') || 'Add to Bag')}</span>
          </button>
        </div>
      </div>

      {/* Details Area */}
      <div className={`p-4 sm:p-5 flex flex-col flex-1 justify-between border-t-2 ${
        isDark ? 'bg-gradient-to-b from-[#3D250C]/95 via-[#231506]/98 to-[#140C03]/98 border-[#F2D675]/70' : 'bg-[#FFFDF8] border-[rgba(122,95,44,0.16)]'
      }`}>
        <div>
          {/* Scent family / volume */}
          <div className={`flex items-center justify-between text-[11px] uppercase tracking-[0.18em] mb-1.5 font-semibold ${
            isDark ? 'text-[#FFDF8A]' : 'text-[#8A6540]'
          }`}>
            <span>{product.fragranceFamily || product.scentFamily || 'Haute Parfumerie'}</span>
            <span>{product.size || '60 ml'}</span>
          </div>

          {/* Title */}
          <h3 className={`font-cinzel font-bold transition-colors text-sm sm:text-base leading-snug line-clamp-1 ${
            isDark ? 'text-[#FFFDF8] group-hover:text-[#F2D675] drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]' : 'text-[#704622] group-hover:text-[#A8853B]'
          }`}>
            {displayName}
          </h3>

          {/* Tagline / short description */}
          <p className={`text-[12px] line-clamp-2 mt-1 font-sans leading-relaxed ${
            isDark ? 'text-[#F3E6D0]' : 'text-[#4A2A14]'
          }`}>
            {product.tagline || product.description}
          </p>
        </div>

        {/* Bottom Price & Rating */}
        <div className="pt-3 mt-3 border-t border-black/10 dark:border-[#F2D675]/30 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className={`font-cinzel text-base sm:text-lg font-extrabold ${
              isDark ? 'text-[#FFDF8A] drop-shadow-[0_0_10px_rgba(212,175,55,0.6)]' : 'text-[#A8853B]'
            }`}>
              €{currentPrice}
            </span>
            {strikePrice && strikePrice > currentPrice && (
              <span className="text-xs text-neutral-500 line-through">
                €{strikePrice}
              </span>
            )}
          </div>

          <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-[#FFDF8A]' : 'text-[#A8853B]'}`}>
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className={`font-bold ${isDark ? 'text-[#FFFDF8]' : 'text-[#704622]'}`}>{product.rating || '5.0'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
