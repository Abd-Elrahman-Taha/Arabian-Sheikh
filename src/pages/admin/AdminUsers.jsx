import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { Users, Search, ShieldAlert, ShieldCheck, Ban, Trash2, Check } from 'lucide-react';

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
      setUsers(list);
    } catch (err) {
      console.error(err);
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
    <div className="space-y-6 animate-fade-in text-[#F3EEE5]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#C6A15B]/20 pb-4 gap-4">
        <div>
          <h1 className="font-cinzel text-2xl font-bold uppercase tracking-wider">
            {t('admin.users')}
          </h1>
          <p className="text-xs text-[#C5B8A8]">
            Manage palace patrons, VIP privilege tiers, and administrative credentials.
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-[#1C120E] border border-[#C6A15B]/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patron by name or email..."
            className="w-full bg-[#0F0D0C] border border-[#C6A15B]/30 pl-9 pr-3 py-2 text-xs text-[#F3EEE5] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[#C6A15B] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto bg-[#0F0D0C] border border-[#C6A15B]/30 px-3 py-2 text-xs text-[#F3EEE5] focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">ADMIN (Palace Masters)</option>
            <option value="USER">USER (Patrons)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#1C120E] border border-[#C6A15B]/20 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[#C6A15B]/20 text-[#C6A15B] uppercase font-cinzel">
              <th className="py-3 px-4">Patron</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Member Since</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C6A15B]/10 text-[#F3EEE5]">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#C5B8A8]">
                  Loading patrons...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#C5B8A8]">
                  No patrons found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-[#241712] transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-cinzel font-bold text-sm text-[#F3EEE5] block">
                      {u.name}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#C5B8A8]">{u.email}</td>
                  <td className="py-3 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="bg-[#0F0D0C] border border-[#C6A15B]/30 px-2 py-1 text-xs text-[#C6A15B] font-cinzel font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-mono border ${
                      u.status === 'ACTIVE'
                        ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                        : 'border-red-500/40 bg-red-950/40 text-red-400'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#C5B8A8]">{u.memberSince || '2025-01-01'}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleBlock(u.id)}
                        className={`p-1.5 ${
                          u.status === 'ACTIVE'
                            ? 'text-[#C5B8A8] hover:text-amber-400'
                            : 'text-emerald-400 hover:text-emerald-300'
                        }`}
                        title={u.status === 'ACTIVE' ? 'Block Account' : 'Unblock Account'}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        className="p-1.5 text-[#C5B8A8] hover:text-red-400"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
