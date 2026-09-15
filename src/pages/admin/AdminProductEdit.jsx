import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useToast } from '../../context/ToastContext';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { subcategoryService } from '../../services/subcategoryService';
import { perfumeCategoryService } from '../../services/perfumeCategoryService';
import { brandService } from '../../services/brandService';
import {
  ArrowLeft,
  Save,
  Sparkles,
  Crown,
  Building2,
  Layers,
  FolderTree,
  Upload,
  Image as ImageIcon,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Euro,
  X
} from 'lucide-react';

export default function AdminProductEdit() {
  const { currentPath, navigate } = useRouter();
  const { success, error } = useToast();

  const isNew = currentPath.endsWith('/new') || currentPath.includes('/admin/products/new') || currentPath === '/admin/products/add' || currentPath === '/admin/add-product';
  const editId = isNew ? null : currentPath.split('/admin/products/')[1]?.split('/edit')[0];

  // Lookup Lists
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [perfumeCategories, setPerfumeCategories] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    arabicName: '',
    bulgarianName: '',
    tagline: '',
    description: '',
    ingredients: '',
    brandId: '',
    categoryId: 1, // Default to Perfumes (ID 1)
    subcategoryId: '',
    perfumeCategoryId: '',
    gender: 'Unisex',
    price: '',
    stock: 50,
    imageUrl: '/products/luxury_designs/07_arabian_gold.webp',
    isActive: true,
    topNotes: '',
    heartNotes: '',
    baseNotes: '',
    featured: false,
    isBestSeller: false
  });

  const [formErrors, setFormErrors] = useState({});
  const [pageLoading, setPageLoading] = useState(true);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const isPerfumeCategory = Number(formData.categoryId) === 1;

  // Find currently selected perfume tier to display its price
  const selectedTier = perfumeCategories.find(
    t => Number(t.id) === Number(formData.perfumeCategoryId)
  );
  const tierPrice = selectedTier ? Number(selectedTier.price) : 0;

  // 1. Initial Load of Reference Data (Brands, Categories, Perfume Tiers)
  useEffect(() => {
    async function loadReferenceData() {
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
        }
      } catch (err) {
        console.warn('Failed to load initial catalog lookup data:', err.message);
      } finally {
        setPageLoading(false);
      }
    }
    loadReferenceData();
  }, [isNew]);

  // 2. Load Existing Product (if in Edit mode)
  useEffect(() => {
    if (isNew || !editId) return;

    async function loadExistingProduct() {
      try {
        const item = await productService.getProductById(editId);
        if (item) {
          const catId = Number(item.categoryId || item.category?.id || (item.category === 'perfumes' ? 1 : 2)) || 1;
          const isPerfume = catId === 1;

          setFormData({
            name: item.name || '',
            arabicName: item.arabicName || '',
            bulgarianName: item.bulgarianName || '',
            tagline: item.tagline || '',
            description: item.description || '',
            ingredients: item.ingredients || '',
            brandId: Number(item.brandId || item.brand?.id || 1),
            categoryId: catId,
            subcategoryId: item.subcategoryId ? Number(item.subcategoryId) : '',
            perfumeCategoryId: isPerfume ? Number(item.perfumeCategoryId || item.perfumeCategory?.id || 1) : '',
            gender: item.gender || 'Unisex',
            price: isPerfume ? '' : (item.price !== undefined && item.price !== null ? String(item.price) : ''),
            stock: item.stock !== undefined ? Number(item.stock) : 50,
            imageUrl: item.imageUrl || item.image || (Array.isArray(item.images) ? item.images[0] : '/products/luxury_designs/07_arabian_gold.webp'),
            isActive: item.isActive !== false && item.status !== 'INACTIVE',
            topNotes: Array.isArray(item.topNotes) ? item.topNotes.join(', ') : (item.notes?.top?.join(', ') || ''),
            heartNotes: Array.isArray(item.heartNotes) ? item.heartNotes.join(', ') : (item.notes?.heart?.join(', ') || ''),
            baseNotes: Array.isArray(item.baseNotes) ? item.baseNotes.join(', ') : (item.notes?.base?.join(', ') || ''),
            featured: Boolean(item.featured),
            isBestSeller: Boolean(item.isBestSeller)
          });
        }
      } catch (err) {
        error('Failed to load product details.');
      }
    }

    loadExistingProduct();
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

  // Handle Category Change (Cascading)
  const handleCategoryChange = (newCatId) => {
    const numId = Number(newCatId);
    const isPerfume = numId === 1;

    setFormData(prev => ({
      ...prev,
      categoryId: numId,
      subcategoryId: '', // Reset subcategory selection
      perfumeCategoryId: isPerfume ? (prev.perfumeCategoryId || perfumeCategories[0]?.id || 1) : '',
      price: isPerfume ? '' : (prev.price || '50')
    }));
  };

  // Image Upload Handler
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  // Form Validation
  const validateForm = () => {
    const errs = {};
    if (!formData.name || !formData.name.trim()) {
      errs.name = 'Product name is required.';
    }
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
      if (formData.price === '' || isNaN(priceNum) || priceNum < 0) {
        errs.price = 'Please enter a valid non-negative selling price.';
      }
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
      const topArr = formData.topNotes.split(',').map(n => n.trim()).filter(Boolean);
      const heartArr = formData.heartNotes.split(',').map(n => n.trim()).filter(Boolean);
      const baseArr = formData.baseNotes.split(',').map(n => n.trim()).filter(Boolean);

      const ingredientsString = formData.ingredients.trim() ||
        [topArr.join(', '), heartArr.join(', '), baseArr.join(', ')].filter(Boolean).join(' • ') ||
        'Rare Oud, Amber, Taif Rose';

      const selectedBrand = brands.find(b => Number(b.id) === Number(formData.brandId));
      const selectedCat = categories.find(c => Number(c.id) === Number(formData.categoryId));

      // Build payload strictly adhering to pricing rules:
      // Category 1 (Perfumes): perfumeCategoryId required, price: null
      // Non-perfumes: perfumeCategoryId: null, price: Number(price)
      const payload = {
        name: formData.name.trim(),
        arabicName: formData.arabicName.trim() || formData.name.trim(),
        bulgarianName: formData.bulgarianName.trim() || formData.name.trim(),
        tagline: formData.tagline.trim(),
        description: formData.description.trim(),
        ingredients: ingredientsString,
        brandId: Number(formData.brandId),
        brandName: selectedBrand?.name || '',
        categoryId: Number(formData.categoryId),
        categoryName: selectedCat?.name || '',
        subcategoryId: formData.subcategoryId ? Number(formData.subcategoryId) : null,
        perfumeCategoryId: isPerfumeCategory ? Number(formData.perfumeCategoryId) : null,
        tier: isPerfumeCategory ? (selectedTier?.name || 'Luxury') : null,
        perfumeCategoryName: isPerfumeCategory ? (selectedTier?.name || 'Luxury') : null,
        price: isPerfumeCategory ? null : Number(formData.price),
        gender: formData.gender || 'Unisex',
        stock: Number(formData.stock) || 0,
        imageUrl: formData.imageUrl?.trim() || '/products/luxury_designs/07_arabian_gold.webp',
        image: formData.imageUrl?.trim() || '/products/luxury_designs/07_arabian_gold.webp',
        isActive: Boolean(formData.isActive),
        topNotes: topArr,
        heartNotes: heartArr,
        baseNotes: baseArr,
        notes: {
          top: topArr,
          heart: heartArr,
          base: baseArr
        },
        featured: Boolean(formData.featured),
        isBestSeller: Boolean(formData.isBestSeller)
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
              {isNew ? 'Create New Product' : `Edit Product: ${formData.name || `#${editId}`}`}
            </h1>
            <p className="text-xs text-[#D8BE99] mt-0.5">
              Configure taxonomy, olfactory pyramid, pricing tier, and inventory.
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
          <span>{saveLoading ? 'Saving...' : 'Save Product'}</span>
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: Product Classification & Pricing (Crucial Catalog API Section) */}
        <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/25 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-5">
          <div className="flex items-center gap-2 border-b border-[#D4AF37]/20 pb-3">
            <Layers className="w-4 h-4 text-[#F2D675]" />
            <h2 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#F2D675]">
              Catalog Classification & Pricing
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* 1. Category Selector */}
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
                    {c.name} {Number(c.id) === 1 ? '(Perfumes Tiered)' : ''}
                  </option>
                ))}
              </select>
              {formErrors.categoryId && (
                <p className="text-[11px] text-rose-400">{formErrors.categoryId}</p>
              )}
            </div>

            {/* 2. Cascading Subcategory Selector */}
            <div className="space-y-1.5">
              <label className="text-[#D8BE99] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Subcategory</span>
                {subcategoriesLoading && <RefreshCw className="w-3 h-3 animate-spin text-[#D4AF37]" />}
              </label>
              <select
                value={formData.subcategoryId}
                onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                disabled={subcategoriesLoading || subcategories.length === 0}
                className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2.5 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer disabled:opacity-50"
              >
                <option value="" className="bg-[#120B06]">
                  {subcategories.length === 0 ? 'No Subcategories Available' : 'None / General'}
                </option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id} className="bg-[#120B06]">
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Brand Selector */}
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
                <option value="" disabled className="bg-[#120B06]">Select a Brand...</option>
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

            {/* 4. Gender */}
            <div className="space-y-1.5">
              <label className="text-[#D8BE99] font-semibold uppercase tracking-wider">
                Gender Target
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2.5 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
              >
                <option value="Unisex" className="bg-[#120B06]">Unisex (Shared)</option>
                <option value="Male" className="bg-[#120B06]">Pour Homme (Male)</option>
                <option value="Female" className="bg-[#120B06]">Pour Femme (Female)</option>
              </select>
            </div>
          </div>

          {/* Pricing Row: Strict Perfume Pricing Tier vs Non-Perfume Custom Price */}
          <div className="pt-3 border-t border-[#D4AF37]/15">
            {isPerfumeCategory ? (
              /* PERFUME PRICING MODE: Tier dropdown + READ-ONLY price display */
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#D4AF37]/15 via-black/60 to-black/80 border border-[#D4AF37]/40 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-1.5">
                  <label className="text-[#F2D675] font-semibold uppercase tracking-wider flex items-center gap-1.5 text-xs">
                    <Crown className="w-3.5 h-3.5 text-[#F2D675]" />
                    <span>Perfume Pricing Tier <span className="text-rose-400">*</span></span>
                  </label>
                  <select
                    value={formData.perfumeCategoryId}
                    onChange={(e) => setFormData({ ...formData, perfumeCategoryId: e.target.value })}
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
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#D8BE99] font-semibold uppercase tracking-wider text-xs">
                    Effective Selling Price (€ EUR)
                  </label>
                  <div className="w-full bg-black/80 border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-[#F2D675] font-mono font-bold text-sm flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Euro className="w-4 h-4" />
                      {tierPrice > 0 ? tierPrice.toFixed(2) : '—'}
                    </span>
                    <span className="text-[10px] text-[#D8BE99]/80 font-sans uppercase font-medium tracking-wide bg-[#D4AF37]/20 px-2.5 py-0.5 rounded-full">
                      Inherited From Tier (Read-Only)
                    </span>
                  </div>
                  <p className="text-[10px] text-[#D8BE99]/60">
                    Perfumes automatically inherit price from their assigned pricing tier.
                  </p>
                </div>
              </div>
            ) : (
              /* NON-PERFUME PRICING MODE: Editable Price Input */
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
                      min="0"
                      placeholder="e.g. 35.00"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className={`w-full bg-black/60 border ${formErrors.price ? 'border-rose-500' : 'border-[#D4AF37]/30'} rounded-xl py-2.5 pl-8 pr-3 text-xs font-mono font-bold text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none`}
                    />
                  </div>
                  {formErrors.price && (
                    <p className="text-[11px] text-rose-400">{formErrors.price}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#D8BE99] font-semibold uppercase tracking-wider text-xs">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2.5 px-3 text-xs font-mono text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: General Information & Multilingual Content */}
        <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/25 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D4AF37]/20 pb-3">
            <Sparkles className="w-4 h-4 text-[#F2D675]" />
            <h2 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#F2D675]">
              Product Names & Descriptions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* English Name */}
            <div className="space-y-1.5">
              <label className="text-[#D8BE99] font-semibold uppercase tracking-wider">
                English Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Imperial Oud Extrait"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full bg-black/60 border ${formErrors.name ? 'border-rose-500' : 'border-[#D4AF37]/30'} rounded-xl py-2.5 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none`}
              />
              {formErrors.name && (
                <p className="text-[11px] text-rose-400">{formErrors.name}</p>
              )}
            </div>

            {/* Arabic Name */}
            <div className="space-y-1.5">
              <label className="text-[#D8BE99] font-semibold uppercase tracking-wider">
                Arabic Name (الاسم العربي)
              </label>
              <input
                type="text"
                dir="rtl"
                placeholder="عطر العود الإمبراطوري"
                value={formData.arabicName}
                onChange={(e) => setFormData({ ...formData, arabicName: e.target.value })}
                className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2.5 px-3 text-xs font-arabic text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            {/* Bulgarian Name */}
            <div className="space-y-1.5">
              <label className="text-[#D8BE99] font-semibold uppercase tracking-wider">
                Bulgarian Name (Име на Български)
              </label>
              <input
                type="text"
                placeholder="Имперски уд екстракт"
                value={formData.bulgarianName}
                onChange={(e) => setFormData({ ...formData, bulgarianName: e.target.value })}
                className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2.5 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            {/* Tagline */}
            <div className="space-y-1.5">
              <label className="text-[#D8BE99] font-semibold uppercase tracking-wider">
                Subtitle / Tagline
              </label>
              <input
                type="text"
                placeholder="e.g. Pure Cambodian Oud & Taif Rose"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2.5 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            {/* Ingredients */}
            <div className="space-y-1.5">
              <label className="text-[#D8BE99] font-semibold uppercase tracking-wider">
                Ingredients Key Summary
              </label>
              <input
                type="text"
                placeholder="e.g. Rare Oud, Amber Crystals, Taif Rose, Musk"
                value={formData.ingredients}
                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2.5 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5 pt-2 text-xs">
            <label className="text-[#D8BE99] font-semibold uppercase tracking-wider">
              Comprehensive Story & Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe the inspiration, aroma profile, and wearing experience..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
            />
          </div>
        </div>

        {/* SECTION 3: Olfactory Pyramid */}
        <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/25 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D4AF37]/20 pb-3">
            <Crown className="w-4 h-4 text-[#F2D675]" />
            <h2 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#F2D675]">
              Olfactory Notes Pyramid
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[#D8BE99] font-semibold uppercase tracking-wider">
                Top Notes (Comma separated)
              </label>
              <input
                type="text"
                placeholder="Ambergris, Smoked Saffron, Bergamot"
                value={formData.topNotes}
                onChange={(e) => setFormData({ ...formData, topNotes: e.target.value })}
                className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2.5 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#D8BE99] font-semibold uppercase tracking-wider">
                Heart Notes (Comma separated)
              </label>
              <input
                type="text"
                placeholder="Royal Cambodian Agarwood, Midnight Rose"
                value={formData.heartNotes}
                onChange={(e) => setFormData({ ...formData, heartNotes: e.target.value })}
                className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2.5 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#D8BE99] font-semibold uppercase tracking-wider">
                Base Notes (Comma separated)
              </label>
              <input
                type="text"
                placeholder="Dark Fossilized Amber, Smoky Cedar, White Musk"
                value={formData.baseNotes}
                onChange={(e) => setFormData({ ...formData, baseNotes: e.target.value })}
                className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2.5 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Media & Status */}
        <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/25 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D4AF37]/20 pb-3">
            <ImageIcon className="w-4 h-4 text-[#F2D675]" />
            <h2 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#F2D675]">
              Product Imagery & Visibility
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Image Preview */}
            <div className="md:col-span-4 flex flex-col items-center">
              <div className="w-36 h-44 rounded-2xl bg-black/60 border border-[#D4AF37]/40 flex items-center justify-center overflow-hidden p-2 shadow-inner relative group">
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt={formData.name}
                    className="max-h-full max-w-full object-contain drop-shadow"
                    onError={(e) => {
                      e.target.src = '/products/luxury_designs/07_arabian_gold.webp';
                    }}
                  />
                ) : (
                  <ImageIcon className="w-10 h-10 text-[#D4AF37]/30" />
                )}
              </div>

              {/* Direct File Upload Button */}
              <div className="mt-3 w-full max-w-xs">
                <label className="w-full px-4 py-2 bg-black/60 hover:bg-[#21130D] border border-[#D4AF37]/40 rounded-xl text-xs text-[#F2D675] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all">
                  {uploadingImage ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{uploadingImage ? 'Uploading Image...' : 'Upload New Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Image URL & Status Toggles */}
            <div className="md:col-span-8 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[#D8BE99] font-semibold uppercase tracking-wider">
                  Image URL / Asset Path
                </label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="/products/luxury_designs/07_arabian_gold.webp"
                  className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2.5 px-3 text-xs font-mono text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#D4AF37]/15 space-y-3">
                {/* Active Checkbox */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="prod-active"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
                  />
                  <label htmlFor="prod-active" className="text-xs text-[#F3E6D0] cursor-pointer">
                    <strong className="text-[#F2D675]">Active in Store:</strong> Publish this product immediately to the storefront catalog.
                  </label>
                </div>

                {/* Featured Checkbox */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="prod-featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
                  />
                  <label htmlFor="prod-featured" className="text-xs text-[#F3E6D0] cursor-pointer">
                    Featured Collection (highlighted on homepage showcase)
                  </label>
                </div>

                {/* Best Seller */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="prod-bestseller"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
                  />
                  <label htmlFor="prod-bestseller" className="text-xs text-[#F3E6D0] cursor-pointer">
                    Best Seller Badge
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions Bottom Bar */}
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
