import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/common/ProductCard';
import ArabianLogo from '../components/common/ArabianLogo';
import Hero3DFlaconScene from '../components/3d effects/Hero3DFlaconScene';
import WebThreads from '../components/motion/WebThreads';
import PalaceMemoryVideo from '../components/media/PalaceMemoryVideo';
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
  Flame,
  Feather,
  Sun,
  Truck,
  RotateCcw,
  Lock
} from 'lucide-react';

export default function Home() {
  const { navigate } = useRouter();
  const { t, language } = useTranslation();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Round 1 Fix #2: Luxury tier (Black Diamond at index 0) is explicit initial default
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [allProducts, setAllProducts] = useState([]);
  const [perfumeTiers, setPerfumeTiers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fragrance discovery quick filter state
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedFamily, setSelectedFamily] = useState('all');
  const [selectedOccasion, setSelectedOccasion] = useState('all');

  useEffect(() => {
    async function loadData() {
      try {
        const [prods, tiers, cats] = await Promise.all([
          productService.getAllProducts(),
          productService.getTiers(),
          productService.getCategories()
        ]);
        setAllProducts(prods);
        setPerfumeTiers(tiers);
        setCategories(cats);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
      notes: 'Ambergris • Cambodian Oud • Fossilized Amber',
      color: '#D4AF37'
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
      tagline: 'Dark charisma, noble woods, and spiced authority.',
      notes: 'Cardamom • Smoky Leather • Aged Sandalwood',
      color: '#C5A059'
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
      tagline: 'Gourmand sweetness, delicate florals, and creamy vanilla.',
      notes: 'Spun Sugar • Vanilla Cream • White Musk',
      color: '#E8D29F'
    }
  ];

  const currentHeroFlacon = heroFlacons[activeHeroIndex];

  // Best sellers
  const bestSellers = allProducts.filter(p => p.isBestSeller || p.category === 'perfumes').slice(0, 4);

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

  return (
    <div className="w-full bg-[#0A0A0B] text-[#F8F5F0] overflow-x-hidden">
      
      {/* =========================================================================
          1. HERO SECTION: WEBGL WEBTHREADS BACKGROUND + 3D FLOATING FLACON
          ========================================================================= */}
      <section className="relative min-h-[92vh] lg:min-h-[96vh] flex items-center justify-center overflow-hidden pt-28 sm:pt-32 lg:pt-36 pb-16">
        
        {/* Interactive WebGL Shader Background (WebThreads) */}
        <div className="absolute inset-0 z-0 pointer-events-auto opacity-75">
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <WebThreads
              color1="#D4AF37"
              color2="#8C6D37"
              color3="#FFFFFF"
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

        {/* Ambient Dark Gradient Vignette */}
        <div className="absolute inset-0 bg-radial-vignette pointer-events-none z-1" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-[#0A0A0B]/80 pointer-events-none z-1" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Hero Editorial Content */}
            <div className="lg:col-span-6 text-center lg:text-left space-y-6">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#D4AF37]/30 bg-[#121010]/80 backdrop-blur-md text-[11px] uppercase tracking-[0.25em] text-[#D4AF37]">
                <Crown className="w-3.5 h-3.5" />
                <span>{currentHeroFlacon.tier} Tier • €{currentHeroFlacon.price} / 60ml</span>
              </div>

              {/* Headlines */}
              <div className="space-y-3">
                <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-[#C5A059] font-cinzel">
                  {language === 'es' ? 'EL ARTE DE LA PERFUMERÍA ÁRABE MODERNA' : 'THE ART OF MODERN ARABIAN PERFUMERY'}
                </p>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-cinzel font-bold text-[#F8F5F0] tracking-[0.08em] leading-tight">
                  {getDisplayName(currentHeroFlacon)}
                </h1>
                <p className="text-sm sm:text-base text-[#D0C7B8] font-sans font-light tracking-wide max-w-xl mx-auto lg:mx-0">
                  {language === 'es' ? 'Descubra una firma olfativa creada para ser recordada siempre.' : 'Discover a signature made to be remembered.'}
                </p>
              </div>

              {/* Notes Highlight */}
              <div className="py-2 text-xs uppercase tracking-widest text-[#8C6D37] font-mono">
                {currentHeroFlacon.notes}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/shop?category=perfumes"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#D4AF37] hover:bg-[#E5C07B] text-black font-cinzel font-bold text-xs uppercase tracking-[0.22em] transition-all duration-300 shadow-[0_10px_25px_rgba(212,175,55,0.3)] hover:scale-102 flex items-center justify-center gap-2"
                >
                  <span>{language === 'es' ? 'Explorar Perfumes' : 'Explore Perfumes'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to={`/product/${currentHeroFlacon.slug}`}
                  className="w-full sm:w-auto px-8 py-3.5 bg-transparent hover:bg-white/5 text-[#F8F5F0] border border-[#D4AF37]/40 hover:border-[#D4AF37] font-cinzel font-semibold text-xs uppercase tracking-[0.22em] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>{language === 'es' ? 'Detalles del Frasco' : 'Discover Flacon'}</span>
                </Link>
              </div>

              {/* Tier Slide Switcher Controls */}
              <div className="pt-6 border-t border-white/10 flex items-center justify-center lg:justify-start gap-3">
                <span className="text-[11px] uppercase tracking-widest text-[#8C6D37] font-cinzel">
                  {language === 'es' ? 'Seleccionar Gama:' : 'Select Tier:'}
                </span>
                {heroFlacons.map((flacon, idx) => (
                  <button
                    key={flacon.id}
                    onClick={() => setActiveHeroIndex(idx)}
                    className={`px-3.5 py-1.5 rounded text-xs font-cinzel tracking-wider uppercase transition-all duration-300 ${
                      activeHeroIndex === idx
                        ? 'bg-[#D4AF37] text-black font-bold shadow-md scale-105'
                        : 'bg-white/5 text-[#C5A059] hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {flacon.tier} (€{flacon.price})
                  </button>
                ))}
              </div>
            </div>

            {/* Right Hero: Three.js 3D Floating Flacon (No flat card backdrop!) */}
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
          2. FEATURED PERFUME SPOTLIGHT (ASYMMETRICAL LUXURY EDITORIAL)
          ========================================================================= */}
      <section className="py-24 border-t border-[#D4AF37]/15 bg-gradient-to-b from-[#0A0A0B] via-[#120E0C] to-[#0A0A0B] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Spotlight Image */}
            <div className="lg:col-span-5 relative flex items-center justify-center p-8 bg-[#141212] border border-[#D4AF37]/20 shadow-2xl">
              <img
                src="/products/black_diamond_gold.png"
                alt="Black Diamond Flacon"
                className="max-h-[460px] w-auto object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)] hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4 px-3 py-1 bg-[#D4AF37] text-black font-cinzel font-bold text-[10px] uppercase tracking-widest">
                Imperial Spotlight
              </div>
            </div>

            {/* Spotlight Details */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-cinzel">
                  Haute Parfumerie • Luxury Tier
                </span>
                <h2 className="text-3xl sm:text-4xl font-cinzel font-bold text-[#F8F5F0] tracking-wide">
                  Black Diamond — €50 (60 ml)
                </h2>
                <p className="text-sm text-[#C5A059] font-serif italic">
                  "Distilled in the noble tradition of Andalusian royal courtiers."
                </p>
              </div>

              <p className="text-sm text-[#D0C7B8] leading-relaxed font-sans">
                The signature sovereign of Arabian Sheikh. Enclosed in a lustrous golden vessel and crowned with our signature royal finial. Delivers a profound sillage of aged Assamese agarwood, golden fossilized amber, and smoky saffron.
              </p>

              {/* Fragrance Specifications Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-white/10 text-xs">
                <div>
                  <span className="block text-[#8C6D37] uppercase tracking-wider text-[10px]">Gender</span>
                  <span className="font-semibold text-[#F8F5F0]">Unisex Sovereign</span>
                </div>
                <div>
                  <span className="block text-[#8C6D37] uppercase tracking-wider text-[10px]">Longevity</span>
                  <span className="font-semibold text-[#D4AF37]">14+ Hours</span>
                </div>
                <div>
                  <span className="block text-[#8C6D37] uppercase tracking-wider text-[10px]">Season</span>
                  <span className="font-semibold text-[#F8F5F0]">Autumn / Winter</span>
                </div>
                <div>
                  <span className="block text-[#8C6D37] uppercase tracking-wider text-[10px]">Availability</span>
                  <span className="font-semibold text-emerald-400">In Stock (25 Left)</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => {
                    const blackDiamond = allProducts.find(p => p.slug === 'black-diamond-luxury');
                    if (blackDiamond) addToCart(blackDiamond, '60 ml', 1);
                  }}
                  className="px-8 py-3.5 bg-[#D4AF37] hover:bg-[#E5C07B] text-black font-cinzel font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-lg flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{language === 'es' ? 'Añadir a la Bolsa (€50)' : 'Add to Bag (€50)'}</span>
                </button>

                <Link
                  to="/product/black-diamond-luxury"
                  className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-[#F8F5F0] border border-white/20 font-cinzel text-xs uppercase tracking-[0.2em] transition-colors"
                >
                  {language === 'es' ? 'Ver Detalles Completos' : 'View Product Details'}
                </Link>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          3. THREE PERFUME TIERS (CLASSIC €30, ROYAL €40, LUXURY €50)
          ========================================================================= */}
      <section className="py-24 bg-[#0D0B0B] border-t border-[#D4AF37]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase tracking-[0.35em] text-[#D4AF37] font-cinzel">
              Exquisite Hierarchy
            </span>
            <h2 className="text-3xl sm:text-4xl font-cinzel font-bold text-[#F8F5F0]">
              The Three Perfume Tiers
            </h2>
            <p className="text-xs sm:text-sm text-[#A69E94] font-sans">
              Fixed 60 ml flacons crafted with distinct concentrations and artistic expressions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {perfumeTiers.map((tier) => (
              <div
                key={tier.id}
                className="group relative bg-[#121010] border border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all duration-500 p-8 flex flex-col justify-between shadow-xl hover:-translate-y-2"
              >
                <div>
                  {/* Tier Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                    <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-cinzel font-bold">
                      {tier.name}
                    </span>
                    <span className="font-cinzel text-xl font-bold text-[#D4AF37]">
                      €{tier.price}
                    </span>
                  </div>

                  {/* Flacon Image */}
                  <div className="aspect-[4/5] flex items-center justify-center p-4 mb-6 bg-black/40 relative overflow-hidden">
                    <img
                      src={tier.image}
                      alt={tier.name}
                      className="max-h-[85%] w-auto object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] group-hover:scale-108 transition-transform duration-700"
                    />
                  </div>

                  <h3 className="font-cinzel text-lg font-bold text-[#F8F5F0] mb-1">
                    {tier.bottle}
                  </h3>
                  <p className="text-xs text-[#8C6D37] mb-3 font-mono">{tier.size}</p>
                  <p className="text-xs text-[#A69E94] font-sans leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10">
                  <Link
                    to={`/shop?tier=${tier.filterParam}`}
                    className="w-full py-3 bg-white/5 hover:bg-[#D4AF37] text-[#F8F5F0] hover:text-black font-cinzel text-xs uppercase tracking-[0.2em] font-semibold flex items-center justify-center gap-2 transition-all duration-300"
                  >
                    <span>Browse {tier.id} Flacons</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          4. SHOP BY CATEGORY (PERFUMES, OILS, BAKHOOR, COSMETICS, BUNDLES)
          ========================================================================= */}
      <section className="py-24 border-t border-[#D4AF37]/15 bg-[#0A0A0B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase tracking-[0.35em] text-[#D4AF37] font-cinzel">
              Prestige Catalog
            </span>
            <h2 className="text-3xl sm:text-4xl font-cinzel font-bold text-[#F8F5F0]">
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm text-[#A69E94]">
              Explore handcrafted creations spanning pure extracts, oils, incense, and coffrets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="group relative bg-[#121010] border border-[#D4AF37]/15 hover:border-[#D4AF37]/60 p-6 flex flex-col justify-between transition-all duration-400 hover:-translate-y-1 shadow-lg"
              >
                <div className="aspect-square flex items-center justify-center p-4 bg-black/50 mb-4 overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="max-h-[85%] w-auto object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div>
                  <h3 className="font-cinzel text-sm font-bold text-[#F8F5F0] group-hover:text-[#D4AF37] transition-colors">
                    {language === 'bg' ? cat.bulgarianName : cat.name}
                  </h3>
                  <p className="text-[11px] text-[#8C6D37] mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-[#D4AF37] font-cinzel">
                  <span>Explore</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          CINEMATIC VIDEO: SCENT AS LIVING MEMORY
          ========================================================================= */}
      <PalaceMemoryVideo
        videoSrc="/intro.mp4"
        posterSrc="/hero_arabian_palace.jpg"
      />

      {/* =========================================================================
          5. BESTSELLERS & SIGNATURE COLLECTION
          ========================================================================= */}
      <section className="py-24 bg-[#0D0B0B] border-t border-[#D4AF37]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-cinzel">
                Curated Prestige
              </span>
              <h2 className="text-2xl sm:text-3xl font-cinzel font-bold text-[#F8F5F0]">
                Signature Flacons & Bestsellers
              </h2>
            </div>

            <Link
              to="/shop"
              className="px-6 py-2.5 bg-white/5 hover:bg-[#D4AF37] text-[#F8F5F0] hover:text-black border border-[#D4AF37]/30 text-xs font-cinzel uppercase tracking-[0.2em] transition-all duration-300"
            >
              View Full Catalog
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          6. FRAGRANCE DISCOVERY / SCENT FINDER QUIZ
          ========================================================================= */}
      <section className="py-24 bg-gradient-to-b from-[#0A0A0B] via-[#14100D] to-[#0A0A0B] border-t border-[#D4AF37]/15">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-[#121010]/95 border border-[#D4AF37]/30 p-8 sm:p-12 shadow-2xl space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex p-3 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] mb-2">
                <Compass className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-cinzel font-bold text-[#F8F5F0]">
                Interactive Fragrance Finder
              </h2>
              <p className="text-xs sm:text-sm text-[#A69E94] max-w-xl mx-auto">
                Filter by your preferred atmosphere, olfactory family, and occasion to find your signature Andalusian creation.
              </p>
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              {/* Gender */}
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest text-[#8C6D37] font-cinzel">
                  Gender Preference:
                </label>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2.5 rounded text-xs text-[#F8F5F0] focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="all">All Genders</option>
                  <option value="Unisex">Unisex Sovereign</option>
                  <option value="Masculine">Masculine Strength</option>
                  <option value="Feminine">Feminine Elegance</option>
                </select>
              </div>

              {/* Olfactory Family */}
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest text-[#8C6D37] font-cinzel">
                  Fragrance Family:
                </label>
                <select
                  value={selectedFamily}
                  onChange={(e) => setSelectedFamily(e.target.value)}
                  className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2.5 rounded text-xs text-[#F8F5F0] focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="all">All Families</option>
                  <option value="Oriental">Oriental / Amber</option>
                  <option value="Woody">Woody / Oud</option>
                  <option value="Floral">Floral / Gourmand</option>
                </select>
              </div>

              {/* Occasion */}
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest text-[#8C6D37] font-cinzel">
                  Occasion:
                </label>
                <select
                  value={selectedOccasion}
                  onChange={(e) => setSelectedOccasion(e.target.value)}
                  className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2.5 rounded text-xs text-[#F8F5F0] focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="all">All Occasions</option>
                  <option value="Evening">Evening / Gala</option>
                  <option value="Daily">Daily Luxury</option>
                  <option value="Royal">Royal Celebrations</option>
                </select>
              </div>
            </div>

            {/* Filtered Matches Preview */}
            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-4 text-xs">
                <span className="text-[#A69E94]">
                  Found <strong className="text-[#D4AF37]">{discoveryMatches.length}</strong> matching creations:
                </span>
                <Link
                  to="/discovery"
                  className="text-[#D4AF37] hover:underline font-cinzel uppercase tracking-wider text-[11px] flex items-center gap-1"
                >
                  <span>Take Guided Scent Journey</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {discoveryMatches.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/product/${item.slug || item.id}`)}
                    className="p-4 bg-black/40 border border-white/10 hover:border-[#D4AF37]/60 cursor-pointer transition-colors flex items-center gap-3"
                  >
                    <img
                      src={item.cutoutImage || item.images?.[0]}
                      alt={item.name}
                      className="w-12 h-16 object-contain"
                    />
                    <div>
                      <h4 className="font-cinzel text-xs font-bold text-[#F8F5F0] line-clamp-1">{item.name}</h4>
                      <p className="text-[11px] text-[#D4AF37] font-semibold">€{item.price}</p>
                      <span className="text-[9px] uppercase tracking-wider text-[#8C6D37]">{item.tier || item.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          7. PRODUCT COMPARISON MATRIX
          ========================================================================= */}
      <section className="py-24 bg-[#0D0B0B] border-t border-[#D4AF37]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase tracking-[0.35em] text-[#D4AF37] font-cinzel">
              Side-by-Side Analysis
            </span>
            <h2 className="text-3xl sm:text-4xl font-cinzel font-bold text-[#F8F5F0]">
              The Three Flacons Comparison
            </h2>
            <p className="text-xs sm:text-sm text-[#A69E94]">
              Compare our official signature creations in detail.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-[#D4AF37]/20 text-xs">
              <thead>
                <tr className="bg-[#181515] border-b border-[#D4AF37]/20">
                  <th className="p-4 font-cinzel text-xs uppercase tracking-widest text-[#8C6D37] w-1/4">Metric</th>
                  {heroFlacons.map((f) => (
                    <th key={f.id} className="p-4 font-cinzel text-sm font-bold text-[#D4AF37] text-center w-1/4">
                      {f.name} ({f.tier})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {/* Flacon Image */}
                <tr>
                  <td className="p-4 font-semibold text-[#A69E94]">Flacon Silhouette</td>
                  {heroFlacons.map((f) => (
                    <td key={f.id} className="p-4 text-center">
                      <img
                        src={f.tier === 'Luxury' ? '/products/black_diamond_gold.png' : f.tier === 'Royal' ? '/products/millionaire_black.png' : '/products/ana_sukkar_white.png'}
                        alt={f.name}
                        className="h-28 mx-auto object-contain filter drop-shadow-md"
                      />
                    </td>
                  ))}
                </tr>
                {/* Price & Size */}
                <tr className="bg-white/2">
                  <td className="p-4 font-semibold text-[#A69E94]">Price & Volume</td>
                  {heroFlacons.map((f) => (
                    <td key={f.id} className="p-4 text-center font-cinzel font-bold text-[#D4AF37] text-sm">
                      €{f.price} <span className="text-xs text-[#A69E94] font-normal">/ {f.size}</span>
                    </td>
                  ))}
                </tr>
                {/* Olfactory Notes */}
                <tr>
                  <td className="p-4 font-semibold text-[#A69E94]">Key Scent Notes</td>
                  {heroFlacons.map((f) => (
                    <td key={f.id} className="p-4 text-center text-[#E5E0D8]">
                      {f.notes}
                    </td>
                  ))}
                </tr>
                {/* Longevity */}
                <tr className="bg-white/2">
                  <td className="p-4 font-semibold text-[#A69E94]">Longevity Profile</td>
                  <td className="p-4 text-center text-[#D4AF37] font-semibold">14+ Hours (Ultra Long)</td>
                  <td className="p-4 text-center text-[#D4AF37] font-semibold">10-12 Hours</td>
                  <td className="p-4 text-center text-[#D4AF37] font-semibold">8-10 Hours</td>
                </tr>
                {/* Gender */}
                <tr>
                  <td className="p-4 font-semibold text-[#A69E94]">Gender Archetype</td>
                  <td className="p-4 text-center text-[#F8F5F0]">Unisex Sovereign</td>
                  <td className="p-4 text-center text-[#F8F5F0]">Masculine Strength</td>
                  <td className="p-4 text-center text-[#F8F5F0]">Feminine Elegance</td>
                </tr>
                {/* Add to Cart Action */}
                <tr className="bg-[#181515]">
                  <td className="p-4 font-semibold text-[#A69E94]">Action</td>
                  {heroFlacons.map((f) => (
                    <td key={f.id} className="p-4 text-center">
                      <button
                        onClick={() => {
                          const item = allProducts.find(p => p.slug === f.slug);
                          if (item) addToCart(item, '60 ml', 1);
                        }}
                        className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E5C07B] text-black font-cinzel font-bold text-[11px] uppercase tracking-wider rounded-xs transition-colors"
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
          8. REVIEWS & SOCIAL PROOF
          ========================================================================= */}
      <section className="py-24 bg-[#0A0A0B] border-t border-[#D4AF37]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase tracking-[0.35em] text-[#D4AF37] font-cinzel">
              Authentic Patron Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-cinzel font-bold text-[#F8F5F0]">
              Verified Royal Acclaim
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#121010] border border-[#D4AF37]/20 p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex gap-1 text-[#D4AF37]">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <h4 className="font-cinzel font-bold text-[#F8F5F0] text-sm">"Pure Royalty in a Bottle"</h4>
                <p className="text-xs text-[#A69E94] leading-relaxed">
                  "The Black Diamond gold flacon has an incredible weight and presence. The projection lasts well past 14 hours with amber and oud notes that develop magnificently."
                </p>
              </div>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#F8F5F0]">Tariq Al-Hashemi</span>
                <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                  <Check className="w-3 h-3" /> Verified Patron
                </span>
              </div>
            </div>

            <div className="bg-[#121010] border border-[#D4AF37]/20 p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex gap-1 text-[#D4AF37]">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <h4 className="font-cinzel font-bold text-[#F8F5F0] text-sm">"Masterpiece of Modern Luxury"</h4>
                <p className="text-xs text-[#A69E94] leading-relaxed">
                  "Millionaire has this commanding leather and spiced cardamom resonance. I wear it to international board meetings and galas. Highly recommended."
                </p>
              </div>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#F8F5F0]">Alexander D.</span>
                <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                  <Check className="w-3 h-3" /> Verified Patron
                </span>
              </div>
            </div>

            <div className="bg-[#121010] border border-[#D4AF37]/20 p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex gap-1 text-[#D4AF37]">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <h4 className="font-cinzel font-bold text-[#F8F5F0] text-sm">"Irresistibly Delicious & Elegant"</h4>
                <p className="text-xs text-[#A69E94] leading-relaxed">
                  "Ana Sukkar is sweet without being synthetic. The spun sugar and white musk blend is heavenly and comforting. The porcelain bottle is gorgeous."
                </p>
              </div>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#F8F5F0]">Layla K.</span>
                <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                  <Check className="w-3 h-3" /> Verified Patron
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          9. TRUST & NEWSLETTER LAYER
          ========================================================================= */}
      <section className="py-20 border-t border-[#D4AF37]/15 bg-[#080707]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* 3 Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-16 border-b border-white/10 text-center">
            <div className="space-y-2 flex flex-col items-center">
              <Truck className="w-7 h-7 text-[#D4AF37] mb-1" />
              <h4 className="font-cinzel font-bold text-sm text-[#F8F5F0]">DHL Express Global Delivery</h4>
              <p className="text-xs text-[#A69E94]">Complimentary tracked royal shipping on orders over €100.</p>
            </div>
            <div className="space-y-2 flex flex-col items-center">
              <Lock className="w-7 h-7 text-[#D4AF37] mb-1" />
              <h4 className="font-cinzel font-bold text-sm text-[#F8F5F0]">Encrypted Stripe Checkout</h4>
              <p className="text-xs text-[#A69E94]">Full 3D-Secure 256-bit encrypted global payment processing.</p>
            </div>
            <div className="space-y-2 flex flex-col items-center">
              <Award className="w-7 h-7 text-[#D4AF37] mb-1" />
              <h4 className="font-cinzel font-bold text-sm text-[#F8F5F0]">100% Authentic Andalusian Distillates</h4>
              <p className="text-xs text-[#A69E94]">Meticulously matured extraits in certified numbered flacons.</p>
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="max-w-2xl mx-auto text-center pt-16 space-y-4">
            <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-cinzel">
              The Sovereign Society
            </span>
            <h3 className="text-2xl sm:text-3xl font-cinzel font-bold text-[#F8F5F0]">
              Enter the world of Arabian Sheikh
            </h3>
            <p className="text-xs text-[#A69E94]">
              Receive private invitations to limited flacon reserves, private salon releases, and olfactory monographs.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing to Arabian Sheikh Private Society.'); }} className="flex max-w-md mx-auto gap-2 pt-2">
              <input
                type="email"
                placeholder="Enter your email address"
                required
                className="flex-1 bg-black/60 border border-[#D4AF37]/30 px-4 py-3 text-xs text-[#F8F5F0] focus:border-[#D4AF37] focus:outline-none rounded-xs"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#D4AF37] hover:bg-[#E5C07B] text-black font-cinzel font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Join
              </button>
            </form>
          </div>

        </div>
      </section>

    </div>
  );
}
