import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { promotionService } from '../../services/promotionService';
import { productApi } from '../../api/product.api';
import { brandApi } from '../../api/brand.api';
import { productService } from '../../services/productService';
import { useToast } from '../../context/ToastContext';
import {
  Plus,
  Search,
  X,
  Tag,
  Package,
  Sparkles,
  Layers,
  Building2,
  Crown,
  Eye,
  Edit2,
  Trash2,
  Power,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Info,
  Calendar,
  DollarSign,
  Percent,
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';

const STATUS_TABS = [
  { id: 'ALL', label: 'All Campaigns' },
  { id: 'Active', label: 'Active' },
  { id: 'Inactive', label: 'Inactive' },
  { id: 'Scheduled', label: 'Scheduled' },
  { id: 'Expired', label: 'Expired' }
];

const TYPE_OPTIONS = [
  { id: 'ALL', label: 'All Types' },
  { id: 'Discount', label: 'Discounts Only' },
  { id: 'Bundle', label: 'Bundles Only' }
];

const SORT_OPTIONS = [
  { label: 'Newest First', sortBy: 'CreatedAt', sortDescending: true },
  { label: 'Oldest First', sortBy: 'CreatedAt', sortDescending: false },
  { label: 'Name (A - Z)', sortBy: 'Name', sortDescending: false },
  { label: 'Name (Z - A)', sortBy: 'Name', sortDescending: true },
  { label: 'Start Date', sortBy: 'StartDate', sortDescending: false },
  { label: 'End Date', sortBy: 'EndDate', sortDescending: false },
  { label: 'Most Used', sortBy: 'UsageCount', sortDescending: true }
];

const TARGET_TYPES = [
  { id: 'Category', label: 'Category', icon: Layers },
  { id: 'Subcategory', label: 'Subcategory', icon: Layers },
  { id: 'Brand', label: 'Maison / Brand', icon: Building2 },
  { id: 'PerfumeCategory', label: 'Perfume Tier', icon: Crown },
  { id: 'Product', label: 'Specific Flacon', icon: Tag }
];

function formatDateDisplay(isoStr) {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return isoStr;
  }
}

function toLocalInputDateTime(isoStr) {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

export default function AdminPromotions() {
  const { t } = useTranslation();
  const { success, error, info } = useToast();

  // Listing State
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedSort, setSelectedSort] = useState(SORT_OPTIONS[0]);

  // Catalog Metadata for Targeting & Bundles
  const [catalogCategories, setCatalogCategories] = useState([]);
  const [catalogSubcategories, setCatalogSubcategories] = useState([]);
  const [catalogBrands, setCatalogBrands] = useState([]);
  const [catalogPerfumeCats, setCatalogPerfumeCats] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);

  // Modal States
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [submittingForm, setSubmittingForm] = useState(false);

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [viewingPromotion, setViewingPromotion] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [bundleModalOpen, setBundleModalOpen] = useState(false);
  const [bundleTargetPromo, setBundleTargetPromo] = useState(null);
  const [editingBundle, setEditingBundle] = useState(null);
  const [submittingBundle, setSubmittingBundle] = useState(false);

  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [promoToDeactivate, setPromoToDeactivate] = useState(null);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [deleteBundleModalOpen, setDeleteBundleModalOpen] = useState(false);
  const [bundleToDelete, setBundleToDelete] = useState(null);
  const [deleteBundleLoading, setDeleteBundleLoading] = useState(false);

  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [conflictPromo, setConflictPromo] = useState(null);

  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Promotion Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'Discount',
    discountType: 'Percentage',
    discountValue: 20,
    startDate: '',
    endDate: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    applicability: []
  });

  // Bundle Form State
  const [bundleFormData, setBundleFormData] = useState({
    name: '',
    bundlePrice: 50,
    items: []
  });

  // Debounced Search Handler
  const searchTimeoutRef = useRef(null);
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  // Load Catalog Metadata once
  useEffect(() => {
    let isMounted = true;
    async function loadCatalogMeta() {
      try {
        const [cats, brands, perfCats, prods] = await Promise.allSettled([
          productApi.adminGetCategories().catch(() => productApi.getCategories?.() || []),
          brandApi.adminGetBrands().catch(() => brandApi.getBrands?.() || []),
          productApi.adminGetPerfumeCategories().catch(() => productApi.getPerfumeCategories?.() || []),
          productService.getAllProducts({ includeDrafts: true }).catch(() => [])
        ]);

        if (isMounted) {
          if (cats.status === 'fulfilled' && Array.isArray(cats.value)) setCatalogCategories(cats.value);
          if (brands.status === 'fulfilled' && Array.isArray(brands.value)) setCatalogBrands(brands.value);
          if (perfCats.status === 'fulfilled' && Array.isArray(perfCats.value)) setCatalogPerfumeCats(perfCats.value);
          if (prods.status === 'fulfilled' && Array.isArray(prods.value)) setCatalogProducts(prods.value);
        }
      } catch (err) {
        console.warn('[AdminPromotions] Catalog meta warning:', err);
      }
    }
    loadCatalogMeta();
    return () => { isMounted = false; };
  }, []);

  // Fetch Promotions from API
  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize,
        sortBy: selectedSort.sortBy,
        sortDescending: selectedSort.sortDescending
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (typeFilter !== 'ALL') params.type = typeFilter;

      const result = await promotionService.getPromotions(params);
      setPromotions(result?.items || []);
      setTotalCount(result?.totalCount || 0);
      setTotalPages(result?.totalPages || 1);
      setHasPreviousPage(Boolean(result?.hasPreviousPage));
      setHasNextPage(Boolean(result?.hasNextPage));
    } catch (err) {
      console.warn('[AdminPromotions] Fetch error:', err.message);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, statusFilter, typeFilter, selectedSort]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // Open Create Promotion Modal
  const handleOpenCreate = () => {
    const now = new Date();
    const future = new Date();
    future.setMonth(future.getMonth() + 2);

    setEditingPromotion(null);
    setFormData({
      name: '',
      type: 'Discount',
      discountType: 'Percentage',
      discountValue: 20,
      startDate: toLocalInputDateTime(now.toISOString()),
      endDate: toLocalInputDateTime(future.toISOString()),
      minOrderAmount: '',
      maxDiscountAmount: '',
      usageLimit: '',
      applicability: []
    });
    setFormModalOpen(true);
  };

  // Open Edit Promotion Modal
  const handleOpenEdit = async (promo) => {
    try {
      setActionLoadingId(promo.id);
      const full = await promotionService.getPromotionById(promo.id);
      setEditingPromotion(full);
      setFormData({
        name: full.name || '',
        type: full.type || 'Discount',
        discountType: full.discountType || 'Percentage',
        discountValue: full.discountValue ?? 20,
        startDate: toLocalInputDateTime(full.startDate),
        endDate: toLocalInputDateTime(full.endDate),
        minOrderAmount: full.minOrderAmount ?? '',
        maxDiscountAmount: full.maxDiscountAmount ?? '',
        usageLimit: full.usageLimit ?? '',
        applicability: Array.isArray(full.applicability) ? [...full.applicability] : []
      });
      setFormModalOpen(true);
    } catch (err) {
      error(err.message || 'Failed to load promotion details for editing.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Submit Create / Edit Promotion Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmittingForm(true);
    try {
      if (editingPromotion) {
        await promotionService.updatePromotion(editingPromotion.id, formData);
        success(`Promotion '${formData.name}' updated successfully.`);
      } else {
        await promotionService.createPromotion(formData);
        success(`Promotion '${formData.name}' created successfully.`);
      }
      setFormModalOpen(false);
      setEditingPromotion(null);
      fetchPromotions();
    } catch (err) {
      error(err.message || 'Failed to save promotion.');
    } finally {
      setSubmittingForm(false);
    }
  };

  // Open Promotion Details Modal
  const handleOpenDetails = async (promo) => {
    setViewingPromotion(promo);
    setDetailsModalOpen(true);
    setDetailsLoading(true);
    try {
      const full = await promotionService.getPromotionById(promo.id);
      setViewingPromotion(full);
    } catch (err) {
      console.warn('Failed to load full promotion details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Open Analytics Modal
  const handleOpenAnalytics = async (promo) => {
    setAnalyticsData(null);
    setAnalyticsModalOpen(true);
    setAnalyticsLoading(true);
    try {
      const data = await promotionService.getPromotionAnalytics(promo.id);
      setAnalyticsData(data);
    } catch (err) {
      error('Failed to load analytics.');
      setAnalyticsModalOpen(false);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Toggle Activate / Deactivate
  const handleToggleActive = async (promo) => {
    if (promo.status === 'Active') {
      setPromoToDeactivate(promo);
      setDeactivateReason('');
      setDeactivateModalOpen(true);
    } else {
      setActionLoadingId(promo.id);
      try {
        await promotionService.activatePromotion(promo.id);
        success(`Promotion '${promo.name}' activated.`);
        fetchPromotions();
      } catch (err) {
        error(err.message || 'Failed to activate promotion.');
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  // Confirm Deactivate
  const handleConfirmDeactivate = async () => {
    if (!promoToDeactivate) return;
    setDeactivateLoading(true);
    try {
      await promotionService.deactivatePromotion(promoToDeactivate.id, deactivateReason);
      success(`Promotion '${promoToDeactivate.name}' deactivated.`);
      setDeactivateModalOpen(false);
      setPromoToDeactivate(null);
      fetchPromotions();
    } catch (err) {
      error(err.message || 'Failed to deactivate promotion.');
    } finally {
      setDeactivateLoading(false);
    }
  };

  // Open Delete Confirmation
  const handleOpenDelete = (promo) => {
    setPromoToDelete(promo);
    setDeleteModalOpen(true);
  };

  // Confirm Delete Promotion
  const handleConfirmDelete = async () => {
    if (!promoToDelete) return;
    setDeleteLoading(true);
    try {
      await promotionService.deletePromotion(promoToDelete.id);
      success(`Promotion '${promoToDelete.name}' deleted.`);
      setDeleteModalOpen(false);
      setPromoToDelete(null);
      fetchPromotions();
    } catch (err) {
      setDeleteModalOpen(false);
      if (err.isConflict || err.code === 'PROMOTION_HAS_USAGE_HISTORY') {
        setConflictPromo(promoToDelete);
        setConflictModalOpen(true);
      } else {
        error(err.message || 'Failed to delete promotion.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // Open Bundle Modal (Create or Edit Bundle)
  const handleOpenBundleModal = (promo, bundleToEdit = null) => {
    setBundleTargetPromo(promo);
    setEditingBundle(bundleToEdit);
    if (bundleToEdit) {
      setBundleFormData({
        name: bundleToEdit.name || '',
        bundlePrice: bundleToEdit.bundlePrice ?? 50,
        items: (bundleToEdit.items || []).map(i => ({
          productId: i.productId,
          quantity: i.quantity || 1
        }))
      });
    } else {
      setBundleFormData({
        name: `${promo.name} - Bundle Pack`,
        bundlePrice: 60,
        items: catalogProducts.length >= 2
          ? [
              { productId: catalogProducts[0].id, quantity: 1 },
              { productId: catalogProducts[1].id, quantity: 1 }
            ]
          : []
      });
    }
    setBundleModalOpen(true);
  };

  // Submit Bundle Form
  const handleBundleSubmit = async (e) => {
    e.preventDefault();
    if (!bundleTargetPromo) return;
    setSubmittingBundle(true);
    try {
      if (editingBundle) {
        await promotionService.updateBundle(bundleTargetPromo.id, editingBundle.id, bundleFormData);
        success(`Bundle '${bundleFormData.name}' updated.`);
      } else {
        await promotionService.createBundle(bundleTargetPromo.id, bundleFormData);
        success(`Bundle '${bundleFormData.name}' created under '${bundleTargetPromo.name}'.`);
      }
      setBundleModalOpen(false);
      setEditingBundle(null);
      if (viewingPromotion?.id === bundleTargetPromo.id) {
        const full = await promotionService.getPromotionById(bundleTargetPromo.id);
        setViewingPromotion(full);
      }
      fetchPromotions();
    } catch (err) {
      error(err.message || 'Failed to save bundle.');
    } finally {
      setSubmittingBundle(false);
    }
  };

  // Open Delete Bundle Confirmation
  const handleOpenDeleteBundle = (bundle, promo) => {
    setBundleToDelete({ ...bundle, promoId: promo.id });
    setDeleteBundleModalOpen(true);
  };

  // Confirm Delete Bundle
  const handleConfirmDeleteBundle = async () => {
    if (!bundleToDelete) return;
    setDeleteBundleLoading(true);
    try {
      await promotionService.deleteBundle(bundleToDelete.promoId, bundleToDelete.id);
      success('Bundle removed.');
      setDeleteBundleModalOpen(false);
      setBundleToDelete(null);
      if (viewingPromotion?.id === bundleToDelete.promoId) {
        const full = await promotionService.getPromotionById(bundleToDelete.promoId);
        setViewingPromotion(full);
      }
      fetchPromotions();
    } catch (err) {
      error(err.message || 'Failed to delete bundle.');
    } finally {
      setDeleteBundleLoading(false);
    }
  };

  // Applicability Form Helpers
  const addApplicabilityRule = () => {
    setFormData(prev => ({
      ...prev,
      applicability: [
        ...prev.applicability,
        {
          targetType: 'Category',
          targetId: catalogCategories[0]?.id || 1,
          isExcluded: false
        }
      ]
    }));
  };

  const updateApplicabilityRule = (index, field, value) => {
    setFormData(prev => {
      const next = [...prev.applicability];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, applicability: next };
    });
  };

  const removeApplicabilityRule = (index) => {
    setFormData(prev => ({
      ...prev,
      applicability: prev.applicability.filter((_, idx) => idx !== index)
    }));
  };

  // Bundle Items Form Helpers
  const addBundleItem = () => {
    const existingIds = new Set(bundleFormData.items.map(i => Number(i.productId)));
    const nextProduct = catalogProducts.find(p => !existingIds.has(Number(p.id))) || catalogProducts[0];
    if (nextProduct) {
      setBundleFormData(prev => ({
        ...prev,
        items: [...prev.items, { productId: nextProduct.id, quantity: 1 }]
      }));
    }
  };

  const updateBundleItem = (index, field, value) => {
    setBundleFormData(prev => {
      const next = [...prev.items];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, items: next };
    });
  };

  const removeBundleItem = (index) => {
    setBundleFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index)
    }));
  };

  // Calculate dynamic bundle savings
  const bundleOriginalTotal = bundleFormData.items.reduce((sum, item) => {
    const product = catalogProducts.find(p => Number(p.id) === Number(item.productId));
    const price = product?.price ? Number(product.price) : 0;
    return sum + (price * (Number(item.quantity) || 1));
  }, 0);

  const bundleSavings = Math.max(0, bundleOriginalTotal - (Number(bundleFormData.bundlePrice) || 0));
  const bundleSavingsPercent = bundleOriginalTotal > 0
    ? Math.round(((bundleSavings / bundleOriginalTotal) * 100) * 10) / 10
    : 0;

  return (
    <div className="space-y-6 text-[#F3E6D0] animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D4AF37]/20 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Sparkles className="w-6 h-6 text-[#D4AF37]" />
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0]">
              Palace Promotions & Bundles
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#D8BE99] font-medium">
            Curate royal seasonal discount campaigns and bespoke fragrance bundle suites.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={fetchPromotions}
            disabled={loading}
            className="p-2.5 rounded-xl border border-[#D4AF37]/30 bg-black/40 hover:bg-black/70 text-[#D8BE99] hover:text-[#F2D675] transition-all cursor-pointer shadow-sm disabled:opacity-50"
            title="Refresh promotions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="group/btn relative px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] hover:from-[#F2D675] hover:via-[#D4AF37] hover:to-[#F2D675] text-white hover:text-black border border-[#F2D675]/50 font-cinzel font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/25 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 backdrop-blur-md">
        {/* Top Filter Row: Status Tabs + Type Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setStatusFilter(tab.id); setPage(1); }}
                className={`px-3.5 py-1.5 rounded-xl font-cinzel text-xs uppercase font-bold tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-[#D4AF37] text-black shadow-md'
                    : 'bg-black/40 text-[#D8BE99] hover:text-white hover:bg-white/5 border border-[#D4AF37]/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-cinzel text-[#D8BE99] uppercase">Type:</span>
            <div className="inline-flex rounded-xl p-1 bg-black/60 border border-[#D4AF37]/25">
              {TYPE_OPTIONS.map(typeOpt => (
                <button
                  key={typeOpt.id}
                  onClick={() => { setTypeFilter(typeOpt.id); setPage(1); }}
                  className={`px-3 py-1 rounded-lg text-xs font-cinzel uppercase font-bold tracking-wider transition-all cursor-pointer ${
                    typeFilter === typeOpt.id
                      ? 'bg-[#D4AF37]/20 text-[#F2D675] border border-[#D4AF37]/40 shadow-sm'
                      : 'text-[#D8BE99] hover:text-white'
                  }`}
                >
                  {typeOpt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Filter Row: Search Input + Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search campaigns by name..."
              className="w-full bg-black/60 border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-[#F3E6D0] placeholder-[#D8BE99]/40 focus:outline-none transition-all shadow-inner"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setDebouncedSearch(''); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-end">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#D4AF37]" />
            <select
              value={`${selectedSort.sortBy}_${selectedSort.sortDescending}`}
              onChange={(e) => {
                const opt = SORT_OPTIONS.find(o => `${o.sortBy}_${o.sortDescending}` === e.target.value);
                if (opt) { setSelectedSort(opt); setPage(1); }
              }}
              className="bg-black/60 border border-[#D4AF37]/30 text-[#F3E6D0] rounded-xl px-3 py-2 text-xs font-cinzel uppercase focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={`${opt.sortBy}_${opt.sortDescending}`} value={`${opt.sortBy}_${opt.sortDescending}`} className="bg-[#0B0A08]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Promotions Table */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/25 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#D4AF37]/20 bg-black/60 font-cinzel text-xs text-[#F2D675] uppercase tracking-wider">
                <th className="py-4 px-4 sm:px-5">Campaign Name</th>
                <th className="py-4 px-3">Type</th>
                <th className="py-4 px-3">Offer / Value</th>
                <th className="py-4 px-3">Schedule</th>
                <th className="py-4 px-3">Usage</th>
                <th className="py-4 px-3">Status</th>
                <th className="py-4 px-4 sm:px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 bg-white/10 rounded w-36" /></td>
                    <td className="py-4 px-3"><div className="h-4 bg-white/10 rounded w-16" /></td>
                    <td className="py-4 px-3"><div className="h-4 bg-white/10 rounded w-14" /></td>
                    <td className="py-4 px-3"><div className="h-4 bg-white/10 rounded w-28" /></td>
                    <td className="py-4 px-3"><div className="h-4 bg-white/10 rounded w-12" /></td>
                    <td className="py-4 px-3"><div className="h-4 bg-white/10 rounded w-16" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-white/10 rounded w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : promotions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#D8BE99]">
                    <Sparkles className="w-8 h-8 text-[#D4AF37]/50 mx-auto mb-2" />
                    <p className="font-cinzel text-base text-[#F3E6D0] font-bold">No Promotions Found</p>
                    <p className="text-xs mt-1">Create your first royal promotion campaign to engage patrons.</p>
                  </td>
                </tr>
              ) : (
                promotions.map((promo) => {
                  const isDiscount = promo.type === 'Discount';
                  const isBundle = promo.type === 'Bundle';
                  const isActionRunning = actionLoadingId === promo.id;

                  return (
                    <tr key={promo.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Name */}
                      <td className="py-4 px-4 sm:px-5 font-sans">
                        <p className="font-cinzel font-bold text-[#F3E6D0] group-hover:text-[#F2D675] transition-colors">
                          {promo.name}
                        </p>
                        {promo.minOrderAmount ? (
                          <p className="text-[11px] text-[#D8BE99]/70 mt-0.5">
                            Min Spend: ${promo.minOrderAmount}
                          </p>
                        ) : null}
                      </td>

                      {/* Type Badge */}
                      <td className="py-4 px-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-cinzel font-bold uppercase tracking-wider border ${
                          isBundle
                            ? 'bg-purple-500/15 border-purple-500/35 text-purple-300'
                            : 'bg-amber-500/15 border-amber-500/35 text-amber-300'
                        }`}>
                          {isBundle ? <Package className="w-3 h-3" /> : <Tag className="w-3 h-3" />}
                          <span>{promo.type}</span>
                        </span>
                      </td>

                      {/* Value / Offer */}
                      <td className="py-4 px-3 font-mono font-bold text-[#F2D675]">
                        {isDiscount ? (
                          promo.discountType === 'Percentage'
                            ? `${promo.discountValue}% OFF`
                            : `$${promo.discountValue} OFF`
                        ) : (
                          <span className="text-xs font-sans text-[#D8BE99]">
                            {promo.bundlesCount > 0 ? `${promo.bundlesCount} Bundle Packs` : 'No Packs Yet'}
                          </span>
                        )}
                      </td>

                      {/* Schedule */}
                      <td className="py-4 px-3 text-xs text-[#D8BE99] space-y-0.5">
                        <p>{formatDateDisplay(promo.startDate)}</p>
                        <p className="text-[11px] text-[#D8BE99]/60">to {formatDateDisplay(promo.endDate)}</p>
                      </td>

                      {/* Usage */}
                      <td className="py-4 px-3 font-mono text-xs text-[#D8BE99]">
                        {promo.usageLimit !== null ? (
                          <span>{promo.usageCount} / {promo.usageLimit}</span>
                        ) : (
                          <span>{promo.usageCount} (Unlimited)</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-cinzel font-bold uppercase tracking-wider border ${
                          promo.status === 'Active'
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                            : promo.status === 'Scheduled'
                            ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                            : promo.status === 'Expired'
                            ? 'bg-neutral-500/15 border-neutral-500/40 text-neutral-400'
                            : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                        }`}>
                          {promo.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Bundle Builder quick add */}
                          {isBundle && (
                            <button
                              onClick={() => handleOpenBundleModal(promo)}
                              className="p-1.5 rounded-lg border border-purple-500/30 hover:border-purple-500 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 transition-all cursor-pointer"
                              title="Add Bundle Pack"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Analytics */}
                          <button
                            onClick={() => handleOpenAnalytics(promo)}
                            className="p-1.5 rounded-lg border border-[#D4AF37]/30 hover:border-[#D4AF37] bg-black/40 hover:bg-[#D4AF37]/15 text-[#D8BE99] hover:text-[#F2D675] transition-all cursor-pointer"
                            title="Campaign Analytics"
                          >
                            <BarChart3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Details */}
                          <button
                            onClick={() => handleOpenDetails(promo)}
                            className="p-1.5 rounded-lg border border-white/10 hover:border-[#D4AF37]/50 bg-white/5 hover:bg-white/10 text-[#D8BE99] hover:text-[#F3E6D0] transition-all cursor-pointer"
                            title="View Campaign Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(promo)}
                            disabled={isActionRunning}
                            className="p-1.5 rounded-lg border border-white/10 hover:border-[#D4AF37]/50 bg-white/5 hover:bg-white/10 text-[#D8BE99] hover:text-[#F2D675] transition-all cursor-pointer disabled:opacity-50"
                            title="Edit Campaign"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Active */}
                          <button
                            onClick={() => handleToggleActive(promo)}
                            disabled={isActionRunning}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-50 ${
                              promo.status === 'Active'
                                ? 'border-emerald-500/30 hover:border-rose-500/50 bg-emerald-500/10 hover:bg-rose-500/20 text-emerald-400 hover:text-rose-300'
                                : 'border-neutral-500/30 hover:border-emerald-500/50 bg-neutral-500/10 hover:bg-emerald-500/20 text-neutral-400 hover:text-emerald-300'
                            }`}
                            title={promo.status === 'Active' ? 'Deactivate' : 'Activate'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleOpenDelete(promo)}
                            disabled={isActionRunning}
                            className="p-1.5 rounded-lg border border-rose-500/20 hover:border-rose-500/50 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-all cursor-pointer disabled:opacity-50"
                            title="Delete Campaign"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="border-t border-[#D4AF37]/20 p-4 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-[#D8BE99] font-sans">
            Showing <span className="text-[#F2D675] font-mono">{promotions.length}</span> of <span className="text-[#F2D675] font-mono">{totalCount}</span> campaigns
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={!hasPreviousPage || loading}
              className="p-2 rounded-xl border border-[#D4AF37]/30 bg-black/60 text-[#D8BE99] hover:text-[#F2D675] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-cinzel text-xs text-[#D8BE99] px-2">
              Page <span className="text-[#F2D675] font-bold">{page}</span> of {totalPages}
            </span>

            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!hasNextPage || loading}
              className="p-2 rounded-xl border border-[#D4AF37]/30 bg-black/60 text-[#D8BE99] hover:text-[#F2D675] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE / EDIT PROMOTION FORM                                     */}
      {/* ========================================================================= */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#0B0A08] border border-[#D4AF37]/40 rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto my-auto text-[#F3E6D0]">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-cinzel text-lg sm:text-xl font-bold uppercase tracking-wider text-[#F3E6D0]">
                  {editingPromotion ? 'Edit Campaign' : 'Create Promotion Campaign'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFormModalOpen(false)}
                disabled={submittingForm}
                className="text-[#D8BE99] hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-sans">
              {/* Campaign Name */}
              <div>
                <label className="block text-xs font-cinzel text-[#F2D675] uppercase tracking-wider mb-1.5 font-bold">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Autumn Royal Extrait Festival"
                  className="w-full bg-black/60 border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#F3E6D0] focus:outline-none"
                />
              </div>

              {/* Promotion Type (Discount vs Bundle) */}
              <div>
                <label className="block text-xs font-cinzel text-[#F2D675] uppercase tracking-wider mb-1.5 font-bold">
                  Promotion Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'Discount', label: 'Discount Offer', desc: 'Direct percentage or fixed reduction', icon: Tag },
                    { id: 'Bundle', label: 'Bundle Suite', desc: 'Curated flacon sets with special bundle pricing', icon: Package }
                  ].map((typeItem) => {
                    const Icon = typeItem.icon;
                    const isSel = formData.type === typeItem.id;
                    return (
                      <button
                        key={typeItem.id}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, type: typeItem.id }))}
                        className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          isSel
                            ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#F2D675] shadow-md'
                            : 'border-[#D4AF37]/20 bg-black/40 text-[#D8BE99] hover:border-[#D4AF37]/40'
                        }`}
                      >
                        <Icon className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-cinzel font-bold text-xs uppercase">{typeItem.label}</p>
                          <p className="text-[11px] text-[#D8BE99]/70 mt-0.5">{typeItem.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Discount Type & Value (If Discount) */}
              {formData.type === 'Discount' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-black/40 p-4 rounded-xl border border-[#D4AF37]/20 animate-fade-in">
                  <div>
                    <label className="block text-xs font-cinzel text-[#F2D675] uppercase tracking-wider mb-1.5 font-bold">
                      Discount Type *
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData(p => ({ ...p, discountType: e.target.value }))}
                      className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-2.5 text-xs text-[#F3E6D0] focus:outline-none cursor-pointer"
                    >
                      <option value="Percentage">Percentage (%)</option>
                      <option value="Fixed">Fixed Amount ($)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-cinzel text-[#F2D675] uppercase tracking-wider mb-1.5 font-bold">
                      Discount Value *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max={formData.discountType === 'Percentage' ? '100' : '99999'}
                        required
                        value={formData.discountValue}
                        onChange={(e) => setFormData(p => ({ ...p, discountValue: e.target.value }))}
                        className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl pl-4 pr-10 py-2.5 font-mono text-xs sm:text-sm text-[#F3E6D0] focus:outline-none"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-[#D4AF37]">
                        {formData.discountType === 'Percentage' ? '%' : '$'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Start & End Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-cinzel text-[#F2D675] uppercase tracking-wider mb-1.5 font-bold">
                    Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-2.5 text-xs text-[#F3E6D0] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-cinzel text-[#F2D675] uppercase tracking-wider mb-1.5 font-bold">
                    End Date *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-2.5 text-xs text-[#F3E6D0] focus:outline-none"
                  />
                </div>
              </div>

              {/* Limits & Constraints */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-cinzel text-[#D8BE99] uppercase tracking-wider mb-1.5 font-bold">
                    Min Order Spend ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="None"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData(p => ({ ...p, minOrderAmount: e.target.value }))}
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl px-3.5 py-2 font-mono text-xs text-[#F3E6D0] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-cinzel text-[#D8BE99] uppercase tracking-wider mb-1.5 font-bold">
                    Max Discount Cap ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="None"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData(p => ({ ...p, maxDiscountAmount: e.target.value }))}
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl px-3.5 py-2 font-mono text-xs text-[#F3E6D0] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-cinzel text-[#D8BE99] uppercase tracking-wider mb-1.5 font-bold">
                    Usage Limit (Count)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData(p => ({ ...p, usageLimit: e.target.value }))}
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl px-3.5 py-2 font-mono text-xs text-[#F3E6D0] focus:outline-none"
                  />
                </div>
              </div>

              {/* Applicability / Targeting Rules */}
              <div className="border-t border-[#D4AF37]/20 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#F2D675]">
                      Applicability & Targeting Rules
                    </h4>
                    <p className="text-[11px] text-[#D8BE99]">
                      Target specific categories, perfume tiers, maisons, or flacons.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addApplicabilityRule}
                    className="px-3 py-1.5 rounded-lg border border-[#D4AF37]/40 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/30 text-[#F2D675] font-cinzel text-xs uppercase font-bold tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Rule</span>
                  </button>
                </div>

                {formData.applicability.length === 0 ? (
                  <p className="text-xs text-[#D8BE99]/60 italic py-2">
                    Applies globally to all flacons and creations in the palace catalogue.
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {formData.applicability.map((rule, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-black/60 p-2.5 rounded-xl border border-white/10">
                        {/* Target Type */}
                        <select
                          value={rule.targetType}
                          onChange={(e) => updateApplicabilityRule(idx, 'targetType', e.target.value)}
                          className="bg-[#0B0A08] border border-white/20 text-[#F3E6D0] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
                        >
                          {TARGET_TYPES.map(tt => (
                            <option key={tt.id} value={tt.id}>{tt.label}</option>
                          ))}
                        </select>

                        {/* Target Item Selector */}
                        <select
                          value={rule.targetId}
                          onChange={(e) => updateApplicabilityRule(idx, 'targetId', Number(e.target.value))}
                          className="bg-[#0B0A08] border border-white/20 text-[#F3E6D0] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none flex-1 cursor-pointer"
                        >
                          {rule.targetType === 'Category' && catalogCategories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                          {rule.targetType === 'Brand' && catalogBrands.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                          {rule.targetType === 'PerfumeCategory' && catalogPerfumeCats.map(pc => (
                            <option key={pc.id} value={pc.id}>{pc.name}</option>
                          ))}
                          {rule.targetType === 'Product' && catalogProducts.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                          ))}
                        </select>

                        {/* Excluded Toggle */}
                        <label className="flex items-center gap-1.5 text-[11px] text-[#D8BE99] cursor-pointer whitespace-nowrap px-1">
                          <input
                            type="checkbox"
                            checked={rule.isExcluded}
                            onChange={(e) => updateApplicabilityRule(idx, 'isExcluded', e.target.checked)}
                            className="rounded accent-[#D4AF37]"
                          />
                          <span>Exclude</span>
                        </label>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeApplicabilityRule(idx)}
                          className="text-neutral-400 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  disabled={submittingForm}
                  className="px-5 py-2 rounded-full border border-white/20 text-xs font-cinzel uppercase text-[#D8BE99] hover:text-white transition-all cursor-pointer font-bold disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] hover:from-[#F2D675] hover:via-[#D4AF37] hover:to-[#F2D675] text-white hover:text-black border border-[#F2D675]/50 font-cinzel font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingForm ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{editingPromotion ? 'Update Campaign' : 'Create Campaign'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: BUNDLE BUILDER (CREATE / EDIT BUNDLE PACK)                       */}
      {/* ========================================================================= */}
      {bundleModalOpen && bundleTargetPromo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#0B0A08] border border-purple-500/40 rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto my-auto text-[#F3E6D0]">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="font-cinzel text-lg font-bold uppercase tracking-wider text-[#F3E6D0]">
                    {editingBundle ? 'Edit Bundle Pack' : 'Build New Fragrance Bundle'}
                  </h3>
                  <p className="text-xs text-[#D8BE99]">
                    Campaign: <span className="text-[#F2D675] font-semibold">{bundleTargetPromo.name}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBundleModalOpen(false)}
                disabled={submittingBundle}
                className="text-[#D8BE99] hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBundleSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-xs font-cinzel text-[#F2D675] uppercase tracking-wider mb-1.5 font-bold">
                  Bundle Pack Name *
                </label>
                <input
                  type="text"
                  required
                  value={bundleFormData.name}
                  onChange={(e) => setBundleFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Royal Oud Sovereign Duet"
                  className="w-full bg-black/60 border border-purple-500/30 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#F3E6D0] focus:outline-none"
                />
              </div>

              {/* Products in Bundle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#F2D675]">
                    Included Flacons & Quantities *
                  </h4>
                  <button
                    type="button"
                    onClick={addBundleItem}
                    className="px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 font-cinzel text-xs uppercase font-bold tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Flacon</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                  {bundleFormData.items.map((item, idx) => {
                    const product = catalogProducts.find(p => Number(p.id) === Number(item.productId));
                    return (
                      <div key={idx} className="flex items-center gap-2.5 bg-black/60 p-3 rounded-xl border border-white/10">
                        {/* Product Selector */}
                        <select
                          value={item.productId}
                          onChange={(e) => updateBundleItem(idx, 'productId', Number(e.target.value))}
                          className="bg-[#0B0A08] border border-white/20 text-[#F3E6D0] rounded-lg px-3 py-2 text-xs focus:outline-none flex-1 cursor-pointer"
                        >
                          {catalogProducts.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} — ${p.price}
                            </option>
                          ))}
                        </select>

                        {/* Quantity */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-[#D8BE99]">Qty:</span>
                          <input
                            type="number"
                            min="1"
                            max="99"
                            required
                            value={item.quantity}
                            onChange={(e) => updateBundleItem(idx, 'quantity', Math.max(1, Number(e.target.value)))}
                            className="w-16 bg-[#0B0A08] border border-white/20 rounded-lg px-2.5 py-1.5 font-mono text-xs text-center text-[#F3E6D0] focus:outline-none"
                          />
                        </div>

                        {/* Line Total */}
                        <div className="font-mono text-xs text-[#F2D675] w-20 text-right">
                          ${((product?.price || 0) * item.quantity).toFixed(2)}
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeBundleItem(idx)}
                          className="text-neutral-400 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Pricing Summary Card */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-cinzel text-[#F2D675] uppercase tracking-wider mb-1 font-bold">
                      Special Bundle Price ($) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      required
                      value={bundleFormData.bundlePrice}
                      onChange={(e) => setBundleFormData(p => ({ ...p, bundlePrice: e.target.value }))}
                      className="w-full bg-black/80 border border-purple-500/40 rounded-xl px-4 py-2 font-mono text-sm text-[#F3E6D0] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-[#D8BE99]">
                      <span>Original Retail Value:</span>
                      <span className="font-mono line-through">${bundleOriginalTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Patron Savings:</span>
                      <span className="font-mono">${bundleSavings.toFixed(2)} ({bundleSavingsPercent}% OFF)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-purple-500/20">
                <button
                  type="button"
                  onClick={() => setBundleModalOpen(false)}
                  disabled={submittingBundle}
                  className="px-5 py-2 rounded-full border border-white/20 text-xs font-cinzel uppercase text-[#D8BE99] hover:text-white transition-all cursor-pointer font-bold disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingBundle}
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-800 via-purple-600 to-purple-800 hover:from-purple-600 hover:to-purple-500 text-white font-cinzel font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingBundle ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Bundle...</span>
                    </>
                  ) : (
                    <>
                      <Package className="w-3.5 h-3.5" />
                      <span>{editingBundle ? 'Save Changes' : 'Create Bundle'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PROMOTION DETAILS & BUNDLE SUITE MODAL                            */}
      {/* ========================================================================= */}
      {detailsModalOpen && viewingPromotion && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#0B0A08] border border-[#D4AF37]/40 rounded-2xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto my-auto text-[#F3E6D0]">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
              <div className="flex items-center gap-2.5">
                <Eye className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-cinzel text-lg sm:text-xl font-bold uppercase tracking-wider text-[#F3E6D0]">
                  Campaign Breakdown: {viewingPromotion.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="text-[#D8BE99] hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailsLoading ? (
              <div className="py-12 text-center text-[#D4AF37] space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                <p className="font-cinzel text-xs uppercase">Loading campaign details...</p>
              </div>
            ) : (
              <div className="space-y-6 text-xs font-sans">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/60 p-4 rounded-xl border border-white/10">
                  <div>
                    <p className="text-[#D8BE99] text-[11px] uppercase font-cinzel">Type</p>
                    <p className="font-bold text-[#F3E6D0] mt-0.5">{viewingPromotion.type}</p>
                  </div>
                  <div>
                    <p className="text-[#D8BE99] text-[11px] uppercase font-cinzel">Offer</p>
                    <p className="font-bold text-[#F2D675] font-mono mt-0.5">
                      {viewingPromotion.type === 'Discount'
                        ? (viewingPromotion.discountType === 'Percentage' ? `${viewingPromotion.discountValue}%` : `$${viewingPromotion.discountValue}`)
                        : 'Custom Bundle Pricing'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#D8BE99] text-[11px] uppercase font-cinzel">Status</p>
                    <p className="font-bold text-emerald-300 mt-0.5">{viewingPromotion.status}</p>
                  </div>
                  <div>
                    <p className="text-[#D8BE99] text-[11px] uppercase font-cinzel">Total Redemptions</p>
                    <p className="font-bold font-mono text-[#F3E6D0] mt-0.5">{viewingPromotion.usageCount}</p>
                  </div>
                </div>

                {/* Bundles Section (If Bundle Promotion) */}
                {viewingPromotion.type === 'Bundle' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#F2D675] flex items-center gap-2">
                        <Package className="w-4 h-4 text-purple-400" />
                        <span>Curated Bundle Packs ({viewingPromotion.bundles?.length || 0})</span>
                      </h4>
                      <button
                        onClick={() => {
                          setDetailsModalOpen(false);
                          handleOpenBundleModal(viewingPromotion);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 font-cinzel text-xs uppercase font-bold tracking-wider flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Bundle Pack</span>
                      </button>
                    </div>

                    {!viewingPromotion.bundles || viewingPromotion.bundles.length === 0 ? (
                      <div className="p-6 bg-black/40 rounded-xl border border-white/10 text-center text-[#D8BE99]">
                        No bundle packs configured yet. Click 'Add Bundle Pack' above to assemble one.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {viewingPromotion.bundles.map((b) => (
                          <div key={b.id} className="p-4 bg-black/60 rounded-xl border border-purple-500/30 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-cinzel text-sm font-bold text-[#F3E6D0]">{b.name}</h5>
                                <div className="flex items-center gap-3 text-xs mt-1">
                                  <span className="text-[#D8BE99]">Bundle Price: <strong className="text-[#F2D675] font-mono">${b.bundlePrice}</strong></span>
                                  <span className="text-[#D8BE99]">Original: <strong className="font-mono line-through">${b.individualItemsTotal}</strong></span>
                                  <span className="text-emerald-400 font-bold font-mono">Save ${b.savingsAmount} ({b.savingsPercentage}%)</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setDetailsModalOpen(false);
                                    handleOpenBundleModal(viewingPromotion, b);
                                  }}
                                  className="p-1.5 rounded-lg border border-white/10 hover:border-[#D4AF37] bg-white/5 text-[#D8BE99] hover:text-[#F2D675] cursor-pointer"
                                  title="Edit Bundle"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleOpenDeleteBundle(b, viewingPromotion)}
                                  className="p-1.5 rounded-lg border border-rose-500/20 hover:border-rose-500 bg-rose-500/10 text-rose-300 cursor-pointer"
                                  title="Delete Bundle"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Items in this bundle */}
                            <div className="divide-y divide-white/5 border-t border-white/10 pt-2">
                              {b.items?.map((item, iIdx) => (
                                <div key={iIdx} className="py-1.5 flex items-center justify-between text-xs text-[#D8BE99]">
                                  <span>{item.productName || `Product #${item.productId}`} (×{item.quantity})</span>
                                  <span className="font-mono text-[#F3E6D0]">${item.lineTotal || (item.unitPrice * item.quantity)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Targeting Rules */}
                <div className="space-y-2">
                  <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#F2D675]">
                    Applicability Rules ({viewingPromotion.applicability?.length || 0})
                  </h4>
                  {viewingPromotion.applicability?.length === 0 ? (
                    <p className="text-xs text-[#D8BE99]/70">Global Campaign (Applies to all products)</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {viewingPromotion.applicability.map((r, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
                          <span className="font-cinzel uppercase text-[#D8BE99]">{r.targetType}: #{r.targetId}</span>
                          <span className={`text-[11px] font-mono font-bold ${r.isExcluded ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {r.isExcluded ? 'EXCLUDED' : 'INCLUDED'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: PROMOTION ANALYTICS MODAL                                        */}
      {/* ========================================================================= */}
      {analyticsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0B0A08] border border-[#D4AF37]/40 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-[#F3E6D0]">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-cinzel text-lg font-bold uppercase tracking-wider text-[#F3E6D0]">
                  Campaign Analytics
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAnalyticsModalOpen(false)}
                className="text-[#D8BE99] hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {analyticsLoading || !analyticsData ? (
              <div className="py-8 text-center text-[#D4AF37] space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                <p className="font-cinzel text-xs uppercase">Computing metrics...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 bg-black/60 border border-white/10 rounded-xl space-y-0.5">
                  <p className="text-xs text-[#D8BE99]">Campaign</p>
                  <p className="font-cinzel font-bold text-sm text-[#F2D675]">{analyticsData.name || `Campaign #${analyticsData.promotionId}`}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-gradient-to-br from-[#1C160F] to-[#0B0A08] border border-[#D4AF37]/30 rounded-xl space-y-1 shadow-lg">
                    <p className="text-[11px] font-cinzel text-[#D8BE99] uppercase">Total Orders</p>
                    <p className="font-mono text-2xl font-bold text-[#F3E6D0]">{analyticsData.orders || 0}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-[#1C160F] to-[#0B0A08] border border-[#D4AF37]/30 rounded-xl space-y-1 shadow-lg">
                    <p className="text-[11px] font-cinzel text-[#D8BE99] uppercase">Total Discount Given</p>
                    <p className="font-mono text-2xl font-bold text-[#F2D675]">${(analyticsData.discountGiven || 0).toFixed(2)}</p>
                  </div>
                </div>

                <div className="p-3 bg-black/40 border border-white/10 rounded-xl text-xs text-[#D8BE99] flex items-center justify-between font-mono">
                  <span>Redemption Count:</span>
                  <span className="text-[#F3E6D0] font-bold">{analyticsData.promotionUsageCount || 0}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: DEACTIVATE REASON MODAL                                          */}
      {/* ========================================================================= */}
      {deactivateModalOpen && promoToDeactivate && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0B0A08] border border-amber-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-[#F3E6D0]">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-cinzel text-base font-bold uppercase tracking-wider text-[#F3E6D0]">
                Deactivate Campaign?
              </h3>
            </div>

            <p className="text-xs text-[#D8BE99] leading-relaxed">
              Are you sure you want to deactivate <strong className="text-[#F2D675]">"{promoToDeactivate.name}"</strong>? Patrons will no longer receive these promotional rates.
            </p>

            <div>
              <label className="block text-xs font-cinzel text-[#D8BE99] uppercase tracking-wider mb-1">
                Reason for deactivation (Optional)
              </label>
              <input
                type="text"
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                placeholder="e.g. Campaign ended early due to limited flacon stock"
                className="w-full bg-black/60 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-[#F3E6D0] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeactivateModalOpen(false)}
                disabled={deactivateLoading}
                className="px-4 py-2 rounded-full border border-white/20 text-xs font-cinzel uppercase text-[#D8BE99] hover:text-white cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDeactivate}
                disabled={deactivateLoading}
                className="px-5 py-2 rounded-full bg-amber-600 hover:bg-amber-500 text-black font-cinzel text-xs uppercase font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {deactivateLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Deactivate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: DELETE PROMOTION CONFIRMATION                                    */}
      {/* ========================================================================= */}
      {deleteModalOpen && promoToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0B0A08] border border-rose-500/40 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-[#F3E6D0]">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-cinzel text-lg font-bold uppercase tracking-wider text-[#F3E6D0]">
                Delete Campaign?
              </h3>
            </div>

            <p className="text-xs text-[#D8BE99] leading-relaxed">
              Are you sure you want to permanently remove <strong className="text-[#F2D675]">"{promoToDelete.name}"</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleteLoading}
                className="px-5 py-2 rounded-full border border-white/20 text-xs font-cinzel uppercase text-[#D8BE99] hover:text-white cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-cinzel text-xs uppercase font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {deleteLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete Campaign</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: 409 USAGE HISTORY CONFLICT MODAL                                 */}
      {/* ========================================================================= */}
      {conflictModalOpen && conflictPromo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0B0A08] border border-amber-500/50 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-[#F3E6D0]">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-cinzel text-base font-bold uppercase tracking-wider text-[#F3E6D0]">
                Campaign Has Order History
              </h3>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed">
              <strong>"{conflictPromo.name}"</strong> has already been used in completed patron orders and cannot be permanently deleted to preserve historical ledger integrity.
            </div>

            <p className="text-xs text-[#D8BE99]">
              Would you like to deactivate this campaign instead to immediately halt all future redemptions?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConflictModalOpen(false)}
                className="px-4 py-2 rounded-full border border-white/20 text-xs font-cinzel uppercase text-[#D8BE99] hover:text-white cursor-pointer"
              >
                Dismiss
              </button>

              <button
                type="button"
                onClick={async () => {
                  setConflictModalOpen(false);
                  try {
                    await promotionService.deactivatePromotion(conflictPromo.id, 'Deactivated due to historical orders constraint');
                    success(`Promotion '${conflictPromo.name}' deactivated.`);
                    fetchPromotions();
                  } catch (err) {
                    error(err.message || 'Failed to deactivate.');
                  }
                }}
                className="px-5 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-cinzel font-bold text-xs uppercase tracking-wider shadow-lg cursor-pointer"
              >
                Deactivate Instead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: DELETE BUNDLE CONFIRMATION                                       */}
      {/* ========================================================================= */}
      {deleteBundleModalOpen && bundleToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0B0A08] border border-rose-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-[#F3E6D0]">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-cinzel text-base font-bold uppercase tracking-wider text-[#F3E6D0]">
                Delete Bundle Pack?
              </h3>
            </div>

            <p className="text-xs text-[#D8BE99] leading-relaxed">
              Are you sure you want to remove <strong className="text-[#F2D675]">"{bundleToDelete.name}"</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteBundleModalOpen(false)}
                disabled={deleteBundleLoading}
                className="px-4 py-2 rounded-full border border-white/20 text-xs font-cinzel uppercase text-[#D8BE99] hover:text-white cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteBundle}
                disabled={deleteBundleLoading}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-cinzel text-xs uppercase font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {deleteBundleLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Delete Bundle</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
