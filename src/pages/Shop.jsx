import React, { useState, useEffect } from 'react';
import { useRouter } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { productService } from '../services/productService';
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

export default function Shop() {
  const { queryParams, navigate } = useRouter();
  const { t, language, isRtl } = useTranslation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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
  const [maxPrice, setMaxPrice] = useState(150);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState(initialSort);

  useEffect(() => {
    if (queryParams.get('category')) setCategory(queryParams.get('category'));
    if (queryParams.get('tier')) setTier(queryParams.get('tier'));
    if (queryParams.get('gender')) setGender(queryParams.get('gender'));
    if (queryParams.get('family')) setFamily(queryParams.get('family'));
    if (queryParams.get('search')) setSearch(queryParams.get('search'));
    if (queryParams.get('sort')) setSortBy(queryParams.get('sort'));
  }, [queryParams]);

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

  const resetFilters = () => {
    setCategory('all');
    setTier('all');
    setGender('all');
    setFamily('all');
    setSearch('');
    setMaxPrice(150);
    setInStockOnly(false);
    setMinRating(0);
    setSortBy('featured');
    navigate('/shop');
  };

  const hasActiveFilters =
    category !== 'all' || tier !== 'all' || gender !== 'all' ||
    family !== 'all' || search !== '' || maxPrice < 150 || inStockOnly || minRating > 0;

  const categoriesList = [
    { id: 'all', label: 'All Catalog' },
    { id: 'perfumes', label: 'Perfumes' },
    { id: 'oils', label: 'Oils (Attar)' },
    { id: 'bakhoor', label: 'Bakhoor & Incense' },
    { id: 'cosmetics', label: 'Cosmetics' },
    { id: 'bundles', label: 'Bundles' }
  ];

  const tiersList = [
    { id: 'all', label: 'All Tiers' },
    { id: 'Luxury', label: 'Luxury (€50)' },
    { id: 'Royal', label: 'Royal (€40)' },
    { id: 'Classic', label: 'Classic (€30)' }
  ];

  const filterSidebar = (
    <div className="space-y-6 text-xs text-[#F3E6D0]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
        <h3 className="font-cinzel text-sm font-bold uppercase tracking-widest text-[#D4AF37]">
          {isRtl ? 'تصفية المنتجات' : 'Filter Collection'}
        </h3>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-[11px] text-[#D4AF37] hover:text-[#D4AF37] flex items-center gap-1 font-sans cursor-pointer font-bold"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="font-cinzel text-[11px] uppercase tracking-wider text-[#D8BE99] block">
          Category
        </label>
        <div className="flex flex-col gap-1.5">
          {categoriesList.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`text-left rtl:text-right px-3 py-2 rounded transition-colors flex items-center justify-between ${
                category === c.id
                  ? 'bg-[#D4AF37] text-black font-bold'
                  : 'hover:bg-white/5 text-[#F3E6D0]'
              }`}
            >
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Perfume Tier Filter */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <label className="font-cinzel text-[11px] uppercase tracking-wider text-[#D8BE99] flex items-center gap-1">
          <Crown className="w-3 h-3 text-[#D4AF37]" />
          <span>Perfume Tier</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {tiersList.map((t) => (
            <button
              key={t.id}
              onClick={() => setTier(t.id)}
              className={`px-2.5 py-1.5 rounded text-[11px] font-cinzel border transition-all text-center ${
                tier === t.id
                  ? 'border-[#D4AF37] bg-[#D4AF37] text-black font-bold'
                  : 'border-white/10 text-[#D4AF37] hover:border-[#D4AF37]/40'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gender Filter */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <label className="font-cinzel text-[11px] uppercase tracking-wider text-[#D8BE99] block">
          Gender Archetype
        </label>
        <div className="flex flex-wrap gap-1.5">
          {['all', 'Unisex', 'Masculine', 'Feminine'].map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`px-3 py-1 rounded text-[11px] border transition-colors ${
                gender.toLowerCase() === g.toLowerCase()
                  ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37] font-semibold'
                  : 'border-white/10 text-[#F3E6D0] hover:border-white/30'
              }`}
            >
              {g === 'all' ? 'All' : g}
            </button>
          ))}
        </div>
      </div>

      {/* Max Price Slider */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <div className="flex justify-between items-center text-[11px] font-cinzel">
          <span className="text-[#D8BE99] uppercase tracking-wider">Max Price:</span>
          <span className="text-[#D4AF37] font-bold text-sm">€{maxPrice}</span>
        </div>
        <input
          type="range"
          min="20"
          max="150"
          step="5"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#D4AF37] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
          <span>€20</span>
          <span>€150</span>
        </div>
      </div>

      {/* In Stock Only */}
      <div className="pt-2 border-t border-white/5">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="accent-[#D4AF37] rounded"
          />
          <span className="text-xs text-[#F3E6D0]">In Stock Only</span>
        </label>
      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-transparent text-[#F3E6D0] pt-28 sm:pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Banner Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs uppercase tracking-[0.35em] text-[#D4AF37] font-cinzel">
            The Master Catalogue
          </span>
          <h1 className="text-3xl sm:text-5xl font-cinzel font-bold text-[#F3E6D0]">
            {category !== 'all' ? category.toUpperCase() : 'ALL CREATIONS'}
          </h1>
          <p className="text-xs sm:text-sm text-[#D8BE99]">
            Prestige perfumes in fixed 60 ml flacons (€30 Classic, €40 Royal, €50 Luxury), concentrated oils, and royal incense.
          </p>
        </div>

        {/* Top Filter & Sort Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 mb-8 border-b border-[#D4AF37]/15">
          
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden w-full sm:w-auto px-4 py-2 bg-white/5 border border-[#D4AF37]/30 text-xs font-cinzel uppercase tracking-wider flex items-center justify-center gap-2 text-[#D4AF37]"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter Catalog ({products.length})</span>
          </button>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search notes, names..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/60 border border-[#D4AF37]/25 px-3 py-2 pl-9 rounded text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-[#D8BE99] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
            <span className="text-[#D8BE99] font-cinzel uppercase tracking-wider">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-black/60 border border-[#D4AF37]/25 px-3 py-2 rounded text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
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
          <div className="hidden lg:block lg:col-span-3 bg-[#0B0A08]/80 border border-[#D4AF37]/15 p-6 h-fit sticky top-28 shadow-xl">
            {filterSidebar}
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-[#0B0A08]/60 border border-white/5 p-12 space-y-4">
                <p className="font-cinzel text-lg text-[#D4AF37]">No creations found matching criteria</p>
                <p className="text-xs text-[#D8BE99]">Try resetting your filter parameters or search terms.</p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-[#D4AF37] text-black font-cinzel text-xs uppercase font-bold tracking-wider"
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
        <div className="fixed inset-0 z-50 lg:hidden bg-black/80 backdrop-blur-md flex justify-end">
          <div className="w-full max-w-xs bg-[#0B0A08] h-full p-6 overflow-y-auto border-l border-[#D4AF37]/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#D4AF37]">Filters</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {filterSidebar}
            </div>

            <div className="pt-6 border-t border-white/10">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider"
              >
                Apply Filters ({products.length} Items)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
