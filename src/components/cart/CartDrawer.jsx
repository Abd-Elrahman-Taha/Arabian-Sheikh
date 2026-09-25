import React, { useState, useEffect } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { productService } from '../../services/productService';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Gift,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function CartDrawer() {
  const { navigate } = useRouter();
  const { t, language, isRtl } = useTranslation();
  const { isDark } = useTheme();
  const {
    items,
    totals,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeFromCart,
    cart,
    toggleGiftWrap,
    applyDiscount,
    removeDiscount,
    addToCart
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    async function loadPairings() {
      if (!isDrawerOpen) return;
      try {
        const firstItemId = items[0]?.productId;
        if (firstItemId) {
          const related = await productService.getRelatedProducts(firstItemId, 4);
          const cartIds = items.map(i => i.productId);
          const filtered = related.filter(r => !cartIds.includes(r.id));
          setRecommendations(filtered.slice(0, 2));
        } else {
          setRecommendations([]);
        }
      } catch (err) {
        console.error('Error loading drawer recommendations:', err);
      }
    }
    loadPairings();
  }, [isDrawerOpen, items]);

  if (!isDrawerOpen) return null;

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    if (!promoInput) return;
    setPromoLoading(true);
    try {
      await applyDiscount(promoInput);
      setPromoInput('');
    } catch {
      // Toast handles error feedback
    } finally {
      setPromoLoading(false);
    }
  };

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  const handleViewBag = () => {
    closeDrawer();
    navigate('/cart');
  };

  const netCheckoutTotal = Math.max(0, totals.subtotal - (totals.discountAmount || 0));
  const bulgariaFreeThreshold = 49;
  const isBulgariaFreeUnlocked = netCheckoutTotal > bulgariaFreeThreshold;
  const bulgariaFreeRemaining = Math.max(0, Math.round((bulgariaFreeThreshold - netCheckoutTotal + 0.01) * 100) / 100);
  const bulgariaProgress = Math.min(100, Math.round((netCheckoutTotal / bulgariaFreeThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity cursor-pointer"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 rtl:right-auto rtl:left-0 max-w-full flex">
        <div className={`w-screen max-w-md border-l rtl:border-l-0 rtl:border-r shadow-2xl flex flex-col justify-between transition-colors duration-500 ${
          isDark ? 'bg-[#0B0A08] border-[#D4AF37]/30 text-[#F3E6D0]' : 'bg-[#CBB198] border-[#D4AF37]/40 text-[#120B06]'
        }`}>
          
          {/* Header */}
          <div className={`p-5 border-b flex items-center justify-between transition-colors ${
            isDark ? 'bg-[#0B0A08] border-[#D4AF37]/20 text-[#F3E6D0]' : 'bg-white border-[#D4AF37]/20 text-[#120B06]'
          }`}>
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="font-cinzel text-base font-bold tracking-widest uppercase">
                {t('cart.title') || 'Shopping Bag'}
              </h2>
              <span className="text-xs text-[#D4AF37] font-mono font-bold">
                ({totals.itemCount})
              </span>
            </div>
            <button
              onClick={closeDrawer}
              className={`p-1.5 transition-colors cursor-pointer ${
                isDark ? 'text-[#D8BE99] hover:text-[#D4AF37]' : 'text-[#4A2A14] hover:text-black'
              }`}
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Bulgaria Notice & Progress Bar */}
          <div className={`px-5 py-3 border-b ${
            isDark ? 'bg-black/40 border-white/10 text-[#D8BE99]' : 'bg-[#DECABB] border-[#D4AF37]/20 text-[#4A2A14]'
          }`}>
            {isBulgariaFreeUnlocked ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-bold">
                  <Sparkles className="w-4 h-4 shrink-0 text-[#D4AF37]" />
                  <span>Free Delivery in Bulgaria Unlocked! (Orders over €49)</span>
                </div>
                <p className="text-[10px] text-[#D8BE99]/80 pl-6">
                  *Free delivery applies exclusively to shipments within Bulgaria.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span>
                    Add <strong>€{bulgariaFreeRemaining.toFixed(2)}</strong> for <strong>Free Delivery in Bulgaria</strong>
                  </span>
                  <span className="font-mono text-[#D4AF37] font-bold">{bulgariaProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F2D675] transition-all duration-500"
                    style={{ width: `${bulgariaProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-[#D8BE99]/80">
                  Orders over €49 qualify for free delivery (Bulgaria option only).
                </p>
              </div>
            )}
          </div>

          {/* Items List or Empty State */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full border border-[#D4AF37]/30 flex items-center justify-center mx-auto text-[#D4AF37] bg-[#D4AF37]/10">
                  <ShoppingBag className="w-8 h-8 opacity-70" />
                </div>
                <h3 className={`font-cinzel text-base font-bold ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>
                  Your Bag is Empty
                </h3>
                <p className={`text-xs max-w-xs mx-auto leading-relaxed ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>
                  Discover our royal Andalusian signature extraits and flacons.
                </p>
                <button
                  onClick={() => {
                    closeDrawer();
                    navigate('/shop');
                  }}
                  className="px-6 py-2.5 bg-[#D4AF37] text-black font-cinzel text-xs uppercase font-bold tracking-wider inline-block cursor-pointer hover:bg-[#F2D675] rounded-full shadow-md"
                >
                  Explore Boutique
                </button>
              </div>
            ) : (
              items.map((item, idx) => {
                const isBundle = Boolean(item.isBundle);
                const targetKey = item.id || item.productId;
                const bundleLink = isBundle ? `/bundle/${item.bundleId || String(item.id).replace('bundle-', '')}` : `/product/${item.productId || item.id}`;

                return (
                  <div
                    key={`${targetKey}-${item.size}-${idx}`}
                    className={`flex gap-3.5 p-3.5 border relative group transition-all rounded-2xl ${
                      isBundle
                        ? isDark
                          ? 'bg-gradient-to-br from-[#1C0F05] via-[#0B0A08] to-[#120B06] border-purple-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.6)]'
                          : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-purple-500/50 shadow-md'
                        : isDark
                        ? 'bg-[#0B0A08] border-[#D4AF37]/15'
                        : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/40 shadow-sm'
                    }`}
                  >
                    {/* Flacon or Bundle Image */}
                    <div
                      onClick={() => {
                        closeDrawer();
                        navigate(bundleLink);
                      }}
                      className="cursor-pointer shrink-0"
                    >
                      <img
                        src={item.image || '/products/luxury_designs/07_arabian_gold.webp'}
                        alt={item.name}
                        className={`w-16 h-20 object-contain p-0 shrink-0 border rounded-xl overflow-hidden hover:scale-105 transition-transform ${
                          isBundle
                            ? isDark ? 'bg-black/60 border-purple-500/40' : 'bg-white border-purple-500/40'
                            : isDark ? 'bg-black/50 border-white/5' : 'bg-white/80 border-[#D4AF37]/30'
                        }`}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        {/* Bundle Badge */}
                        {isBundle && (
                          <div className="flex items-center gap-1 text-[9.5px] uppercase font-cinzel font-bold text-purple-400 mb-0.5">
                            <Gift className="w-3 h-3" />
                            <span>{language === 'ar' ? 'باقة عطور ملكية' : 'Curated Royal Suite'}</span>
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-1">
                          <h4
                            onClick={() => {
                              closeDrawer();
                              navigate(bundleLink);
                            }}
                            className={`font-cinzel text-xs font-bold line-clamp-1 cursor-pointer hover:text-[#D4AF37] transition-colors ${
                              isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
                            }`}
                          >
                            {item.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(targetKey, item.size)}
                            className="text-[#D4AF37] hover:text-red-500 p-1 transition-colors cursor-pointer shrink-0"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {item.arabicName && (
                          <p className="font-arabic text-[11px] text-[#D4AF37] truncate">{item.arabicName}</p>
                        )}

                        <p className={`text-[10px] font-mono mt-0.5 ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>
                          {isBundle ? item.size : `Size: ${item.size || '60 ml'}`}
                        </p>

                        {/* Promotion Badge */}
                        {(item.promotionName || item.hasPromotion) && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 text-[9px] font-cinzel font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                              <span>🔥</span>
                              <span>{item.discountPercent ? `-${item.discountPercent}% • ` : ''}{item.promotionName || 'Promotion Applied'}</span>
                            </span>
                          </div>
                        )}

                        {/* If bundle: show mini list of included flacons */}
                        {isBundle && Array.isArray(item.bundleItems) && item.bundleItems.length > 0 && (
                          <p className={`text-[9.5px] truncate mt-0.5 font-sans ${isDark ? 'text-[#D8BE99]/70' : 'text-[#5A3517]/80'}`}>
                            {language === 'ar' ? 'تتضمن: ' : 'Includes: '}
                            {item.bundleItems.map(bi => bi.productName || bi.name).join(', ')}
                          </p>
                        )}
                      </div>

                      {/* Quantity & Item Total */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/10 dark:border-white/5">
                        <div className={`flex items-center border rounded-full ${
                          isDark ? 'border-[#D4AF37]/30 bg-black/60' : 'border-[#D4AF37]/40 bg-white/90'
                        }`}>
                          <button
                            onClick={() => updateQuantity(targetKey, item.size, item.quantity - 1)}
                            className={`p-1 cursor-pointer ${isDark ? 'text-[#F3E6D0] hover:text-[#D4AF37]' : 'text-[#120B06] hover:text-[#D4AF37]'}`}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-mono font-bold text-[#D4AF37]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(targetKey, item.size, item.quantity + 1)}
                            className={`p-1 cursor-pointer ${isDark ? 'text-[#F3E6D0] hover:text-[#D4AF37]' : 'text-[#120B06] hover:text-[#D4AF37]'}`}
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="font-cinzel text-sm font-bold text-[#D4AF37] block">
                            €{(item.price * item.quantity).toFixed(2)}
                          </span>
                          {(item.hasPromoDiscount || (item.originalPrice && item.originalPrice > item.price)) && (
                            <span className="text-[10px] text-neutral-400 line-through font-mono block">
                              €{((item.originalPrice || item.unitBasePrice) * item.quantity).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Cross-Sell Recommendations */}
            {recommendations.length > 0 && items.length > 0 && (
              <div className="pt-3 border-t border-black/10 dark:border-white/10 space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className={`font-cinzel text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'}`}>
                    Palace Pairing
                  </span>
                </div>

                <div className="space-y-2">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className={`flex items-center justify-between p-2.5 border transition-colors rounded-xl ${
                        isDark ? 'bg-black/60 border-[#D4AF37]/20 hover:border-[#D4AF37]/50' : 'bg-gradient-to-r from-[#FFFDF8] to-[#FAF1DF] border-[#D4AF37]/35 hover:border-[#D4AF37] shadow-xs'
                      }`}
                    >
                      <div
                        onClick={() => {
                          closeDrawer();
                          navigate(`/product/${rec.slug || rec.id}`);
                        }}
                        className="flex items-center gap-2.5 cursor-pointer flex-1"
                      >
                        <img
                          src={rec.cutoutImage || rec.images?.[0] || '/products/luxury_designs/07_arabian_gold.webp'}
                          alt={rec.name}
                          className={`w-10 h-12 object-contain p-0 shrink-0 border rounded-lg overflow-hidden ${
                            isDark ? 'bg-black/40 border-white/5' : 'bg-white border-[#D4AF37]/25'
                          }`}
                        />
                        <div>
                          <h5 className={`font-cinzel text-xs font-bold line-clamp-1 ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>{rec.name}</h5>
                          <span className="text-xs font-mono font-bold text-[#D4AF37]">€{rec.price}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          addToCart(rec, rec.size || '60 ml', 1);
                        }}
                        className="px-3 py-1.5 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer shrink-0 shadow-md rounded-full"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Summary & Checkout Actions */}
          {items.length > 0 && (
            <div className={`p-5 border-t space-y-4 transition-colors ${
              isDark ? 'bg-[#0B0A08] border-[#D4AF37]/30' : 'bg-white border-[#D4AF37]/30 shadow-xl'
            }`}>
              {/* Gift Wrap Toggle */}
              <div className="flex items-center justify-between text-xs py-1 border-b border-black/10 dark:border-white/5">
                <div className={`flex items-center gap-2 ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>
                  <Gift className="w-4 h-4 text-[#D4AF37]" />
                  <span>Palace Silk Keepsake Gift Wrap</span>
                </div>
                <input
                  type="checkbox"
                  checked={cart.giftWrap || false}
                  onChange={toggleGiftWrap}
                  className="accent-[#D4AF37] w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="Privilege Code (e.g. SHEIKH10)"
                  className={`flex-1 border px-3 py-2 text-xs font-mono uppercase focus:border-[#D4AF37] focus:outline-none rounded-full ${
                    isDark ? 'bg-black/60 border-[#D4AF37]/30 text-[#F3E6D0]' : 'bg-[#FAF7F2] border-[#D4AF37]/40 text-[#120B06]'
                  }`}
                />
                <button
                  type="submit"
                  disabled={promoLoading || !promoInput}
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-[#F2D675] text-black border border-[#D4AF37]/40 text-xs font-cinzel font-bold uppercase transition-colors rounded-full shadow-sm"
                >
                  {promoLoading ? 'Validating...' : 'Apply'}
                </button>
              </form>

              {/* Total */}
              <div className="space-y-1.5 pt-2 text-xs">
                {totals.promoDiscountAmount > 0 && (
                  <div className="flex justify-between text-amber-500 font-bold">
                    <span>👑 Palace Offer ({totals.activePromoName || 'Promotion'})</span>
                    <span>-€{totals.promoDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                {totals.couponDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-500 font-semibold">
                    <span>Privilege Code ({cart.discountCode})</span>
                    <span>-€{totals.couponDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-cinzel font-bold pt-2 border-t border-black/10 dark:border-white/10">
                  <span className={isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}>Total</span>
                  <span className="text-[#D4AF37] font-mono">€{totals.total.toFixed(2)}</span>
                </div>
              </div>


              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className={`group/btn relative w-full py-4 px-6 rounded-full font-cinzel font-bold text-xs uppercase tracking-[0.22em] transition-all duration-400 flex items-center justify-center gap-2.5 cursor-pointer overflow-hidden ${
                  isDark
                    ? 'bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] hover:from-[#F2D675] hover:via-[#D4AF37] hover:to-[#F2D675] text-white hover:text-black border border-[#F2D675]/50 shadow-[0_10px_30px_rgba(140,98,57,0.45)] hover:scale-[1.02]'
                    : 'bg-gradient-to-r from-[#2C180F] via-[#120B06] to-[#2C180F] hover:from-[#D4AF37] hover:via-[#F2D675] hover:to-[#D4AF37] text-[#FFFDF9] hover:text-[#120B06] border border-[#D4AF37]/50 shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:scale-[1.02]'
                }`}
              >
                <span className="relative z-10 drop-shadow-sm">Proceed to Stripe Checkout</span>
                <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1 rtl:rotate-180" />
              </button>

              <div className="text-center">
                <button
                  onClick={handleViewBag}
                  className={`text-[11px] underline font-cinzel uppercase tracking-wider transition-colors ${
                    isDark ? 'text-[#D8BE99] hover:text-[#D4AF37]' : 'text-[#5A3517] hover:text-black'
                  }`}
                >
                  View Full Cart Details
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
