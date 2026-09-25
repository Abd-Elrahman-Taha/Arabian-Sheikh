import React, { useState } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useCart } from '../../context/CartContext';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Gift,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Check,
  Crown,
  Truck,
  Tag,
  Loader2,
  Lock
} from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '../../components/common/ScrollReveal';

export default function CartPage() {
  const { navigate } = useRouter();
  const { t, language, isRtl } = useTranslation();
  const {
    items,
    totals,
    updateQuantity,
    removeFromCart,
    cart,
    toggleGiftWrap,
    applyDiscount,
    removeDiscount
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    try {
      await applyDiscount(promoInput.trim());
      setPromoInput('');
    } catch {
      // Toast already shown
    } finally {
      setPromoLoading(false);
    }
  };

  const bulgariaThreshold = 49;
  const isBulgariaFreeUnlocked = totals.subtotal >= bulgariaThreshold;
  const bulgariaRemaining = Math.max(0, bulgariaThreshold - totals.subtotal);
  const bulgariaProgress = Math.min(100, Math.round((totals.subtotal / bulgariaThreshold) * 100));

  return (
    <div className="relative min-h-screen text-[#F3E6D0] pt-28 sm:pt-36 pb-20 overflow-hidden">
      {/* Grand Sovereign Palace Ambient Background */}
      <div className="fixed inset-0 z-0 select-none pointer-events-none overflow-hidden">
        <picture className="w-full h-full">
          <source
            media="(max-width: 767px)"
            type="image/webp"
            srcSet="/editorial/arabian_palace_phone_opt.webp"
          />
          <source
            media="(max-width: 767px)"
            srcSet="/editorial/arabian_palace_phone_opt.jpg"
          />
          <source
            type="image/webp"
            srcSet="/editorial/arabian_palace_desktop_opt.webp"
          />
          <img
            src="/editorial/arabian_palace_desktop_opt.jpg"
            alt="The Grand Sovereign Palace of Arabian Sheikh"
            className="w-full h-full object-cover object-center scale-105 filter brightness-[0.72] contrast-[1.12]"
            loading="eager"
            fetchPriority="high"
          />
        </picture>

        {/* Ambient Dark Veils & Golden Radial Blooms */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-[#0B0A08]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(212,175,55,0.15),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_65%,rgba(242,214,117,0.08),transparent_50%)]" />
      </div>

      <div className="relative z-10 max-w-[1580px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-10 animate-fade-in">
        {/* Page Header */}
        <ScrollReveal direction="up">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[11px] uppercase tracking-[0.3em] text-[#F2D675] font-cinzel backdrop-blur-md shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Haute Parfumerie Royale</span>
            </div>
            <h1 className="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wider text-[#F3E6D0] drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
              {t('cart.title') || 'Your Sovereign Shopping Bag'}
            </h1>
            <p className="text-xs sm:text-sm text-[#D8BE99] font-light leading-relaxed">
              Review your chosen haute flacons, enter privilege codes, and prepare for insured royal palace dispatch.
            </p>
          </div>
        </ScrollReveal>

        {items.length === 0 ? (
          <ScrollReveal direction="up" delay={0.1}>
            <div className="text-center py-20 px-8 rounded-3xl bg-[#0B0A08]/85 backdrop-blur-2xl border border-[#D4AF37]/35 p-8 space-y-6 max-w-lg mx-auto shadow-[0_16px_50px_rgba(0,0,0,0.8)]">
              <div className="relative w-20 h-20 rounded-full border border-[#D4AF37]/40 flex items-center justify-center mx-auto text-[#F2D675] bg-[#D4AF37]/10 shadow-[0_0_25px_rgba(212,175,55,0.2)]">
                <div className="absolute inset-1 rounded-full border border-[#D4AF37]/20 border-dashed animate-[spin_20s_linear_infinite]" />
                <ShoppingBag className="w-9 h-9 opacity-85 text-[#D4AF37]" />
              </div>
              <div className="space-y-2">
                <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#F3E6D0] tracking-wide">
                  {t('cart.emptyTitle') || 'Your Sovereign Bag is Empty'}
                </h2>
                <p className="text-xs text-[#D8BE99] leading-relaxed max-w-sm mx-auto font-light">
                  {t('cart.emptyDesc') || 'You have not selected any royal creations yet. Explore our boutique to discover timeless fragrances.'}
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/shop"
                  className="luxury-btn-gold px-8 py-3.5 text-xs font-cinzel uppercase font-bold tracking-widest inline-flex items-center gap-2 rounded-full shadow-xl hover:scale-105 transition-transform cursor-pointer"
                >
                  <span>{t('cart.startShopping') || 'Explore The Boutique'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items Column (8 cols) */}
            <div className="lg:col-span-8 space-y-5">
              {/* Bulgaria Express Shipping Progress Banner */}
              <ScrollReveal direction="left" delay={0.1}>
                <div className="rounded-2xl bg-gradient-to-r from-[#170E08]/90 via-[#0E0A06]/95 to-[#170E08]/90 backdrop-blur-xl border border-[#D4AF37]/35 p-5 shadow-[0_10px_35px_rgba(0,0,0,0.6)] space-y-3">
                  {isBulgariaFreeUnlocked ? (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#F2D675] font-cinzel font-bold tracking-wide">
                        <Sparkles className="w-4 h-4 shrink-0 text-[#D4AF37] animate-pulse" />
                        <span>Free Royal Express Delivery in Bulgaria Unlocked!</span>
                      </div>
                      <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/45 text-[11px] font-mono text-[#F2D675] font-bold">
                        <Check className="w-3 h-3 text-[#D4AF37]" />
                        <span>Orders over €49</span>
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#D8BE99] gap-1">
                        <span>
                          Add <strong className="text-[#F2D675] font-mono font-bold">€{bulgariaRemaining.toFixed(2)}</strong> more for <strong className="text-[#F3E6D0]">Complimentary Royal Delivery in Bulgaria</strong>
                        </span>
                        <span className="self-end sm:self-auto font-mono text-[#F2D675] font-bold text-xs bg-[#D4AF37]/15 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/35">
                          {bulgariaProgress}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-black/70 border border-[#D4AF37]/25 p-0.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#8C6239] via-[#D4AF37] to-[#F2D675] rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(212,175,55,0.45)]"
                          style={{ width: `${bulgariaProgress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-[#D8BE99]/70 font-light">
                        *Complimentary insured shipping on orders over €49 applies to addresses in Bulgaria.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollReveal>

              {/* Line Items Cards */}
              <div className="space-y-4">
                {items.map((item, idx) => {
                  const isBundle = Boolean(item.isBundle);
                  const targetKey = item.id || item.productId;
                  const bundleLink = isBundle
                    ? `/bundle/${item.bundleId || String(item.id).replace('bundle-', '')}`
                    : `/product/${item.productId || item.id}`;

                  return (
                    <ScrollRevealItem
                      key={`${targetKey}-${item.size}-${idx}`}
                      index={idx}
                      desktopDirection="left"
                      className="rounded-2xl bg-gradient-to-b from-[#140D08]/90 to-[#0A0704]/95 backdrop-blur-xl border border-[#D4AF37]/25 hover:border-[#D4AF37]/55 transition-all duration-300 p-4 sm:p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 group relative overflow-hidden"
                    >
                      {/* Subtle Top Gold Hairline Sheen */}
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent pointer-events-none" />

                      <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                        {/* Flacon Thumbnail */}
                        <Link to={bundleLink} className="shrink-0">
                          <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl bg-gradient-to-b from-[#21140A] to-[#0A0704] border border-[#D4AF37]/35 p-2 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                            <img
                              src={item.image || '/products/luxury_designs/07_arabian_gold.webp'}
                              alt={item.name}
                              className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
                            />
                          </div>
                        </Link>

                        {/* Flacon Information */}
                        <div className="space-y-1 min-w-0">
                          {isBundle ? (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-cinzel font-bold text-[#F2D675] tracking-wider bg-[#D4AF37]/15 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30 mb-0.5">
                              <Crown className="w-3 h-3 text-[#D4AF37]" />
                              <span>Curated Royal Suite</span>
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-cinzel font-semibold block">
                              {item.fragranceFamily || 'Haute Parfumerie'}
                            </span>
                          )}

                          <Link to={bundleLink} className="hover:text-[#F2D675] transition-colors block">
                            <h3 className="font-cinzel text-base sm:text-lg font-bold text-[#F3E6D0] leading-snug line-clamp-1">
                              {item.name}
                            </h3>
                          </Link>

                          {item.arabicName && (
                            <p className="font-arabic text-xs sm:text-sm text-[#D4AF37]/90 truncate">
                              {item.arabicName}
                            </p>
                          )}

                          <div className="pt-0.5 flex flex-wrap items-center gap-2">
                            <span className="inline-block text-[11px] text-[#D8BE99] font-mono bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/20">
                              {isBundle ? item.size : `Size: ${item.size || '60ml'}`}
                            </span>
                            {(item.promotionName || item.hasPromotion) && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-cinzel font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                                <span>🔥</span>
                                <span>{item.discountPercent ? `-${item.discountPercent}% • ` : ''}{item.promotionName || 'Promotion Applied'}</span>
                              </span>
                            )}
                          </div>

                          {isBundle && Array.isArray(item.bundleItems) && item.bundleItems.length > 0 && (
                            <p className="text-[11px] text-[#D8BE99]/70 pt-1 line-clamp-1 max-w-md">
                              Includes: {item.bundleItems.map(i => `${i.productName || i.name} (${i.quantity}x)`).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quantity Stepper & Price Row */}
                      <div className="flex items-center justify-between sm:justify-end gap-5 sm:gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-[#D4AF37]/20">
                        {/* Pill Stepper */}
                        <div className="inline-flex items-center rounded-xl border border-[#D4AF37]/30 bg-black/60 backdrop-blur-sm p-1 shadow-inner">
                          <button
                            onClick={() => updateQuantity(targetKey, item.size, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#D8BE99] hover:text-[#F2D675] hover:bg-[#D4AF37]/20 rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                            aria-label="Decrease quantity"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs sm:text-sm font-mono font-bold text-[#F3E6D0]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(targetKey, item.size, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#D8BE99] hover:text-[#F2D675] hover:bg-[#D4AF37]/20 rounded-lg transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price Breakdown */}
                        <div className="text-right">
                          <span className="font-cinzel text-lg sm:text-xl font-bold text-[#F2D675] block drop-shadow-sm">
                            €{(item.price * item.quantity).toFixed(2)}
                          </span>
                          {(item.hasPromoDiscount || (item.originalPrice && item.originalPrice > item.price)) ? (
                            <div className="text-[11px] font-mono flex items-center justify-end gap-1.5">
                              <span className="line-through text-[#D8BE99]/50">
                                €{((item.originalPrice || item.unitBasePrice) * item.quantity).toFixed(2)}
                              </span>
                              <span className="text-amber-400 font-bold">
                                €{Number(item.price).toFixed(2)} each
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#D8BE99]/70 font-mono">
                              (€{Number(item.price).toFixed(2)} each)
                            </span>
                          )}
                        </div>

                        {/* Remove Action */}
                        <button
                          onClick={() => removeFromCart(targetKey, item.size)}
                          className="p-2.5 rounded-xl border border-[#D4AF37]/20 bg-black/40 text-[#D8BE99] hover:text-rose-400 hover:border-rose-500/50 hover:bg-rose-500/10 transition-all cursor-pointer shrink-0"
                          title="Remove from bag"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </ScrollRevealItem>
                  );
                })}
              </div>

              {/* Bottom Quick Return Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#D4AF37]/20 text-xs text-[#D8BE99]">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#F2D675] font-cinzel font-semibold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('cart.continueShopping') || 'Continue Browsing Creations'}</span>
                </Link>

                <div className="flex items-center gap-2 text-[11px] text-[#D8BE99]/75">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Insured royal shipment in sealed velvet coffret</span>
                </div>
              </div>
            </div>

            {/* Sticky Order Summary Column (4 cols) */}
            <ScrollReveal direction="right" delay={0.2} className="lg:col-span-4 sticky top-28 space-y-6">
              <div className="rounded-3xl bg-gradient-to-b from-[#180F08]/95 via-[#0F0A06]/98 to-[#090604]/98 backdrop-blur-2xl border border-[#D4AF37]/40 p-6 sm:p-7 shadow-[0_16px_50px_rgba(0,0,0,0.85)] space-y-6">
                {/* Summary Title */}
                <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/25">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-[#D4AF37]" />
                    <h2 className="font-cinzel text-lg sm:text-xl font-bold uppercase tracking-wider text-[#F3E6D0]">
                      Order Summary
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[11px] font-cinzel text-[#F2D675] font-bold">
                    {totals.totalCount || items.length} {totals.totalCount === 1 ? 'Creation' : 'Creations'}
                  </span>
                </div>

                {/* Privilege Code Form */}
                <form onSubmit={handleApplyPromo} className="space-y-2.5">
                  <label className="block text-[11px] uppercase tracking-[0.2em] text-[#D8BE99] font-cinzel font-semibold flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Privilege Code</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="e.g. SHEIKH15"
                      className="flex-1 bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-[#F3E6D0] placeholder-[#D8BE99]/40 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 focus:outline-none transition-all font-semibold"
                    />
                    <button
                      type="submit"
                      disabled={promoLoading || !promoInput.trim()}
                      className="px-5 py-2.5 rounded-xl font-cinzel text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#F2D675] text-black hover:from-[#F2D675] hover:to-[#D4AF37] shadow-md transition-all cursor-pointer disabled:opacity-40 shrink-0"
                    >
                      {promoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                    </button>
                  </div>

                  {cart.discountCode && (
                    <div className="rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 p-3 flex items-center justify-between text-xs text-[#F2D675] font-mono shadow-inner">
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Code <strong>'{cart.discountCode}'</strong> applied</span>
                      </div>
                      <button
                        type="button"
                        onClick={removeDiscount}
                        className="text-[11px] text-[#D8BE99] hover:text-rose-400 underline cursor-pointer transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </form>

                {/* Palace Silk Gift Wrap Toggle */}
                <div
                  onClick={toggleGiftWrap}
                  className="rounded-2xl p-4 bg-black/40 border border-[#D4AF37]/25 hover:border-[#D4AF37]/50 transition-all flex items-center justify-between cursor-pointer group select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#F2D675]">
                      <Gift className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <div>
                      <span className="text-xs font-cinzel font-semibold text-[#F3E6D0] block">
                        Complimentary Palace Silk Gift Wrap
                      </span>
                      <span className="text-[10px] text-[#D8BE99]/70 block font-light">
                        Includes handwritten calligraphic gift card & royal ribbon
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      cart.giftWrap
                        ? 'bg-[#D4AF37] border-[#D4AF37] text-black'
                        : 'border-[#D4AF37]/40 bg-black/50 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                {/* Financial Breakdown */}
                <div className="space-y-3 text-xs text-[#D8BE99] border-t border-[#D4AF37]/20 pt-5">
                  {totals.promoDiscountAmount > 0 && (
                    <div className="flex justify-between items-center text-amber-400 font-bold bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/30">
                      <span className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>Palace Offer ({totals.activePromoName || 'Special'}):</span>
                      </span>
                      <span className="font-mono">-€{totals.promoDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {totals.couponDiscountAmount > 0 && (
                    <div className="flex justify-between items-center text-[#F2D675] font-bold bg-[#D4AF37]/10 px-3 py-2 rounded-xl border border-[#D4AF37]/30">
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Privilege Code ({cart.discountCode}):</span>
                      </span>
                      <span className="font-mono">-€{totals.couponDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Total Row */}
                  <div className="flex justify-between items-baseline pt-4 border-t border-[#D4AF37]/30">
                    <div>
                      <span className="font-cinzel text-base sm:text-lg font-bold text-[#F3E6D0] uppercase tracking-wider block">
                        Total:
                      </span>
                      <span className="text-[10px] text-[#D8BE99]/60 font-light block">
                        Inclusive of all royal duties & VAT
                      </span>
                    </div>
                    <span className="font-mono text-2xl sm:text-3xl font-bold text-[#F2D675] drop-shadow-[0_2px_12px_rgba(212,175,55,0.4)]">
                      €{totals.total.toFixed(2)}
                    </span>
                  </div>
                </div>


                {/* Sovereign Checkout CTA */}
                <div className="space-y-4 pt-2">
                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full py-4 rounded-xl font-cinzel text-xs sm:text-sm font-bold uppercase tracking-[0.22em] bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#D4AF37] text-black hover:brightness-110 shadow-[0_8px_30px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
                  >
                    <span>{t('cart.checkout') || t('cart.proceedToCheckout') || 'Proceed to Royal Checkout'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Trust & Sovereignty Guarantee */}
                  <div className="space-y-2 pt-1 border-t border-[#D4AF37]/15 text-[11px] text-[#D8BE99]/80 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>256-Bit Encrypted Sovereign Checkout</span>
                    </div>
                    <p className="text-[10px] text-[#D8BE99]/60 font-light">
                      Authenticity guaranteed with each Andalusian creation
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        )}
      </div>
    </div>
  );
}
