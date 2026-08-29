import React, { useState, useEffect } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { productService } from '../../services/productService';
import { brandApi } from '../../api/brand.api';
import { productApi } from '../../api/product.api';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Save, Sparkles, Crown, Building2, Layers } from 'lucide-react';

export default function AdminProductEdit() {
  const { currentPath, navigate } = useRouter();
  const { t } = useTranslation();
  const { success, error } = useToast();

  const isNew = currentPath.endsWith('/new');
  const editId = isNew ? null : currentPath.split('/admin/products/')[1]?.split('/edit')[0];

  const [brands, setBrands] = useState([
    { id: 1, name: 'Dior' },
    { id: 2, name: 'Chanel' },
    { id: 3, name: 'Tom Ford' },
    { id: 4, name: 'Arabian Sheikh' }
  ]);

  const [categories, setCategories] = useState([
    { id: 1, name: 'Perfumes' },
    { id: 2, name: 'Oils' },
    { id: 3, name: 'Bakhoor' },
    { id: 4, name: 'Cosmetics' },
    { id: 5, name: 'Bundles' }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    arabicName: '',
    bulgarianName: '',
    tagline: '',
    description: '',
    brandId: 1,
    brandName: 'Dior',
    categoryId: 1,
    categoryName: 'Perfumes',
    price: 40,
    originalPrice: '',
    hasDiscount: false,
    discountPercent: 20,
    tier: 'Royal',
    category: 'perfumes',
    gender: 'Unisex',
    fragranceFamily: 'Oriental / Amber',
    topNotes: 'Ambergris, Smoked Saffron, Bergamot',
    heartNotes: 'Royal Cambodian Agarwood, Midnight Rose',
    baseNotes: 'Dark Fossilized Amber, Smoky Cedar, White Musk',
    size: '60 ml / 2.0 fl oz',
    stock: 30,
    longevity: '12+ Hours',
    sillage: 'Strong & Sophisticated',
    images: '/products/luxury_designs/07_arabian_gold.webp',
    featured: true,
    isBestSeller: false,
    status: 'ACTIVE'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [brandsList, catsList] = await Promise.all([
          brandApi.adminGetBrands().catch(() => null) || brandApi.getBrands().catch(() => null),
          productApi.adminGetCategories().catch(() => null) || productApi.getCategories().catch(() => null)
        ]);
        if (Array.isArray(brandsList) && brandsList.length > 0) {
          setBrands(brandsList);
        }
        if (Array.isArray(catsList) && catsList.length > 0) {
          setCategories(catsList);
        }
      } catch {}
    }
    loadMeta();
  }, []);

  useEffect(() => {
    async function loadItem() {
      if (isNew || !editId) return;
      try {
        const item = await productService.getProductById(editId);
        if (item) {
          const isDisc = Boolean(item.hasDiscount || (item.originalPrice && item.originalPrice > item.price));
          const baseP = item.originalPrice && item.originalPrice > item.price ? item.originalPrice : item.price;
          const discPct = item.discountPercent || (isDisc && item.originalPrice ? Math.round((1 - item.price / item.originalPrice) * 100) : 20);

          setFormData({
            ...item,
            brandId: Number(item.brandId || item.brand?.id) || 1,
            categoryId: Number(item.categoryId || item.category?.id) || 1,
            categoryName: item.categoryName || item.category?.name || 'Perfumes',
            category: (item.category || item.categoryName || 'perfumes').toLowerCase(),
            hasDiscount: isDisc,
            discountPercent: discPct,
            price: isDisc ? item.price : baseP,
            originalPrice: isDisc ? baseP : '',
            topNotes: item.topNotes?.join(', ') || item.notes?.top?.join(', ') || '',
            heartNotes: item.heartNotes?.join(', ') || item.notes?.heart?.join(', ') || '',
            baseNotes: item.baseNotes?.join(', ') || item.notes?.base?.join(', ') || '',
            images: item.images?.join(', ') || item.cutoutImage || ''
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadItem();
  }, [editId, isNew]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const topArr = formData.topNotes.split(',').map(n => n.trim()).filter(Boolean);
      const heartArr = formData.heartNotes.split(',').map(n => n.trim()).filter(Boolean);
      const baseArr = formData.baseNotes.split(',').map(n => n.trim()).filter(Boolean);
      const imagesArr = formData.images.split(',').map(img => img.trim()).filter(Boolean);

      const isPerfume = formData.category === 'perfumes' || !!formData.tier;
      let perfumeCatId = null;
      let calculatedPrice = Number(formData.price) || 0;

      if (isPerfume) {
        if (formData.tier === 'Royal') {
          perfumeCatId = 2;
          calculatedPrice = 40;
        } else if (formData.tier === 'Classic') {
          perfumeCatId = 3;
          calculatedPrice = 30;
        } else {
          perfumeCatId = 1;
          calculatedPrice = 50;
        }
      }

      const payload = {
        name: formData.name,
        arabicName: formData.arabicName,
        bulgarianName: formData.bulgarianName,
        spanishName: formData.spanishName,
        description: formData.description,
        ingredients: formData.ingredients || [topArr.join(', '), heartArr.join(', '), baseArr.join(', ')].filter(Boolean).join(' • ') || 'Rare Oud, Amber, Taif Rose',
        brandId: Number(formData.brandId) || 1,
        categoryId: Number(formData.categoryId) || (isPerfume ? 1 : 2),
        category: formData.category || 'perfumes',
        categoryName: formData.categoryName || 'Perfumes',
        subcategoryId: formData.subcategoryId ? Number(formData.subcategoryId) : null,
        perfumeCategoryId: isPerfume ? perfumeCatId : null,
        tier: isPerfume ? (formData.tier || 'Luxury') : null,
        perfumeCategoryName: isPerfume ? (formData.tier || 'Luxury') : null,
        gender: formData.gender || 'Unisex',
        price: isPerfume ? null : calculatedPrice,
        stock: Number(formData.stock) || 30,
        isActive: formData.status !== 'INACTIVE',
        imageUrl: imagesArr[0] || (typeof formData.images === 'string' ? formData.images : '/products/luxury_designs/07_arabian_gold.webp'),
        topNotes: topArr,
        heartNotes: heartArr,
        baseNotes: baseArr,
        notes: {
          top: topArr,
          heart: heartArr,
          base: baseArr
        },
        images: imagesArr.length > 0 ? imagesArr : ['/products/luxury_designs/07_arabian_gold.webp'],
        cutoutImage: imagesArr[0] || '/products/luxury_designs/07_arabian_gold.webp'
      };

      if (isNew) {
        await productService.createProduct(payload);
        success(`'${payload.name}' added to catalogue.`);
      } else {
        await productService.updateProduct(editId, payload);
        success(`'${payload.name}' updated successfully.`);
      }
      navigate('/admin/products');
    } catch (err) {
      console.error('Save product error:', err);
      error(err.message || 'Failed to save product changes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-[#F3E6D0]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/products')}
            className="p-2 bg-white/5 hover:bg-white/10 rounded transition-colors text-[#D4AF37]"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-cinzel text-xl font-bold uppercase tracking-wider text-[#F3E6D0]">
              {isNew ? 'Create New Flacon / Item' : `Edit Flacon: ${formData.name}`}
            </h1>
            <p className="text-xs text-[#D8BE99]">
              Manage flacon photos, notes pyramid, price, category, and tier.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#0B0A08] border border-[#D4AF37]/20 p-8 shadow-2xl space-y-6">
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-[#D8BE99] uppercase font-cinzel">English Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2 rounded text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[#D8BE99] uppercase font-cinzel">Arabic Name (الاسم العربي)</label>
            <input
              type="text"
              value={formData.arabicName}
              onChange={(e) => setFormData({ ...formData, arabicName: e.target.value })}
              className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2 rounded text-[#F3E6D0] font-arabic focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[#D8BE99] uppercase font-cinzel">Bulgarian Name</label>
            <input
              type="text"
              value={formData.bulgarianName}
              onChange={(e) => setFormData({ ...formData, bulgarianName: e.target.value })}
              className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2 rounded text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
            />
          </div>
        </div>

        {/* Pricing, Tier, Category, Brand */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-xs pt-4 border-t border-white/5">
          {/* Brand Selector */}
          <div className="space-y-1">
            <label className="text-[#D8BE99] uppercase font-cinzel flex items-center gap-1">
              <Building2 className="w-3 h-3 text-[#D4AF37]" />
              <span>Brand</span>
            </label>
            <select
              value={formData.brandId || 1}
              onChange={(e) => {
                const bId = Number(e.target.value);
                const bName = brands.find(b => b.id === bId)?.name || 'Dior';
                setFormData({ ...formData, brandId: bId, brandName: bName });
              }}
              className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2 rounded text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
            >
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name || `Brand #${b.id}`}</option>
              ))}
            </select>
          </div>

          {/* Category Selector */}
          <div className="space-y-1">
            <label className="text-[#D8BE99] uppercase font-cinzel flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#D4AF37]" />
              <span>Category</span>
            </label>
            <select
              value={formData.categoryId || (formData.category === 'perfumes' ? 1 : 2)}
              onChange={(e) => {
                const cId = Number(e.target.value);
                const matched = categories.find(c => Number(c.id) === cId);
                const cName = matched ? (matched.name || '').toLowerCase() : 'perfumes';
                const isNowPerfume = cId === 1 || cName.includes('perfume');
                setFormData({
                  ...formData,
                  categoryId: cId,
                  categoryName: matched?.name || 'Perfumes',
                  category: isNowPerfume ? 'perfumes' : cName,
                  tier: isNowPerfume ? (formData.tier || 'Luxury') : '',
                  price: isNowPerfume ? (formData.tier === 'Classic' ? 30 : formData.tier === 'Royal' ? 40 : 50) : formData.price
                });
              }}
              className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2 rounded text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name || `Category #${c.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Perfume Tier (Shown for Perfumes) */}
          {(formData.category === 'perfumes' || !!formData.tier) ? (
            <div className="space-y-1">
              <label className="text-[#D8BE99] uppercase font-cinzel flex items-center gap-1">
                <Crown className="w-3 h-3 text-[#D4AF37]" />
                <span>Perfume Tier</span>
              </label>
              <select
                value={formData.tier || 'Luxury'}
                onChange={(e) => {
                  const newTier = e.target.value;
                  const newPrice = newTier === 'Classic' ? 30 : (newTier === 'Royal' ? 40 : 50);
                  setFormData({ ...formData, tier: newTier, price: newPrice });
                }}
                className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2 rounded text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
              >
                <option value="Luxury">Luxury Tier (€50 Fixed)</option>
                <option value="Royal">Royal Tier (€40 Fixed)</option>
                <option value="Classic">Classic Tier (€30 Fixed)</option>
              </select>
            </div>
          ) : null}

          {/* Price Field: Readonly Badge for Perfumes, Editable for Non-Perfumes */}
          {(formData.category === 'perfumes' || !!formData.tier) ? (
            <div className="space-y-1">
              <label className="text-[#D8BE99] uppercase font-cinzel">Price (€ EUR)</label>
              <div className="w-full bg-black/40 border border-[#D4AF37]/20 px-3 py-2 rounded text-[#D4AF37] font-mono font-bold flex items-center justify-between">
                <span>
                  {formData.tier === 'Classic' ? '€30' : (formData.tier === 'Royal' ? '€40' : '€50')}
                </span>
                <span className="text-[10px] text-[#D8BE99] font-sans font-normal">(Fixed by Tier)</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-[#D8BE99] uppercase font-cinzel">Price (€ EUR)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2 rounded text-[#D4AF37] font-mono font-bold focus:border-[#D4AF37] focus:outline-none"
                placeholder="Enter custom price"
              />
            </div>
          )}

          {/* Stock Units */}
          <div className="space-y-1">
            <label className="text-[#D8BE99] uppercase font-cinzel">Stock Units</label>
            <input
              type="number"
              required
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2 rounded text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
            />
          </div>
        </div>

        {/* Olfactory Pyramid */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <h3 className="font-cinzel text-xs font-bold uppercase text-[#D4AF37] tracking-wider">
            Olfactory Notes Pyramid (Comma separated)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-[#D8BE99]">Top Notes</label>
              <input
                type="text"
                value={formData.topNotes}
                onChange={(e) => setFormData({ ...formData, topNotes: e.target.value })}
                className="w-full bg-black/60 border border-white/10 px-3 py-2 rounded text-[#F3E6D0]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[#D8BE99]">Heart Notes</label>
              <input
                type="text"
                value={formData.heartNotes}
                onChange={(e) => setFormData({ ...formData, heartNotes: e.target.value })}
                className="w-full bg-black/60 border border-white/10 px-3 py-2 rounded text-[#F3E6D0]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[#D8BE99]">Base Notes</label>
              <input
                type="text"
                value={formData.baseNotes}
                onChange={(e) => setFormData({ ...formData, baseNotes: e.target.value })}
                className="w-full bg-black/60 border border-white/10 px-3 py-2 rounded text-[#F3E6D0]"
              />
            </div>
          </div>
        </div>

        {/* Photos & Assets */}
        <div className="space-y-1 pt-4 border-t border-white/5 text-xs">
          <label className="text-[#D8BE99] uppercase font-cinzel">Image URLs / Paths (Comma separated)</label>
          <input
            type="text"
            value={formData.images}
            onChange={(e) => setFormData({ ...formData, images: e.target.value })}
            placeholder="/products/luxury_designs/07_arabian_gold.webp, /products/luxury_designs/07_arabian_gold.webp"
            className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2 rounded text-[#F3E6D0] font-mono text-xs focus:border-[#D4AF37] focus:outline-none"
          />
          <p className="text-[10px] text-[#D8BE99]">
            Admin can add remaining flacon photos later without touching layout or source code.
          </p>
        </div>

        {/* Tagline & Description */}
        <div className="space-y-3 pt-4 border-t border-white/5 text-xs">
          <div className="space-y-1">
            <label className="text-[#D8BE99] uppercase font-cinzel">Tagline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full bg-black/60 border border-white/10 px-3 py-2 rounded text-[#F3E6D0]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[#D8BE99] uppercase font-cinzel">Full Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-black/60 border border-white/10 p-3 rounded text-[#F3E6D0]"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-cinzel uppercase text-[#F3E6D0]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Creation'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
