import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useToast } from '../../context/ToastContext';
import { productService } from '../../services/productService';
import { productApi } from '../../api/product.api';
import { categoryService } from '../../services/categoryService';
import { subcategoryService } from '../../services/subcategoryService';
import { perfumeCategoryService } from '../../services/perfumeCategoryService';
import { brandService } from '../../services/brandService';
import {
  ArrowLeft,
  Save,
  Building2,
  Layers,
  FolderTree,
  Crown,
  Upload,
  Image as ImageIcon,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Euro,
  X,
  Scale,
  Globe
} from 'lucide-react';

export default function AdminProductEdit() {
  const { currentPath, navigate } = useRouter();
  const { success, error } = useToast();

  const isNew = currentPath.endsWith('/new') || currentPath.includes('/admin/products/new') || currentPath === '/admin/products/add' || currentPath === '/admin/add-product';
  const editId = isNew ? null : currentPath.split('/admin/products/')[1]?.split('/edit')[0];

  // Lookup Lists from Backend APIs
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [perfumeCategories, setPerfumeCategories] = useState([]);

  // Base Product Classification & Logistics Form State
  const [formData, setFormData] = useState({
    brandId: '',
    categoryId: 1, // Default to Perfumes (Seeded Category Id: 1)
    subcategoryId: '',
    perfumeCategoryId: '',
    gender: 'Unisex', // 'Unisex' | 'Male' | 'Female'
    price: '',
    shippingWeight: 0.45,
    nameIsTranslatable: true,
    isActive: true,
    imageUrl: ''
  });

  // Localized Content & Translations State (En, Bg, Es)
  const [activeLangTab, setActiveLangTab] = useState('En'); // 'En' | 'Bg' | 'Es'
  const [translations, setTranslations] = useState({
    En: { name: '', description: '', ingredients: '' },
    Bg: { name: '', description: '', ingredients: '' },
    Es: { name: '', description: '', ingredients: '' }
  });

  const [formErrors, setFormErrors] = useState({});
  const [pageLoading, setPageLoading] = useState(true);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const isPerfumeCategory = Number(formData.categoryId) === 1;

  // Selected perfume tier price (Read-Only when categoryId === 1)
  const selectedTier = perfumeCategories.find(
    t => Number(t.id) === Number(formData.perfumeCategoryId)
  );
  const tierPrice = selectedTier ? Number(selectedTier.price) : 0;

  // 1. Initial Load of Reference Data (Brands, Categories, Perfume Tiers) and Existing Product
  useEffect(() => {
    async function initializeProductEditor() {
      setPageLoading(true);
      try {
        const [brandsData, catsData, tiersData] = await Promise.all([
          brandService.getAdminBrands({ pageSize: 100 }).catch(() => ({ items: [] })),
          categoryService.getAdminCategories({ pageSize: 100 }).catch(() => ({ items: [] })),
          perfumeCategoryService.getAdminPerfumeCategories({ pageSize: 100 }).catch(() => ({ items: [] }))
        ]);

        const loadedBrands = brandsData.items || [];
        const loadedCats = catsData.items || [];
        const loadedTiers = tiersData.items || [];

        setBrands(loadedBrands);
        setCategories(loadedCats);
        setPerfumeCategories(loadedTiers);

        // If creating new product, set initial defaults
        if (isNew) {
          const defaultBrandId = loadedBrands[0]?.id || 1;
          const defaultCatId = loadedCats.find(c => Number(c.id) === 1)?.id || loadedCats[0]?.id || 1;
          const defaultTierId = loadedTiers[0]?.id || 1;

          setFormData(prev => ({
            ...prev,
            brandId: defaultBrandId,
            categoryId: defaultCatId,
            perfumeCategoryId: defaultTierId
          }));
        } else if (editId) {
          // Load existing product via Admin API (which safely retrieves both ACTIVE and INACTIVE items)
          let item = null;
          try {
            item = await productApi.adminGetProductById(editId);
          } catch (adminErr) {
            console.warn('adminGetProductById fallback to productService:', adminErr?.message);
            item = await productService.getProductById(editId);
          }

          if (item) {
            const catId = Number(item.categoryId || item.category?.id || (item.category === 'perfumes' ? 1 : 2)) || 1;
            const isPerfume = catId === 1;

            // Resolve tier directly from backend API
            let resolvedTierId = '';
            if (isPerfume) {
              const rawTierId = item.perfumeCategoryId || item.perfumeCategory?.id;
              if (rawTierId) {
                resolvedTierId = Number(rawTierId);
              } else if (item.perfumeCategoryName || item.tier) {
                const nameToMatch = String(item.perfumeCategoryName || item.tier).toLowerCase().trim();
                const matchByName = loadedTiers.find(t => t.name?.toLowerCase().trim() === nameToMatch);
                if (matchByName) {
                  resolvedTierId = Number(matchByName.id);
                }
              }
            }

            setFormData({
              brandId: Number(item.brandId || item.brand?.id || loadedBrands[0]?.id || 1),
              categoryId: catId,
              subcategoryId: item.subcategoryId ? Number(item.subcategoryId) : '',
              perfumeCategoryId: resolvedTierId,
              gender: item.gender === 'Female' ? 'Female' : (item.gender === 'Male' ? 'Male' : 'Unisex'),
              price: item.price !== undefined && item.price !== null ? String(item.price) : '',
              shippingWeight: Number(item.shippingWeight) > 0 ? Number(item.shippingWeight) : 0.45,
              nameIsTranslatable: item.nameIsTranslatable !== false,
              isActive: item.isActive !== false && item.status !== 'INACTIVE',
              imageUrl: item.imageUrl || item.image || ''
            });

            // Populate translations
            const transMap = {
              En: { name: item.name || '', description: item.description || '', ingredients: item.ingredients || '' },
              Bg: { name: item.bulgarianName || '', description: item.bulgarianDescription || '', ingredients: '' },
              Es: { name: item.spanishName || '', description: item.spanishDescription || '', ingredients: '' }
            };

            if (Array.isArray(item.translations)) {
              item.translations.forEach(t => {
                const code = (t.languageCode || t.language || '').toUpperCase();
                if (code === 'EN') transMap.En = { name: t.name || '', description: t.description || '', ingredients: t.ingredients || '' };
                if (code === 'BG') transMap.Bg = { name: t.name || '', description: t.description || '', ingredients: t.ingredients || '' };
                if (code === 'ES') transMap.Es = { name: t.name || '', description: t.description || '', ingredients: t.ingredients || '' };
              });
            }

            setTranslations(transMap);
          }
        }
      } catch (err) {
        console.warn('Failed to initialize product editor:', err.message);
        error('Failed to load product details.');
      } finally {
        setPageLoading(false);
      }
    }
    initializeProductEditor();
  }, [editId, isNew, error]);

  // 3. Cascading Subcategories: Fetch whenever categoryId changes
  const fetchSubcategoriesForCategory = useCallback(async (catId) => {
    if (!catId) {
      setSubcategories([]);
      return;
    }
    setSubcategoriesLoading(true);
    try {
      const data = await subcategoryService.getAdminSubcategories({
        categoryId: Number(catId),
        pageSize: 100
      });
      setSubcategories(data.items || []);
    } catch (err) {
      console.warn('Failed to load subcategories for category:', catId, err.message);
      setSubcategories([]);
    } finally {
      setSubcategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (formData.categoryId) {
      fetchSubcategoriesForCategory(formData.categoryId);
    }
  }, [formData.categoryId, fetchSubcategoriesForCategory]);

  // Handle Category Change (Cascading: resets subcategory to prevent mismatch)
  const handleCategoryChange = (newCatId) => {
    const numId = Number(newCatId);
    const isPerfume = numId === 1;

    setFormData(prev => ({
      ...prev,
      categoryId: numId,
      subcategoryId: '', // Reset subcategory selection so unrelated subcategory cannot remain selected
      perfumeCategoryId: isPerfume ? (prev.perfumeCategoryId || perfumeCategories[0]?.id || 1) : '',
      price: isPerfume ? '' : (prev.price || '50')
    }));
  };

  // 2-Step Decoupled Image Upload (POST /api/admin/products/images)
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side MIME validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      error('Unsupported image format. Allowed: JPG, PNG, WEBP, GIF.');
      e.target.value = '';
      return;
    }

    // Client-side Max 20MB validation
    const maxBytes = 20 * 1024 * 1024;
    if (file.size > maxBytes) {
      error('File exceeds maximum size of 20MB.');
      e.target.value = '';
      return;
    }

    setUploadingImage(true);
    try {
      const uploadedUrl = await productService.uploadProductImage(file);
      if (uploadedUrl) {
        setFormData(prev => ({ ...prev, imageUrl: uploadedUrl }));
        success('Product image uploaded successfully.');
      } else {
        error('Upload succeeded but no image URL was returned.');
      }
    } catch (err) {
      error(err.message || 'Image upload failed.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleTranslationChange = (field, value) => {
    setTranslations(prev => ({
      ...prev,
      [activeLangTab]: {
        ...prev[activeLangTab],
        [field]: value
      }
    }));
  };

  // Form Validation per Backend Business Rules
  const validateForm = () => {
    const errs = {};
    if (!formData.brandId) {
      errs.brandId = 'Please select a brand.';
    }
    if (!formData.categoryId) {
      errs.categoryId = 'Please select a category.';
    }

    if (isPerfumeCategory) {
      if (!formData.perfumeCategoryId) {
        errs.perfumeCategoryId = 'Perfume pricing tier is required for perfumes.';
      }
    } else {
      const priceNum = Number(formData.price);
      if (formData.price === '' || isNaN(priceNum) || priceNum <= 0) {
        errs.price = 'Selling price must be greater than 0.';
      }
    }

    const weightNum = Number(formData.shippingWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      errs.shippingWeight = 'Shipping weight must be greater than 0 kg.';
    }

    // Translations validation: At least one language must have a non-empty name
    const hasName = Boolean(
      translations.En.name?.trim() ||
      translations.Bg.name?.trim() ||
      translations.Es.name?.trim()
    );

    if (!hasName) {
      errs.translations = 'Product name is required (in at least one language).';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaveLoading(true);
    try {
      // Build translations array adhering to backend schema
      const translationsPayload = [
        translations.En.name?.trim() ? {
          languageCode: 'En',
          name: translations.En.name.trim(),
          description: translations.En.description?.trim() || '',
          ingredients: translations.En.ingredients?.trim() || ''
        } : null,
        translations.Bg.name?.trim() ? {
          languageCode: 'Bg',
          name: translations.Bg.name.trim(),
          description: translations.Bg.description?.trim() || '',
          ingredients: translations.Bg.ingredients?.trim() || ''
        } : null,
        translations.Es.name?.trim() ? {
          languageCode: 'Es',
          name: translations.Es.name.trim(),
          description: translations.Es.description?.trim() || '',
          ingredients: translations.Es.ingredients?.trim() || ''
        } : null
      ].filter(Boolean);

      if (translationsPayload.length === 0) {
        translationsPayload.push({
          languageCode: 'En',
          name: translations.En.name?.trim() || 'Imperial Extrait',
          description: translations.En.description?.trim() || '',
          ingredients: translations.En.ingredients?.trim() || ''
        });
      }

      const effectivePrice = isPerfumeCategory
        ? Number(tierPrice || formData.price || 0)
        : Number(formData.price || 0);

      // Exact backend payload (CreateAdminProductRequest / UpdateAdminProductRequest)
      const payload = {
        brandId: Number(formData.brandId) || 1,
        categoryId: Number(formData.categoryId) || 1,
        subcategoryId: formData.subcategoryId ? Number(formData.subcategoryId) : null,
        perfumeCategoryId: isPerfumeCategory && formData.perfumeCategoryId ? Number(formData.perfumeCategoryId) : null,
        gender: formData.gender || 'Unisex',
        price: effectivePrice,
        shippingWeight: Number(formData.shippingWeight) || 0.45,
        nameIsTranslatable: Boolean(formData.nameIsTranslatable),
        isActive: Boolean(formData.isActive),
        imageUrl: formData.imageUrl?.trim() || null,
        translations: translationsPayload,
        // Top-level localized convenience fallbacks
        name: translations.En.name?.trim() || translationsPayload[0]?.name || 'Imperial Extrait',
        description: translations.En.description?.trim() || translationsPayload[0]?.description || '',
        ingredients: translations.En.ingredients?.trim() || translationsPayload[0]?.ingredients || ''
      };

      if (isNew) {
        await productService.createProduct(payload);
        success(`Product '${payload.name}' created successfully.`);
      } else {
        await productService.updateProduct(editId, payload);
        success(`Product '${payload.name}' updated successfully.`);
      }

      navigate('/admin/products');
    } catch (err) {
      error(err.message || 'Failed to save product.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#D4AF37]">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <p className="font-cinzel text-xs uppercase tracking-widest text-[#D8BE99]">
          Loading product editor...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#F3E6D0] animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-[#D4AF37]/20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/products')}
            className="p-2.5 bg-black/60 hover:bg-[#21130D] border border-[#D4AF37]/30 rounded-xl transition-all text-[#D8BE99] hover:text-[#F2D675] cursor-pointer"
            title="Return to products"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-cinzel text-2xl font-bold uppercase tracking-wider text-[#F3E6D0]">
              {isNew ? 'Create New Product' : `Edit Product #${editId}`}
            </h1>
            <p className="text-xs text-[#D8BE99] mt-0.5">
              Backend-integrated product catalog creation and updates.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saveLoading}
          className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#F2D675] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-xl transition-all hover:brightness-110 shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saveLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saveLoading ? 'Saving...' : (isNew ? 'Create Product' : 'Save Changes')}</span>
        </button>
      </div>

      {formErrors.translations && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{formErrors.translations}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. BASIC CLASSIFICATION */}
        <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/25 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-5">
          <div className="flex items-center gap-2 border-b border-[#D4AF37]/20 pb-3">
            <Layers className="w-4 h-4 text-[#F2D675]" />
            <h2 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#F2D675]">
              1. Basic Classification
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Brand */}
            <div className="space-y-1.5">
              <label className="text-[#D8BE99] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Brand <span className="text-rose-400">*</span></span>
              </label>
              <select
                value={formData.brandId}
                onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                className={`w-full bg-black/60 border ${formErrors.brandId ? 'border-rose-500' : 'border-[#D4AF37]/30'} rounded-xl py-2.5 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer`}
              >
                <option value="" disabled className="bg-[#120B06]">Select Brand...</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id} className="bg-[#120B06]">
                    {b.name}
                  </option>
                ))}
              </select>
              {formErrors.brandId && (
                <p className="text-[11px] text-rose-400">{formErrors.brandId}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-[#D8BE99] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Category <span className="text-rose-400">*</span></span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className={`w-full bg-black/60 border ${formErrors.categoryId ? 'border-rose-500' : 'border-[#D4AF37]/30'} rounded-xl py-2.5 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer`}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#120B06]">
                    {c.name} {Number(c.id) === 1 ? '(Perfumes - Seeded Id: 1)' : ''}
                  </option>
                ))}
              </select>
              {formErrors.categoryId && (
                <p className="text-[11px] text-rose-400">{formErrors.categoryId}</p>
              )}
            </div>

            {/* Subcategory (Cascading to Selected Category) */}
            <div className="space-y-1.5">
              <label className="text-[#D8BE99] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Subcategory (Optional)</span>
                {subcategoriesLoading && <RefreshCw className="w-3 h-3 animate-spin text-[#D4AF37]" />}
              </label>
              <select
                value={formData.subcategoryId}
                onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                disabled={subcategoriesLoading || subcategories.length === 0}
                className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2.5 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer disabled:opacity-50"
              >
                <option value="" className="bg-[#120B06]">
                  {subcategories.length === 0 ? 'No Subcategories for this Category' : 'None / General'}
                </option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id} className="bg-[#120B06]">
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender Radio Group */}
            <div className="space-y-1.5">
              <label className="text-[#D8BE99] font-semibold uppercase tracking-wider block">
                Gender <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-4 pt-1.5">
                {['Unisex', 'Male', 'Female'].map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer text-xs text-[#F3E6D0]">
                    <input
                      type="radio"
                      name="gender-choice"
                      value={g}
                      checked={formData.gender === g}
                      onChange={() => setFormData({ ...formData, gender: g })}
                      className="accent-[#D4AF37] w-4 h-4 cursor-pointer"
                    />
                    <span>{g}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. PRICING & LOGISTICS (Dynamic based on Category) */}
        <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/25 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-5">
          <div className="flex items-center gap-2 border-b border-[#D4AF37]/20 pb-3">
            <Euro className="w-4 h-4 text-[#F2D675]" />
            <h2 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#F2D675]">
              2. Pricing & Logistics
            </h2>
          </div>

          {/* Dynamic Pricing Engine: Perfumes (Id: 1) vs Standard Merchandise */}
          <div>
            {isPerfumeCategory ? (
              /* CATEGORY === 1: Perfume Category / Pricing Tier */
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#D4AF37]/15 via-black/60 to-black/80 border border-[#D4AF37]/40 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-1.5">
                  <label className="text-[#F2D675] font-semibold uppercase tracking-wider flex items-center gap-1.5 text-xs">
                    <Crown className="w-3.5 h-3.5 text-[#F2D675]" />
                    <span>Perfume Pricing Tier <span className="text-rose-400">*</span></span>
                  </label>
                  <select
                    value={formData.perfumeCategoryId}
                    onChange={(e) => {
                      const selectedId = Number(e.target.value);
                      const matched = perfumeCategories.find(t => Number(t.id) === selectedId);
                      setFormData(prev => ({
                        ...prev,
                        perfumeCategoryId: selectedId,
                        price: matched?.price !== undefined ? String(matched.price) : prev.price
                      }));
                    }}
                    className={`w-full bg-black/80 border ${formErrors.perfumeCategoryId ? 'border-rose-500' : 'border-[#D4AF37]/50'} rounded-xl py-2.5 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer`}
                  >
                    <option value="" disabled className="bg-[#120B06]">Select Pricing Tier...</option>
                    {perfumeCategories.map((tier) => (
                      <option key={tier.id} value={tier.id} className="bg-[#120B06]">
                        {tier.name} — €{Number(tier.price).toFixed(2)}
                      </option>
                    ))}
                  </select>
                  {formErrors.perfumeCategoryId && (
                    <p className="text-[11px] text-rose-400">{formErrors.perfumeCategoryId}</p>
                  )}
                  <p className="text-[10px] text-[#D8BE99]/70 pt-0.5">
                    Price is fixed by the selected tier. Direct price entry is disabled for perfume products.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#D8BE99] font-semibold uppercase tracking-wider text-xs">
                    Effective Selling Price (€ EUR)
                  </label>
                  <div className="w-full bg-black/80 border border-[#D4AF37]/30 rounded-xl py-2.5 px-4 text-[#F2D675] font-mono font-bold text-sm flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      € {tierPrice > 0 ? tierPrice.toFixed(2) : '—'}
                    </span>
                    <span className="text-[10px] text-[#D8BE99]/80 font-sans uppercase font-medium tracking-wide bg-[#D4AF37]/20 px-2.5 py-0.5 rounded-full">
                      Tier Inherited (Read-Only)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* CATEGORY !== 1: Standard Direct Selling Price */
              <div className="p-4 rounded-xl bg-black/40 border border-[#D4AF37]/20 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-1.5">
                  <label className="text-[#D8BE99] font-semibold uppercase tracking-wider text-xs">
                    Selling Price (€ EUR) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F2D675] font-mono font-bold">€</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="e.g. 24.50"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className={`w-full bg-black/60 border ${formErrors.price ? 'border-rose-500' : 'border-[#D4AF37]/30'} rounded-xl py-2.5 pl-8 pr-3 text-xs font-mono font-bold text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none`}
                    />
                  </div>
                  {formErrors.price && (
                    <p className="text-[11px] text-rose-400">{formErrors.price}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Shipping Weight & Name Translatable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 items-center text-xs">
            {/* Shipping Weight (kg) */}
            <div className="space-y-1.5">
              <label className="text-[#D8BE99] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Shipping Weight (kg) <span className="text-rose-400">*</span></span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g. 0.450"
                value={formData.shippingWeight}
                onChange={(e) => setFormData({ ...formData, shippingWeight: e.target.value })}
                className={`w-full bg-black/60 border ${formErrors.shippingWeight ? 'border-rose-500' : 'border-[#D4AF37]/30'} rounded-xl py-2.5 px-3 text-xs font-mono text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none`}
              />
              {formErrors.shippingWeight && (
                <p className="text-[11px] text-rose-400">{formErrors.shippingWeight}</p>
              )}
            </div>

            {/* Name is Translatable Checkbox */}
            <div className="flex items-center gap-3 pt-2 sm:pt-5">
              <input
                type="checkbox"
                id="field-name-translatable"
                checked={formData.nameIsTranslatable}
                onChange={(e) => setFormData({ ...formData, nameIsTranslatable: e.target.checked })}
                className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
              />
              <label htmlFor="field-name-translatable" className="text-xs text-[#D8BE99] cursor-pointer">
                Product Name is Translatable across Languages
              </label>
            </div>
          </div>

          {/* Explicit Active / Inactive Toggle Switch */}
          <div className="p-4 rounded-xl bg-black/50 border border-[#D4AF37]/30 space-y-2.5 mt-2">
            <div className="flex items-center justify-between">
              <label className="text-[#F2D675] font-cinzel font-bold uppercase tracking-wider text-xs">
                Catalog Publication Status <span className="text-rose-400">*</span>
              </label>
              <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                formData.isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}>
                {formData.isActive ? '● ACTIVE / LIVE' : '○ INACTIVE / DRAFT'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isActive: true }))}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-cinzel font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  formData.isActive
                    ? 'bg-gradient-to-r from-emerald-600/30 to-emerald-500/20 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                    : 'bg-black/40 border border-white/10 text-neutral-400 hover:text-neutral-200 hover:border-white/20'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${formData.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'}`} />
                <span>Active (Published in Boutique)</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isActive: false }))}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-cinzel font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  !formData.isActive
                    ? 'bg-gradient-to-r from-rose-600/30 to-rose-500/20 border-2 border-rose-400 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                    : 'bg-black/40 border border-white/10 text-neutral-400 hover:text-neutral-200 hover:border-white/20'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${!formData.isActive ? 'bg-rose-400' : 'bg-neutral-600'}`} />
                <span>Inactive (Hidden / Private Vault)</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. MEDIA & PRODUCT IMAGE (2-Step Image Upload) */}
        <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/25 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D4AF37]/20 pb-3">
            <ImageIcon className="w-4 h-4 text-[#F2D675]" />
            <h2 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#F2D675]">
              3. Media & Product Image
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Image Preview / Drop Area */}
            <div className="md:col-span-4 flex flex-col items-center">
              <div className="w-36 h-44 rounded-2xl bg-black/60 border border-[#D4AF37]/40 flex items-center justify-center overflow-hidden p-2 shadow-inner relative group">
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="Product preview"
                    className="max-h-full max-w-full object-contain drop-shadow"
                    onError={(e) => {
                      e.target.src = '/products/luxury_designs/07_arabian_gold.webp';
                    }}
                  />
                ) : (
                  <ImageIcon className="w-10 h-10 text-[#D4AF37]/30" />
                )}
              </div>

              {formData.imageUrl && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: '' })}
                  className="mt-2 text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Remove Image</span>
                </button>
              )}
            </div>

            {/* Upload Control */}
            <div className="md:col-span-8 space-y-3 text-xs">
              <label className="block w-full px-5 py-4 border border-dashed border-[#D4AF37]/40 rounded-xl bg-black/40 hover:bg-[#1A1108]/50 text-center cursor-pointer transition-all">
                {uploadingImage ? (
                  <div className="flex items-center justify-center gap-2 text-[#F2D675]">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Uploading 100% — Validating on server...</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="w-5 h-5 text-[#F2D675] mx-auto" />
                    <p className="text-xs text-[#F3E6D0] font-medium">
                      Click to Browse or Drag & Drop image here
                    </p>
                    <p className="text-[10px] text-[#D8BE99]/60">
                      Max file size: 20MB. Allowed formats: WEBP, PNG, JPG, GIF
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageFileChange}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>

              <div className="space-y-1">
                <label className="text-[#D8BE99] font-medium text-[11px]">
                  Or direct CDN Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://cdn.perfumestore.com/products/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs font-mono text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. LOCALIZED CONTENT & TRANSLATIONS (En, Bg, Es Tabs) */}
        <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/25 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D4AF37]/20 pb-3 gap-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#F2D675]" />
              <h2 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#F2D675]">
                4. Localized Content & Translations
              </h2>
            </div>

            {/* Language Tabs */}
            <div className="flex items-center gap-2">
              {[
                { code: 'En', label: 'English (en) *' },
                { code: 'Bg', label: 'Bulgarian (bg)' },
                { code: 'Es', label: 'Spanish (es)' }
              ].map((tab) => (
                <button
                  key={tab.code}
                  type="button"
                  onClick={() => setActiveLangTab(tab.code)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-cinzel uppercase tracking-wider font-bold transition-all cursor-pointer ${
                    activeLangTab === tab.code
                      ? 'bg-[#D4AF37] text-black shadow-md'
                      : 'bg-black/60 text-[#D8BE99] hover:text-[#F3E6D0] border border-[#D4AF37]/25'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Tab Translation Fields */}
          <div className="space-y-4 text-xs pt-1">
            {/* Product Name */}
            <div className="space-y-1.5">
              <label className="text-[#D8BE99] font-semibold uppercase tracking-wider flex items-center justify-between">
                <span>Product Name ({activeLangTab}) {activeLangTab === 'En' ? <span className="text-rose-400">*</span> : ''}</span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {translations[activeLangTab]?.name?.length || 0}/200
                </span>
              </label>
              <input
                type="text"
                placeholder={
                  activeLangTab === 'En'
                    ? 'e.g. Sauvage Elixir 60ml'
                    : activeLangTab === 'Bg'
                    ? 'напр. Соваж Еликсир 60мл'
                    : 'p. ej. Sauvage Elixir 60ml'
                }
                value={translations[activeLangTab]?.name || ''}
                onChange={(e) => handleTranslationChange('name', e.target.value)}
                maxLength={200}
                className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2.5 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            {/* Product Description */}
            <div className="space-y-1.5">
              <label className="text-[#D8BE99] font-semibold uppercase tracking-wider flex items-center justify-between">
                <span>Product Description ({activeLangTab})</span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {translations[activeLangTab]?.description?.length || 0}/5000
                </span>
              </label>
              <textarea
                rows={3}
                placeholder={
                  activeLangTab === 'En'
                    ? 'Rich, captivating nocturnal scent with notes of licorice, nutmeg and lavender...'
                    : activeLangTab === 'Bg'
                    ? 'Богат, завладяващ нощен аромат с нотки на лакриц, индийско орехче и лавандула...'
                    : 'Fragancia nocturna rica y cautivadora con notas de regaliz, nuez moscada y lavanda...'
                }
                value={translations[activeLangTab]?.description || ''}
                onChange={(e) => handleTranslationChange('description', e.target.value)}
                maxLength={5000}
                className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            {/* Ingredients */}
            <div className="space-y-1.5">
              <label className="text-[#D8BE99] font-semibold uppercase tracking-wider flex items-center justify-between">
                <span>Ingredients ({activeLangTab})</span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {translations[activeLangTab]?.ingredients?.length || 0}/3000
                </span>
              </label>
              <textarea
                rows={2}
                placeholder="Alcohol Denat., Fragrance (Parfum), Aqua/Water/Eau, Linalool, Coumarin..."
                value={translations[activeLangTab]?.ingredients || ''}
                onChange={(e) => handleTranslationChange('ingredients', e.target.value)}
                maxLength={3000}
                className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#D4AF37]/20">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            disabled={saveLoading}
            className="px-6 py-2.5 rounded-xl bg-black/40 hover:bg-black/70 border border-[#D4AF37]/20 text-xs text-[#D8BE99] hover:text-white transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saveLoading}
            className="px-8 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#F2D675] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-xl transition-all hover:brightness-110 shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saveLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{isNew ? 'Create Product' : 'Save Changes'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
