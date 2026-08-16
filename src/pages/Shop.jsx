import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { productService } from '../services/productService';
import ProductCard from '../components/common/ProductCard';
import { ProductSkeleton } from '../components/common/SkeletonLoader';
import {
  SlidersHorizontal,
  Grid,
  List,
  Search,
  X,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Check
} from 'lucide-react';

export default function Shop() {
  const { queryParams, navigate } = useRouter();
  const { t } = useTranslation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters State
  const initialGender = queryParams.get('gender') || 'all';
  const initialFamily = queryParams.get('family') || 'all';
  const initialSearch = queryParams.get('search') || '';
  const initialCollection = queryParams.get('collection') || 'all';
  const initialSort = queryParams.get('sort') || 'featured';

  const [gender, setGender] = useState(initialGender);
  const [family, setFamily] = useState(initialFamily);
  const [search, setSearch] = useState(initialSearch);
  const [collection, setCollection] = useState(initialCollection);
  const [maxPrice, setMaxPrice] = useState(500);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState(initialSort);

  // Sync URL query params with state
  useEffect(() => {
    if (queryParams.get('gender')) setGender(queryParams.get('gender'));
    if (queryParams.get('family')) setFamily(queryParams.get('family'));
    if (queryParams.get('search')) setSearch(queryParams.get('search'));
    if (queryParams.get('collection')) setCollection(queryParams.get('collection'));
    if (queryParams.get('sort')) setSortBy(queryParams.get('sort'));
  }, [queryParams]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const data = await productService.getAllProducts({
          gender,
          family,
          search,
          collection,
          maxPrice,
          inStockOnly,
          minRating,
          sortBy
        });
        setProducts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [gender, family, search, collection, maxPrice, inStockOnly, minRating, sortBy]);

  const resetFilters = () => {
    setGender('all');
    setFamily('all');
    setSearch('');
    setCollection('all');
    setMaxPrice(500);
    setInStockOnly(false);
    setMinRating(0);
    setSortBy('featured');
    navigate('/shop');
  };

  const hasActiveFilters =
    gender !== 'all' ||
    family !== 'all' ||
    search !== '' ||
    collection !== 'all' ||
    maxPrice < 500 ||
    inStockOnly ||
    minRating > 0;

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in">
      {/* Top Boutique Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-[#C6A15B] font-semibold">
          Haute Parfumerie Flacons
        </span>
        <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#F3EEE5] uppercase tracking-wider">
          {t('shop.title')}
        </h1>
        <p className="text-xs sm:text-sm text-[#C5B8A8] font-sans">
          {t('shop.subtitle')}
        </p>
      </div>

      {/* Control Bar: Search, Filters Trigger, Sorting, View Modes */}
      <div className="bg-[#1C120E] border border-[#C6A15B]/20 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search creation or note..."
            className="w-full bg-[#0F0D0C] border border-[#C6A15B]/30 pl-9 pr-8 py-2 text-xs text-[#F3EEE5] placeholder-[#C5B8A8]/50 focus:border-[#C6A15B] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[#C6A15B] absolute left-3 top-1/2 -translate-y-1/2" />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#C5B8A8] hover:text-[#F3EEE5]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 border border-[#C6A15B]/30 text-xs font-cinzel text-[#F3EEE5] hover:text-[#C6A15B] bg-[#0F0D0C]"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#C6A15B]" />
            <span>{t('shop.filterBy')}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#C6A15B]" />
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#C5B8A8] font-cinzel uppercase hidden sm:inline">{t('shop.sortBy')}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#0F0D0C] border border-[#C6A15B]/30 px-3 py-2 text-xs text-[#F3EEE5] font-sans focus:border-[#C6A15B] focus:outline-none cursor-pointer"
            >
              <option value="featured">{t('shop.featured')}</option>
              <option value="rating">{t('shop.ratingHighLow')}</option>
              <option value="price-low">{t('shop.priceLowHigh')}</option>
              <option value="price-high">{t('shop.priceHighLow')}</option>
              <option value="newest">{t('shop.newest')}</option>
            </select>
          </div>

          {/* View Modes */}
          <div className="hidden sm:flex items-center border border-[#C6A15B]/30 bg-[#0F0D0C]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid' ? 'bg-[#C6A15B] text-[#0F0D0C]' : 'text-[#C5B8A8] hover:text-[#F3EEE5]'
              }`}
              aria-label="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${
                viewMode === 'list' ? 'bg-[#C6A15B] text-[#0F0D0C]' : 'text-[#C5B8A8] hover:text-[#F3EEE5]'
              }`}
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Desktop Sidebar + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block space-y-6 bg-[#1C120E] border border-[#C6A15B]/20 p-6 self-start shadow-xl">
          <div className="flex items-center justify-between border-b border-[#C6A15B]/20 pb-3">
            <h3 className="font-cinzel text-sm font-bold uppercase tracking-widest text-[#F3EEE5]">
              {t('shop.filterBy')}
            </h3>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-[11px] text-[#C6A15B] hover:underline flex items-center gap-1 font-sans"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t('shop.resetFilters')}</span>
              </button>
            )}
          </div>

          {/* Gender Filter */}
          <div className="space-y-2">
            <h4 className="font-cinzel text-xs uppercase tracking-wider text-[#C6A15B]">
              {t('shop.gender')}
            </h4>
            <div className="space-y-1.5 text-xs text-[#C5B8A8]">
              {['all', 'men', 'women', 'unisex'].map((g) => (
                <label
                  key={g}
                  className="flex items-center gap-2 cursor-pointer hover:text-[#F3EEE5]"
                >
                  <input
                    type="radio"
                    name="gender"
                    checked={gender === g}
                    onChange={() => setGender(g)}
                    className="accent-[#C6A15B]"
                  />
                  <span className="capitalize">{g === 'all' ? t('shop.allGenders') : g}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Fragrance Families (5 Families) */}
          <div className="space-y-2 pt-4 border-t border-[#C6A15B]/15">
            <h4 className="font-cinzel text-xs uppercase tracking-wider text-[#C6A15B]">
              {t('shop.family')}
            </h4>
            <div className="space-y-1.5 text-xs text-[#C5B8A8]">
              <label className="flex items-center gap-2 cursor-pointer hover:text-[#F3EEE5]">
                <input
                  type="radio"
                  name="family"
                  checked={family === 'all'}
                  onChange={() => setFamily('all')}
                  className="accent-[#C6A15B]"
                />
                <span>{t('shop.allFamilies')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-[#F3EEE5]">
                <input
                  type="radio"
                  name="family"
                  checked={family === 'woody'}
                  onChange={() => setFamily('woody')}
                  className="accent-[#C6A15B]"
                />
                <span>{t('families.woody')} (Oud)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-[#F3EEE5]">
                <input
                  type="radio"
                  name="family"
                  checked={family === 'oriental'}
                  onChange={() => setFamily('oriental')}
                  className="accent-[#C6A15B]"
                />
                <span>{t('families.oriental')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-[#F3EEE5]">
                <input
                  type="radio"
                  name="family"
                  checked={family === 'floral'}
                  onChange={() => setFamily('floral')}
                  className="accent-[#C6A15B]"
                />
                <span>{t('families.floral')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-[#F3EEE5]">
                <input
                  type="radio"
                  name="family"
                  checked={family === 'fresh'}
                  onChange={() => setFamily('fresh')}
                  className="accent-[#C6A15B]"
                />
                <span>{t('families.fresh')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:text-[#F3EEE5]">
                <input
                  type="radio"
                  name="family"
                  checked={family === 'fruity'}
                  onChange={() => setFamily('fruity')}
                  className="accent-[#C6A15B]"
                />
                <span>{t('families.fruity')}</span>
              </label>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3 pt-4 border-t border-[#C6A15B]/15">
            <div className="flex justify-between text-xs">
              <span className="font-cinzel text-[#C6A15B] uppercase tracking-wider">
                {t('shop.priceRange')}
              </span>
              <span className="font-mono text-[#F3EEE5]">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="250"
              max="500"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#C6A15B] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#C5B8A8] font-mono">
              <span>$250</span>
              <span>$500</span>
            </div>
          </div>

          {/* In Stock Only Checkbox */}
          <div className="pt-4 border-t border-[#C6A15B]/15">
            <label className="flex items-center gap-2 text-xs text-[#C5B8A8] cursor-pointer hover:text-[#F3EEE5]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="accent-[#C6A15B]"
              />
              <span>{t('shop.inStockOnly')}</span>
            </label>
          </div>
        </div>

        {/* Product Results Grid / List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-[#C5B8A8]">
            <span>
              {t('shop.showingResults', { count: products.length })}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-[#1C120E] border border-[#C6A15B]/20 p-8 space-y-4 shadow-xl">
              <Sparkles className="w-10 h-10 text-[#C6A15B] mx-auto opacity-50" />
              <h3 className="font-cinzel text-lg font-bold text-[#F3EEE5]">
                {t('shop.noProductsFound')}
              </h3>
              <p className="text-xs text-[#C5B8A8] max-w-sm mx-auto">
                No bespoke creations matched your refined criteria. Try resetting the filters.
              </p>
              <button
                onClick={resetFilters}
                className="luxury-btn-gold px-6 py-2 text-xs font-semibold uppercase tracking-wider"
              >
                {t('shop.resetFilters')}
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} layout="list" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Filter Sheet */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F0D0C]/80 backdrop-blur-sm lg:hidden flex flex-col justify-end animate-fade-in">
          <div className="bg-[#1C120E] border-t border-[#C6A15B]/40 max-h-[85vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#C6A15B]/20 pb-3">
              <h3 className="font-cinzel text-base font-bold uppercase text-[#F3EEE5]">
                {t('shop.filterBy')}
              </h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-[#C5B8A8] hover:text-[#C6A15B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Gender */}
            <div className="space-y-2">
              <h4 className="font-cinzel text-xs uppercase text-[#C6A15B]">{t('shop.gender')}</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['all', 'men', 'women', 'unisex'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`py-2 border capitalize text-center ${
                      gender === g
                        ? 'border-[#C6A15B] bg-[#C6A15B] text-[#0F0D0C] font-semibold'
                        : 'border-[#C6A15B]/30 text-[#F3EEE5]'
                    }`}
                  >
                    {g === 'all' ? t('shop.allGenders') : g}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Family */}
            <div className="space-y-2">
              <h4 className="font-cinzel text-xs uppercase text-[#C6A15B]">{t('shop.family')}</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'all', label: t('shop.allFamilies') },
                  { id: 'woody', label: t('families.woody') },
                  { id: 'oriental', label: t('families.oriental') },
                  { id: 'floral', label: t('families.floral') },
                  { id: 'fresh', label: t('families.fresh') },
                  { id: 'fruity', label: t('families.fruity') }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFamily(f.id)}
                    className={`py-2 border text-center ${
                      family === f.id
                        ? 'border-[#C6A15B] bg-[#C6A15B] text-[#0F0D0C] font-semibold'
                        : 'border-[#C6A15B]/30 text-[#F3EEE5]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-[#C6A15B]/20">
              <button
                onClick={resetFilters}
                className="flex-1 py-3 luxury-btn-outline text-xs text-center"
              >
                {t('shop.resetFilters')}
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 luxury-btn-gold text-xs text-center"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
