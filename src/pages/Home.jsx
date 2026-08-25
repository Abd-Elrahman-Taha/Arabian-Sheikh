import React, { useState, useEffect, useRef } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import ArabianLogo from '../components/common/ArabianLogo';
import Hero2DFlaconShowcase from '../components/home/Hero2DFlaconShowcase';
import PalaceMemoryVideo from '../components/media/PalaceMemoryVideo';
import OttomanEightStar from '../components/motion/OttomanEightStar';
import HorizontalCollectionShowcase from '../components/home/HorizontalCollectionShowcase';
import TopSellingShowcase from '../components/home/TopSellingShowcase';
import OffersDiscountSection from '../components/home/OffersDiscountSection';
import BlurText from '../components/common/BlurText';
import HeroRulerPagination from '../components/home/HeroRulerPagination';
import AnimatedCounter from '../components/common/AnimatedCounter';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Crown,
  Droplets,
  Star,
  Check,
  Clock,
  Compass,
  ShoppingBag,
  Heart,
  ChevronRight,
  ChevronDown,
  Flame,
  Feather,
  Sun,
  Truck,
  RotateCcw,
  Lock,
  Layers
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { navigate } = useRouter();
  const { t, language } = useTranslation();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isDark } = useTheme();

  // 3D Hero active flacon (0: Luxury Arabian Gold, 1: Royal Millionaire, 2: Classic Ana Sukkar)
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [allProducts, setAllProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fragrance discovery quick filter state
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedFamily, setSelectedFamily] = useState('all');
  const [selectedOccasion, setSelectedOccasion] = useState('all');

  const firstCollectionRef = useRef(null);

  const heroFlacons = [
    {
      id: 'as-luxury-arabian-gold',
      slug: 'arabian-gold-luxury',
      tier: 'Luxury',
      name: 'Arabian Gold Sovereign',
      arabicName: 'ذهب عربي سيادي',
      spanishName: 'Arabian Gold Sovereign',
      bulgarianName: 'Арабско Злато',
      price: 55,
      size: '60 ml / 2.0 fl oz',
      tagline: 'Liquid 24K gold distilled with precious Assam agarwood, sparkling diamond accord, and royal amber.',
      spanishTagline: 'Oro líquido de 24K con maderas preciosas de Assam y ámbar real.',
      notes: 'Kashmiri Saffron • Wild Assamese Oud • Ambergris • Taif Royal Rose',
      color: '#D4AF37',
      image: '/products/black_diamond_flacon.webp'
    },
    {
      id: 'as-royal-millionaire',
      slug: 'millionaire-royal',
      tier: 'Royal',
      name: 'Millionaire',
      arabicName: 'مليونير',
      spanishName: 'Millionaire',
      bulgarianName: 'Милионер',
      price: 40,
      size: '60 ml / 2.0 fl oz',
      tagline: 'Dark charisma, power, and magnetic sophistication with noble woods and spiced warmth.',
      spanishTagline: 'Carisma oscuro, poder y sofisticación magnética con maderas nobles.',
      notes: 'Cardamom Infusion • Smoky Leather Accord • Aged Sandalwood • Warm Amber',
      color: '#F2D675',
      image: '/products/millionaire_flacon.webp'
    },
    {
      id: 'as-classic-ana-sukkar',
      slug: 'ana-sukkar-classic',
      tier: 'Classic',
      name: 'Ana Sukkar',
      arabicName: 'أنا سكر',
      spanishName: 'Ana Sukkar',
      bulgarianName: 'Ана Сукар',
      price: 30,
      size: '60 ml / 2.0 fl oz',
      tagline: 'Velvety sweetness, delicate petals, spun sugar, and comforting Madagascar vanilla.',
      spanishTagline: 'Dulzura aterciopelada, pétalos delicados, azúcar hilado y vainilla de Madagascar.',
      notes: 'Spun Sugar Nectar • Orange Blossom Petals • Gourmet Vanilla Cream • White Musk',
      color: '#ECC557',
      image: '/products/ana_sukkar_flacon.webp'
    }
  ];

  const stats = [
    {
      target: 46,
      suffix: '+',
      label: language === 'ar' ? 'تحفة عطرية استثنائية' : 'Haute Parfumerie Masterpieces',
      sub: language === 'ar' ? 'عطور، دهن عود، وبخور ملكي' : 'Extraits, Oils & Rare Bakhoor'
    },
    {
      target: 35,
      suffix: '%',
      label: language === 'ar' ? 'تركيز الزيوت الخالصة' : 'Pure Extrait Concentration',
      sub: language === 'ar' ? 'أعلى درجات الفوحان والثبات' : 'Uncompromising Sillage'
    },
    {
      target: 60,
      suffix: '+',
      label: language === 'ar' ? 'عاماً عمر أشجار العود' : 'Years Wild Agarwood Age',
      sub: language === 'ar' ? 'تقطير نحاسي بطيء وأصيل' : 'Slow Copper Artisanal Stills'
    },
    {
      target: 18,
      suffix: 'h+',
      label: language === 'ar' ? 'ثبات متواصل على البشرة' : 'Continuous Skin Longevity',
      sub: language === 'ar' ? 'أثر ملكي لا يُمحى' : 'Lasting Sovereign Presence'
    }
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const prods = await productService.getAllProducts();
        setAllProducts(prods);

        // Group products into rich curated Collections
        const imperialTiersProducts = prods.filter(p => p.tier === 'Luxury' || p.tier === 'Royal' || p.tier === 'Classic');
        const oudAmberProducts = prods.filter(p => 
          p.fragranceFamily?.toLowerCase().includes('woody') || 
          p.fragranceFamily?.toLowerCase().includes('amber') || 
          p.scentFamily?.toLowerCase().includes('oriental') ||
          p.topNotes?.some(n => n.toLowerCase().includes('oud') || n.toLowerCase().includes('amber'))
        );
        const floralGourmandProducts = prods.filter(p =>
          p.fragranceFamily?.toLowerCase().includes('floral') ||
          p.scentFamily?.toLowerCase().includes('gourmand') ||
          p.scentFamily?.toLowerCase().includes('rose') ||
          p.scentFamily?.toLowerCase().includes('sweet')
        );
        const freshCitrusProducts = prods.filter(p =>
          p.fragranceFamily?.toLowerCase().includes('fresh') ||
          p.scentFamily?.toLowerCase().includes('citrus') ||
          p.scentFamily?.toLowerCase().includes('green')
        );
        const bakhoorProducts = prods.filter(p => p.category === 'bakhoor' || p.scentFamily?.toLowerCase().includes('incense'));
        const oilsProducts = prods.filter(p => p.category === 'oils' || p.size?.includes('12 ml') || p.name?.toLowerCase().includes('oil') || p.name?.toLowerCase().includes('attar'));
        const bundlesProducts = prods.filter(p => p.category === 'bundles' || p.size?.includes('Set') || p.size?.includes('Full Set'));

        const curatedCollections = [
          {
            id: 'col-imperial-tiers',
            number: 1,
            title: 'The Imperial Tiers',
            spanishTitle: 'Gamas Imperiales',
            bulgarianTitle: 'Имперски Нива',
            tag: '60ML EXTRAITS DE PARFUM',
            description: 'Our hallmark extraits bottled in numbered flacons with gold and obsidian silhouettes.',
            spanishDescription: 'Nuestros extraits emblemáticos embotellados en frascos numerados de 60 ml.',
            bulgarianDescription: 'Нашите емблематични екстракти в номерирани флакони от 60 мл.',
            accentColor: '#D4AF37',
            products: imperialTiersProducts.length > 0 ? imperialTiersProducts : prods
          },
          {
            id: 'col-oud-amber',
            number: 2,
            title: 'Royal Oud & Amber Reserve',
            spanishTitle: 'Reserva Real de Oud y Ámbar',
            bulgarianTitle: 'Кралски Уд и Кехлибар',
            tag: 'AGED AGARWOOD & AMBERGRIS',
            description: 'Deep resinous distillations from rare Assamese and Cambodian agarwood.',
            spanishDescription: 'Destilaciones resinosas de madera de agar rara de Assam y Camboya.',
            bulgarianDescription: 'Смолисти дестилации от рядък агарово дърво от Асам и Камбоджа.',
            accentColor: '#D4AF37',
            products: oudAmberProducts.length > 0 ? oudAmberProducts : prods
          },
          {
            id: 'col-floral-gourmand',
            number: 3,
            title: 'Floral & Gourmand Delights',
            spanishTitle: 'Delicias Florales y Gourmand',
            bulgarianTitle: 'Цветни и Гурме Изкушения',
            tag: 'TURKISH ROSES & VANILLA',
            description: 'Intoxicating Damask roses, Sicilian pistachios, candied fruits, and royal vanilla.',
            spanishDescription: 'Rosas de Damasco, pistacho siciliano y vainilla real.',
            bulgarianDescription: 'Дамаски рози, сицилиански шамфъстък и кралска ванилия.',
            accentColor: '#F2D675',
            products: floralGourmandProducts.length > 0 ? floralGourmandProducts : prods
          },
          {
            id: 'col-fresh-citrus',
            number: 4,
            title: 'Fresh & Citrus Sovereigns',
            spanishTitle: 'Frescura y Cítricos Nobles',
            bulgarianTitle: 'Свежи и Цитрусови Аромати',
            tag: 'MEDITERRANEAN CITRUS & WOODS',
            description: 'Calabrian bergamot, fresh ginger, ocean salt breeze, and crisp mountain woods.',
            spanishDescription: 'Bergamota de Calabria, jengibre fresco y maderas nobles.',
            bulgarianDescription: 'Калабрийски бергамот, пресен джинджифил и свежи гори.',
            accentColor: '#D8BE99',
            products: freshCitrusProducts.length > 0 ? freshCitrusProducts : prods
          },
          {
            id: 'col-bakhoor',
            number: 5,
            title: 'Sacred Bakhoor & Incense',
            spanishTitle: 'Bakhoor e Incienso Sagrado',
            bulgarianTitle: 'Бахур и Свещен Тамян',
            tag: 'PALACE MAJLIS RITUALS',
            description: 'Hand-soaked natural chips infused with Taif rose and amber resins.',
            spanishDescription: 'Virutas naturales infusionadas a mano con rosa de Taif y resinas de ámbar.',
            bulgarianDescription: 'Напоени дървесни частици с роза Таиф и кехлибар.',
            accentColor: '#F2D675',
            products: bakhoorProducts.length > 0 ? bakhoorProducts : prods
          },
          {
            id: 'col-pure-oils',
            number: 6,
            title: 'Concentrated Attars & Oils',
            spanishTitle: 'Attars y Aceites Puros',
            bulgarianTitle: 'Чисти Масла и Атари',
            tag: 'ALCOHOL-FREE PURE EXTRACTS',
            description: '100% pure alcohol-free concentrated oils offering an intimate 24+ hour sillage.',
            spanishDescription: 'Aceites puros concentrados sin alcohol con estela continua de 24+ horas.',
            bulgarianDescription: '100% чисти концентрирани масла без алкохол с трайност 24+ часа.',
            accentColor: '#D8BE99',
            products: oilsProducts.length > 0 ? oilsProducts : prods
          },
          {
            id: 'col-palace-bundles',
            number: 7,
            title: 'Palace Coffrets & Sets',
            spanishTitle: 'Estuches Exclusivos',
            bulgarianTitle: 'Дворцови Комплекти',
            tag: 'LIMITED PRESENTATION BOXES',
            description: 'Bespoke presentations encased in velvet-lined lacquer coffrets.',
            spanishDescription: 'Presentaciones exclusivas en estuches lacados de terciopelo.',
            bulgarianDescription: 'Специални сетове в лакирани кутии с кадифе.',
            accentColor: '#D4AF37',
            products: bundlesProducts.length > 0 ? bundlesProducts : prods
          }
        ];

        setCollections(curatedCollections);
      } catch (err) {
        console.error('Error loading home collections data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const currentHeroFlacon = heroFlacons[activeHeroIndex];
  const nextHeroIndex = (activeHeroIndex + 1) % heroFlacons.length;
  const nextHeroFlacon = heroFlacons[nextHeroIndex];

  const getDisplayName = (item) => {
    if (!item) return '';
    if (language === 'ar') return item.arabicName || item.name;
    if (language === 'es') return item.spanishName || item.name;
    if (language === 'bg') return item.bulgarianName || item.name;
    return item.name;
  };

  const getTagline = (item) => {
    if (!item) return '';
    if (language === 'es') return item.spanishTagline || item.tagline;
    return item.tagline;
  };

  // Discovery filtered list
  const discoveryMatches = allProducts.filter(p => {
    if (selectedGender !== 'all' && p.gender?.toLowerCase() !== selectedGender.toLowerCase() && p.gender !== 'Unisex') return false;
    if (selectedFamily !== 'all' && !p.fragranceFamily?.toLowerCase().includes(selectedFamily.toLowerCase())) return false;
    if (selectedOccasion !== 'all' && !p.occasion?.some(o => o.toLowerCase().includes(selectedOccasion.toLowerCase()))) return false;
    return true;
  });

  const scrollToCollections = () => {
    if (firstCollectionRef.current) {
      firstCollectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`w-full bg-transparent overflow-x-hidden transition-colors duration-500 ${
      isDark ? 'text-[#F3E6D0]' : 'text-[#21130D]'
    }`}>
      
      {/* =========================================================================
          1. HERO SECTION: CENTERED PRODUCT WITH GOLDEN SHADER & BLURRED GRADIENT AURA
          ========================================================================= */}
      <section className="relative min-h-[86vh] lg:min-h-[90vh] flex flex-col justify-between overflow-hidden pt-20 sm:pt-24 lg:pt-28 pb-0">
        
        {/* Clean, Smooth, Noise-Free Luxury Background with Radiant Top-Left & Bottom-Right Shaders */}
        <div className={`absolute inset-0 z-0 pointer-events-none overflow-hidden transition-colors duration-700 ${
          isDark ? 'bg-[#0B0A08]' : 'bg-[#F3E6D0]'
        }`}>
          <div className={`absolute inset-0 transition-opacity duration-700 ${
            isDark
              ? 'bg-gradient-to-b from-[#140D07] via-[#0B0A08] to-[#0B0A08]'
              : 'bg-gradient-to-b from-[#FAF6F0] via-[#F3E6D0] to-[#E8D9C2]'
          }`} />
          <div className="absolute top-0 inset-x-0 h-full bg-[radial-gradient(ellipse_at_50%_15%,rgba(212,175,55,0.15),transparent_70%)]" />

          {/* 1. TOP-LEFT Ottoman 8-Pointed Star Geometric Ornament */}
          <div className="absolute -top-20 -left-20 sm:-top-28 sm:-left-28 pointer-events-none transition-all duration-700 z-0">
            <OttomanEightStar size={640} opacity={isDark ? 0.75 : 0.6} rotateSpeed={80} />
          </div>

          {/* 2. BOTTOM-RIGHT Ottoman 8-Pointed Star Geometric Ornament */}
          <div className="absolute -bottom-20 -right-20 sm:-bottom-28 sm:-right-28 pointer-events-none transition-all duration-700 z-0">
            <OttomanEightStar size={640} opacity={isDark ? 0.7 : 0.55} rotateSpeed={95} reverse={true} />
          </div>
        </div>

        <div className="relative z-10 max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 w-full flex-1 flex flex-col justify-between">
          
          {/* Centered Product Flacon with Left & Right Flank Specs */}
          <div className="relative w-full flex-1 flex flex-col lg:flex-row items-center justify-between my-auto min-h-[46vh] sm:min-h-[52vh] lg:min-h-[580px]">
            
            {/* Left Flank: Product Name and Action Button (Illuminated Luminous Luxury Styling) */}
            <div className="w-full lg:w-auto lg:absolute lg:left-0 lg:top-[56%] lg:-translate-y-1/2 lg:max-w-md text-center lg:text-left space-y-3 sm:space-y-4 order-2 lg:order-1 z-20 pointer-events-auto mt-6 sm:mt-8 lg:mt-0 pt-2 sm:pt-4">
              
              {/* Sovereign Royal Tier Luminous Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D4AF37]/25 border border-[#D4AF37]/70 shadow-[0_0_18px_rgba(212,175,55,0.45)] backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="font-cinzel text-[10.5px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#FFF2B2]">
                  {currentHeroFlacon.tier} Tier • {language === 'ar' ? 'خلاصة نقية 100%' : '100% Pure Extrait'}
                </span>
              </div>

              {/* Radiant Metallic Gold Luminous Title (Glows prominently on phones) */}
              <div className="relative">
                <h1 className={`font-cinzel font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-[0.04em] leading-tight drop-shadow-[0_0_25px_rgba(212,175,55,0.6)] ${
                  isDark
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#FFFDF9] via-[#F2D675] to-[#D4AF37]'
                    : 'text-[#120B06]'
                }`}>
                  {getDisplayName(currentHeroFlacon).toUpperCase()}
                </h1>
              </div>

              {/* Luminous Notes & Price Specs on Phone */}
              <p className={`text-xs sm:text-sm font-sans font-medium line-clamp-2 leading-relaxed max-w-sm mx-auto lg:mx-0 ${
                isDark ? 'text-[#FFF2B2] drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]' : 'text-[#3A2116]'
              }`}>
                {getTagline(currentHeroFlacon)}
              </p>

              {/* Luminous Action Button with Golden Radiant Rim */}
              <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-3">
                <Link
                  to={`/product/${currentHeroFlacon.slug}`}
                  className={`group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full font-cinzel font-bold text-xs uppercase tracking-[0.24em] transition-all duration-400 border-2 overflow-hidden cursor-pointer ${
                    isDark
                      ? 'bg-[#0B0A08] hover:bg-[#1A1008] text-[#FFF2B2] hover:text-[#D4AF37] border-[#D4AF37] hover:border-[#FFF2B2] shadow-[0_0_25px_rgba(212,175,55,0.5)] hover:shadow-[0_0_35px_rgba(212,175,55,0.8)] hover:scale-105'
                      : 'bg-gradient-to-r from-[#2C180F] via-[#120B06] to-[#2C180F] hover:from-[#D4AF37] hover:via-[#F2D675] hover:to-[#D4AF37] text-[#FFFDF8] hover:text-[#120B06] border-[#D4AF37] hover:border-[#D4AF37] shadow-[0_10px_30px_rgba(44,24,15,0.25)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.45)] hover:scale-105'
                  }`}
                >
                  <span className="relative z-10 drop-shadow-sm font-extrabold">
                    {language === 'ar' ? 'استكشف العطر' : 'FIND OUT MORE'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 relative z-10 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
                </Link>
              </div>

            </div>

            {/* DEAD CENTER: 2D Showcase (3 Bottles Side-by-Side on Desktop, 3.5s Carousel on Mobile) */}
            <div className="w-full max-w-4xl mx-auto relative flex items-center justify-center order-1 lg:order-2 z-10 py-4 lg:py-0">
              <Hero2DFlaconShowcase
                activeProductIndex={activeHeroIndex}
                onSlideChange={setActiveHeroIndex}
                products={heroFlacons}
              />
            </div>

            {/* RIGHT FLANK: NEXT UPCOMING PRODUCT CARD (Golden Tone in Dark Mode) */}
            <div className="w-full lg:w-auto lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 flex flex-col items-center lg:items-end text-center lg:text-right order-3 z-20 pointer-events-auto mt-4 lg:mt-0">
              <div
                onClick={() => setActiveHeroIndex(nextHeroIndex)}
                className={`group relative cursor-pointer p-3 sm:p-3.5 rounded-2xl border-2 shadow-2xl backdrop-blur-md transition-transform duration-300 hover:scale-105 max-w-[170px] sm:max-w-[190px] flex flex-col items-center lg:items-end space-y-2 ${
                  isDark
                    ? 'bg-gradient-to-br from-[#8C6239]/45 via-[#D4AF37]/30 to-[#5A3E1B]/55 border-[#D4AF37]/80 hover:border-[#FFF2B2] text-[#FFF5E6] shadow-[0_12px_40px_rgba(212,175,55,0.35)]'
                    : 'bg-[#FFFDF8] hover:bg-[#FBF6EC] border-[#A8853B]/35 hover:border-[#A8853B] text-[#704622] shadow-[0_10px_30px_-5px_rgba(112,70,34,0.08)]'
                }`}
                title={`Next: ${getDisplayName(nextHeroFlacon)}`}
              >
                {/* Header Tag */}
                <div className={`flex items-center gap-1 text-[8.5px] uppercase tracking-[0.2em] font-cinzel font-bold ${
                  isDark ? 'text-[#FFF2B2]' : 'text-[#8A6540]'
                }`}>
                  <Sparkles className="w-2.5 h-2.5 text-[#A8853B] dark:text-[#D4AF37]" />
                  <span>{language === 'ar' ? 'التالي' : 'NEXT'}</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform rtl:rotate-180" />
                </div>

                {/* Smaller Next Flacon Preview */}
                <div className="relative w-16 h-24 sm:w-20 sm:h-28 flex items-center justify-center my-0.5">
                  <img
                    src={nextHeroFlacon.image}
                    alt={getDisplayName(nextHeroFlacon)}
                    className="h-full w-auto object-contain filter drop-shadow-[0_10px_18px_rgba(0,0,0,0.4)] group-hover:scale-105 transition-transform duration-300 relative z-10"
                  />
                </div>

                {/* Next Product Title & Tier */}
                <div className="space-y-0.5">
                  <h4 className={`font-cinzel text-xs sm:text-sm font-bold leading-tight ${
                    isDark ? 'text-[#FFF5E6]' : 'text-[#704622]'
                  }`}>
                    {getDisplayName(nextHeroFlacon)}
                  </h4>
                  <p className={`text-[9.5px] font-mono font-medium ${
                    isDark ? 'text-[#FFF2B2]' : 'text-[#A8853B]'
                  }`}>
                    €{nextHeroFlacon.price} • {nextHeroFlacon.tier}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Horological Precision Ruler Gauge Under the Flacon */}
          <div className="mt-2 pt-0 pb-2 pointer-events-auto">
            <HeroRulerPagination
              activeIndex={activeHeroIndex}
              onSelectIndex={setActiveHeroIndex}
              products={heroFlacons}
              language={language}
            />
          </div>

        </div>
      </section>

      {/* =========================================================================
          1.1 EDITORIAL PREVIEW CARDS (MATCHING CHRONOSWISS BOTTOM 3 CARDS)
          ========================================================================= */}
      <section className="relative z-10 max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-4 sm:pt-6 pb-12 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative z-10">
          
          {/* Card 1: Navigates to About Page (/about) */}
          <div
            onClick={() => navigate('/about')}
            className={`group relative h-80 sm:h-96 rounded-3xl overflow-hidden border-2 shadow-2xl cursor-pointer transition-all duration-500 hover:-translate-y-1.5 ${
              isDark
                ? 'border-[#D4AF37]/80 bg-gradient-to-br from-[#8C6239]/45 via-[#D4AF37]/30 to-[#5A3E1B]/55 hover:border-[#FFF2B2] shadow-[0_12px_40px_rgba(212,175,55,0.35)]'
                : 'border-[#D4AF37]/75 bg-gradient-to-br from-[#FFF8E7] via-[#F7E7C4] to-[#EBD29B] shadow-[0_10px_30px_rgba(212,175,55,0.22)] hover:shadow-[0_18px_40px_rgba(212,175,55,0.35)] hover:border-[#D4AF37]'
            }`}
          >
            <img
              src="/editorial/master_alchemist.jpg"
              alt={language === 'ar' ? 'قصة وتاريخ الدار' : 'The House Heritage'}
              className="w-full h-full object-cover filter grayscale contrast-125 group-hover:scale-108 transition-transform duration-700 opacity-75 group-hover:opacity-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A08] via-[#0B0A08]/50 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-6 sm:p-7 space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#F2D675] font-cinzel font-bold block">
                {language === 'ar' ? 'عن دار العطور • ABOUT US' : 'ABOUT THE MAISON'}
              </span>
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#F3E6D0] group-hover:text-[#D4AF37] transition-colors leading-tight">
                {language === 'ar' ? 'قصة وتاريخ الدار' : 'The House Heritage'}
              </h3>
              <p className="text-xs text-[#D8BE99] line-clamp-2 leading-relaxed font-sans">
                {language === 'ar'
                  ? 'تعرف على تاريخ الدار الأندلسي، سر الخلاصات النقية، وصالوناتنا الملكية حول العالم.'
                  : 'Explore our Andalusian heritage, artisanal distillation legacy, and global private salons.'}
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-[11px] font-cinzel font-bold text-[#D4AF37] group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                <span>{language === 'ar' ? 'زيارة صفحة عن الدار' : 'Visit About Page'}</span>
                <span className="rtl:rotate-180">→</span>
              </div>
            </div>
          </div>

          {/* Card 2: Navigates to The Palace Page (/the-palace) */}
          <div
            onClick={() => navigate('/the-palace')}
            className={`group relative h-80 sm:h-96 rounded-3xl overflow-hidden border-2 shadow-2xl cursor-pointer transition-all duration-500 hover:-translate-y-1.5 ${
              isDark
                ? 'border-[#D4AF37]/80 bg-gradient-to-br from-[#8C6239]/45 via-[#D4AF37]/30 to-[#5A3E1B]/55 hover:border-[#FFF2B2] shadow-[0_12px_40px_rgba(212,175,55,0.35)]'
                : 'border-[#D4AF37]/75 bg-gradient-to-br from-[#FFF8E7] via-[#F7E7C4] to-[#EBD29B] shadow-[0_10px_30px_rgba(212,175,55,0.22)] hover:shadow-[0_18px_40px_rgba(212,175,55,0.35)] hover:border-[#D4AF37]'
            }`}
          >
            <img
              src="/editorial/flacon_craftsmanship.jpg"
              alt={language === 'ar' ? 'جولة في قصر العطور' : 'Enter The Palace'}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 opacity-80 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A08] via-[#0B0A08]/50 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-6 sm:p-7 space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#F2D675] font-cinzel font-bold block">
                {language === 'ar' ? 'قصر العطور • THE PALACE' : 'THE SOVEREIGN PALACE'}
              </span>
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#F3E6D0] group-hover:text-[#D4AF37] transition-colors leading-tight">
                {language === 'ar' ? 'جولة في قصر العطور' : 'Enter The Palace'}
              </h3>
              <p className="text-xs text-[#D8BE99] line-clamp-2 leading-relaxed font-sans">
                {language === 'ar'
                  ? 'استكشف أندر المكونات الطبيعية، صناعة القوارير المذهبة، وطقوس العطور الحية.'
                  : 'Discover our sacred raw ingredients, 24K gold flacon artistry, and living palace rituals.'}
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-[11px] font-cinzel font-bold text-[#D4AF37] group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                <span>{language === 'ar' ? 'دخول قصر العطور' : 'Tour The Palace'}</span>
                <span className="rtl:rotate-180">→</span>
              </div>
            </div>
          </div>

          {/* Card 3: Navigates to Fragrance Discovery Quiz (/discovery) */}
          <div
            onClick={() => navigate('/discovery')}
            className={`group relative h-80 sm:h-96 rounded-3xl overflow-hidden border-2 shadow-2xl cursor-pointer transition-all duration-500 hover:-translate-y-1.5 ${
              isDark
                ? 'border-[#D4AF37]/80 bg-gradient-to-br from-[#8C6239]/45 via-[#D4AF37]/30 to-[#5A3E1B]/55 hover:border-[#FFF2B2] shadow-[0_12px_40px_rgba(212,175,55,0.35)]'
                : 'border-[#D4AF37]/75 bg-gradient-to-br from-[#FFF8E7] via-[#F7E7C4] to-[#EBD29B] shadow-[0_10px_30px_rgba(212,175,55,0.22)] hover:shadow-[0_18px_40px_rgba(212,175,55,0.35)] hover:border-[#D4AF37]'
            }`}
          >
            <img
              src="/editorial/imperial_monograph.jpg"
              alt={language === 'ar' ? 'اختبار اكتشاف العطر' : 'Fragrance Discovery'}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 opacity-80 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A08] via-[#0B0A08]/50 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-6 sm:p-7 space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#F2D675] font-cinzel font-bold block">
                {language === 'ar' ? 'مستشار العطور • DISCOVERY' : 'FRAGRANCE FINDER'}
              </span>
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#F3E6D0] group-hover:text-[#D4AF37] transition-colors leading-tight">
                {language === 'ar' ? 'اختبار اكتشاف العطر' : 'Fragrance Discovery'}
              </h3>
              <p className="text-xs text-[#D8BE99] line-clamp-2 leading-relaxed font-sans">
                {language === 'ar'
                  ? 'خض اختباراً تفاعلياً ليكشف لك مستشارنا عن العطر الأنسب لشخصيتك ومناسبتك.'
                  : 'Take our bespoke interactive quiz to find the signature flacon tailored to your royal persona.'}
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-[11px] font-cinzel font-bold text-[#D4AF37] group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                <span>{language === 'ar' ? 'بدء اختبار العطور' : 'Start Discovery Quiz'}</span>
                <span className="rtl:rotate-180">→</span>
              </div>
            </div>
          </div>

        </div>

        {/* Animated Imperial Stats Bar */}
        <div className={`mt-10 sm:mt-14 p-8 sm:p-10 rounded-3xl transition-all duration-500 border relative z-10 ${
          isDark
            ? 'bg-gradient-to-r from-[#170E09]/90 via-[#120B06]/90 to-[#170E09]/90 border-[#D4AF37]/30 shadow-2xl backdrop-blur-md'
            : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/50 shadow-[0_15px_35px_rgba(212,175,55,0.18)] backdrop-blur-md'
        }`}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 divide-y sm:divide-y-0 sm:divide-x divide-[#D4AF37]/20 rtl:divide-x-reverse">
            {stats.map((st, i) => (
              <div key={i} className="text-center space-y-1.5 pt-6 sm:pt-0">
                <div className="font-cinzel text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#D4AF37] tracking-tight">
                  <AnimatedCounter
                    target={st.target}
                    suffix={st.suffix}
                    duration={1800}
                  />
                </div>
                <div className={`font-cinzel text-xs sm:text-sm font-bold uppercase tracking-wider ${
                  isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
                }`}>
                  {st.label}
                </div>
                <div className={`text-[11px] sm:text-xs font-sans ${
                  isDark ? 'text-[#C5A880]' : 'text-[#5A3517]'
                }`}>
                  {st.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. TOP SELLING / BEST SELLERS SHOWCASE
          ========================================================================= */}
      <TopSellingShowcase products={allProducts} />

      {/* =========================================================================
          3. CURATED COLLECTIONS EXPERIENCE
          ========================================================================= */}
      <div className="relative overflow-hidden">
        <div className="relative z-10">

          {/* =========================================================================
              CURATED COLLECTIONS EXPERIENCE (VERTICAL STACK + HORIZONTAL PRODUCTS)
              ========================================================================= */}
          <div ref={firstCollectionRef} className="space-y-0">
            {collections.map((col, idx) => (
              <HorizontalCollectionShowcase
                key={col.id}
                collection={col}
                index={idx}
                isEven={idx % 2 === 1}
              />
            ))}
          </div>

          {/* =========================================================================
              4. EXCLUSIVE PALACE OFFERS & DISCOUNTS SECTION
              ========================================================================= */}
          <OffersDiscountSection products={allProducts} />

          {/* =========================================================================
              5. CINEMATIC VIDEO: SCENT AS LIVING MEMORY
              ========================================================================= */}
          <PalaceMemoryVideo
            videoSrc="/intro.mp4"
            posterSrc="/hero_arabian_palace.jpg"
          />

          {/* =========================================================================
              4. INTERACTIVE FRAGRANCE FINDER QUIZ
              ========================================================================= */}
          <section className="py-24 border-t border-[#D4AF37]/20 relative overflow-hidden transition-colors duration-500 bg-transparent">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              
              <div className={`border-2 p-8 sm:p-12 shadow-2xl space-y-8 rounded-2xl transition-colors duration-500 ${
                isDark
                  ? 'bg-gradient-to-br from-[#8C6239]/45 via-[#D4AF37]/30 to-[#5A3E1B]/55 border-[#D4AF37]/80 text-[#FFF5E6] shadow-[0_15px_45px_rgba(212,175,55,0.35)]'
                  : 'bg-gradient-to-br from-[#FFF8E7] via-[#F7E7C4] to-[#EBD29B] border-[#D4AF37]/75 text-[#120B06] shadow-[0_15px_35px_rgba(212,175,55,0.22)]'
              }`}>
                <div className="text-center space-y-2">
                  <div className="inline-flex p-3 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] mb-2 shadow-sm">
                    <Compass className="w-6 h-6" />
                  </div>
                  <BlurText
                    text="Fragrance Finder"
                    delay={70}
                    animateBy="words"
                    direction="top"
                    className={`text-3xl sm:text-4xl font-cinzel font-bold drop-shadow-md justify-center ${
                      isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
                    }`}
                    as="h2"
                  />
                  <p className={`text-sm font-medium max-w-lg mx-auto ${
                    isDark ? 'text-[#D8BE99]' : 'text-[#3A2116]'
                  }`}>
                    Select your olfactory preferences to match your signature creation.
                  </p>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                  <div className="space-y-2">
                    <label className={`text-xs uppercase tracking-widest font-cinzel font-bold ${
                      isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
                    }`}>Gender:</label>
                    <select
                      value={selectedGender}
                      onChange={(e) => setSelectedGender(e.target.value)}
                      className={`w-full border px-3.5 py-3 rounded-xl text-xs sm:text-sm focus:border-[#D4AF37] focus:outline-none ${
                        isDark ? 'bg-black/80 border-[#D4AF37]/40 text-[#F3E6D0]' : 'bg-white/90 border-[#D4AF37]/40 text-[#120B06]'
                      }`}
                    >
                      <option value="all">All Profiles</option>
                      <option value="Unisex">Unisex Sovereign</option>
                      <option value="Masculine">Masculine Strength</option>
                      <option value="Feminine">Feminine Elegance</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className={`text-xs uppercase tracking-widest font-cinzel font-bold ${
                      isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
                    }`}>Scent Family:</label>
                    <select
                      value={selectedFamily}
                      onChange={(e) => setSelectedFamily(e.target.value)}
                      className={`w-full border px-3.5 py-3 rounded-xl text-xs sm:text-sm focus:border-[#D4AF37] focus:outline-none ${
                        isDark ? 'bg-black/80 border-[#D4AF37]/40 text-[#F3E6D0]' : 'bg-white/90 border-[#D4AF37]/40 text-[#120B06]'
                      }`}
                    >
                      <option value="all">All Families</option>
                      <option value="Oriental">Oriental / Amber</option>
                      <option value="Woody">Woody / Oud</option>
                      <option value="Floral">Floral / Gourmand</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className={`text-xs uppercase tracking-widest font-cinzel font-bold ${
                      isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
                    }`}>Occasion:</label>
                    <select
                      value={selectedOccasion}
                      onChange={(e) => setSelectedOccasion(e.target.value)}
                      className={`w-full border px-3.5 py-3 rounded-xl text-xs sm:text-sm focus:border-[#D4AF37] focus:outline-none ${
                        isDark ? 'bg-black/80 border-[#D4AF37]/40 text-[#F3E6D0]' : 'bg-white/90 border-[#D4AF37]/40 text-[#120B06]'
                      }`}
                    >
                      <option value="all">All Occasions</option>
                      <option value="Evening">Evening / Gala</option>
                      <option value="Daily">Daily Luxury</option>
                      <option value="Royal">Royal Celebrations</option>
                    </select>
                  </div>
                </div>

                {/* Filtered Matches Preview */}
                <div className="pt-6 border-t border-black/10 dark:border-white/15">
                  <div className="flex items-center justify-between mb-4 text-xs sm:text-sm">
                    <span className={`font-medium ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>
                      Matched <strong className="text-[#D4AF37] text-base">{discoveryMatches.length}</strong> creations:
                    </span>
                    <Link
                      to="/discovery"
                      className="text-[#D4AF37] hover:text-[#B8860B] font-cinzel font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <span>Take Full Guided Journey</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {discoveryMatches.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => navigate(`/product/${item.slug || item.id}`)}
                        className={`p-4 border hover:border-[#D4AF37] cursor-pointer transition-colors flex items-center gap-3.5 shadow-md rounded-xl ${
                          isDark ? 'bg-black/60 border-white/15 text-[#F3E6D0]' : 'bg-white/90 border-[#D4AF37]/35 text-[#120B06]'
                        }`}
                      >
                        <img
                          src={item.cutoutImage || item.images?.[0]}
                          alt={item.name}
                          className="w-14 h-18 object-contain"
                        />
                        <div>
                          <h4 className={`font-cinzel text-sm font-bold line-clamp-1 ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>{item.name}</h4>
                          <p className="text-xs text-[#D4AF37] font-bold">€{item.price}</p>
                          <span className={`text-[10px] uppercase tracking-wider font-mono ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>{item.tier || item.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </section>

          {/* =========================================================================
              5. PRODUCT COMPARISON MATRIX
              ========================================================================= */}
          <section className="py-24 border-t border-[#D4AF37]/20 relative overflow-hidden transition-colors duration-500 bg-transparent">
            <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
              
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
                <span className={`text-xs uppercase tracking-[0.35em] font-cinzel font-bold ${
                  isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
                }`}>
                  Side-by-Side
                </span>
                <BlurText
                  text="The Three Flacons"
                  delay={70}
                  animateBy="words"
                  direction="top"
                  className={`text-3xl sm:text-4xl font-cinzel font-bold drop-shadow-md justify-center ${
                    isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
                  }`}
                  as="h2"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-[#D4AF37]/30 text-xs sm:text-sm">
                  <thead>
                    <tr className={`border-b border-[#D4AF37]/30 ${isDark ? 'bg-[#0B0A08]' : 'bg-[#CBB198]'}`}>
                      <th className="p-4 font-cinzel text-xs uppercase tracking-widest text-[#D4AF37] font-bold w-1/4">Metric</th>
                      {heroFlacons.map((f) => (
                        <th key={f.id} className={`p-4 font-cinzel text-base font-bold text-center w-1/4 ${
                          isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
                        }`}>
                          {f.name} ({f.tier})
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10 dark:divide-white/10">
                    <tr>
                      <td className="p-4 font-bold text-[#D4AF37]">Flacon Silhouette</td>
                      {heroFlacons.map((f) => (
                        <td key={f.id} className="p-4 text-center">
                          <img
                            src={f.tier === 'Luxury' ? '/products/luxury_designs/07_arabian_gold.webp' : f.tier === 'Royal' ? '/products/luxury_designs/17_million_elixir.webp' : '/products/luxury_designs/02_ameerah_al_arab.webp'}
                            alt={f.name}
                            className="h-28 mx-auto object-contain filter drop-shadow-lg"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr className={isDark ? 'bg-white/5' : 'bg-black/5'}>
                      <td className="p-4 font-bold text-[#D4AF37]">Price & Volume</td>
                      {heroFlacons.map((f) => (
                        <td key={f.id} className="p-4 text-center font-cinzel font-bold text-[#D4AF37] text-base">
                          €{f.price} <span className={`text-xs font-normal ${isDark ? 'text-[#F3E6D0]' : 'text-[#21130D]'}`}>/ {f.size}</span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-[#D4AF37]">Key Scent Notes</td>
                      {heroFlacons.map((f) => (
                        <td key={f.id} className={`p-4 text-center font-medium ${isDark ? 'text-[#F3E6D0]' : 'text-[#21130D]'}`}>
                          {f.notes}
                        </td>
                      ))}
                    </tr>
                    <tr className={isDark ? 'bg-white/5' : 'bg-black/5'}>
                      <td className="p-4 font-bold text-[#D4AF37]">Longevity Profile</td>
                      <td className="p-4 text-center font-bold">14+ Hours</td>
                      <td className="p-4 text-center font-bold">10-12 Hours</td>
                      <td className="p-4 text-center font-bold">8-10 Hours</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-[#D4AF37]">Gender Archetype</td>
                      <td className="p-4 text-center font-medium">Unisex Sovereign</td>
                      <td className="p-4 text-center font-medium">Masculine Strength</td>
                      <td className="p-4 text-center font-medium">Feminine Elegance</td>
                    </tr>
                    <tr className={isDark ? 'bg-[#0B0A08]' : 'bg-[#FAF6F0]'}>
                      <td className="p-4 font-bold text-[#D4AF37]">Action</td>
                      {heroFlacons.map((f) => (
                        <td key={f.id} className="p-4 text-center">
                          <button
                            onClick={() => {
                              const item = allProducts.find(p => p.slug === f.slug);
                              if (item) addToCart(item, '60 ml', 1);
                            }}
                            className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-full transition-all duration-300 cursor-pointer shadow-md hover:scale-105"
                          >
                            Add to Bag (€{f.price})
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          </section>

          {/* =========================================================================
              6. REVIEWS & SOCIAL PROOF
              ========================================================================= */}
          <section className="py-24 border-t border-[#D4AF37]/20 relative overflow-hidden transition-colors duration-500 bg-transparent">
            <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
              
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
                <span className={`text-xs uppercase tracking-[0.35em] font-cinzel font-bold ${
                  isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
                }`}>
                  Testimonials
                </span>
                <h2 className={`text-3xl sm:text-4xl font-cinzel font-bold drop-shadow-md ${
                  isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
                }`}>
                  Royal Acclaim
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className={`border-2 p-8 flex flex-col justify-between space-y-4 shadow-xl rounded-2xl transition-colors duration-500 ${
                  isDark
                    ? 'bg-gradient-to-br from-[#8C6239]/45 via-[#D4AF37]/30 to-[#5A3E1B]/55 border-[#D4AF37]/80 text-[#FFF5E6] shadow-[0_12px_40px_rgba(212,175,55,0.35)]'
                    : 'bg-gradient-to-br from-[#FFF8E7] via-[#F7E7C4] to-[#EBD29B] border-[#D4AF37]/75 text-[#120B06] shadow-[0_10px_30px_rgba(212,175,55,0.22)]'
                }`}>
                  <div className="space-y-3">
                    <div className="flex gap-1 text-[#D4AF37]">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <h4 className="font-cinzel font-bold text-base">"Pure Royalty in a Bottle"</h4>
                    <p className={`text-xs sm:text-sm font-medium leading-relaxed ${isDark ? 'text-[#FFF2B2]' : 'text-[#3A2116]'}`}>
                      "The projection lasts well past 14 hours with amber and oud notes that develop magnificently."
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#D4AF37]/30 flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-[#D4AF37]">Tariq Al-Hashemi</span>
                    <span className="text-emerald-400 text-xs flex items-center gap-1 font-semibold">
                      <Check className="w-3.5 h-3.5" /> Verified Patron
                    </span>
                  </div>
                </div>

                <div className={`border-2 p-8 flex flex-col justify-between space-y-4 shadow-xl rounded-2xl transition-colors duration-500 ${
                  isDark
                    ? 'bg-gradient-to-br from-[#8C6239]/45 via-[#D4AF37]/30 to-[#5A3E1B]/55 border-[#D4AF37]/80 text-[#FFF5E6] shadow-[0_12px_40px_rgba(212,175,55,0.35)]'
                    : 'bg-gradient-to-br from-[#FFF8E7] via-[#F7E7C4] to-[#EBD29B] border-[#D4AF37]/75 text-[#120B06] shadow-[0_10px_30px_rgba(212,175,55,0.22)]'
                }`}>
                  <div className="space-y-3">
                    <div className="flex gap-1 text-[#D4AF37]">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <h4 className="font-cinzel font-bold text-base">"Masterpiece of Modern Luxury"</h4>
                    <p className={`text-xs sm:text-sm font-medium leading-relaxed ${isDark ? 'text-[#FFF2B2]' : 'text-[#3A2116]'}`}>
                      "Millionaire has commanding leather and spiced cardamom resonance. Highly recommended."
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#D4AF37]/30 flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-[#D4AF37]">Alexander D.</span>
                    <span className="text-emerald-400 text-xs flex items-center gap-1 font-semibold">
                      <Check className="w-3.5 h-3.5" /> Verified Patron
                    </span>
                  </div>
                </div>

                <div className={`border-2 p-8 flex flex-col justify-between space-y-4 shadow-xl rounded-2xl transition-colors duration-500 ${
                  isDark
                    ? 'bg-gradient-to-br from-[#8C6239]/45 via-[#D4AF37]/30 to-[#5A3E1B]/55 border-[#D4AF37]/80 text-[#FFF5E6] shadow-[0_12px_40px_rgba(212,175,55,0.35)]'
                    : 'bg-gradient-to-br from-[#FFF8E7] via-[#F7E7C4] to-[#EBD29B] border-[#D4AF37]/75 text-[#120B06] shadow-[0_10px_30px_rgba(212,175,55,0.22)]'
                }`}>
                  <div className="space-y-3">
                    <div className="flex gap-1 text-[#D4AF37]">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <h4 className="font-cinzel font-bold text-base">"Delicious & Elegant"</h4>
                    <p className={`text-xs sm:text-sm font-medium leading-relaxed ${isDark ? 'text-[#FFF2B2]' : 'text-[#3A2116]'}`}>
                      "Ana Sukkar is sweet and delicate. The spun sugar and white musk blend is heavenly."
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#D4AF37]/30 flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-[#D4AF37]">Layla K.</span>
                    <span className="text-emerald-400 text-xs flex items-center gap-1 font-semibold">
                      <Check className="w-3.5 h-3.5" /> Verified Patron
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* =========================================================================
              7. TRUST & NEWSLETTER LAYER
              ========================================================================= */}
          <section className={`py-10 border-t border-[#D4AF37]/20 transition-colors duration-500 ${
            isDark ? 'bg-[#0B0A08]' : 'bg-[#FAF6F0]'
          }`}>
            <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
              
              {/* 3 Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-black/10 dark:border-white/15 text-center">
                <div className="space-y-2 flex flex-col items-center">
                  <Truck className="w-7 h-7 text-[#D4AF37] mb-1" />
                  <h4 className={`font-cinzel font-bold text-sm ${isDark ? 'text-[#F3E6D0]' : 'text-[#21130D]'}`}>DHL Express Delivery</h4>
                  <p className={`text-xs font-medium ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>Complimentary royal shipping on orders over €100.</p>
                </div>
                <div className="space-y-2 flex flex-col items-center">
                  <Lock className="w-7 h-7 text-[#D4AF37] mb-1" />
                  <h4 className={`font-cinzel font-bold text-sm ${isDark ? 'text-[#F3E6D0]' : 'text-[#21130D]'}`}>Encrypted Stripe Checkout</h4>
                  <p className={`text-xs font-medium ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>256-bit encrypted global payment processing.</p>
                </div>
                <div className="space-y-2 flex flex-col items-center">
                  <Award className="w-7 h-7 text-[#D4AF37] mb-1" />
                  <h4 className={`font-cinzel font-bold text-sm ${isDark ? 'text-[#F3E6D0]' : 'text-[#21130D]'}`}>100% Authentic Extraits</h4>
                  <p className={`text-xs font-medium ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>Meticulously matured in numbered flacons.</p>
                </div>
              </div>

              {/* Newsletter Box */}
              <div className="max-w-2xl mx-auto text-center pt-8 space-y-3">
                <span className={`text-xs uppercase tracking-[0.3em] font-cinzel font-bold ${
                  isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
                }`}>
                  The Sovereign Society
                </span>
                <h3 className={`text-xl sm:text-2xl font-cinzel font-bold drop-shadow-md ${
                  isDark ? 'text-[#F3E6D0]' : 'text-[#21130D]'
                }`}>
                  Enter the world of Arabian Sheikh
                </h3>
                <p className={`text-xs sm:text-sm font-medium ${
                  isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'
                }`}>
                  Receive private invitations to limited flacon reserves and releases.
                </p>
                <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing to Arabian Sheikh Private Society.'); }} className="flex max-w-md mx-auto gap-2 pt-2">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    required
                    className={`flex-1 border px-4 py-2.5 text-xs focus:border-[#D4AF37] focus:outline-none rounded-full ${
                      isDark ? 'bg-black/80 border-[#D4AF37]/40 text-[#F3E6D0] placeholder-neutral-500' : 'bg-white border-[#D4AF37]/40 text-[#21130D] placeholder-neutral-400'
                    }`}
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg rounded-full"
                  >
                    Join
                  </button>
                </form>
              </div>

            </div>
          </section>

        </div>
      </div>

    </div>
  );
}
