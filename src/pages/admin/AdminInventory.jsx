import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { productService } from '../../services/productService';
import { useToast } from '../../context/ToastContext';
import {
  Plus,
  Minus,
  AlertTriangle,
  Save,
  RefreshCw,
  Search,
  Warehouse,
  PackageCheck,
  AlertCircle,
  Coins,
  Sparkles,
  Check
} from 'lucide-react';

export default function AdminInventory() {
  const { t } = useTranslation();
  const { success, error } = useToast();

  // Instant 0ms synchronous initialization
  const initialProducts = productService.getAllProductsSync({ includeDrafts: true });
  const [products, setProducts] = useState(initialProducts);
  
  const getInitialStockMap = (list) => {
    const map = {};
    list.forEach(p => {
      map[p.id] = p.stock ?? 0;
    });
    return map;
  };

  const [stockMap, setStockMap] = useState(() => getInitialStockMap(initialProducts));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, LOW, OUT, OPTIMAL
  const [familyFilter, setFamilyFilter] = useState('ALL');
  const [savedSuccessId, setSavedSuccessId] = useState(null);

  const fetchInventory = () => {
    const list = productService.getAllProductsSync({ includeDrafts: true });
    setProducts(list);
    setStockMap(getInitialStockMap(list));
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockChange = (productId, delta) => {
    setStockMap(prev => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + delta)
    }));
  };

  const handleQuickAdd = (productId, amount) => {
    setStockMap(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + amount
    }));
  };

  const handleSaveStock = async (productId, name) => {
    const newStock = stockMap[productId];
    try {
      await productService.updateStock(productId, newStock);
      setSavedSuccessId(productId);
      setTimeout(() => setSavedSuccessId(null), 2000);
      success(`Vault inventory for '${name}' updated to ${newStock} flacons.`);
      fetchInventory();
    } catch (err) {
      error(err.message || 'Could not update stock.');
    }
  };

  // Extract unique families for filter dropdown
  const fragranceFamilies = Array.from(
    new Set(products.map(p => p.fragranceFamily).filter(Boolean))
  );

  // Compute Warehouse KPIs
  const totalFlacons = products.reduce((acc, p) => acc + (stockMap[p.id] ?? p.stock ?? 0), 0);
  const totalValuation = products.reduce((acc, p) => acc + ((stockMap[p.id] ?? p.stock ?? 0) * (p.price || 0)), 0);
  const lowStockItems = products.filter(p => {
    const s = stockMap[p.id] ?? p.stock ?? 0;
    return s > 0 && s <= 10;
  });
  const outOfStockItems = products.filter(p => (stockMap[p.id] ?? p.stock ?? 0) === 0);

  // Filter products for display
  const filteredProducts = products.filter(p => {
    const curStock = stockMap[p.id] ?? p.stock ?? 0;
    
    // Search match
    if (search) {
      const q = search.toLowerCase().trim();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchArabic = p.arabicName?.includes(q);
      const matchSku = `ARB-${p.id.slice(-6)}`.toLowerCase().includes(q);
      const matchFamily = p.fragranceFamily?.toLowerCase().includes(q);
      if (!matchName && !matchArabic && !matchSku && !matchFamily) return false;
    }

    // Status filter
    if (statusFilter === 'LOW' && (curStock === 0 || curStock > 10)) return false;
    if (statusFilter === 'OUT' && curStock > 0) return false;
    if (statusFilter === 'OPTIMAL' && curStock <= 10) return false;

    // Family filter
    if (familyFilter !== 'ALL' && p.fragranceFamily !== familyFilter) return false;

    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in text-[#F3E6D0]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D4AF37]/20 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F2D675] font-mono text-[10px] uppercase font-bold tracking-widest">
              Palace Vault Reserves
            </span>
          </div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0] mt-1">
            {t('admin.inventory')}
          </h1>
          <p className="text-xs text-[#D8BE99] font-medium mt-0.5">
            Central Royal Warehouse • Flacon Batches, Reserve Audits & Instant Stock Allocations
          </p>
        </div>

        <button
          onClick={fetchInventory}
          className="group/btn relative px-5 py-2.5 rounded-full bg-black/60 hover:bg-[#21130D] border border-[#D4AF37]/40 text-xs font-cinzel font-bold text-[#F3E6D0] hover:text-[#F2D675] flex items-center gap-2 transition-all duration-300 shadow-md cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500 text-[#D4AF37]" />
          <span>Synchronize Vault</span>
        </button>
      </div>

      {/* Warehouse Live KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Flacons */}
        <div className="p-5 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 shadow-2xl backdrop-blur-md space-y-2 hover:border-[#D4AF37] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-cinzel text-[#F2D675] font-bold">
              Total Flacons in Vault
            </span>
            <div className="w-8 h-8 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center text-[#F2D675]">
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <p className="font-cinzel text-3xl font-bold text-[#F3E6D0]">{totalFlacons.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
            <PackageCheck className="w-3 h-3" />
            <span>Active across {products.length} formulations</span>
          </p>
        </div>

        {/* Vault Valuation */}
        <div className="p-5 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 shadow-2xl backdrop-blur-md space-y-2 hover:border-[#D4AF37] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-cinzel text-[#F2D675] font-bold">
              Inventory Valuation
            </span>
            <div className="w-8 h-8 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center text-[#F2D675]">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="font-cinzel text-3xl font-bold text-[#F3E6D0]">
            €{totalValuation.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] text-[#F2D675] font-mono font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Retail Vault Liquidity</span>
          </p>
        </div>

        {/* Low Stock Reserves */}
        <div className="p-5 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 shadow-2xl backdrop-blur-md space-y-2 hover:border-[#D4AF37] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-cinzel text-[#F2D675] font-bold">
              Low Reserve Alerts
            </span>
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${
              lowStockItems.length > 0
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                : 'border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#F2D675]'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="font-cinzel text-3xl font-bold text-[#F3E6D0]">{lowStockItems.length}</p>
          <p className={`text-[10px] font-mono font-bold ${lowStockItems.length > 0 ? 'text-amber-400' : 'text-[#D8BE99]'}`}>
            {lowStockItems.length > 0 ? '≤ 10 flacons remaining' : 'No critical thresholds'}
          </p>
        </div>

        {/* Depleted Items */}
        <div className="p-5 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 shadow-2xl backdrop-blur-md space-y-2 hover:border-[#D4AF37] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-cinzel text-[#F2D675] font-bold">
              Depleted Batches
            </span>
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${
              outOfStockItems.length > 0
                ? 'border-rose-500/50 bg-rose-500/10 text-rose-400'
                : 'border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#F2D675]'
            }`}>
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="font-cinzel text-3xl font-bold text-[#F3E6D0]">{outOfStockItems.length}</p>
          <p className={`text-[10px] font-mono font-bold ${outOfStockItems.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {outOfStockItems.length > 0 ? 'Urgent distillation required' : 'All formulations in stock'}
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
            placeholder="Search flacon, SKU, Arabic title..."
            className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[#D8BE99] font-cinzel font-bold hidden sm:inline">
              Reserve:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-black/60 border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer font-medium"
            >
              <option value="ALL">All Reserves ({products.length})</option>
              <option value="LOW">Low Stock Only (≤10)</option>
              <option value="OUT">Depleted (0)</option>
              <option value="OPTIMAL">Optimal Reserves (&gt;10)</option>
            </select>
          </div>

          {/* Fragrance Family Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[#D8BE99] font-cinzel font-bold hidden sm:inline">
              Family:
            </span>
            <select
              value={familyFilter}
              onChange={(e) => setFamilyFilter(e.target.value)}
              className="bg-black/60 border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer font-medium"
            >
              <option value="ALL">All Olfactory Families</option>
              {fragranceFamilies.map(fam => (
                <option key={fam} value={fam}>{fam}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table in Obsidian Glass */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#D4AF37]/25 text-[#F2D675] uppercase font-cinzel font-bold">
                <th className="py-4 px-4 sm:px-6">Flacon Formulation</th>
                <th className="py-4 px-4">Vault SKU</th>
                <th className="py-4 px-4">Reserve Health</th>
                <th className="py-4 px-4">Price / Valuation</th>
                <th className="py-4 px-4 text-center">Adjust Stock Quantity</th>
                <th className="py-4 px-4 sm:px-6 text-right">Commit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/15 text-[#F3E6D0]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#D8BE99] font-medium">
                    No flacon formulations match the selected vault filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const currentVal = stockMap[p.id] ?? p.stock ?? 0;
                  const isLow = currentVal > 0 && currentVal <= 10;
                  const isOut = currentVal === 0;
                  const isSaved = savedSuccessId === p.id;
                  const itemValuation = currentVal * (p.price || 0);
                  const maxCap = 100;
                  const percentage = Math.min(100, Math.round((currentVal / maxCap) * 100));

                  return (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      {/* Product Image and Details */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-12 h-14 rounded-xl border border-[#D4AF37]/40 overflow-hidden bg-black/60 shrink-0 shadow-md">
                            <img
                              src={p.images?.[0]}
                              alt={p.name}
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
                              {p.fragranceFamily} • {p.volume || '60ml'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU / Code */}
                      <td className="py-4 px-4">
                        <span className="font-mono text-xs text-[#F2D675] font-bold block">
                          ARB-VAULT-{p.id.slice(-5).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-[#D8BE99] font-mono">
                          Batch #{new Date().getFullYear()}-0{p.id.charCodeAt(0) % 9 + 1}
                        </span>
                      </td>

                      {/* Stock Status & Visual Health Bar */}
                      <td className="py-4 px-4 min-w-[170px]">
                        <div className="space-y-1.5">
                          <div>
                            {isOut ? (
                              <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/40 font-bold inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                                <span>Depleted (0)</span>
                              </span>
                            ) : isLow ? (
                              <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                <span>Low Reserve ({currentVal})</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span>Optimal ({currentVal})</span>
                              </span>
                            )}
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-black/60 rounded-full h-1.5 overflow-hidden border border-white/5">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isOut ? 'w-0' : isLow ? 'bg-amber-400' : 'bg-gradient-to-r from-[#8C6239] via-[#D4AF37] to-[#F2D675]'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Price & Valuation */}
                      <td className="py-4 px-4">
                        <span className="font-cinzel text-xs font-bold text-[#F3E6D0] block">
                          €{p.price} / unit
                        </span>
                        <span className="text-[10px] text-[#D8BE99] font-mono font-medium block">
                          Val: €{itemValuation.toLocaleString()}
                        </span>
                      </td>

                      {/* Interactive Quantity Counter & Quick Add Chips */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleStockChange(p.id, -1)}
                              disabled={currentVal <= 0}
                              className="w-8 h-8 rounded-lg bg-black/60 border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#21130D] text-[#D8BE99] hover:text-[#F2D675] flex items-center justify-center cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Decrease 1 flacon"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <input
                              type="number"
                              min="0"
                              value={currentVal}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setStockMap(prev => ({ ...prev, [p.id]: isNaN(val) ? 0 : Math.max(0, val) }));
                              }}
                              className="w-16 bg-black/80 border border-[#D4AF37]/40 rounded-lg text-center py-1.5 text-xs font-mono font-bold text-[#F2D675] focus:border-[#D4AF37] focus:outline-none shadow-inner"
                            />

                            <button
                              onClick={() => handleStockChange(p.id, 1)}
                              className="w-8 h-8 rounded-lg bg-black/60 border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#21130D] text-[#D8BE99] hover:text-[#F2D675] flex items-center justify-center cursor-pointer transition-all"
                              title="Increase 1 flacon"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Quick Add Chips */}
                          <div className="flex items-center gap-1 text-[9px] font-mono font-bold text-[#D8BE99]">
                            <button
                              onClick={() => handleQuickAdd(p.id, 10)}
                              className="px-1.5 py-0.5 rounded bg-black/40 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/25 hover:text-[#F2D675] cursor-pointer transition-all"
                            >
                              +10
                            </button>
                            <button
                              onClick={() => handleQuickAdd(p.id, 25)}
                              className="px-1.5 py-0.5 rounded bg-black/40 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/25 hover:text-[#F2D675] cursor-pointer transition-all"
                            >
                              +25
                            </button>
                            <button
                              onClick={() => handleQuickAdd(p.id, 50)}
                              className="px-1.5 py-0.5 rounded bg-black/40 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/25 hover:text-[#F2D675] cursor-pointer transition-all"
                            >
                              +50
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Commit Stock CTA */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <button
                          onClick={() => handleSaveStock(p.id, p.name)}
                          className={`group/btn relative px-4 py-2 rounded-full font-cinzel font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-lg transition-all duration-300 overflow-hidden cursor-pointer ${
                            isSaved
                              ? 'bg-emerald-600 text-white border border-emerald-400'
                              : 'bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] hover:from-[#F2D675] hover:via-[#D4AF37] hover:to-[#F2D675] text-white hover:text-black border border-[#F2D675]/50'
                          }`}
                        >
                          {isSaved ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-white" />
                              <span>Committed</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5 text-current" />
                              <span>Commit</span>
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
