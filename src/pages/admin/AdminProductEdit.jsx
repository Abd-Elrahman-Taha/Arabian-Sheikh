import React, { useState, useEffect } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { productService } from '../../services/productService';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Save, Sparkles, Crown } from 'lucide-react';

export default function AdminProductEdit() {
  const { currentPath, navigate } = useRouter();
  const { t } = useTranslation();
  const { success, error } = useToast();

  const isNew = currentPath.endsWith('/new');
  const editId = isNew ? null : currentPath.split('/admin/products/')[1]?.split('/edit')[0];

  const [formData, setFormData] = useState({
    name: '',
    arabicName: '',
    bulgarianName: '',
    tagline: '',
    description: '',
    price: 40,
    originalPrice: '',
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
    async function loadItem() {
      if (isNew || !editId) return;
      try {
        const item = await productService.getProductById(editId);
        if (item) {
          setFormData({
            ...item,
            originalPrice: item.originalPrice || '',
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

      const payload = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        stock: Number(formData.stock),
        topNotes: topArr,
        heartNotes: heartArr,
        baseNotes: baseArr,
        notes: {
          top: topArr,
          heart: heartArr,
          base: baseArr
        },
        images: imagesArr,
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
      error('Failed to save product changes.');
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

        {/* Pricing, Tier, Category */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs pt-4 border-t border-white/5">
          <div className="space-y-1">
            <label className="text-[#D8BE99] uppercase font-cinzel">Price (€ EUR)</label>
            <input
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2 rounded text-[#D4AF37] font-mono font-bold focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[#D8BE99] uppercase font-cinzel">Perfume Tier</label>
            <select
              value={formData.tier}
              onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
              className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2 rounded text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="Luxury">Luxury Tier (€50 Default)</option>
              <option value="Royal">Royal Tier (€40 Default)</option>
              <option value="Classic">Classic Tier (€30 Default)</option>
              <option value="">None / Non-Perfume</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[#D8BE99] uppercase font-cinzel">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-black/60 border border-[#D4AF37]/30 px-3 py-2 rounded text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="perfumes">Perfumes (60ml Flacons)</option>
              <option value="oils">Oils (Attar)</option>
              <option value="bakhoor">Bakhoor & Incense</option>
              <option value="cosmetics">Cosmetics</option>
              <option value="bundles">Exclusive Bundles</option>
            </select>
          </div>

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
