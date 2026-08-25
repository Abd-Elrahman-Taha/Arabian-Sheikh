import React, { useState } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Tag,
  Percent,
  Copy,
  Check,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Gift,
  Clock
} from 'lucide-react';
import BlurText from '../common/BlurText';

export default function OffersDiscountSection({ products = [] }) {
  const { navigate } = useRouter();
  const { language } = useTranslation();
  const { addToCart } = useCart();
  const { isDark } = useTheme();

  const [copiedCode, setCopiedCode] = useState(null);

  // Bundles or discounted items
  const offerBundles = products.filter(p => p.isOffer || p.category === 'bundles').slice(0, 3);

  const promoCodes = [
    {
      code: 'SHEIKH10',
      discount: '10% OFF',
      arabicDiscount: 'خصم 10%',
      minSpend: '€50',
      desc: 'Applied instantly on all sovereign orders exceeding €50.',
      arabicDesc: 'يطبق فوراً على كافة الطلبات التي تتجاوز 50 يورو.'
    },
    {
      code: 'ROYALTY20',
      discount: '20% OFF',
      arabicDiscount: 'خصم 20%',
      minSpend: '€100',
      desc: 'Exclusive VIP royal discount for grand orders over €100.',
      arabicDesc: 'خصم ملكي خاص للطلبات الكبيرة التي تتجاوز 100 يورو.'
    }
  ];

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden transition-colors duration-500 border-t border-[#D4AF37]/20 bg-transparent">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10 space-y-16">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs uppercase font-cinzel font-bold tracking-widest">
            <Percent className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{language === 'ar' ? 'العروض والتخفيضات الحصرية' : 'EXCLUSIVE PALACE OFFERS & DISCOUNTS'}</span>
          </div>

          <BlurText
            text={language === 'ar' ? 'عروض القصر الملكي والمجموعات الحصرية' : 'ROYAL COFFRETS & VOUCHER CODES'}
            delay={50}
            animateBy="words"
            direction="top"
            className={`text-3xl sm:text-4xl lg:text-5xl font-cinzel font-bold drop-shadow-md justify-center ${
              isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
            }`}
            as="h2"
          />

          <p className={`text-xs sm:text-sm font-medium leading-relaxed max-w-2xl mx-auto ${
            isDark ? 'text-[#D8BE99]' : 'text-[#3A2116]'
          }`}>
            {language === 'ar'
              ? 'استمتع بمجموعات الهدايا الفاخرة المعبأة في صناديق مخملية مذهبة مع أكواد خصم حصرية لفترة محدودة.'
              : 'Indulge in limited-edition presentation coffrets, gift bundles, and royal voucher codes for an extraordinary olfactory experience.'}
          </p>
        </div>

        {/* 1. VOUCHER CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {promoCodes.map((promo) => (
            <div
              key={promo.code}
              className={`p-6 sm:p-7 rounded-2xl border-2 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all duration-300 ${
                isDark
                  ? 'bg-gradient-to-br from-[#8C6239]/40 via-[#D4AF37]/25 to-[#5A3E1B]/50 border-[#D4AF37]/80 shadow-[0_12px_35px_rgba(212,175,55,0.3)]'
                  : 'bg-[#FFFDF8] hover:bg-[#FBF6EC] border-[#A8853B]/35 shadow-[0_10px_30px_-5px_rgba(112,70,34,0.08)]'
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-md">
                    {language === 'ar' ? promo.arabicDiscount : promo.discount}
                  </span>
                  <span className={`text-xs font-mono font-semibold ${isDark ? 'text-[#FFF2B2]' : 'text-[#8A6540]'}`}>
                    Min. {promo.minSpend}
                  </span>
                </div>
                <h4 className={`font-cinzel text-lg font-bold ${isDark ? 'text-[#FFF5E6]' : 'text-[#704622]'}`}>
                  {promo.code}
                </h4>
                <p className={`text-xs ${isDark ? 'text-[#D8BE99]' : 'text-[#4A2A14]'}`}>
                  {language === 'ar' ? promo.arabicDesc : promo.desc}
                </p>
              </div>

              {/* Interactive Copy Button */}
              <button
                onClick={() => handleCopy(promo.code)}
                className={`px-5 py-3 rounded-xl border flex items-center justify-center gap-2 font-cinzel font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                  copiedCode === promo.code
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : isDark
                    ? 'bg-[#0B0A08] border-[#D4AF37]/70 text-[#FFF2B2] hover:bg-[#1A1008] hover:text-[#D4AF37]'
                    : 'bg-[#704622] hover:bg-[#4A2A14] border-[#A8853B]/50 text-[#FFFDF8] hover:text-[#FFDF8A] shadow-sm'
                }`}
              >
                {copiedCode === promo.code ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{language === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>{language === 'ar' ? 'نسخ الكود' : 'Copy Code'}</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* 2. EXCLUSIVE FEATURED BUNDLE OFFERS */}
        {offerBundles.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#D4AF37]" />
                <h3 className={`font-cinzel text-xl sm:text-2xl font-bold ${isDark ? 'text-[#FFF5E6]' : 'text-[#704622]'}`}>
                  {language === 'ar' ? 'باقات الهدايا الملكية المخفضة' : 'Discounted Sovereign Gift Coffrets'}
                </h3>
              </div>

              <Link
                to="/shop?category=bundles"
                className="text-xs font-cinzel font-bold text-[#A8853B] dark:text-[#D4AF37] hover:underline flex items-center gap-1"
              >
                <span>{language === 'ar' ? 'عرض الكل' : 'View All Bundles'}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {offerBundles.map((bundle) => {
                const imageSrc = bundle.originalImage || bundle.images?.[0] || bundle.cutoutImage;

                return (
                  <div
                    key={bundle.id}
                    className={`group rounded-2xl border-2 p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-500 hover:-translate-y-2 ${
                      isDark
                        ? 'bg-gradient-to-br from-[#8C6239]/40 via-[#D4AF37]/25 to-[#5A3E1B]/50 border-[#D4AF37]/80 hover:border-[#FFF2B2] shadow-[0_12px_40px_rgba(212,175,55,0.35)] hover:shadow-[0_22px_55px_rgba(212,175,55,0.55)]'
                        : 'bg-[#FFFDF8] hover:bg-[#FBF6EC] border-[#A8853B]/35 hover:border-[#A8853B] shadow-[0_10px_30px_-5px_rgba(112,70,34,0.08)] hover:shadow-[0_15px_35px_rgba(112,70,34,0.14)]'
                    }`}
                  >
                    {/* Offer Tag Badge */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="px-3 py-1 rounded-full bg-red-800/90 text-white font-cinzel font-bold text-[10px] uppercase tracking-widest shadow-md">
                        {bundle.offerLabel || '15% OFF SPECIAL'}
                      </span>
                      <span className={`text-[10px] font-mono font-bold flex items-center gap-1 ${isDark ? 'text-[#FFF2B2]' : 'text-[#8A6540]'}`}>
                        <Clock className="w-3 h-3 text-[#A8853B] dark:text-[#D4AF37]" />
                        <span>Limited Edition</span>
                      </span>
                    </div>

                    {/* Image */}
                    <div
                      onClick={() => navigate(`/product/${bundle.slug || bundle.id}`)}
                      className={`aspect-[4/3] rounded-xl overflow-hidden cursor-pointer mb-5 border relative ${
                        isDark ? 'border-[#D4AF37]/35 bg-black/40' : 'border-[#A8853B]/25 bg-[#EAE0CC]/30'
                      }`}
                    >
                      <img
                        src={imageSrc}
                        alt={bundle.name}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <div>
                        <h4
                          onClick={() => navigate(`/product/${bundle.slug || bundle.id}`)}
                          className={`font-cinzel text-lg font-bold cursor-pointer transition-colors ${
                            isDark ? 'text-[#FFF5E6] group-hover:text-[#FFF2B2]' : 'text-[#704622] group-hover:text-[#A8853B]'
                          }`}
                        >
                          {language === 'ar' ? bundle.arabicName || bundle.name : bundle.name}
                        </h4>
                        <p className={`text-xs line-clamp-2 mt-1 leading-relaxed ${
                          isDark ? 'text-[#D8BE99]' : 'text-[#4A2A14]'
                        }`}>
                          {bundle.tagline || bundle.description}
                        </p>
                      </div>

                      {/* Pricing and Action */}
                      <div className="pt-3 border-t border-[#A8853B]/20 dark:border-[#D4AF37]/30 flex items-center justify-between gap-3">
                        <div>
                          <span className="font-cinzel text-xl font-bold text-[#A8853B] dark:text-[#D4AF37]">
                            €{bundle.price}
                          </span>
                          {bundle.originalPrice && (
                            <span className="text-xs line-through ml-2 text-gray-400 font-mono">
                              €{bundle.originalPrice}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => addToCart(bundle, bundle.size || 'Full Set', 1)}
                          className={`px-5 py-2.5 font-cinzel font-bold text-xs uppercase tracking-wider rounded-full transition-all duration-300 flex items-center gap-1.5 shadow-md cursor-pointer hover:scale-105 ${
                            isDark
                              ? 'bg-[#0B0A08] hover:bg-[#1A1008] text-[#FFF2B2] hover:text-[#D4AF37] border border-[#D4AF37]/70'
                              : 'bg-[#1A1008] hover:bg-[#2C180F] text-[#FFFDF9] hover:text-[#D4AF37] border border-[#D4AF37]/60'
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'اقتنِ العرض' : 'Claim Offer'}</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
