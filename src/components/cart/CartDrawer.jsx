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
      // Toast already shown
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
      {/* Dark Backdrop */}
      <div
        className="absolute inset-0 bg-[#0F0D0C]/80 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#1C120E] border-l border-[#C6A15B]/30 text-[#F3EEE5] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-[#C6A15B]/20 flex items-center justify-between bg-[#140D0A]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C6A15B]" />
              <h2 className="font-cinzel text-lg font-bold tracking-widest text-[#F3EEE5] uppercase">
                {t('cart.title')}
              </h2>
              <span className="text-xs text-[#C6A15B] font-mono">({totals.totalCount})</span>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 text-[#C5B8A8] hover:text-[#C6A15B] transition-colors"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="px-5 py-3 bg-[#241712] border-b border-[#C6A15B]/15">
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

          {/* Items List or Empty State */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full border border-[#C6A15B]/30 flex items-center justify-center mx-auto text-[#C6A15B]">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="font-cinzel text-base font-semibold text-[#F3EEE5]">
                  {t('cart.emptyTitle')}
                </h3>
                <p className="text-xs text-[#C5B8A8] max-w-xs mx-auto leading-relaxed">
                  {t('cart.emptyDesc')}
                </p>
                <button
                  onClick={() => {
                    closeDrawer();
                    navigate('/shop');
                  }}
                  className="luxury-btn-gold px-6 py-2.5 text-xs inline-block"
                >
                  {t('cart.startShopping')}
                </button>
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={`${item.productId}-${item.size}-${idx}`}
                  className="flex gap-4 p-3 bg-[#241712] border border-[#C6A15B]/15 relative group"
                >
                  {/* Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 object-cover object-center bg-[#0F0D0C] shrink-0 border border-[#C6A15B]/10"
                  />

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="font-cinzel text-sm font-semibold text-[#F3EEE5] line-clamp-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.productId, item.size)}
                          className="text-[#C5B8A8] hover:text-red-400 p-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-[#C6A15B] font-mono mt-0.5">
                        {item.size} • {item.fragranceFamily}
                      </p>
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#C6A15B]/10">
                      <div className="flex items-center border border-[#C6A15B]/30 bg-[#0F0D0C]">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                          className="p-1 text-[#C5B8A8] hover:text-[#C6A15B]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                          className="p-1 text-[#C5B8A8] hover:text-[#C6A15B]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-cinzel text-sm font-bold text-[#C6A15B]">
                        ${item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {items.length > 0 && (
              <>
                {/* Gift Wrap Option */}
                <div
                  onClick={toggleGiftWrap}
                  className="flex items-center gap-3 p-3 bg-[#241712] border border-[#C6A15B]/20 cursor-pointer hover:border-[#C6A15B]/50 transition-colors"
                >
                  <div
                    className={`w-4 h-4 rounded-none border flex items-center justify-center ${
                      cart.giftWrap
                        ? 'border-[#C6A15B] bg-[#C6A15B] text-[#0F0D0C]'
                        : 'border-[#C6A15B]/40'
                    }`}
                  >
                    {cart.giftWrap && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <Gift className="w-4 h-4 text-[#C6A15B] shrink-0" />
                  <div className="flex-1 text-xs">
                    <p className="font-medium text-[#F3EEE5]">{t('cart.giftWrap')}</p>
                    <p className="text-[11px] text-[#C5B8A8]">{t('cart.giftWrapNote')}</p>
                  </div>
                </div>

                {/* Promo Code Input */}
                <div className="pt-2">
                  {cart.discountCode ? (
                    <div className="flex items-center justify-between p-2.5 bg-[#2B1A12] border border-[#C6A15B]/40 text-xs text-[#C6A15B]">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Privilege '{cart.discountCode}' Applied (-${totals.discountAmount})</span>
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
                        placeholder="Privilege Code (e.g. ROYAL10)"
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
              </>
            )}
          </div>

          {/* Footer & Totals */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#C6A15B]/20 bg-[#140D0A] space-y-3">
              <div className="space-y-1.5 text-xs text-[#C5B8A8]">
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
                <div className="flex justify-between text-base font-bold text-[#F3EEE5] pt-2 border-t border-[#C6A15B]/20 font-cinzel">
                  <span>{t('cart.total')}</span>
                  <span className="text-[#C6A15B]">${totals.total}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleCheckout}
                  className="w-full luxury-btn-gold py-3 text-xs flex items-center justify-center gap-2"
                >
                  <span>{t('cart.checkout')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleViewBag}
                  className="w-full luxury-btn-outline py-2.5 text-xs text-center block"
                >
                  View Full Bag & Calculation
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#C5B8A8] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span>Encrypted 256-bit Royal Vault Protection</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
