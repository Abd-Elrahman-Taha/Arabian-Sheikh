import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { brandService } from '../services/brandService';
import { perfumeCategoryService } from '../services/perfumeCategoryService';
import ProductCard from '../components/common/ProductCard';
import { ProductSkeleton } from '../components/common/SkeletonLoader';
import {
  SlidersHorizontal,
  Search,
  X,
  RotateCcw,
  Sparkles,
  Layers,
  FolderTree,
  Crown,
  Building2,
  Tag
} from 'lucide-react';
import BlurText from '../components/common/BlurText';

export default function Shop() {
  const { queryParams, navigate } = useRouter();
  const { t, language, isRtl } = useTranslation();
  const { isDark } = useTheme();

  // Dynamic Lookup Data
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [perfumeCategories, setPerfumeCategories] = useState([]);

  // Catalog Products & Loading States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Active Filter States (initialized from URL params)
  const initialCategory = queryParams.get('category') || queryParams.get('categoryId') || 'all';
  const initialSubcategory = queryParams.get('subcategoryId') || queryParams.get('subcategory') || 'all';
  const initialBrand = queryParams.get('brandId') || 'all';
  const initialTier = queryParams.get('tier') || 'all';
  const initialGender = queryParams.get('gender') || 'all';
  const initialSearch = queryParams.get('search') || '';
  const initialMaxPrice = Number(queryParams.get('maxPrice')) || 500;
  const initialSort = queryParams.get('sortBy') || queryParams.get('sort') || 'featured';
  const initialInStock = queryParams.get('inStock') === 'true';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState(initialSubcategory);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [selectedTier, setSelectedTier] = useState(initialTier);
  const [selectedGender, setSelectedGender] = useState(initialGender);
  const [search, setSearch] = useState(initialSearch);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [inStockOnly, setInStockOnly] = useState(initialInStock);
  const [sortBy, setSortBy] = useState(initialSort);

  // Helper to resolve numeric category ID from current selection
  const activeCategoryId = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'all' || selectedCategory === 'offers') return null;
    const num = Number(selectedCategory);
    if (!isNaN(num) && num > 0) return num;

    const lower = String(selectedCategory || '').toLowerCase();
    const found = categories.find(c =>
      String(c.id) === String(selectedCategory) ||
      (c.name && c.name.toLowerCase() === lower) ||
      (c.slug && c.slug.toLowerCase() === lower)
    );
    if (found) return Number(found.id);

    if (lower === 'perfumes' || lower === 'perfume') return 1;
    if (lower === 'body-bath-care' || lower === 'body care' || lower === 'body & bath care') return 3;
    if (lower === 'cosmetics') return 7;
    if (lower === 'hair-care' || lower === 'hair care') return 8;

    return null;
  }, [selectedCategory, categories]);

  // 1. Fetch Dynamic Categories, Brands, and Perfume Tiers on Mount / Language Change
  useEffect(() => {
    let isMounted = true;

    async function loadCatalogTaxonomy() {
      try {
        const [catsData, brandsData, tiersData] = await Promise.all([
          categoryService.getStoreCategories(language).catch(() => []),
          brandService.getStoreBrands(language).catch(() => []),
          perfumeCategoryService.getStorePerfumeCategories().catch(() => ({ items: [] }))
        ]);

        if (isMounted) {
          const apiCats = Array.isArray(catsData) ? catsData.filter(c => c.isActive !== false) : [];
          setCategories(apiCats);
          setBrands(Array.isArray(brandsData) ? brandsData : []);
          if (tiersData?.items && tiersData.items.length > 0) {
            setPerfumeCategories(tiersData.items);
          }
        }
      } catch (err) {
        console.warn('Failed to load store taxonomy:', err.message);
      }
    }

    loadCatalogTaxonomy();
    return () => { isMounted = false; };
  }, [language]);

  // 2. Fetch Cascading Subcategories when category changes
  useEffect(() => {
    let isMounted = true;

    if (!activeCategoryId) {
      setSubcategories([]);
      return;
    }

    async function loadSubcategories() {
      setSubcategoriesLoading(true);
      try {
        const subData = await categoryService.getStoreSubcategories(activeCategoryId, language);
        const items = Array.isArray(subData) ? subData.filter(s => s.isActive !== false) : [];
        if (isMounted) {
          setSubcategories(items);
        }
      } catch (err) {
        console.warn('Failed to load subcategories for category', activeCategoryId, err.message);
        if (isMounted) {
          setSubcategories([]);
        }
      } finally {
        if (isMounted) setSubcategoriesLoading(false);
      }
    }

    loadSubcategories();
    return () => { isMounted = false; };
  }, [activeCategoryId, language]);

  // 3. Synchronize Filters to URL Query Parameters
  const updateUrlParams = useCallback((newParams) => {
    const params = new URLSearchParams();

    if (newParams.category && newParams.category !== 'all') {
      params.set('category', newParams.category);
      if (newParams.categoryId) params.set('categoryId', newParams.categoryId);
    }
    if (newParams.subcategoryId && newParams.subcategoryId !== 'all') {
      params.set('subcategoryId', newParams.subcategoryId);
    }
    if (newParams.brandId && newParams.brandId !== 'all') {
      params.set('brandId', newParams.brandId);
    }
    if (newParams.tier && newParams.tier !== 'all') {
      params.set('tier', newParams.tier);
    }
    if (newParams.gender && newParams.gender !== 'all') {
      params.set('gender', newParams.gender);
    }
    if (newParams.search && newParams.search.trim()) {
      params.set('search', newParams.search.trim());
    }
    if (newParams.maxPrice && newParams.maxPrice < 500) {
      params.set('maxPrice', String(newParams.maxPrice));
    }
    if (newParams.inStockOnly) {
      params.set('inStock', 'true');
    }
    if (newParams.sortBy && newParams.sortBy !== 'featured') {
      params.set('sortBy', newParams.sortBy);
    }

    const queryStr = params.toString();
    const targetPath = `/shop${queryStr ? `?${queryStr}` : ''}`;
    navigate(targetPath);
  }, [navigate]);

  // 4. Fetch Products whenever filters change
  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      setLoading(true);
      try {
        const queryFilter = {
          category: selectedCategory,
          categoryId: activeCategoryId || undefined,
          subcategoryId: selectedSubcategory !== 'all' ? selectedSubcategory : undefined,
          brandId: selectedBrand !== 'all' ? selectedBrand : undefined,
          perfumeCategoryId: (!isNaN(Number(selectedTier)) && Number(selectedTier) > 0) ? Number(selectedTier) : undefined,
          tier: selectedTier !== 'all' ? selectedTier : undefined,
          gender: selectedGender !== 'all' ? selectedGender : undefined,
          search: search.trim() || undefined,
          maxPrice,
          inStockOnly,
          sortBy,
          language
        };

        const data = await productService.getAllProducts(queryFilter);
        if (isMounted) {
          setProducts(data);
        }
      } catch (err) {
        console.error('Error fetching catalog products:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProducts();
    return () => { isMounted = false; };
  }, [
    selectedCategory,
    activeCategoryId,
    selectedSubcategory,
    selectedBrand,
    selectedTier,
    selectedGender,
    search,
    maxPrice,
    inStockOnly,
    sortBy,
    language
  ]);

  // Listen to cloud updates across browsers/tabs
  useEffect(() => {
    const handleCloudUpdate = () => {
      productService.getAllProducts({
        category: selectedCategory,
        categoryId: activeCategoryId || undefined,
        subcategoryId: selectedSubcategory !== 'all' ? selectedSubcategory : undefined,
        brandId: selectedBrand !== 'all' ? selectedBrand : undefined,
        perfumeCategoryId: (!isNaN(Number(selectedTier)) && Number(selectedTier) > 0) ? Number(selectedTier) : undefined,
        tier: selectedTier !== 'all' ? selectedTier : undefined,
        gender: selectedGender !== 'all' ? selectedGender : undefined,
        search: search.trim() || undefined,
        maxPrice,
        inStockOnly,
        sortBy,
        language
      }).then(data => {
        setProducts(data);
      }).catch(() => {});
    };

    window.addEventListener('arabian_sheikh_cloud_updated', handleCloudUpdate);
    return () => window.removeEventListener('arabian_sheikh_cloud_updated', handleCloudUpdate);
  }, [
    selectedCategory,
    activeCategoryId,
    selectedSubcategory,
    selectedBrand,
    selectedTier,
    selectedGender,
    search,
    maxPrice,
    inStockOnly,
    sortBy,
    language
  ]);

  // Lock body scroll when mobile filter is open
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

  // Handlers for Filter Updates with URL Sync
  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setSelectedSubcategory('all'); // Reset subcategory on category change

    const isNum = !isNaN(Number(catId)) && Number(catId) > 0;
    updateUrlParams({
      category: catId,
      categoryId: isNum ? catId : undefined,
      subcategoryId: 'all',
      brandId: selectedBrand,
      tier: selectedTier,
      gender: selectedGender,
      search,
      maxPrice,
      inStockOnly,
      sortBy
    });
  };

  const handleSubcategorySelect = (subId) => {
    setSelectedSubcategory(subId);
    updateUrlParams({
      category: selectedCategory,
      categoryId: activeCategoryId ? String(activeCategoryId) : undefined,
      subcategoryId: subId,
      brandId: selectedBrand,
      tier: selectedTier,
      gender: selectedGender,
      search,
      maxPrice,
      inStockOnly,
      sortBy
    });
  };

  const handleBrandSelect = (bId) => {
    setSelectedBrand(bId);
    updateUrlParams({
      category: selectedCategory,
      categoryId: activeCategoryId ? String(activeCategoryId) : undefined,
      subcategoryId: selectedSubcategory,
      brandId: bId,
      tier: selectedTier,
      gender: selectedGender,
      search,
      maxPrice,
      inStockOnly,
      sortBy
    });
  };

  const handleTierSelect = (tId) => {
    setSelectedTier(tId);
    updateUrlParams({
      category: selectedCategory,
      categoryId: activeCategoryId ? String(activeCategoryId) : undefined,
      subcategoryId: selectedSubcategory,
      brandId: selectedBrand,
      tier: tId,
      gender: selectedGender,
      search,
      maxPrice,
      inStockOnly,
      sortBy
    });
  };

  const handleGenderSelect = (gId) => {
    setSelectedGender(gId);
    updateUrlParams({
      category: selectedCategory,
      categoryId: activeCategoryId ? String(activeCategoryId) : undefined,
      subcategoryId: selectedSubcategory,
      brandId: selectedBrand,
      tier: selectedTier,
      gender: gId,
      search,
      maxPrice,
      inStockOnly,
      sortBy
    });
  };

  const handlePriceChange = (val) => {
    setMaxPrice(val);
    updateUrlParams({
      category: selectedCategory,
      categoryId: activeCategoryId ? String(activeCategoryId) : undefined,
      subcategoryId: selectedSubcategory,
      brandId: selectedBrand,
      tier: selectedTier,
      gender: selectedGender,
      search,
      maxPrice: val,
      inStockOnly,
      sortBy
    });
  };

  const handleInStockToggle = (checked) => {
    setInStockOnly(checked);
    updateUrlParams({
      category: selectedCategory,
      categoryId: activeCategoryId ? String(activeCategoryId) : undefined,
      subcategoryId: selectedSubcategory,
      brandId: selectedBrand,
      tier: selectedTier,
      gender: selectedGender,
      search,
      maxPrice,
      inStockOnly: checked,
      sortBy
    });
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    updateUrlParams({
      category: selectedCategory,
      categoryId: activeCategoryId ? String(activeCategoryId) : undefined,
      subcategoryId: selectedSubcategory,
      brandId: selectedBrand,
      tier: selectedTier,
      gender: selectedGender,
      search,
      maxPrice,
      inStockOnly,
      sortBy: newSort
    });
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSelectedBrand('all');
    setSelectedTier('all');
    setSelectedGender('all');
    setSearch('');
    setMaxPrice(500);
    setInStockOnly(false);
    setSortBy('featured');
    navigate('/shop');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedSubcategory !== 'all' ||
    selectedBrand !== 'all' ||
    selectedTier !== 'all' ||
    selectedGender !== 'all' ||
    search !== '' ||
    maxPrice < 500 ||
    inStockOnly;

  // Build Dynamic Categories List (with "All" and "Offers")
  const categoriesList = useMemo(() => [
    { id: 'all', label: t('catalog.allCatalog') || 'All Catalog' },
    { id: 'offers', label: t('catalog.offersAndDiscounts') || 'Offers & Discounts' },
    ...categories.map(c => ({
      id: String(c.id),
      rawId: c.id,
      label: c.name
    }))
  ], [categories, t]);

  // Perfume Tiers - Dynamically populated from backend API with dedicated Discounts Tier
  const tiersList = useMemo(() => [
    { id: 'all', label: t('catalog.allTiers') || 'All Tiers' },
    {
      id: 'discounts',
      label: language === 'ar' ? '🏷️ عطور التخفيضات' : language === 'bg' ? '🏷️ Намалени Аромати' : language === 'es' ? '🏷️ Aromas con Descuento' : '🏷️ Discounts Tier',
      isDiscountTier: true
    },
    ...perfumeCategories.map(tier => ({
      id: String(tier.id),
      tierName: tier.name,
      rawId: tier.id,
      label: `${tier.name} Tier (€${Number(tier.price).toFixed(0)})`
    }))
  ], [perfumeCategories, language, t]);

  // Active Category Name for Header
  const activeCategoryTitle = useMemo(() => {
    if (selectedTier === 'discounts') return language === 'ar' ? 'عطور التخفيضات والعروض الملكية' : language === 'bg' ? 'Намалени Аромати и Оферти' : language === 'es' ? 'Aromas con Descuento y Ofertas' : 'Discounts & Special Offers';
    if (selectedTier && selectedTier !== 'all') {
      const matched = perfumeCategories.find(t => String(t.id) === String(selectedTier) || t.name?.toLowerCase() === String(selectedTier).toLowerCase());
      return matched ? `${matched.name} Tier` : `${selectedTier} Tier`;
    }
    if (selectedCategory === 'all') return t('ALL Catalog') || 'All Creations';
    if (selectedCategory === 'offers') return t('catalog.offersAndDiscounts') || 'Offers & Discounts';
    const found = categories.find(c => String(c.id) === String(selectedCategory));
    return found ? found.name : selectedCategory.toUpperCase();
  }, [selectedCategory, selectedTier, categories, perfumeCategories, language, t]);

  // Filter Sidebar UI
  const filterSidebar = (
    <div className={`space-y-6 text-xs ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
        <h3 className="font-cinzel text-sm font-bold uppercase tracking-widest text-[#D4AF37] flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          <span>{t('catalog.filterCollection') || 'Filter Collection'}</span>
        </h3>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-[11px] text-[#D4AF37] hover:text-[#B8860B] flex items-center gap-1 font-sans cursor-pointer font-bold"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t('catalog.resetAll') || 'Reset All'}</span>
          </button>
        )}
      </div>

      {/* 1. Dynamic Categories */}
      <div className="space-y-2">
        <label className={`font-cinzel text-[11px] uppercase tracking-wider flex items-center gap-1.5 font-bold ${
          isDark ? 'text-[#D8BE99]' : 'text-[#8C6239]'
        }`}>
          <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{t('catalog.category') || 'Category'}</span>
        </label>
        <div className="flex flex-col gap-1">
          {categoriesList.map((c) => {
            const isCatActive = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleCategorySelect(c.id)}
                className={`text-left rtl:text-right px-3 py-2 rounded-xl transition-all flex items-center justify-between font-medium cursor-pointer ${
                  isCatActive
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#F2D675] text-black font-bold shadow-md'
                    : isDark
                    ? 'hover:bg-white/5 text-[#F3E6D0]'
                    : 'hover:bg-black/5 text-[#120B06]'
                }`}
              >
                <span>{c.label}</span>
                {isCatActive && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Dynamic Cascading Subcategories (shown when parent category selected) */}
      {subcategories.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-[#D4AF37]/15 animate-fade-in">
          <label className={`font-cinzel text-[11px] uppercase tracking-wider flex items-center gap-1.5 font-bold ${
            isDark ? 'text-[#D8BE99]' : 'text-[#8C6239]'
          }`}>
            <FolderTree className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Subcategory</span>
            {subcategoriesLoading && <span className="text-[10px] text-[#D4AF37] animate-pulse">(updating...)</span>}
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleSubcategorySelect('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                selectedSubcategory === 'all'
                  ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#F2D675] font-bold shadow-sm'
                  : isDark
                  ? 'border-white/10 text-[#D8BE99] hover:border-[#D4AF37]/40'
                  : 'border-black/10 text-[#5A3517] hover:border-[#D4AF37]/40'
              }`}
            >
              All Subcategories
            </button>
            {subcategories.map((sub) => {
              const isSubActive = String(selectedSubcategory) === String(sub.id);
              return (
                <button
                  key={sub.id}
                  onClick={() => handleSubcategorySelect(String(sub.id))}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    isSubActive
                      ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#F2D675] font-bold shadow-sm'
                      : isDark
                      ? 'border-white/10 text-[#D8BE99] hover:border-[#D4AF37]/40'
                      : 'border-black/10 text-[#5A3517] hover:border-[#D4AF37]/40'
                  }`}
                >
                  {sub.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Dynamic Brands */}
      {brands.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-[#D4AF37]/15">
          <label className={`font-cinzel text-[11px] uppercase tracking-wider flex items-center gap-1.5 font-bold ${
            isDark ? 'text-[#D8BE99]' : 'text-[#8C6239]'
          }`}>
            <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Fragrance Brand</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleBrandSelect('all')}
              className={`px-2.5 py-1.5 rounded-lg border text-center text-xs transition-colors font-medium cursor-pointer ${
                selectedBrand === 'all'
                  ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37] font-bold'
                  : isDark
                  ? 'border-white/10 text-[#F3E6D0] hover:border-white/30'
                  : 'border-black/10 text-[#120B06] hover:border-black/30'
              }`}
            >
              All Brands
            </button>
            {brands.map((b) => {
              const isBrandActive = String(selectedBrand) === String(b.id);
              return (
                <button
                  key={b.id}
                  onClick={() => handleBrandSelect(String(b.id))}
                  className={`px-2.5 py-1.5 rounded-lg border text-center text-xs transition-colors font-medium truncate cursor-pointer ${
                    isBrandActive
                      ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37] font-bold'
                      : isDark
                      ? 'border-white/10 text-[#F3E6D0] hover:border-white/30'
                      : 'border-black/10 text-[#120B06] hover:border-black/30'
                  }`}
                  title={b.name}
                >
                  {b.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Perfume Tiers (Only relevant if perfumes are included) */}
      {(selectedCategory === 'all' || activeCategoryId === 1) && (
        <div className="space-y-2 pt-3 border-t border-[#D4AF37]/15">
          <label className={`font-cinzel text-[11px] uppercase tracking-wider flex items-center gap-1.5 font-bold ${
            isDark ? 'text-[#D8BE99]' : 'text-[#8C6239]'
          }`}>
            <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{t('catalog.tier') || 'Perfume Tier'}</span>
          </label>
          <div className="flex flex-col gap-1">
            {tiersList.map((tItem) => {
              const isTierActive = selectedTier === tItem.id;
              return (
                <button
                  key={tItem.id}
                  onClick={() => handleTierSelect(tItem.id)}
                  className={`text-left rtl:text-right px-3 py-1.5 rounded-lg transition-colors flex items-center justify-between font-medium cursor-pointer ${
                    isTierActive
                      ? 'bg-[#D4AF37]/20 border border-[#D4AF37] text-[#F2D675] font-bold'
                      : isDark
                      ? 'hover:bg-white/5 text-[#F3E6D0]'
                      : 'hover:bg-black/5 text-[#120B06]'
                  }`}
                >
                  <span>{tItem.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Gender Filter */}
      <div className="space-y-2 pt-3 border-t border-[#D4AF37]/15">
        <label className={`font-cinzel text-[11px] uppercase tracking-wider block font-bold ${
          isDark ? 'text-[#D8BE99]' : 'text-[#8C6239]'
        }`}>
          {t('catalog.gender') || 'Gender Profile'}
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'all', label: t('shop.allGenders') || 'All' },
            { id: 'men', label: t('shop.men') || 'Pour Homme' },
            { id: 'women', label: t('shop.women') || 'Pour Femme' },
            { id: 'unisex', label: t('shop.unisex') || 'Unisex' }
          ].map((g) => {
            const gLower = (selectedGender || '').toLowerCase();
            const isActive = gLower === g.id.toLowerCase() ||
              (g.id === 'men' && (gLower === 'masculine' || gLower === 'male')) ||
              (g.id === 'women' && (gLower === 'feminine' || gLower === 'female'));

            return (
              <button
                key={g.id}
                onClick={() => handleGenderSelect(g.id)}
                className={`px-2.5 py-1.5 rounded-lg border text-center text-[11px] transition-colors font-medium cursor-pointer ${
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

      {/* 6. Max Price Slider */}
      <div className="space-y-2 pt-3 border-t border-[#D4AF37]/15">
        <div className="flex justify-between items-center text-[11px] font-cinzel">
          <span className={`uppercase tracking-wider font-bold ${isDark ? 'text-[#D8BE99]' : 'text-[#8C6239]'}`}>
            Max Price:
          </span>
          <span className="text-[#D4AF37] font-bold text-sm">€{maxPrice}</span>
        </div>
        <input
          type="range"
          min="20"
          max="500"
          step="10"
          value={maxPrice}
          onChange={(e) => handlePriceChange(Number(e.target.value))}
          className="w-full accent-[#D4AF37] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
          <span>€20</span>
          <span>€500</span>
        </div>
      </div>

      {/* 7. In Stock Only Checkbox */}
      <div className="pt-3 border-t border-[#D4AF37]/15">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => handleInStockToggle(e.target.checked)}
            className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
          />
          <span className={`text-xs font-medium ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>
            In Stock Only
          </span>
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
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className={`text-xs uppercase tracking-[0.35em] font-cinzel font-bold ${
            isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
          }`}>
            The Master Catalogue
          </span>
          <BlurText
            text={activeCategoryTitle}
            delay={70}
            animateBy="words"
            direction="top"
            className={`text-3xl sm:text-5xl font-cinzel font-bold justify-center uppercase ${
              isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
            }`}
            as="h1"
          />
          <p className={`text-xs sm:text-sm font-medium ${
            isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'
          }`}>
            Artisanal creations, fixed perfume flacon tiers, precious attars, and royal incense.
          </p>
        </div>

        {/* Top Filter & Sort Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 mb-8 border-b border-black/10 dark:border-white/10">
          
          {/* Mobile Filter Trigger Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className={`lg:hidden w-full sm:w-auto px-4 py-2.5 border text-xs font-cinzel uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl cursor-pointer ${
              isDark ? 'bg-white/5 border-[#D4AF37]/30 text-[#D4AF37]' : 'bg-white border-[#D4AF37]/40 text-[#120B06] shadow-sm'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
            <span>Filter Collection ({products.length})</span>
          </button>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search notes, names..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateUrlParams({
                    category: selectedCategory,
                    categoryId: activeCategoryId ? String(activeCategoryId) : undefined,
                    subcategoryId: selectedSubcategory,
                    brandId: selectedBrand,
                    tier: selectedTier,
                    gender: selectedGender,
                    search,
                    maxPrice,
                    inStockOnly,
                    sortBy
                  });
                }
              }}
              className={`w-full border px-3 py-2 pl-9 rounded-full text-xs focus:border-[#D4AF37] focus:outline-none ${
                isDark
                  ? 'bg-black/60 border-[#D4AF37]/25 text-[#F3E6D0] placeholder-neutral-500'
                  : 'bg-white border-[#D4AF37]/35 text-[#120B06] placeholder-neutral-400 shadow-sm'
              }`}
            />
            <Search className="w-3.5 h-3.5 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
            <span className={`font-cinzel uppercase tracking-wider font-bold ${isDark ? 'text-[#D8BE99]' : 'text-[#8C6239]'}`}>
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className={`border px-3 py-2 rounded-full text-xs focus:border-[#D4AF37] focus:outline-none font-medium cursor-pointer ${
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

        {/* Main Catalog Layout: Sidebar + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Desktop Filter Sidebar */}
          <div className={`hidden lg:block lg:col-span-3 border p-6 h-fit sticky top-28 rounded-2xl ${
            isDark ? 'bg-[#0B0A08]/80 border-[#D4AF37]/15 shadow-xl' : 'bg-white border-[#D4AF37]/30 shadow-[0_10px_30px_rgba(0,0,0,0.06)]'
          }`}>
            {filterSidebar}
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-9 space-y-6">
            {/* Quick Perfume Tier & Discounts Bar */}
            <div className={`p-3 rounded-2xl border flex items-center gap-2 overflow-x-auto scrollbar-thin ${
              isDark ? 'bg-[#0B0A08]/60 border-[#D4AF37]/20' : 'bg-white/90 border-[#D4AF37]/30 shadow-sm'
            }`}>
              <div className="flex items-center gap-1.5 shrink-0 px-2 text-xs font-cinzel font-bold text-[#D4AF37]">
                <Crown className="w-4 h-4" />
                <span className="hidden sm:inline">{language === 'ar' ? 'المستويات:' : 'Tiers:'}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {tiersList.map((tItem) => {
                  const isTierActive = selectedTier === tItem.id;
                  const isDiscountsTier = tItem.id === 'discounts';
                  return (
                    <button
                      key={tItem.id}
                      onClick={() => handleTierSelect(tItem.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-cinzel tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        isTierActive
                          ? isDiscountsTier
                            ? 'bg-gradient-to-r from-red-700 via-amber-600 to-red-800 text-white font-bold border border-amber-300 shadow-md scale-105'
                            : 'bg-gradient-to-r from-[#D4AF37] to-[#F2D675] text-black font-bold shadow-md scale-105'
                          : isDiscountsTier
                          ? isDark
                            ? 'bg-red-950/40 text-amber-300 border border-amber-500/40 hover:border-amber-400'
                            : 'bg-amber-50 text-red-700 border border-red-300 hover:bg-amber-100'
                          : isDark
                          ? 'bg-white/5 border border-white/10 text-[#D8BE99] hover:border-[#D4AF37]/40 hover:text-white'
                          : 'bg-[#FBF6EC] border border-black/10 text-[#5A3517] hover:border-[#D4AF37]/40'
                      }`}
                    >
                      {isDiscountsTier && <Tag className="w-3 h-3 text-amber-300" />}
                      <span>{tItem.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className={`text-center py-20 border p-12 space-y-4 rounded-2xl ${
                isDark ? 'bg-[#0B0A08]/60 border-white/5' : 'bg-white border-[#D4AF37]/30 shadow-md'
              }`}>
                <p className="font-cinzel text-lg text-[#D4AF37] font-bold">No creations found matching criteria</p>
                <p className={`text-xs ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>
                  Try resetting your filter parameters or search terms.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-[#D4AF37] text-black font-cinzel text-xs uppercase font-bold tracking-wider rounded-full hover:bg-[#F2D675] transition-colors cursor-pointer"
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
            {/* Drawer Top Header */}
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
                  className={`px-4 py-3 border rounded-full text-xs font-cinzel uppercase font-bold tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    isDark ? 'border-white/20 text-[#F3E6D0] hover:border-[#D4AF37]' : 'border-black/20 text-[#120B06] hover:border-[#8C6239]'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-full hover:bg-[#F2D675] transition-all shadow-md active:scale-95 text-center cursor-pointer"
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
