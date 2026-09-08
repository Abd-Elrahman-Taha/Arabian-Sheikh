import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { contentService, SUPPORTED_LANGUAGES, PREDEFINED_SYSTEM_PAGES } from '../../services/contentService';
import {
  FileText,
  Edit2,
  RefreshCw,
  Shield,
  CheckCircle2,
  Globe,
  Lock,
  Eye,
  Code,
  X,
  Sparkles,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

export default function AdminPages() {
  const { t } = useTranslation();
  const { success, error } = useToast();

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit Modal State
  const [editingPage, setEditingPage] = useState(null);
  const [formData, setFormData] = useState({
    translations: {
      en: { title: '', content: '' },
      bg: { title: '', content: '' },
      es: { title: '', content: '' }
    }
  });
  const [activeTabLang, setActiveTabLang] = useState('en');
  const [previewMode, setPreviewMode] = useState(false);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await contentService.getAdminPages();
      setPages(data || []);
    } catch (err) {
      error(err.message || 'Failed to load policy pages.');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // Open Edit Modal — Prepopulate immediately from existing page data
  const handleOpenEdit = async (page) => {
    setEditingPage(page);
    setActiveTabLang('en');
    setPreviewMode(false);

    // Initial instant populate from cached list data
    const transMap = {
      en: { title: '', content: '' },
      bg: { title: '', content: '' },
      es: { title: '', content: '' }
    };

    (page?.translations || []).forEach((tr) => {
      const lang = String(tr.languageCode || '').toLowerCase();
      if (transMap[lang]) {
        transMap[lang] = {
          title: tr.title || '',
          content: tr.content || ''
        };
      }
    });

    setFormData({ translations: transMap });

    // Background fetch detailed slug translations to ensure absolute freshness
    try {
      const details = await contentService.getAdminPageBySlug(page.slug);
      if (details?.translations && Array.isArray(details.translations)) {
        const freshMap = { ...transMap };
        details.translations.forEach((tr) => {
          const lang = String(tr.languageCode || '').toLowerCase();
          if (freshMap[lang]) {
            freshMap[lang] = {
              title: tr.title || '',
              content: tr.content || ''
            };
          }
        });
        setFormData({ translations: freshMap });
      }
    } catch (err) {
      // Non-blocking: local pre-fill is already active
      console.warn('Could not refresh detailed page translations:', err.message);
    }
  };

  // Submit Edit Policy
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!editingPage) return;
    setActionLoading(true);

    try {
      const entries = Object.entries(formData.translations);
      
      // Validate each language tab
      for (const [lang, trans] of entries) {
        const hasTitle = Boolean(trans.title?.trim());
        const hasContent = Boolean(trans.content?.trim());
        if (hasTitle && !hasContent) {
          throw new Error(`Please provide content for the [${lang.toUpperCase()}] translation, or clear its title.`);
        }
        if (!hasTitle && hasContent) {
          throw new Error(`Please provide a title for the [${lang.toUpperCase()}] translation, or clear its content.`);
        }
      }

      const translationsArray = entries
        .filter(([_, trans]) => trans.title?.trim() && trans.content?.trim())
        .map(([lang, trans]) => ({
          languageCode: lang,
          title: trans.title.trim(),
          content: trans.content.trim()
        }));

      if (translationsArray.length === 0) {
        throw new Error('At least one complete language translation (Title and Content) is required.');
      }

      // System policies are permanently active contracts
      const payload = {
        isActive: true,
        translations: translationsArray
      };

      await contentService.updatePage(editingPage.slug, payload);
      success(`System policy '${editingPage.title || editingPage.slug}' updated successfully.`);
      setEditingPage(null);
      fetchPages();
    } catch (err) {
      error(err.message || 'Failed to update policy page.');
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
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0]">
              Legal Policies
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#D8BE99] font-medium mt-1">
            Predefined system charters. Administrators can edit policy terms and multilingual translations.
          </p>
        </div>

        <button
          onClick={fetchPages}
          disabled={loading}
          className="p-2.5 rounded-xl bg-black/60 hover:bg-[#21130D] border border-[#D4AF37]/30 text-[#D8BE99] hover:text-[#F2D675] transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
          title="Refresh Policies"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* System Policy Information Banner */}
      <div className="p-4 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 flex items-start gap-3.5 shadow-xl backdrop-blur-md">
        <div className="p-2 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#F2D675] shrink-0 mt-0.5">
          <Shield className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs text-[#D8BE99]">
          <p className="font-cinzel text-[#F2D675] font-bold text-xs uppercase tracking-wider">
            Permanent System Charters
          </p>
          <p className="leading-relaxed">
            These four foundational policies (<strong className="text-[#F3E6D0]">Privacy Policy, Terms & Conditions, Shipping Policy, Returns & Refunds</strong>) are permanent legal contracts bound to the storefront, customer checkout, and consumer law. You can <strong className="text-[#F2D675]">only edit</strong> their terms, titles, and multilingual translations. They cannot be created, deleted, or deactivated.
          </p>
        </div>
      </div>

      {/* Policies Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-[#D8BE99]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#D4AF37] mb-2" />
            <span className="font-cinzel text-xs uppercase tracking-wider">Loading System Policies...</span>
          </div>
        ) : (
          pages.map((page) => {
            const meta = PREDEFINED_SYSTEM_PAGES.find(p => p.slug === page.slug);
            const displayTitle = page.title || meta?.defaultTitle || page.slug;

            return (
              <div
                key={page.slug}
                className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 rounded-2xl p-5 shadow-2xl flex flex-col justify-between backdrop-blur-md hover:border-[#D4AF37]/60 transition-all group"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-cinzel text-base font-bold text-[#F3E6D0] group-hover:text-[#F2D675] transition-colors">
                          {displayTitle}
                        </h3>
                      </div>
                      <p className="font-mono text-[11px] text-[#D4AF37]/80 mt-0.5">
                        /{page.slug}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-cinzel font-bold uppercase tracking-wider bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F2D675] shrink-0">
                      <Lock className="w-3 h-3 text-[#D4AF37]" />
                      <span>System Charter</span>
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#D8BE99]/80 font-sans leading-relaxed line-clamp-2">
                    {meta?.description || 'Permanent royal legal charter governing patron relations and boutique orders.'}
                  </p>

                  {/* Available Languages */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-[#D8BE99] font-medium mr-1 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-[#D4AF37]" />
                      <span>Translations:</span>
                    </span>
                    {SUPPORTED_LANGUAGES.map((lang) => {
                      const hasLang = page.availableLanguages?.includes(lang.code);
                      return (
                        <span
                          key={lang.code}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            hasLang
                              ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/60 text-[#F2D675]'
                              : 'bg-black/40 border border-white/10 text-white/20'
                          }`}
                        >
                          {lang.code}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Card Actions: Single Primary Action is Edit Policy */}
                <div className="pt-4 mt-4 border-t border-[#D4AF37]/20 flex items-center justify-between">
                  <a
                    href={`/${page.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#D8BE99] hover:text-[#F2D675] flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Storefront View</span>
                  </a>

                  <button
                    onClick={() => handleOpenEdit(page)}
                    className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#F2D675] hover:brightness-110 text-black font-cinzel font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Policy</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Policy Modal */}
      {editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#120B06] border border-[#D4AF37]/50 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#D4AF37]/30 bg-black/40 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#D4AF37] rounded-lg text-black">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cinzel text-lg font-bold text-[#F2D675] uppercase">
                    Edit {editingPage.title || editingPage.slug}
                  </h3>
                  <p className="text-[11px] text-[#D8BE99]">
                    System Charter: <span className="font-mono text-[#D4AF37]">/{editingPage.slug}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingPage(null)}
                className="text-[#D8BE99] hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Multilingual Tabs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[#D8BE99] font-cinzel uppercase tracking-wider font-semibold text-[11px]">
                    Multilingual Content <span className="text-red-400">*</span>
                  </label>
                  {/* Mode switch: Edit vs Preview */}
                  <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-[#D4AF37]/25">
                    <button
                      type="button"
                      onClick={() => setPreviewMode(false)}
                      className={`px-2.5 py-1 rounded text-[10px] font-cinzel uppercase font-bold flex items-center gap-1 cursor-pointer transition-all ${
                        !previewMode ? 'bg-[#D4AF37] text-black' : 'text-[#D8BE99]'
                      }`}
                    >
                      <Code className="w-3 h-3" />
                      <span>Editor</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode(true)}
                      className={`px-2.5 py-1 rounded text-[10px] font-cinzel uppercase font-bold flex items-center gap-1 cursor-pointer transition-all ${
                        previewMode ? 'bg-[#D4AF37] text-black' : 'text-[#D8BE99]'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Live Preview</span>
                    </button>
                  </div>
                </div>

                {/* Language Select Tabs */}
                <div className="flex border-b border-[#D4AF37]/30 gap-1 bg-black/30 p-1 rounded-t-xl">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const trans = formData.translations[lang.code];
                    const hasTitle = Boolean(trans?.title?.trim());
                    const hasContent = Boolean(trans?.content?.trim());
                    const isComplete = hasTitle && hasContent;
                    const isPartial = (hasTitle && !hasContent) || (!hasTitle && hasContent);
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
                        {isComplete && (
                          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-black' : 'bg-emerald-400'}`} title="Complete" />
                        )}
                        {isPartial && (
                          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-black' : 'bg-amber-400'}`} title="Partially filled" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Body */}
                <div className="bg-black/50 border border-t-0 border-[#D4AF37]/30 p-4 rounded-b-xl space-y-4">
                  {/* Title Field */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-semibold text-[#D8BE99] uppercase">
                        Policy Title ({activeTabLang.toUpperCase()})
                      </label>
                      <span className="text-[10px] font-mono text-[#D8BE99]/60">
                        {formData.translations[activeTabLang]?.title?.length || 0}/200
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={200}
                      value={formData.translations[activeTabLang]?.title || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          translations: {
                            ...prev.translations,
                            [activeTabLang]: {
                              ...prev.translations[activeTabLang],
                              title: val
                            }
                          }
                        }));
                      }}
                      placeholder={`Enter ${SUPPORTED_LANGUAGES.find(l => l.code === activeTabLang)?.label} title...`}
                      className="w-full px-3.5 py-2.5 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none text-xs"
                    />
                  </div>

                  {/* Content Field or Live Preview */}
                  {previewMode ? (
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold text-[#D8BE99] uppercase">
                        Rendered Storefront Preview ({activeTabLang.toUpperCase()})
                      </label>
                      <div className="p-5 bg-black/70 border border-[#D4AF37]/20 rounded-xl text-[#F3E6D0] min-h-[220px] max-h-[350px] overflow-y-auto space-y-3 font-sans leading-relaxed text-xs">
                        <h2 className="font-cinzel text-base font-bold text-[#F2D675] border-b border-[#D4AF37]/20 pb-2">
                          {formData.translations[activeTabLang]?.title || 'Policy Title Preview'}
                        </h2>
                        <div className="whitespace-pre-wrap text-[#D8BE99]">
                          {formData.translations[activeTabLang]?.content || (
                            <em className="text-zinc-500">No content entered for this language yet.</em>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[11px] font-semibold text-[#D8BE99] uppercase">
                          Policy Body Terms ({activeTabLang.toUpperCase()})
                        </label>
                        <span className="text-[10px] text-[#D8BE99]/60">Supports plain text & paragraphs</span>
                      </div>
                      <textarea
                        rows={10}
                        value={formData.translations[activeTabLang]?.content || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            translations: {
                              ...prev.translations,
                              [activeTabLang]: {
                                ...prev.translations[activeTabLang],
                                content: val
                              }
                            }
                          }));
                        }}
                        placeholder={`Enter legal terms, delivery policies, or patron commitments in ${SUPPORTED_LANGUAGES.find(l => l.code === activeTabLang)?.label}...`}
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-[#D4AF37]/30 rounded-xl text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none text-xs font-mono resize-none leading-relaxed"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions: Exclusively Save Policy or Cancel */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
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
                  {actionLoading ? 'Persisting...' : 'Save Policy Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
