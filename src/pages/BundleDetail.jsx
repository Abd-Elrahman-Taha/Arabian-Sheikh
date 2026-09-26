import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { promotionService } from '../services/promotionService';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import BlurText from '../components/common/BlurText';
import {
  Package,
  Gift,
  ShoppingBag,
  Star,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ChevronRight,
  Plus,
  Minus,
  Droplets,
  Layers,
  Crown,
  ArrowRight,
  Tag,
  Eye,
  Award
} from 'lucide-react';

export default function BundleDetail() {
  const { currentPath, navigate } = useRouter();
  const { t, language, isRtl } = useTranslation();
  const { isDark } = useTheme();
  const { addBundleToCart } = useCart();
  const { success, info } = useToast();

  const bundleId = currentPath.split('/bundle/')[1]?.split('/')[0]?.split('?')[0] ||
                   currentPath.split('/bundles/')[1]?.split('/')[0]?.split('?')[0];

  const [bundle, setBundle] = useState(null);
  const [allBundles, setAllBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('contents'); // 'contents' | 'experience' | 'guarantee'

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    let isMounted = true;

    async function loadBundleData() {
      setLoading(true);
      try {
        const [bundleData, bundlesList] = await Promise.all([
          promotionService.getPublicBundleById(bundleId),
          promotionService.getPublicBundles()
        ]);

        if (!isMounted) return;

        setAllBundles(Array.isArray(bundlesList) ? bundlesList : []);

        if (bundleData) {
          setBundle(bundleData);
        } else {
          // If not found in API, check if any existing bundle matches or create rich fallback
          const matching = (bundlesList || []).find(b => String(b.id) === String(bundleId));
          if (matching) {
            setBundle(matching);
          } else {
            // High-end fallback so the page never breaks
            const catalogProds = productService.getAllProductsSync().slice(0, 3);
            const p1 = catalogProds[0] || { id: 1, name: 'Imperial Oud Extrait', price: 65, imageUrl: '/products/luxury_designs/01_imperial_oud.webp' };
            const p2 = catalogProds[1] || { id: 2, name: 'Sovereign Taif Rose', price: 50, imageUrl: '/products/luxury_designs/02_sovereign_rose.webp' };
            const p3 = catalogProds[2] || { id: 3, name: 'Royal Amber Crystal', price: 45, imageUrl: '/products/luxury_designs/03_royal_amber.webp' };

            setBundle({
              id: bundleId || '1',
              name: language === 'ar' ? 'باقة الملوك الذهبية الفاخرة' : 'The Sovereign Imperial Trio',
              promotionName: language === 'ar' ? 'موسم المقتنيات الملكية الأندلسية' : 'Palace Sovereign Gala 2026',
              bundlePrice: 99,
              originalItemsPrice: (p1.price || 65) + (p2.price || 50) + (p3.price || 45),
              savingsAmount: ((p1.price || 65) + (p2.price || 50) + (p3.price || 45)) - 99,
              savingsPercentage: Math.round(((((p1.price || 65) + (p2.price || 50) + (p3.price || 45)) - 99) / ((p1.price || 65) + (p2.price || 50) + (p3.price || 45))) * 100),
              items: [
                { productId: p1.id, productName: p1.name, brandName: 'Arabian Sheikh', imageUrl: p1.imageUrl || p1.image, unitPrice: p1.price || 65, quantity: 1 },
                { productId: p2.id, productName: p2.name, brandName: 'Arabian Sheikh', imageUrl: p2.imageUrl || p2.image, unitPrice: p2.price || 50, quantity: 1 },
                { productId: p3.id, productName: p3.name, brandName: 'Arabian Sheikh', imageUrl: p3.imageUrl || p3.image, unitPrice: p3.price || 45, quantity: 1 }
              ]
            });
          }
        }
      } catch (err) {
        console.warn('Error loading bundle detail:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBundleData();

    return () => {
      isMounted = false;
    };
  }, [bundleId, language]);

  if (loading) {
    return (
      <div className="min-h-screen pt-36 pb-24 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_15px_rgba(212,175,55,0.4)]" />
          <p className="font-cinzel text-xs uppercase tracking-widest text-[#D4AF37]">
            {language === 'ar' ? 'جاري تحضير تفاصيل الباقة الملكية...' : 'Preparing Curated Royal Suite...'}
          </p>
        </div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="pt-36 pb-24 max-w-xl mx-auto px-4 text-center space-y-6">
        <h2 className="font-cinzel text-2xl font-bold">
          {language === 'ar' ? 'الباقة غير متاحة حالياً' : 'Curated Suite Not Found'}
        </h2>
        <Link to="/" className="luxury-btn-gold px-8 py-3.5 inline-block text-xs uppercase tracking-widest font-bold">
          {language === 'ar' ? 'العودة للصفحة الرئيسية' : 'Return to Palace Homepage'}
        </Link>
      </div>
    );
  }

  const items = bundle.items || [];
  const galleryImages = items.map(item => item.imageUrl).filter(Boolean);
  if (galleryImages.length === 0) {
    galleryImages.push('/products/luxury_designs/07_arabian_gold.webp');
  }

  const currentImage = galleryImages[selectedImageIndex] || galleryImages[0];
  const activeFlacon = items[selectedImageIndex] || items[0];

  const handleAddToCart = () => {
    addBundleToCart(bundle, quantity);
  };

  const handleBuyNow = () => {
    addBundleToCart(bundle, quantity);
    navigate('/checkout');
  };

  const relatedSuites = allBundles.filter(b => String(b.id) !== String(bundle.id)).slice(0, 3);

  return (
    <div className={`min-h-screen bg-transparent pt-28 sm:pt-32 pb-16 transition-colors duration-500 relative overflow-hidden ${
      isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
    }`}>
      <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10 space-y-12">
        
        {/* Breadcrumbs Navigation */}
        <div className={`flex items-center gap-2 text-xs font-cinzel uppercase tracking-wider ${
          isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'
        }`}>
          <Link to="/" className="hover:text-[#D4AF37] transition-colors">
            {t('nav.theHouse') || 'Home'}
          </Link>
          <ChevronRight className="w-3 h-3 rtl:rotate-180" />
          <Link to="/#palace-offers" className="hover:text-[#D4AF37] transition-colors">
            {language === 'ar' ? 'عروض وباقات القصر' : 'Palace Offers & Bundles'}
          </Link>
          <ChevronRight className="w-3 h-3 rtl:rotate-180" />
          <span className={`truncate max-w-xs font-semibold ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>
            {bundle.name}
          </span>
        </div>

        {/* Master Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Visual Flacon Presentation Gallery */}
          <div className="lg:col-span-6 space-y-5">
            
            {/* Main Stage Presentation Container */}
            <div className={`relative aspect-[3/4] p-6 flex flex-col items-center justify-between overflow-hidden rounded-3xl border-2 transition-all duration-500 ${
              isDark
                ? 'bg-gradient-to-b from-[#180F08] via-[#0B0A08] to-[#120B06] border-[#D4AF37]/35 shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
                : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/50 shadow-[0_20px_50px_rgba(212,175,55,0.25)]'
            }`}>
              {/* Luxury Ambient Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(212,175,55,0.15),transparent_60%)] pointer-events-none" />

              {/* Top Sovereign Badges Ribbon */}
              <div className="w-full flex items-center justify-between relative z-10">
                <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#D4AF37] text-black font-cinzel font-extrabold text-xs uppercase tracking-widest shadow-md flex items-center gap-1.5 border border-[#FFFDF8]/40">
                  <Crown className="w-3.5 h-3.5 text-black" />
                  <span>{language === 'ar' ? 'باقة ملكية منسقة' : 'Curated Royal Suite'}</span>
                </span>

                {bundle.savingsAmount > 0 && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 font-mono text-xs font-bold shadow-sm">
                    {language === 'ar' ? `وفر ${bundle.savingsPercentage}%` : `SAVE ${bundle.savingsPercentage}%`}
                  </span>
                )}
              </div>

              {/* Big Center Flacon Artwork */}
              <div className="relative w-full flex-1 flex items-center justify-center p-4">
                <img
                  src={currentImage}
                  alt={activeFlacon?.productName || bundle.name}
                  className="max-h-[70vh] w-auto object-contain filter drop-shadow-[0_25px_45px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform duration-700 select-none"
                />
              </div>

              {/* Bottom Active Flacon Name Pill */}
              {activeFlacon && (
                <div className="relative z-10 w-full text-center">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-black/60 border border-[#D4AF37]/40 text-[#F2D675] font-cinzel text-xs uppercase font-bold tracking-wider backdrop-blur-md">
                    {activeFlacon.productName} • {activeFlacon.quantity}x {activeFlacon.brandName || 'Arabian Sheikh'}
                  </span>
                </div>
              )}
            </div>

            {/* Included Flacons Thumbnail Gallery Selector */}
            <div className="space-y-2">
              <span className={`text-[11px] font-cinzel uppercase tracking-widest font-bold block ${
                isDark ? 'text-[#D8BE99]' : 'text-[#8C6239]'
              }`}>
                {language === 'ar' ? 'استعرض قوارير الباقة المتضمنة:' : 'Preview Included Flacons in this Suite:'}
              </span>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {items.map((item, idx) => {
                  const isSelected = selectedImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`group relative p-2 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 text-center cursor-pointer overflow-hidden ${
                        isSelected
                          ? 'border-[#D4AF37] bg-[#D4AF37]/20 ring-2 ring-[#D4AF37]/50 shadow-md'
                          : isDark
                          ? 'border-white/10 bg-black/40 hover:border-[#D4AF37]/50'
                          : 'border-[#D4AF37]/30 bg-white/70 hover:border-[#D4AF37]'
                      }`}
                    >
                      <div className="w-12 h-16 sm:w-14 sm:h-18 flex items-center justify-center">
                        <img
                          src={item.imageUrl || '/products/luxury_designs/07_arabian_gold.webp'}
                          alt={item.productName}
                          className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <span className="font-cinzel text-[10px] font-bold truncate w-full block">
                        {item.productName}
                      </span>
                      <span className="font-mono text-[9px] text-[#D4AF37] font-bold">
                        {item.quantity}x
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Suite Economics, Details & Sovereign Bag Controls */}
          <div className="lg:col-span-6 space-y-7">
            
            {/* Header / Brand / Title */}
            <div className="space-y-3">
              <div className={`flex items-center gap-3 text-xs uppercase tracking-[0.25em] font-cinzel font-bold ${
                isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
              }`}>
                <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>PALACE CURATED COLLECTION</span>
                <span>•</span>
                <span>HAUTE PARFUMERIE SUITE</span>
              </div>

              <BlurText
                key={bundle.name}
                text={bundle.name}
                delay={60}
                animateBy="words"
                direction="top"
                className={`text-3xl sm:text-4xl lg:text-5xl font-cinzel font-bold leading-tight ${
                  isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
                }`}
                as="h1"
              />

              {bundle.promotionName && (
                <p className="text-xs uppercase font-cinzel tracking-widest text-[#D4AF37] font-bold">
                  {bundle.promotionName}
                </p>
              )}

              {/* Rating & Suite Quality */}
              <div className="flex items-center gap-3 text-xs pt-1">
                <div className="flex gap-1 text-[#D4AF37]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className={`font-bold ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>
                  5.0
                </span>
                <span className="text-neutral-400">•</span>
                <span className={isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}>
                  {items.length} {language === 'ar' ? 'قوارير متناغمة منسقة' : 'Harmonized Royal Flacons'}
                </span>
              </div>
            </div>

            {/* Pricing Breakdown Card */}
            <div className={`p-6 rounded-3xl border-2 space-y-4 ${
              isDark
                ? 'bg-gradient-to-br from-[#1F1208] via-black/90 to-[#2A1507] border-[#D4AF37]/40 shadow-xl'
                : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/60 shadow-[0_15px_40px_rgba(212,175,55,0.2)]'
            }`}>
              <div className="flex flex-wrap items-baseline gap-4">
                <span className="font-cinzel text-4xl sm:text-5xl font-extrabold text-[#D4AF37]">
                  €{Number(bundle.bundlePrice || 0).toFixed(2)}
                </span>

                {bundle.originalItemsPrice > bundle.bundlePrice && (
                  <div className="space-y-0.5">
                    <span className="text-sm sm:text-base line-through text-neutral-400 font-mono block">
                      €{Number(bundle.originalItemsPrice).toFixed(2)}
                    </span>
                    <span className="text-[10px] uppercase font-cinzel tracking-wider text-[#D8BE99]">
                      {language === 'ar' ? 'إجمالي سعر التجزئة المنفرد' : 'Combined Retail Value'}
                    </span>
                  </div>
                )}
              </div>

              {bundle.savingsAmount > 0 && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'ar' ? 'مجموع توفيرك الفوري في هذه الباقة:' : 'Your Immediate Patron Savings:'}</span>
                  </span>
                  <span className="font-mono text-sm">
                    €{Number(bundle.savingsAmount).toFixed(2)} ({bundle.savingsPercentage}% OFF)
                  </span>
                </div>
              )}

              <p className={`text-[11px] font-sans ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>
                {language === 'ar'
                  ? 'السعر يشمل ضريبة القيمة المضافة والشحن الملكي السريع المؤمن عبر DHL Express.'
                  : 'Includes all applicable taxes and complimentary insured priority delivery by DHL Express.'}
              </p>
            </div>

            {/* Included Suite Contents Quick Glance */}
            <div className="space-y-3">
              <label className={`text-xs uppercase tracking-widest font-cinzel font-bold flex items-center gap-2 ${
                isDark ? 'text-[#D8BE99]' : 'text-[#8C6239]'
              }`}>
                <Package className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{language === 'ar' ? 'قوارير هذه الباقة:' : 'Creations Comprising This Suite:'}</span>
              </label>

              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                      isDark
                        ? 'bg-black/50 border-white/10'
                        : 'bg-white/80 border-[#D4AF37]/30 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 rounded-lg bg-black/60 border border-white/10 overflow-hidden p-1 flex items-center justify-center shrink-0">
                        <img
                          src={item.imageUrl || '/products/luxury_designs/07_arabian_gold.webp'}
                          alt={item.productName}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <h4 className="font-cinzel text-xs font-bold line-clamp-1">
                          {item.productName}
                        </h4>
                        <p className={`text-[10px] ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>
                          {item.brandName || 'Arabian Sheikh'} • 60 ml Extrait
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs font-bold text-[#D4AF37]">
                        {item.quantity}x
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity Selector & Action Controls */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                {/* Quantity Controls */}
                <div className={`flex items-center border rounded-full ${
                  isDark ? 'border-[#D4AF37]/40 bg-black/60' : 'border-[#D4AF37]/50 bg-white shadow-sm'
                }`}>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className={`p-3 transition-colors ${
                      isDark ? 'text-[#F3E6D0] hover:text-[#D4AF37]' : 'text-[#120B06] hover:text-[#D4AF37]'
                    } cursor-pointer`}
                    aria-label="Decrease bundle quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-mono font-bold text-[#D4AF37]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className={`p-3 transition-colors ${
                      isDark ? 'text-[#F3E6D0] hover:text-[#D4AF37]' : 'text-[#120B06] hover:text-[#D4AF37]'
                    } cursor-pointer`}
                    aria-label="Increase bundle quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Bag Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="group/btn relative flex-1 py-4 px-6 rounded-full font-cinzel font-bold text-xs uppercase tracking-[0.22em] flex items-center justify-center gap-2.5 transition-all duration-400 overflow-hidden cursor-pointer bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#D4AF37] hover:brightness-110 text-black border border-[#FFFDF8]/40 shadow-[0_10px_30px_rgba(212,175,55,0.4)] hover:scale-[1.02]"
                >
                  <ShoppingBag className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover/btn:scale-110 text-black" />
                  <span className="relative z-10 font-extrabold">
                    {language === 'ar'
                      ? `إضافة الباقة للحقيبة • €${(bundle.bundlePrice * quantity).toFixed(2)}`
                      : `Add Royal Suite to Bag • €${(bundle.bundlePrice * quantity).toFixed(2)}`}
                  </span>
                </button>
              </div>

              {/* Instant Express Checkout Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                className={`group/btn relative w-full py-3.5 px-6 rounded-full border font-cinzel font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-sm hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2 ${
                  isDark
                    ? 'bg-[#0B0A08]/90 hover:bg-[#21130D] border-[#D4AF37]/45 text-[#F3E6D0] hover:text-[#F2D675]'
                    : 'bg-[#FAF7F2] hover:bg-[#F0E8DC] border-[#D4AF37]/40 text-[#120B06] hover:text-[#B8860B]'
                }`}
              >
                <span>{language === 'ar' ? 'شراء فوري مباشر للباقة' : 'Instant Express Suite Checkout'}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1 rtl:rotate-180" />
              </button>
            </div>

            {/* Sovereign Guarantees Card */}
            <div className={`p-5 border-2 rounded-2xl space-y-2.5 text-xs ${
              isDark
                ? 'bg-[#0B0A08] border-white/10 text-[#D8BE99]'
                : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/45 text-[#2C180F] shadow-[0_10px_30px_rgba(212,175,55,0.18)]'
            }`}>
              <div className={`flex items-center gap-2.5 ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>
                <Truck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>
                  <strong>DHL Express:</strong> {t('confirmation.deliveryDays') || 'Estimated Delivery in 2-4 Business Days'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>
                  {language === 'ar'
                    ? 'ضمان الأصالة الملكية بنسبة 100% لجميع العطور المتضمنة'
                    : '100% Sovereign Authenticity Guarantee for All Included Extraits'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>
                  {language === 'ar'
                    ? 'علبة هدايا ملكية فاخرة مختومة بالشمع الذهبي'
                    : 'Presented in Hand-Crafted Velvet Vault Box with Royal Seal'}
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* LOWER SECTION: TABS (CONTENTS, OLFACTORY HARMONY, GUARANTEE)               */}
        {/* ========================================================================= */}
        <div className="border-t border-[#D4AF37]/20 pt-10 space-y-8">
          
          {/* Tabs Switcher */}
          <div className="flex justify-center border-b border-black/10 dark:border-white/10 pb-1">
            <div className="flex gap-4 sm:gap-8 text-xs uppercase font-cinzel tracking-[0.25em]">
              <button
                type="button"
                onClick={() => setActiveTab('contents')}
                className={`pb-3 border-b-2 transition-colors font-bold cursor-pointer flex items-center gap-2 ${
                  activeTab === 'contents'
                    ? 'border-[#D4AF37] text-[#D4AF37]'
                    : isDark ? 'border-transparent text-[#D8BE99]' : 'border-transparent text-[#5A3517]'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'محتويات الباقة بالتفصيل' : 'Suite Creations Breakdown'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('experience')}
                className={`pb-3 border-b-2 transition-colors font-bold cursor-pointer flex items-center gap-2 ${
                  activeTab === 'experience'
                    ? 'border-[#D4AF37] text-[#D4AF37]'
                    : isDark ? 'border-transparent text-[#D8BE99]' : 'border-transparent text-[#5A3517]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'التناغم العطري والطبقات' : 'Olfactory Harmony'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('guarantee')}
                className={`pb-3 border-b-2 transition-colors font-bold cursor-pointer flex items-center gap-2 ${
                  activeTab === 'guarantee'
                    ? 'border-[#D4AF37] text-[#D4AF37]'
                    : isDark ? 'border-transparent text-[#D8BE99]' : 'border-transparent text-[#5A3517]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'تغليف القصر والتوصيل' : 'Vault Dispatch'}</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Detailed Items Breakdown */}
          {activeTab === 'contents' && (
            <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-6 rounded-3xl border-2 flex flex-col justify-between space-y-4 transition-all duration-300 ${
                      isDark
                        ? 'bg-[#140C07]/80 border-[#D4AF37]/25 hover:border-[#D4AF37]'
                        : 'bg-white border-[#D4AF37]/35 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <div className="aspect-[3/4] rounded-2xl bg-black/40 border border-white/10 p-4 flex items-center justify-center overflow-hidden">
                      <img
                        src={item.imageUrl || '/products/luxury_designs/07_arabian_gold.webp'}
                        alt={item.productName}
                        className="w-full h-full object-contain filter drop-shadow-md hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <span className="text-[10px] uppercase font-cinzel tracking-widest text-[#D4AF37] font-bold">
                        {item.brandName || 'Arabian Sheikh'}
                      </span>
                      <h3 className="font-cinzel text-base font-bold">
                        {item.productName}
                      </h3>
                      <p className={`text-xs ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>
                        {language === 'ar'
                          ? 'تركيز خالص: إكستري دو بارفان (60 مل)'
                          : 'Concentration: Extrait de Parfum (60 ml / 2.0 fl oz)'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#D4AF37]/20 flex items-center justify-between">
                      <span className="font-mono text-xs text-[#D8BE99]">
                        {item.quantity}x {language === 'ar' ? 'قارورة' : 'Flacon'}
                      </span>
                      {item.productId && (
                        <Link
                          to={`/product/${item.productId}`}
                          className="text-xs font-cinzel font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
                        >
                          <span>{language === 'ar' ? 'استعراض العطر' : 'View Flacon'}</span>
                          <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Olfactory Harmony & Layering */}
          {activeTab === 'experience' && (
            <div className="max-w-4xl mx-auto space-y-6 text-center animate-fade-in">
              <div className={`p-8 rounded-3xl border-2 space-y-4 ${
                isDark
                  ? 'bg-[#140C07]/80 border-[#D4AF37]/30'
                  : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/50 shadow-md'
              }`}>
                <Crown className="w-8 h-8 text-[#D4AF37] mx-auto" />
                <h3 className="font-cinzel text-xl font-bold uppercase tracking-wider text-[#F2D675]">
                  {language === 'ar' ? 'رحلة التناغم العطري الملكي' : 'The Art of Sovereign Fragrance Layering'}
                </h3>
                <p className={`text-sm leading-relaxed max-w-2xl mx-auto ${
                  isDark ? 'text-[#D8BE99]' : 'text-[#3A2116]'
                }`}>
                  {language === 'ar'
                    ? 'تم اختيار وتركيب عطور هذه الباقة بعناية فائقة لتتكامل نوتاتها الشرقية من العود والعنبر والورد الملكي. يمكنك ارتداء كل عطر بمفرده حسب أوقات اليوم، أو دمج رشات متناغمة منها لخلق بصمة عطرية خاصة وفريدة تعكس الفخامة المطلقة.'
                    : 'Each flacon in this suite was meticulously harmonized to complement and amplify one another. Wear them individually to mark transitions throughout the day, or layer complementary sprays to curate a personalized olfactory aura of distinction.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Vault Dispatch & Assurance */}
          {activeTab === 'guarantee' && (
            <div className="max-w-4xl mx-auto space-y-6 text-center animate-fade-in">
              <div className={`p-8 rounded-3xl border-2 space-y-4 ${
                isDark
                  ? 'bg-[#140C07]/80 border-[#D4AF37]/30'
                  : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/50 shadow-md'
              }`}>
                <ShieldCheck className="w-8 h-8 text-[#D4AF37] mx-auto" />
                <h3 className="font-cinzel text-xl font-bold uppercase tracking-wider text-[#F2D675]">
                  {language === 'ar' ? 'تغليف الخزائن الملكية والشحن المضمون' : 'Palace Vault Packaging & Secure Air Transit'}
                </h3>
                <p className={`text-sm leading-relaxed max-w-2xl mx-auto ${
                  isDark ? 'text-[#D8BE99]' : 'text-[#3A2116]'
                }`}>
                  {language === 'ar'
                    ? 'تصلك باقتك مغلفة في صندوق مخملي فاخر ومحكم الإغلاق بختم الشمع الملكي، مصحوبة بشهادة أصالة معتمدة لكل قارورة عطر، ومشحونة عبر خدمة الشحن الجوي السريع في حاويات مبردة للحفاظ على نقاء وثبات الزيوت العطرية النقية.'
                    : 'Every curated suite arrives in an embossed royal velvet vault box, sealed with golden wax and accompanied by an authenticated certificate of origin. Dispatched in temperature-stable priority freight via DHL Express.'}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* BOTTOM SECTION: EXPLORE OTHER CURATED SUITES                               */}
        {/* ========================================================================= */}
        {relatedSuites.length > 0 && (
          <div className="border-t border-[#D4AF37]/20 pt-14 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold uppercase tracking-wider text-[#F2D675]">
                {language === 'ar' ? 'باقات ملكية أخرى قد تنال إعجابك' : 'Other Curated Royal Suites'}
              </h3>
              <Link
                to="/#palace-offers"
                className="text-xs font-cinzel font-bold text-[#D4AF37] hover:underline flex items-center gap-1"
              >
                <span>{language === 'ar' ? 'كل الباقات' : 'All Suites'}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedSuites.map((relBundle) => (
                <Link
                  key={relBundle.id}
                  to={`/bundle/${relBundle.id}`}
                  className={`group p-5 rounded-2xl border-2 transition-all duration-300 block ${
                    isDark
                      ? 'bg-black/60 border-[#D4AF37]/30 hover:border-[#F2D675] shadow-lg'
                      : 'bg-white border-[#D4AF37]/40 hover:border-[#D4AF37] shadow-md'
                  }`}
                >
                  <div className="aspect-[4/3] rounded-xl bg-black/40 border border-white/10 p-3 flex items-center justify-center mb-4 overflow-hidden">
                    <img
                      src={relBundle.items?.[0]?.imageUrl || '/products/luxury_designs/07_arabian_gold.webp'}
                      alt={relBundle.name}
                      className="w-full h-full object-contain filter drop-shadow group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <span className="text-[10px] uppercase font-cinzel tracking-widest text-[#D4AF37] font-bold block mb-1">
                    {relBundle.items?.length || 2} {language === 'ar' ? 'قوارير متضمنة' : 'Creations Suite'}
                  </span>

                  <h4 className="font-cinzel text-sm font-bold truncate group-hover:text-[#F2D675] transition-colors">
                    {relBundle.name}
                  </h4>

                  <div className="flex items-baseline justify-between pt-3 mt-3 border-t border-[#D4AF37]/20">
                    <span className="font-cinzel text-base font-bold text-[#D4AF37]">
                      €{Number(relBundle.bundlePrice || 0).toFixed(2)}
                    </span>
                    <span className="text-[11px] font-cinzel text-[#D8BE99] group-hover:underline flex items-center gap-1">
                      <span>{language === 'ar' ? 'استعراض الباقة' : 'View Suite'}</span>
                      <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
