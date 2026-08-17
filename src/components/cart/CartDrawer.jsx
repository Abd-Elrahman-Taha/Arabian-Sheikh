import React, { useState } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useCart } from '../../context/CartContext';
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
  const { t } = useTranslation();
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
    removeDiscount
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

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

  const freeShippingProgress = Math.min(
    100,
    Math.round((totals.subtotal / totals.freeShippingThreshold) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity cursor-pointer"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[var(--bg-card)] border-l border-[var(--border-gold)] text-[var(--text-primary)] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-secondary)]">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[var(--gold-primary)]" />
              <h2 className="font-cinzel text-lg font-bold tracking-widest uppercase">
                {t('cart.title')}
              </h2>
              <span className="text-xs text-[var(--gold-primary)] font-mono font-semibold">
                ({totals.totalCount})
              </span>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--gold-primary)] transition-colors cursor-pointer"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="px-5 py-3 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)]">
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
                <div className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold-gradient transition-all duration-500"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Items List or Empty State */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full border border-[var(--gold-primary)]/40 flex items-center justify-center mx-auto text-[var(--gold-primary)]">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="font-cinzel text-base font-semibold text-[var(--text-primary)]">
                  {t('cart.emptyTitle')}
                </h3>
                <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto leading-relaxed">
                  {t('cart.emptyDesc')}
                </p>
                <button
                  onClick={() => {
                    closeDrawer();
                    navigate('/shop');
                  }}
                  className="luxury-btn-gold px-6 py-2.5 text-xs inline-block cursor-pointer"
                >
                  {t('cart.startShopping')}
                </button>
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={`${item.productId}-${item.size}-${idx}`}
                  className="flex gap-3.5 p-3.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] relative group transition-all"
                >
                  {/* Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-18 h-22 object-cover object-center bg-[var(--bg-primary)] shrink-0 border border-[var(--border-gold-subtle)]"
                  />

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="font-cinzel text-sm font-semibold text-[var(--text-primary)] line-clamp-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.productId, item.size)}
                          className="text-[var(--text-muted)] hover:text-rose-400 p-1 transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="font-arabic text-xs text-[var(--text-muted)]">{item.arabicName}</p>
                      <p className="text-xs text-[var(--gold-primary)] font-mono mt-0.5">Size: {item.size}</p>
                    </div>

                    {/* Quantity & Item Total */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border-subtle)]">
                      <div className="flex items-center border border-[var(--border-gold-subtle)] bg-[var(--bg-card)]">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                          className="p-1 text-[var(--text-muted)] hover:text-[var(--gold-primary)] cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-mono font-bold text-[var(--text-primary)]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                          className="p-1 text-[var(--text-muted)] hover:text-[var(--gold-primary)] cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-cinzel text-sm font-bold text-[var(--gold-primary)]">
                        ${item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout Actions */}
          {items.length > 0 && (
            <div className="p-5 bg-[var(--bg-secondary)] border-t border-[var(--border-gold)] space-y-4">
              {/* Gift Wrap Toggle */}
              <div className="flex items-center justify-between text-xs py-1 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <Gift className="w-4 h-4 text-[var(--gold-primary)]" />
                  <span>Complimentary Palace Silk Gift Wrap</span>
                </div>
                <input
                  type="checkbox"
                  checked={cart.giftWrap || false}
                  onChange={toggleGiftWrap}
                  className="accent-[#D2A55F] w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="Privilege Code (e.g. SHEIKH15)"
                  className="flex-1 bg-[var(--bg-card)] border border-[var(--border-gold-subtle)] px-3 py-2 text-xs font-mono uppercase text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={promoLoading || !promoInput}
                  className="luxury-btn-outline px-4 py-2 text-xs disabled:opacity-40 cursor-pointer"
                >
                  {promoLoading ? 'Validating...' : 'Apply'}
                </button>
              </form>

              {cart.discountCode && (
                <div className="flex items-center justify-between text-xs text-[var(--gold-primary)] bg-[var(--gold-primary)]/10 p-2 border border-[var(--gold-primary)]/30">
                  <span>Privilege '{cart.discountCode}' applied</span>
                  <button
                    onClick={removeDiscount}
                    className="text-[11px] underline hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Totals Breakdown */}
              <div className="space-y-1.5 text-xs text-[var(--text-muted)] pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-[var(--text-primary)] font-semibold">${totals.subtotal}</span>
                </div>
                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-[var(--gold-primary)]">
                    <span>Privilege Discount</span>
                    <span className="font-mono font-semibold">-${totals.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Royal Express Shipping</span>
                  <span className="font-mono text-[var(--text-primary)] font-semibold">
                    {totals.shipping === 0 ? 'Complimentary' : `$${totals.shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-cinzel font-bold text-[var(--text-primary)] pt-2 border-t border-[var(--border-subtle)]">
                  <span>Grand Total</span>
                  <span className="text-[var(--gold-primary)] font-mono text-base">${totals.total}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleCheckout}
                  className="w-full luxury-btn-gold py-3.5 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <span>{t('cart.proceedToCheckout')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleViewBag}
                  className="w-full luxury-btn-outline py-2.5 text-xs text-center cursor-pointer"
                >
                  {t('cart.viewBag')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
