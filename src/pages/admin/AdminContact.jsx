import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { contentService, CONTACT_TYPES } from '../../services/contentService';
import {
  PhoneCall,
  Phone,
  Mail,
  MapPin,
  Share2,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  ExternalLink,
  Power
} from 'lucide-react';

export default function AdminContact() {
  const { t } = useTranslation();
  const { success, error } = useToast();

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modals
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [selectedContact, setSelectedContact] = useState(null);
  const [deleteConfirmContact, setDeleteConfirmContact] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    type: 'Phone',
    value: '',
    isActive: true
  });

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await contentService.getAdminContact();
      setContacts(data || []);
    } catch (err) {
      error(err.message || 'Failed to load contact entries.');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Filtered contacts
  const filteredContacts = contacts.filter(item => {
    if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchType = (item.type || '').toLowerCase().includes(q);
      const matchVal = (item.value || '').toLowerCase().includes(q);
      return matchType || matchVal;
    }
    return true;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Phone':
        return <Phone className="w-4 h-4 text-emerald-400" />;
      case 'Email':
        return <Mail className="w-4 h-4 text-amber-400" />;
      case 'Address':
        return <MapPin className="w-4 h-4 text-sky-400" />;
      case 'Social':
        return <Share2 className="w-4 h-4 text-purple-400" />;
      default:
        return <PhoneCall className="w-4 h-4 text-[#D4AF37]" />;
    }
  };

  // Open Create
  const handleOpenCreate = () => {
    setSelectedContact(null);
    setFormData({
      type: 'Phone',
      value: '',
      isActive: true
    });
    setModalMode('create');
  };

  // Open Edit
  const handleOpenEdit = (contact) => {
    setSelectedContact(contact);
    setFormData({
      type: contact.type || 'Phone',
      value: contact.value || '',
      isActive: contact.isActive !== false
    });
    setModalMode('edit');
  };

  // Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const payload = {
        type: formData.type,
        value: formData.value.trim(),
        isActive: Boolean(formData.isActive)
      };

      if (modalMode === 'create') {
        await contentService.createContact(payload);
        success('New contact information entry added.');
      } else if (modalMode === 'edit' && selectedContact) {
        await contentService.updateContact(selectedContact.id, payload);
        success('Contact information updated.');
      }

      setModalMode(null);
      fetchContacts();
    } catch (err) {
      error(err.message || 'Failed to save contact entry.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Contact
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmContact) return;
    setActionLoading(true);

    try {
      await contentService.deleteContact(deleteConfirmContact.id);
      success('Contact entry deleted permanently.');
      setDeleteConfirmContact(null);
      fetchContacts();
    } catch (err) {
      error(err.message || 'Failed to delete contact entry.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#F3E6D0]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D4AF37]/20 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-black border border-[#D4AF37]/40 text-[#F2D675]">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0]">
              Concierge Contact Information
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#D8BE99] font-medium mt-1">
            Manage official telephone lines, private VIP concierge email addresses, boutique addresses, and social media handles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchContacts}
            disabled={loading}
            className="p-2.5 rounded-xl bg-black/60 hover:bg-[#21130D] border border-[#D4AF37]/30 text-[#D8BE99] hover:text-[#F2D675] transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Contacts"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#D4AF37] hover:brightness-110 text-black font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contact details..."
            className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          {['ALL', ...CONTACT_TYPES].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-cinzel uppercase tracking-wider font-semibold border transition-all cursor-pointer ${
                typeFilter === type
                  ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#F2D675]'
                  : 'border-[#D4AF37]/25 bg-black/50 text-[#D8BE99] hover:text-[#F3E6D0]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Contact Table */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#D8BE99]">
            <thead className="bg-black/80 text-[#F2D675] font-cinzel uppercase tracking-widest text-[11px] border-b border-[#D4AF37]/30">
              <tr>
                <th className="py-4 px-5">Type</th>
                <th className="py-4 px-5">Contact Value / Destination</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/15">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center text-[#D8BE99]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#D4AF37] mb-2" />
                    <span className="font-cinzel text-xs uppercase tracking-wider">Loading Concierge Channels...</span>
                  </td>
                </tr>
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center text-[#D8BE99]">
                    <PhoneCall className="w-10 h-10 mx-auto text-[#D4AF37]/40 mb-3" />
                    <p className="font-cinzel text-sm text-[#F3E6D0] uppercase tracking-wider">No Contact Items Found</p>
                    <p className="text-xs text-[#D8BE99] mt-1">
                      {search ? 'Try adjusting your search criteria.' : 'Add your first official contact channel above.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-black/60 border border-[#D4AF37]/20">
                          {getTypeIcon(contact.type)}
                        </div>
                        <span className="font-cinzel font-bold text-xs uppercase tracking-wider text-[#F3E6D0]">
                          {contact.type}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5 font-mono text-xs">
                      {contact.type === 'Social' ? (
                        <a
                          href={contact.value}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#D4AF37] hover:underline flex items-center gap-1.5 truncate max-w-lg"
                        >
                          <span>{contact.value}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : contact.type === 'Email' ? (
                        <a
                          href={`mailto:${contact.value}`}
                          className="text-[#F3E6D0] hover:text-[#D4AF37] transition-colors"
                        >
                          {contact.value}
                        </a>
                      ) : contact.type === 'Phone' ? (
                        <a
                          href={`tel:${contact.value}`}
                          className="text-[#F3E6D0] hover:text-[#D4AF37] transition-colors"
                        >
                          {contact.value}
                        </a>
                      ) : (
                        <span className="text-[#F3E6D0] font-sans text-xs">{contact.value}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-cinzel font-bold uppercase tracking-wider border ${
                        contact.isActive
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400'
                          : 'bg-zinc-900/60 border-zinc-700/50 text-zinc-400'
                      }`}>
                        {contact.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(contact)}
                          className="p-1.5 bg-black/60 hover:bg-[#D4AF37]/20 text-[#D8BE99] hover:text-[#F2D675] border border-[#D4AF37]/30 rounded-lg transition-all cursor-pointer"
                          title="Edit Contact"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmContact(contact)}
                          className="p-1.5 bg-black/60 hover:bg-red-950/50 text-[#D8BE99] hover:text-red-400 border border-[#D4AF37]/30 rounded-lg transition-all cursor-pointer"
                          title="Delete Contact"
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
      </div>

      {/* Modal 1: Add / Edit Contact */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#120B06] border border-[#D4AF37]/50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/30 bg-black/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#D4AF37] rounded-lg text-black">
                  {getTypeIcon(formData.type)}
                </div>
                <div>
                  <h3 className="font-cinzel text-lg font-bold text-[#F2D675] uppercase">
                    {modalMode === 'create' ? 'Add Contact Information' : `Edit Contact #${selectedContact?.id}`}
                  </h3>
                  <p className="text-[11px] text-[#D8BE99]">
                    Publish official communication points for client concierge and order inquiries.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="text-[#D8BE99] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              {/* Type Selector */}
              <div>
                <label className="block text-[#D8BE99] font-cinzel uppercase tracking-wider mb-1.5 font-semibold">
                  Channel Type <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CONTACT_TYPES.map(type => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setFormData({ ...formData, type })}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer font-cinzel text-xs uppercase tracking-wider font-bold ${
                        formData.type === type
                          ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#F2D675] shadow-sm'
                          : 'border-[#D4AF37]/20 bg-black/50 text-[#D8BE99] hover:text-white'
                      }`}
                    >
                      {getTypeIcon(type)}
                      <span>{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Value Input with Dynamic Context */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[#D8BE99] font-cinzel uppercase tracking-wider font-semibold">
                    Contact Value / Address <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-[#D8BE99]/60">
                    {formData.value.length}/500
                  </span>
                </div>
                <input
                  type={formData.type === 'Email' ? 'email' : formData.type === 'Social' ? 'url' : 'text'}
                  required
                  maxLength={500}
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={
                    formData.type === 'Phone' ? '+971 4 800-SHEIKH or +966 50 123 4567' :
                    formData.type === 'Email' ? 'concierge@arabiansheikh.com' :
                    formData.type === 'Address' ? 'Downtown Dubai Boulevard, Royal Pavilion Suite 40, Dubai, UAE' :
                    'https://instagram.com/arabiansheikh_official'
                  }
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none text-xs font-mono"
                />
                <p className="text-[10px] text-[#D8BE99]/60 mt-1">
                  {formData.type === 'Phone' && 'Include country code prefix for international clientele.'}
                  {formData.type === 'Email' && 'Must be a valid email format for incoming patronage inquiries.'}
                  {formData.type === 'Address' && 'Physical boutique or royal salon address.'}
                  {formData.type === 'Social' && 'Absolute link starting with http:// or https://'}
                </p>
              </div>

              {/* Active Toggle */}
              <div className="p-3 rounded-xl bg-black/40 border border-[#D4AF37]/20 flex items-center justify-between">
                <div>
                  <p className="font-cinzel text-xs uppercase tracking-wider text-[#F2D675] font-bold">
                    Active Status
                  </p>
                  <p className="text-[10px] text-[#D8BE99]/70">
                    Display this channel on storefront contact and footer areas.
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

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
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
                  {actionLoading ? 'Saving...' : modalMode === 'create' ? 'Add Contact' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Delete Confirmation Modal */}
      {deleteConfirmContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#120B06] border border-red-500/50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-cinzel text-lg font-bold text-red-400 uppercase">
                Delete Contact Item
              </h3>
              <p className="text-xs text-[#D8BE99] leading-relaxed">
                Are you sure you want to permanently delete this official contact channel?
              </p>
              <div className="bg-black/60 border border-red-500/20 p-3 rounded-xl text-left text-xs">
                <div className="flex items-center gap-2 mb-1">
                  {getTypeIcon(deleteConfirmContact.type)}
                  <span className="font-cinzel font-bold text-white uppercase text-[11px]">{deleteConfirmContact.type}</span>
                </div>
                <p className="font-mono text-zinc-300 break-all">{deleteConfirmContact.value}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmContact(null)}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-xs text-[#D8BE99] hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-cinzel font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
