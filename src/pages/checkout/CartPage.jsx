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
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in text-[#F3EEE5]">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-[#C6A15B] font-semibold">
          Curated Selections
        </span>
        <h1 className="font-cinzel text-3xl sm:text-4xl font-bold uppercase">
          {t('cart.title')}
        </h1>
        <p className="text-xs text-[#C5B8A8]">
          Review your chosen haute flacons and enter privilege codes before dispatch.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-[#1C120E] border border-[#C6A15B]/30 p-8 space-y-4 max-w-lg mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-none border border-[#C6A15B]/40 flex items-center justify-center mx-auto text-[#C6A15B]">
            <ShoppingBag className="w-8 h-8 opacity-60" />
          </div>
          <h2 className="font-cinzel text-xl font-bold text-[#F3EEE5]">
            {t('cart.emptyTitle')}
          </h2>
          <p className="text-xs text-[#C5B8A8] leading-relaxed">
            {t('cart.emptyDesc')}
          </p>
          <div className="pt-2">
            <Link to="/shop" className="luxury-btn-gold px-8 py-3 text-xs inline-block">
              {t('cart.startShopping')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Free Shipping Banner */}
            <div className="p-4 bg-[#241712] border border-[#C6A15B]/20 space-y-2">
              {totals.subtotal >= totals.freeShippingThreshold ? (
                <div className="flex items-center gap-2 text-xs text-[#C6A15B] font-medium">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>{t('cart.freeShippingQualify')}</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-[#C5B8A8]">
                    <span>{t('cart.freeShippingRemaining', { amount: `$${totals.freeShippingRemaining}` })}</span>
                    <span className="font-mono text-[#C6A15B]">{freeShippingProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0F0D0C] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold-gradient transition-all duration-500"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Line Items Table */}
            <div className="divide-y divide-[#C6A15B]/15 border border-[#C6A15B]/20 bg-[#1C120E] shadow-xl">
              {items.map((item, idx) => (
                <div
                  key={`${item.productId}-${item.size}-${idx}`}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-24 object-cover bg-[#0F0D0C] shrink-0 border border-[#C6A15B]/15"
                    />
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#C6A15B] font-mono">
                        {item.fragranceFamily}
                      </span>
                      <h3 className="font-cinzel text-base font-semibold text-[#F3EEE5]">
                        {item.name}
                      </h3>
                      <p className="font-arabic text-xs text-[#C5B8A8]">{item.arabicName}</p>
                      <p className="text-xs text-[#C6A15B] font-mono mt-1">Size: {item.size}</p>
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-[#C6A15B]/10">
                    <div className="flex items-center border border-[#C6A15B]/30 bg-[#0F0D0C]">
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                        className="p-1.5 text-[#C5B8A8] hover:text-[#C6A15B]"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-mono font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                        className="p-1.5 text-[#C5B8A8] hover:text-[#C6A15B]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <span className="font-cinzel text-lg font-bold text-[#C6A15B]">
                        ${item.price * item.quantity}
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId, item.size)}
                      className="text-[#C5B8A8] hover:text-red-400 p-1 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Gift Wrap Card */}
            <div
              onClick={toggleGiftWrap}
              className="flex items-center gap-4 p-4 bg-[#241712] border border-[#C6A15B]/30 cursor-pointer hover:border-[#C6A15B] transition-colors"
            >
              <div
                className={`w-5 h-5 border flex items-center justify-center ${
                  cart.giftWrap
                    ? 'border-[#C6A15B] bg-[#C6A15B] text-[#0F0D0C]'
                    : 'border-[#C6A15B]/40'
                }`}
              >
                {cart.giftWrap && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <Gift className="w-5 h-5 text-[#C6A15B] shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-[#F3EEE5]">{t('cart.giftWrap')}</p>
                <p className="text-[11px] text-[#C5B8A8]">{t('cart.giftWrapNote')}</p>
              </div>
            </div>
          </div>

          {/* Order Summary (4 cols) */}
          <div className="lg:col-span-4 bg-[#1C120E] border border-[#C6A15B]/30 p-6 space-y-6 shadow-2xl">
            <h3 className="font-cinzel text-base font-bold uppercase text-[#F3EEE5] border-b border-[#C6A15B]/20 pb-3">
              Order Summary
            </h3>

            {/* Promo Code Input */}
            <div>
              {cart.discountCode ? (
                <div className="flex items-center justify-between p-2.5 bg-[#2B1A12] border border-[#C6A15B]/40 text-xs text-[#C6A15B]">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Privilege '{cart.discountCode}' (-${totals.discountAmount})</span>
                  </div>
                  <button
                    onClick={removeDiscount}
                    className="text-xs underline text-[#C5B8A8] hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Promo Code (e.g. ROYAL10)"
                    className="flex-1 bg-[#0F0D0C] border border-[#C6A15B]/30 px-3 py-2 text-xs uppercase text-[#F3EEE5] placeholder-[#C5B8A8]/50 focus:border-[#C6A15B] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={promoLoading}
                    className="px-4 py-2 bg-[#2B1A12] border border-[#C6A15B]/50 text-xs uppercase font-cinzel text-[#C6A15B] hover:bg-[#C6A15B] hover:text-[#0F0D0C] transition-colors"
                  >
                    {promoLoading ? '...' : t('cart.apply')}
                  </button>
                </form>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-[#C5B8A8]">
              <div className="flex justify-between">
                <span>{t('cart.subtotal')}</span>
                <span className="font-mono text-[#F3EEE5]">${totals.subtotal}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-[#C6A15B]">
                  <span>{t('cart.discount')}</span>
                  <span className="font-mono">-${totals.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t('cart.shipping')}</span>
                <span className="font-mono">
                  {totals.shipping === 0 ? (
                    <span className="text-[#C6A15B] uppercase font-semibold">{t('cart.freeShipping')}</span>
                  ) : (
                    `$${totals.shipping}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-[#F3EEE5] pt-3 border-t border-[#C6A15B]/20 font-cinzel">
                <span>{t('cart.total')}</span>
                <span className="text-[#C6A15B]">${totals.total}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full luxury-btn-gold py-4 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl"
            >
              <span>{t('cart.checkout')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[#C5B8A8] text-center pt-2">
              <ShieldCheck className="w-4 h-4 text-[#C6A15B] shrink-0" />
              <span>Complimentary insured express courier worldwide.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
