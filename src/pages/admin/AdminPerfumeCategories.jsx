import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import { perfumeCategoryService } from '../../services/perfumeCategoryService';
import {
  Sparkles,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Euro
} from 'lucide-react';

export default function AdminPerfumeCategories() {
  const { success, error } = useToast();

  const [tiers, setTiers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');

  // Client-side instant sorting guarantee across all attributes
  const sortedTiers = useMemo(() => {
    if (!Array.isArray(tiers)) return [];
    return [...tiers].sort((a, b) => {
      let res = 0;
      if (sortBy === 'name') {
        res = String(a.name || '').localeCompare(String(b.name || ''));
      } else if (sortBy === 'price') {
        res = (Number(a.price) || 0) - (Number(b.price) || 0);
      } else {
        res = (Number(a.id) || 0) - (Number(b.id) || 0);
      }
      return sortDirection === 'desc' ? -res : res;
    });
  }, [tiers, sortBy, sortDirection]);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [deletingTier, setDeletingTier] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch perfume pricing tiers
  const fetchTiers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await perfumeCategoryService.getAdminPerfumeCategories({
        page,
        pageSize,
        search: search.trim() || undefined,
        sortBy,
        sortDirection
      });
      setTiers(data.items || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      error(err.message || 'Failed to load perfume pricing tiers.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, sortBy, sortDirection, error]);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  const handleClearFilters = () => {
    setSearch('');
    setSortBy('id');
    setSortDirection('asc');
    setPage(1);
  };

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      price: '',
      notes: ''
    });
    setFormErrors({});
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (tier) => {
    setEditingTier(tier);
    setFormData({
      name: tier.name || '',
      price: tier.price !== undefined && tier.price !== null ? String(tier.price) : '',
      notes: tier.notes || ''
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name || !formData.name.trim()) {
      errs.name = 'Pricing tier name is required.';
    } else if (formData.name.trim().length > 100) {
      errs.name = 'Name cannot exceed 100 characters.';
    }

    const priceNum = Number(formData.price);
    if (formData.price === '' || isNaN(priceNum) || priceNum < 0) {
      errs.price = 'Please provide a valid non-negative price.';
    }

    if (formData.notes && formData.notes.trim().length > 500) {
      errs.notes = 'Notes cannot exceed 500 characters.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setActionLoading(true);
    try {
      await perfumeCategoryService.createPerfumeCategory({
        name: formData.name.trim(),
        price: Number(formData.price),
        notes: formData.notes ? formData.notes.trim() : null
      });
      success(`Pricing Tier '${formData.name}' created successfully.`);
      setCreateModalOpen(false);
      fetchTiers();
    } catch (err) {
      error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingTier || !validateForm()) return;
    setActionLoading(true);
    try {
      await perfumeCategoryService.updatePerfumeCategory(editingTier.id, {
        name: formData.name.trim(),
        price: Number(formData.price),
        notes: formData.notes ? formData.notes.trim() : null
      });
      success(`Pricing Tier '${formData.name}' updated successfully.`);
      setEditingTier(null);
      fetchTiers();
    } catch (err) {
      error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTier) return;
    setActionLoading(true);
    try {
      await perfumeCategoryService.deletePerfumeCategory(deletingTier.id);
      success(`Pricing Tier '${deletingTier.name}' deleted successfully.`);
      setDeletingTier(null);
      fetchTiers();
    } catch (err) {
      error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#F3E6D0]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D4AF37]/20 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-black border border-[#D4AF37]/40 text-[#F2D675]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0]">
              Perfume Pricing Tiers
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#D8BE99] font-medium mt-1">
            Global pricing tiers for all fragrance catalog items. Perfumes inherit prices directly from tiers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTiers}
            disabled={loading}
            className="p-2.5 rounded-xl bg-black/60 hover:bg-[#21130D] border border-[#D4AF37]/30 text-[#D8BE99] hover:text-[#F2D675] transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Pricing Tiers"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#F2D675] hover:brightness-110 text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Pricing Tier</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/25 rounded-2xl p-4 shadow-xl backdrop-blur-md grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#D8BE99]/60" />
          <input
            type="text"
            placeholder="Search tiers by name or notes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2 pl-9 pr-3 text-xs text-[#F3E6D0] placeholder-[#D8BE99]/40 focus:border-[#D4AF37] focus:outline-none"
          />
        </div>

        {/* Sort Controls */}
        <div className="sm:col-span-6 flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
          >
            <option value="id" className="bg-[#120B06]">Sort by ID</option>
            <option value="name" className="bg-[#120B06]">Sort by Name</option>
            <option value="price" className="bg-[#120B06]">Sort by Price</option>
          </select>

          <button
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 rounded-xl bg-black/60 border border-[#D4AF37]/30 text-[#D8BE99] hover:text-[#F2D675] text-xs font-mono cursor-pointer"
            title="Toggle sort direction"
          >
            {sortDirection.toUpperCase()}
          </button>

          <button
            onClick={handleClearFilters}
            className="p-2 rounded-xl bg-black/60 hover:bg-[#21130D] border border-[#D4AF37]/30 text-[#D8BE99] hover:text-[#F2D675] cursor-pointer"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pricing Tiers Table */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/25 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#D4AF37]/20 bg-black/40 text-[11px] font-cinzel uppercase tracking-wider text-[#D8BE99]">
                <th className="py-3.5 px-4 font-bold w-16">ID</th>
                <th className="py-3.5 px-4 font-bold">Tier Name</th>
                <th className="py-3.5 px-4 font-bold w-36">Default Price</th>
                <th className="py-3.5 px-4 font-bold">Notes / Description</th>
                <th className="py-3.5 px-4 font-bold w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/10 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="inline-flex items-center gap-3 text-[#D4AF37]">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span className="font-cinzel uppercase tracking-widest text-xs">Loading pricing tiers...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedTiers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <Sparkles className="w-10 h-10 text-[#D4AF37]/40 mx-auto" />
                      <p className="font-cinzel text-sm text-[#F3E6D0]">No pricing tiers found</p>
                      <p className="text-xs text-[#D8BE99]/70">
                        {search ? 'Try adjusting your search criteria or reset filters.' : 'Create your first perfume pricing tier.'}
                      </p>
                      {search && (
                        <button
                          onClick={handleClearFilters}
                          className="mt-2 px-4 py-1.5 rounded-lg border border-[#D4AF37]/40 text-xs text-[#F2D675] hover:bg-[#D4AF37]/10 cursor-pointer"
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                sortedTiers.map((tier) => (
                  <tr
                    key={tier.id}
                    className="hover:bg-[#1A1108]/40 transition-colors"
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono text-[#D8BE99]/80 font-medium">
                      #{tier.id}
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#F3E6D0] flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#F2D675]" />
                        <span className="font-cinzel tracking-wide">{tier.name}</span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold font-mono bg-gradient-to-r from-[#D4AF37]/20 to-[#F2D675]/10 text-[#F2D675] border border-[#D4AF37]/40">
                        €{Number(tier.price || 0).toFixed(2)}
                      </span>
                    </td>

                    {/* Notes */}
                    <td className="py-3.5 px-4 text-[#D8BE99]/80 max-w-xs truncate">
                      {tier.notes || <span className="italic text-[#D8BE99]/40">— No notes —</span>}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(tier)}
                          className="p-1.5 rounded-lg bg-black/40 hover:bg-[#21130D] border border-[#D4AF37]/30 text-[#D8BE99] hover:text-[#F2D675] transition-all cursor-pointer"
                          title="Edit Pricing Tier"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingTier(tier)}
                          className="p-1.5 rounded-lg bg-black/40 hover:bg-rose-950/40 border border-rose-500/30 text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
                          title="Delete Pricing Tier"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="border-t border-[#D4AF37]/20 p-4 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#D8BE99]">
          <div className="flex items-center gap-2">
            <span>
              Showing {tiers.length > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(page * pageSize, totalCount)} of {totalCount} pricing tiers
            </span>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="bg-black/60 border border-[#D4AF37]/30 rounded-lg py-1 px-2 text-xs text-[#F3E6D0] focus:outline-none cursor-pointer"
            >
              <option value={10} className="bg-[#120B06]">10 per page</option>
              <option value={20} className="bg-[#120B06]">20 per page</option>
              <option value={50} className="bg-[#120B06]">50 per page</option>
            </select>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="p-1.5 rounded-lg bg-black/60 border border-[#D4AF37]/30 text-[#D8BE99] disabled:opacity-30 hover:text-[#F2D675] cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-mono text-xs">
                {page} / {totalPages || 1}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="p-1.5 rounded-lg bg-black/60 border border-[#D4AF37]/30 text-[#D8BE99] disabled:opacity-30 hover:text-[#F2D675] cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE PRICING TIER MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0e0c0a] border border-[#D4AF37]/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 px-6 py-4 bg-black/40">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#F2D675]" />
                <h3 className="font-cinzel text-lg font-bold text-[#F3E6D0]">Create Perfume Pricing Tier</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-[#D8BE99] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {/* Tier Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#D8BE99] mb-1">
                  Tier Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Royal Extrait, Classic Collection, Luxury Edition..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  maxLength={100}
                  className={`w-full bg-black/60 border ${formErrors.name ? 'border-rose-500' : 'border-[#D4AF37]/30'} rounded-xl py-2 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Default Price */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#D8BE99] mb-1">
                  Selling Price (€) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F2D675] font-mono text-sm font-bold">€</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 150.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className={`w-full bg-black/60 border ${formErrors.price ? 'border-rose-500' : 'border-[#D4AF37]/30'} rounded-xl py-2 pl-8 pr-3 text-xs font-mono text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none`}
                  />
                </div>
                {formErrors.price && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.price}</p>
                )}
                <p className="text-[10px] text-[#D8BE99]/60 mt-1">
                  All perfumes assigned to this tier will automatically sell for this exact price.
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#D8BE99] mb-1">
                  Internal Notes / Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Optional context about bottle size, concentration, or collection..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  maxLength={500}
                  className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-black/40 border border-[#D4AF37]/20 text-xs text-[#D8BE99] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F2D675] text-black font-cinzel font-bold text-xs uppercase tracking-wider hover:brightness-110 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Create Tier</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRICING TIER MODAL */}
      {editingTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0e0c0a] border border-[#D4AF37]/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 px-6 py-4 bg-black/40">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#F2D675]" />
                <h3 className="font-cinzel text-lg font-bold text-[#F3E6D0]">
                  Edit Pricing Tier #{editingTier.id}
                </h3>
              </div>
              <button
                onClick={() => setEditingTier(null)}
                className="text-[#D8BE99] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {/* Tier Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#D8BE99] mb-1">
                  Tier Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  maxLength={100}
                  className={`w-full bg-black/60 border ${formErrors.name ? 'border-rose-500' : 'border-[#D4AF37]/30'} rounded-xl py-2 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#D8BE99] mb-1">
                  Selling Price (€) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F2D675] font-mono text-sm font-bold">€</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className={`w-full bg-black/60 border ${formErrors.price ? 'border-rose-500' : 'border-[#D4AF37]/30'} rounded-xl py-2 pl-8 pr-3 text-xs font-mono text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none`}
                  />
                </div>
                {formErrors.price && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.price}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#D8BE99] mb-1">
                  Internal Notes / Description
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  maxLength={500}
                  className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => setEditingTier(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-black/40 border border-[#D4AF37]/20 text-xs text-[#D8BE99] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F2D675] text-black font-cinzel font-bold text-xs uppercase tracking-wider hover:brightness-110 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0e0c0a] border border-rose-500/40 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-cinzel text-base font-bold text-[#F3E6D0]">Delete Pricing Tier</h3>
                <p className="text-xs text-[#D8BE99]">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-[#D8BE99]/90 leading-relaxed">
              Are you sure you want to delete tier <strong className="text-white font-semibold">"{deletingTier.name}" (€{Number(deletingTier.price || 0).toFixed(2)})</strong>?
              If perfumes currently reference this pricing tier, the server will block deletion to prevent orphan prices.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D4AF37]/20">
              <button
                type="button"
                onClick={() => setDeletingTier(null)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-black/40 border border-[#D4AF37]/20 text-xs text-[#D8BE99] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
