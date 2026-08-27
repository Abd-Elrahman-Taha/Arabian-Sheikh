import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { Search, Ban, Trash2, Check, RefreshCw, Phone } from 'lucide-react';

export default function AdminUsers() {
  const { t } = useTranslation();
  const { success, error } = useToast();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const list = await userService.getAllUsers({ search, role: roleFilter });
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Could not fetch patrons from server:', err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateUserRole(userId, newRole);
      success('Patron role updated.');
      fetchUsers();
    } catch (err) {
      error(err.message || 'Could not change role.');
    }
  };

  const handleToggleBlock = async (userId) => {
    try {
      const updated = await userService.toggleUserBlock(userId);
      success(`User account is now ${updated.status}.`);
      fetchUsers();
    } catch (err) {
      error(err.message || 'Action failed.');
    }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Permanently remove ${name} from Palace register?`)) return;
    try {
      await userService.deleteUser(userId);
      success('User deleted.');
      fetchUsers();
    } catch (err) {
      error(err.message || 'Could not delete user.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#F3E6D0]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D4AF37]/20 pb-4 gap-4">
        <div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0]">
            {t('admin.users')}
          </h1>
          <p className="text-xs text-[#D8BE99] font-medium mt-0.5">
            Manage palace patrons, VIP privilege tiers, and administrative credentials.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="px-4 py-2.5 rounded-full border border-[#D4AF37]/40 bg-black/60 hover:bg-[#21130D] text-xs font-cinzel font-bold text-[#F3E6D0] hover:text-[#F2D675] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
          <span>{loading ? 'Syncing...' : 'Sync Patrons'}</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patron by name or email..."
            className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl pl-9 pr-3 py-2 text-xs text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto bg-black/60 border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer font-medium"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">ADMIN (Palace Masters)</option>
            <option value="USER">USER (Patrons)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#D4AF37]/25 text-[#F2D675] uppercase font-cinzel font-bold">
                <th className="py-3.5 px-4">Patron</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Shipping Contact</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Member Since</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/15 text-[#F3E6D0]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#D8BE99] font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#D4AF37]" />
                      <span className="font-mono text-xs text-[#D8BE99]">Querying real patrons directly from backend server...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#D8BE99] font-medium">
                    <div className="space-y-1">
                      <p className="font-cinzel text-sm text-[#F3E6D0]">No registered patrons returned by the server.</p>
                      <p className="font-mono text-xs text-[#D8BE99]/60">
                        When customers register via POST /api/auth/register, they will appear here once the backend deploys GET /api/admin/customers.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-cinzel font-bold text-sm text-[#F3E6D0] block">
                        {u.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#D8BE99] font-medium">{u.email}</td>
                    <td className="py-3.5 px-4">
                      {u.phone ? (
                        <a
                          href={`tel:${u.phone}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/35 text-[#F2D675] font-mono text-[11px] hover:bg-[#D4AF37]/20 transition-colors"
                          title="Click to contact patron for shipping"
                        >
                          <Phone className="w-3 h-3 text-[#D4AF37]" />
                          <span>{u.phone}</span>
                        </a>
                      ) : (
                        <span className="text-[#D8BE99]/40 font-mono text-[11px] italic">Not provided</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-black/70 border border-[#D4AF37]/35 rounded-lg px-2.5 py-1 text-[11px] text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer font-medium"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 text-[10px] font-mono uppercase rounded-full font-bold ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#D8BE99] font-medium">{u.memberSince || '2025'}</td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleBlock(u.id)}
                        className="p-1.5 text-[#D8BE99] hover:text-[#F2D675] cursor-pointer transition-colors"
                        title={u.status === 'ACTIVE' ? 'Suspend Access' : 'Restore Access'}
                      >
                        {u.status === 'ACTIVE' ? <Ban className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        className="p-1.5 text-[#D8BE99] hover:text-rose-400 cursor-pointer transition-colors"
                        title="Purge Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
