import React, { useState, useEffect } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { productService } from '../../services/productService';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Save } from 'lucide-react';

export default function AdminProductEdit() {
  const { currentPath, navigate } = useRouter();
  const { t } = useTranslation();
  const { success, error } = useToast();

  const isNew = currentPath.endsWith('/new');
  const editId = isNew ? null : currentPath.split('/admin/products/')[1]?.split('/edit')[0];

  const [formData, setFormData] = useState({
    name: '',
    arabicName: '',
    tagline: '',
    description: '',
    price: 350,
    originalPrice: '',
    gender: 'unisex',
    category: 'Extrait de Parfum',
    fragranceFamily: 'Woody',
    familyArabic: 'الخشبية',
    topNotes: 'Aged Oud, Saffron, Cardamom',
    heartNotes: 'Smoky Birch, Cambodian Resin, Balsam',
    baseNotes: 'Dehn Al Oud, Dark Ambergris, Patchouli',
    sizes: '50ml, 100ml, 200ml Flacon',
    stock: 25,
    images: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85',
    featured: false,
    isBestSeller: false,
    discount: 0,
    status: 'ACTIVE'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadItem() {
      if (isNew || !editId) return;
      try {
        const item = await productService.getProductById(editId);
        if (item) {
          setFormData({
            ...item,
            originalPrice: item.originalPrice || '',
            topNotes: item.topNotes?.join(', ') || '',
            heartNotes: item.heartNotes?.join(', ') || '',
            baseNotes: item.baseNotes?.join(', ') || '',
            sizes: item.sizes?.join(', ') || '50ml, 100ml, 200ml Flacon',
            images: item.images?.join(', ') || ''
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadItem();
  }, [editId, isNew]);

  const handleFamilyChange = (fam) => {
    const arabicMap = {
      'Floral': 'الزهرية',
      'Oriental / Amber': 'الشرقية',
      'Woody': 'الخشبية',
      'Fresh': 'المنعشة',
      'Fruity': 'الفاكهية'
    };
    setFormData({
      ...formData,
      fragranceFamily: fam,
      familyArabic: arabicMap[fam] || 'الشرقية'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        stock: Number(formData.stock),
        discount: Number(formData.discount || 0),
        topNotes: formData.topNotes.split(',').map(n => n.trim()).filter(Boolean),
        heartNotes: formData.heartNotes.split(',').map(n => n.trim()).filter(Boolean),
        baseNotes: formData.baseNotes.split(',').map(n => n.trim()).filter(Boolean),
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
        images: formData.images.split(',').map(img => img.trim()).filter(Boolean)
      };

      if (isNew) {
        await productService.createProduct(payload);
        success(`'${payload.name}' distilled and added to the Palace Vault.`);
      } else {
        await productService.updateProduct(editId, payload);
        success(`'${payload.name}' formulation updated.`);
      }
      navigate('/admin/products');
    } catch (err) {
      error(err.message || 'Could not save fragrance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[var(--color-earth-dark)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-terracotta-deep)]/20 pb-4">
        <div>
          <button
            onClick={() => navigate('/admin/products')}
            className="text-xs text-[var(--color-terracotta)] hover:underline flex items-center gap-1 mb-2 font-cinzel font-bold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Fragrance Vault</span>
          </button>
          <h1 className="font-cinzel text-2xl font-bold uppercase text-[var(--color-earth-dark)]">
            {isNew ? t('admin.addNewProduct') : t('admin.editProduct')}
          </h1>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 p-6 sm:p-8 space-y-6 shadow-2xl text-xs font-sans">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="font-cinzel text-sm font-bold uppercase text-[var(--color-terracotta)] border-b border-[var(--color-terracotta-deep)]/20 pb-2">
            1. Nomenclature & Narrative
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[var(--color-terracotta-deep)] font-semibold mb-1 uppercase tracking-wider">{t('admin.productName')}</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Royal Dehn Al Oud"
                className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[var(--color-terracotta-deep)] font-semibold mb-1 uppercase tracking-wider">Arabic Name (الاسم بالعربية)</label>
              <input
                type="text"
                required
                value={formData.arabicName}
                onChange={(e) => setFormData({ ...formData, arabicName: e.target.value })}
                placeholder="دهن العود الملكي"
                className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 font-arabic focus:border-[var(--color-terracotta)] focus:outline-none font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[var(--color-terracotta-deep)] font-semibold mb-1 uppercase tracking-wider">Tagline</label>
            <input
              type="text"
              required
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="e.g. The Pinnacle of Wild Aged Assamese Agarwood"
              className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[var(--color-terracotta-deep)] font-semibold mb-1 uppercase tracking-wider">Description & Scent Journey</label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none"
            />
          </div>
        </div>

        {/* Classification & Pricing */}
        <div className="space-y-4 pt-4 border-t border-[var(--color-terracotta-deep)]/20">
          <h3 className="font-cinzel text-sm font-bold uppercase text-[var(--color-terracotta)] border-b border-[var(--color-terracotta-deep)]/20 pb-2">
            2. Classification & Pricing
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[var(--color-terracotta-deep)] font-semibold mb-1 uppercase tracking-wider">{t('admin.gender')}</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-[var(--color-earth-dark)] focus:border-[var(--color-terracotta)] focus:outline-none cursor-pointer font-medium"
              >
                <option value="unisex">Unisex</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
              </select>
            </div>

            <div>
              <label className="block text-[var(--color-terracotta-deep)] font-semibold mb-1 uppercase tracking-wider">{t('admin.family')}</label>
              <select
                value={formData.fragranceFamily}
                onChange={(e) => handleFamilyChange(e.target.value)}
                className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-[var(--color-earth-dark)] focus:border-[var(--color-terracotta)] focus:outline-none cursor-pointer font-medium"
              >
                <option value="Woody">Woody (Oud)</option>
                <option value="Oriental / Amber">Oriental / Amber</option>
                <option value="Floral">Floral</option>
                <option value="Fresh">Fresh</option>
                <option value="Fruity">Fruity</option>
              </select>
            </div>

            <div>
              <label className="block text-[var(--color-terracotta-deep)] font-semibold mb-1 uppercase tracking-wider">{t('admin.status')}</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-[var(--color-earth-dark)] focus:border-[var(--color-terracotta)] focus:outline-none cursor-pointer font-medium"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="DRAFT">DRAFT</option>
                <option value="OUT_OF_STOCK">OUT OF STOCK</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[var(--color-terracotta-deep)] font-semibold mb-1 uppercase tracking-wider">{t('admin.price')}</label>
              <input
                type="number"
                required
                min={50}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-[var(--color-earth-dark)] focus:border-[var(--color-terracotta)] focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-[var(--color-terracotta-deep)] font-semibold mb-1 uppercase tracking-wider">{t('admin.originalPrice')}</label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                placeholder="Optional"
                className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[var(--color-terracotta-deep)] font-semibold mb-1 uppercase tracking-wider">{t('admin.stock')}</label>
              <input
                type="number"
                required
                min={0}
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-[var(--color-earth-dark)] focus:border-[var(--color-terracotta)] focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-[var(--color-terracotta-deep)] font-semibold mb-1 uppercase tracking-wider">Discount (%)</label>
              <input
                type="number"
                min={0}
                max={90}
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-[var(--color-earth-dark)] focus:border-[var(--color-terracotta)] focus:outline-none font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Olfactory Pyramid */}
        <div className="space-y-4 pt-4 border-t border-[var(--color-terracotta-deep)]/20">
          <h3 className="font-cinzel text-sm font-bold uppercase text-[var(--color-terracotta)] border-b border-[var(--color-terracotta-deep)]/20 pb-2">
            3. Olfactory Notes Pyramid (Comma Separated)
          </h3>

          <div>
            <label className="block text-[var(--color-terracotta-deep)] font-semibold mb-1 uppercase tracking-wider">{t('admin.topNotes')}</label>
            <input
              type="text"
              required
              value={formData.topNotes}
              onChange={(e) => setFormData({ ...formData, topNotes: e.target.value })}
              placeholder="e.g. Aged Oud, Saffron Threads, Cardamom Smoke"
              className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[var(--color-terracotta-deep)] font-semibold mb-1 uppercase tracking-wider">{t('admin.heartNotes')}</label>
            <input
              type="text"
              required
              value={formData.heartNotes}
              onChange={(e) => setFormData({ ...formData, heartNotes: e.target.value })}
              placeholder="e.g. Smoky Birch, Cambodian Resin, Night Lily"
              className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[var(--color-terracotta-deep)] font-semibold mb-1 uppercase tracking-wider">{t('admin.baseNotes')}</label>
            <input
              type="text"
              required
              value={formData.baseNotes}
              onChange={(e) => setFormData({ ...formData, baseNotes: e.target.value })}
              placeholder="e.g. Assamese Dehn Al Oud, Dark Ambergris, Patchouli"
              className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none"
            />
          </div>
        </div>

        {/* Media & Options */}
        <div className="space-y-4 pt-4 border-t border-[var(--color-terracotta-deep)]/20">
          <h3 className="font-cinzel text-sm font-bold uppercase text-[var(--color-terracotta)] border-b border-[var(--color-terracotta-deep)]/20 pb-2">
            4. Imagery & Flacon Options
          </h3>

          <div>
            <label className="block text-[var(--color-terracotta-deep)] font-semibold mb-1 uppercase tracking-wider">Image URLs (Comma Separated)</label>
            <input
              type="text"
              required
              value={formData.images}
              onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[var(--color-terracotta-deep)] font-semibold mb-1 uppercase tracking-wider">Available Sizes (Comma Separated)</label>
            <input
              type="text"
              value={formData.sizes}
              onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
              className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none"
            />
          </div>

          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="accent-[#B45625] cursor-pointer"
              />
              <span className="text-[var(--color-earth-dark)] font-medium">Featured Spotlight on Homepage</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isBestSeller}
                onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                className="accent-[#B45625] cursor-pointer"
              />
              <span className="text-[var(--color-earth-dark)] font-medium">Iconic Best Seller</span>
            </label>
          </div>
        </div>

        <div className="flex gap-4 pt-6 border-t border-[var(--color-terracotta-deep)]/20">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="w-1/3 py-3 luxury-btn-outline text-xs text-center cursor-pointer font-bold"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-2/3 py-3 luxury-btn-gold text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Formulation...' : t('admin.saveProduct')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
