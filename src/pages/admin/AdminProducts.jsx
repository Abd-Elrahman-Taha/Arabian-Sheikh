import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { perfumeCategoryService } from '../../services/perfumeCategoryService';
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
  Tag,
  RefreshCw,
  Layers
} from 'lucide-react';

export default function AdminProducts() {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const { success, error } = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [perfumeCategories, setPerfumeCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCatalogMetadata() {
      try {
        const [catsData, tiersData] = await Promise.all([
          categoryService.getAdminCategories({ pageSize: 100 }).catch(() => ({ items: [] })),
          perfumeCategoryService.getAdminPerfumeCategories({ pageSize: 100 }).catch(() => ({ items: [] }))
        ]);
        if (catsData?.items && catsData.items.length > 0) {
          setCategories(catsData.items);
        }
        if (tiersData?.items && tiersData.items.length > 0) {
          setPerfumeCategories(tiersData.items);
        }
      } catch (err) {
        console.warn('Failed to load catalog metadata:', err.message);
      }
    }
    loadCatalogMetadata();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const list = await productService.getAllProducts({
        includeDrafts: true,
        search,
        categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        tier: tierFilter !== 'all' ? tierFilter : undefined
      });
      setProducts(list);
    } catch (err) {
      console.error(err);
      error(err.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
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
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="bg-black/60 border border-[#D4AF37]/30 px-3 py-2.5 text-sm text-[#F3E6D0] rounded-lg focus:border-[#D4AF37] focus:outline-none cursor-pointer font-medium"
        >
          <option value="all">All Tiers</option>
          {perfumeCategories.map(tier => (
            <option key={tier.id} value={tier.name}>
              {tier.name} Tier (€{Number(tier.price).toFixed(0)})
            </option>
          ))}
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
              <th className="py-4 px-4">Stock</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4 text-right rtl:text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-sm text-neutral-400">Loading catalog...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-sm text-neutral-400">No products found.</td>
              </tr>
            ) : (
              products.map((p) => {
                const matchedTier = perfumeCategories.find(t => Number(t.id) === Number(p.perfumeCategoryId))
                  || perfumeCategories.find(t => t.name?.toLowerCase() === (p.tier || p.perfumeCategoryName)?.toLowerCase());
                const effectivePrice = (p.price && Number(p.price) > 0)
                  ? Number(p.price)
                  : (matchedTier && matchedTier.price !== undefined ? Number(matchedTier.price) : Number(p.price || 0));
                const effectiveTier = matchedTier?.name || p.tier || p.perfumeCategoryName;

                return (
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
                      {effectiveTier ? (
                        <span className="px-2.5 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 font-cinzel text-xs font-bold">
                          {effectiveTier} Tier
                        </span>
                      ) : (
                        <span className="text-[#D8BE99] uppercase tracking-wider text-xs font-semibold">
                          {p.category}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-mono">
                      {p.originalPrice && p.originalPrice > effectivePrice ? (
                        <div>
                          <div className="text-[#D4AF37] text-sm sm:text-base font-bold">€{effectivePrice}</div>
                          <div className="text-xs text-neutral-500 line-through">€{p.originalPrice}</div>
                        </div>
                      ) : (
                        <span className="text-[#D4AF37] text-sm sm:text-base font-bold">€{effectivePrice}</span>
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
              );
            })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
