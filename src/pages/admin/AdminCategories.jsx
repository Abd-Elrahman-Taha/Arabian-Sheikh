import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { categoryService } from '../../services/categoryService';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
  Lock,
  Eye,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';

export default function AdminCategories() {
  const { t } = useTranslation();
  const { success, error } = useToast();

  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewingCategory, setViewingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  // Form State (strictly NO price or perfumeCategoryId!)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAdminCategories({
        page,
        pageSize,
        search,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
        sortBy,
        sortDirection
      });
      setCategories(data.items || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      error(err.message || 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter, sortBy, sortDirection, error]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setSortBy('id');
    setSortDirection('asc');
    setPage(1);
  };

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true
    });
    setFormErrors({});
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      description: cat.description || '',
      isActive: cat.isActive !== false
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name || !formData.name.trim()) {
      errs.name = 'Category name is required.';
    } else if (formData.name.trim().length > 150) {
      errs.name = 'Category name cannot exceed 150 characters.';
    }

    if (formData.description && formData.description.trim().length > 500) {
      errs.description = 'Description cannot exceed 500 characters.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setActionLoading(true);
    try {
      await categoryService.createCategory(formData);
      success(`Category '${formData.name}' created successfully.`);
      setCreateModalOpen(false);
      fetchCategories();
    } catch (err) {
      error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingCategory || !validateForm()) return;
    setActionLoading(true);
    try {
      await categoryService.updateCategory(editingCategory.id, formData);
      success(`Category '${formData.name}' updated successfully.`);
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    if (Number(deletingCategory.id) === 1) {
      error('Perfumes is a protected system category and cannot be deleted.');
      setDeletingCategory(null);
      return;
    }

    setActionLoading(true);
    try {
      await categoryService.deleteCategory(deletingCategory.id);
      success(`Category '${deletingCategory.name}' deleted successfully.`);
      setDeletingCategory(null);
      fetchCategories();
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
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0]">
              Categories
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#D8BE99] font-medium mt-1">
            Manage product categories and storefront taxonomy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCategories}
            disabled={loading}
            className="p-2.5 rounded-xl bg-black/60 hover:bg-[#21130D] border border-[#D4AF37]/30 text-[#D8BE99] hover:text-[#F2D675] transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Categories"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#F2D675] hover:brightness-110 text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
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
            placeholder="Search categories by name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2 pl-9 pr-3 text-xs text-[#F3E6D0] placeholder-[#D8BE99]/40 focus:border-[#D4AF37] focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#120B06]">All Statuses</option>
            <option value="active" className="bg-[#120B06]">Active Only</option>
            <option value="inactive" className="bg-[#120B06]">Inactive Only</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="sm:col-span-3 flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2 px-2 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
          >
            <option value="id" className="bg-[#120B06]">Sort by ID</option>
            <option value="name" className="bg-[#120B06]">Sort by Name</option>
          </select>
          <button
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="px-3 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-xs text-[#D8BE99] hover:text-[#F2D675] cursor-pointer"
            title="Toggle sort direction"
          >
            {sortDirection.toUpperCase()}
          </button>
        </div>

        {/* Clear Filters */}
        <div className="sm:col-span-2">
          <button
            onClick={handleClearFilters}
            className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 border border-[#D4AF37]/20 rounded-xl text-xs text-[#D8BE99] hover:text-[#F3E6D0] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#D4AF37]/25 bg-black/50 text-[#D8BE99] uppercase font-cinzel font-semibold text-[11px] tracking-wider">
                <th className="py-3.5 px-4 w-16">ID</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4 w-28">Status</th>
                <th className="py-3.5 px-4 text-right w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/15 text-[#F3E6D0]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#D8BE99]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#D4AF37] mb-2" />
                    <span>Loading categories...</span>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#D8BE99]">
                    No categories found matching criteria.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => {
                  const isProtected = Number(cat.id) === 1;

                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-[#1A1108]/60 transition-colors group"
                    >
                      {/* ID */}
                      <td className="py-3 px-4 font-mono font-bold text-[#D4AF37]">
                        #{cat.id}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-cinzel font-bold text-sm text-[#F3E6D0] group-hover:text-[#F2D675] transition-colors">
                            {cat.name}
                          </span>
                          {isProtected && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-cinzel font-bold uppercase tracking-wider bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F2D675]">
                              <Shield className="w-2.5 h-2.5" />
                              <span>System</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 text-[#D8BE99]/80 max-w-xs truncate font-sans">
                        {cat.description || <em className="text-zinc-500">No description</em>}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-cinzel font-bold uppercase tracking-wider border ${
                            cat.isActive !== false
                              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400'
                              : 'bg-zinc-900/60 border-zinc-700/50 text-zinc-400'
                          }`}
                        >
                          {cat.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions: View, Edit, Delete */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View */}
                          <button
                            onClick={() => setViewingCategory(cat)}
                            className="p-1.5 rounded-lg border border-[#D4AF37]/20 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 text-[#D8BE99] hover:text-[#F2D675] transition-colors cursor-pointer"
                            title="View Category Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            className="p-1.5 rounded-lg border border-[#D4AF37]/20 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 text-[#D8BE99] hover:text-[#F2D675] transition-colors cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          {isProtected ? (
                            <div className="relative group/tip inline-block">
                              <button
                                disabled
                                className="p-1.5 rounded-lg border border-white/10 text-white/20 cursor-not-allowed opacity-50"
                                title="Perfumes is a protected system category and cannot be deleted."
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingCategory(cat)}
                              className="p-1.5 rounded-lg border border-red-500/20 hover:border-red-500/60 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-[#D4AF37]/20 bg-black/40 text-xs text-[#D8BE99] gap-3">
          <div>
            Showing <strong className="text-[#F2D675]">{categories.length}</strong> of{' '}
            <strong className="text-[#F2D675]">{totalCount}</strong> categories
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="p-2 rounded-lg border border-[#D4AF37]/30 bg-black/50 text-[#D8BE99] hover:text-[#F2D675] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs px-2">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="p-2 rounded-lg border border-[#D4AF37]/30 bg-black/50 text-[#D8BE99] hover:text-[#F2D675] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CREATE CATEGORY MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#120B06] border border-[#D4AF37]/50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/30 bg-black/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#D4AF37] rounded-lg text-black">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-cinzel text-base font-bold text-[#F2D675] uppercase">
                  Add New Category
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-[#D8BE99] hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              {/* Name */}
              <div>
                <label className="block text-[#D8BE99] uppercase font-semibold mb-1">
                  Category Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Body & Bath Care"
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                />
                {formErrors.name && (
                  <p className="text-red-400 text-[11px] mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[#D8BE99] uppercase font-semibold mb-1">
                  Description <span className="text-zinc-500 font-normal">(Optional, max 500 chars)</span>
                </label>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this category..."
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none resize-none font-sans"
                />
                {formErrors.description && (
                  <p className="text-red-400 text-[11px] mt-1">{formErrors.description}</p>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-[#D4AF37]/20">
                <div>
                  <p className="font-cinzel text-xs uppercase tracking-wider text-[#F2D675] font-bold">
                    Active Status
                  </p>
                  <p className="text-[11px] text-[#D8BE99]/70">
                    Visible to customers as a shop filter when active.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="accent-[#D4AF37] w-4 h-4 cursor-pointer"
                  />
                  <span className={`text-xs font-semibold ${formData.isActive ? 'text-emerald-400' : 'text-zinc-400'}`}>
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-xs text-[#D8BE99] hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 bg-gradient-to-r from-[#D4AF37] to-[#F2D675] hover:brightness-110 text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#120B06] border border-[#D4AF37]/50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/30 bg-black/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#D4AF37] rounded-lg text-black">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-cinzel text-base font-bold text-[#F2D675] uppercase">
                    Edit Category
                  </h3>
                  <span className="font-mono text-[10px] text-[#D8BE99]">ID: #{editingCategory.id}</span>
                </div>
              </div>
              <button
                onClick={() => setEditingCategory(null)}
                className="text-[#D8BE99] hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              {/* Name */}
              <div>
                <label className="block text-[#D8BE99] uppercase font-semibold mb-1">
                  Category Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                />
                {formErrors.name && (
                  <p className="text-red-400 text-[11px] mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[#D8BE99] uppercase font-semibold mb-1">
                  Description <span className="text-zinc-500 font-normal">(Optional, max 500 chars)</span>
                </label>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none resize-none font-sans"
                />
                {formErrors.description && (
                  <p className="text-red-400 text-[11px] mt-1">{formErrors.description}</p>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-[#D4AF37]/20">
                <div>
                  <p className="font-cinzel text-xs uppercase tracking-wider text-[#F2D675] font-bold">
                    Active Status
                  </p>
                  <p className="text-[11px] text-[#D8BE99]/70">
                    Visible to customers as a shop filter when active.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="accent-[#D4AF37] w-4 h-4 cursor-pointer"
                  />
                  <span className={`text-xs font-semibold ${formData.isActive ? 'text-emerald-400' : 'text-zinc-400'}`}>
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-xs text-[#D8BE99] hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 bg-gradient-to-r from-[#D4AF37] to-[#F2D675] hover:brightness-110 text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW CATEGORY MODAL */}
      {viewingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#120B06] border border-[#D4AF37]/50 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-cinzel text-lg font-bold text-[#F2D675]">
                  {viewingCategory.name}
                </h3>
              </div>
              <button
                onClick={() => setViewingCategory(null)}
                className="text-[#D8BE99] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#D8BE99] uppercase font-semibold text-[10px] block">Category ID</span>
                <span className="font-mono text-[#D4AF37]">#{viewingCategory.id}</span>
              </div>
              <div>
                <span className="text-[#D8BE99] uppercase font-semibold text-[10px] block">Description</span>
                <p className="text-[#F3E6D0] leading-relaxed mt-0.5">
                  {viewingCategory.description || 'No description provided.'}
                </p>
              </div>
              <div>
                <span className="text-[#D8BE99] uppercase font-semibold text-[10px] block">Status</span>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full font-cinzel font-bold uppercase text-[10px] ${
                  viewingCategory.isActive !== false ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40' : 'bg-zinc-900 text-zinc-400'
                }`}>
                  {viewingCategory.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              {Number(viewingCategory.id) === 1 && (
                <div className="p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl text-[#F2D675] text-[11px]">
                  Protected system category for perfumes.
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#D4AF37]/20 flex justify-end">
              <button
                onClick={() => setViewingCategory(null)}
                className="px-4 py-2 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-xs text-[#D8BE99] hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#120B06] border border-red-500/50 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-cinzel text-base font-bold uppercase">
                Confirm Category Deletion
              </h3>
            </div>

            <p className="text-xs text-[#D8BE99] leading-relaxed">
              Are you sure you want to delete category <strong className="text-white">'{deletingCategory.name}'</strong> (ID #{deletingCategory.id})?
            </p>

            <p className="text-[11px] text-zinc-400 bg-black/40 p-3 rounded-xl border border-white/10">
              Categories that still have assigned products or subcategories cannot be deleted.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-red-500/20">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                disabled={actionLoading}
                className="px-4 py-2 bg-black/60 border border-white/20 rounded-xl text-xs text-[#D8BE99] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-cinzel font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
