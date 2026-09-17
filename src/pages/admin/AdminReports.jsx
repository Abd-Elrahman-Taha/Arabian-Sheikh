import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { reportService } from '../../services/reportService';
import { categoryApi } from '../../api/category.api';
import { brandApi } from '../../api/brand.api';
import { useToast } from '../../context/ToastContext';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  AlertCircle,
  Package,
  Layers,
  Globe,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Archive,
  ArrowUpDown,
  X,
  Sparkles,
  Percent,
  Truck,
  RotateCcw
} from 'lucide-react';

const PERIOD_PRESETS = [
  { id: 'weekly', label: 'This Week' },
  { id: 'monthly', label: 'This Month' },
  { id: 'quarterly', label: 'This Quarter' },
  { id: 'custom', label: 'Custom Range' }
];

const ORDER_STATUS_OPTIONS = [
  { value: '', label: 'All (Excl. Cancelled)' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Shipped', label: 'Shipped' },
  { value: 'OutForDelivery', label: 'Out for Delivery' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'CancelPending', label: 'Cancel Pending' },
  { value: 'Cancelled', label: 'Cancelled' }
];

export default function AdminReports() {
  const { t } = useTranslation();
  const { success, error, info } = useToast();

  // Active Tab: 'overview' | 'products' | 'categories' | 'countries'
  const [activeTab, setActiveTab] = useState('overview');

  // Period & Global Dates
  const [periodPreset, setPeriodPreset] = useState('monthly');
  const initialDates = reportService.getPresetDates('monthly');
  const [fromDate, setFromDate] = useState(initialDates.from);
  const [toDate, setToDate] = useState(initialDates.to);

  // Overview Tab State
  const [overviewData, setOverviewData] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [overviewError, setOverviewError] = useState(null);

  // Overview Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [productIdFilter, setProductIdFilter] = useState('');
  const [categoryIdFilter, setCategoryIdFilter] = useState('');
  const [brandIdFilter, setBrandIdFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  // Catalog Filters Data
  const [categoriesList, setCategoriesList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);

  // Products Breakdown Tab State
  const [productsData, setProductsData] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState(null);
  const [productsPage, setProductsPage] = useState(1);
  const [productsPageSize, setProductsPageSize] = useState(20);
  const [productsSortBy, setProductsSortBy] = useState('revenue');
  const [productsSortDir, setProductsSortDir] = useState('desc');

  // Categories Breakdown Tab State
  const [categoriesData, setCategoriesData] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);

  // Countries Breakdown Tab State
  const [countriesData, setCountriesData] = useState(null);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [countriesError, setCountriesError] = useState(null);
  const [countrySearchCode, setCountrySearchCode] = useState('');

  // Export State
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Load Categories & Brands for filter selectors
  useEffect(() => {
    categoryApi.getCategories().then(items => {
      if (Array.isArray(items)) setCategoriesList(items);
    }).catch(() => {});

    brandApi.getBrands().then(items => {
      if (Array.isArray(items)) setBrandsList(items);
    }).catch(() => {});
  }, []);

  // Update dates when period preset changes
  const handlePeriodChange = (newPreset) => {
    setPeriodPreset(newPreset);
    if (newPreset !== 'custom') {
      const dates = reportService.getPresetDates(newPreset);
      setFromDate(dates.from);
      setToDate(dates.to);
    }
  };

  // 1. FETCH OVERVIEW
  const fetchOverview = useCallback(async () => {
    setLoadingOverview(true);
    setOverviewError(null);
    try {
      const params = {
        period: periodPreset
      };

      if (periodPreset === 'custom') {
        if (!fromDate || !toDate) {
          setOverviewError('From and To dates are required for custom period.');
          setLoadingOverview(false);
          return;
        }
        if (new Date(fromDate) > new Date(toDate)) {
          setOverviewError('From date must not be after To date.');
          setLoadingOverview(false);
          return;
        }
        params.from = fromDate;
        params.to = toDate;
      }

      if (statusFilter) params.status = statusFilter;
      if (productIdFilter && !isNaN(Number(productIdFilter))) params.productId = Number(productIdFilter);
      if (categoryIdFilter && !isNaN(Number(categoryIdFilter))) params.categoryId = Number(categoryIdFilter);
      if (brandIdFilter && !isNaN(Number(brandIdFilter))) params.brandId = Number(brandIdFilter);
      if (countryFilter.trim()) params.country = countryFilter.trim();

      const data = await reportService.getSalesReport(params);
      setOverviewData(data);

      // Sync concrete server from/to if preset was used
      if (data?.period?.from && data?.period?.to && periodPreset !== 'custom') {
        setFromDate(data.period.from.split('T')[0]);
        setToDate(data.period.to.split('T')[0]);
      }
    } catch (err) {
      setOverviewError(err.message || 'Failed to load sales report overview.');
    } finally {
      setLoadingOverview(false);
    }
  }, [periodPreset, fromDate, toDate, statusFilter, productIdFilter, categoryIdFilter, brandIdFilter, countryFilter]);

  // 2. FETCH PRODUCTS BREAKDOWN
  const fetchProductsBreakdown = useCallback(async () => {
    setLoadingProducts(true);
    setProductsError(null);
    try {
      const params = {
        from: fromDate,
        to: toDate,
        page: productsPage,
        pageSize: productsPageSize,
        sortBy: productsSortBy,
        sortDirection: productsSortDir
      };

      const data = await reportService.getSalesByProduct(params);
      setProductsData(data);
    } catch (err) {
      setProductsError(err.message || 'Failed to load products breakdown.');
    } finally {
      setLoadingProducts(false);
    }
  }, [fromDate, toDate, productsPage, productsPageSize, productsSortBy, productsSortDir]);

  // 3. FETCH CATEGORIES BREAKDOWN
  const fetchCategoriesBreakdown = useCallback(async () => {
    setLoadingCategories(true);
    setCategoriesError(null);
    try {
      const params = {
        from: fromDate,
        to: toDate
      };
      const data = await reportService.getSalesByCategory(params);
      setCategoriesData(data);
    } catch (err) {
      setCategoriesError(err.message || 'Failed to load categories breakdown.');
    } finally {
      setLoadingCategories(false);
    }
  }, [fromDate, toDate]);

  // 4. FETCH COUNTRIES BREAKDOWN
  const fetchCountriesBreakdown = useCallback(async () => {
    setLoadingCountries(true);
    setCountriesError(null);
    try {
      const params = {
        from: fromDate,
        to: toDate
      };
      if (countrySearchCode.trim()) {
        params.country = countrySearchCode.trim().toUpperCase();
      }
      const data = await reportService.getSalesByCountry(params);
      setCountriesData(data);
    } catch (err) {
      setCountriesError(err.message || 'Failed to load countries breakdown.');
    } finally {
      setLoadingCountries(false);
    }
  }, [fromDate, toDate, countrySearchCode]);

  // Route load by active tab
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchOverview();
    } else if (activeTab === 'products') {
      fetchProductsBreakdown();
    } else if (activeTab === 'categories') {
      fetchCategoriesBreakdown();
    } else if (activeTab === 'countries') {
      fetchCountriesBreakdown();
    }
  }, [activeTab, fetchOverview, fetchProductsBreakdown, fetchCategoriesBreakdown, fetchCountriesBreakdown]);

  // 5. FILE EXPORT HANDLER
  const handleExport = async (format) => {
    setExportDropdownOpen(false);
    setExporting(true);
    try {
      info(`Generating ${format.toUpperCase()} sales export...`);
      const res = await reportService.downloadExport({
        format,
        from: fromDate,
        to: toDate
      });
      success(`Export downloaded: ${res.filename}`);
    } catch (err) {
      error(err.message || 'Export generation failed.');
    } finally {
      setExporting(false);
    }
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setProductIdFilter('');
    setCategoryIdFilter('');
    setBrandIdFilter('');
    setCountryFilter('');
  };

  const hasActiveFilters = Boolean(
    statusFilter || productIdFilter || categoryIdFilter || brandIdFilter || countryFilter
  );

  return (
    <div className="space-y-8 pb-20 text-[#F3E6D0]">
      {/* Top Banner & Date Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-[#D4AF37]/20 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0]">
              Sales Reports & Analytics
            </h1>
            {overviewData?.isFallback && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
                <Sparkles className="w-3 h-3" />
                <span>Live Order Sync</span>
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            Real-time fiscal reporting, revenue reconciliation, multi-dimensional sales breakdowns, and compliance exports.
          </p>
        </div>

        {/* Global Period Selector & Export */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Preset Buttons */}
          <div className="flex items-center p-1 rounded-full bg-black/60 border border-white/10 text-xs">
            {PERIOD_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePeriodChange(preset.id)}
                className={`px-3.5 py-1.5 rounded-full font-cinzel text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
                  periodPreset === preset.id
                    ? 'bg-[#D4AF37] text-black shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              disabled={exporting}
              className="px-4 py-2 rounded-full border border-[#D4AF37]/50 bg-[#0B0A08] text-xs font-cinzel font-bold text-[#D4AF37] hover:bg-[#D4AF37]/15 transition-all flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              <Download className={`w-3.5 h-3.5 ${exporting ? 'animate-bounce' : ''}`} />
              <span>{exporting ? 'Exporting...' : 'Export'}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {exportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0E0C09] border border-[#D4AF37]/30 shadow-2xl p-2 z-50 space-y-1">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-3 py-2 text-left text-xs font-cinzel text-neutral-300 hover:text-black hover:bg-[#D4AF37] rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <Archive className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="font-bold">CSV (ZIP Archive)</div>
                    <div className="text-[10px] opacity-70">Summary + Orders CSVs</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('xlsx')}
                  className="w-full px-3 py-2 text-left text-xs font-cinzel text-neutral-300 hover:text-black hover:bg-[#D4AF37] rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-bold">Excel Workbook (.xlsx)</div>
                    <div className="text-[10px] opacity-70">Multi-sheet analysis</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-3 py-2 text-left text-xs font-cinzel text-neutral-300 hover:text-black hover:bg-[#D4AF37] rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-rose-400" />
                  <div>
                    <div className="font-bold">Printable PDF Report</div>
                    <div className="text-[10px] opacity-70">Formal executive view</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Date Range Bar (When period === 'custom') */}
      {periodPreset === 'custom' && (
        <div className="p-4 rounded-2xl bg-[#0B0A08] border border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-cinzel text-[#D4AF37] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Custom Date Range (UTC):</span>
            </span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-black/60 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
              />
              <span className="text-neutral-500">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-black/60 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={() => {
              if (activeTab === 'overview') fetchOverview();
              else if (activeTab === 'products') fetchProductsBreakdown();
              else if (activeTab === 'categories') fetchCategoriesBreakdown();
              else if (activeTab === 'countries') fetchCountriesBreakdown();
            }}
            className="px-4 py-1.5 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel text-xs font-bold uppercase rounded-full shadow-md transition-colors cursor-pointer"
          >
            Apply Range
          </button>
        </div>
      )}

      {/* Main Feature Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2.5 rounded-full text-xs font-cinzel font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-[#D4AF37] text-black shadow-lg'
              : 'bg-black/40 border border-white/10 text-neutral-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-2.5 rounded-full text-xs font-cinzel font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'products'
              ? 'bg-[#D4AF37] text-black shadow-lg'
              : 'bg-black/40 border border-white/10 text-neutral-400 hover:text-white'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Sales by Product</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-5 py-2.5 rounded-full text-xs font-cinzel font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'bg-[#D4AF37] text-black shadow-lg'
              : 'bg-black/40 border border-white/10 text-neutral-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Sales by Category</span>
        </button>

        <button
          onClick={() => setActiveTab('countries')}
          className={`px-5 py-2.5 rounded-full text-xs font-cinzel font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'countries'
              ? 'bg-[#D4AF37] text-black shadow-lg'
              : 'bg-black/40 border border-white/10 text-neutral-400 hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Sales by Country</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. OVERVIEW TAB */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="p-5 rounded-2xl bg-[#0B0A08] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-cinzel uppercase font-bold text-[#D4AF37] flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters & Scopes (Combinable)</span>
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-neutral-400 hover:text-[#D4AF37] flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Order Status */}
              <div>
                <label className="text-[10px] font-cinzel uppercase text-neutral-400 block mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                >
                  {ORDER_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#120B06]">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product ID */}
              <div>
                <label className="text-[10px] font-cinzel uppercase text-neutral-400 block mb-1">Product ID</label>
                <input
                  type="number"
                  placeholder="e.g. 1001"
                  value={productIdFilter}
                  onChange={(e) => setProductIdFilter(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-[10px] font-cinzel uppercase text-neutral-400 block mb-1">Category</label>
                <select
                  value={categoryIdFilter}
                  onChange={(e) => setCategoryIdFilter(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="" className="bg-[#120B06]">All Categories</option>
                  {categoriesList.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-[#120B06]">
                      {cat.name || `Category #${cat.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div>
                <label className="text-[10px] font-cinzel uppercase text-neutral-400 block mb-1">Brand / Maison</label>
                <select
                  value={brandIdFilter}
                  onChange={(e) => setBrandIdFilter(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="" className="bg-[#120B06]">All Brands</option>
                  {brandsList.map((b) => (
                    <option key={b.id} value={b.id} className="bg-[#120B06]">
                      {b.name || `Brand #${b.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Country */}
              <div>
                <label className="text-[10px] font-cinzel uppercase text-neutral-400 block mb-1">Country (Exact)</label>
                <input
                  type="text"
                  placeholder="e.g. ES or Spain"
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {overviewError && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <div>
                <div className="font-bold">Report Notice</div>
                <div>{overviewError}</div>
              </div>
            </div>
          )}

          {/* Loading or Empty State or KPI Content */}
          {loadingOverview ? (
            <div className="p-16 text-center space-y-3 bg-[#0B0A08] border border-white/10 rounded-2xl">
              <RefreshCw className="w-8 h-8 animate-spin text-[#D4AF37] mx-auto" />
              <p className="text-xs font-cinzel uppercase tracking-wider text-neutral-400">
                Calculating financial metrics...
              </p>
            </div>
          ) : overviewData ? (
            <>
              {/* Informational Message Banner if no sales in range */}
              {overviewData.message && (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-300 flex items-center justify-between">
                  <span>{overviewData.message}</span>
                  <span className="text-[11px] opacity-70 font-mono">
                    {overviewData.isFallback ? 'Live Database Sync' : 'Status 200 OK'}
                  </span>
                </div>
              )}

              {/* 4 Main KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Net Sales */}
                <div className="p-6 rounded-2xl bg-[#0B0A08] border border-[#D4AF37]/40 shadow-2xl space-y-2 hover:border-[#D4AF37] transition-all">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span className="text-[11px] font-cinzel font-bold uppercase tracking-wider text-[#D4AF37]">
                      Net Sales
                    </span>
                    <DollarSign className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div className="font-cinzel text-3xl font-extrabold text-[#F3E6D0]">
                    {reportService.formatEur(overviewData.netSales)}
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono block">
                    Gross − Discounts − Refunds
                  </span>
                </div>

                {/* Gross Sales */}
                <div className="p-6 rounded-2xl bg-[#0B0A08] border border-white/10 shadow-lg space-y-2 hover:border-white/30 transition-all">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span className="text-[11px] font-cinzel font-bold uppercase tracking-wider text-neutral-300">
                      Gross Sales
                    </span>
                    <Package className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="font-cinzel text-3xl font-bold text-neutral-200">
                    {reportService.formatEur(overviewData.grossSales)}
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono block">
                    Total order subtotals
                  </span>
                </div>

                {/* Orders Count */}
                <div className="p-6 rounded-2xl bg-[#0B0A08] border border-white/10 shadow-lg space-y-2 hover:border-white/30 transition-all">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span className="text-[11px] font-cinzel font-bold uppercase tracking-wider text-neutral-300">
                      Orders Count
                    </span>
                    <ShoppingBag className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="font-cinzel text-3xl font-bold text-neutral-200">
                    {overviewData.orders.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono block">
                    Orders in period
                  </span>
                </div>

                {/* Average Order Value (AOV) */}
                <div className="p-6 rounded-2xl bg-[#0B0A08] border border-white/10 shadow-lg space-y-2 hover:border-white/30 transition-all">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span className="text-[11px] font-cinzel font-bold uppercase tracking-wider text-neutral-300">
                      Avg Order Value (AOV)
                    </span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="font-cinzel text-3xl font-bold text-emerald-400">
                    {reportService.formatEur(overviewData.averageOrderValue)}
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono block">
                    Net Sales ÷ Orders
                  </span>
                </div>
              </div>

              {/* Secondary Detail Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Panel 1: Revenue Reconciliation Breakdown */}
                <div className="p-6 rounded-2xl bg-[#0B0A08] border border-white/10 shadow-xl space-y-4">
                  <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37] border-b border-white/10 pb-3">
                    Financial Reconciliation
                  </h3>
                  <div className="space-y-2.5 text-xs font-sans">
                    <div className="flex items-center justify-between py-1">
                      <span className="text-neutral-400">Gross Sales</span>
                      <span className="font-mono font-bold text-[#F3E6D0]">
                        {reportService.formatEur(overviewData.grossSales)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-t border-white/5">
                      <span className="text-rose-400 flex items-center gap-1.5">
                        <Percent className="w-3 h-3" />
                        <span>Discounts Deducted</span>
                      </span>
                      <span className="font-mono font-bold text-rose-400">
                        − {reportService.formatEur(overviewData.discounts)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-t border-white/5">
                      <span className="text-rose-400 flex items-center gap-1.5">
                        <RotateCcw className="w-3 h-3" />
                        <span>Completed Refunds Deducted</span>
                      </span>
                      <span className="font-mono font-bold text-rose-400">
                        − {reportService.formatEur(overviewData.refunds)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-t border-white/10 bg-white/[0.02] px-3 rounded-lg">
                      <span className="font-cinzel font-bold text-[#D4AF37]">
                        = Net Sales (Total Recognized)
                      </span>
                      <span className="font-mono text-base font-bold text-[#D4AF37]">
                        {reportService.formatEur(overviewData.netSales)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 text-neutral-400 text-[11px] pt-3 border-t border-white/5">
                      <span className="flex items-center gap-1.5 text-neutral-300">
                        <Truck className="w-3 h-3 text-[#D4AF37]" />
                        <span>Shipping Revenue (Reported for logistics only)</span>
                      </span>
                      <span className="font-mono font-bold text-neutral-300">
                        {reportService.formatEur(overviewData.shipping)}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-500 italic">
                      Note: Shipping costs are reported for logistical visibility and are not deducted from Net Sales.
                    </p>
                  </div>
                </div>

                {/* Panel 2: Patron Demographics & Metadata */}
                <div className="p-6 rounded-2xl bg-[#0B0A08] border border-white/10 shadow-xl space-y-4">
                  <h3 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37] border-b border-white/10 pb-3">
                    Patron & Period Attributes
                  </h3>
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                      <div>
                        <span className="text-[11px] uppercase font-cinzel text-neutral-400 block">
                          Distinct Customers
                        </span>
                        <span className="font-cinzel text-2xl font-bold text-[#F3E6D0]">
                          {overviewData.customers.toLocaleString()}
                        </span>
                      </div>
                      <Users className="w-8 h-8 text-[#D4AF37]/50" />
                    </div>

                    <div className="space-y-2 text-xs font-sans">
                      <div className="flex items-center justify-between py-1">
                        <span className="text-neutral-400">Reporting Currency</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {overviewData.currency} (EUR Guaranteed)
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-t border-white/5">
                        <span className="text-neutral-400">Period Type</span>
                        <span className="font-cinzel font-bold text-[#F3E6D0] uppercase">
                          {overviewData.period.type}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-t border-white/5">
                        <span className="text-neutral-400">Resolved UTC Range</span>
                        <span className="font-mono text-[11px] text-neutral-300">
                          {overviewData.period?.from ? new Date(overviewData.period.from).toLocaleDateString() : '—'} — {overviewData.period?.to ? new Date(overviewData.period.to).toLocaleDateString() : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-16 text-center space-y-3 bg-[#0B0A08] border border-white/10 rounded-2xl">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <p className="text-xs font-cinzel uppercase tracking-wider text-neutral-400">
                No report data available
              </p>
              <button
                onClick={fetchOverview}
                className="px-4 py-2 bg-[#D4AF37] text-black font-cinzel text-xs font-bold rounded-full cursor-pointer hover:bg-[#F2D675] transition-colors"
              >
                Recalculate Metrics
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SALES BY PRODUCT TAB */}
      {/* ======================================================== */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-[#0B0A08] border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4">
              {/* Sort By */}
              <div className="flex items-center gap-2">
                <span className="text-neutral-400 font-cinzel uppercase text-[10px]">Sort By:</span>
                <select
                  value={productsSortBy}
                  onChange={(e) => { setProductsSortBy(e.target.value); setProductsPage(1); }}
                  className="bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="revenue" className="bg-[#120B06]">Net Revenue</option>
                  <option value="quantity" className="bg-[#120B06]">Quantity Sold</option>
                </select>
              </div>

              {/* Sort Direction */}
              <div className="flex items-center gap-2">
                <span className="text-neutral-400 font-cinzel uppercase text-[10px]">Order:</span>
                <select
                  value={productsSortDir}
                  onChange={(e) => { setProductsSortDir(e.target.value); setProductsPage(1); }}
                  className="bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="desc" className="bg-[#120B06]">High to Low (Desc)</option>
                  <option value="asc" className="bg-[#120B06]">Low to High (Asc)</option>
                </select>
              </div>

              {/* Page Size */}
              <div className="flex items-center gap-2">
                <span className="text-neutral-400 font-cinzel uppercase text-[10px]">Rows:</span>
                <select
                  value={productsPageSize}
                  onChange={(e) => { setProductsPageSize(Number(e.target.value)); setProductsPage(1); }}
                  className="bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="10" className="bg-[#120B06]">10</option>
                  <option value="20" className="bg-[#120B06]">20</option>
                  <option value="50" className="bg-[#120B06]">50</option>
                </select>
              </div>
            </div>

            <span className="text-neutral-400 font-mono text-[11px]">
              Range: {fromDate} → {toDate}
            </span>
          </div>

          {/* Products Table */}
          <div className="rounded-2xl bg-[#0B0A08] border border-white/10 overflow-hidden shadow-2xl">
            {loadingProducts ? (
              <div className="p-16 text-center space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin text-[#D4AF37] mx-auto" />
                <p className="text-xs font-cinzel uppercase tracking-wider text-neutral-400">Loading product breakdown...</p>
              </div>
            ) : productsError ? (
              <div className="p-8 text-center text-rose-400 text-xs">{productsError}</div>
            ) : !productsData?.items?.length ? (
              <div className="p-16 text-center space-y-2 text-neutral-400 text-xs">
                <p className="font-cinzel font-bold text-[#F3E6D0]">No Product Sales Found</p>
                <p>No orders with product line items match this period.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-black/40 text-[11px] font-cinzel uppercase tracking-wider text-[#D8BE99]">
                        <th className="py-4 px-4 font-bold">PID</th>
                        <th className="py-4 px-4 font-bold">Product Name</th>
                        <th className="py-4 px-4 font-bold text-center">Qty Sold</th>
                        <th className="py-4 px-4 font-bold text-right">Gross Revenue</th>
                        <th className="py-4 px-4 font-bold text-right">Discounts</th>
                        <th className="py-4 px-4 font-bold text-right">Net Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {productsData.items.map((item) => (
                        <tr key={item.productId} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4 font-mono text-neutral-400">#{item.productId}</td>
                          <td className="py-3.5 px-4 font-cinzel font-bold text-[#F3E6D0]">
                            {item.productName || 'Flacon Creation'}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-neutral-200">
                            {item.quantitySold.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-neutral-300">
                            {reportService.formatEur(item.grossRevenue)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-rose-400">
                            {item.discountGiven > 0 ? `− ${reportService.formatEur(item.discountGiven)}` : '€0.00'}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-[#D4AF37]">
                            {reportService.formatEur(item.netRevenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {productsData.totalPages > 1 && (
                  <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs">
                    <span className="text-neutral-400">
                      Page <strong className="text-white">{productsData.page}</strong> of <strong className="text-white">{productsData.totalPages}</strong> ({productsData.totalCount} distinct products)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setProductsPage(p => Math.max(1, p - 1))}
                        disabled={!productsData.hasPreviousPage || productsPage === 1}
                        className="px-3 py-1.5 rounded-lg border border-white/10 text-neutral-300 hover:border-[#D4AF37] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setProductsPage(p => Math.min(productsData.totalPages, p + 1))}
                        disabled={!productsData.hasNextPage || productsPage === productsData.totalPages}
                        className="px-3 py-1.5 rounded-lg border border-white/10 text-neutral-300 hover:border-[#D4AF37] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. SALES BY CATEGORY TAB */}
      {/* ======================================================== */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#0B0A08] border border-white/10 overflow-hidden shadow-2xl">
            {loadingCategories ? (
              <div className="p-16 text-center space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin text-[#D4AF37] mx-auto" />
                <p className="text-xs font-cinzel uppercase tracking-wider text-neutral-400">Loading category breakdown...</p>
              </div>
            ) : categoriesError ? (
              <div className="p-8 text-center text-rose-400 text-xs">{categoriesError}</div>
            ) : !categoriesData?.items?.length ? (
              <div className="p-16 text-center space-y-2 text-neutral-400 text-xs">
                <p className="font-cinzel font-bold text-[#F3E6D0]">No Category Sales Recorded</p>
                <p>No orders match the selected period for category breakdown.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/40 text-[11px] font-cinzel uppercase tracking-wider text-[#D8BE99]">
                      <th className="py-4 px-4 font-bold">Category ID</th>
                      <th className="py-4 px-4 font-bold">Category Name</th>
                      <th className="py-4 px-4 font-bold text-center">Items Sold</th>
                      <th className="py-4 px-4 font-bold text-right">Net Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {categoriesData.items.map((item) => (
                      <tr key={item.categoryId} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-4 font-mono text-neutral-400">#{item.categoryId}</td>
                        <td className="py-4 px-4 font-cinzel font-bold text-[#F3E6D0]">
                          {item.categoryName}
                        </td>
                        <td className="py-4 px-4 text-center font-mono font-bold text-neutral-200">
                          {item.quantitySold.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-[#D4AF37]">
                          {reportService.formatEur(item.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. SALES BY COUNTRY TAB */}
      {/* ======================================================== */}
      {activeTab === 'countries' && (
        <div className="space-y-6">
          {/* Country Search Bar */}
          <div className="p-4 rounded-2xl bg-[#0B0A08] border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-cinzel uppercase text-neutral-400 font-bold">Filter by ISO Country Code:</span>
              <input
                type="text"
                maxLength={2}
                placeholder="e.g. ES, FR, AE"
                value={countrySearchCode}
                onChange={(e) => setCountrySearchCode(e.target.value.toUpperCase())}
                className="bg-black/60 border border-white/20 rounded-lg px-3 py-1 text-xs text-[#F3E6D0] uppercase font-mono w-24 focus:border-[#D4AF37] focus:outline-none"
              />
              {countrySearchCode && (
                <button
                  onClick={() => setCountrySearchCode('')}
                  className="text-neutral-400 hover:text-white text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <span className="text-neutral-400 font-mono text-[11px]">
              Range: {fromDate} → {toDate}
            </span>
          </div>

          <div className="rounded-2xl bg-[#0B0A08] border border-white/10 overflow-hidden shadow-2xl">
            {loadingCountries ? (
              <div className="p-16 text-center space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin text-[#D4AF37] mx-auto" />
                <p className="text-xs font-cinzel uppercase tracking-wider text-neutral-400">Loading country breakdown...</p>
              </div>
            ) : countriesError ? (
              <div className="p-8 text-center text-rose-400 text-xs">{countriesError}</div>
            ) : !countriesData?.items?.length ? (
              <div className="p-16 text-center space-y-2 text-neutral-400 text-xs">
                <p className="font-cinzel font-bold text-[#F3E6D0]">No Country Orders Found</p>
                <p>No orders match the selected period or country filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/40 text-[11px] font-cinzel uppercase tracking-wider text-[#D8BE99]">
                      <th className="py-4 px-4 font-bold">Country</th>
                      <th className="py-4 px-4 font-bold text-center">Orders</th>
                      <th className="py-4 px-4 font-bold text-right">Revenue (Excl. Shipping)</th>
                      <th className="py-4 px-4 font-bold text-right">AOV</th>
                      <th className="py-4 px-4 font-bold text-center">Patrons</th>
                      <th className="py-4 px-4 font-bold text-center">Currency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {countriesData.items.map((item) => (
                      <tr key={item.countryCode} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-4 font-bold font-cinzel text-[#F3E6D0] flex items-center gap-2">
                          <span className="w-6 h-4 rounded bg-white/10 border border-white/20 inline-flex items-center justify-center font-mono text-[10px] text-amber-400 font-bold">
                            {item.countryCode}
                          </span>
                          <span>{item.countryCode}</span>
                        </td>
                        <td className="py-4 px-4 text-center font-mono text-neutral-200">
                          {item.orders.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-[#D4AF37]">
                          {reportService.formatEur(item.revenue)}
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-emerald-400">
                          {reportService.formatEur(item.averageOrderValue)}
                        </td>
                        <td className="py-4 px-4 text-center font-mono text-neutral-300">
                          {item.customers.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-center font-mono text-neutral-400">
                          {item.currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
