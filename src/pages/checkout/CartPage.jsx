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
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '../../components/common/ScrollReveal';

export default function CartPage() {
  const { navigate } = useRouter();
  const { t } = useTranslation();
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
    if (!promoInput) return;
    setPromoLoading(true);
    try {
      await applyDiscount(promoInput);
      setPromoInput('');
    } catch {
      // Toast already shown
    } finally {
      setPromoLoading(false);
    }
  };

  const freeShippingProgress = Math.min(
    100,
    Math.round((totals.subtotal / totals.freeShippingThreshold) * 100)
  );

  return (
    <div className="pt-36 sm:pt-40 pb-6 max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-10 animate-fade-in text-[var(--color-earth-dark)]">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-[var(--color-terracotta)] font-bold">
            Curated Selections
          </span>
          <h1 className="font-cinzel text-3xl sm:text-4xl font-bold uppercase text-[var(--color-earth-dark)]">
            {t('cart.title')}
          </h1>
          <p className="text-xs text-[var(--color-terracotta-deep)] font-medium">
            Review your chosen haute flacons and enter privilege codes before dispatch.
          </p>
        </div>
      </ScrollReveal>

      {items.length === 0 ? (
        <ScrollReveal direction="up" delay={0.1}>
          <div className="text-center py-20 bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-8 space-y-4 max-w-lg mx-auto shadow-xl">
            <div className="w-16 h-16 rounded-none border border-[var(--color-terracotta)]/40 flex items-center justify-center mx-auto text-[var(--color-terracotta)] bg-[var(--color-desert-primary)]/40">
              <ShoppingBag className="w-8 h-8 opacity-70" />
            </div>
            <h2 className="font-cinzel text-xl font-bold text-[var(--color-earth-dark)]">
              {t('cart.emptyTitle')}
            </h2>
            <p className="text-xs text-[var(--color-terracotta-deep)] leading-relaxed font-medium">
              {t('cart.emptyDesc')}
            </p>
            <div className="pt-2">
              <Link to="/shop" className="luxury-btn-gold px-8 py-3 text-xs inline-block cursor-pointer shadow-md">
                {t('cart.startShopping')}
              </Link>
            </div>
          </div>
        </ScrollReveal>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Free Shipping Banner */}
            <ScrollReveal direction="left" delay={0.1}>
              <div className="p-4 bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 space-y-2 shadow-sm">
              {totals.subtotal >= totals.freeShippingThreshold ? (
                <div className="flex items-center gap-2 text-xs text-[var(--color-terracotta)] font-bold">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>{t('cart.freeShippingQualify')}</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-[var(--color-terracotta-deep)] font-medium">
                    <span>{t('cart.freeShippingRemaining', { amount: `$${totals.freeShippingRemaining}` })}</span>
                    <span className="font-mono text-[var(--color-terracotta)] font-bold">{freeShippingProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--color-desert-primary)]/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#3A2116] to-[#3A2116] transition-all duration-500"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            </ScrollReveal>

            {/* Line Items Table */}
            <div className="divide-y divide-[var(--color-terracotta-deep)]/20 border border-[var(--color-terracotta-deep)]/25 bg-[var(--color-desert-light)] shadow-xl">
              {items.map((item, idx) => (
                <ScrollRevealItem
                  key={`${item.productId}-${item.size}-${idx}`}
                  index={idx}
                  desktopDirection="left"
                  className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-24 object-cover bg-[var(--color-desert-primary)] shrink-0 border border-[var(--color-terracotta-deep)]/30"
                    />
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[var(--color-terracotta)] font-mono font-bold">
                        {item.fragranceFamily}
                      </span>
                      <h3 className="font-cinzel text-base font-bold text-[var(--color-earth-dark)]">
                        {item.name}
                      </h3>
                      <p className="font-arabic text-xs text-[var(--color-terracotta-deep)] font-semibold">{item.arabicName}</p>
                      <p className="text-xs text-[var(--color-terracotta)] font-mono mt-1 font-semibold">Size: {item.size}</p>
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-[var(--color-terracotta-deep)]/20">
                    <div className="flex items-center border border-[var(--color-terracotta-deep)]/25 bg-[var(--color-desert-primary)]/40">
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                        className="p-1.5 text-[var(--color-terracotta-deep)] hover:text-[var(--color-terracotta)] cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-mono font-bold text-[var(--color-earth-dark)]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                        className="p-1.5 text-[var(--color-terracotta-deep)] hover:text-[var(--color-terracotta)] cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="font-cinzel text-base font-bold text-[var(--color-terracotta)] block">
                        ${item.price * item.quantity}
                      </span>
                      <span className="text-[11px] text-[var(--color-terracotta-deep)] font-mono">
                        (${item.price} each)
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId, item.size)}
                      className="text-[var(--color-terracotta-deep)] hover:text-rose-600 p-1.5 transition-colors cursor-pointer"
                      title="Remove from bag"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </ScrollRevealItem>
              ))}
            </div>
          </div>

          {/* Sticky Summary (4 cols) */}
          <ScrollReveal direction="right" delay={0.2} className="lg:col-span-4 bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-6 space-y-6 shadow-xl sticky top-28">
            <h2 className="font-cinzel text-lg font-bold uppercase text-[var(--color-earth-dark)] border-b border-[var(--color-terracotta-deep)]/20 pb-3">
              Order Summary
            </h2>

            {/* Privilege Code Input */}
            <form onSubmit={handleApplyPromo} className="space-y-2">
              <label className="block text-[11px] uppercase tracking-wider text-[var(--color-terracotta-deep)] font-cinzel font-semibold">
                Privilege Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="e.g. SHEIKH15"
                  className="flex-1 bg-[var(--color-desert-primary)]/40 border border-[var(--color-terracotta-deep)]/25 px-3 py-2 text-xs font-mono uppercase text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none font-semibold"
                />
                <button
                  type="submit"
                  disabled={promoLoading || !promoInput}
                  className="luxury-btn-outline px-4 py-2 text-xs disabled:opacity-40 cursor-pointer"
                >
                  {promoLoading ? '...' : 'Apply'}
                </button>
              </div>
              {cart.discountCode && (
                <div className="flex items-center justify-between text-xs text-[var(--color-terracotta)] bg-[var(--color-terracotta)]/10 p-2 border border-[var(--color-terracotta)]/30 mt-2 font-bold">
                  <span>Code '{cart.discountCode}' applied</span>
                  <button
                    type="button"
                    onClick={removeDiscount}
                    className="text-[11px] underline hover:text-[var(--color-earth-dark)] cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </form>

            {/* Gift Wrap Option */}
            <div className="flex items-center justify-between p-3 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 text-xs">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-[var(--color-terracotta)]" />
                <span className="text-[var(--color-earth-dark)] font-medium">Complimentary Palace Silk Gift Wrap</span>
              </div>
              <input
                type="checkbox"
                checked={cart.giftWrap || false}
                onChange={toggleGiftWrap}
                className="accent-[#3A2116] w-4 h-4 cursor-pointer"
              />
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-2 text-xs text-[var(--color-terracotta-deep)] border-t border-[var(--color-terracotta-deep)]/20 pt-4 font-medium">
              <div className="flex justify-between">
                <span>Subtotal ({totals.totalCount} items):</span>
                <span className="font-mono text-[var(--color-earth-dark)] font-bold">${totals.subtotal}</span>
              </div>

              {totals.promoDiscountAmount > 0 && (
                <div className="flex justify-between text-amber-700 font-bold bg-amber-500/10 p-2 border border-amber-500/30">
                  <span>👑 Palace Offer ({totals.activePromoName || 'Special'}):</span>
                  <span className="font-mono">-${totals.promoDiscountAmount}</span>
                </div>
              )}

              {totals.couponDiscountAmount > 0 && (
                <div className="flex justify-between text-[var(--color-terracotta)] font-bold">
                  <span>Privilege Code ({cart.discountCode}):</span>
                  <span className="font-mono">-${totals.couponDiscountAmount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Royal Express Courier:</span>
                <span className="font-mono text-[var(--color-earth-dark)] font-bold">
                  {totals.shipping === 0 ? (
                    <span className="text-[var(--color-terracotta)]">Complimentary</span>
                  ) : (
                    `$${totals.shipping}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-[var(--color-earth-dark)] pt-3 border-t border-[var(--color-terracotta-deep)]/20 font-cinzel">
                <span>Estimated Total:</span>
                <span className="text-[var(--color-terracotta)] font-mono text-xl font-bold">${totals.total}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => navigate('/checkout')}
                className="w-full luxury-btn-gold py-4 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl cursor-pointer"
              >
                <span>{t('cart.proceedToCheckout')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--color-terracotta-deep)] pt-1">
                <ShieldCheck className="w-4 h-4 text-[var(--color-terracotta)]" />
                <span>256-Bit Encrypted Sovereign Checkout</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      )}
    </div>
  );
}
