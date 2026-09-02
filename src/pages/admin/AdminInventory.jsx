import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { productService } from '../../services/productService';
import { useToast } from '../../context/ToastContext';
import {
  Check,
  RefreshCw,
  Search,
  Warehouse,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  Loader2
} from 'lucide-react';

export default function AdminInventory() {
  const { t } = useTranslation();
  const { success, error } = useToast();

  const [products, setProducts] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, INACTIVE
  const [familyFilter, setFamilyFilter] = useState('ALL');

  const fetchInventory = async () => {
    setLoadingInventory(true);
    try {
      const list = await productService.getAllProducts({ includeDrafts: true });
      setProducts(list);
    } catch (err) {
      const list = productService.getAllProductsSync({ includeDrafts: true });
      setProducts(list);
    } finally {
      setLoadingInventory(false);
    }
  };

  useEffect(() => {
    fetchInventory();

    const handleCloudUpdate = () => {
      fetchInventory();
    };
    window.addEventListener('arabian_sheikh_cloud_updated', handleCloudUpdate);
    return () => window.removeEventListener('arabian_sheikh_cloud_updated', handleCloudUpdate);
  }, []);

  // Toggle active/inactive status and connect directly with the API
  const handleToggleActive = async (product) => {
    const currentActive = product.isActive !== false && product.status !== 'INACTIVE';
    const newActive = !currentActive;
    setUpdatingId(product.id);

    try {
      await productService.toggleProductActive(product.id, newActive);
      
      // Optimistic local update for instant feedback
      setProducts(prev => prev.map(p => {
        if (p.id === product.id) {
          return {
            ...p,
            isActive: newActive,
            status: newActive ? 'ACTIVE' : 'INACTIVE'
          };
        }
        return p;
      }));

      if (newActive) {
        success(`'${product.name}' is now ACTIVE and available in store.`);
      } else {
        success(`'${product.name}' is now INACTIVE and hidden from store.`);
      }
    } catch (err) {
      error(err.message || 'Failed to update product status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Extract unique families for filter dropdown
  const fragranceFamilies = Array.from(
    new Set(products.map(p => p.fragranceFamily || p.scentFamily).filter(Boolean))
  );

  // Compute Warehouse KPIs based purely on Active / Inactive
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive !== false && p.status !== 'INACTIVE').length;
  const inactiveProducts = totalProducts - activeProducts;

  // Filter products for display
  const filteredProducts = products.filter(p => {
    const isActive = p.isActive !== false && p.status !== 'INACTIVE';
    
    // Search match
    if (search) {
      const q = search.toLowerCase().trim();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchArabic = p.arabicName?.includes(q);
      const matchSku = `ARB-${String(p.id).slice(-6)}`.toLowerCase().includes(q);
      const matchFamily = (p.fragranceFamily || p.scentFamily || '').toLowerCase().includes(q);
      const matchCategory = (p.category || '').toLowerCase().includes(q);
      if (!matchName && !matchArabic && !matchSku && !matchFamily && !matchCategory) return false;
    }

    // Status filter
    if (statusFilter === 'ACTIVE' && !isActive) return false;
    if (statusFilter === 'INACTIVE' && isActive) return false;

    // Family filter
    if (familyFilter !== 'ALL' && (p.fragranceFamily || p.scentFamily) !== familyFilter) return false;

    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in text-[#F3E6D0]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D4AF37]/20 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F2D675] font-mono text-[10px] uppercase font-bold tracking-widest">
              Palace Vault Catalog
            </span>
          </div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0] mt-1">
            {t('admin.inventory') || 'Warehouse & Product Availability'}
          </h1>
          <p className="text-xs text-[#D8BE99] font-medium mt-0.5">
            Manage active store status for all creations • Instantly synchronize availability with the live API
          </p>
        </div>

        <button
          onClick={fetchInventory}
          disabled={loadingInventory}
          className="group/btn relative px-5 py-2.5 rounded-full bg-black/60 hover:bg-[#21130D] border border-[#D4AF37]/40 text-xs font-cinzel font-bold text-[#F3E6D0] hover:text-[#F2D675] flex items-center gap-2 transition-all duration-300 shadow-md cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${loadingInventory ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Warehouse Status KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Catalog Items */}
        <div className="p-5 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 shadow-2xl backdrop-blur-md space-y-2 hover:border-[#D4AF37] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-cinzel text-[#F2D675] font-bold">
              Total Formulations
            </span>
            <div className="w-8 h-8 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center text-[#F2D675]">
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <p className="font-cinzel text-3xl font-bold text-[#F3E6D0]">{totalProducts}</p>
          <p className="text-[10px] text-[#D8BE99] font-mono font-bold flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#D4AF37]" />
            <span>Across all Palace categories</span>
          </p>
        </div>

        {/* Active in Store */}
        <div className="p-5 rounded-2xl bg-[#0B0A08]/90 border border-emerald-500/30 shadow-2xl backdrop-blur-md space-y-2 hover:border-emerald-500/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-cinzel text-emerald-400 font-bold">
              Active in Store
            </span>
            <div className="w-8 h-8 rounded-full border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-cinzel text-3xl font-bold text-emerald-400">{activeProducts}</p>
          <p className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Visible to customers for purchase</span>
          </p>
        </div>

        {/* Inactive / Hidden */}
        <div className="p-5 rounded-2xl bg-[#0B0A08]/90 border border-amber-500/30 shadow-2xl backdrop-blur-md space-y-2 hover:border-amber-500/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-cinzel text-amber-400 font-bold">
              Inactive / Hidden
            </span>
            <div className="w-8 h-8 rounded-full border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-amber-400">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="font-cinzel text-3xl font-bold text-amber-400">{inactiveProducts}</p>
          <p className="text-[10px] text-amber-400 font-mono font-bold flex items-center gap-1">
            <span>Hidden from storefront catalog</span>
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search flacon name, SKU, Arabic title..."
            className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[#D8BE99] font-cinzel font-bold hidden sm:inline">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-black/60 border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer font-medium"
            >
              <option value="ALL">All Statuses ({totalProducts})</option>
              <option value="ACTIVE">Active Only ({activeProducts})</option>
              <option value="INACTIVE">Inactive Only ({inactiveProducts})</option>
            </select>
          </div>

          {/* Fragrance Family Filter */}
          {fragranceFamilies.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-[#D8BE99] font-cinzel font-bold hidden sm:inline">
                Family:
              </span>
              <select
                value={familyFilter}
                onChange={(e) => setFamilyFilter(e.target.value)}
                className="bg-black/60 border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer font-medium"
              >
                <option value="ALL">All Families</option>
                {fragranceFamilies.map(fam => (
                  <option key={fam} value={fam}>{fam}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Warehouse Products Table */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#D4AF37]/25 text-[#F2D675] uppercase font-cinzel font-bold">
                <th className="py-4 px-4 sm:px-6">Flacon Creation</th>
                <th className="py-4 px-4">Catalog SKU</th>
                <th className="py-4 px-4">Category / Tier</th>
                <th className="py-4 px-4">Price</th>
                <th className="py-4 px-4 text-center">Store Availability</th>
                <th className="py-4 px-4 sm:px-6 text-right">Toggle Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/15 text-[#F3E6D0]">
              {loadingInventory ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4 sm:px-6"><div className="h-4 bg-white/10 rounded w-44" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-white/10 rounded w-24" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-white/10 rounded w-24" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-white/10 rounded w-16" /></td>
                    <td className="py-4 px-4"><div className="h-6 bg-white/10 rounded-full w-24 mx-auto" /></td>
                    <td className="py-4 px-4 sm:px-6"><div className="h-8 bg-white/10 rounded-full w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#D8BE99] font-medium">
                    No creations match the selected warehouse filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isActive = p.isActive !== false && p.status !== 'INACTIVE';
                  const isUpdating = updatingId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      {/* Image and Name */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-12 h-14 rounded-xl border border-[#D4AF37]/40 overflow-hidden bg-black/60 shrink-0 shadow-md">
                            <img
                              src={p.imageUrl || p.image || p.cutoutImage || p.images?.[0] || '/products/luxury_designs/07_arabian_gold.webp'}
                              alt={p.name}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/products/luxury_designs/07_arabian_gold.webp';
                              }}
                              className="w-full h-full object-cover"
                            />
                            {p.tier && (
                              <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-mono text-[#F2D675] text-center uppercase tracking-tighter py-0.5">
                                {p.tier}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-cinzel font-bold text-sm text-[#F3E6D0] block">
                              {p.name}
                            </span>
                            <span className="font-arabic text-xs text-[#D8BE99] block">
                              {p.arabicName}
                            </span>
                            <span className="text-[10px] text-[#F2D675] font-mono font-medium">
                              {p.fragranceFamily || p.scentFamily || 'Palace Reserve'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU / Code */}
                      <td className="py-4 px-4">
                        <span className="font-mono text-xs text-[#F2D675] font-bold block">
                          ARB-VAULT-{String(p.id).slice(-5).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-[#D8BE99] font-mono">
                          Ref #{p.slug || String(p.id)}
                        </span>
                      </td>

                      {/* Category & Tier */}
                      <td className="py-4 px-4">
                        <span className="font-cinzel text-xs text-[#F3E6D0] font-bold uppercase tracking-wider block">
                          {p.tier ? `${p.tier} Flacon` : (p.category || 'Perfumes')}
                        </span>
                        <span className="text-[10px] text-[#D8BE99] font-mono">
                          {p.gender || 'Unisex'} • {p.volume || '60ml'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4">
                        <span className="font-cinzel text-xs font-bold text-[#F3E6D0]">
                          €{p.price}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 text-center">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold tracking-wide shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>ACTIVE</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold tracking-wide shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            <span>INACTIVE</span>
                          </span>
                        )}
                      </td>

                      {/* Action Toggle Button */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <button
                          onClick={() => handleToggleActive(p)}
                          disabled={isUpdating}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-cinzel uppercase font-bold tracking-wider transition-all duration-300 shadow-md cursor-pointer border ${
                            isActive
                              ? 'bg-emerald-900/30 hover:bg-rose-950/60 border-emerald-500/40 hover:border-rose-500/50 text-emerald-300 hover:text-rose-300'
                              : 'bg-amber-900/30 hover:bg-emerald-950/60 border-amber-500/40 hover:border-emerald-500/50 text-amber-300 hover:text-emerald-300'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          title={isActive ? 'Click to make Inactive (hide from store)' : 'Click to make Active (display in store)'}
                        >
                          {isUpdating ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                              <span>Updating...</span>
                            </>
                          ) : isActive ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                              <span>Inactive</span>
                            </>
                          )}
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
    </div>
  );
}
