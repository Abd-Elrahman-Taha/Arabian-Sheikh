import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { contentService, SUPPORTED_LANGUAGES } from '../../services/contentService';
import {
  HelpCircle,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Globe,
  Sliders,
  Power
} from 'lucide-react';

export default function AdminFaqs() {
  const { t } = useTranslation();
  const { success, error } = useToast();

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false
  });

  // Modals state
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [deleteConfirmFaq, setDeleteConfirmFaq] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    sortOrder: 0,
    isActive: true,
    translations: {
      en: { question: '', answer: '' },
      bg: { question: '', answer: '' },
      es: { question: '', answer: '' }
    }
  });
  const [activeTabLang, setActiveTabLang] = useState('en');

  const fetchFaqs = useCallback(async (page = pagination.page) => {
    setLoading(true);
    try {
      const response = await contentService.getAdminFaqs({
        page,
        pageSize: pagination.pageSize
      });
      setFaqs(response.items || []);
      setPagination({
        page: response.page || page,
        pageSize: response.pageSize || pagination.pageSize,
        totalCount: response.totalCount || 0,
        totalPages: response.totalPages || 1,
        hasPreviousPage: Boolean(response.hasPreviousPage),
        hasNextPage: Boolean(response.hasNextPage)
      });
    } catch (err) {
      error(err.message || 'Failed to load FAQs.');
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize, pagination.page, error]);

  useEffect(() => {
    fetchFaqs(1);
  }, []);

  // Filtered FAQs (client-side search & status filtering on current page)
  const filteredFaqs = faqs.filter(faq => {
    if (statusFilter === 'ACTIVE' && !faq.isActive) return false;
    if (statusFilter === 'INACTIVE' && faq.isActive) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchQ = (faq.question || '').toLowerCase().includes(q);
      const matchA = (faq.answer || '').toLowerCase().includes(q);
      const matchTrans = faq.translations?.some(
        t => t.question?.toLowerCase().includes(q) || t.answer?.toLowerCase().includes(q)
      );
      return matchQ || matchA || matchTrans;
    }
    return true;
  });

  // Inline Status Toggle with Optimistic UI
  const handleToggleStatus = async (faq) => {
    const previousStatus = faq.isActive;
    const nextStatus = !previousStatus;

    // Optimistic local update
    setFaqs(prev => prev.map(item => item.id === faq.id ? { ...item, isActive: nextStatus } : item));

    try {
      await contentService.toggleFaqActive(faq.id, nextStatus);
      success(`FAQ #${faq.id} is now ${nextStatus ? 'ACTIVE' : 'INACTIVE'}.`);
    } catch (err) {
      // Rollback on error
      setFaqs(prev => prev.map(item => item.id === faq.id ? { ...item, isActive: previousStatus } : item));
      error(err.message || 'Failed to update FAQ status.');
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setSelectedFaq(null);
    setFormData({
      sortOrder: faqs.length,
      isActive: true,
      translations: {
        en: { question: '', answer: '' },
        bg: { question: '', answer: '' },
        es: { question: '', answer: '' }
      }
    });
    setActiveTabLang('en');
    setModalMode('create');
  };

  // Open Edit Modal
  const handleOpenEdit = async (faq) => {
    setSelectedFaq(faq);
    setModalMode('edit');
    setActiveTabLang('en');

    try {
      // Fetch full details with all translations from server
      const details = await contentService.getAdminFaqById(faq.id);
      const transMap = {
        en: { question: '', answer: '' },
        bg: { question: '', answer: '' },
        es: { question: '', answer: '' }
      };

      (details.translations || []).forEach(t => {
        const lang = String(t.languageCode || '').toLowerCase();
        if (transMap[lang]) {
          transMap[lang] = {
            question: t.question || '',
            answer: t.answer || ''
          };
        }
      });

      setFormData({
        sortOrder: details.sortOrder || 0,
        isActive: details.isActive !== false,
        translations: transMap
      });
    } catch (err) {
      error(err.message || 'Failed to fetch FAQ details for editing.');
      setModalMode(null);
    }
  };

  // Handle Form Submit (Create or Update)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      // Build translations array: include only languages that have either question or answer typed
      const translationsArray = Object.entries(formData.translations)
        .filter(([_, trans]) => trans.question.trim() || trans.answer.trim())
        .map(([lang, trans]) => ({
          languageCode: lang,
          question: trans.question.trim(),
          answer: trans.answer.trim()
        }));

      if (translationsArray.length === 0) {
        throw new Error('Please provide at least one language translation for this FAQ.');
      }

      const payload = {
        sortOrder: Math.max(0, Number(formData.sortOrder) || 0),
        isActive: Boolean(formData.isActive),
        translations: translationsArray
      };

      if (modalMode === 'create') {
        await contentService.createFaq(payload);
        success('New FAQ created successfully.');
      } else if (modalMode === 'edit' && selectedFaq) {
        await contentService.updateFaq(selectedFaq.id, payload);
        success(`FAQ #${selectedFaq.id} updated successfully.`);
      }

      setModalMode(null);
      fetchFaqs(pagination.page);
    } catch (err) {
      error(err.message || 'Failed to save FAQ.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete FAQ
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmFaq) return;
    setActionLoading(true);

    try {
      await contentService.deleteFaq(deleteConfirmFaq.id);
      success(`FAQ #${deleteConfirmFaq.id} deleted permanently.`);
      setDeleteConfirmFaq(null);
      fetchFaqs(pagination.page);
    } catch (err) {
      error(err.message || 'Failed to delete FAQ.');
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
              <HelpCircle className="w-5 h-5" />
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0]">
              FAQ Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#D8BE99] font-medium mt-1">
            Manage multilingual client queries, sort order, and real-time storefront publication.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchFaqs(pagination.page)}
            disabled={loading}
            className="p-2.5 rounded-xl bg-black/60 hover:bg-[#21130D] border border-[#D4AF37]/30 text-[#D8BE99] hover:text-[#F2D675] transition-all cursor-pointer disabled:opacity-50"
            title="Refresh FAQs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#D4AF37] hover:brightness-110 text-black font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add FAQ</span>
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
            placeholder="Search questions or answers..."
            className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['ALL', 'ACTIVE', 'INACTIVE'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-cinzel uppercase tracking-wider font-semibold border transition-all cursor-pointer ${
                statusFilter === status
                  ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#F2D675]'
                  : 'border-[#D4AF37]/25 bg-black/50 text-[#D8BE99] hover:text-[#F3E6D0]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Table */}
      <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#D8BE99]">
            <thead className="bg-black/80 text-[#F2D675] font-cinzel uppercase tracking-widest text-[11px] border-b border-[#D4AF37]/30">
              <tr>
                <th className="py-4 px-5">ID</th>
                <th className="py-4 px-5">Question & Answer Preview</th>
                <th className="py-4 px-4 text-center">Languages</th>
                <th className="py-4 px-4 text-center">Sort Order</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/15">
              {loading && faqs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-[#D8BE99]">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#D4AF37]" />
                      <span className="font-cinzel text-xs uppercase tracking-wider">Loading FAQs from Palace Vault...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredFaqs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-[#D8BE99]">
                    <HelpCircle className="w-10 h-10 mx-auto text-[#D4AF37]/40 mb-3" />
                    <p className="font-cinzel text-sm text-[#F3E6D0] uppercase tracking-wider">No FAQs Found</p>
                    <p className="text-xs text-[#D8BE99] mt-1">
                      {search ? 'Try adjusting your search criteria.' : 'Create your first frequently asked question above.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredFaqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-5 font-mono text-[#D4AF37] font-bold">
                      #{faq.id}
                    </td>
                    <td className="py-4 px-5 max-w-md">
                      <p className="text-sm font-semibold text-[#F3E6D0] line-clamp-1">
                        {faq.question || 'Untitled Question'}
                      </p>
                      <p className="text-xs text-[#D8BE99]/70 line-clamp-2 mt-0.5 font-sans">
                        {faq.answer || 'No answer content specified.'}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 flex-wrap justify-center">
                        {SUPPORTED_LANGUAGES.map(lang => {
                          const hasLang = faq.availableLanguages?.includes(lang.code);
                          return (
                            <span
                              key={lang.code}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                hasLang
                                  ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/60 text-[#F2D675]'
                                  : 'bg-black/40 border border-white/10 text-white/20'
                              }`}
                              title={hasLang ? `${lang.label} translated` : `${lang.label} not provided`}
                            >
                              {lang.code}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-mono text-xs text-[#F3E6D0]">
                      {faq.sortOrder}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {/* Interactive Switch with Optimistic Feedback */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(faq)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-cinzel uppercase font-bold tracking-wider transition-all cursor-pointer border ${
                          faq.isActive
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/40'
                            : 'bg-zinc-900/60 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800/60'
                        }`}
                        title="Click to toggle active status"
                      >
                        <Power className="w-2.5 h-2.5" />
                        <span>{faq.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(faq)}
                          className="p-1.5 bg-black/60 hover:bg-[#D4AF37]/20 text-[#D8BE99] hover:text-[#F2D675] border border-[#D4AF37]/30 rounded-lg transition-all cursor-pointer"
                          title="Edit FAQ"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmFaq(faq)}
                          className="p-1.5 bg-black/60 hover:bg-red-950/50 text-[#D8BE99] hover:text-red-400 border border-[#D4AF37]/30 rounded-lg transition-all cursor-pointer"
                          title="Delete FAQ"
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
        <div className="bg-black/80 border-t border-[#D4AF37]/30 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#D8BE99]">
          <div>
            Showing <span className="font-bold text-[#F2D675]">{filteredFaqs.length}</span> of{' '}
            <span className="font-bold text-[#F2D675]">{pagination.totalCount}</span> FAQs
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchFaqs(Math.max(1, pagination.page - 1))}
              disabled={!pagination.hasPreviousPage || loading}
              className="px-3 py-1.5 bg-black/60 border border-[#D4AF37]/30 rounded-lg text-xs text-[#D8BE99] hover:text-[#F2D675] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className="font-mono text-xs px-2 text-[#F3E6D0]">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchFaqs(pagination.page + 1)}
              disabled={!pagination.hasNextPage || loading}
              className="px-3 py-1.5 bg-black/60 border border-[#D4AF37]/30 rounded-lg text-xs text-[#D8BE99] hover:text-[#F2D675] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal 1: Add / Edit FAQ */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#120B06] border border-[#D4AF37]/50 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/30 bg-black/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#D4AF37] rounded-lg text-black">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cinzel text-lg font-bold text-[#F2D675] uppercase">
                    {modalMode === 'create' ? 'Create New FAQ' : `Edit FAQ #${selectedFaq?.id}`}
                  </h3>
                  <p className="text-[11px] text-[#D8BE99]">
                    Provide localized question and answer content across supported languages.
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

            <form onSubmit={handleFormSubmit} className="p-6 space-y-5 text-xs">
              {/* Settings Row: Sort Order & Active */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/40 p-3.5 rounded-xl border border-[#D4AF37]/20">
                <div>
                  <label className="block text-[#D8BE99] font-cinzel uppercase tracking-wider mb-1 font-semibold text-[11px]">
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full px-3 py-2 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-[#F3E6D0] font-mono focus:border-[#D4AF37] focus:outline-none"
                  />
                  <p className="text-[10px] text-[#D8BE99]/60 mt-1">Lower numbers appear higher in customer FAQ listing.</p>
                </div>

                <div className="flex flex-col justify-center">
                  <label className="block text-[#D8BE99] font-cinzel uppercase tracking-wider mb-2 font-semibold text-[11px]">
                    Status
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="accent-[#D4AF37] w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-[#F3E6D0]">
                      {formData.isActive ? 'Active (Visible on Storefront)' : 'Inactive (Hidden)'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Multilingual Translation Tabs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[#D8BE99] font-cinzel uppercase tracking-wider font-semibold text-[11px]">
                    Localized Translations <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[10px] text-[#D8BE99]/70">At least one language translation required</span>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#D4AF37]/30 gap-1 bg-black/30 p-1 rounded-t-xl">
                  {SUPPORTED_LANGUAGES.map(lang => {
                    const trans = formData.translations[lang.code];
                    const isFilled = Boolean(trans?.question?.trim() && trans?.answer?.trim());
                    const isActive = activeTabLang === lang.code;

                    return (
                      <button
                        type="button"
                        key={lang.code}
                        onClick={() => setActiveTabLang(lang.code)}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-cinzel uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          isActive
                            ? 'bg-[#D4AF37] text-black shadow-md'
                            : 'text-[#D8BE99] hover:text-[#F3E6D0] hover:bg-white/5'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                        {isFilled && (
                          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-black' : 'bg-emerald-400'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Active Tab Content */}
                <div className="bg-black/50 border border-t-0 border-[#D4AF37]/30 p-4 rounded-b-xl space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-semibold text-[#D8BE99] uppercase">
                        Question ({activeTabLang.toUpperCase()})
                      </label>
                      <span className="text-[10px] font-mono text-[#D8BE99]/60">
                        {formData.translations[activeTabLang]?.question?.length || 0}/500
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={500}
                      value={formData.translations[activeTabLang]?.question || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          translations: {
                            ...prev.translations,
                            [activeTabLang]: {
                              ...prev.translations[activeTabLang],
                              question: val
                            }
                          }
                        }));
                      }}
                      placeholder={`Enter question in ${SUPPORTED_LANGUAGES.find(l => l.code === activeTabLang)?.label}...`}
                      className="w-full px-3.5 py-2.5 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-semibold text-[#D8BE99] uppercase">
                        Answer ({activeTabLang.toUpperCase()})
                      </label>
                      <span className="text-[10px] font-mono text-[#D8BE99]/60">
                        {formData.translations[activeTabLang]?.answer?.length || 0}/2000
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      maxLength={2000}
                      value={formData.translations[activeTabLang]?.answer || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          translations: {
                            ...prev.translations,
                            [activeTabLang]: {
                              ...prev.translations[activeTabLang],
                              answer: val
                            }
                          }
                        }));
                      }}
                      placeholder={`Enter comprehensive answer in ${SUPPORTED_LANGUAGES.find(l => l.code === activeTabLang)?.label}...`}
                      className="w-full px-3.5 py-2.5 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none text-xs resize-none"
                    />
                  </div>
                </div>
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
                  {actionLoading ? 'Persisting...' : modalMode === 'create' ? 'Create FAQ' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Delete Confirmation Modal */}
      {deleteConfirmFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#120B06] border border-red-500/50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-cinzel text-lg font-bold text-red-400 uppercase">
                Delete FAQ #{deleteConfirmFaq.id}
              </h3>
              <p className="text-xs text-[#D8BE99] leading-relaxed">
                Are you sure you want to permanently delete this frequently asked question?
              </p>
              <div className="bg-black/60 border border-red-500/20 p-3 rounded-xl text-left text-xs">
                <p className="font-semibold text-white truncate">"{deleteConfirmFaq.question}"</p>
                <p className="text-[11px] text-red-300/80 mt-1">
                  ⚠️ This action cannot be undone. All multilingual translations ({deleteConfirmFaq.availableLanguages?.join(', ').toUpperCase()}) will be removed from the database.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmFaq(null)}
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
