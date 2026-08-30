import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { userService } from '../../services/userService';
import { userApi } from '../../api/user.api';
import { useToast } from '../../context/ToastContext';
import {
  Search,
  Ban,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Phone,
  Edit2,
  User,
  Mail,
  Shield,
  X,
  Save,
  UserCheck,
  UserX,
  AlertTriangle
} from 'lucide-react';

export default function AdminUsers() {
  const { t } = useTranslation();
  const { success, error } = useToast();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'BLOCKED'
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const isBlockedParam = statusFilter === 'BLOCKED' ? true : (statusFilter === 'ACTIVE' ? false : undefined);
      const list = await userService.getAllUsers({
        search: search.trim() || undefined,
        isBlocked: isBlockedParam
      });
      setCustomers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Could not fetch customers from server:', err.message);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter]);

  // Open Edit Modal (Only Name and Phone are editable)
  const handleOpenEdit = (cust) => {
    setEditingCustomer(cust);
    const fullNameParts = (cust.name || cust.fullName || '').trim().split(/\s+/);
    setEditFirstName(cust.firstName || fullNameParts[0] || '');
    setEditLastName(cust.lastName || fullNameParts.slice(1).join(' ') || '');
    setEditPhone(cust.phone || cust.phoneNumber || '');
  };

  const handleCloseEdit = () => {
    setEditingCustomer(null);
    setEditFirstName('');
    setEditLastName('');
    setEditPhone('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingCustomer) return;

    if (!editFirstName.trim()) {
      error('First Name is required.');
      return;
    }

    setSavingEdit(true);
    try {
      await userService.updateCustomer(editingCustomer.id, {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        phone: editPhone.trim()
      });
      success(`Customer details for '${editFirstName} ${editLastName}' updated successfully.`);
      handleCloseEdit();
      fetchCustomers();
    } catch (err) {
      error(err.message || 'Failed to update customer.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Block Customer (POST /api/admin/customers/{id}/block)
  const handleBlock = async (cust) => {
    if (!window.confirm(`Are you sure you want to BLOCK access for '${cust.name || cust.fullName || cust.email}'?`)) {
      return;
    }
    try {
      await userService.blockCustomer(cust.id);
      success(`Customer '${cust.name || cust.email}' has been BLOCKED.`);
      fetchCustomers();
    } catch (err) {
      error(err.message || 'Failed to block customer.');
    }
  };

  // Unblock Customer (POST /api/admin/customers/{id}/unblock)
  const handleUnblock = async (cust) => {
    try {
      await userService.unblockCustomer(cust.id);
      success(`Customer '${cust.name || cust.email}' access has been RESTORED (UNBLOCKED).`);
      fetchCustomers();
    } catch (err) {
      error(err.message || 'Failed to unblock customer.');
    }
  };

  // Delete Customer (DELETE /api/admin/customers/{id})
  const handleDelete = async (cust) => {
    if (!window.confirm(`Are you sure you want to permanently delete customer '${cust.name || cust.fullName || cust.email}'? This action cannot be undone.`)) {
      return;
    }
    try {
      await userService.deleteCustomer(cust.id);
      success('Customer record deleted.');
      fetchCustomers();
    } catch (err) {
      error(err.message || 'Failed to delete customer.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#F3E6D0]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D4AF37]/20 pb-4 gap-4">
        <div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0]">
            Customer Management (إدارة العملاء)
          </h1>
          <p className="text-xs text-[#D8BE99] font-medium mt-0.5">
            Manage patrons, modify names and contact numbers, and regulate account access status.
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="px-4 py-2.5 rounded-full border border-[#D4AF37]/40 bg-black/60 hover:bg-[#21130D] text-xs font-cinzel font-bold text-[#F3E6D0] hover:text-[#F2D675] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
          <span>{loading ? 'Syncing...' : 'Sync Patrons'}</span>
        </button>
      </div>

      {/* Search & Status Filter */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patron by name, email, or phone..."
            className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl pl-9 pr-3 py-2 text-xs text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-black/60 border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer font-medium"
          >
            <option value="ALL">All Statuses (الكل)</option>
            <option value="ACTIVE">Active Patrons Only (النشطين)</option>
            <option value="BLOCKED">Blocked Accounts Only (المحظورين)</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#D4AF37]/25 text-[#F2D675] uppercase font-cinzel font-bold bg-black/40">
                <th className="py-3.5 px-4">Patron Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Phone Number</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/15 text-[#F3E6D0]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#D8BE99] font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#D4AF37]" />
                      <span className="font-mono text-xs text-[#D8BE99]">Loading customer registry directly from server...</span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#D8BE99] font-medium">
                    <div className="space-y-1">
                      <p className="font-cinzel text-sm text-[#F3E6D0]">No patrons found in the registry.</p>
                      <p className="font-mono text-xs text-[#D8BE99]/60">
                        When users register via the portal, they will appear dynamically in this table.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const isBlocked = Boolean(c.isBlocked || c.status === 'BLOCKED');
                  const displayName = c.fullName || (c.firstName ? `${c.firstName} ${c.lastName || ''}`.trim() : (c.name || 'Royal Patron'));

                  return (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#F2D675] font-cinzel font-bold text-xs shrink-0">
                            {displayName.charAt(0).toUpperCase() || 'P'}
                          </div>
                          <div>
                            <span className="font-cinzel font-bold text-sm text-[#F3E6D0] block">
                              {displayName}
                            </span>
                            <span className="text-[10px] font-mono text-[#D8BE99]/60">
                              ID: #{c.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#D8BE99] font-medium">
                        {c.email}
                      </td>

                      <td className="py-3.5 px-4">
                        {c.phone ? (
                          <a
                            href={`tel:${c.phone}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/35 text-[#F2D675] font-mono text-[11px] hover:bg-[#D4AF37]/20 transition-colors"
                            title="Click to call patron"
                          >
                            <Phone className="w-3 h-3 text-[#D4AF37]" />
                            <span>{c.phone}</span>
                          </a>
                        ) : (
                          <span className="text-[#D8BE99]/40 font-mono text-[11px] italic">Not provided</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-mono uppercase rounded-full font-bold ${
                          isBlocked
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {isBlocked ? (
                            <>
                              <UserX className="w-3 h-3" />
                              <span>BLOCKED</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3" />
                              <span>ACTIVE</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#D8BE99] font-medium">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : (c.memberSince || '2026')}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Name & Phone */}
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 rounded-lg border border-[#D4AF37]/30 bg-black/40 hover:bg-[#D4AF37]/20 text-[#F2D675] transition-colors cursor-pointer"
                            title="Edit Name and Phone Number"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Block / Unblock Toggle */}
                          {isBlocked ? (
                            <button
                              onClick={() => handleUnblock(c)}
                              className="p-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 transition-colors cursor-pointer"
                              title="Unblock Customer (Restore Access)"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBlock(c)}
                              className="p-1.5 rounded-lg border border-rose-500/40 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 transition-colors cursor-pointer"
                              title="Block Customer (Suspend Access)"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(c)}
                            className="p-1.5 rounded-lg border border-neutral-700 bg-black/40 hover:bg-rose-950/50 text-[#D8BE99] hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Customer"
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
      </div>

      {/* Edit Customer Modal (Only Name and Phone can be modified) */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#0B0A08] border border-[#D4AF37]/40 shadow-2xl p-6 space-y-5 text-[#F3E6D0]">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
              <div className="flex items-center gap-2 text-[#F2D675]">
                <Edit2 className="w-5 h-5" />
                <h3 className="font-cinzel text-lg font-bold uppercase tracking-wider">
                  Edit Customer (تعديل العميل)
                </h3>
              </div>
              <button
                onClick={handleCloseEdit}
                className="p-1 text-[#D8BE99] hover:text-[#F3E6D0] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-sans">
              {/* Read-Only Account Info */}
              <div className="p-3 rounded-xl bg-black/50 border border-[#D4AF37]/20 space-y-1.5">
                <div className="flex items-center justify-between text-[#D8BE99]">
                  <span className="font-semibold uppercase tracking-wider">Account ID:</span>
                  <span className="font-mono text-[#F2D675]">#{editingCustomer.id}</span>
                </div>
                <div className="flex items-center justify-between text-[#D8BE99]">
                  <span className="font-semibold uppercase tracking-wider">Email (Protected):</span>
                  <span className="font-mono text-[#F3E6D0]">{editingCustomer.email}</span>
                </div>
              </div>

              {/* First Name */}
              <div>
                <label className="block uppercase tracking-wider text-[#D8BE99] font-semibold mb-1">
                  First Name (الاسم الأول) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    placeholder="e.g. Abdullah"
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2.5 pl-9 pr-3 text-[#F3E6D0] placeholder-[#D8BE99]/40 focus:border-[#D4AF37] focus:outline-none"
                  />
                  <User className="w-4 h-4 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label className="block uppercase tracking-wider text-[#D8BE99] font-semibold mb-1">
                  Last Name (اسم العائلة)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    placeholder="e.g. Al-Saud"
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2.5 pl-9 pr-3 text-[#F3E6D0] placeholder-[#D8BE99]/40 focus:border-[#D4AF37] focus:outline-none"
                  />
                  <User className="w-4 h-4 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block uppercase tracking-wider text-[#D8BE99] font-semibold mb-1">
                  Phone Number (رقم الهاتف مع كود الدولة)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+201000000000"
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2.5 pl-9 pr-3 text-[#F3E6D0] placeholder-[#D8BE99]/40 focus:border-[#D4AF37] focus:outline-none font-mono"
                  />
                  <Phone className="w-4 h-4 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[10px] text-[#D8BE99]/60 mt-1">
                  Format: International format with country code prefix (e.g. +201000000000)
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="px-4 py-2 rounded-xl border border-neutral-700 hover:bg-white/5 text-xs text-[#D8BE99] transition-colors cursor-pointer"
                >
                  Cancel (إلغاء)
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl luxury-btn-gold text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingEdit ? 'Saving...' : 'Save Changes (حفظ)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
