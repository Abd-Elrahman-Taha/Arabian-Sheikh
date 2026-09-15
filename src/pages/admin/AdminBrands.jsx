import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../context/ToastContext';
import { brandService } from '../../services/brandService';
import { productService } from '../../services/productService';
import {
  Crown,
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
  Image as ImageIcon,
  Upload
} from 'lucide-react';

export default function AdminBrands() {
  const { success, error } = useToast();

  const [brands, setBrands] = useState([]);
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
  const [editingBrand, setEditingBrand] = useState(null);
  const [deletingBrand, setDeletingBrand] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const data = await brandService.getAdminBrands({
        page,
        pageSize,
        search: search.trim() || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
        sortBy,
        sortDirection
      });
      setBrands(data.items || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      error(err.message || 'Failed to load brands.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter, sortBy, sortDirection, error]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

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
      logoUrl: '',
      isActive: true
    });
    setFormErrors({});
    setUploadingLogo(false);
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name || '',
      logoUrl: brand.logoUrl || brand.logo || '',
      isActive: brand.isActive !== false
    });
    setFormErrors({});
    setUploadingLogo(false);
  };

  // Upload Logo from Device via POST /api/admin/products/images
  const handleLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side MIME validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      error('Unsupported image format. Allowed: JPG, PNG, WEBP, GIF, SVG.');
      e.target.value = '';
      return;
    }

    // Client-side Max 20MB validation
    const maxBytes = 20 * 1024 * 1024;
    if (file.size > maxBytes) {
      error('File exceeds maximum size of 20MB.');
      e.target.value = '';
      return;
    }

    setUploadingLogo(true);
    try {
      const uploadedUrl = await productService.uploadProductImage(file);
      if (uploadedUrl) {
        setFormData(prev => ({ ...prev, logoUrl: uploadedUrl }));
        success('Brand logo uploaded successfully.');
      } else {
        error('Upload succeeded but no image URL was returned.');
      }
    } catch (err) {
      error(err.message || 'Image upload failed.');
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name || !formData.name.trim()) {
      errs.name = 'Brand name is required.';
    } else if (formData.name.trim().length > 100) {
      errs.name = 'Brand name cannot exceed 100 characters.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setActionLoading(true);
    try {
      await brandService.createBrand({
        name: formData.name.trim(),
        logoUrl: formData.logoUrl?.trim() || '/assets/arabian-sheikh-logo.svg',
        isActive: formData.isActive
      });
      success(`Brand '${formData.name}' created successfully.`);
      setCreateModalOpen(false);
      fetchBrands();
    } catch (err) {
      error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingBrand || !validateForm()) return;
    setActionLoading(true);
    try {
      await brandService.updateBrand(editingBrand.id, {
        name: formData.name.trim(),
        logoUrl: formData.logoUrl?.trim() || '/assets/arabian-sheikh-logo.svg',
        isActive: formData.isActive
      });
      success(`Brand '${formData.name}' updated successfully.`);
      setEditingBrand(null);
      fetchBrands();
    } catch (err) {
      error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBrand) return;
    setActionLoading(true);
    try {
      await brandService.deleteBrand(deletingBrand.id);
      success(`Brand '${deletingBrand.name}' deleted successfully.`);
      setDeletingBrand(null);
      fetchBrands();
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
              <Crown className="w-5 h-5" />
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0]">
              Brands & Houses
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#D8BE99] font-medium mt-1">
            Manage fragrance perfume houses and artisan brands.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBrands}
            disabled={loading}
            className="p-2.5 rounded-xl bg-black/60 hover:bg-[#21130D] border border-[#D4AF37]/30 text-[#D8BE99] hover:text-[#F2D675] transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Brands"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#F2D675] hover:brightness-110 text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Brand</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/25 rounded-2xl p-4 shadow-xl backdrop-blur-md grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#D8BE99]/60" />
          <input
            type="text"
            placeholder="Search brands..."
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
            <option value="all" className="bg-[#120B06]">All Status</option>
            <option value="active" className="bg-[#120B06]">Active Only</option>
            <option value="inactive" className="bg-[#120B06]">Inactive Only</option>
          </select>
        </div>

        {/* Sort Controls */}
        <div className="sm:col-span-4 flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
          >
            <option value="id" className="bg-[#120B06]">Sort by ID</option>
            <option value="name" className="bg-[#120B06]">Sort by Name</option>
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

      {/* Brands Table */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/25 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#D4AF37]/20 bg-black/40 text-[11px] font-cinzel uppercase tracking-wider text-[#D8BE99]">
                <th className="py-3.5 px-4 font-bold w-16">ID</th>
                <th className="py-3.5 px-4 font-bold w-20">Logo</th>
                <th className="py-3.5 px-4 font-bold">Brand Name</th>
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
                      <span className="font-cinzel uppercase tracking-widest text-xs">Loading brands...</span>
                    </div>
                  </td>
                </tr>
              ) : brands.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <Crown className="w-10 h-10 text-[#D4AF37]/40 mx-auto" />
                      <p className="font-cinzel text-sm text-[#F3E6D0]">No brands found</p>
                      <p className="text-xs text-[#D8BE99]/70">
                        {search ? 'Try adjusting your search criteria or reset filters.' : 'Create your first brand using the button above.'}
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
                brands.map((brand) => (
                  <tr
                    key={brand.id}
                    className="hover:bg-[#1A1108]/40 transition-colors"
                  >
                    {/* ID */}
                    <td className="py-3 px-4 font-mono text-[#D8BE99]/80 font-medium">
                      #{brand.id}
                    </td>

                    {/* Logo Preview */}
                    <td className="py-3 px-4">
                      <div className="w-10 h-10 rounded-xl bg-black/60 border border-[#D4AF37]/30 flex items-center justify-center overflow-hidden p-1">
                        {brand.logoUrl || brand.logo ? (
                          <img
                            src={brand.logoUrl || brand.logo}
                            alt={brand.name}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'block';
                            }}
                          />
                        ) : null}
                        <Crown className={`w-4 h-4 text-[#D4AF37]/40 ${brand.logoUrl || brand.logo ? 'hidden' : 'block'}`} />
                      </div>
                    </td>

                    {/* Brand Name */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#F3E6D0] flex items-center gap-2">
                        <span className="font-cinzel text-sm">{brand.name}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {brand.isActive !== false ? (
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
                          onClick={() => handleOpenEdit(brand)}
                          className="p-1.5 rounded-lg bg-black/40 hover:bg-[#21130D] border border-[#D4AF37]/30 text-[#D8BE99] hover:text-[#F2D675] transition-all cursor-pointer"
                          title="Edit Brand"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingBrand(brand)}
                          className="p-1.5 rounded-lg bg-black/40 hover:bg-rose-950/40 border border-rose-500/30 text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
                          title="Delete Brand"
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
              Showing {brands.length > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(page * pageSize, totalCount)} of {totalCount} brands
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

      {/* CREATE BRAND MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0e0c0a] border border-[#D4AF37]/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 px-6 py-4 bg-black/40">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#F2D675]" />
                <h3 className="font-cinzel text-lg font-bold text-[#F3E6D0]">Add Fragrance Brand</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-[#D8BE99] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {/* Brand Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#D8BE99] mb-1">
                  Brand Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Arabian Sheikh, Tom Ford, Roja Parfums..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  maxLength={100}
                  className={`w-full bg-black/60 border ${formErrors.name ? 'border-rose-500' : 'border-[#D4AF37]/30'} rounded-xl py-2 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Brand Logo & Device Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#D8BE99]">
                  Brand Logo
                </label>

                {/* Attached Logo Preview */}
                {formData.logoUrl && (
                  <div className="flex items-center gap-3 p-2.5 bg-black/60 border border-[#D4AF37]/30 rounded-xl">
                    <div className="w-12 h-12 rounded-lg bg-black/80 border border-[#D4AF37]/40 p-1 flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={formData.logoUrl}
                        alt="Brand preview"
                        className="w-full h-full object-contain"
                        onError={(e) => { e.currentTarget.src = '/assets/arabian-sheikh-logo.svg'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#F3E6D0] truncate font-mono">{formData.logoUrl}</p>
                      <p className="text-[10px] text-emerald-400 font-medium">✓ Custom logo attached</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Remove logo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Device Upload Drag-and-Drop Area */}
                <label className="block w-full px-4 py-3 border border-dashed border-[#D4AF37]/40 rounded-xl bg-black/40 hover:bg-[#1A1108]/50 text-center cursor-pointer transition-all">
                  {uploadingLogo ? (
                    <div className="flex items-center justify-center gap-2 text-[#F2D675] py-1">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="text-xs">Uploading logo to server...</span>
                    </div>
                  ) : (
                    <div className="space-y-1 py-1">
                      <Upload className="w-5 h-5 text-[#F2D675] mx-auto" />
                      <p className="text-xs text-[#F3E6D0] font-medium">
                        Click to browse or drag & drop logo from device
                      </p>
                      <p className="text-[10px] text-[#D8BE99]/60">
                        Max file size: 20MB. Allowed: WEBP, PNG, JPG, SVG, GIF
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                    onChange={handleLogoFileChange}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>

                {/* Direct URL Fallback */}
                <div className="space-y-1">
                  <label className="text-[#D8BE99] font-medium text-[11px]">
                    Or direct Logo / Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://... or /assets/brand-logo.svg"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-[#D8BE99]/60">
                    Leave empty to use the default Arabian Sheikh crest.
                  </p>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="create-brand-active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
                />
                <label htmlFor="create-brand-active" className="text-xs text-[#F3E6D0] cursor-pointer">
                  Active (visible across storefront brand filters)
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  disabled={actionLoading || uploadingLogo}
                  className="px-4 py-2 rounded-xl bg-black/40 border border-[#D4AF37]/20 text-xs text-[#D8BE99] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || uploadingLogo}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F2D675] text-black font-cinzel font-bold text-xs uppercase tracking-wider hover:brightness-110 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Create Brand</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BRAND MODAL */}
      {editingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0e0c0a] border border-[#D4AF37]/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 px-6 py-4 bg-black/40">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#F2D675]" />
                <h3 className="font-cinzel text-lg font-bold text-[#F3E6D0]">
                  Edit Brand #{editingBrand.id}
                </h3>
              </div>
              <button
                onClick={() => setEditingBrand(null)}
                className="text-[#D8BE99] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {/* Brand Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#D8BE99] mb-1">
                  Brand Name <span className="text-rose-400">*</span>
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

              {/* Brand Logo & Device Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#D8BE99]">
                  Brand Logo
                </label>

                {/* Attached Logo Preview */}
                {formData.logoUrl && (
                  <div className="flex items-center gap-3 p-2.5 bg-black/60 border border-[#D4AF37]/30 rounded-xl">
                    <div className="w-12 h-12 rounded-lg bg-black/80 border border-[#D4AF37]/40 p-1 flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={formData.logoUrl}
                        alt="Brand preview"
                        className="w-full h-full object-contain"
                        onError={(e) => { e.currentTarget.src = '/assets/arabian-sheikh-logo.svg'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#F3E6D0] truncate font-mono">{formData.logoUrl}</p>
                      <p className="text-[10px] text-emerald-400 font-medium">✓ Custom logo attached</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Remove logo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Device Upload Drag-and-Drop Area */}
                <label className="block w-full px-4 py-3 border border-dashed border-[#D4AF37]/40 rounded-xl bg-black/40 hover:bg-[#1A1108]/50 text-center cursor-pointer transition-all">
                  {uploadingLogo ? (
                    <div className="flex items-center justify-center gap-2 text-[#F2D675] py-1">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="text-xs">Uploading logo to server...</span>
                    </div>
                  ) : (
                    <div className="space-y-1 py-1">
                      <Upload className="w-5 h-5 text-[#F2D675] mx-auto" />
                      <p className="text-xs text-[#F3E6D0] font-medium">
                        Click to browse or drag & drop logo from device
                      </p>
                      <p className="text-[10px] text-[#D8BE99]/60">
                        Max file size: 20MB. Allowed: WEBP, PNG, JPG, SVG, GIF
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                    onChange={handleLogoFileChange}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>

                {/* Direct URL Fallback */}
                <div className="space-y-1">
                  <label className="text-[#D8BE99] font-medium text-[11px]">
                    Or direct Logo / Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://... or /assets/brand-logo.svg"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="edit-brand-active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
                />
                <label htmlFor="edit-brand-active" className="text-xs text-[#F3E6D0] cursor-pointer">
                  Active (visible across storefront brand filters)
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => setEditingBrand(null)}
                  disabled={actionLoading || uploadingLogo}
                  className="px-4 py-2 rounded-xl bg-black/40 border border-[#D4AF37]/20 text-xs text-[#D8BE99] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || uploadingLogo}
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
      {deletingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0e0c0a] border border-rose-500/40 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-cinzel text-base font-bold text-[#F3E6D0]">Delete Brand</h3>
                <p className="text-xs text-[#D8BE99]">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-[#D8BE99]/90 leading-relaxed">
              Are you sure you want to delete <strong className="text-white font-semibold">"{deletingBrand.name}"</strong>?
              If products are currently assigned to this brand, the server will prevent deletion.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D4AF37]/20">
              <button
                type="button"
                onClick={() => setDeletingBrand(null)}
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
