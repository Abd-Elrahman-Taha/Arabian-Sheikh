import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { Search, Ban, Trash2, Check } from 'lucide-react';

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
    <div className="space-y-6 animate-fade-in text-[var(--text-primary)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border-subtle)] pb-4 gap-4">
        <div>
          <h1 className="font-cinzel text-2xl font-bold uppercase tracking-wider text-[var(--text-primary)]">
            {t('admin.users')}
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Manage palace patrons, VIP privilege tiers, and administrative credentials.
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patron by name or email..."
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-card)] pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[var(--gold-primary)] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto bg-[var(--bg-secondary)] border border-[var(--border-card)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">ADMIN (Palace Masters)</option>
            <option value="USER">USER (Patrons)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] text-[var(--gold-primary)] uppercase font-cinzel">
              <th className="py-3 px-4">Patron</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Member Since</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[var(--text-muted)]">
                  Loading patrons...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[var(--text-muted)]">
                  No patrons found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-cinzel font-bold text-sm text-[var(--text-primary)] block">
                      {u.name}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[var(--text-muted)]">{u.email}</td>
                  <td className="py-3 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="bg-[var(--bg-secondary)] border border-[var(--border-card)] px-2 py-1 text-[11px] text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none cursor-pointer"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-[10px] font-mono uppercase ${u.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[var(--text-muted)]">{u.memberSince || '2025'}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggleBlock(u.id)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-[var(--gold-primary)] cursor-pointer"
                      title={u.status === 'ACTIVE' ? 'Suspend Access' : 'Restore Access'}
                    >
                      {u.status === 'ACTIVE' ? <Ban className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDelete(u.id, u.name)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-rose-400 cursor-pointer"
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
  );
}
