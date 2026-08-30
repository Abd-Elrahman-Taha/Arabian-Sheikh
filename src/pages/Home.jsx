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
  const flaconShowcaseRef = useRef(null);

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
      bulgarianTagline: 'Течно 24К злато, дестилирано със скъпоценен уд от Асам, искрящ диамантен акорд и кралски кехлибар.',
      arabicTagline: 'ذهب خالص عيار 24 قيراط مقطر مع دهن عود أسامي عتيق وعنبر ملكي فاخر.',
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
      bulgarianTagline: 'Тъмна харизма, мощ и магнетично излъчване с благородна дървесина и подправки.',
      arabicTagline: 'كاريزما طاغية وقوة ملكية مع أرقى الأخشاب والجلود والتوابل النبيلة.',
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
      bulgarianTagline: 'Кадифена сладост, нежни венчелистчета, захарен памук и ванилия от Мадагаскар.',
      arabicTagline: 'حلاوة مخملية آسرة مع غزل البنات وزهر البرتقال وعبير فانيليا مدغشقر.',
      notes: 'Spun Sugar Nectar • Orange Blossom Petals • Gourmet Vanilla Cream • White Musk',
      color: '#ECC557',
      image: '/products/ana_sukkar_flacon.webp'
    }
  ];

  const stats = [
    {
      target: 46,
      suffix: '+',
      label: language === 'ar' ? 'تحفة عطرية استثنائية' : language === 'bg' ? 'Шедьоври на висшата парфюмерия' : language === 'es' ? 'Obras Maestras de Alta Perfumería' : 'Haute Parfumerie Masterpieces',
      sub: language === 'ar' ? 'عطور، دهن عود، وبخور ملكي' : language === 'bg' ? 'Екстракти, масла и рядък бахур' : language === 'es' ? 'Extraits, aceites y bakhoor raro' : 'Extraits, Oils & Rare Bakhoor'
    },
    {
      target: 35,
      suffix: '%',
      label: language === 'ar' ? 'تركيز الزيوت الخالصة' : language === 'bg' ? 'Концентрация на чист екстракт' : language === 'es' ? 'Concentración de Extrait Puro' : 'Pure Extrait Concentration',
      sub: language === 'ar' ? 'أعلى درجات الفوحان والثبات' : language === 'bg' ? 'Безкомпромисна трайност и шлейф' : language === 'es' ? 'Estela y fijación sin concesiones' : 'Uncompromising Sillage'
    },
    {
      target: 60,
      suffix: '+',
      label: language === 'ar' ? 'عاماً عمر أشجار العود' : language === 'bg' ? 'Години възраст на дивия уд' : language === 'es' ? 'Años de edad del oud salvaje' : 'Years Wild Agarwood Age',
      sub: language === 'ar' ? 'تقطير نحاسي بطيء وأصيل' : language === 'bg' ? 'Бавна занаятчийска дестилация' : language === 'es' ? 'Alambiques de cobre artesanales' : 'Slow Copper Artisanal Stills'
    },
    {
      target: 18,
      suffix: 'h+',
      label: language === 'ar' ? 'ثبات متواصل على البشرة' : language === 'bg' ? 'Непрекъсната трайност върху кожата' : language === 'es' ? 'Fijación continua en la piel' : 'Continuous Skin Longevity',
      sub: language === 'ar' ? 'أثر ملكي لا يُمحى' : language === 'bg' ? 'Дълготрайно кралско присъствие' : language === 'es' ? 'Presencia soberana duradera' : 'Lasting Sovereign Presence'
    }
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const prods = await productService.getAllProducts();
        setAllProducts(prods);

        // Group products into rich curated Collections without duplicate fallbacks
        const imperialTiersProducts = prods.filter(p => p.category === 'perfumes' || p.tier === 'Luxury' || p.tier === 'Royal' || p.tier === 'Classic');
        const oudAmberProducts = prods.filter(p => 
          p.name?.toLowerCase().includes('oud') ||
          p.name?.toLowerCase().includes('amber') ||
          p.fragranceFamily?.toLowerCase().includes('woody') || 
          p.fragranceFamily?.toLowerCase().includes('amber') || 
          p.scentFamily?.toLowerCase().includes('oriental') ||
          p.topNotes?.some(n => n.toLowerCase().includes('oud') || n.toLowerCase().includes('amber'))
        );
        const floralGourmandProducts = prods.filter(p =>
          p.name?.toLowerCase().includes('rose') ||
          p.name?.toLowerCase().includes('mademoiselle') ||
          p.fragranceFamily?.toLowerCase().includes('floral') ||
          p.scentFamily?.toLowerCase().includes('gourmand') ||
          p.scentFamily?.toLowerCase().includes('rose') ||
          p.scentFamily?.toLowerCase().includes('sweet')
        );
        const freshCitrusProducts = prods.filter(p =>
          p.name?.toLowerCase().includes('sauvage') ||
          p.fragranceFamily?.toLowerCase().includes('fresh') ||
          p.scentFamily?.toLowerCase().includes('citrus') ||
          p.scentFamily?.toLowerCase().includes('green')
        );
        const bakhoorProducts = prods.filter(p => p.category === 'bakhoor' || p.scentFamily?.toLowerCase().includes('incense'));
        const oilsProducts = prods.filter(p => p.category === 'oils' || p.size?.includes('12 ml') || p.name?.toLowerCase().includes('oil') || p.name?.toLowerCase().includes('attar'));
        const bundlesProducts = prods.filter(p => p.category === 'bundles' || p.category === 'gift sets' || p.size?.includes('Set') || p.size?.includes('Full Set'));

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
            products: imperialTiersProducts
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
            products: oudAmberProducts
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
            products: floralGourmandProducts
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
            products: freshCitrusProducts
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
            products: bakhoorProducts
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
            products: oilsProducts
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
            products: bundlesProducts
          }
        ].filter(c => c.products && c.products.length > 0);

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
    if (language === 'ar') return item.arabicTagline || item.tagline;
    if (language === 'bg') return item.bulgarianTagline || item.tagline;
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

  const scrollToFlaconShowcase = () => {
    if (flaconShowcaseRef.current) {
      flaconShowcaseRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`w-full bg-transparent overflow-x-hidden transition-colors duration-500 ${
      isDark ? 'text-[#F3E6D0]' : 'text-[#21130D]'
    }`}>
      
      {/* =========================================================================
          1. PALACE ARCHITECTURE HERO SECTION: GRAND DRY PALACE 24K WALLPAPER
          ========================================================================= */}
      <section className="relative w-full min-h-[92vh] sm:min-h-screen flex flex-col justify-between items-center overflow-hidden pt-24 sm:pt-28 pb-8 z-10">
        
        {/* Full-Bleed 24K Architecture Visual: 9:16 for phones, 16:9 for desktop */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
          <picture className="w-full h-full">
            {/* 1. Mobile Phone WebP (< 768px, ~312 KB) */}
            <source
              media="(max-width: 767px)"
              type="image/webp"
              srcSet="/editorial/arabian_palace_phone_opt.webp"
            />
            {/* 2. Mobile Phone JPG Fallback (< 768px, ~425 KB) */}
            <source
              media="(max-width: 767px)"
              srcSet="/editorial/arabian_palace_phone_opt.jpg"
            />
            {/* 3. Desktop / Tablet WebP (>= 768px, ~426 KB) */}
            <source
              type="image/webp"
              srcSet="/editorial/arabian_palace_desktop_opt.webp"
            />
            {/* 4. Desktop JPG Standard Fallback */}
            <img
              src="/editorial/arabian_palace_desktop_opt.jpg"
              alt="The Grand Sovereign Palace of Arabian Sheikh"
              className="w-full h-full object-cover object-center transform scale-100 sm:scale-105 transition-transform duration-1000"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </picture>

          {/* Top Vignette for Navbar readability */}
          <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />

          {/* Center Subtle Golden Radiant Bloom */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(212,175,55,0.18),transparent_65%)] pointer-events-none" />

          {/* Bottom Seamless Fade into Section 2 (Flacon Turntable Showcase) */}
          <div className={`absolute bottom-0 inset-x-0 h-52 pointer-events-none transition-colors duration-700 ${
            isDark
              ? 'bg-gradient-to-t from-[#0B0A08] via-[#0B0A08]/75 to-transparent'
              : 'bg-gradient-to-t from-[#F3E6D0] via-[#F3E6D0]/80 to-transparent'
          }`} />
        </div>

        {/* Center Royal Monogram & Headline Content */}
        <div className="relative z-20 max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 w-full mt-auto mb-2 sm:my-auto pt-[36vh] sm:pt-0 text-center flex flex-col items-center space-y-3 sm:space-y-6 pointer-events-auto">
          
          {/* Sovereign Royal Seal Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-black/65 border-2 border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.55)] backdrop-blur-md animate-fade-in">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FFDF8A]" />
            <span className="font-cinzel text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.2em] sm:tracking-[0.28em] text-[#FFFDF8]">
              {language === 'ar' ? 'دار العطور الملكية الأندلسية' : 'HAUTE PARFUMERIE ROYALE • PALACE RESERVE'}
            </span>
          </div>

          {/* Majestic Royal Title */}
          <div className="space-y-1 sm:space-y-2 max-w-3xl">
            <h1 className="font-cinzel font-extrabold text-3xl sm:text-6xl lg:text-7xl tracking-[0.08em] leading-tight text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDF8] via-[#F2D675] to-[#D4AF37] drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)]">
              {language === 'ar' ? 'قصر الشيخ العربي' : 'ARABIAN SHEIKH'}
            </h1>
            <p className="font-cinzel text-[11px] sm:text-base lg:text-lg font-bold tracking-[0.18em] sm:tracking-[0.22em] text-[#FFF2B2] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] uppercase max-w-xl mx-auto">
              {language === 'ar'
                ? 'فخامة الخلاصات النقية في بلاط الملوك'
                : 'The Sanctuary of Pure Extrait & Andalusian Alchemy'}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 sm:pt-5 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
            <button
              onClick={scrollToFlaconShowcase}
              className="group relative inline-flex items-center gap-2 sm:gap-3 px-6 py-2.5 sm:px-10 sm:py-4 rounded-full font-cinzel font-bold text-[11px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.24em] transition-all duration-400 border-2 border-[#F2D675] bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#D4AF37] text-black hover:scale-105 shadow-[0_0_25px_rgba(212,175,55,0.65)] hover:shadow-[0_0_40px_rgba(242,214,117,0.9)] cursor-pointer overflow-hidden"
            >
              <span className="relative z-10 font-extrabold">
                {language === 'ar' ? 'استكشف القوارير الملكية' : 'EXPLORE THE FLACONS'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 transition-transform duration-300 group-hover:translate-y-0.5" />
            </button>

            <Link
              to="/the-palace"
              className="group relative inline-flex items-center gap-1.5 sm:gap-2 px-5 py-2.5 sm:px-8 sm:py-4 rounded-full font-cinzel font-bold text-[11px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.22em] transition-all duration-300 border-2 border-[#FFFDF8]/60 bg-black/60 hover:bg-black/80 text-[#FFFDF8] hover:border-[#F2D675] hover:text-[#FFDF8A] backdrop-blur-md shadow-lg hover:scale-105 cursor-pointer"
            >
              <span>{language === 'ar' ? 'جولة في القصر' : 'TOUR THE PALACE'}</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 rtl:rotate-180 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

        </div>

        {/* Bottom Scroll Prompt pointing to Flacon Showcase */}
        <div
          onClick={scrollToFlaconShowcase}
          className="relative z-20 flex flex-col items-center gap-1 cursor-pointer group pb-2 pt-2 sm:pt-4 transition-transform hover:translate-y-1"
        >
          <span className="font-cinzel text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.25em] text-[#FFF2B2] group-hover:text-[#F2D675] drop-shadow-md font-bold">
            {language === 'ar' ? 'انتقل إلى المعرض الملكي' : 'SCROLL TO FLACON SHOWCASE'}
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-[#D4AF37] bg-black/50 backdrop-blur-md flex items-center justify-center text-[#FFDF8A] shadow-[0_0_15px_rgba(212,175,55,0.5)] group-hover:border-[#FFFDF8] animate-bounce">
            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>

      </section>

      {/* =========================================================================
          2. FLACON TURNTABLE SHOWCASE (PREVIOUS HERO SECTION - 100% PRESERVED)
          ========================================================================= */}
      <section
        ref={flaconShowcaseRef}
        id="flacon-showcase"
        className="relative min-h-[86vh] lg:min-h-[90vh] flex flex-col justify-between overflow-hidden pt-12 sm:pt-16 lg:pt-20 pb-0"
      >
        
        {/* Clean, Smooth, Noise-Free Luxury Background with Radiant Top-Left & Bottom-Right Shaders */}
        <div className={`absolute inset-0 z-0 pointer-events-none overflow-hidden transition-colors duration-700 ${
          isDark ? 'bg-[#0B0A08]' : 'bg-[#F3E6D0]'
        }`}>
          <div className={`absolute inset-0 transition-opacity duration-700 ${
            isDark
              ? 'bg-gradient-to-b from-[#140D07] via-[#0B0A08] to-[#0B0A08]'
              : 'bg-gradient-to-b from-[#FAF6F0] via-[#F3E6D0] to-[#E8D9C2]'
          }`} />
          <div className=" absolute top-0 inset-x-0 h-full bg-[radial-gradient(ellipse_at_50%_15%,rgba(212,175,55,0.15),transparent_70%)]" />

          {/* 1. TOP-LEFT Ottoman 8-Pointed Star Geometric Ornament */}
          {/* 1. TOP-LEFT Ottoman 8-Pointed Star Geometric Ornament */}
          <div className="  absolute -top-20 -left-20 sm:-top-28 sm:-left-28 pointer-events-none transition-all duration-700 z-0">
          <OttomanEightStar
            size={640}
            opacity={isDark ? 0.75 : 0.6}
            rotateSpeed={80}
          />
          </div>

          {/* 2. BOTTOM-RIGHT Ottoman 8-Pointed Star Geometric Ornament */}
          <div className=" hidden sm:block absolute -bottom-20 -right-20 sm:-bottom-28 sm:-right-28 pointer-events-none transition-all duration-700 z-0">
            <OttomanEightStar
              size={640}
              opacity={isDark ? 0.7 : 0.55}
              rotateSpeed={95}
              reverse={true}
            />
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
                  {t('tiers.' + currentHeroFlacon.tier.toLowerCase()) || currentHeroFlacon.tier} • {language === 'ar' ? 'خلاصة نقية 100%' : language === 'bg' ? '100% Чист Екстракт' : language === 'es' ? 'Extrait 100% Puro' : '100% Pure Extrait'}
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
                    {language === 'ar' ? 'استكشف العطر' : language === 'bg' ? 'Научете повече' : language === 'es' ? 'Saber Más' : 'FIND OUT MORE'}
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
                className={`group relative cursor-pointer p-3 sm:p-3.5 rounded-2xl border-2 shadow-2xl backdrop-blur-md transition-transform duration-300 hover:scale-105 w-[165px] sm:w-[185px] shrink-0 flex flex-col items-center text-center space-y-2 box-border ${
                  isDark
                    ? 'bg-gradient-to-br from-[#D4AF37]/55 via-[#F2D675]/35 to-[#8C6239]/65 border-[#F2D675] hover:border-[#FFFDF8] text-[#FFFDF8] shadow-[0_14px_45px_rgba(212,175,55,0.45)] hover:shadow-[0_22px_65px_rgba(242,214,117,0.75)]'
                    : 'bg-[#FFFDF8] hover:bg-[#FBF6EC] border-[#A8853B]/35 hover:border-[#A8853B] text-[#704622] shadow-[0_10px_30px_-5px_rgba(112,70,34,0.08)]'
                }`}
                title={`Next: ${getDisplayName(nextHeroFlacon)}`}
              >
                {/* Header Tag Centered */}
                <div className={`w-full flex items-center justify-center gap-1.5 text-[8.5px] uppercase tracking-[0.2em] font-cinzel font-bold ${
                  isDark ? 'text-[#FFDF8A]' : 'text-[#8A6540]'
                }`}>
                  <Sparkles className="w-2.5 h-2.5 text-[#FFDF8A] dark:text-[#FFDF8A]" />
                  <span>{language === 'ar' ? 'التالي' : 'NEXT'}</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform rtl:rotate-180" />
                </div>

                {/* Next Flacon Preview Exactly in Middle of Container */}
                <div className="relative w-full h-24 sm:h-28 flex items-center justify-center my-0.5 overflow-hidden">
                  <img
                    src={nextHeroFlacon.image}
                    alt={getDisplayName(nextHeroFlacon)}
                    className="max-h-full max-w-full object-contain mx-auto filter drop-shadow-[0_10px_18px_rgba(0,0,0,0.4)] group-hover:scale-105 transition-transform duration-300 relative z-10"
                  />
                </div>

                {/* Next Product Title & Tier Centered */}
                <div className="space-y-0.5 w-full text-center overflow-hidden">
                  <h4 className={`font-cinzel text-xs sm:text-sm font-bold leading-tight truncate ${
                    isDark ? 'text-[#FFFDF8] drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]' : 'text-[#704622]'
                  }`}>
                    {getDisplayName(nextHeroFlacon)}
                  </h4>
                  <p className={`text-[9.5px] font-mono font-extrabold truncate ${
                    isDark ? 'text-[#FFDF8A]' : 'text-[#A8853B]'
                  }`}>
                    €{nextHeroFlacon.price} • {t('tiers.' + nextHeroFlacon.tier.toLowerCase()) || nextHeroFlacon.tier}
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
                ? 'border-[#F2D675] bg-gradient-to-br from-[#D4AF37]/55 via-[#F2D675]/35 to-[#8C6239]/65 hover:border-[#FFFDF8] shadow-[0_14px_45px_rgba(212,175,55,0.45)] hover:shadow-[0_22px_65px_rgba(242,214,117,0.75)]'
                : 'border-[#A8853B]/35 bg-[#FFFDF8] hover:bg-[#FBF6EC] shadow-[0_10px_30px_-5px_rgba(112,70,34,0.08)] hover:shadow-[0_18px_40px_rgba(112,70,34,0.18)] hover:border-[#A8853B]'
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
                {language === 'ar' ? 'عن دار العطور • ABOUT US' : language === 'bg' ? 'За Къщата' : language === 'es' ? 'Sobre la Maison' : 'ABOUT THE MAISON'}
              </span>
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#F3E6D0] group-hover:text-[#D4AF37] transition-colors leading-tight">
                {language === 'ar' ? 'قصة وتاريخ الدار' : language === 'bg' ? 'Наследството на Къщата' : language === 'es' ? 'El Legado de la Maison' : 'The House Heritage'}
              </h3>
              <p className="text-xs text-[#D8BE99] line-clamp-2 leading-relaxed font-sans">
                {language === 'ar'
                  ? 'تعرف على تاريخ الدار الأندلسي، سر الخلاصات النقية، وصالوناتنا الملكية حول العالم.'
                  : language === 'bg'
                  ? 'Разгледайте нашето андалуско наследство, традиции в дестилацията и частни салони.'
                  : language === 'es'
                  ? 'Explore nuestro legado andalusí, tradición en destilación y salones privados.'
                  : 'Explore our Andalusian heritage, artisanal distillation legacy, and global private salons.'}
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-[11px] font-cinzel font-bold text-[#D4AF37] group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                <span>{language === 'ar' ? 'زيارة صفحة عن الدار' : language === 'bg' ? 'Към За нас' : language === 'es' ? 'Visitar Página' : 'Visit About Page'}</span>
                <span className="rtl:rotate-180">→</span>
              </div>
            </div>
          </div>

          {/* Card 2: Navigates to The Palace Page (/the-palace) */}
          <div
            onClick={() => navigate('/the-palace')}
            className={`group relative h-80 sm:h-96 rounded-3xl overflow-hidden border-2 shadow-2xl cursor-pointer transition-all duration-500 hover:-translate-y-1.5 ${
              isDark
                ? 'border-[#F2D675] bg-gradient-to-br from-[#D4AF37]/55 via-[#F2D675]/35 to-[#8C6239]/65 hover:border-[#FFFDF8] shadow-[0_14px_45px_rgba(212,175,55,0.45)] hover:shadow-[0_22px_65px_rgba(242,214,117,0.75)]'
                : 'border-[#A8853B]/35 bg-[#FFFDF8] hover:bg-[#FBF6EC] shadow-[0_10px_30px_-5px_rgba(112,70,34,0.08)] hover:shadow-[0_18px_40px_rgba(112,70,34,0.18)] hover:border-[#A8853B]'
            }`}
          >
            <img
              src="/editorial/flacon_craftsmanship.jpg"
              alt={language === 'ar' ? 'جولة في قصر العطور' : language === 'bg' ? 'Влезте в Двореца' : language === 'es' ? 'Entrar al Palacio' : 'Enter The Palace'}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 opacity-80 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A08] via-[#0B0A08]/50 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-6 sm:p-7 space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#F2D675] font-cinzel font-bold block">
                {language === 'ar' ? 'قصر العطور • THE PALACE' : language === 'bg' ? 'Владетелският Дворец' : language === 'es' ? 'El Palacio Soberano' : 'THE SOVEREIGN PALACE'}
              </span>
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#F3E6D0] group-hover:text-[#D4AF37] transition-colors leading-tight">
                {language === 'ar' ? 'جولة في قصر العطور' : language === 'bg' ? 'Влезте в Двореца' : language === 'es' ? 'Entrar al Palacio' : 'Enter The Palace'}
              </h3>
              <p className="text-xs text-[#D8BE99] line-clamp-2 leading-relaxed font-sans">
                {language === 'ar'
                  ? 'استكشف أندر المكونات الطبيعية، صناعة القوارير المذهبة، وطقوس العطور الحية.'
                  : language === 'bg'
                  ? 'Открийте нашите свещени съставки, 24К златни флакони и дворцови ритуали.'
                  : language === 'es'
                  ? 'Descubra ingredientes sagrados, frascos con oro de 24K y rituales palaciegos.'
                  : 'Discover our sacred raw ingredients, 24K gold flacon artistry, and living palace rituals.'}
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-[11px] font-cinzel font-bold text-[#D4AF37] group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                <span>{language === 'ar' ? 'دخول قصر العطور' : language === 'bg' ? 'Обиколка на Двореца' : language === 'es' ? 'Recorrer el Palacio' : 'Tour The Palace'}</span>
                <span className="rtl:rotate-180">→</span>
              </div>
            </div>
          </div>

          {/* Card 3: Navigates to Fragrance Discovery Quiz (/discovery) */}
          <div
            onClick={() => navigate('/discovery')}
            className={`group relative h-80 sm:h-96 rounded-3xl overflow-hidden border-2 shadow-2xl cursor-pointer transition-all duration-500 hover:-translate-y-1.5 ${
              isDark
                ? 'border-[#F2D675] bg-gradient-to-br from-[#D4AF37]/55 via-[#F2D675]/35 to-[#8C6239]/65 hover:border-[#FFFDF8] shadow-[0_14px_45px_rgba(212,175,55,0.45)] hover:shadow-[0_22px_65px_rgba(242,214,117,0.75)]'
                : 'border-[#A8853B]/35 bg-[#FFFDF8] hover:bg-[#FBF6EC] shadow-[0_10px_30px_-5px_rgba(112,70,34,0.08)] hover:shadow-[0_18px_40px_rgba(112,70,34,0.18)] hover:border-[#A8853B]'
            }`}
          >
            <img
              src="/editorial/imperial_monograph.jpg"
              alt={language === 'ar' ? 'اختبار اكتشاف العطر' : language === 'bg' ? 'Откриване на Аромат' : language === 'es' ? 'Descubrimiento Olfativo' : 'Fragrance Discovery'}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 opacity-80 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A08] via-[#0B0A08]/50 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-6 sm:p-7 space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#F2D675] font-cinzel font-bold block">
                {language === 'ar' ? 'مستشار العطور • DISCOVERY' : language === 'bg' ? 'Търсач на Аромати' : language === 'es' ? 'Buscador de Fragancias' : 'FRAGRANCE FINDER'}
              </span>
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#F3E6D0] group-hover:text-[#D4AF37] transition-colors leading-tight">
                {language === 'ar' ? 'اختبار اكتشاف العطر' : language === 'bg' ? 'Откриване на Аромат' : language === 'es' ? 'Descubrimiento Olfativo' : 'Fragrance Discovery'}
              </h3>
              <p className="text-xs text-[#D8BE99] line-clamp-2 leading-relaxed font-sans">
                {language === 'ar'
                  ? 'خض اختباراً تفاعلياً ليكشف لك مستشارنا عن العطر الأنسب لشخصيتك ومناسبتك.'
                  : language === 'bg'
                  ? 'Направете нашия интерактивен тест, за да откриете аромата за вашата персона.'
                  : language === 'es'
                  ? 'Realice nuestro cuestionario interactivo para encontrar el frasco ideal para usted.'
                  : 'Take our bespoke interactive quiz to find the signature flacon tailored to your royal persona.'}
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-[11px] font-cinzel font-bold text-[#D4AF37] group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                <span>{language === 'ar' ? 'بدء اختبار العطور' : language === 'bg' ? 'Започнете теста' : language === 'es' ? 'Iniciar Cuestionario' : 'Start Discovery Quiz'}</span>
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
          {collections.length > 0 && (
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
          )}

          {/* =========================================================================
              4. EXCLUSIVE PALACE OFFERS & DISCOUNTS SECTION
              ========================================================================= */}
          {allProducts.some(p => p.hasDiscount || (p.discountPercent && p.discountPercent > 0) || (p.originalPrice && p.originalPrice > p.price) || p.isOffer) && (
            <OffersDiscountSection products={allProducts} />
          )}

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
                    ? 'bg-gradient-to-br from-[#D4AF37]/55 via-[#F2D675]/35 to-[#8C6239]/65 border-[#F2D675] text-[#FFFDF8] shadow-[0_14px_45px_rgba(212,175,55,0.45)]'
                    : 'bg-[#FFFDF8] hover:bg-[#FBF6EC] border-[#A8853B]/35 text-[#704622] shadow-[0_10px_30px_-5px_rgba(112,70,34,0.08)]'
                }`}>
                  <div className="space-y-3">
                    <div className="flex gap-1 text-[#FFDF8A] dark:text-[#FFDF8A]">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <h4 className="font-cinzel font-bold text-base">"Pure Royalty in a Bottle"</h4>
                    <p className={`text-xs sm:text-sm font-medium leading-relaxed ${isDark ? 'text-[#F3E6D0]' : 'text-[#4A2A14]'}`}>
                      "The projection lasts well past 14 hours with amber and oud notes that develop magnificently."
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#A8853B]/20 dark:border-[#F2D675]/30 flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-[#A8853B] dark:text-[#FFDF8A]">Tariq Al-Hashemi</span>
                    <span className="text-emerald-400 text-xs flex items-center gap-1 font-semibold">
                      <Check className="w-3.5 h-3.5" /> Verified Patron
                    </span>
                  </div>
                </div>

                <div className={`border-2 p-8 flex flex-col justify-between space-y-4 shadow-xl rounded-2xl transition-colors duration-500 ${
                  isDark
                    ? 'bg-gradient-to-br from-[#D4AF37]/55 via-[#F2D675]/35 to-[#8C6239]/65 border-[#F2D675] text-[#FFFDF8] shadow-[0_14px_45px_rgba(212,175,55,0.45)]'
                    : 'bg-[#FFFDF8] hover:bg-[#FBF6EC] border-[#A8853B]/35 text-[#704622] shadow-[0_10px_30px_-5px_rgba(112,70,34,0.08)]'
                }`}>
                  <div className="space-y-3">
                    <div className="flex gap-1 text-[#FFDF8A] dark:text-[#FFDF8A]">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <h4 className="font-cinzel font-bold text-base">"Masterpiece of Modern Luxury"</h4>
                    <p className={`text-xs sm:text-sm font-medium leading-relaxed ${isDark ? 'text-[#F3E6D0]' : 'text-[#4A2A14]'}`}>
                      "Millionaire has commanding leather and spiced cardamom resonance. Highly recommended."
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#A8853B]/20 dark:border-[#F2D675]/30 flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-[#A8853B] dark:text-[#FFDF8A]">Alexander D.</span>
                    <span className="text-emerald-400 text-xs flex items-center gap-1 font-semibold">
                      <Check className="w-3.5 h-3.5" /> Verified Patron
                    </span>
                  </div>
                </div>

                <div className={`border-2 p-8 flex flex-col justify-between space-y-4 shadow-xl rounded-2xl transition-colors duration-500 ${
                  isDark
                    ? 'bg-gradient-to-br from-[#D4AF37]/55 via-[#F2D675]/35 to-[#8C6239]/65 border-[#F2D675] text-[#FFFDF8] shadow-[0_14px_45px_rgba(212,175,55,0.45)]'
                    : 'bg-[#FFFDF8] hover:bg-[#FBF6EC] border-[#A8853B]/35 text-[#704622] shadow-[0_10px_30px_-5px_rgba(112,70,34,0.08)]'
                }`}>
                  <div className="space-y-3">
                    <div className="flex gap-1 text-[#FFDF8A] dark:text-[#FFDF8A]">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <h4 className="font-cinzel font-bold text-base">"Delicious & Elegant"</h4>
                    <p className={`text-xs sm:text-sm font-medium leading-relaxed ${isDark ? 'text-[#F3E6D0]' : 'text-[#4A2A14]'}`}>
                      "Ana Sukkar is sweet and delicate. The spun sugar and white musk blend is heavenly."
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#A8853B]/20 dark:border-[#F2D675]/30 flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-[#A8853B] dark:text-[#FFDF8A]">Layla K.</span>
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
