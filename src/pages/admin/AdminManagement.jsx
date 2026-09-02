import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { adminManagementService } from '../../services/adminManagementService';
import { userService } from '../../services/userService';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  UserCheck,
  UserX,
  UserMinus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Key,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Calendar,
  Clock,
  Sparkles,
  Award,
  Crown
} from 'lucide-react';

const DASHBOARD_LANGUAGES = [
  { value: 1, code: 'En', label: 'English' },
  { value: 0, code: 'Bg', label: 'Bulgarian' },
  { value: 2, code: 'Es', label: 'Spanish' }
];

export default function AdminManagement() {
  const { t } = useTranslation();
  const { user: authUser, isSuperAdmin } = useAuth();
  const { success, error, info } = useToast();

  // ==========================================
  // 1. LIST & FILTER STATE
  // ==========================================
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'
  const [sortBy, setSortBy] = useState('CreatedAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false
  });

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // ==========================================
  // 2. DATA FETCHING
  // ==========================================
  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      let isActiveParam = undefined;
      if (statusFilter === 'ACTIVE') isActiveParam = true;
      if (statusFilter === 'INACTIVE') isActiveParam = false;

      const result = await adminManagementService.getAdmins({
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: debouncedSearch.trim() || undefined,
        isActive: isActiveParam,
        sortBy,
        sortDirection
      });

      if (result) {
        setAdmins(result.items || []);
        setPagination(prev => ({
          ...prev,
          totalCount: result.totalCount,
          totalPages: result.totalPages,
          hasPreviousPage: result.hasPreviousPage,
          hasNextPage: result.hasNextPage
        }));
      }
    } catch (err) {
      error(err.message || 'Failed to load administrators.');
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, debouncedSearch, statusFilter, sortBy, sortDirection, error]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // ==========================================
  // 3. MODAL STATES
  // ==========================================
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsModalAdmin, setDetailsModalAdmin] = useState(null);
  const [editModalAdmin, setEditModalAdmin] = useState(null);
  const [statusModalAdmin, setStatusModalAdmin] = useState(null);
  const [passwordModalAdmin, setPasswordModalAdmin] = useState(null);
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [demoteModalAdmin, setDemoteModalAdmin] = useState(null);
  const [deleteModalAdmin, setDeleteModalAdmin] = useState(null);

  // Mutation Loading States
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [demoting, setDemoting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form States
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    password: '',
    preferredDashboardLanguage: 1,
    isActive: true
  });
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    preferredDashboardLanguage: 1
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Promote Customer state
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [promoteForm, setPromoteForm] = useState({
    initialPassword: '',
    preferredDashboardLanguage: 1
  });
  const [showPromotePassword, setShowPromotePassword] = useState(false);

  // ==========================================
  // 4. ACTION HANDLERS
  // ==========================================

  // --- Create Admin ---
  const handleOpenCreate = () => {
    setCreateForm({
      fullName: '',
      email: '',
      password: '',
      preferredDashboardLanguage: 1,
      isActive: true
    });
    setShowCreatePassword(false);
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await adminManagementService.createAdmin(createForm);
      success(`Administrator '${createForm.fullName}' created successfully.`);
      setCreateModalOpen(false);
      fetchAdmins();
    } catch (err) {
      error(err.message || 'Failed to create administrator.');
    } finally {
      setCreating(false);
    }
  };

  // --- Edit Profile ---
  const handleOpenEdit = (admin) => {
    if (admin.isSuperAdmin) {
      error('The SuperAdmin account cannot be modified.');
      return;
    }
    setEditModalAdmin(admin);
    setEditForm({
      fullName: admin.fullName,
      email: admin.email,
      preferredDashboardLanguage: admin.languageNumeric !== undefined ? admin.languageNumeric : 1
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editModalAdmin) return;
    setUpdating(true);
    try {
      await adminManagementService.updateAdmin(editModalAdmin.id, editForm, editModalAdmin.isSuperAdmin);
      success(`Administrator profile updated successfully.`);
      setEditModalAdmin(null);
      fetchAdmins();
    } catch (err) {
      error(err.message || 'Failed to update administrator.');
    } finally {
      setUpdating(false);
    }
  };

  // --- Toggle Status (Activate / Deactivate) ---
  const handleOpenStatus = (admin) => {
    if (admin.isSuperAdmin) {
      error('The SuperAdmin account cannot be deactivated.');
      return;
    }
    setStatusModalAdmin(admin);
  };

  const handleConfirmStatusToggle = async () => {
    if (!statusModalAdmin) return;
    setTogglingStatus(true);
    const newStatus = !statusModalAdmin.isActive;
    try {
      await adminManagementService.toggleStatus(statusModalAdmin.id, newStatus, statusModalAdmin.isSuperAdmin);
      success(`Administrator '${statusModalAdmin.fullName}' ${newStatus ? 'activated' : 'deactivated'} successfully.`);
      setStatusModalAdmin(null);
      fetchAdmins();
    } catch (err) {
      error(err.message || 'Failed to update administrator status.');
    } finally {
      setTogglingStatus(false);
    }
  };

  // --- Reset Password ---
  const handleOpenResetPassword = (admin) => {
    if (admin.isSuperAdmin) {
      error('The SuperAdmin password cannot be reset through this interface.');
      return;
    }
    setPasswordModalAdmin(admin);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setShowResetPassword(false);
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordModalAdmin) return;
    setResettingPassword(true);
    try {
      await adminManagementService.resetPassword(
        passwordModalAdmin.id,
        passwordForm.newPassword,
        passwordForm.confirmPassword,
        passwordModalAdmin.isSuperAdmin
      );
      success(`Password for '${passwordModalAdmin.fullName}' has been reset.`);
      setPasswordModalAdmin(null);
    } catch (err) {
      error(err.message || 'Failed to reset password.');
    } finally {
      setResettingPassword(false);
    }
  };

  // --- Promote Customer Flow ---
  const handleOpenPromote = async () => {
    setPromoteModalOpen(true);
    setSelectedCustomer(null);
    setCustomerSearch('');
    setPromoteForm({ initialPassword: '', preferredDashboardLanguage: 1 });
    setShowPromotePassword(false);
    loadEligibleCustomers('');
  };

  const loadEligibleCustomers = async (query = '') => {
    setLoadingCustomers(true);
    try {
      const list = await userService.getAllUsers({ search: query.trim() || undefined, isBlocked: false });
      setCustomers(Array.isArray(list) ? list : []);
    } catch {
      setCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handlePromoteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      error('Please select a customer to promote.');
      return;
    }
    setPromoting(true);
    try {
      await adminManagementService.promoteUser(selectedCustomer.id, promoteForm);
      success(`Customer '${selectedCustomer.name || selectedCustomer.email}' was promoted to Administrator.`);
      setPromoteModalOpen(false);
      fetchAdmins();
    } catch (err) {
      error(err.message || 'Failed to promote customer.');
    } finally {
      setPromoting(false);
    }
  };

  // --- Demote Admin ---
  const handleOpenDemote = (admin) => {
    if (admin.isSuperAdmin) {
      error('The SuperAdmin account cannot be demoted.');
      return;
    }
    setDemoteModalAdmin(admin);
  };

  const handleConfirmDemote = async () => {
    if (!demoteModalAdmin) return;
    setDemoting(true);
    try {
      await adminManagementService.demoteAdmin(demoteModalAdmin.id, demoteModalAdmin.isSuperAdmin);
      success(`Administrator '${demoteModalAdmin.fullName}' demoted to customer.`);
      setDemoteModalAdmin(null);
      fetchAdmins();
    } catch (err) {
      error(err.message || 'Failed to demote administrator.');
    } finally {
      setDemoting(false);
    }
  };

  // --- Delete Admin ---
  const handleOpenDelete = (admin) => {
    if (admin.isSuperAdmin) {
      error('The SuperAdmin account cannot be deleted.');
      return;
    }
    setDeleteModalAdmin(admin);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalAdmin) return;
    setDeleting(true);
    try {
      await adminManagementService.deleteAdmin(deleteModalAdmin.id, deleteModalAdmin.isSuperAdmin);
      success(`Administrator '${deleteModalAdmin.fullName}' deleted successfully.`);
      setDeleteModalAdmin(null);
      fetchAdmins();
    } catch (err) {
      error(err.message || 'Failed to delete administrator.');
    } finally {
      setDeleting(false);
    }
  };

  // Helper: check password policy checklist in UI
  const getPasswordRules = (pass) => [
    { label: 'At least 8 characters', met: pass.length >= 8 },
    { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(pass) },
    { label: 'One lowercase letter (a-z)', met: /[a-z]/.test(pass) },
    { label: 'One number (0-9)', met: /[0-9]/.test(pass) },
    { label: 'One special character (!, ?, *, .)', met: /[!?*.]/.test(pass) }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#120B06] via-[#1A1008] to-[#120B06] border border-[#D4AF37]/40 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#D4AF37] to-[#8C6239] rounded-xl text-black shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-cinzel text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#F2D675] via-[#D4AF37] to-[#F2D675] uppercase">
                Administrator Control Suite
              </h1>
              <p className="text-xs text-[#D8BE99] font-sans">
                SuperAdmin governance, privilege allocation, and identity management.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={fetchAdmins}
            disabled={loading}
            className="p-2.5 bg-black/60 hover:bg-[#D4AF37]/20 text-[#D8BE99] hover:text-[#F2D675] border border-[#D4AF37]/30 rounded-xl transition-all cursor-pointer"
            title="Refresh Admin List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenPromote}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1E140C] to-[#2E1F12] hover:from-[#3A2818] hover:to-[#4D3520] text-[#F2D675] font-cinzel font-bold text-xs uppercase tracking-wider border border-[#D4AF37]/60 rounded-xl transition-all shadow-md cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>Promote Customer</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#F2D675] hover:to-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-black" />
            <span>New Administrator</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 p-4 rounded-xl shadow-xl flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D4AF37]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by full name or email..."
            className="w-full pl-10 pr-4 py-2 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-xs text-[#F3E6D0] placeholder-[#D8BE99]/40 focus:border-[#D4AF37] focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D8BE99] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Tabs & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          {/* Status Tabs */}
          <div className="flex items-center bg-black/60 border border-[#D4AF37]/30 p-1 rounded-xl">
            {['ALL', 'ACTIVE', 'INACTIVE'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setStatusFilter(tab);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-cinzel uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-[#D4AF37] text-black font-bold shadow-md'
                    : 'text-[#D8BE99] hover:text-[#F2D675]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="bg-black/60 border border-[#D4AF37]/30 text-[#D8BE99] text-xs py-2 px-3 rounded-xl focus:border-[#D4AF37] focus:outline-none cursor-pointer"
            >
              <option value="CreatedAt">Created Date</option>
              <option value="FullName">Full Name</option>
              <option value="Email">Email</option>
              <option value="LastLoginAt">Last Login</option>
              <option value="IsActive">Status</option>
            </select>

            <button
              onClick={() => {
                setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="p-2 bg-black/60 border border-[#D4AF37]/30 text-[#D4AF37] hover:text-[#F2D675] rounded-xl transition-all cursor-pointer"
              title={`Sort Direction: ${sortDirection.toUpperCase()}`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Administrators Table */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#D8BE99]">
            <thead className="bg-black/80 text-[#F2D675] font-cinzel uppercase tracking-widest text-[11px] border-b border-[#D4AF37]/30">
              <tr>
                <th className="py-4 px-6">Administrator</th>
                <th className="py-4 px-4">Role & Origin</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Dashboard Lang</th>
                <th className="py-4 px-4">Last Login</th>
                <th className="py-4 px-4">Created Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/15">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#D8BE99]">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#D4AF37]" />
                      <span className="font-cinzel tracking-wider uppercase">Loading Administrators...</span>
                    </div>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#D8BE99]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Shield className="w-8 h-8 text-[#D4AF37]/40" />
                      <span className="font-cinzel text-sm text-[#F3E6D0]">No administrators found matching criteria.</span>
                      <p className="text-xs text-[#D8BE99]/60">Try adjusting your search terms or filter status.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="hover:bg-[#D4AF37]/5 transition-colors group"
                  >
                    {/* Name & Email */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-cinzel font-bold text-xs border shadow-sm ${
                          admin.isSuperAdmin
                            ? 'bg-gradient-to-tr from-[#D4AF37] via-[#F2D675] to-[#B8860B] text-black border-[#FFFDF8]'
                            : 'bg-black/70 text-[#F2D675] border-[#D4AF37]/40'
                        }`}>
                          {admin.isSuperAdmin ? <Crown className="w-4 h-4 text-black" /> : admin.fullName?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-cinzel font-bold text-sm text-[#F3E6D0]">
                              {admin.fullName}
                            </span>
                            {admin.isSuperAdmin && (
                              <span className="px-2 py-0.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-cinzel font-extrabold text-[9px] uppercase tracking-wider rounded-full shadow-sm">
                                SUPER ADMIN
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#D8BE99]/70 font-mono block">
                            {admin.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role & Origin */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                          admin.isSuperAdmin ? 'text-[#F2D675]' : 'text-[#F3E6D0]'
                        }`}>
                          {admin.isSuperAdmin ? 'Super Administrator' : 'Administrator'}
                        </span>
                        {admin.isPromoted ? (
                          <span className="block text-[10px] text-amber-400/90 font-mono">
                            ★ Promoted (User #{admin.promotedFromUserId})
                          </span>
                        ) : (
                          <span className="block text-[10px] text-neutral-400 font-mono">
                            Created as Admin
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-cinzel font-bold uppercase tracking-wider border shadow-sm ${
                        admin.isActive
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                          : 'bg-red-950/80 text-red-400 border-red-500/40'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${admin.isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        {admin.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>

                    {/* Dashboard Language */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-[#D4AF37]/30 text-xs text-[#F2D675] font-medium">
                        <Globe className="w-3 h-3 text-[#D4AF37]" />
                        <span>{admin.languageLabel}</span>
                      </span>
                    </td>

                    {/* Last Login */}
                    <td className="py-4 px-4 text-xs font-mono">
                      {admin.lastLoginAt ? (
                        <div>
                          <span className="text-[#F3E6D0] block">
                            {new Date(admin.lastLoginAt).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] text-[#D8BE99]/60">
                            {new Date(admin.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-neutral-500 italic">Never</span>
                      )}
                    </td>

                    {/* Created Date */}
                    <td className="py-4 px-4 text-xs font-mono">
                      {admin.createdAt ? (
                        <span className="text-[#D8BE99]">
                          {new Date(admin.createdAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-neutral-500">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details */}
                        <button
                          onClick={() => setDetailsModalAdmin(admin)}
                          className="p-1.5 bg-black/60 hover:bg-[#D4AF37]/20 text-[#D8BE99] hover:text-[#F2D675] border border-[#D4AF37]/30 rounded-lg transition-all cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Actions for Non-SuperAdmin */}
                        {!admin.isSuperAdmin && (
                          <>
                            {/* Edit Profile */}
                            <button
                              onClick={() => handleOpenEdit(admin)}
                              className="p-1.5 bg-black/60 hover:bg-[#D4AF37]/20 text-[#D8BE99] hover:text-[#F2D675] border border-[#D4AF37]/30 rounded-lg transition-all cursor-pointer"
                              title="Edit Administrator"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Reset Password */}
                            <button
                              onClick={() => handleOpenResetPassword(admin)}
                              className="p-1.5 bg-black/60 hover:bg-amber-950/40 text-[#D8BE99] hover:text-amber-400 border border-[#D4AF37]/30 rounded-lg transition-all cursor-pointer"
                              title="Reset Password"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>

                            {/* Activate / Deactivate Toggle */}
                            <button
                              onClick={() => handleOpenStatus(admin)}
                              className={`p-1.5 bg-black/60 border rounded-lg transition-all cursor-pointer ${
                                admin.isActive
                                  ? 'hover:bg-amber-950/40 text-emerald-400 hover:text-amber-400 border-emerald-500/30 hover:border-amber-500/40'
                                  : 'hover:bg-emerald-950/40 text-red-400 hover:text-emerald-400 border-red-500/30 hover:border-emerald-500/40'
                              }`}
                              title={admin.isActive ? 'Deactivate Administrator' : 'Activate Administrator'}
                            >
                              {admin.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            </button>

                            {/* Demote to Customer */}
                            <button
                              onClick={() => handleOpenDemote(admin)}
                              className="p-1.5 bg-black/60 hover:bg-orange-950/40 text-[#D8BE99] hover:text-orange-400 border border-[#D4AF37]/30 rounded-lg transition-all cursor-pointer"
                              title="Demote to Customer"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleOpenDelete(admin)}
                              className="p-1.5 bg-black/60 hover:bg-red-950/50 text-[#D8BE99] hover:text-red-400 border border-[#D4AF37]/30 rounded-lg transition-all cursor-pointer"
                              title="Delete Administrator"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-black/80 border-t border-[#D4AF37]/30 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#D8BE99]">
          <div>
            Showing <span className="font-bold text-[#F2D675]">{admins.length}</span> of{' '}
            <span className="font-bold text-[#F2D675]">{pagination.totalCount}</span> administrators
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={!pagination.hasPreviousPage || loading}
              className="px-3 py-1.5 bg-black/60 border border-[#D4AF37]/30 rounded-lg text-xs text-[#D8BE99] hover:text-[#F2D675] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg font-mono text-[#F2D675] font-bold">
              {pagination.page} / {pagination.totalPages || 1}
            </span>

            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={!pagination.hasNextPage || loading}
              className="px-3 py-1.5 bg-black/60 border border-[#D4AF37]/30 rounded-lg text-xs text-[#D8BE99] hover:text-[#F2D675] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 5. MODALS & WORKFLOWS                                */}
      {/* ==================================================== */}

      {/* Modal 1: Create Administrator */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#120B06] border border-[#D4AF37]/50 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/30 bg-black/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#D4AF37] rounded-lg text-black">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="font-cinzel text-lg font-bold text-[#F2D675] uppercase">
                  Create Administrator
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-[#D8BE99] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[#D8BE99] font-cinzel uppercase tracking-wider mb-1.5 font-semibold">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  placeholder="e.g. Omar Khaled"
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#D8BE99] font-cinzel uppercase tracking-wider mb-1.5 font-semibold">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  maxLength={256}
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="e.g. omar.admin@perfumestore.com"
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#D8BE99] font-cinzel uppercase tracking-wider mb-1.5 font-semibold">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCreatePassword ? 'text' : 'password'}
                    required
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="Min 8 chars, uppercase, lowercase, digit, symbol (! ? * .)"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-[#F3E6D0] font-mono focus:border-[#D4AF37] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword(!showCreatePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D8BE99] hover:text-[#F2D675]"
                  >
                    {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Policy Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2 bg-black/40 p-3 rounded-xl border border-[#D4AF37]/20">
                  {getPasswordRules(createForm.password).map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[10px]">
                      <CheckCircle2 className={`w-3 h-3 ${rule.met ? 'text-emerald-400' : 'text-neutral-600'}`} />
                      <span className={rule.met ? 'text-emerald-300' : 'text-neutral-400'}>{rule.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[#D8BE99] font-cinzel uppercase tracking-wider mb-1.5 font-semibold">
                    Dashboard Language
                  </label>
                  <select
                    value={createForm.preferredDashboardLanguage}
                    onChange={(e) => setCreateForm({ ...createForm, preferredDashboardLanguage: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                  >
                    {DASHBOARD_LANGUAGES.map(lang => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#D8BE99] font-cinzel uppercase tracking-wider mb-1.5 font-semibold">
                    Initial Status
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-[#F3E6D0]">
                      <input
                        type="checkbox"
                        checked={createForm.isActive}
                        onChange={(e) => setCreateForm({ ...createForm, isActive: e.target.checked })}
                        className="accent-[#D4AF37] w-4 h-4"
                      />
                      <span>Active Account</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 border border-[#D4AF37]/30 text-[#D8BE99] hover:text-white rounded-xl font-cinzel uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#F2D675] hover:to-[#D4AF37] text-black font-cinzel font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {creating ? 'Creating...' : 'Create Administrator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Admin Details Modal */}
      {detailsModalAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#120B06] border border-[#D4AF37]/50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/30 bg-black/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#D4AF37]/20 border border-[#D4AF37]/50 rounded-lg text-[#F2D675]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cinzel text-lg font-bold text-[#F2D675]">
                    {detailsModalAdmin.fullName}
                  </h3>
                  <span className="text-xs text-[#D8BE99]/70 font-mono">{detailsModalAdmin.email}</span>
                </div>
              </div>
              <button
                onClick={() => setDetailsModalAdmin(null)}
                className="text-[#D8BE99] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-black/40 p-4 rounded-xl border border-[#D4AF37]/20">
                <div>
                  <span className="text-[#D8BE99]/60 uppercase tracking-wider block font-cinzel text-[10px]">
                    Admin ID
                  </span>
                  <span className="font-mono font-bold text-[#F3E6D0]">#{detailsModalAdmin.id}</span>
                </div>
                <div>
                  <span className="text-[#D8BE99]/60 uppercase tracking-wider block font-cinzel text-[10px]">
                    Account Role
                  </span>
                  <span className="font-bold text-[#F2D675]">
                    {detailsModalAdmin.isSuperAdmin ? 'Super Administrator' : 'Administrator'}
                  </span>
                </div>
                <div>
                  <span className="text-[#D8BE99]/60 uppercase tracking-wider block font-cinzel text-[10px]">
                    Status
                  </span>
                  <span className={`font-bold ${detailsModalAdmin.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {detailsModalAdmin.status}
                  </span>
                </div>
                <div>
                  <span className="text-[#D8BE99]/60 uppercase tracking-wider block font-cinzel text-[10px]">
                    Dashboard Language
                  </span>
                  <span className="font-bold text-[#F3E6D0]">{detailsModalAdmin.languageLabel}</span>
                </div>
              </div>

              <div className="bg-black/40 p-4 rounded-xl border border-[#D4AF37]/20 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#D8BE99]">Account Origin:</span>
                  <span className="font-bold text-[#F3E6D0]">
                    {detailsModalAdmin.isPromoted
                      ? `Promoted from Customer ID #${detailsModalAdmin.promotedFromUserId}`
                      : 'Created Directly as Administrator'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#D8BE99]">Created At:</span>
                  <span className="font-mono text-[#F3E6D0]">
                    {detailsModalAdmin.createdAt ? new Date(detailsModalAdmin.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#D8BE99]">Last Login:</span>
                  <span className="font-mono text-[#F3E6D0]">
                    {detailsModalAdmin.lastLoginAt ? new Date(detailsModalAdmin.lastLoginAt).toLocaleString() : 'Never'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setDetailsModalAdmin(null)}
                  className="px-5 py-2 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel font-bold uppercase rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Edit Profile */}
      {editModalAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#120B06] border border-[#D4AF37]/50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/30 bg-black/40">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-cinzel text-lg font-bold text-[#F2D675] uppercase">
                  Edit Administrator
                </h3>
              </div>
              <button
                onClick={() => setEditModalAdmin(null)}
                className="text-[#D8BE99] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[#D8BE99] font-cinzel uppercase tracking-wider mb-1.5 font-semibold">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#D8BE99] font-cinzel uppercase tracking-wider mb-1.5 font-semibold">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  maxLength={256}
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#D8BE99] font-cinzel uppercase tracking-wider mb-1.5 font-semibold">
                  Dashboard Language
                </label>
                <select
                  value={editForm.preferredDashboardLanguage}
                  onChange={(e) => setEditForm({ ...editForm, preferredDashboardLanguage: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                >
                  {DASHBOARD_LANGUAGES.map(lang => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => setEditModalAdmin(null)}
                  className="px-4 py-2 border border-[#D4AF37]/30 text-[#D8BE99] hover:text-white rounded-xl font-cinzel uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Activate / Deactivate Confirmation */}
      {statusModalAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#120B06] border border-[#D4AF37]/50 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-cinzel text-lg font-bold text-[#F2D675] uppercase">
                {statusModalAdmin.isActive ? 'Deactivate Administrator?' : 'Activate Administrator?'}
              </h3>
            </div>

            <p className="text-xs text-[#D8BE99] leading-relaxed">
              {statusModalAdmin.isActive ? (
                <>
                  You are deactivating <strong className="text-white">{statusModalAdmin.fullName}</strong> ({statusModalAdmin.email}).
                  <br /><br />
                  This administrator will <strong className="text-amber-300">immediately lose access</strong> to the admin portal and all their active sessions and tokens will be revoked.
                </>
              ) : (
                <>
                  You are activating <strong className="text-white">{statusModalAdmin.fullName}</strong>.
                  <br /><br />
                  This will restore their ability to log in and manage the store according to their privileges.
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalAdmin(null)}
                className="px-4 py-2 border border-[#D4AF37]/30 text-[#D8BE99] hover:text-white rounded-xl font-cinzel uppercase tracking-wider text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusToggle}
                disabled={togglingStatus}
                className={`px-5 py-2 font-cinzel font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg transition-all ${
                  statusModalAdmin.isActive
                    ? 'bg-amber-600 hover:bg-amber-500 text-black'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {togglingStatus ? 'Updating...' : statusModalAdmin.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Reset Password */}
      {passwordModalAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#120B06] border border-[#D4AF37]/50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/30 bg-black/40">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-cinzel text-lg font-bold text-[#F2D675] uppercase">
                  Reset Password
                </h3>
              </div>
              <button
                onClick={() => setPasswordModalAdmin(null)}
                className="text-[#D8BE99] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-4 text-xs">
              <div className="bg-amber-950/30 border border-amber-500/30 p-3 rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  Resetting the password will terminate all active sessions for{' '}
                  <strong className="text-white">{passwordModalAdmin.fullName}</strong>. They will need to log in again.
                </p>
              </div>

              <div>
                <label className="block text-[#D8BE99] font-cinzel uppercase tracking-wider mb-1.5 font-semibold">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Enter new strong password"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-[#F3E6D0] font-mono focus:border-[#D4AF37] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D8BE99] hover:text-[#F2D675]"
                  >
                    {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#D8BE99] font-cinzel uppercase tracking-wider mb-1.5 font-semibold">
                  Confirm New Password
                </label>
                <input
                  type={showResetPassword ? 'text' : 'password'}
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-[#F3E6D0] font-mono focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* Policy Rules */}
              <div className="grid grid-cols-1 gap-1.5 bg-black/40 p-3 rounded-xl border border-[#D4AF37]/20">
                {getPasswordRules(passwordForm.newPassword).map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[10px]">
                    <CheckCircle2 className={`w-3 h-3 ${rule.met ? 'text-emerald-400' : 'text-neutral-600'}`} />
                    <span className={rule.met ? 'text-emerald-300' : 'text-neutral-400'}>{rule.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => setPasswordModalAdmin(null)}
                  className="px-4 py-2 border border-[#D4AF37]/30 text-[#D8BE99] hover:text-white rounded-xl font-cinzel uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resettingPassword}
                  className="px-5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#F2D675] hover:to-[#D4AF37] text-black font-cinzel font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50"
                >
                  {resettingPassword ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 6: Promote Customer */}
      {promoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#120B06] border border-[#D4AF37]/50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/30 bg-black/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#D4AF37] rounded-lg text-black">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="font-cinzel text-lg font-bold text-[#F2D675] uppercase">
                  Promote Customer to Admin
                </h3>
              </div>
              <button
                onClick={() => setPromoteModalOpen(false)}
                className="text-[#D8BE99] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePromoteSubmit} className="p-6 space-y-4 text-xs">
              <div className="bg-amber-950/20 border border-amber-500/30 p-3.5 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <div className="space-y-1 text-[11px] text-[#F3E6D0] leading-relaxed">
                  <p className="font-semibold text-[#F2D675]">
                    Account Transition Notice:
                  </p>
                  <p className="text-[#D8BE99]">
                    When you make someone an Administrator, their user account is blocked to grant back-office privileges.
                  </p>
                  <p className="text-[#D8BE99]">
                    When you remove them from administration, unblock their account in <strong className="text-[#F2D675]">Customers Management</strong> so they return to normal and can be made an admin again.
                  </p>
                </div>
              </div>

              {/* Customer Search / Selection */}
              <div>
                <label className="block text-[#D8BE99] font-cinzel uppercase tracking-wider mb-1.5 font-semibold">
                  Select Customer <span className="text-red-400">*</span>
                </label>
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37]" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      loadEligibleCustomers(e.target.value);
                    }}
                    placeholder="Search customers by name or email..."
                    className="w-full pl-9 pr-4 py-2 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                {/* Customer List Picker */}
                <div className="max-h-40 overflow-y-auto space-y-1.5 border border-[#D4AF37]/20 bg-black/40 p-2 rounded-xl">
                  {loadingCustomers ? (
                    <div className="py-4 text-center text-[#D8BE99]">Loading customers...</div>
                  ) : customers.length === 0 ? (
                    <div className="py-4 text-center text-neutral-500">No matching eligible customers found.</div>
                  ) : (
                    customers.map(c => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCustomer(c)}
                        className={`p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                          selectedCustomer?.id === c.id
                            ? 'bg-[#D4AF37]/25 border border-[#D4AF37] text-white'
                            : 'hover:bg-white/5 text-[#D8BE99]'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-[#F3E6D0] block">{c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Valued Patron'}</span>
                          <span className="font-mono text-[10px] text-[#D8BE99]/70">{c.email}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#D4AF37]">ID #{c.id}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {selectedCustomer && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-emerald-400 font-bold block text-xs">Selected: {selectedCustomer.name || selectedCustomer.email}</span>
                    <span className="text-[10px] text-emerald-300 font-mono">User ID: #{selectedCustomer.id}</span>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
              )}

              {/* Initial Password (Optional for normal, required for social) */}
              <div>
                <label className="block text-[#D8BE99] font-cinzel uppercase tracking-wider mb-1.5 font-semibold">
                  Initial Admin Password <span className="text-[#D8BE99]/50 font-normal">(Optional unless Google/Social user)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPromotePassword ? 'text' : 'password'}
                    value={promoteForm.initialPassword}
                    onChange={(e) => setPromoteForm({ ...promoteForm, initialPassword: e.target.value })}
                    placeholder="Leave empty to reuse customer password"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-[#F3E6D0] font-mono focus:border-[#D4AF37] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPromotePassword(!showPromotePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D8BE99] hover:text-[#F2D675]"
                  >
                    {showPromotePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#D8BE99] font-cinzel uppercase tracking-wider mb-1.5 font-semibold">
                  Dashboard Language
                </label>
                <select
                  value={promoteForm.preferredDashboardLanguage}
                  onChange={(e) => setPromoteForm({ ...promoteForm, preferredDashboardLanguage: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                >
                  {DASHBOARD_LANGUAGES.map(lang => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => setPromoteModalOpen(false)}
                  className="px-4 py-2 border border-[#D4AF37]/30 text-[#D8BE99] hover:text-white rounded-xl font-cinzel uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={promoting || !selectedCustomer}
                  className="px-5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#F2D675] hover:to-[#D4AF37] text-black font-cinzel font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50"
                >
                  {promoting ? 'Promoting...' : 'Promote to Administrator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 7: Demote Admin Confirmation */}
      {demoteModalAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#120B06] border border-[#D4AF37]/50 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-orange-400">
              <UserMinus className="w-6 h-6 shrink-0" />
              <h3 className="font-cinzel text-lg font-bold text-[#F2D675] uppercase">
                Demote Administrator?
              </h3>
            </div>

            <p className="text-xs text-[#D8BE99] leading-relaxed">
              You are about to demote <strong className="text-white">{demoteModalAdmin.fullName}</strong> ({demoteModalAdmin.email}) back into a customer account.
            </p>

            <div className="p-3 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-xs text-[#D8BE99]">
              {demoteModalAdmin.isPromoted ? (
                <p>
                  ★ <strong className="text-[#F2D675]">Promoted Origin:</strong> This user was originally Customer #{demoteModalAdmin.promotedFromUserId}. Demoting them will restore their original customer account, unblock them, and restore their previous orders, addresses, and wishlist.
                </p>
              ) : (
                <p>
                  ★ <strong className="text-[#F2D675]">Direct Origin:</strong> This user was created directly as an Administrator. Demoting them will convert their credentials into a new storefront customer account.
                </p>
              )}
            </div>

            <p className="text-[11px] text-red-300">
              All active administrator sessions and privileges will be terminated immediately.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDemoteModalAdmin(null)}
                className="px-4 py-2 border border-[#D4AF37]/30 text-[#D8BE99] hover:text-white rounded-xl font-cinzel uppercase tracking-wider text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDemote}
                disabled={demoting}
                className="px-5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-cinzel font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg transition-all disabled:opacity-50"
              >
                {demoting ? 'Demoting...' : 'Demote to Customer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 8: Delete Admin Confirmation */}
      {deleteModalAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#120B06] border border-red-500/50 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h3 className="font-cinzel text-lg font-bold text-red-400 uppercase">
                Delete Administrator?
              </h3>
            </div>

            <p className="text-xs text-[#D8BE99] leading-relaxed">
              You are about to permanently delete administrator <strong className="text-white">{deleteModalAdmin.fullName}</strong> ({deleteModalAdmin.email}).
            </p>

            <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300 leading-relaxed">
              This will disable the administrator record and terminate all active sessions and refresh tokens immediately.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalAdmin(null)}
                className="px-4 py-2 border border-[#D4AF37]/30 text-[#D8BE99] hover:text-white rounded-xl font-cinzel uppercase tracking-wider text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-cinzel font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {deleting ? 'Deleting...' : 'Delete Administrator'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
