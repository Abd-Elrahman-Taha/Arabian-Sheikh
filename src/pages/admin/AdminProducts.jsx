import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { productService } from '../../services/productService';
import { productApi } from '../../api/product.api';
import { useToast } from '../../context/ToastContext';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Crown,
  Percent,
  Tag,
  RefreshCw,
  Layers
} from 'lucide-react';

export default function AdminProducts() {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const { success, error } = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([
    { id: 1, name: 'Perfumes' },
    { id: 2, name: 'Oils' },
    { id: 3, name: 'Bakhoor' },
    { id: 4, name: 'Cosmetics' },
    { id: 5, name: 'Bundles' }
  ]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const list = await productApi.adminGetCategories().catch(() => null) || await productApi.getCategories().catch(() => null);
        if (Array.isArray(list) && list.length > 0) {
          setCategories(list);
        }
      } catch {}
    }
    loadCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const list = await productService.getAllProducts({
        includeDrafts: true,
        search,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        tier: tierFilter !== 'all' ? tierFilter : undefined
      });
      setProducts(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    const handleCloudUpdate = () => {
      fetchProducts();
    };
    window.addEventListener('arabian_sheikh_cloud_updated', handleCloudUpdate);
    return () => window.removeEventListener('arabian_sheikh_cloud_updated', handleCloudUpdate);
  }, [search, categoryFilter, tierFilter]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you certain you wish to retire '${name}' from the Catalogue?`)) {
      return;
    }
    try {
      setProducts(prev => prev.filter(p => p.id !== id && p.numericId !== id));
      await productService.deleteProduct(id);
      success(`'${name}' has been removed.`);
    } catch (err) {
      error(err.message || 'Could not delete item.');
      fetchProducts();
    }
  };

  const handleToggleDiscount = async (product, isEnabling, percent = 20) => {
    try {
      const pct = Number(percent) || 20;
      setProducts(prev => prev.map(p => {
        if (p.id === product.id) {
          const basePrice = p.originalPrice || p.price;
          return {
            ...p,
            hasDiscount: isEnabling,
            isOffer: isEnabling,
            discountPercent: isEnabling ? pct : 0,
            originalPrice: isEnabling ? basePrice : null,
            price: isEnabling ? Math.round(basePrice * (1 - pct / 100)) : (p.originalPrice || p.price)
          };
        }
        return p;
      }));

      if (isEnabling) {
        await productService.applyProductDiscount(product.id, pct);
        success(`Discount of ${pct}% applied to '${product.name}'.`);
      } else {
        await productService.removeProductDiscount(product.id);
        success(`Discount removed from '${product.name}'.`);
      }
    } catch (err) {
      error(err.message || 'Failed to update discount');
      fetchProducts();
    }
  };

  const handleUpdateDiscountPercent = async (product, newPercent) => {
    try {
      const pct = Number(newPercent) || 10;
      setProducts(prev => prev.map(p => {
        if (p.id === product.id) {
          const basePrice = p.originalPrice || p.price;
          return {
            ...p,
            hasDiscount: true,
            isOffer: true,
            discountPercent: pct,
            originalPrice: basePrice,
            price: Math.round(basePrice * (1 - pct / 100))
          };
        }
        return p;
      }));
      await productService.applyProductDiscount(product.id, pct);
      success(`Discount updated to ${pct}% for '${product.name}'.`);
    } catch (err) {
      error(err.message || 'Failed to update discount');
      fetchProducts();
    }
  };

  return (
    <div className="space-y-6 text-[#F3E6D0]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D4AF37]/20 pb-5 gap-4">
        <div>
          <h1 className="font-cinzel text-2xl sm:text-4xl font-bold uppercase tracking-wider text-[#F3E6D0]">
            Product Catalog Management
          </h1>
          <p className="text-xs sm:text-sm text-[#D8BE99] mt-1">
            Manage all 60ml perfume tiers, pure oils, incense bakhoor, and cosmetic lines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="px-4 py-3 bg-[#1A1813] hover:bg-[#2A241A] text-[#F2D675] border border-[#D4AF37]/50 font-cinzel font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-md shrink-0 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/admin/products/new"
            className="px-6 py-3 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2 shadow-md shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#0B0A08] p-4 border border-[#D4AF37]/20 rounded-xl shadow-lg">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#D8BE99]" />
          <input
            type="text"
            placeholder="Search flacons by name, note, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/60 border border-[#D4AF37]/30 pl-9 pr-4 py-2.5 text-sm text-[#F3E6D0] rounded-lg focus:border-[#D4AF37] focus:outline-none placeholder:text-neutral-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-black/60 border border-[#D4AF37]/30 px-3 py-2.5 text-sm text-[#F3E6D0] rounded-lg focus:border-[#D4AF37] focus:outline-none cursor-pointer font-medium"
        >
          <option value="all">All Categories</option>
          {categories.map(c => {
            const catKey = (c.slug || c.name || `category-${c.id}`).toLowerCase().trim();
            return (
              <option key={c.id} value={catKey}>
                {c.name || `Category #${c.id}`}
              </option>
            );
          })}
        </select>

        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="bg-black/60 border border-[#D4AF37]/30 px-3 py-2.5 text-sm text-[#F3E6D0] rounded-lg focus:border-[#D4AF37] focus:outline-none cursor-pointer font-medium"
        >
          <option value="all">All Tiers</option>
          <option value="Luxury">Luxury Tier (€50)</option>
          <option value="Royal">Royal Tier (€40)</option>
          <option value="Classic">Classic Tier (€30)</option>
        </select>
      </div>

      {/* Product List Table */}
      <div className="bg-[#0B0A08] border border-[#D4AF37]/20 shadow-2xl overflow-x-auto rounded-xl">
        <table className="w-full text-left rtl:text-right border-collapse text-sm">
          <thead>
            <tr className="bg-[#0B0A08] border-b border-[#D4AF37]/20 font-cinzel text-xs sm:text-sm uppercase tracking-wider text-[#D8BE99]">
              <th className="py-4 px-4">Flacon</th>
              <th className="py-4 px-4">Product Name</th>
              <th className="py-4 px-4">Tier / Category</th>
              <th className="py-4 px-4">Price</th>
              <th className="py-4 px-4">Discount Offer</th>
              <th className="py-4 px-4">Stock</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4 text-right rtl:text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan="8" className="p-8 text-center text-sm text-neutral-400">Loading catalog...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-8 text-center text-sm text-neutral-400">No products found.</td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4">
                    <img
                      src={p.imageUrl || p.image || p.cutoutImage || p.images?.[0] || '/products/luxury_designs/07_arabian_gold.webp'}
                      alt={p.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/products/luxury_designs/07_arabian_gold.webp';
                      }}
                      className="w-12 h-16 object-contain bg-black/50 p-1 border border-white/10 rounded-lg"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-cinzel font-bold text-[#F3E6D0] text-sm sm:text-base">{p.name}</div>
                    {p.arabicName && <div className="font-arabic text-[#D4AF37] text-xs sm:text-sm mt-0.5">{p.arabicName}</div>}
                    <div className="text-xs text-[#D8BE99] mt-0.5">{p.size || '60 ml'}</div>
                  </td>
                  <td className="py-4 px-4">
                    {p.tier ? (
                      <span className="px-2.5 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 font-cinzel text-xs font-bold">
                        {p.tier} Tier
                      </span>
                    ) : (
                      <span className="text-[#D8BE99] uppercase tracking-wider text-xs font-semibold">
                        {p.category}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 font-mono">
                    {p.originalPrice && p.originalPrice > p.price ? (
                      <div>
                        <div className="text-[#D4AF37] text-sm sm:text-base font-bold">€{p.price}</div>
                        <div className="text-xs text-neutral-500 line-through">€{p.originalPrice}</div>
                      </div>
                    ) : (
                      <span className="text-[#D4AF37] text-sm sm:text-base font-bold">€{p.price}</span>
                    )}
                  </td>
                  {/* Discount Controls Column */}
                  <td className="py-4 px-4">
                    {p.hasDiscount || (p.discountPercent > 0) || (p.originalPrice && p.originalPrice > p.price) ? (
                      <div className="flex flex-col gap-1.5 min-w-[160px]">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-red-900/90 border border-red-500 text-white font-bold font-mono text-xs flex items-center gap-1 shadow-sm">
                            <Percent className="w-3 h-3" />
                            <span>{p.discountPercent || Math.round((1 - p.price / p.originalPrice) * 100)}% OFF</span>
                          </span>
                          <button
                            onClick={() => handleToggleDiscount(p, false)}
                            className="text-xs text-red-400 hover:text-red-300 underline font-medium cursor-pointer"
                            title="Remove Discount"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-[#D8BE99]">Rate:</span>
                          <select
                            value={p.discountPercent || 20}
                            onChange={(e) => handleUpdateDiscountPercent(p, e.target.value)}
                            className="bg-black/90 border border-[#D4AF37]/50 text-[#F2D675] text-xs rounded px-2 py-1 focus:outline-none cursor-pointer font-medium"
                          >
                            <option value="10">10%</option>
                            <option value="15">15%</option>
                            <option value="20">20%</option>
                            <option value="25">25%</option>
                            <option value="30">30%</option>
                            <option value="40">40%</option>
                            <option value="50">50%</option>
                            <option value="70">70%</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleToggleDiscount(p, true, 20)}
                        className="px-3 py-1.5 bg-[#D4AF37]/15 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black border border-[#D4AF37]/40 hover:border-[#D4AF37] rounded-lg text-xs font-cinzel font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <Percent className="w-3.5 h-3.5" />
                        <span>Add Discount</span>
                      </button>
                    )}
                  </td>
                  <td className="py-4 px-4 font-mono text-sm sm:text-base">
                    <span className={p.stock > 10 ? 'text-emerald-400 font-semibold' : p.stock > 0 ? 'text-amber-400 font-semibold' : 'text-red-400 font-semibold'}>
                      {p.stock} units
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                      {p.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right rtl:text-left space-x-2 rtl:space-x-reverse">
                    <Link
                      to={`/admin/products/${p.id}/edit`}
                      className="p-2 inline-block bg-white/5 hover:bg-[#D4AF37] hover:text-black rounded-lg text-[#D4AF37] transition-colors shadow-sm"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="p-2 bg-white/5 hover:bg-red-600 hover:text-white rounded-lg text-[#D8BE99] transition-colors cursor-pointer shadow-sm"
                      title="Retire Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
