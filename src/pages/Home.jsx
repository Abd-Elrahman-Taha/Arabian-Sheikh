import React, { useState, useEffect, useRef } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ArabianLogo from '../components/common/ArabianLogo';
import Hero3DFlaconScene from '../components/3d effects/Hero3DFlaconScene';
import PalaceMemoryVideo from '../components/media/PalaceMemoryVideo';
import LuxuryBackgroundShader from '../components/motion/LuxuryBackgroundShader';
import HorizontalCollectionShowcase from '../components/home/HorizontalCollectionShowcase';
import BlurText from '../components/common/BlurText';
import HeroRulerPagination from '../components/home/HeroRulerPagination';
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

  // 3D Hero active flacon (0: Luxury Black Diamond, 1: Royal Millionaire, 2: Classic Ana Sukkar)
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
      id: 'as-royal-arabian-stallion',
      slug: 'black-diamond-luxury',
      tier: 'Imperial Reserve',
      name: 'Arabian Stallion',
      arabicName: 'الفارس العربي',
      spanishName: 'Arabian Stallion',
      bulgarianName: 'Арабски Жребец',
      price: 65,
      size: '60 ml / 2.0 fl oz',
      tagline: 'Sculpted 3D Haute Parfumerie Flacon • 35% Pure Extrait',
      spanishTagline: 'Frasco Esculpido en 3D de Alta Perfumería • 35% Extrait Puro',
      notes: 'Wild Assamese Oud • Taif Royal Rose • Ambergris • Kashmiri Saffron',
      color: '#D4AF37',
      image: '/products/stallion_royal_flacon.png'
    }
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const prods = await productService.getAllProducts();
        setAllProducts(prods);

        // Group products into curated Collections
        const imperialTiersProducts = prods.filter(p => p.tier === 'Luxury' || p.tier === 'Royal' || p.tier === 'Classic');
        const oudAmberProducts = prods.filter(p => 
          p.fragranceFamily?.toLowerCase().includes('woody') || 
          p.fragranceFamily?.toLowerCase().includes('amber') || 
          p.scentFamily?.toLowerCase().includes('oriental') ||
          p.topNotes?.some(n => n.toLowerCase().includes('oud') || n.toLowerCase().includes('amber'))
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
            products: imperialTiersProducts.length > 0 ? imperialTiersProducts : prods.slice(0, 3)
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
            products: oudAmberProducts.length > 0 ? oudAmberProducts : prods.slice(0, 4)
          },
          {
            id: 'col-bakhoor',
            number: 3,
            title: 'Sacred Bakhoor & Incense',
            spanishTitle: 'Bakhoor e Incienso Sagrado',
            bulgarianTitle: 'Бахур и Свещен Тамян',
            tag: 'PALACE MAJLIS RITUALS',
            description: 'Hand-soaked natural chips infused with Taif rose and amber resins.',
            spanishDescription: 'Virutas naturales infusionadas a mano con rosa de Taif y resinas de ámbar.',
            bulgarianDescription: 'Напоени дървесни частици с роза Таиф и кехлибар.',
            accentColor: '#F2D675',
            products: bakhoorProducts.length > 0 ? bakhoorProducts : prods.slice(1, 4)
          },
          {
            id: 'col-pure-oils',
            number: 4,
            title: 'Concentrated Attars & Oils',
            spanishTitle: 'Attars y Aceites Puros',
            bulgarianTitle: 'Чисти Масла и Атари',
            tag: 'ALCOHOL-FREE PURE EXTRACTS',
            description: '100% pure alcohol-free concentrated oils offering an intimate 24+ hour sillage.',
            spanishDescription: 'Aceites puros concentrados sin alcohol con estela continua de 24+ horas.',
            bulgarianDescription: '100% чисти концентрирани масла без алкохол с трайност 24+ часа.',
            accentColor: '#D8BE99',
            products: oilsProducts.length > 0 ? oilsProducts : prods.slice(0, 3)
          },
          {
            id: 'col-palace-bundles',
            number: 5,
            title: 'Palace Coffrets & Sets',
            spanishTitle: 'Estuches Exclusivos',
            bulgarianTitle: 'Дворцови Комплекти',
            tag: 'LIMITED PRESENTATION BOXES',
            description: 'Bespoke presentations encased in velvet-lined lacquer coffrets.',
            spanishDescription: 'Presentaciones exclusivas en estuches lacados de terciopelo.',
            bulgarianDescription: 'Специални сетове в лакирани кутии с кадифе.',
            accentColor: '#D4AF37',
            products: bundlesProducts.length > 0 ? bundlesProducts : prods.slice(0, 3)
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

  // Discovery filtered list
  const discoveryMatches = allProducts.filter(p => {
    if (selectedGender !== 'all' && p.gender?.toLowerCase() !== selectedGender.toLowerCase() && p.gender !== 'Unisex') return false;
    if (selectedFamily !== 'all' && !p.fragranceFamily?.toLowerCase().includes(selectedFamily.toLowerCase())) return false;
    if (selectedOccasion !== 'all' && !p.occasion?.some(o => o.toLowerCase().includes(selectedOccasion.toLowerCase()))) return false;
    return true;
  });

  const getDisplayName = (flacon) => {
    if (!flacon) return '';
    if (language === 'bg' && flacon.bulgarianName) return flacon.bulgarianName;
    if (language === 'es' && flacon.spanishName) return flacon.spanishName;
    return flacon.name;
  };

  const getTagline = (flacon) => {
    if (!flacon) return '';
    if (language === 'es' && flacon.spanishTagline) return flacon.spanishTagline;
    return flacon.tagline;
  };

  const scrollToCollections = () => {
    if (firstCollectionRef.current) {
      firstCollectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-transparent text-[#F3E6D0] overflow-x-hidden">
      
      {/* =========================================================================
          1. HERO SECTION: CENTERED PRODUCT WITH GOLDEN SHADER & BLURRED GRADIENT AURA
          ========================================================================= */}
      <section className="relative min-h-[86vh] lg:min-h-[90vh] flex flex-col justify-between overflow-hidden pt-20 sm:pt-24 lg:pt-28 pb-0">
        
        {/* Clean, Smooth, Noise-Free Luxury Background with Top-Left & Bottom-Right Shaders */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#0B0A08]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#140D07] via-[#0B0A08] to-[#0B0A08]" />
          <div className="absolute top-0 inset-x-0 h-full bg-[radial-gradient(ellipse_at_50%_15%,rgba(212,175,55,0.09),transparent_70%)]" />

          {/* 1. TOP-LEFT Ambient Luxury Fluid Shader */}
          <div className="absolute -top-20 -left-20 w-[380px] sm:w-[520px] lg:w-[680px] h-[380px] sm:h-[520px] lg:h-[680px] rounded-full overflow-hidden pointer-events-none opacity-60 mix-blend-screen filter blur-xl">
            <LuxuryBackgroundShader
              color1="#D4AF37"
              color2="#5A3517"
              color3="#0B0A08"
              opacity={0.65}
              className="w-full h-full"
            />
          </div>

          {/* 2. BOTTOM-RIGHT Ambient Luxury Fluid Shader */}
          <div className="absolute -bottom-20 -right-20 w-[380px] sm:w-[520px] lg:w-[680px] h-[380px] sm:h-[520px] lg:h-[680px] rounded-full overflow-hidden pointer-events-none opacity-55 mix-blend-screen filter blur-xl">
            <LuxuryBackgroundShader
              color1="#F2D675"
              color2="#4A2812"
              color3="#0B0A08"
              opacity={0.60}
              className="w-full h-full"
            />
          </div>
        </div>

        <div className="relative z-10 max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 w-full flex-1 flex flex-col justify-between">
          
          {/* Centered Product Flacon with Left & Right Flank Specs */}
          <div className="relative w-full flex-1 flex flex-col lg:flex-row items-center justify-between my-auto min-h-[46vh] sm:min-h-[52vh] lg:min-h-[580px]">
            
            {/* Left Flank: Product Name Only and Action Button */}
            <div className="w-full lg:w-auto lg:absolute lg:left-0 lg:top-1/2 lg:-translate-y-1/2 lg:max-w-md text-center lg:text-left space-y-4 sm:space-y-6 order-2 lg:order-1 z-20 pointer-events-auto">
              
              {/* Bold Minimalist Product Title */}
              <BlurText
                key={currentHeroFlacon.id}
                text={getDisplayName(currentHeroFlacon).toUpperCase()}
                delay={60}
                animateBy="words"
                direction="top"
                className="text-3xl sm:text-4xl lg:text-5xl font-cinzel font-bold text-[#F3E6D0] tracking-[0.03em] leading-tight drop-shadow-2xl justify-center lg:justify-start"
                as="h1"
              />

              {/* Ultra-Luxury Curved Caramel/Gold Pill CTA Button */}
              <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-3">
                <Link
                  to={`/product/${currentHeroFlacon.slug}`}
                  className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] hover:from-[#F2D675] hover:via-[#D4AF37] hover:to-[#F2D675] text-[#FFFDF8] hover:text-[#0B0A08] border border-[#F2D675]/50 hover:border-[#FFF8E7] font-cinzel font-bold text-xs uppercase tracking-[0.24em] transition-all duration-400 shadow-[0_10px_30px_rgba(140,98,57,0.45)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.65)] hover:scale-105 overflow-hidden cursor-pointer"
                >
                  <span className="relative z-10 drop-shadow-sm">
                    {language === 'ar' ? 'استكشف العطر' : 'FIND OUT MORE'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 relative z-10 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
                </Link>
              </div>

            </div>

            {/* DEAD CENTER: The Active 3D Flacon Standing in the Middle with Overhead Theatrical Spotlight */}
            <div className="w-full max-w-xl mx-auto relative flex items-center justify-center h-[46vh] sm:h-[54vh] lg:h-[600px] order-1 lg:order-2 z-10">
              
              {/* Theatrical Overhead Golden Spotlight Conical Beam */}
              <div className="absolute -top-16 inset-x-0 mx-auto w-64 sm:w-80 lg:w-96 h-[420px] sm:h-[520px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#FFF5D1]/45 via-[#D4AF37]/20 to-transparent blur-2xl pointer-events-none -z-10" />
              
              {/* Spotlight Core Flare Glow */}
              <div className="absolute -top-10 inset-x-0 mx-auto w-28 sm:w-40 h-28 sm:h-40 rounded-full bg-[#FFE899]/35 blur-3xl pointer-events-none -z-10" />
              
              <Hero3DFlaconScene
                activeProductIndex={activeHeroIndex}
                onSlideChange={setActiveHeroIndex}
                products={heroFlacons}
              />
            </div>

            {/* RIGHT FLANK: NEXT UPCOMING PRODUCT CARD */}
            <div className="w-full lg:w-auto lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 flex flex-col items-center lg:items-end text-center lg:text-right order-3 z-20 pointer-events-auto mt-4 lg:mt-0">
              <div
                onClick={() => setActiveHeroIndex(nextHeroIndex)}
                className="group relative cursor-pointer p-3 sm:p-3.5 rounded-2xl bg-[#0B0A08]/85 border border-[#D4AF37]/35 shadow-2xl backdrop-blur-md transition-transform duration-300 hover:scale-105 max-w-[170px] sm:max-w-[190px] flex flex-col items-center lg:items-end space-y-2"
                title={`Next: ${getDisplayName(nextHeroFlacon)}`}
              >
                {/* Header Tag */}
                <div className="flex items-center gap-1 text-[8.5px] uppercase tracking-[0.2em] text-[#F2D675] font-cinzel font-bold">
                  <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
                  <span>{language === 'ar' ? 'التالي' : 'NEXT'}</span>
                  <ChevronRight className="w-3 h-3 text-[#F2D675] group-hover:translate-x-0.5 transition-transform rtl:rotate-180" />
                </div>

                {/* Smaller Next Flacon Preview */}
                <div className="relative w-16 h-24 sm:w-20 sm:h-28 flex items-center justify-center my-0.5">
                  <img
                    src={nextHeroFlacon.image}
                    alt={getDisplayName(nextHeroFlacon)}
                    className="h-full w-auto object-contain filter drop-shadow-[0_10px_18px_rgba(0,0,0,0.9)] group-hover:scale-105 transition-transform duration-300 relative z-10"
                  />
                </div>

                {/* Next Product Title & Tier */}
                <div className="space-y-0.5">
                  <h4 className="font-cinzel text-xs sm:text-sm font-bold text-[#F3E6D0] leading-tight">
                    {getDisplayName(nextHeroFlacon)}
                  </h4>
                  <p className="text-[9.5px] text-[#D8BE99] font-mono font-medium">
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
      <section className="relative z-10 max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-4 sm:pt-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Card 1: Master Alchemist */}
          <div
            onClick={() => navigate('/about')}
            className="group relative h-80 sm:h-96 rounded-3xl overflow-hidden border border-[#D4AF37]/25 bg-black/60 shadow-2xl cursor-pointer hover:border-[#D4AF37] transition-all duration-500 hover:-translate-y-1.5"
          >
            <img
              src="/editorial/master_alchemist.jpg"
              alt="Master Alchemist"
              className="w-full h-full object-cover filter grayscale contrast-125 group-hover:scale-108 transition-transform duration-700 opacity-75 group-hover:opacity-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A08] via-[#0B0A08]/40 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-6 space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#F2D675] font-cinzel font-bold block">
                HAUTE PARFUMERIE
              </span>
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#F3E6D0] group-hover:text-[#D4AF37] transition-colors">
                The Master Alchemist
              </h3>
              <p className="text-xs text-[#D8BE99] line-clamp-2 leading-relaxed">
                Centuries of Andalusian distillation wisdom crafted in numbered crystal flacons.
              </p>
            </div>
          </div>

          {/* Card 2: Flacon Craftsmanship */}
          <div
            onClick={() => navigate('/the-palace')}
            className="group relative h-80 sm:h-96 rounded-3xl overflow-hidden border border-[#D4AF37]/25 bg-black/60 shadow-2xl cursor-pointer hover:border-[#D4AF37] transition-all duration-500 hover:-translate-y-1.5"
          >
            <img
              src="/editorial/flacon_craftsmanship.jpg"
              alt="Flacon Craftsmanship"
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 opacity-80 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A08] via-[#0B0A08]/40 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-6 space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#F2D675] font-cinzel font-bold block">
                MIRROR-GOLD ATELIER
              </span>
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#F3E6D0] group-hover:text-[#D4AF37] transition-colors">
                Flacon Craftsmanship
              </h3>
              <p className="text-xs text-[#D8BE99] line-clamp-2 leading-relaxed">
                Mirror-finished 24K solid gold and obsidian glass sculpted for royal sovereignty.
              </p>
            </div>
          </div>

          {/* Card 3: Imperial Monograph */}
          <div
            onClick={() => navigate('/discovery')}
            className="group relative h-80 sm:h-96 rounded-3xl overflow-hidden border border-[#D4AF37]/25 bg-black/60 shadow-2xl cursor-pointer hover:border-[#D4AF37] transition-all duration-500 hover:-translate-y-1.5"
          >
            <img
              src="/editorial/imperial_monograph.jpg"
              alt="Imperial Monograph"
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 opacity-80 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A08] via-[#0B0A08]/40 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-6 space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#F2D675] font-cinzel font-bold block">
                THE PALACE ARCHIVE
              </span>
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#F3E6D0] group-hover:text-[#D4AF37] transition-colors">
                Imperial Monograph
              </h3>
              <p className="text-xs text-[#D8BE99] line-clamp-2 leading-relaxed">
                The historical formulation treatise and sacred Oud accords of Arabian Sheikh.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          2. CURATED COLLECTIONS EXPERIENCE
          ========================================================================= */}
      <div className="relative overflow-hidden">
        <div className="relative z-10">

          {/* =========================================================================
              2. CURATED COLLECTIONS EXPERIENCE (VERTICAL STACK + HORIZONTAL PRODUCTS)
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
              3. CINEMATIC VIDEO: SCENT AS LIVING MEMORY
              ========================================================================= */}
          <PalaceMemoryVideo
            videoSrc="/intro.mp4"
            posterSrc="/hero_arabian_palace.jpg"
          />

          {/* =========================================================================
              4. INTERACTIVE FRAGRANCE FINDER QUIZ
              ========================================================================= */}
          <section className="py-24 bg-gradient-to-b from-[#0B0A08]/95 via-[#21130D]/90 to-[#0B0A08]/95 border-t border-[#D4AF37]/20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="bg-[#0B0A08]/95 border border-[#D4AF37]/30 p-8 sm:p-12 shadow-2xl space-y-8">
                <div className="text-center space-y-2">
                  <div className="inline-flex p-3 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] mb-2 shadow-sm">
                    <Compass className="w-6 h-6" />
                  </div>
                  <BlurText
                    text="Fragrance Finder"
                    delay={70}
                    animateBy="words"
                    direction="top"
                    className="text-3xl sm:text-4xl font-cinzel font-bold text-[#F3E6D0] drop-shadow-md justify-center"
                    as="h2"
                  />
                  <p className="text-sm text-[#F3E6D0] font-medium max-w-lg mx-auto">
                    Select your olfactory preferences to match your signature creation.
                  </p>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-[#F2D675] font-cinzel font-bold">Gender:</label>
                    <select
                      value={selectedGender}
                      onChange={(e) => setSelectedGender(e.target.value)}
                      className="w-full bg-black/80 border border-[#D4AF37]/40 px-3.5 py-3 rounded text-xs sm:text-sm text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                    >
                      <option value="all">All Profiles</option>
                      <option value="Unisex">Unisex Sovereign</option>
                      <option value="Masculine">Masculine Strength</option>
                      <option value="Feminine">Feminine Elegance</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-[#F2D675] font-cinzel font-bold">Scent Family:</label>
                    <select
                      value={selectedFamily}
                      onChange={(e) => setSelectedFamily(e.target.value)}
                      className="w-full bg-black/80 border border-[#D4AF37]/40 px-3.5 py-3 rounded text-xs sm:text-sm text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                    >
                      <option value="all">All Families</option>
                      <option value="Oriental">Oriental / Amber</option>
                      <option value="Woody">Woody / Oud</option>
                      <option value="Floral">Floral / Gourmand</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-[#F2D675] font-cinzel font-bold">Occasion:</label>
                    <select
                      value={selectedOccasion}
                      onChange={(e) => setSelectedOccasion(e.target.value)}
                      className="w-full bg-black/80 border border-[#D4AF37]/40 px-3.5 py-3 rounded text-xs sm:text-sm text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                    >
                      <option value="all">All Occasions</option>
                      <option value="Evening">Evening / Gala</option>
                      <option value="Daily">Daily Luxury</option>
                      <option value="Royal">Royal Celebrations</option>
                    </select>
                  </div>
                </div>

                {/* Filtered Matches Preview */}
                <div className="pt-6 border-t border-white/15">
                  <div className="flex items-center justify-between mb-4 text-xs sm:text-sm">
                    <span className="text-[#F3E6D0] font-medium">
                      Matched <strong className="text-[#F2D675] text-base">{discoveryMatches.length}</strong> creations:
                    </span>
                    <Link
                      to="/discovery"
                      className="text-[#F2D675] hover:text-[#F3E6D0] font-cinzel font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 transition-colors"
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
                        className="p-4 bg-black/60 border border-white/15 hover:border-[#D4AF37] cursor-pointer transition-colors flex items-center gap-3.5 shadow-lg"
                      >
                        <img
                          src={item.cutoutImage || item.images?.[0]}
                          alt={item.name}
                          className="w-14 h-18 object-contain"
                        />
                        <div>
                          <h4 className="font-cinzel text-sm font-bold text-[#F3E6D0] line-clamp-1">{item.name}</h4>
                          <p className="text-xs text-[#F2D675] font-bold">€{item.price}</p>
                          <span className="text-[10px] uppercase tracking-wider text-[#F3E6D0] font-mono">{item.tier || item.category}</span>
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
          <section className="py-24 bg-[#0B0A08]/95 border-t border-[#D4AF37]/20">
            <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
              
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
                <span className="text-xs uppercase tracking-[0.35em] text-[#F2D675] font-cinzel font-bold">
                  Side-by-Side
                </span>
                <BlurText
                  text="The Three Flacons"
                  delay={70}
                  animateBy="words"
                  direction="top"
                  className="text-3xl sm:text-4xl font-cinzel font-bold text-[#F3E6D0] drop-shadow-md justify-center"
                  as="h2"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-[#D4AF37]/30 text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#0B0A08] border-b border-[#D4AF37]/30">
                      <th className="p-4 font-cinzel text-xs uppercase tracking-widest text-[#F2D675] font-bold w-1/4">Metric</th>
                      {heroFlacons.map((f) => (
                        <th key={f.id} className="p-4 font-cinzel text-base font-bold text-[#F3E6D0] text-center w-1/4">
                          {f.name} ({f.tier})
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    <tr>
                      <td className="p-4 font-bold text-[#F2D675]">Flacon Silhouette</td>
                      {heroFlacons.map((f) => (
                        <td key={f.id} className="p-4 text-center">
                          <img
                            src={f.tier === 'Luxury' ? '/products/black_diamond_gold.png?v=5' : f.tier === 'Royal' ? '/products/millionaire_black.png?v=5' : '/products/ana_sukkar_white.png?v=5'}
                            alt={f.name}
                            className="h-28 mx-auto object-contain filter drop-shadow-lg"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-white/5">
                      <td className="p-4 font-bold text-[#F2D675]">Price & Volume</td>
                      {heroFlacons.map((f) => (
                        <td key={f.id} className="p-4 text-center font-cinzel font-bold text-[#F2D675] text-base">
                          €{f.price} <span className="text-xs text-[#F3E6D0] font-normal">/ {f.size}</span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-[#F2D675]">Key Scent Notes</td>
                      {heroFlacons.map((f) => (
                        <td key={f.id} className="p-4 text-center text-[#F3E6D0] font-medium">
                          {f.notes}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-white/5">
                      <td className="p-4 font-bold text-[#F2D675]">Longevity Profile</td>
                      <td className="p-4 text-center text-[#F3E6D0] font-bold">14+ Hours</td>
                      <td className="p-4 text-center text-[#F3E6D0] font-bold">10-12 Hours</td>
                      <td className="p-4 text-center text-[#F3E6D0] font-bold">8-10 Hours</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-[#F2D675]">Gender Archetype</td>
                      <td className="p-4 text-center text-[#F3E6D0] font-medium">Unisex Sovereign</td>
                      <td className="p-4 text-center text-[#F3E6D0] font-medium">Masculine Strength</td>
                      <td className="p-4 text-center text-[#F3E6D0] font-medium">Feminine Elegance</td>
                    </tr>
                    <tr className="bg-[#0B0A08]">
                      <td className="p-4 font-bold text-[#F2D675]">Action</td>
                      {heroFlacons.map((f) => (
                        <td key={f.id} className="p-4 text-center">
                          <button
                            onClick={() => {
                              const item = allProducts.find(p => p.slug === f.slug);
                              if (item) addToCart(item, '60 ml', 1);
                            }}
                            className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-xs transition-colors cursor-pointer shadow-md"
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
          <section className="py-24 bg-[#0B0A08]/95 border-t border-[#D4AF37]/20">
            <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
              
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
                <span className="text-xs uppercase tracking-[0.35em] text-[#F2D675] font-cinzel font-bold">
                  Testimonials
                </span>
                <h2 className="text-3xl sm:text-4xl font-cinzel font-bold text-[#F3E6D0] drop-shadow-md">
                  Royal Acclaim
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-[#21130D] border border-[#D4AF37]/25 p-8 flex flex-col justify-between space-y-4 shadow-xl">
                  <div className="space-y-3">
                    <div className="flex gap-1 text-[#D4AF37]">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <h4 className="font-cinzel font-bold text-[#F3E6D0] text-base">"Pure Royalty in a Bottle"</h4>
                    <p className="text-xs sm:text-sm text-[#F3E6D0] font-medium leading-relaxed">
                      "The projection lasts well past 14 hours with amber and oud notes that develop magnificently."
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-[#F2D675]">Tariq Al-Hashemi</span>
                    <span className="text-emerald-400 text-xs flex items-center gap-1 font-semibold">
                      <Check className="w-3.5 h-3.5" /> Verified Patron
                    </span>
                  </div>
                </div>

                <div className="bg-[#21130D] border border-[#D4AF37]/25 p-8 flex flex-col justify-between space-y-4 shadow-xl">
                  <div className="space-y-3">
                    <div className="flex gap-1 text-[#D4AF37]">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <h4 className="font-cinzel font-bold text-[#F3E6D0] text-base">"Masterpiece of Modern Luxury"</h4>
                    <p className="text-xs sm:text-sm text-[#F3E6D0] font-medium leading-relaxed">
                      "Millionaire has commanding leather and spiced cardamom resonance. Highly recommended."
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-[#F2D675]">Alexander D.</span>
                    <span className="text-emerald-400 text-xs flex items-center gap-1 font-semibold">
                      <Check className="w-3.5 h-3.5" /> Verified Patron
                    </span>
                  </div>
                </div>

                <div className="bg-[#21130D] border border-[#D4AF37]/25 p-8 flex flex-col justify-between space-y-4 shadow-xl">
                  <div className="space-y-3">
                    <div className="flex gap-1 text-[#D4AF37]">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <h4 className="font-cinzel font-bold text-[#F3E6D0] text-base">"Delicious & Elegant"</h4>
                    <p className="text-xs sm:text-sm text-[#F3E6D0] font-medium leading-relaxed">
                      "Ana Sukkar is sweet and delicate. The spun sugar and white musk blend is heavenly."
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-[#F2D675]">Layla K.</span>
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
          <section className="py-20 border-t border-[#D4AF37]/20 bg-[#0B0A08]">
            <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
              
              {/* 3 Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-16 border-b border-white/15 text-center">
                <div className="space-y-2 flex flex-col items-center">
                  <Truck className="w-8 h-8 text-[#D4AF37] mb-1" />
                  <h4 className="font-cinzel font-bold text-base text-[#F3E6D0]">DHL Express Delivery</h4>
                  <p className="text-xs sm:text-sm text-[#F3E6D0] font-medium">Complimentary royal shipping on orders over €100.</p>
                </div>
                <div className="space-y-2 flex flex-col items-center">
                  <Lock className="w-8 h-8 text-[#D4AF37] mb-1" />
                  <h4 className="font-cinzel font-bold text-base text-[#F3E6D0]">Encrypted Stripe Checkout</h4>
                  <p className="text-xs sm:text-sm text-[#F3E6D0] font-medium">256-bit encrypted global payment processing.</p>
                </div>
                <div className="space-y-2 flex flex-col items-center">
                  <Award className="w-8 h-8 text-[#D4AF37] mb-1" />
                  <h4 className="font-cinzel font-bold text-base text-[#F3E6D0]">100% Authentic Extraits</h4>
                  <p className="text-xs sm:text-sm text-[#F3E6D0] font-medium">Meticulously matured in numbered flacons.</p>
                </div>
              </div>

              {/* Newsletter Box */}
              <div className="max-w-2xl mx-auto text-center pt-16 space-y-4">
                <span className="text-xs uppercase tracking-[0.3em] text-[#F2D675] font-cinzel font-bold">
                  The Sovereign Society
                </span>
                <h3 className="text-2xl sm:text-3xl font-cinzel font-bold text-[#F3E6D0] drop-shadow-md">
                  Enter the world of Arabian Sheikh
                </h3>
                <p className="text-xs sm:text-sm text-[#F3E6D0] font-medium">
                  Receive private invitations to limited flacon reserves and releases.
                </p>
                <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing to Arabian Sheikh Private Society.'); }} className="flex max-w-md mx-auto gap-2 pt-2">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    required
                    className="flex-1 bg-black/80 border border-[#D4AF37]/40 px-4 py-3 text-xs sm:text-sm text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none rounded-xs placeholder-neutral-500"
                  />
                  <button
                    type="submit"
                    className="px-7 py-3 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg"
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
