import React, { useState, useEffect, useRef } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ArabianLogo from '../components/common/ArabianLogo';
import Hero3DFlaconScene from '../components/3d effects/Hero3DFlaconScene';
import WebThreads from '../components/motion/WebThreads';
import PalaceMemoryVideo from '../components/media/PalaceMemoryVideo';
import BackgroundAtmosphere from '../components/motion/BackgroundAtmosphere';
import LuxuryBackgroundShader from '../components/motion/LuxuryBackgroundShader';
import HorizontalCollectionShowcase from '../components/home/HorizontalCollectionShowcase';
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
      id: 'as-luxury-black-diamond',
      slug: 'black-diamond-luxury',
      tier: 'Luxury',
      name: 'Black Diamond',
      spanishName: 'Black Diamond',
      bulgarianName: 'Черен Диамант',
      price: 50,
      size: '60 ml / 2.0 fl oz',
      tagline: 'The ultimate golden crown of Arabian perfumery.',
      spanishTagline: 'La cumbre de la alta perfumería andalusí.',
      notes: 'Ambergris • Cambodian Oud • Fossilized Amber',
      color: '#D4AF37',
      image: '/products/black_diamond_gold.png?v=5'
    },
    {
      id: 'as-royal-millionaire',
      slug: 'millionaire-royal',
      tier: 'Royal',
      name: 'Millionaire',
      spanishName: 'Millionaire',
      bulgarianName: 'Милионер',
      price: 40,
      size: '60 ml / 2.0 fl oz',
      tagline: 'Obsidian authority, noble woods, and spiced charisma.',
      spanishTagline: 'Autoridad en obsidiana, maderas nobles y carisma.',
      notes: 'Cardamom • Smoky Leather • Aged Sandalwood',
      color: '#D4AF37',
      image: '/products/millionaire_black.png?v=5'
    },
    {
      id: 'as-classic-ana-sukkar',
      slug: 'ana-sukkar-classic',
      tier: 'Classic',
      name: 'Ana Sukkar',
      spanishName: 'Ana Sukkar',
      bulgarianName: 'Ана Сукар',
      price: 30,
      size: '60 ml / 2.0 fl oz',
      tagline: 'Delicate floral nectar, spun sugar, and comforting vanilla.',
      spanishTagline: 'Néctar floral delicado, azúcar hilado y vainilla suave.',
      notes: 'Spun Sugar • Vanilla Cream • White Musk',
      color: '#D4AF37',
      image: '/products/ana_sukkar_white.png?v=5'
    }
  ];

  // Auto-scroll / advance to next 3D product every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroFlacons.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [heroFlacons.length]);

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

  // Discovery filtered list
  const discoveryMatches = allProducts.filter(p => {
    if (selectedGender !== 'all' && p.gender?.toLowerCase() !== selectedGender.toLowerCase() && p.gender !== 'Unisex') return false;
    if (selectedFamily !== 'all' && !p.fragranceFamily?.toLowerCase().includes(selectedFamily.toLowerCase())) return false;
    if (selectedOccasion !== 'all' && !p.occasion?.some(o => o.toLowerCase().includes(selectedOccasion.toLowerCase()))) return false;
    return true;
  });

  const getDisplayName = (flacon) => {
    if (language === 'bg' && flacon.bulgarianName) return flacon.bulgarianName;
    if (language === 'es' && flacon.spanishName) return flacon.spanishName;
    return flacon.name;
  };

  const getTagline = (flacon) => {
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
          1. HERO SECTION: 3.5s AUTO-CYCLING 3D FLACON (PRICE-FREE & ULTRA LUXURY)
          ========================================================================= */}
      <section className="relative min-h-[92vh] lg:min-h-[96vh] flex items-center justify-center overflow-hidden pt-28 sm:pt-32 lg:pt-36 pb-16">
        
        {/* Interactive WebGL Shader Background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-75">
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <WebThreads
              color1="#D4AF37"
              color2="#D8BE99"
              color3="#F3E6D0"
              speed={0.2}
              threadCount={6}
              frequency={5.0}
              spread={0.18}
              taper={1.0}
              position={0.5}
              fanMode="center"
              glow={0.025}
              falloff={0.55}
              thickness={1.1}
              brightness={0.65}
              opacity={0.85}
              mirror={true}
              shimmer={false}
              grain={true}
              grainIntensity={0.05}
              mouseInteraction={true}
              mouseStrength={0.3}
            />
          </div>
        </div>

        {/* Ambient Vignette */}
        <div className="absolute inset-0 bg-radial-vignette pointer-events-none z-1" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A08] via-transparent to-[#0B0A08]/80 pointer-events-none z-1" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Hero Editorial Content */}
            <div className="lg:col-span-6 text-center lg:text-left space-y-6">
              
              {/* Clean Badge (No Price) */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/40 bg-[#0B0A08]/90 backdrop-blur-md text-xs uppercase tracking-[0.25em] text-[#F2D675] font-bold shadow-md">
                <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{currentHeroFlacon.tier} Tier • 60ml Extrait</span>
              </div>

              {/* Minimal Headlines */}
              <div className="space-y-2.5">
                <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-[#F2D675] font-cinzel font-bold drop-shadow-md">
                  HAUTE PARFUMERIE • ANDALUSIA
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-cinzel font-bold text-[#F3E6D0] tracking-[0.04em] leading-tight drop-shadow-lg">
                  {getDisplayName(currentHeroFlacon)}
                </h1>
                <p className="text-sm sm:text-base text-[#F3E6D0] font-sans font-medium tracking-wide max-w-xl mx-auto lg:mx-0">
                  {getTagline(currentHeroFlacon)}
                </p>
              </div>

              {/* Scent Notes */}
              <div className="text-xs sm:text-sm uppercase tracking-widest text-[#F2D675] font-mono font-semibold">
                {currentHeroFlacon.notes}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={scrollToCollections}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel font-bold text-xs uppercase tracking-[0.22em] transition-all duration-300 shadow-xl hover:scale-102 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>{language === 'es' ? 'Explorar Colecciones' : 'Explore Collections'}</span>
                  <ChevronDown className="w-4 h-4 animate-bounce" />
                </button>

                <Link
                  to={`/product/${currentHeroFlacon.slug}`}
                  className="w-full sm:w-auto px-8 py-3.5 bg-black/60 hover:bg-white/10 text-[#F3E6D0] border border-[#D4AF37]/50 hover:border-[#D4AF37] font-cinzel font-bold text-xs uppercase tracking-[0.22em] transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
                >
                  <span>{language === 'es' ? 'Descubrir Frasco' : 'Discover Flacon'}</span>
                </Link>
              </div>

              {/* Tier Slide Switcher Controls (No Price in Buttons) */}
              <div className="pt-6 border-t border-white/15 flex items-center justify-center lg:justify-start gap-2.5">
                {heroFlacons.map((flacon, idx) => (
                  <button
                    key={flacon.id}
                    onClick={() => setActiveHeroIndex(idx)}
                    className={`px-4 py-2 rounded text-xs font-cinzel tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                      activeHeroIndex === idx
                        ? 'bg-[#D4AF37] text-black font-bold shadow-lg scale-105'
                        : 'bg-black/60 text-[#F3E6D0] hover:bg-white/15 border border-white/20'
                    }`}
                  >
                    {flacon.tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Hero: 3D Floating Flacon */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <Hero3DFlaconScene
                activeProductIndex={activeHeroIndex}
                onSlideChange={setActiveHeroIndex}
                products={heroFlacons}
              />
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          ATMOSPHERIC WEBGL SHADERS & TWINKLING CELESTIAL STARS
          ========================================================================= */}
      <div className="relative overflow-hidden">
        {/* Organic Golden Amber Fluid GLSL WebGL Shader */}
        <LuxuryBackgroundShader
          color1="#D4AF37"
          color2="#3A2116"
          color3="#0B0A08"
          opacity={0.55}
          className="absolute inset-0 pointer-events-none z-0"
        />

        {/* Twinkling Celestial Diamond Stars & Mist */}
        <BackgroundAtmosphere
          starCount={40}
          smokeIntensity={0.06}
          className="absolute inset-0 pointer-events-none z-0"
        />

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
                  <h2 className="text-3xl sm:text-4xl font-cinzel font-bold text-[#F3E6D0] drop-shadow-md">
                    Fragrance Finder
                  </h2>
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
                <span className="text-xs uppercase tracking-[0.35em] text-[#F2D675] font-cinzel font-bold">
                  Side-by-Side
                </span>
                <h2 className="text-3xl sm:text-4xl font-cinzel font-bold text-[#F3E6D0] drop-shadow-md">
                  The Three Flacons
                </h2>
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
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
