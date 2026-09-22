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
  Layers,
  Eye,
  X,
  Scale,
  Globe,
  Building2,
  CheckCircle2,
  AlertCircle
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

  // Product Details Modal State (GET /api/admin/products/{id})
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

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

  const handleViewDetails = async (id) => {
    setSelectedProductId(id);
    setSelectedProductDetails(null);
    setDetailsLoading(true);
    try {
      const details = await productApi.adminGetProductById(id);
      setSelectedProductDetails(details);
    } catch (err) {
      console.warn('Failed to load product details from server:', err);
      const fallback = products.find(p => p.id === id || p.numericId === id);
      if (fallback) {
        setSelectedProductDetails(fallback);
      } else {
        error('Failed to load product details.');
      }
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleToggleStatus = async (product) => {
    const currentActive = product.isActive !== false && product.status !== 'INACTIVE';
    const newActive = !currentActive;
    try {
      setProducts(prev => prev.map(p => (p.id === product.id || p.numericId === product.id) ? { ...p, isActive: newActive, status: newActive ? 'ACTIVE' : 'INACTIVE' } : p));
      await productService.toggleProductActive(product.id, newActive);
      success(`'${product.name}' is now ${newActive ? 'ACTIVE' : 'INACTIVE'}.`);
    } catch (err) {
      error(err.message || 'Failed to toggle product status.');
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
                const effectiveTier = matchedTier?.name 
                  || p.perfumeCategoryName 
                  || p.tier 
                  || (Number(p.categoryId) === 1 || p.categoryName === 'Perfumes' || p.category === 'perfumes' ? (effectivePrice >= 250 ? 'Luxury' : effectivePrice >= 130 ? 'Premium' : 'Standard') : null);

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
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(p)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        p.isActive !== false && p.status !== 'INACTIVE'
                          ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/80'
                          : 'bg-rose-950/80 border-rose-500/40 text-rose-300 hover:bg-rose-900/80'
                      }`}
                      title="Click to toggle publication status (Active/Inactive)"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${p.isActive !== false && p.status !== 'INACTIVE' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      <span>{p.isActive !== false && p.status !== 'INACTIVE' ? 'ACTIVE' : 'INACTIVE'}</span>
                    </button>
                  </td>
                  <td className="py-4 px-4 text-right rtl:text-left space-x-2 rtl:space-x-reverse whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(p.id)}
                      className="p-2 inline-block bg-white/5 hover:bg-[#D4AF37] hover:text-black rounded-lg text-[#F2D675] transition-colors shadow-sm cursor-pointer"
                      title="View Product Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
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

      {/* Product Details Modal (GET /api/admin/products/{id}) */}
      {selectedProductId !== null && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[#0B0A08] border border-[#D4AF37]/40 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/20 bg-gradient-to-r from-black via-[#140D08] to-black">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-xl text-[#F2D675]">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cinzel text-lg font-bold text-[#F3E6D0] uppercase tracking-wider">
                    {detailsLoading ? `Loading Flacon #${selectedProductId}...` : (selectedProductDetails?.name || `Product #${selectedProductId}`)}
                  </h3>
                  <p className="text-xs text-[#D8BE99] font-mono">
                    Product Identifier: #{selectedProductId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProductId(null)}
                className="p-2 rounded-xl text-[#D8BE99] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
              {detailsLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#D4AF37]">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                  <span className="font-cinzel text-xs uppercase tracking-widest text-[#D8BE99]">
                    Fetching Live Product Details...
                  </span>
                </div>
              ) : selectedProductDetails ? (
                <div className="space-y-6">
                  {/* Top Overview: Image + Core Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 bg-black/40 border border-[#D4AF37]/20 p-4 rounded-xl">
                    {/* Flacon Image */}
                    <div className="sm:col-span-4 flex flex-col items-center justify-center bg-black/60 border border-white/5 rounded-xl p-3">
                      <img
                        src={selectedProductDetails.imageUrl || selectedProductDetails.image || '/products/luxury_designs/07_arabian_gold.webp'}
                        alt={selectedProductDetails.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/products/luxury_designs/07_arabian_gold.webp';
                        }}
                        className="w-32 h-44 object-contain"
                      />
                      <span className="mt-2 text-[10px] uppercase font-mono text-[#D8BE99]">
                        {selectedProductDetails.size || '60 ml'} Flacon
                      </span>
                    </div>

                    {/* Core Attributes */}
                    <div className="sm:col-span-8 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          selectedProductDetails.isActive !== false && selectedProductDetails.status !== 'INACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        }`}>
                          {selectedProductDetails.isActive !== false && selectedProductDetails.status !== 'INACTIVE' ? 'Active / Live' : 'Inactive / Draft'}
                        </span>
                        {selectedProductDetails.tier && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#D4AF37]/20 text-[#F2D675] border border-[#D4AF37]/40 font-cinzel">
                            {selectedProductDetails.tier} Tier
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 text-[#D8BE99] border border-white/10">
                          {selectedProductDetails.category || 'Perfumes'}
                        </span>
                      </div>

                      <h4 className="font-cinzel text-xl font-bold text-[#F3E6D0]">
                        {selectedProductDetails.name}
                      </h4>
                      {selectedProductDetails.arabicName && (
                        <p className="font-arabic text-[#D4AF37] text-base">
                          {selectedProductDetails.arabicName}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                        <div>
                          <span className="text-[#A69076] uppercase tracking-wider font-semibold block text-[10px]">Brand / Maison</span>
                          <span className="text-[#F3E6D0] font-medium">{selectedProductDetails.brand || selectedProductDetails.brandName || 'Arabian Sheikh'}</span>
                        </div>
                        <div>
                          <span className="text-[#A69076] uppercase tracking-wider font-semibold block text-[10px]">Subcategory</span>
                          <span className="text-[#F3E6D0] font-medium">{selectedProductDetails.subcategory || selectedProductDetails.subcategoryName || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[#A69076] uppercase tracking-wider font-semibold block text-[10px]">Selling Price</span>
                          <span className="text-[#F2D675] font-mono font-bold text-base">€{Number(selectedProductDetails.price || 0).toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-[#A69076] uppercase tracking-wider font-semibold block text-[10px]">Stock Reserve</span>
                          <span className="text-[#F3E6D0] font-mono font-bold">{selectedProductDetails.stock || 0} units</span>
                        </div>
                        <div>
                          <span className="text-[#A69076] uppercase tracking-wider font-semibold block text-[10px]">Shipping Weight</span>
                          <span className="text-[#F3E6D0] font-mono">{selectedProductDetails.shippingWeight ? `${selectedProductDetails.shippingWeight} kg` : '0.450 kg'}</span>
                        </div>
                        <div>
                          <span className="text-[#A69076] uppercase tracking-wider font-semibold block text-[10px]">Gender Alignment</span>
                          <span className="text-[#F3E6D0]">{selectedProductDetails.gender || 'Unisex'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description & Notes */}
                  {selectedProductDetails.description && (
                    <div className="bg-black/30 border border-[#D4AF37]/20 p-4 rounded-xl space-y-1.5">
                      <span className="text-[11px] font-cinzel uppercase tracking-wider text-[#F2D675] font-bold">
                        Description
                      </span>
                      <p className="text-xs text-[#D8BE99] leading-relaxed">
                        {selectedProductDetails.description}
                      </p>
                    </div>
                  )}

                  {/* Ingredients / Composition */}
                  {selectedProductDetails.ingredients && (
                    <div className="bg-black/30 border border-[#D4AF37]/20 p-4 rounded-xl space-y-1.5">
                      <span className="text-[11px] font-cinzel uppercase tracking-wider text-[#F2D675] font-bold">
                        Olfactory Composition / Ingredients
                      </span>
                      <p className="text-xs text-[#D8BE99] leading-relaxed">
                        {selectedProductDetails.ingredients}
                      </p>
                    </div>
                  )}

                  {/* Multilingual Translations */}
                  {Array.isArray(selectedProductDetails.translations) && selectedProductDetails.translations.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-cinzel uppercase tracking-wider text-[#F2D675] font-bold block">
                        Multilingual Translations ({selectedProductDetails.translations.length} registered)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {selectedProductDetails.translations.map((t, idx) => (
                          <div key={idx} className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1">
                            <span className="text-[10px] font-mono uppercase font-bold text-[#D4AF37]">
                              Language: {t.languageCode || t.language || 'Default'}
                            </span>
                            <p className="text-xs font-semibold text-[#F3E6D0] truncate">{t.name || '—'}</p>
                            {t.description && <p className="text-[11px] text-[#A69076] line-clamp-2">{t.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-[#A69076]">
                  No product data found.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-[#D4AF37]/20 bg-black/60">
              <button
                onClick={() => setSelectedProductId(null)}
                className="px-4 py-2 rounded-xl border border-white/15 text-xs text-[#D8BE99] hover:text-white hover:bg-white/5 cursor-pointer font-semibold transition-colors"
              >
                Close
              </button>
              {selectedProductId && (
                <Link
                  to={`/admin/products/${selectedProductId}/edit`}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F2D675] text-black font-cinzel font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Flacon</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
