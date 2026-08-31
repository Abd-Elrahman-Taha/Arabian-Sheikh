import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { discountService } from '../../services/discountService';
import { productApi } from '../../api/product.api';
import { brandApi } from '../../api/brand.api';
import { productService } from '../../services/productService';
import { useToast } from '../../context/ToastContext';
import {
  Plus,
  Search,
  X,
  Tag,
  Copy,
  Check,
  Edit2,
  Trash2,
  Eye,
  BarChart3,
  Clock,
  Sparkles,
  Layers,
  Building2,
  Crown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Power,
  ArrowUpDown,
  SlidersHorizontal,
  Info,
  AlertTriangle,
  ShoppingBag,
  TrendingUp
} from 'lucide-react';

const STATUS_TABS = [
  { id: 'ALL', label: 'All Coupons' },
  { id: 'Active', label: 'Active' },
  { id: 'Inactive', label: 'Inactive' },
  { id: 'Expired', label: 'Expired' },
  { id: 'Depleted', label: 'Depleted' }
];

const SORT_OPTIONS = [
  { label: 'Newest First', sortBy: 'CreatedAt', sortDescending: true },
  { label: 'Oldest First', sortBy: 'CreatedAt', sortDescending: false },
  { label: 'Code (A - Z)', sortBy: 'Code', sortDescending: false },
  { label: 'Code (Z - A)', sortBy: 'Code', sortDescending: true },
  { label: 'Start Date', sortBy: 'StartDate', sortDescending: false },
  { label: 'End Date', sortBy: 'EndDate', sortDescending: false },
  { label: 'Most Used', sortBy: 'UsageCount', sortDescending: true }
];

const TARGET_TYPES = [
  { id: 'Category', label: 'Product Category', icon: Layers },
  { id: 'Brand', label: 'Maison / Brand', icon: Building2 },
  { id: 'PerfumeCategory', label: 'Perfume Tier', icon: Crown },
  { id: 'Product', label: 'Specific Flacon', icon: Tag },
  { id: 'Subcategory', label: 'Subcategory', icon: Layers }
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

export default function AdminDiscounts() {
  const { t } = useTranslation();
  const { success, error, info } = useToast();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSort, setSelectedSort] = useState(SORT_OPTIONS[0]);
  const [copiedCode, setCopiedCode] = useState(null);

  const [catalogCategories, setCatalogCategories] = useState([]);
  const [catalogBrands, setCatalogBrands] = useState([]);
  const [catalogPerfumeCats, setCatalogPerfumeCats] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [viewingCoupon, setViewingCoupon] = useState(null);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [conflictCoupon, setConflictCoupon] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    type: 'Percentage',
    value: 20,
    startDate: '',
    endDate: '',
    isUnlimitedUsage: true,
    usageLimit: 100,
    minOrderAmount: '',
    maxDiscountAmount: '',
    allowOnDiscountedItems: true,
    isActive: true,
    applicability: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [submittingForm, setSubmittingForm] = useState(false);

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
        console.warn('Catalog metadata warning:', err);
      }
    }
    loadCatalogMeta();
    return () => { isMounted = false; };
  }, []);

  const fetchCoupons = useCallback(async () => {
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

      const result = await discountService.getCoupons(params);
      setCoupons(result?.items || []);
      setTotalCount(result?.totalCount || 0);
      setTotalPages(result?.totalPages || 1);
      setHasPreviousPage(Boolean(result?.hasPreviousPage));
      setHasNextPage(Boolean(result?.hasNextPage));
    } catch (err) {
      console.warn('Coupon fetch error:', err.message);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, statusFilter, selectedSort]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    info(`Coupon code '${code}' copied.`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleOpenCreate = () => {
    const now = new Date();
    const future = new Date();
    future.setMonth(future.getMonth() + 3);

    setEditingCoupon(null);
    setFormData({
      code: '',
      type: 'Percentage',
      value: 20,
      startDate: toLocalInputDateTime(now.toISOString()),
      endDate: toLocalInputDateTime(future.toISOString()),
      isUnlimitedUsage: true,
      usageLimit: 100,
      minOrderAmount: '',
      maxDiscountAmount: '',
      allowOnDiscountedItems: true,
      isActive: true,
      applicability: []
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  const handleOpenEdit = async (coupon) => {
    try {
      setActionLoadingId(coupon.id);
      const details = await discountService.getCouponById(coupon.id);
      const activeData = details || coupon;
      setEditingCoupon(activeData);
      setFormData({
        code: activeData.code || '',
        type: activeData.type || 'Percentage',
        value: activeData.value || 0,
        startDate: toLocalInputDateTime(activeData.startDate),
        endDate: toLocalInputDateTime(activeData.endDate),
        isUnlimitedUsage: activeData.usageLimit === null || activeData.usageLimit === undefined,
        usageLimit: activeData.usageLimit || 100,
        minOrderAmount: activeData.minOrderAmount !== null && activeData.minOrderAmount !== undefined ? activeData.minOrderAmount : '',
        maxDiscountAmount: activeData.maxDiscountAmount !== null && activeData.maxDiscountAmount !== undefined ? activeData.maxDiscountAmount : '',
        allowOnDiscountedItems: Boolean(activeData.allowOnDiscountedItems),
        isActive: Boolean(activeData.isActive),
        applicability: Array.isArray(activeData.applicability) ? activeData.applicability : []
      });
      setFormErrors({});
      setFormModalOpen(true);
    } catch (err) {
      error(err.message || 'Failed to load coupon details.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenDetails = async (coupon) => {
    try {
      setActionLoadingId(coupon.id);
      const details = await discountService.getCouponById(coupon.id);
      setViewingCoupon(details || coupon);
      setDetailsModalOpen(true);
    } catch {
      setViewingCoupon(coupon);
      setDetailsModalOpen(true);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenAnalytics = async (coupon) => {
    setAnalyticsModalOpen(true);
    setAnalyticsLoading(true);
    setAnalyticsData({ couponId: coupon.id, code: coupon.code, totalOrders: 0, totalDiscountGiven: 0 });
    try {
      const data = await discountService.getCouponAnalytics(coupon.id);
      setAnalyticsData(data);
    } catch (err) {
      error(err.message || 'Failed to load performance metrics.');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleToggleActivate = async (coupon) => {
    const isActivating = !coupon.isActive;
    setActionLoadingId(coupon.id);
    try {
      if (isActivating) await discountService.activateCoupon(coupon.id);
      else await discountService.deactivateCoupon(coupon.id);
      success(`Coupon '${coupon.code}' ${isActivating ? 'activated' : 'deactivated'}.`);
      fetchCoupons();
    } catch (err) {
      error(err.message || 'Failed to update coupon status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenDelete = (coupon) => {
    setCouponToDelete(coupon);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;
    setDeleteLoading(true);
    try {
      await discountService.deleteCoupon(couponToDelete.id);
      success(`Coupon '${couponToDelete.code}' deleted.`);
      setDeleteModalOpen(false);
      setCouponToDelete(null);
      fetchCoupons();
    } catch (err) {
      setDeleteModalOpen(false);
      if (err.status === 409 || String(err.message).toLowerCase().includes('usage history')) {
        setConflictCoupon(couponToDelete);
        setConflictModalOpen(true);
      } else {
        error(err.message || 'Failed to delete coupon.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConflictDeactivate = async () => {
    if (!conflictCoupon) return;
    setDeleteLoading(true);
    try {
      await discountService.deactivateCoupon(conflictCoupon.id);
      success(`Coupon '${conflictCoupon.code}' deactivated instead.`);
      setConflictModalOpen(false);
      setConflictCoupon(null);
      fetchCoupons();
    } catch (err) {
      error(err.message || 'Failed to deactivate coupon.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.code.trim()) {
      errs.code = 'Coupon code is required.';
    } else if (!/^[A-Za-z0-9_-]{2,30}$/.test(formData.code.trim())) {
      errs.code = 'Code must be 2-30 alphanumeric characters.';
    }

    const numVal = Number(formData.value);
    if (isNaN(numVal) || numVal <= 0) {
      errs.value = 'Discount value must be greater than 0.';
    } else if (formData.type === 'Percentage' && numVal > 100) {
      errs.value = 'Percentage cannot exceed 100%.';
    }

    if (!formData.startDate) errs.startDate = 'Start date is required.';
    if (!formData.endDate) errs.endDate = 'End date is required.';

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        errs.endDate = 'End date must be later than Start date.';
      }
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmittingForm(true);
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        type: formData.type === 'Fixed' ? 'Fixed' : 'Percentage',
        value: Number(formData.value),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        usageLimit: formData.isUnlimitedUsage ? null : Number(formData.usageLimit),
        minOrderAmount: formData.minOrderAmount !== '' ? Number(formData.minOrderAmount) : null,
        maxDiscountAmount: formData.type === 'Percentage' && formData.maxDiscountAmount !== '' ? Number(formData.maxDiscountAmount) : null,
        allowOnDiscountedItems: Boolean(formData.allowOnDiscountedItems),
        isActive: Boolean(formData.isActive),
        applicability: formData.applicability.map(rule => ({
          targetType: rule.targetType,
          targetId: Number(rule.targetId),
          isExcluded: Boolean(rule.isExcluded)
        }))
      };

      if (editingCoupon) {
        await discountService.updateCoupon(editingCoupon.id, payload);
        success(`Coupon '${payload.code}' updated successfully.`);
      } else {
        await discountService.createCoupon(payload);
        success(`Coupon '${payload.code}' created successfully.`);
      }

      setFormModalOpen(false);
      fetchCoupons();
    } catch (err) {
      if (err.status === 409 || err.code === 'COUPON_CODE_ALREADY_EXISTS') {
        setFormErrors(prev => ({ ...prev, code: 'This coupon code already exists.' }));
      } else {
        error(err.message || 'Failed to save coupon.');
      }
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleAddRule = () => {
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

  const handleUpdateRule = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.applicability];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, applicability: updated };
    });
  };

  const handleRemoveRule = (index) => {
    setFormData(prev => ({
      ...prev,
      applicability: prev.applicability.filter((_, i) => i !== index)
    }));
  };

  const renderTargetName = (type, id) => {
    const nid = Number(id);
    if (type === 'Category') return catalogCategories.find(c => Number(c.id) === nid)?.name || `Category #${nid}`;
    if (type === 'Brand') return catalogBrands.find(b => Number(b.id) === nid)?.name || `Brand #${nid}`;
    if (type === 'PerfumeCategory') return catalogPerfumeCats.find(p => Number(p.id) === nid)?.name || `Tier #${nid}`;
    if (type === 'Product') return catalogProducts.find(p => Number(p.id) === nid || Number(p.numericId) === nid)?.name || `Product #${nid}`;
    return `${type} #${nid}`;
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#F3E6D0]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-[#D4AF37]/20 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Tag className="w-5 h-5 text-[#D4AF37]" />
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0]">
              {t('admin.discounts') || 'Coupons & Privileges'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#D8BE99] font-medium">
            Manage promotional codes, eligibility rules, usage quotas, and coupon lifecycles.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-auto">
          <button
            onClick={fetchCoupons}
            disabled={loading}
            className="p-2.5 rounded-xl border border-[#D4AF37]/30 bg-black/40 hover:bg-black/70 text-[#D8BE99] hover:text-[#F2D675] transition-all cursor-pointer shadow-sm"
            title="Refresh coupons"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="group/btn relative px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] hover:from-[#F2D675] hover:via-[#D4AF37] hover:to-[#F2D675] text-white hover:text-black border border-[#F2D675]/50 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
            <span>{t('admin.createDiscount') || 'Create Coupon'}</span>
          </button>
        </div>
      </div>

      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_TABS.map(tab => {
            const isSelected = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setStatusFilter(tab.id); setPage(1); }}
                className={`px-4 py-2 rounded-full text-xs font-cinzel font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'border-[#D4AF37] bg-[#D4AF37] text-black shadow-md'
                    : 'border-[#D4AF37]/20 bg-black/40 text-[#D8BE99] hover:text-[#F3E6D0] hover:border-[#D4AF37]/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-[#D4AF37]/15">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by coupon code (e.g. VIP25, SUMMER)..."
              className="w-full bg-black/50 border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-xl pl-10 pr-10 py-2 text-xs sm:text-sm font-cinzel text-[#F3E6D0] placeholder-[#D8BE99]/40 focus:outline-none transition-all shadow-inner"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setDebouncedSearch(''); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D8BE99] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="md:col-span-4 relative">
            <ArrowUpDown className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={SORT_OPTIONS.findIndex(s => s.sortBy === selectedSort.sortBy && s.sortDescending === selectedSort.sortDescending)}
              onChange={(e) => {
                const idx = Number(e.target.value);
                setSelectedSort(SORT_OPTIONS[idx] || SORT_OPTIONS[0]);
                setPage(1);
              }}
              className="w-full bg-black/50 border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-xl pl-10 pr-8 py-2 text-xs sm:text-sm font-sans text-[#F3E6D0] focus:outline-none transition-all cursor-pointer appearance-none"
            >
              {SORT_OPTIONS.map((opt, idx) => (
                <option key={idx} value={idx} className="bg-[#0B0A08] text-[#F3E6D0]">
                  Sort: {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 relative">
            <SlidersHorizontal className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="w-full bg-black/50 border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-xl pl-10 pr-6 py-2 text-xs sm:text-sm font-sans text-[#F3E6D0] focus:outline-none transition-all cursor-pointer appearance-none"
            >
              <option value={10} className="bg-[#0B0A08] text-[#F3E6D0]">10 / page</option>
              <option value={20} className="bg-[#0B0A08] text-[#F3E6D0]">20 / page</option>
              <option value={50} className="bg-[#0B0A08] text-[#F3E6D0]">50 / page</option>
              <option value={100} className="bg-[#0B0A08] text-[#F3E6D0]">100 / page</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#D4AF37]/25 bg-black/60 font-cinzel text-[11px] uppercase tracking-wider text-[#F2D675]">
                <th className="py-4 px-4 sm:px-6">Privilege Code</th>
                <th className="py-4 px-4">Discount</th>
                <th className="py-4 px-4 hidden md:table-cell">Validity Period</th>
                <th className="py-4 px-4">Usage Limit</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/15">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-5 px-4 sm:px-6"><div className="h-4 bg-white/10 rounded w-28" /></td>
                    <td className="py-5 px-4"><div className="h-4 bg-white/10 rounded w-16" /></td>
                    <td className="py-5 px-4 hidden md:table-cell"><div className="h-4 bg-white/10 rounded w-36" /></td>
                    <td className="py-5 px-4"><div className="h-4 bg-white/10 rounded w-20" /></td>
                    <td className="py-5 px-4"><div className="h-4 bg-white/10 rounded w-16" /></td>
                    <td className="py-5 px-4 sm:px-6 text-right"><div className="h-4 bg-white/10 rounded w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-[#D8BE99] space-y-3">
                    <Sparkles className="w-8 h-8 text-[#D4AF37] mx-auto opacity-50" />
                    <p className="font-cinzel text-base font-bold text-[#F3E6D0]">No Coupons Found</p>
                    <p className="text-xs max-w-sm mx-auto opacity-80">
                      {search || statusFilter !== 'ALL'
                        ? 'No coupons match your active filters. Try clearing your search or status selection.'
                        : 'No privilege coupons have been created yet. Click "+ Create Coupon" above to issue one.'}
                    </p>
                    {(search || statusFilter !== 'ALL') && (
                      <button
                        onClick={() => { setSearch(''); setDebouncedSearch(''); setStatusFilter('ALL'); setPage(1); }}
                        className="px-4 py-1.5 rounded-full border border-[#D4AF37]/40 text-xs font-cinzel text-[#F2D675] hover:bg-[#D4AF37]/20 transition-all cursor-pointer font-bold mt-2"
                      >
                        Reset All Filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const isPercentage = coupon.type === 'Percentage';
                  const isExpired = coupon.status === 'Expired';
                  const isDepleted = coupon.status === 'Depleted';
                  const isActionBusy = actionLoadingId === coupon.id;

                  return (
                    <tr key={coupon.id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm tracking-wider text-[#F2D675] bg-black/60 px-2.5 py-1 rounded border border-[#D4AF37]/30 group-hover:border-[#D4AF37] transition-all">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            className="p-1 text-[#D8BE99] hover:text-[#F2D675] transition-colors cursor-pointer"
                            title="Copy code"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-cinzel font-bold text-sm text-[#F3E6D0]">
                            {isPercentage ? `${coupon.value}%` : `€${coupon.value}`}
                          </span>
                          <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${
                            isPercentage
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                              : 'bg-orange-500/10 border-orange-500/30 text-orange-300'
                          }`}>
                            {coupon.type}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell text-xs text-[#D8BE99]">
                        <div className="flex items-center gap-1.5 font-mono">
                          <Clock className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                          <span>{formatDateDisplay(coupon.startDate)}</span>
                          <span className="text-white/40">→</span>
                          <span className={isExpired ? 'text-amber-400 font-bold' : ''}>
                            {formatDateDisplay(coupon.endDate)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs">
                        <div className="space-y-1">
                          <span className="text-[#F3E6D0] font-bold">
                            {coupon.usageCount} <span className="text-[#D8BE99]/60">/ {coupon.usageLimit !== null ? coupon.usageLimit : '∞'}</span>
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold border ${
                          coupon.isActive && !isExpired && !isDepleted
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                            : isExpired
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                            : isDepleted
                            ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                            : 'bg-neutral-500/15 border-neutral-500/40 text-neutral-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            coupon.isActive && !isExpired && !isDepleted
                              ? 'bg-emerald-400 animate-pulse'
                              : isExpired
                              ? 'bg-amber-400'
                              : isDepleted
                              ? 'bg-rose-400'
                              : 'bg-neutral-400'
                          }`} />
                          {coupon.status || (coupon.isActive ? 'Active' : 'Inactive')}
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetails(coupon)}
                            disabled={isActionBusy}
                            className="p-1.5 text-[#D8BE99] hover:text-[#F2D675] bg-white/5 hover:bg-white/10 rounded-lg transition-all cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenAnalytics(coupon)}
                            disabled={isActionBusy}
                            className="p-1.5 text-[#D8BE99] hover:text-[#F2D675] bg-white/5 hover:bg-white/10 rounded-lg transition-all cursor-pointer"
                            title="View Analytics"
                          >
                            <BarChart3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(coupon)}
                            disabled={isActionBusy}
                            className="p-1.5 text-[#D8BE99] hover:text-[#F2D675] bg-white/5 hover:bg-white/10 rounded-lg transition-all cursor-pointer"
                            title="Edit Coupon"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleActivate(coupon)}
                            disabled={isActionBusy}
                            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                              coupon.isActive
                                ? 'text-emerald-400 hover:text-amber-400 bg-emerald-500/10 hover:bg-amber-500/10'
                                : 'text-neutral-400 hover:text-emerald-400 bg-white/5 hover:bg-emerald-500/10'
                            }`}
                            title={coupon.isActive ? 'Deactivate Coupon' : 'Activate Coupon'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(coupon)}
                            disabled={isActionBusy}
                            className="p-1.5 text-rose-400/80 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-all cursor-pointer"
                            title="Delete Coupon"
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

        <div className="border-t border-[#D4AF37]/20 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#D8BE99] bg-black/40">
          <div>
            Showing{' '}
            <span className="font-bold text-[#F3E6D0]">
              {coupons.length > 0 ? (page - 1) * pageSize + 1 : 0}
            </span>
            –
            <span className="font-bold text-[#F3E6D0]">
              {Math.min(page * pageSize, totalCount)}
            </span>{' '}
            of <span className="font-bold text-[#F2D675]">{totalCount}</span> privilege coupons
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={!hasPreviousPage || loading}
              className="px-3 py-1.5 rounded-lg border border-[#D4AF37]/30 bg-black/50 text-[#F3E6D0] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all flex items-center gap-1 cursor-pointer font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg text-[#F2D675] font-bold">
              Page {page} of {totalPages || 1}
            </span>

            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!hasNextPage || loading}
              className="px-3 py-1.5 rounded-lg border border-[#D4AF37]/30 bg-black/50 text-[#F3E6D0] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all flex items-center gap-1 cursor-pointer font-bold"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {formModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#0B0A08] border border-[#D4AF37]/40 rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
              <div className="flex items-center gap-2.5">
                <Tag className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-cinzel text-lg sm:text-xl font-bold uppercase tracking-wider text-[#F3E6D0]">
                  {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Issue New Privilege Coupon'}
                </h3>
              </div>
              <button
                onClick={() => setFormModalOpen(false)}
                className="text-[#D8BE99] hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-cinzel text-[#F2D675] uppercase tracking-wider mb-1.5 font-bold">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. VIP25"
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-2.5 font-mono text-sm uppercase text-[#F3E6D0]"
                  />
                  {formErrors.code && <p className="text-rose-400 text-xs mt-1">{formErrors.code}</p>}
                </div>
                <div>
                  <label className="block text-xs font-cinzel text-[#F2D675] uppercase tracking-wider mb-1.5 font-bold">Discount Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))}
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-2.5 font-sans text-sm text-[#F3E6D0]"
                  >
                    <option value="Percentage">Percentage Discount (%)</option>
                    <option value="Fixed">Fixed Amount Discount (€)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-cinzel text-[#F2D675] uppercase tracking-wider mb-1.5 font-bold">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData(p => ({ ...p, value: e.target.value }))}
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-2.5 font-mono text-sm text-[#F3E6D0]"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-cinzel text-[#F2D675] uppercase tracking-wider font-bold">Usage Quota</label>
                    <label className="flex items-center gap-1.5 text-xs text-[#D8BE99] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isUnlimitedUsage}
                        onChange={(e) => setFormData(p => ({ ...p, isUnlimitedUsage: e.target.checked }))}
                        className="rounded border-[#D4AF37]/40 text-[#D4AF37] focus:ring-0"
                      />
                      <span>Unlimited</span>
                    </label>
                  </div>
                  <input
                    type="number"
                    min="1"
                    disabled={formData.isUnlimitedUsage}
                    value={formData.isUnlimitedUsage ? '' : formData.usageLimit}
                    onChange={(e) => setFormData(p => ({ ...p, usageLimit: e.target.value }))}
                    placeholder={formData.isUnlimitedUsage ? 'Unlimited' : 'e.g. 200'}
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-2.5 font-mono text-sm text-[#F3E6D0] disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-cinzel text-[#F2D675] uppercase tracking-wider mb-1.5 font-bold">Start Date *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-2.5 font-mono text-sm text-[#F3E6D0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-cinzel text-[#F2D675] uppercase tracking-wider mb-1.5 font-bold">End Date *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl px-4 py-2.5 font-mono text-sm text-[#F3E6D0]"
                  />
                </div>
              </div>

              <div className="border border-[#D4AF37]/30 rounded-xl p-4 bg-black/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-cinzel text-xs uppercase tracking-wider text-[#F2D675] font-bold">Eligibility Rules</h4>
                  <button
                    type="button"
                    onClick={handleAddRule}
                    className="px-3 py-1.5 rounded-lg border border-[#D4AF37]/50 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/25 text-[#F2D675] font-cinzel text-xs uppercase font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Rule</span>
                  </button>
                </div>

                {formData.applicability.map((rule, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-black/60 p-2.5 rounded-lg border border-white/10 text-xs">
                    <select
                      value={rule.targetType}
                      onChange={(e) => handleUpdateRule(idx, 'targetType', e.target.value)}
                      className="bg-[#0B0A08] border border-[#D4AF37]/30 rounded-lg px-2.5 py-1.5 text-xs text-[#F3E6D0]"
                    >
                      {TARGET_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>

                    <div className="flex-1">
                      {rule.targetType === 'Category' ? (
                        <select value={rule.targetId} onChange={(e) => handleUpdateRule(idx, 'targetId', Number(e.target.value))} className="w-full bg-[#0B0A08] border border-[#D4AF37]/30 rounded-lg px-2.5 py-1.5 text-xs text-[#F3E6D0]">
                          {catalogCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                      ) : (
                        <input type="number" min="1" value={rule.targetId} onChange={(e) => handleUpdateRule(idx, 'targetId', Number(e.target.value))} className="w-full bg-[#0B0A08] border border-[#D4AF37]/30 rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#F3E6D0]" />
                      )}
                    </div>

                    <select
                      value={rule.isExcluded ? 'Exclude' : 'Include'}
                      onChange={(e) => handleUpdateRule(idx, 'isExcluded', e.target.value === 'Exclude')}
                      className={`border rounded-lg px-2.5 py-1.5 text-xs font-bold ${rule.isExcluded ? 'bg-rose-950/40 border-rose-500/50 text-rose-300' : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'}`}
                    >
                      <option value="Include">Included</option>
                      <option value="Exclude">Excluded</option>
                    </select>
                    <button type="button" onClick={() => handleRemoveRule(idx)} className="p-1.5 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D4AF37]/20">
                <button type="button" onClick={() => setFormModalOpen(false)} className="px-5 py-2.5 rounded-full border border-white/20 bg-white/5 text-[#D8BE99] font-cinzel text-xs uppercase font-bold cursor-pointer">Cancel</button>
                <button type="submit" disabled={submittingForm} className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] text-white font-cinzel text-xs uppercase font-bold cursor-pointer">
                  {editingCoupon ? 'Save Changes' : 'Issue Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
