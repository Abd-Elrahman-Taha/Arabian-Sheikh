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
  const { language, t } = useTranslation();
  const { addToCart } = useCart();
  const { isDark } = useTheme();

  const [copiedCode, setCopiedCode] = useState(null);

  // Dynamic discounted products & special bundles from admin catalogue
  const discountedItems = products.filter(p => 
    p.hasDiscount || 
    (p.discountPercent && p.discountPercent > 0) || 
    (p.originalPrice && p.originalPrice > p.price) ||
    p.isOffer || 
    p.category === 'bundles'
  );

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
            <span>{language === 'ar' ? 'العروض والتخفيضات الحصرية' : language === 'bg' ? 'Ексклузивни Дворцови Оферти' : language === 'es' ? 'Ofertas Exclusivas del Palacio' : 'EXCLUSIVE PALACE OFFERS & DISCOUNTS'}</span>
          </div>

          <BlurText
            text={language === 'ar' ? 'عروض القصر الملكي والمجموعات الحصرية' : language === 'bg' ? 'Кралски Комплекти и Промо Кодове' : language === 'es' ? 'Estuches Reales y Códigos Promocionales' : 'ROYAL COFFRETS & VOUCHER CODES'}
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
              ? 'استمتع بمجموعات الهدايا الفاخرة والمنتجات المخفضة مع أكواد خصم حصرية لفترة محدودة.'
              : language === 'bg'
              ? 'Насладете се на лимитирани подаръчни сетове, намалени флакони и промоционални кодове.'
              : language === 'es'
              ? 'Disfrute de estuches exclusivos de regalo, frascos con descuento y códigos promocionales.'
              : 'Indulge in limited-edition presentation coffrets, discounted royal flacons, and voucher codes for an extraordinary olfactory experience.'}
          </p>
        </div>

        {/* 1. VOUCHER CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {promoCodes.map((promo) => (
            <div
              key={promo.code}
              className={`p-6 sm:p-7 rounded-2xl border-2 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all duration-300 ${
                isDark
                  ? 'bg-gradient-to-br from-[#D4AF37]/55 via-[#F2D675]/35 to-[#8C6239]/65 border-[#F2D675] shadow-[0_14px_45px_rgba(212,175,55,0.45)] hover:shadow-[0_22px_65px_rgba(242,214,117,0.75)]'
                  : 'bg-[#FFFDF8] hover:bg-[#FBF6EC] border-[#A8853B]/35 shadow-[0_10px_30px_-5px_rgba(112,70,34,0.08)]'
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-md shadow-sm">
                    {language === 'ar' ? promo.arabicDiscount : promo.discount}
                  </span>
                  <span className={`text-[11px] font-mono font-bold ${isDark ? 'text-[#FFDF8A]' : 'text-[#8A6540]'}`}>
                    Min Spend: {promo.minSpend}
                  </span>
                </div>
                <div className="font-mono text-lg sm:text-xl font-bold tracking-widest text-[#D4AF37] select-all">
                  {promo.code}
                </div>
                <p className={`text-xs ${isDark ? 'text-[#F3E6D0]' : 'text-[#5A3517]'}`}>
                  {language === 'ar' ? promo.arabicDesc : promo.desc}
                </p>
              </div>

              <button
                onClick={() => handleCopy(promo.code)}
                className={`px-5 py-3 rounded-xl border font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-md ${
                  copiedCode === promo.code
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : isDark
                    ? 'bg-[#0B0A08] hover:bg-[#1A1008] text-[#FFF2B2] hover:text-[#D4AF37] border-[#F2D675]'
                    : 'bg-[#704622] hover:bg-[#4A2A14] text-white border-[#A8853B]'
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

        {/* 2. EXCLUSIVE FEATURED DISCOUNTED PRODUCTS & BUNDLES */}
        {discountedItems.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#D4AF37]" />
                <h3 className={`font-cinzel text-xl sm:text-2xl font-bold ${isDark ? 'text-[#FFF5E6]' : 'text-[#704622]'}`}>
                  {language === 'ar' ? 'المنتجات المخفضة والباقات الخاصة' : language === 'bg' ? 'Намалени Флакони и Специални Сетове' : language === 'es' ? 'Frascos con Descuento y Estuches' : 'Discounted Sovereign Flacons & Bundles'}
                </h3>
              </div>

              <Link
                to="/shop"
                className="text-xs font-cinzel font-bold text-[#A8853B] dark:text-[#D4AF37] hover:underline flex items-center gap-1"
              >
                <span>{language === 'ar' ? 'عرض كل العطور' : language === 'bg' ? 'Виж всички в бутика' : language === 'es' ? 'Ver Todo en la Boutique' : 'View All in Boutique'}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {discountedItems.map((item) => {
                const imageSrc = item.originalImage || item.images?.[0] || item.cutoutImage;
                const discountRate = item.discountPercent || (item.originalPrice ? Math.round((1 - item.price / item.originalPrice) * 100) : 15);

                return (
                  <div
                    key={item.id}
                    className={`group rounded-2xl border-2 p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-500 hover:-translate-y-2 ${
                      isDark
                        ? 'bg-gradient-to-br from-[#D4AF37]/55 via-[#F2D675]/35 to-[#8C6239]/65 border-[#F2D675] hover:border-[#FFFDF8] shadow-[0_14px_45px_rgba(212,175,55,0.45)] hover:shadow-[0_22px_65px_rgba(242,214,117,0.75)]'
                        : 'bg-[#FFFDF8] hover:bg-[#FBF6EC] border-[#A8853B]/35 hover:border-[#A8853B] shadow-[0_10px_30px_-5px_rgba(112,70,34,0.08)] hover:shadow-[0_15px_35px_rgba(112,70,34,0.14)]'
                    }`}
                  >
                    {/* Offer Tag Badge */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="px-3 py-1 rounded-full bg-red-800/90 text-white font-cinzel font-bold text-[10px] uppercase tracking-widest shadow-md flex items-center gap-1">
                        <Percent className="w-2.5 h-2.5" />
                        <span>{discountRate}% OFF SPECIAL</span>
                      </span>
                      <span className={`text-[10px] font-mono font-bold flex items-center gap-1 ${isDark ? 'text-[#FFDF8A]' : 'text-[#8A6540]'}`}>
                        <Clock className="w-3 h-3 text-[#A8853B] dark:text-[#FFDF8A]" />
                        <span>{language === 'ar' ? 'عرض خاص' : language === 'bg' ? 'Оферта' : language === 'es' ? 'Oferta Especial' : 'Palace Offer'}</span>
                      </span>
                    </div>

                    {/* Image */}
                    <div
                      onClick={() => navigate(`/product/${item.slug || item.id}`)}
                      className={`aspect-[4/3] rounded-xl overflow-hidden cursor-pointer mb-5 border relative ${
                        isDark ? 'border-[#F2D675]/50 bg-black/40' : 'border-[#A8853B]/25 bg-[#EAE0CC]/30'
                      }`}
                    >
                      <img
                        src={imageSrc}
                        alt={item.name}
                        className="w-full h-full object-contain p-2 group-hover:scale-108 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                    </div>

                    {/* Content */}
                    <div className={`space-y-4 p-3 rounded-xl ${isDark ? 'bg-gradient-to-b from-[#3D250C]/90 to-[#1A0E04]/95 border-t border-[#F2D675]/40' : ''}`}>
                      <div>
                        <h4
                          onClick={() => navigate(`/product/${item.slug || item.id}`)}
                          className={`font-cinzel text-lg font-bold cursor-pointer transition-colors ${
                            isDark ? 'text-[#FFFDF8] group-hover:text-[#F2D675] drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]' : 'text-[#704622] group-hover:text-[#A8853B]'
                          }`}
                        >
                          {language === 'ar' ? item.arabicName || item.name : language === 'bg' ? item.bulgarianName || item.name : language === 'es' ? item.spanishName || item.name : item.name}
                        </h4>
                        <p className={`text-xs line-clamp-2 mt-1 leading-relaxed ${
                          isDark ? 'text-[#F3E6D0]' : 'text-[#4A2A14]'
                        }`}>
                          {item.tagline || item.description}
                        </p>
                      </div>

                      {/* Pricing and Action */}
                      <div className="pt-3 border-t border-[#A8853B]/20 dark:border-[#F2D675]/30 flex items-center justify-between gap-3">
                        <div>
                          <span className={`font-cinzel text-xl font-extrabold ${
                            isDark ? 'text-[#FFDF8A] drop-shadow-[0_0_10px_rgba(212,175,55,0.6)]' : 'text-[#A8853B]'
                          }`}>
                            €{item.price}
                          </span>
                          {item.originalPrice && (
                            <span className="text-xs line-through ml-2 text-gray-400 font-mono">
                              €{item.originalPrice}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => addToCart(item, item.size || '60 ml', 1)}
                          className={`px-5 py-2.5 font-cinzel font-bold text-xs uppercase tracking-wider rounded-full transition-all duration-300 flex items-center gap-1.5 shadow-md cursor-pointer hover:scale-105 ${
                            isDark
                              ? 'bg-[#0B0A08] hover:bg-[#1A1008] text-[#FFF2B2] hover:text-[#D4AF37] border-2 border-[#F2D675]'
                              : 'bg-[#704622] hover:bg-[#4A2A14] text-[#FFFDF8] hover:text-[#FFDF8A] border border-[#A8853B]/50 shadow-sm'
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{t('shop.addToBag') || (language === 'ar' ? 'اقتنِ العرض' : 'Claim Offer')}</span>
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
