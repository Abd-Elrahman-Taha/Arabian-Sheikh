import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../context/ToastContext';
import { subcategoryService } from '../../services/subcategoryService';
import { categoryService } from '../../services/categoryService';
import {
  FolderTree,
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
  ChevronRight
} from 'lucide-react';

export default function AdminSubcategories() {
  const { success, error } = useToast();

  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [parentCategoryFilter, setParentCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [deletingSubcategory, setDeletingSubcategory] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch parent categories for dropdowns
  const fetchParentCategories = useCallback(async () => {
    try {
      const data = await categoryService.getAdminCategories({ pageSize: 100 });
      setCategories(data.items || []);
    } catch (err) {
      console.warn('Failed to load parent categories:', err.message);
    }
  }, []);

  // Fetch subcategories
  const fetchSubcategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await subcategoryService.getAdminSubcategories({
        page,
        pageSize,
        search: search.trim() || undefined,
        categoryId: parentCategoryFilter ? Number(parentCategoryFilter) : undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
        sortBy,
        sortDirection
      });
      setSubcategories(data.items || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      error(err.message || 'Failed to load subcategories.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, parentCategoryFilter, statusFilter, sortBy, sortDirection, error]);

  useEffect(() => {
    fetchParentCategories();
  }, [fetchParentCategories]);

  useEffect(() => {
    fetchSubcategories();
  }, [fetchSubcategories]);

  const handleClearFilters = () => {
    setSearch('');
    setParentCategoryFilter('');
    setStatusFilter('all');
    setSortBy('id');
    setSortDirection('asc');
    setPage(1);
  };

  const handleOpenCreate = () => {
    setFormData({
      categoryId: categories.length > 0 ? String(categories[0].id) : '',
      name: '',
      isActive: true
    });
    setFormErrors({});
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (subcat) => {
    setEditingSubcategory(subcat);
    setFormData({
      categoryId: String(subcat.categoryId || subcat.category?.id || ''),
      name: subcat.name || '',
      isActive: subcat.isActive !== false
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.categoryId) {
      errs.categoryId = 'Parent Category is required.';
    }
    if (!formData.name || !formData.name.trim()) {
      errs.name = 'Subcategory name is required.';
    } else if (formData.name.trim().length > 150) {
      errs.name = 'Subcategory name cannot exceed 150 characters.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setActionLoading(true);
    try {
      await subcategoryService.createSubcategory(formData);
      success(`Subcategory '${formData.name}' created successfully.`);
      setCreateModalOpen(false);
      fetchSubcategories();
    } catch (err) {
      error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingSubcategory || !validateForm()) return;
    setActionLoading(true);
    try {
      await subcategoryService.updateSubcategory(editingSubcategory.id, formData);
      success(`Subcategory '${formData.name}' updated successfully.`);
      setEditingSubcategory(null);
      fetchSubcategories();
    } catch (err) {
      error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSubcategory) return;
    setActionLoading(true);
    try {
      await subcategoryService.deleteSubcategory(deletingSubcategory.id);
      success(`Subcategory '${deletingSubcategory.name}' deleted successfully.`);
      setDeletingSubcategory(null);
      fetchSubcategories();
    } catch (err) {
      error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getParentCategoryName = (subcat) => {
    if (subcat.categoryName) return subcat.categoryName;
    if (subcat.category?.name) return subcat.category.name;
    const found = categories.find(c => Number(c.id) === Number(subcat.categoryId));
    return found ? found.name : `Category #${subcat.categoryId || '—'}`;
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#F3E6D0]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D4AF37]/20 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-black border border-[#D4AF37]/40 text-[#F2D675]">
              <FolderTree className="w-5 h-5" />
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0]">
              Subcategories
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#D8BE99] font-medium mt-1">
            Manage subcategories linked to parent product categories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSubcategories}
            disabled={loading}
            className="p-2.5 rounded-xl bg-black/60 hover:bg-[#21130D] border border-[#D4AF37]/30 text-[#D8BE99] hover:text-[#F2D675] transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Subcategories"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#F2D675] hover:brightness-110 text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subcategory</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/25 rounded-2xl p-4 shadow-xl backdrop-blur-md grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="sm:col-span-4 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#D8BE99]/60" />
          <input
            type="text"
            placeholder="Search subcategories..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2 pl-9 pr-3 text-xs text-[#F3E6D0] placeholder-[#D8BE99]/40 focus:border-[#D4AF37] focus:outline-none"
          />
        </div>

        {/* Parent Category Filter */}
        <div className="sm:col-span-3">
          <select
            value={parentCategoryFilter}
            onChange={(e) => {
              setParentCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-[#120B06]">All Parent Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-[#120B06]">
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#120B06]">All Status</option>
            <option value="active" className="bg-[#120B06]">Active Only</option>
            <option value="inactive" className="bg-[#120B06]">Inactive Only</option>
          </select>
        </div>

        {/* Sort Controls */}
        <div className="sm:col-span-3 flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2 px-2.5 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
          >
            <option value="id" className="bg-[#120B06]">Sort by ID</option>
            <option value="name" className="bg-[#120B06]">Sort by Name</option>
          </select>

          <button
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="px-2.5 py-2 rounded-xl bg-black/60 border border-[#D4AF37]/30 text-[#D8BE99] hover:text-[#F2D675] text-xs font-mono"
            title="Toggle sort direction"
          >
            {sortDirection.toUpperCase()}
          </button>

          <button
            onClick={handleClearFilters}
            className="p-2 rounded-xl bg-black/60 hover:bg-[#21130D] border border-[#D4AF37]/30 text-[#D8BE99] hover:text-[#F2D675]"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subcategories Table */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/25 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#D4AF37]/20 bg-black/40 text-[11px] font-cinzel uppercase tracking-wider text-[#D8BE99]">
                <th className="py-3.5 px-4 font-bold w-16">ID</th>
                <th className="py-3.5 px-4 font-bold">Subcategory Name</th>
                <th className="py-3.5 px-4 font-bold">Parent Category</th>
                <th className="py-3.5 px-4 font-bold w-32">Status</th>
                <th className="py-3.5 px-4 font-bold w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/10 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="inline-flex items-center gap-3 text-[#D4AF37]">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span className="font-cinzel uppercase tracking-widest text-xs">Loading subcategories...</span>
                    </div>
                  </td>
                </tr>
              ) : subcategories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <FolderTree className="w-10 h-10 text-[#D4AF37]/40 mx-auto" />
                      <p className="font-cinzel text-sm text-[#F3E6D0]">No subcategories found</p>
                      <p className="text-xs text-[#D8BE99]/70">
                        {search || parentCategoryFilter || statusFilter !== 'all'
                          ? 'Try adjusting your search criteria or reset filters.'
                          : 'Create your first subcategory using the button above.'}
                      </p>
                      {(search || parentCategoryFilter || statusFilter !== 'all') && (
                        <button
                          onClick={handleClearFilters}
                          className="mt-2 px-4 py-1.5 rounded-lg border border-[#D4AF37]/40 text-xs text-[#F2D675] hover:bg-[#D4AF37]/10"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                subcategories.map((subcat) => (
                  <tr
                    key={subcat.id}
                    className="hover:bg-[#1A1108]/40 transition-colors"
                  >
                    {/* ID */}
                    <td className="py-3 px-4 font-mono text-[#D8BE99]/80 font-medium">
                      #{subcat.id}
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#F3E6D0] flex items-center gap-2">
                        <span>{subcat.name}</span>
                      </div>
                    </td>

                    {/* Parent Category */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#D4AF37]/10 text-[#F2D675] border border-[#D4AF37]/25">
                        <FolderTree className="w-3 h-3 text-[#D4AF37]" />
                        {getParentCategoryName(subcat)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {subcat.isActive !== false ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-800/80 text-zinc-400 border border-zinc-700/40">
                          <AlertCircle className="w-3 h-3 text-zinc-500" />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(subcat)}
                          className="p-1.5 rounded-lg bg-black/40 hover:bg-[#21130D] border border-[#D4AF37]/30 text-[#D8BE99] hover:text-[#F2D675] transition-all cursor-pointer"
                          title="Edit Subcategory"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingSubcategory(subcat)}
                          className="p-1.5 rounded-lg bg-black/40 hover:bg-rose-950/40 border border-rose-500/30 text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
                          title="Delete Subcategory"
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
              Showing {subcategories.length > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(page * pageSize, totalCount)} of {totalCount} subcategories
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

      {/* CREATE SUBCATEGORY MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0e0c0a] border border-[#D4AF37]/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 px-6 py-4 bg-black/40">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-[#F2D675]" />
                <h3 className="font-cinzel text-lg font-bold text-[#F3E6D0]">Create New Subcategory</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-[#D8BE99] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {/* Parent Category Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#D8BE99] mb-1">
                  Parent Category <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className={`w-full bg-black/60 border ${formErrors.categoryId ? 'border-rose-500' : 'border-[#D4AF37]/30'} rounded-xl py-2 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer`}
                >
                  <option value="" disabled className="bg-[#120B06]">Select a parent category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#120B06]">
                      {c.name}
                    </option>
                  ))}
                </select>
                {formErrors.categoryId && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.categoryId}</p>
                )}
              </div>

              {/* Subcategory Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#D8BE99] mb-1">
                  Subcategory Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Eau De Parfum, Oriental Attar, Incense Cones..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  maxLength={150}
                  className={`w-full bg-black/60 border ${formErrors.name ? 'border-rose-500' : 'border-[#D4AF37]/30'} rounded-xl py-2 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="create-subcat-active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
                />
                <label htmlFor="create-subcat-active" className="text-xs text-[#F3E6D0] cursor-pointer">
                  Active (visible in store and product catalog)
                </label>
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
                  <span>Create Subcategory</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SUBCATEGORY MODAL */}
      {editingSubcategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0e0c0a] border border-[#D4AF37]/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 px-6 py-4 bg-black/40">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#F2D675]" />
                <h3 className="font-cinzel text-lg font-bold text-[#F3E6D0]">
                  Edit Subcategory #{editingSubcategory.id}
                </h3>
              </div>
              <button
                onClick={() => setEditingSubcategory(null)}
                className="text-[#D8BE99] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {/* Parent Category Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#D8BE99] mb-1">
                  Parent Category <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className={`w-full bg-black/60 border ${formErrors.categoryId ? 'border-rose-500' : 'border-[#D4AF37]/30'} rounded-xl py-2 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer`}
                >
                  <option value="" disabled className="bg-[#120B06]">Select a parent category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#120B06]">
                      {c.name}
                    </option>
                  ))}
                </select>
                {formErrors.categoryId && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.categoryId}</p>
                )}
              </div>

              {/* Subcategory Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#D8BE99] mb-1">
                  Subcategory Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  maxLength={150}
                  className={`w-full bg-black/60 border ${formErrors.name ? 'border-rose-500' : 'border-[#D4AF37]/30'} rounded-xl py-2 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="edit-subcat-active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
                />
                <label htmlFor="edit-subcat-active" className="text-xs text-[#F3E6D0] cursor-pointer">
                  Active (visible in store and product catalog)
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => setEditingSubcategory(null)}
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
      {deletingSubcategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0e0c0a] border border-rose-500/40 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-cinzel text-base font-bold text-[#F3E6D0]">Delete Subcategory</h3>
                <p className="text-xs text-[#D8BE99]">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-[#D8BE99]/90 leading-relaxed">
              Are you sure you want to delete <strong className="text-white font-semibold">"{deletingSubcategory.name}"</strong>?
              If products are currently assigned to this subcategory, the server will reject the deletion to protect catalog integrity.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D4AF37]/20">
              <button
                type="button"
                onClick={() => setDeletingSubcategory(null)}
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
