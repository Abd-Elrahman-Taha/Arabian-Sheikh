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
    <div className="pt-36 sm:pt-40 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in text-[var(--text-primary)]">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-[var(--gold-primary)] font-semibold">
            Curated Selections
          </span>
          <h1 className="font-cinzel text-3xl sm:text-4xl font-bold uppercase text-[var(--text-primary)]">
            {t('cart.title')}
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Review your chosen haute flacons and enter privilege codes before dispatch.
          </p>
        </div>
      </ScrollReveal>

      {items.length === 0 ? (
        <ScrollReveal direction="up" delay={0.1}>
          <div className="text-center py-20 bg-[var(--bg-card)] border border-[var(--border-card)] p-8 space-y-4 max-w-lg mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-none border border-[var(--border-gold-subtle)] flex items-center justify-center mx-auto text-[var(--gold-primary)] bg-[var(--bg-primary)]">
              <ShoppingBag className="w-8 h-8 opacity-60" />
            </div>
            <h2 className="font-cinzel text-xl font-bold text-[var(--text-primary)]">
              {t('cart.emptyTitle')}
            </h2>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
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
              <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2 shadow-sm">
              {totals.subtotal >= totals.freeShippingThreshold ? (
                <div className="flex items-center gap-2 text-xs text-[var(--gold-primary)] font-semibold">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>{t('cart.freeShippingQualify')}</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-[var(--text-muted)]">
                    <span>{t('cart.freeShippingRemaining', { amount: `$${totals.freeShippingRemaining}` })}</span>
                    <span className="font-mono text-[var(--gold-primary)] font-semibold">{freeShippingProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--bg-card)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold-gradient transition-all duration-500"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            </ScrollReveal>

            {/* Line Items Table */}
            <div className="divide-y divide-[var(--border-subtle)] border border-[var(--border-card)] bg-[var(--bg-card)] shadow-xl">
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
                      className="w-20 h-24 object-cover bg-[var(--bg-primary)] shrink-0 border border-[var(--border-gold-subtle)]"
                    />
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[var(--gold-primary)] font-mono">
                        {item.fragranceFamily}
                      </span>
                      <h3 className="font-cinzel text-base font-semibold text-[var(--text-primary)]">
                        {item.name}
                      </h3>
                      <p className="font-arabic text-xs text-[var(--text-muted)]">{item.arabicName}</p>
                      <p className="text-xs text-[var(--gold-primary)] font-mono mt-1">Size: {item.size}</p>
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-[var(--border-subtle)]">
                    <div className="flex items-center border border-[var(--border-gold-subtle)] bg-[var(--bg-secondary)]">
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--gold-primary)] cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-mono font-bold text-[var(--text-primary)]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--gold-primary)] cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="font-cinzel text-base font-bold text-[var(--gold-primary)] block">
                        ${item.price * item.quantity}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)] font-mono">
                        (${item.price} each)
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId, item.size)}
                      className="text-[var(--text-muted)] hover:text-rose-400 p-1.5 transition-colors cursor-pointer"
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
          <ScrollReveal direction="right" delay={0.2} className="lg:col-span-4 bg-[var(--bg-card)] border border-[var(--border-card)] p-6 space-y-6 shadow-xl sticky top-28">
            <h2 className="font-cinzel text-lg font-bold uppercase text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-3">
              Order Summary
            </h2>

            {/* Privilege Code Input */}
            <form onSubmit={handleApplyPromo} className="space-y-2">
              <label className="block text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-cinzel">
                Privilege Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="e.g. SHEIKH15"
                  className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-card)] px-3 py-2 text-xs font-mono uppercase text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none"
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
                <div className="flex items-center justify-between text-xs text-[var(--gold-primary)] bg-[var(--gold-primary)]/10 p-2 border border-[var(--gold-primary)]/30 mt-2">
                  <span>Code '{cart.discountCode}' applied</span>
                  <button
                    type="button"
                    onClick={removeDiscount}
                    className="text-[11px] underline hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </form>

            {/* Gift Wrap Option */}
            <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-[var(--gold-primary)]" />
                <span className="text-[var(--text-secondary)]">Complimentary Palace Silk Gift Wrap</span>
              </div>
              <input
                type="checkbox"
                checked={cart.giftWrap || false}
                onChange={toggleGiftWrap}
                className="accent-[#D2A55F] w-4 h-4 cursor-pointer"
              />
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-2 text-xs text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-4">
              <div className="flex justify-between">
                <span>Subtotal ({totals.totalCount} items):</span>
                <span className="font-mono text-[var(--text-primary)] font-semibold">${totals.subtotal}</span>
              </div>

              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-[var(--gold-primary)]">
                  <span>Privilege Discount:</span>
                  <span className="font-mono font-semibold">-${totals.discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Royal Express Courier:</span>
                <span className="font-mono text-[var(--text-primary)] font-semibold">
                  {totals.shipping === 0 ? (
                    <span className="text-[var(--gold-primary)]">Complimentary</span>
                  ) : (
                    `$${totals.shipping}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-[var(--text-primary)] pt-3 border-t border-[var(--border-subtle)] font-cinzel">
                <span>Estimated Total:</span>
                <span className="text-[var(--gold-primary)] font-mono text-xl">${totals.total}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => navigate('/checkout')}
                className="w-full luxury-btn-gold py-4 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl cursor-pointer"
              >
                <span>{t('cart.proceedToCheckout')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--text-muted)] pt-1">
                <ShieldCheck className="w-4 h-4 text-[var(--gold-primary)]" />
                <span>256-Bit Encrypted Sovereign Checkout</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      )}
    </div>
  );
}
