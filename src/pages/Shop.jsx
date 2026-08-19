import React, { useState, useEffect } from 'react';
import { useRouter } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { productService } from '../services/productService';
import ProductCard from '../components/common/ProductCard';
import { ProductSkeleton } from '../components/common/SkeletonLoader';
import ScrollReveal, { ScrollRevealItem } from '../components/common/ScrollReveal';
import CamelCaravan from '../components/motion/CamelCaravan';
import {
  SlidersHorizontal,
  Grid,
  List,
  Search,
  X,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function Shop() {
  const { queryParams, navigate } = useRouter();
  const { t } = useTranslation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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
          gender, family, search, collection,
          maxPrice, inStockOnly, minRating, sortBy
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
    gender !== 'all' || family !== 'all' || search !== '' ||
    collection !== 'all' || maxPrice < 500 || inStockOnly || minRating > 0;

  const filterSidebarContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
        <h3 className="font-cinzel text-sm font-bold uppercase tracking-widest text-[var(--text-primary)]">
          {t('shop.filterBy')}
        </h3>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-[11px] text-[var(--gold-primary)] hover:underline flex items-center gap-1 font-sans cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t('shop.resetFilters')}</span>
          </button>
        )}
      </div>

      {/* Gender Filter */}
      <div className="space-y-2">
        <h4 className="font-cinzel text-xs uppercase tracking-wider text-[var(--gold-primary)]">
          {t('shop.gender')}
        </h4>
        <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
          {['all', 'men', 'women', 'unisex'].map((g) => (
            <label key={g} className="flex items-center gap-2 cursor-pointer hover:text-[var(--text-primary)]">
              <input
                type="radio"
                name="gender"
                checked={gender === g}
                onChange={() => setGender(g)}
                className="accent-[#D2A55F]"
              />
              <span className="capitalize">{g === 'all' ? t('shop.allGenders') : g}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Fragrance Families */}
      <div className="space-y-2 pt-4 border-t border-[var(--border-subtle)]">
        <h4 className="font-cinzel text-xs uppercase tracking-wider text-[var(--gold-primary)]">
          {t('shop.family')}
        </h4>
        <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
          {[
            { id: 'all', label: t('shop.allFamilies') },
            { id: 'woody', label: `${t('families.woody')} (Oud)` },
            { id: 'oriental', label: t('families.oriental') },
            { id: 'floral', label: t('families.floral') },
            { id: 'fresh', label: t('families.fresh') },
            { id: 'fruity', label: t('families.fruity') }
          ].map((f) => (
            <label key={f.id} className="flex items-center gap-2 cursor-pointer hover:text-[var(--text-primary)]">
              <input
                type="radio"
                name="family"
                checked={family === f.id}
                onChange={() => setFamily(f.id)}
                className="accent-[#D2A55F]"
              />
              <span>{f.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
        <div className="flex justify-between text-xs">
          <span className="font-cinzel text-[var(--gold-primary)] uppercase tracking-wider">
            {t('shop.priceRange')}
          </span>
          <span className="font-mono text-[var(--text-primary)] font-semibold">${maxPrice}</span>
        </div>
        <input
          type="range"
          min="250"
          max="500"
          step="10"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#D2A55F] cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-[var(--text-muted)] font-mono">
          <span>$250</span>
          <span>$500</span>
        </div>
      </div>

      {/* In Stock Only */}
      <div className="pt-4 border-t border-[var(--border-subtle)]">
        <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="accent-[#D2A55F]"
          />
          <span>{t('shop.inStockOnly')}</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="pt-36 sm:pt-40 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Page Header */}
      <ScrollReveal direction="up">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-[var(--gold-primary)] font-semibold">
            Haute Parfumerie Flacons
          </span>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-[var(--text-primary)] uppercase tracking-wider">
            {t('shop.title')}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-sans">
            {t('shop.subtitle')}
          </p>
        </div>
      </ScrollReveal>

      {/* Desert Camel Caravan — Below First Section, Above Filters */}
      <div className="relative w-full h-32 sm:h-44 md:h-52 overflow-hidden -my-4 pointer-events-none">
        <CamelCaravan speedMultiplier={0.9} opacity={0.95} scale={1.05} />
      </div>

      {/* Control Bar */}
      <ScrollReveal direction="up" delay={0.1}>
      <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search fragrance or ingredient..."
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-gold-subtle)] pl-9 pr-8 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)]/60 focus:border-[var(--gold-primary)] focus:outline-none transition-colors"
          />
          <Search className="w-4 h-4 text-[var(--gold-primary)] absolute left-3 top-1/2 -translate-y-1/2" />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 border border-[var(--border-gold-subtle)] text-xs font-cinzel text-[var(--text-primary)] hover:text-[var(--gold-primary)] bg-[var(--bg-secondary)] cursor-pointer transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-[var(--gold-primary)]" />
            <span>{t('shop.filterBy')}</span>
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-[#D2A55F]" />}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--text-muted)] font-cinzel uppercase hidden sm:inline">{t('shop.sortBy')}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[var(--bg-secondary)] border border-[var(--border-gold-subtle)] px-3 py-2 text-xs text-[var(--text-primary)] font-sans focus:border-[var(--gold-primary)] focus:outline-none cursor-pointer"
            >
              <option value="featured">{t('shop.featured')}</option>
              <option value="rating">{t('shop.ratingHighLow')}</option>
              <option value="price-low">{t('shop.priceLowHigh')}</option>
              <option value="price-high">{t('shop.priceHighLow')}</option>
              <option value="newest">{t('shop.newest')}</option>
            </select>
          </div>

          {/* View Mode Toggles */}
          <div className="hidden sm:flex items-center border border-[var(--border-gold-subtle)] bg-[var(--bg-secondary)]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#D2A55F] text-[#130C05]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              aria-label="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-[#D2A55F] text-[#130C05]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      </ScrollReveal>

      {/* Main Content: Desktop Sidebar + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <ScrollReveal direction="left">
          <div className="hidden lg:block bg-[var(--bg-card)] border border-[var(--border-card)] p-6 self-start shadow-sm">
            {filterSidebarContent}
          </div>
        </ScrollReveal>

        {/* Product Grid / List */}
        <div className="lg:col-span-3 space-y-6">
          <ScrollReveal direction="up">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>{t('shop.showingResults', { count: products.length })}</span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-[var(--gold-primary)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear all filters
                </button>
              )}
            </div>
          </ScrollReveal>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <ScrollReveal direction="up">
              <div className="text-center py-20 bg-[var(--bg-card)] border border-[var(--border-card)] p-8 space-y-4 shadow-sm">
                <Sparkles className="w-10 h-10 text-[var(--gold-primary)] mx-auto opacity-40" />
                <h3 className="font-cinzel text-lg font-bold text-[var(--text-primary)]">
                  {t('shop.noProductsFound')}
                </h3>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  No bespoke creations matched your refined criteria. Try resetting the filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="luxury-btn-gold px-6 py-2.5 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  {t('shop.resetFilters')}
                </button>
              </div>
            </ScrollReveal>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((p, i) => (
                <ScrollRevealItem key={p.id} index={i} desktopDirection="up">
                  <ProductCard product={p} />
                </ScrollRevealItem>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((p, i) => (
                <ScrollRevealItem key={p.id} index={i} desktopDirection="up">
                  <ProductCard product={p} layout="list" />
                </ScrollRevealItem>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Sheet Filter */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden flex flex-col justify-end animate-fade-in">
          <div className="bg-[var(--bg-card)] border-t border-[var(--border-gold)] max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 className="font-cinzel text-base font-bold uppercase text-[var(--text-primary)]">
                {t('shop.filterBy')}
              </h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--gold-primary)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {filterSidebarContent}

            <div className="flex gap-3 pt-4 border-t border-[var(--border-subtle)]">
              <button
                onClick={resetFilters}
                className="flex-1 py-3 luxury-btn-outline text-xs text-center cursor-pointer"
              >
                {t('shop.resetFilters')}
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 luxury-btn-gold text-xs text-center cursor-pointer"
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
