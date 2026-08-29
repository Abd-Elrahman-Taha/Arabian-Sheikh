import React, { useState, useEffect } from 'react';
import { useRouter } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { productService } from '../services/productService';
import { productApi } from '../api/product.api';
import ProductCard from '../components/common/ProductCard';
import { ProductSkeleton } from '../components/common/SkeletonLoader';
import {
  SlidersHorizontal,
  Search,
  X,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Layers,
  Crown
} from 'lucide-react';

import BlurText from '../components/common/BlurText';

export default function Shop() {
  const { queryParams, navigate } = useRouter();
  const { t, language, isRtl } = useTranslation();
  const { isDark } = useTheme();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [apiCategories, setApiCategories] = useState([
    { id: 1, name: 'Perfumes', slug: 'perfumes' },
    { id: 2, name: 'Oils', slug: 'oils' },
    { id: 3, name: 'Bakhoor', slug: 'bakhoor' },
    { id: 4, name: 'Cosmetics', slug: 'cosmetics' },
    { id: 5, name: 'Bundles', slug: 'bundles' }
  ]);

  const initialCategory = queryParams.get('category') || 'all';
  const initialTier = queryParams.get('tier') || 'all';
  const initialGender = queryParams.get('gender') || 'all';
  const initialFamily = queryParams.get('family') || 'all';
  const initialSearch = queryParams.get('search') || '';
  const initialSort = queryParams.get('sort') || 'featured';

  const [category, setCategory] = useState(initialCategory);
  const [tier, setTier] = useState(initialTier);
  const [gender, setGender] = useState(initialGender);
  const [family, setFamily] = useState(initialFamily);
  const [search, setSearch] = useState(initialSearch);
  const [maxPrice, setMaxPrice] = useState(500);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState(initialSort);

  useEffect(() => {
    async function loadCategories() {
      try {
        const list = await productApi.getCategories().catch(() => null) || await productApi.adminGetCategories().catch(() => null);
        if (Array.isArray(list) && list.length > 0) {
          setApiCategories(list);
        }
      } catch {}
    }
    loadCategories();
  }, []);

  useEffect(() => {
    if (queryParams.get('category')) setCategory(queryParams.get('category'));
    if (queryParams.get('tier')) setTier(queryParams.get('tier'));
    if (queryParams.get('gender')) setGender(queryParams.get('gender'));
    if (queryParams.get('family')) setFamily(queryParams.get('family'));
    if (queryParams.get('search')) setSearch(queryParams.get('search'));
    if (queryParams.get('sort')) setSortBy(queryParams.get('sort'));
  }, [queryParams]);

  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileFilterOpen]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const data = await productService.getAllProducts({
          category, tier, gender, family, search,
          maxPrice, inStockOnly, minRating, sortBy
        });
        setProducts(data);
      } catch (e) {
        console.error('Error fetching products:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [category, tier, gender, family, search, maxPrice, inStockOnly, minRating, sortBy]);

  useEffect(() => {
    const handleCloudUpdate = () => {
      productService.getAllProducts({
        category, tier, gender, family, search,
        maxPrice, inStockOnly, minRating, sortBy
      }).then(data => {
        setProducts(data);
      }).catch(() => {});
    };

    window.addEventListener('arabian_sheikh_cloud_updated', handleCloudUpdate);
    return () => window.removeEventListener('arabian_sheikh_cloud_updated', handleCloudUpdate);
  }, [category, tier, gender, family, search, maxPrice, inStockOnly, minRating, sortBy]);

  const resetFilters = () => {
    setCategory('all');
    setTier('all');
    setGender('all');
    setFamily('all');
    setSearch('');
    setMaxPrice(500);
    setInStockOnly(false);
    setMinRating(0);
    setSortBy('featured');
    navigate('/shop');
  };

  const hasActiveFilters =
    category !== 'all' || tier !== 'all' || gender !== 'all' ||
    family !== 'all' || search !== '' || maxPrice < 150 || inStockOnly || minRating > 0;

  const categoriesList = [
    { id: 'all', label: isRtl ? 'جميع المعروضات' : 'All Catalog' },
    { id: 'offers', label: isRtl ? 'العروض والتخفيضات' : 'Offers & Discounts' },
    ...apiCategories.map(c => {
      const catKey = (c.slug || c.name || `category-${c.id}`).toLowerCase().trim();
      let displayName = c.name || `Category #${c.id}`;
      if (isRtl) {
        if (c.arabicName) displayName = c.arabicName;
        else if (catKey.includes('perfume')) displayName = 'عطور فاخرة';
        else if (catKey.includes('oil')) displayName = 'زيوت دهن عود';
        else if (catKey.includes('bakhoor') || catKey.includes('incense')) displayName = 'بخور ومعطرات';
        else if (catKey.includes('cosmetic')) displayName = 'مستحضرات تجميل';
        else if (catKey.includes('bundle')) displayName = 'باقات وهدايا';
      }
      return {
        id: catKey,
        rawId: c.id,
        label: displayName
      };
    })
  ];

  const tiersList = [
    { id: 'all', label: 'All Tiers' },
    { id: 'Luxury', label: 'Luxury (€50)' },
    { id: 'Royal', label: 'Royal (€40)' },
    { id: 'Classic', label: 'Classic (€30)' }
  ];

  const filterSidebar = (
    <div className={`space-y-6 text-xs ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
        <h3 className="font-cinzel text-sm font-bold uppercase tracking-widest text-[#D4AF37]">
          {isRtl ? 'تصفية المنتجات' : 'Filter Collection'}
        </h3>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-[11px] text-[#D4AF37] hover:text-[#B8860B] flex items-center gap-1 font-sans cursor-pointer font-bold"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label className={`font-cinzel text-[11px] uppercase tracking-wider block font-bold ${
          isDark ? 'text-[#D8BE99]' : 'text-[#8C6239]'
        }`}>
          Category
        </label>
        <div className="flex flex-col gap-1.5">
          {categoriesList.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`text-left rtl:text-right px-3 py-2 rounded-lg transition-colors flex items-center justify-between font-medium ${
                category === c.id
                  ? 'bg-[#D4AF37] text-black font-bold shadow-sm'
                  : isDark
                  ? 'hover:bg-white/5 text-[#F3E6D0]'
                  : 'hover:bg-black/5 text-[#120B06]'
              }`}
            >
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Perfume Tier Filter */}
      <div className="space-y-2 pt-2 border-t border-black/10 dark:border-white/5">
        <label className={`font-cinzel text-[11px] uppercase tracking-wider flex items-center gap-1 font-bold ${
          isDark ? 'text-[#D8BE99]' : 'text-[#8C6239]'
        }`}>
          <Crown className="w-3 h-3 text-[#D4AF37]" />
          <span>Perfume Tier</span>
        </label>
        <div className="flex flex-col gap-1.5">
          {tiersList.map((tItem) => (
            <button
              key={tItem.id}
              onClick={() => setTier(tItem.id)}
              className={`text-left rtl:text-right px-3 py-2 rounded-lg transition-colors flex items-center justify-between font-medium ${
                tier === tItem.id
                  ? 'bg-[#D4AF37] text-black font-bold shadow-sm'
                  : isDark
                  ? 'hover:bg-white/5 text-[#F3E6D0]'
                  : 'hover:bg-black/5 text-[#120B06]'
              }`}
            >
              <span>{tItem.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Gender Filter */}
      <div className="space-y-2 pt-2 border-t border-black/10 dark:border-white/5">
        <label className={`font-cinzel text-[11px] uppercase tracking-wider block font-bold ${
          isDark ? 'text-[#D8BE99]' : 'text-[#8C6239]'
        }`}>
          Gender Profile
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'all', label: isRtl ? 'الكل' : 'All' },
            { id: 'men', label: isRtl ? 'رجالي' : 'Men' },
            { id: 'women', label: isRtl ? 'نسائي' : 'Women' },
            { id: 'unisex', label: isRtl ? 'للجنسين' : 'Unisex' }
          ].map((g) => {
            const gLower = (gender || '').toLowerCase();
            const isActive = gLower === g.id.toLowerCase() ||
              (g.id === 'men' && (gLower === 'masculine' || gLower === 'male')) ||
              (g.id === 'women' && (gLower === 'feminine' || gLower === 'female'));

            return (
              <button
                key={g.id}
                onClick={() => setGender(g.id)}
                className={`px-2.5 py-1.5 rounded-lg border text-center text-[11px] transition-colors font-medium ${
                  isActive
                    ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37] font-bold'
                    : isDark
                    ? 'border-white/10 text-[#F3E6D0] hover:border-white/30'
                    : 'border-black/10 text-[#120B06] hover:border-black/30'
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Max Price Slider */}
      <div className="space-y-2 pt-2 border-t border-black/10 dark:border-white/5">
        <div className="flex justify-between items-center text-[11px] font-cinzel">
          <span className={`uppercase tracking-wider font-bold ${isDark ? 'text-[#D8BE99]' : 'text-[#8C6239]'}`}>Max Price:</span>
          <span className="text-[#D4AF37] font-bold text-sm">€{maxPrice}</span>
        </div>
        <input
          type="range"
          min="20"
          max="500"
          step="10"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#D4AF37] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
          <span>€20</span>
          <span>€500</span>
        </div>
      </div>

      {/* In Stock Only */}
      <div className="pt-2 border-t border-black/10 dark:border-white/5">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="accent-[#D4AF37] rounded"
          />
          <span className={`text-xs font-medium ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>In Stock Only</span>
        </label>
      </div>

    </div>
  );

  return (
    <div className={`min-h-screen bg-transparent pt-28 sm:pt-32 pb-12 transition-colors duration-500 relative overflow-hidden ${
      isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
    }`}>
      <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
        
        {/* Page Banner Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className={`text-xs uppercase tracking-[0.35em] font-cinzel font-bold ${
            isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
          }`}>
            The Master Catalogue
          </span>
          <BlurText
            text={category !== 'all' ? category.toUpperCase() : 'ALL CREATIONS'}
            delay={70}
            animateBy="words"
            direction="top"
            className={`text-3xl sm:text-5xl font-cinzel font-bold justify-center ${
              isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
            }`}
            as="h1"
          />
          <p className={`text-xs sm:text-sm font-medium ${
            isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'
          }`}>
            Prestige perfumes in fixed 60 ml flacons (€30 Classic, €40 Royal, €50 Luxury), concentrated oils, and royal incense.
          </p>
        </div>

        {/* Top Filter & Sort Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 mb-8 border-b border-black/10 dark:border-white/10">
          
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className={`lg:hidden w-full sm:w-auto px-4 py-2.5 border text-xs font-cinzel uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl ${
              isDark ? 'bg-white/5 border-[#D4AF37]/30 text-[#D4AF37]' : 'bg-white border-[#D4AF37]/40 text-[#120B06] shadow-sm'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
            <span>Filter Catalog ({products.length})</span>
          </button>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search notes, names..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full border px-3 py-2 pl-9 rounded-full text-xs focus:border-[#D4AF37] focus:outline-none ${
                isDark ? 'bg-black/60 border-[#D4AF37]/25 text-[#F3E6D0] placeholder-neutral-500' : 'bg-white border-[#D4AF37]/35 text-[#120B06] placeholder-neutral-400 shadow-sm'
              }`}
            />
            <Search className="w-3.5 h-3.5 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
            <span className={`font-cinzel uppercase tracking-wider font-bold ${isDark ? 'text-[#D8BE99]' : 'text-[#8C6239]'}`}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`border px-3 py-2 rounded-full text-xs focus:border-[#D4AF37] focus:outline-none font-medium ${
                isDark ? 'bg-black/60 border-[#D4AF37]/25 text-[#F3E6D0]' : 'bg-white border-[#D4AF37]/35 text-[#120B06] shadow-sm'
              }`}
            >
              <option value="featured">Featured / Prestige</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Patron Rating</option>
              <option value="newest">Newest Additions</option>
            </select>
          </div>

        </div>

        {/* Main Catalog Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Desktop Filter Sidebar */}
          <div className={`hidden lg:block lg:col-span-3 border p-6 h-fit sticky top-28 rounded-2xl ${
            isDark ? 'bg-[#0B0A08]/80 border-[#D4AF37]/15 shadow-xl' : 'bg-white border-[#D4AF37]/30 shadow-[0_10px_30px_rgba(0,0,0,0.06)]'
          }`}>
            {filterSidebar}
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className={`text-center py-20 border p-12 space-y-4 rounded-2xl ${
                isDark ? 'bg-[#0B0A08]/60 border-white/5' : 'bg-white border-[#D4AF37]/30 shadow-md'
              }`}>
                <p className="font-cinzel text-lg text-[#D4AF37] font-bold">No creations found matching criteria</p>
                <p className={`text-xs ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>Try resetting your filter parameters or search terms.</p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-[#D4AF37] text-black font-cinzel text-xs uppercase font-bold tracking-wider rounded-full hover:bg-[#F2D675] transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden bg-black/85 backdrop-blur-lg flex justify-end animate-fade-in">
          {/* Backdrop click to close */}
          <div 
            className="absolute inset-0 cursor-pointer" 
            onClick={() => setMobileFilterOpen(false)} 
            aria-hidden="true"
          />

          <div className={`relative z-10 w-full sm:max-w-md h-full flex flex-col justify-between shadow-2xl ${
            isDark ? 'bg-[#0B0A08] border-l border-[#D4AF37]/30 text-[#F3E6D0]' : 'bg-[#FAF7F2] border-l border-[#D4AF37]/40 text-[#120B06]'
          }`}>
            {/* Drawer Top Header (Shifted down comfortably away from navbar collapse button) */}
            <div className={`px-6 pt-20 sm:pt-14 pb-4 border-b flex items-center justify-between ${
              isDark ? 'border-[#D4AF37]/20 bg-[#0B0A08]' : 'border-[#D4AF37]/30 bg-[#FAF7F2]'
            }`}>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#D4AF37]">
                  {isRtl ? 'تصفية المنتجات' : 'Filter Masterpieces'}
                </h3>
              </div>
              <button 
                onClick={() => setMobileFilterOpen(false)} 
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer shadow-sm ${
                  isDark 
                    ? 'border-[#D4AF37]/50 text-[#D4AF37] bg-white/5 hover:bg-[#D4AF37]/20' 
                    : 'border-[#8C6239]/50 text-[#8C6239] bg-black/5 hover:bg-[#8C6239]/10'
                }`}
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filters Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 overscroll-contain">
              {filterSidebar}
            </div>

            {/* Sticky Action Footer */}
            <div className={`p-5 border-t flex items-center gap-3 ${
              isDark ? 'border-[#D4AF37]/20 bg-[#0B0A08]/95' : 'border-[#D4AF37]/30 bg-[#FAF7F2]/95'
            }`}>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className={`px-4 py-3 border rounded-full text-xs font-cinzel uppercase font-bold tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
                    isDark ? 'border-white/20 text-[#F3E6D0] hover:border-[#D4AF37]' : 'border-black/20 text-[#120B06] hover:border-[#8C6239]'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-full hover:bg-[#F2D675] transition-all shadow-md active:scale-95 text-center"
              >
                Show Results ({products.length})
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
