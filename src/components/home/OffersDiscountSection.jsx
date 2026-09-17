import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { promotionService } from '../../services/promotionService';
import {
  Tag,
  Percent,
  Copy,
  Check,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Gift,
  Clock,
  Package,
  Crown,
  Eye,
  X,
  Layers,
  Flame,
  ChevronRight
} from 'lucide-react';
import BlurText from '../common/BlurText';

export default function OffersDiscountSection({ products = [] }) {
  const { navigate } = useRouter();
  const { language, t } = useTranslation();
  const { addToCart, addBundleToCart } = useCart();
  const { isDark } = useTheme();
  const { success } = useToast();

  const [promotions, setPromotions] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'BUNDLES' | 'DISCOUNTS'
  const [selectedBundleModal, setSelectedBundleModal] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  // Fetch active promotions and bundles from backend API
  useEffect(() => {
    let isMounted = true;
    async function loadOffers() {
      setLoading(true);
      try {
        const [promosRes, bundlesRes] = await Promise.allSettled([
          promotionService.getPublicPromotions(),
          promotionService.getPublicBundles()
        ]);

        if (isMounted) {
          const loadedPromos = promosRes.status === 'fulfilled' && Array.isArray(promosRes.value) ? promosRes.value : [];
          const loadedBundles = bundlesRes.status === 'fulfilled' && Array.isArray(bundlesRes.value) ? bundlesRes.value : [];
          setPromotions(loadedPromos);
          setBundles(loadedBundles);
        }
      } catch (err) {
        console.warn('[OffersDiscountSection] Error loading offers:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadOffers();
    return () => { isMounted = false; };
  }, []);

  // Default / Curated Fallback Bundles if no backend bundles exist yet
  const displayBundles = useMemo(() => {
    if (bundles.length > 0) return bundles;

    const p1 = products[0] || { id: 1, name: 'Arabian Gold Sovereign', price: 55, imageUrl: '/products/luxury_designs/07_arabian_gold.webp', brand: 'Arabian Sheikh' };
    const p2 = products[1] || { id: 2, name: 'Millionaire Royal', price: 40, imageUrl: '/products/luxury_designs/17_million_elixir.webp', brand: 'Arabian Sheikh' };
    const p3 = products[2] || { id: 3, name: 'Ana Sukkar Classic', price: 30, imageUrl: '/products/luxury_designs/02_ameerah_al_arab.webp', brand: 'Arabian Sheikh' };

    return [
      {
        id: 'fallback-bundle-1',
        promotionId: 1,
        promotionName: language === 'ar' ? 'موسم المقتنيات الملكية' : 'Royal Extrait Gala',
        name: language === 'ar' ? 'باقة الملوك الذهبية المزدوجة' : 'Sovereign Royalty Duet',
        bundlePrice: 75,
        originalItemsPrice: (p1.price || 55) + (p2.price || 40),
        savingsAmount: Math.max(0, ((p1.price || 55) + (p2.price || 40)) - 75),
        savingsPercentage: Math.round(((((p1.price || 55) + (p2.price || 40)) - 75) / ((p1.price || 55) + (p2.price || 40))) * 100),
        items: [
          { productId: p1.id, productName: p1.name, brandName: p1.brand || 'Arabian Sheikh', imageUrl: p1.imageUrl || p1.image, unitPrice: p1.price || 55, quantity: 1 },
          { productId: p2.id, productName: p2.name, brandName: p2.brand || 'Arabian Sheikh', imageUrl: p2.imageUrl || p2.image, unitPrice: p2.price || 40, quantity: 1 }
        ]
      },
      {
        id: 'fallback-bundle-2',
        promotionId: 2,
        promotionName: language === 'ar' ? 'مجموعة القصر الأندلسي' : 'Andalusian Reserve Collection',
        name: language === 'ar' ? 'ثلاثية المسك والعنبر والعود' : 'Imperial Amber & Oud Trio',
        bundlePrice: 99,
        originalItemsPrice: (p1.price || 55) + (p2.price || 40) + (p3.price || 30),
        savingsAmount: Math.max(0, ((p1.price || 55) + (p2.price || 40) + (p3.price || 30)) - 99),
        savingsPercentage: Math.round(((((p1.price || 55) + (p2.price || 40) + (p3.price || 30)) - 99) / ((p1.price || 55) + (p2.price || 40) + (p3.price || 30))) * 100),
        items: [
          { productId: p1.id, productName: p1.name, brandName: p1.brand || 'Arabian Sheikh', imageUrl: p1.imageUrl || p1.image, unitPrice: p1.price || 55, quantity: 1 },
          { productId: p2.id, productName: p2.name, brandName: p2.brand || 'Arabian Sheikh', imageUrl: p2.imageUrl || p2.image, unitPrice: p2.price || 40, quantity: 1 },
          { productId: p3.id, productName: p3.name, brandName: p3.brand || 'Arabian Sheikh', imageUrl: p3.imageUrl || p3.image, unitPrice: p3.price || 30, quantity: 1 }
        ]
      }
    ];
  }, [bundles, products, language]);

  // Display Promotions
  const displayPromotions = useMemo(() => {
    if (promotions.length > 0) return promotions;

    return [
      {
        id: 'fallback-promo-1',
        name: language === 'ar' ? 'مهرجان العطور الشرقية الملكية' : 'Autumn Royal Extrait Celebration',
        type: 'Discount',
        discountType: 'Percentage',
        discountValue: 20,
        startDate: new Date().toISOString(),
        endDate: '2026-12-31T23:59:59Z',
        bundlesCount: 2
      }
    ];
  }, [promotions, language]);

  // Standard Palace Voucher Codes
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

  // Add entire bundle suite to cart as a dedicated bundle item with bundle price
  const handleAddBundleToCart = (bundle) => {
    if (!bundle) return;
    if (addBundleToCart) {
      addBundleToCart(bundle, 1);
    } else {
      addToCart(bundle, 'Curated Suite', 1);
    }
  };

  return (
    <section id="palace-offers" className="py-20 sm:py-28 relative overflow-hidden transition-colors duration-500 border-t border-[#D4AF37]/20 bg-transparent">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(212,175,55,0.08),transparent_60%)] pointer-events-none" />

      <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10 space-y-16">
        
        {/* ========================================================================= */}
        {/* 1. SECTION AD BILLBOARD HEADER                                            */}
        {/* ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/50 text-[#F2D675] text-xs uppercase font-cinzel font-bold tracking-widest shadow-md">
            <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>
              {language === 'ar'
                ? 'الحملات الترويجية والباقات الملكية الحصرية'
                : 'EXCLUSIVE PALACE CAMPAIGNS & CURATED BUNDLES'}
            </span>
          </div>

          <BlurText
            text={
              language === 'ar'
                ? 'عروض وباقات القصر الملكي'
                : 'ROYAL SUITES & PALACE OFFERS'
            }
            delay={40}
            animateBy="words"
            direction="top"
            className={`text-3xl sm:text-5xl lg:text-6xl font-cinzel font-extrabold drop-shadow-md justify-center ${
              isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
            }`}
            as="h2"
          />

          <p className={`text-xs sm:text-sm font-medium leading-relaxed max-w-2xl mx-auto ${
            isDark ? 'text-[#D8BE99]' : 'text-[#3A2116]'
          }`}>
            {language === 'ar'
              ? 'استكشف الباقات الفاخرة المجمعة بأسعار حصرية وحملات الخصم الملكية المصممة لصفوة الذواقة.'
              : 'Discover curated flacon suites with exclusive bundle pricing and limited-time sovereign discount campaigns.'}
          </p>

          {/* Navigation Filter Tabs */}
          <div className="inline-flex p-1.5 rounded-2xl bg-black/50 border border-[#D4AF37]/30 backdrop-blur-md gap-1.5 mt-2">
            {[
              { id: 'ALL', label: language === 'ar' ? 'جميع العروض' : 'All Offers', count: displayBundles.length + displayPromotions.length },
              { id: 'BUNDLES', label: language === 'ar' ? 'باقات العطور' : 'Curated Bundles', count: displayBundles.length, icon: Package },
              { id: 'DISCOUNTS', label: language === 'ar' ? 'حملات الخصم' : 'Campaigns', count: displayPromotions.length, icon: Percent }
            ].map(tab => {
              const isSel = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-cinzel font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                    isSel
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#F2D675] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                      : 'text-[#D8BE99] hover:text-[#F3E6D0] hover:bg-white/5'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isSel ? 'bg-black/20 text-black' : 'bg-white/10 text-[#D4AF37]'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. CURATED BUNDLE SUITES SHOWCASE (AD GRID)                               */}
        {/* ========================================================================= */}
        {(activeTab === 'ALL' || activeTab === 'BUNDLES') && displayBundles.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-purple-400" />
                <h3 className={`font-cinzel text-lg sm:text-2xl font-bold uppercase tracking-wider ${
                  isDark ? 'text-[#F3E6D0]' : 'text-[#704622]'
                }`}>
                  {language === 'ar' ? 'باقات العطور المنسقة' : 'Curated Royal Flacon Suites'}
                </h3>
              </div>

              <Link
                to="/shop?category=bundles"
                className="text-xs font-cinzel font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
              >
                <span>{language === 'ar' ? 'استعراض كل الباقات' : 'Browse All Suites'}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {displayBundles.map((bundle) => {
                const hasDiscount = bundle.savingsAmount > 0;
                return (
                  <div
                    key={bundle.id}
                    className={`group relative rounded-2xl border-2 p-6 flex flex-col justify-between overflow-hidden transition-all duration-500 hover:-translate-y-2 ${
                      isDark
                        ? 'bg-gradient-to-br from-[#1A0E04] via-black/80 to-[#2A1507] border-[#D4AF37]/40 hover:border-[#F2D675] shadow-[0_10px_35px_rgba(0,0,0,0.8)] hover:shadow-[0_20px_50px_rgba(212,175,55,0.35)]'
                        : 'bg-[#FFFDF8] hover:bg-[#FDFBF7] border-[#A8853B]/30 hover:border-[#A8853B] shadow-[0_10px_30px_rgba(112,70,34,0.08)] hover:shadow-[0_15px_35px_rgba(112,70,34,0.15)]'
                    }`}
                  >
                    {/* Top Ad Banner Ribbon */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-800 to-purple-600 text-white font-cinzel font-bold text-[10px] uppercase tracking-widest shadow-md flex items-center gap-1.5">
                        <Gift className="w-3 h-3" />
                        <span>{language === 'ar' ? 'باقة عطور ملكية' : 'Curated Suite'}</span>
                      </span>

                      {hasDiscount && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-mono text-[11px] font-bold">
                          {bundle.savingsPercentage}% OFF
                        </span>
                      )}
                    </div>

                    {/* Bundle Presentation / Items Visual Gallery */}
                    <div
                      onClick={() => navigate(`/bundle/${bundle.id}`)}
                      className="cursor-pointer mb-5 p-4 rounded-xl bg-black/40 border border-white/10 relative overflow-hidden group-hover:border-[#D4AF37]/50 transition-colors"
                    >
                      <div className="flex items-center justify-center -space-x-4 sm:-space-x-6 py-2">
                        {bundle.items.slice(0, 3).map((item, idx) => (
                          <div
                            key={idx}
                            className="relative w-24 h-32 sm:w-28 sm:h-36 rounded-xl overflow-hidden bg-black/60 border border-purple-500/30 p-2 shadow-xl transform transition-transform group-hover:scale-105"
                            style={{ zIndex: 10 - idx }}
                          >
                            <img
                              src={item.imageUrl || '/products/luxury_designs/07_arabian_gold.webp'}
                              alt={item.productName}
                              className="w-full h-full object-contain filter drop-shadow-md"
                              loading="lazy"
                            />
                            {item.quantity > 1 && (
                              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-[#D4AF37] text-black font-mono text-[10px] font-extrabold shadow">
                                {item.quantity}x
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="text-center mt-3">
                        <span className="text-[11px] font-cinzel text-[#D8BE99] uppercase tracking-wider flex items-center justify-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{bundle.items.length} {language === 'ar' ? 'قوارير متضمنة • انقر للتفاصيل' : 'Creations Included • Click for Details'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Title & Promotion Source */}
                    <div className="space-y-2 mb-4">
                      {bundle.promotionName && (
                        <p className="text-[10px] uppercase font-cinzel tracking-widest text-[#D4AF37] font-bold">
                          {bundle.promotionName}
                        </p>
                      )}
                      <h4
                        onClick={() => navigate(`/bundle/${bundle.id}`)}
                        className={`font-cinzel text-lg sm:text-xl font-bold cursor-pointer transition-colors ${
                          isDark ? 'text-[#FFFDF8] group-hover:text-[#F2D675]' : 'text-[#704622] group-hover:text-[#A8853B]'
                        }`}
                      >
                        {bundle.name}
                      </h4>
                      <p className="text-xs text-[#D8BE99] line-clamp-2">
                        {language === 'ar'
                          ? `تشكيلة فاخرة تجمع بين ${bundle.items.map(i => i.productName).join(' و ')} في عبوة هدايا ملكية.`
                          : `An exclusive pairing uniting ${bundle.items.map(i => i.productName).join(' & ')} into a singular luxury presentation.`}
                      </p>
                    </div>

                    {/* Pricing & Economics Card */}
                    <div className="p-3.5 rounded-xl bg-black/60 border border-purple-500/20 mb-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#D8BE99] font-cinzel text-[11px]">{language === 'ar' ? 'سعر التجزئة الأصلي' : 'Retail Value:'}</span>
                        <span className="font-mono text-[#D8BE99] line-through">€{Number(bundle.originalItemsPrice || 0).toFixed(2)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-cinzel text-purple-300 font-bold block">
                            {language === 'ar' ? 'سعر الباقة الخاص' : 'Special Suite Price'}
                          </span>
                          <span className="font-cinzel text-2xl font-extrabold text-[#F2D675] drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]">
                            €{Number(bundle.bundlePrice || 0).toFixed(2)}
                          </span>
                        </div>

                        {bundle.savingsAmount > 0 && (
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-cinzel text-emerald-400 font-bold block">
                              {language === 'ar' ? 'وفر الآن' : 'You Save'}
                            </span>
                            <span className="font-mono text-sm font-bold text-emerald-400">
                              €{Number(bundle.savingsAmount).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/bundle/${bundle.id}`)}
                        className="px-3 py-2.5 rounded-xl border border-white/20 hover:border-[#D4AF37] text-xs font-cinzel font-bold uppercase text-[#D8BE99] hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'استعراض الباقة' : 'View Suite'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddBundleToCart(bundle)}
                        className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-purple-800 via-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-500 text-white font-cinzel font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-102 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'إضافة للحقيبة' : 'Add to Bag'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. DISCOUNT CAMPAIGNS SPOTLIGHT (AD BANNERS)                               */}
        {/* ========================================================================= */}
        {(activeTab === 'ALL' || activeTab === 'DISCOUNTS') && displayPromotions.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
              <div className="flex items-center gap-2.5">
                <Percent className="w-5 h-5 text-[#D4AF37]" />
                <h3 className={`font-cinzel text-lg sm:text-2xl font-bold uppercase tracking-wider ${
                  isDark ? 'text-[#F3E6D0]' : 'text-[#704622]'
                }`}>
                  {language === 'ar' ? 'حملات التخفيض الملكية الحية' : 'Active Sovereign Discount Campaigns'}
                </h3>
              </div>

              <Link
                to="/shop"
                className="text-xs font-cinzel font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
              >
                <span>{language === 'ar' ? 'تسوق جميع العطور' : 'Shop All Perfumes'}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayPromotions.map((promo) => {
                const discountText = promo.discountType === 'Fixed'
                  ? `€${promo.discountValue} OFF`
                  : `${promo.discountValue}% OFF`;

                return (
                  <div
                    key={promo.id}
                    className={`p-6 sm:p-8 rounded-2xl border-2 relative overflow-hidden flex flex-col justify-between gap-6 transition-all duration-300 ${
                      isDark
                        ? 'bg-gradient-to-br from-[#8C6239]/50 via-[#D4AF37]/20 to-[#3D250C]/60 border-[#D4AF37] shadow-[0_12px_40px_rgba(212,175,55,0.3)] hover:shadow-[0_20px_55px_rgba(212,175,55,0.5)]'
                        : 'bg-[#FFFDF8] hover:bg-[#FBF6EC] border-[#A8853B]/35 shadow-[0_10px_30px_rgba(112,70,34,0.08)]'
                    }`}
                  >
                    {/* Shimmer Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3.5 py-1 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-md shadow-md flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-900" />
                        <span>{discountText}</span>
                      </span>

                      <span className={`text-xs font-mono font-bold flex items-center gap-1 ${isDark ? 'text-[#FFDF8A]' : 'text-[#8A6540]'}`}>
                        <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{language === 'ar' ? 'حملة محدودة' : 'Limited Time Campaign'}</span>
                      </span>
                    </div>

                    {/* Campaign Headline */}
                    <div className="space-y-2">
                      <h4 className="font-cinzel text-xl sm:text-2xl font-bold text-[#F3E6D0]">
                        {promo.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-[#D8BE99] leading-relaxed">
                        {language === 'ar'
                          ? `خصم ملكي خاص بنسبة ${discountText} يطبق على العطور المختارة عند إتمام طلبك.`
                          : `Special royal celebration discount of ${discountText} applied at checkout on qualifying boutique flacons.`}
                      </p>
                    </div>

                    {/* Campaign Footer CTA */}
                    <div className="pt-4 border-t border-[#D4AF37]/30 flex items-center justify-between">
                      <div className="text-[11px] font-mono text-[#D8BE99]/70">
                        {promo.endDate && (
                          <span>{language === 'ar' ? 'ينتهي في:' : 'Valid until:'} {new Date(promo.endDate).toLocaleDateString()}</span>
                        )}
                      </div>

                      <button
                        onClick={() => navigate('/shop')}
                        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{language === 'ar' ? 'تسوق العرض الآن' : 'Shop Campaign'}</span>
                        <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. PALACE VOUCHER CODES SECTION                                           */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h4 className={`font-cinzel text-lg sm:text-xl font-bold uppercase tracking-wider ${
              isDark ? 'text-[#F3E6D0]' : 'text-[#704622]'
            }`}>
              {language === 'ar' ? 'قسائم التخفيض الفورية عند الدفع' : 'Instant Checkout Voucher Codes'}
            </h4>
            <p className="text-xs text-[#D8BE99]">
              {language === 'ar'
                ? 'انسخ كود الخصم وطبقه مباشرة في صفحة الدفع للاستفادة من المزايا الملكية.'
                : 'Copy any sovereign code and apply directly at checkout for immediate order savings.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {promoCodes.map((promo) => (
              <div
                key={promo.code}
                className={`p-6 sm:p-7 rounded-2xl border-2 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all duration-300 ${
                  isDark
                    ? 'bg-gradient-to-br from-[#D4AF37]/45 via-[#F2D675]/25 to-[#8C6239]/55 border-[#F2D675] shadow-[0_10px_35px_rgba(212,175,55,0.3)] hover:shadow-[0_15px_45px_rgba(242,214,117,0.5)]'
                    : 'bg-[#FFFDF8] hover:bg-[#FBF6EC] border-[#A8853B]/35 shadow-[0_10px_30px_rgba(112,70,34,0.08)]'
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
                  <div className="font-mono text-xl font-bold tracking-widest text-[#D4AF37] select-all">
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
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE BUNDLE SUITE QUICK-VIEW AD MODAL                           */}
      {/* ========================================================================= */}
      {selectedBundleModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#0B0A08] border border-purple-500/40 rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto my-auto text-[#F3E6D0]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="font-cinzel text-lg sm:text-xl font-bold uppercase tracking-wider text-[#F3E6D0]">
                    {selectedBundleModal.name}
                  </h3>
                  {selectedBundleModal.promotionName && (
                    <p className="text-[10px] text-[#D4AF37] font-cinzel uppercase font-bold">
                      {selectedBundleModal.promotionName}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBundleModal(null)}
                className="text-[#D8BE99] hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Included Flacons List */}
            <div className="space-y-3">
              <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#F2D675]">
                {language === 'ar' ? 'العطور الملكية المتضمنة في الباقة' : 'Flacons Included in this Suite'}
              </h4>

              <div className="space-y-2.5">
                {selectedBundleModal.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3.5 p-3 rounded-xl bg-black/60 border border-purple-500/20"
                  >
                    <div className="w-12 h-14 rounded-lg bg-black/80 border border-white/10 overflow-hidden p-1 shrink-0 flex items-center justify-center">
                      <img
                        src={item.imageUrl || '/products/luxury_designs/07_arabian_gold.webp'}
                        alt={item.productName}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-cinzel text-sm font-bold text-[#F3E6D0] truncate">
                        {item.productName}
                      </p>
                      <p className="text-[11px] text-[#D8BE99]/70">
                        {item.brandName || 'Arabian Sheikh'} • {language === 'ar' ? 'تركيز خالص' : 'Pure Extrait'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs text-[#D8BE99] block">
                        {item.quantity} × €{Number(item.unitPrice || 0).toFixed(2)}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#F2D675]">
                        €{(Number(item.unitPrice || 0) * (item.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Economics & Savings Breakdown */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-950/40 via-black/60 to-purple-950/20 border border-purple-500/40 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#D8BE99] font-cinzel">{language === 'ar' ? 'إجمالي قيمة التجزئة المنفردة:' : 'Combined Retail Value:'}</span>
                <span className="font-mono text-[#D8BE99] line-through">€{Number(selectedBundleModal.originalItemsPrice || 0).toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center border-t border-purple-500/20 pt-2 text-sm">
                <span className="text-purple-300 font-cinzel font-bold">{language === 'ar' ? 'سعر الباقة الخاص:' : 'Special Suite Price:'}</span>
                <span className="font-cinzel text-2xl font-extrabold text-[#F2D675]">
                  €{Number(selectedBundleModal.bundlePrice || 0).toFixed(2)}
                </span>
              </div>

              {selectedBundleModal.savingsAmount > 0 && (
                <div className="flex justify-between items-center text-xs text-emerald-400 font-bold border-t border-purple-500/20 pt-2">
                  <span>{language === 'ar' ? 'مجموع التوفير الفوري:' : 'Immediate Patron Savings:'}</span>
                  <span className="font-mono text-sm">
                    €{Number(selectedBundleModal.savingsAmount).toFixed(2)} ({selectedBundleModal.savingsPercentage}% OFF)
                  </span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#D4AF37]/20">
              <button
                type="button"
                onClick={() => setSelectedBundleModal(null)}
                className="px-5 py-2.5 rounded-full border border-white/20 text-xs font-cinzel uppercase text-[#D8BE99] hover:text-white transition-all cursor-pointer"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>

              <button
                type="button"
                onClick={() => {
                  const targetId = selectedBundleModal.id;
                  setSelectedBundleModal(null);
                  navigate(`/bundle/${targetId}`);
                }}
                className="px-5 py-2.5 rounded-full border border-[#D4AF37]/50 text-xs font-cinzel uppercase text-[#F2D675] hover:bg-[#D4AF37]/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'صفحة الباقة الكاملة' : 'Full Suite Page'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleAddBundleToCart(selectedBundleModal);
                  setSelectedBundleModal(null);
                }}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-800 via-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-500 text-white font-cinzel font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{language === 'ar' ? 'إضافة الباقة للحقيبة' : 'Claim Entire Suite Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
