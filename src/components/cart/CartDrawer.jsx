import React, { useState, useEffect } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useCart } from '../../context/CartContext';
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
  const { t, isRtl } = useTranslation();
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
        const firstItemId = items[0]?.productId || 'as-luxury-black-diamond';
        const related = await productService.getRelatedProducts(firstItemId, 4);
        const cartIds = items.map(i => i.productId);
        const filtered = related.filter(r => !cartIds.includes(r.id));
        setRecommendations(filtered.slice(0, 2));
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

  const freeShippingThreshold = 100; // €100 for complimentary DHL shipping
  const freeShippingProgress = Math.min(
    100,
    Math.round((totals.subtotal / freeShippingThreshold) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity cursor-pointer"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 rtl:right-auto rtl:left-0 max-w-full flex">
        <div className="w-screen max-w-md bg-[#0B0A08] border-l rtl:border-l-0 rtl:border-r border-[#D4AF37]/30 text-[#F3E6D0] shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-[#D4AF37]/20 flex items-center justify-between bg-[#0B0A08]">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="font-cinzel text-base font-bold tracking-widest uppercase text-[#F3E6D0]">
                {t('cart.title') || 'Shopping Bag'}
              </h2>
              <span className="text-xs text-[#D4AF37] font-mono font-bold">
                ({totals.itemCount})
              </span>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 text-[#D8BE99] hover:text-[#D4AF37] transition-colors cursor-pointer"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="px-5 py-3 bg-black/40 border-b border-white/10">
            {totals.subtotal >= freeShippingThreshold ? (
              <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-bold">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>You unlocked Complimentary DHL Express Delivery!</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-[#D8BE99]">
                  <span>Add <strong>€{(freeShippingThreshold - totals.subtotal).toFixed(2)}</strong> for Free DHL Express</span>
                  <span className="font-mono text-[#D4AF37] font-bold">{freeShippingProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#D4AF37] transition-all duration-500"
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
                <div className="w-16 h-16 rounded-full border border-[#D4AF37]/30 flex items-center justify-center mx-auto text-[#D4AF37] bg-[#D4AF37]/10">
                  <ShoppingBag className="w-8 h-8 opacity-70" />
                </div>
                <h3 className="font-cinzel text-base font-bold text-[#F3E6D0]">
                  Your Bag is Empty
                </h3>
                <p className="text-xs text-[#D8BE99] max-w-xs mx-auto leading-relaxed">
                  Discover our royal Andalusian signature extraits and flacons.
                </p>
                <button
                  onClick={() => {
                    closeDrawer();
                    navigate('/shop');
                  }}
                  className="px-6 py-2.5 bg-[#D4AF37] text-black font-cinzel text-xs uppercase font-bold tracking-wider inline-block cursor-pointer hover:bg-[#F2D675]"
                >
                  Explore Boutique
                </button>
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={`${item.productId}-${item.size}-${idx}`}
                  className="flex gap-3.5 p-3.5 bg-[#0B0A08] border border-[#D4AF37]/15 relative group transition-all"
                >
                  {/* Flacon Image */}
                  <img
                    src={item.image || '/products/black_diamond_gold.png'}
                    alt={item.name}
                    className="w-16 h-20 object-contain p-1 bg-black/50 shrink-0 border border-white/5"
                  />

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="font-cinzel text-xs font-bold text-[#F3E6D0] line-clamp-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.productId, item.size)}
                          className="text-[#D8BE99] hover:text-red-400 p-1 transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {item.arabicName && (
                        <p className="font-arabic text-[11px] text-[#D4AF37]">{item.arabicName}</p>
                      )}
                      <p className="text-[10px] text-[#D8BE99] font-mono mt-0.5">Size: {item.size || '60 ml'}</p>
                    </div>

                    {/* Quantity & Item Total */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                      <div className="flex items-center border border-[#D4AF37]/30 bg-black/60 rounded-xs">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                          className="p-1 text-[#F3E6D0] hover:text-[#D4AF37] cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-[#D4AF37]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                          className="p-1 text-[#F3E6D0] hover:text-[#D4AF37] cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-cinzel text-sm font-bold text-[#D4AF37]">
                        €{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Frequently Paired / Related Recommendations */}
            {items.length > 0 && recommendations.length > 0 && (
              <div className="pt-3 mt-3 border-t border-[#D4AF37]/20 space-y-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-cinzel font-bold text-[#F2D675] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Patrons Also Paired With</span>
                </div>
                <div className="space-y-2">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between p-2.5 bg-black/60 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-colors rounded-xs"
                    >
                      <div
                        onClick={() => {
                          closeDrawer();
                          navigate(`/product/${rec.slug || rec.id}`);
                        }}
                        className="flex items-center gap-2.5 cursor-pointer flex-1"
                      >
                        <img
                          src={rec.cutoutImage || rec.images?.[0] || '/products/black_diamond_gold.png'}
                          alt={rec.name}
                          className="w-10 h-12 object-contain bg-black/40 p-0.5 border border-white/5"
                        />
                        <div>
                          <h5 className="font-cinzel text-xs font-bold text-[#F3E6D0] line-clamp-1">{rec.name}</h5>
                          <span className="text-xs font-mono font-bold text-[#F2D675]">€{rec.price}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          addToCart(rec, rec.size || '60 ml', 1);
                        }}
                        className="px-3 py-1.5 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer shrink-0 shadow-md"
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
            <div className="p-5 bg-[#0B0A08] border-t border-[#D4AF37]/30 space-y-4">
              {/* Gift Wrap Toggle */}
              <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                <div className="flex items-center gap-2 text-[#F3E6D0]">
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
                  className="flex-1 bg-black/60 border border-[#D4AF37]/30 px-3 py-2 text-xs font-mono uppercase text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={promoLoading || !promoInput}
                  className="px-4 py-2 bg-white/5 hover:bg-[#D4AF37] text-[#F3E6D0] hover:text-black border border-[#D4AF37]/40 text-xs font-cinzel font-bold uppercase transition-colors"
                >
                  {promoLoading ? 'Validating...' : 'Apply'}
                </button>
              </form>

              {/* Subtotal & Total */}
              <div className="space-y-1.5 pt-2 text-xs">
                <div className="flex justify-between text-[#D8BE99]">
                  <span>Subtotal</span>
                  <span className="font-mono text-[#F3E6D0] font-bold">€{totals.subtotal.toFixed(2)}</span>
                </div>
                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Privilege Discount</span>
                    <span>-€{totals.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-cinzel font-bold text-[#F3E6D0] pt-2 border-t border-white/10">
                  <span>Estimated Total</span>
                  <span className="text-[#D4AF37]">€{totals.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Stripe Checkout</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>

              <div className="text-center">
                <button
                  onClick={handleViewBag}
                  className="text-[11px] text-[#D8BE99] hover:text-[#D4AF37] underline font-cinzel uppercase tracking-wider"
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
