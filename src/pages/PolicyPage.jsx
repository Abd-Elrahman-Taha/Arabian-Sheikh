import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { contentService, PREDEFINED_SYSTEM_PAGES } from '../services/contentService';
import { Link, useRouter } from '../router/RouterContext';
import {
  Shield,
  FileText,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Clock,
  Printer,
  HelpCircle,
  MessageCircle,
  CheckCircle2
} from 'lucide-react';
import ScrollReveal from '../components/common/ScrollReveal';

export default function PolicyPage({ policySlug }) {
  const { currentPath } = useRouter();
  const { language, currentLanguage, setLanguage, t } = useTranslation();
  const activeLang = String(language || currentLanguage || 'en').toLowerCase();
  const { isDark } = useTheme();

  // Resolve slug either from prop or currentPath: e.g. '/privacy-policy' -> 'privacy-policy'
  const slug = policySlug || currentPath.replace(/^\//, '').split('?')[0] || 'privacy-policy';

  const [policyData, setPolicyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    contentService.getPublicPage(slug, activeLang)
      .then(data => {
        if (isMounted) {
          setPolicyData(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [slug, activeLang]);

  const getPolicyIcon = (s, className = 'w-5 h-5 text-[#D4AF37]') => {
    switch (s) {
      case 'privacy-policy':
        return <Shield className={className} />;
      case 'terms-and-conditions':
        return <FileText className={className} />;
      case 'shipping-policy':
        return <Truck className={className} />;
      case 'returns-policy':
        return <RotateCcw className={className} />;
      default:
        return <FileText className={className} />;
    }
  };

  const currentMeta = PREDEFINED_SYSTEM_PAGES.find(p => p.slug === slug);
  const displayTitle = policyData?.title || currentMeta?.defaultTitle || 'Palace Policy';

  return (
    <div className={`relative min-h-screen w-full overflow-hidden transition-colors duration-500 ${
      isDark ? 'text-[#F3E6D0]' : 'text-[#21130D]'
    }`}>
      {/* 1. Full-Bleed 24K Grand Palace Architecture Wallpaper (Identical to Home & Questions Page) */}
      <div className="fixed inset-0 z-0 select-none pointer-events-none overflow-hidden">
        <picture className="w-full h-full">
          <source
            media="(max-width: 767px)"
            type="image/webp"
            srcSet="/editorial/arabian_palace_phone_opt.webp"
          />
          <source
            media="(max-width: 767px)"
            srcSet="/editorial/arabian_palace_phone_opt.jpg"
          />
          <source
            type="image/webp"
            srcSet="/editorial/arabian_palace_desktop_opt.webp"
          />
          <img
            src="/editorial/arabian_palace_desktop_opt.jpg"
            alt="The Grand Sovereign Palace of Arabian Sheikh"
            className="w-full h-full object-cover object-center transform scale-100 sm:scale-105 transition-transform duration-1000"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </picture>

        {/* Top Vignette for Header / Navbar Readability */}
        <div className="absolute top-0 inset-x-0 h-52 bg-gradient-to-b from-black/90 via-black/55 to-transparent pointer-events-none" />

        {/* Center Golden Radiant Bloom */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(212,175,55,0.18),transparent_70%)] pointer-events-none" />

        {/* Protective Luxury Layout Overlay */}
        <div className={`absolute inset-0 pointer-events-none transition-colors duration-700 backdrop-blur-[3px] ${
          isDark
            ? 'bg-gradient-to-b from-[#0B0A08]/85 via-[#0B0A08]/80 to-[#0B0A08]/92'
            : 'bg-gradient-to-b from-[#CBB198]/90 via-[#F3E6D0]/85 to-[#CBB198]/92'
        }`} />
      </div>

      {/* 2. Structured Content Layout Container */}
      <div className="relative z-10 pt-36 sm:pt-40 pb-24 max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in">
        {/* Breadcrumb & Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-cinzel tracking-wider text-[#D8BE99]">
            <Link to="/" className="hover:text-[#F2D675] transition-colors flex items-center gap-1">
              <span>Palace</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            <Link to="/faqs" className="hover:text-[#F2D675] transition-colors">
              <span>Questions & Policies</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-[#F2D675] font-bold">{displayTitle}</span>
          </div>

          {/* Quick In-Page Language Switcher Pills */}
          <div className="flex items-center gap-2">
            {[
              { code: 'en', label: 'EN', full: 'English', flag: '🇬🇧' },
              { code: 'es', label: 'ES', full: 'Español', flag: '🇪🇸' },
              { code: 'bg', label: 'BG', full: 'Български', flag: '🇧🇬' }
            ].map((l) => {
              const isSelected = activeLang === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={`px-3.5 py-1 rounded-full text-xs font-cinzel font-bold tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#D4AF37] text-black border-[#F2D675] shadow-[0_0_12px_rgba(212,175,55,0.45)] scale-105'
                      : 'bg-black/60 text-[#D8BE99] border-[#D4AF37]/30 hover:border-[#D4AF37] hover:text-[#F3E6D0]'
                  }`}
                  title={`Switch language to ${l.full}`}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hero Header Box: Bigger, Majestic & Clear */}
        <ScrollReveal direction="up">
          <div className="bg-[#0B0A08]/90 border-2 border-[#D4AF37]/35 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/15 text-[#F2D675] text-xs font-cinzel font-bold uppercase tracking-widest shadow-sm">
                {getPolicyIcon(slug, 'w-4 h-4 text-[#F2D675]')}
                <span>Official Sovereign Charter</span>
              </div>
              <h1 className="font-cinzel text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FFFDF8] via-[#F2D675] to-[#D4AF37]">
                {displayTitle}
              </h1>
              <p className="text-sm sm:text-base text-[#D8BE99] font-medium leading-relaxed">
                {currentMeta?.description || 'Authentic sovereign covenants governing haute parfumerie acquisitions, client relations, and delivery guarantees.'}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => window.print()}
                className="px-5 py-3 rounded-2xl bg-black/70 border border-[#D4AF37]/40 text-xs sm:text-sm font-cinzel font-bold text-[#F3E6D0] hover:text-[#F2D675] hover:border-[#D4AF37] flex items-center gap-2.5 transition-all duration-300 hover:shadow-[0_0_15px_rgba(212,175,55,0.25)] cursor-pointer"
                title="Print Official Charter"
              >
                <Printer className="w-4 h-4 text-[#D4AF37]" />
                <span>Print Charter</span>
              </button>
              <Link
                to="/faqs"
                className="px-5 py-3 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-xs sm:text-sm font-cinzel font-bold text-[#F2D675] hover:bg-[#D4AF37]/25 hover:border-[#D4AF37] flex items-center gap-2 transition-all duration-300"
              >
                <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
                <span>Palace Inquiries</span>
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* Main Layout Grid: Left Charters Navigation + Right Content Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Charters Navigation Box (Bigger, Clear, Luxury) */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-28">
            <div className="bg-[#0B0A08]/92 border-2 border-[#D4AF37]/35 rounded-3xl p-5 shadow-2xl backdrop-blur-xl space-y-3">
              <div className="px-3 pt-2 pb-1 border-b border-[#D4AF37]/20 flex items-center justify-between">
                <span className="font-cinzel text-xs uppercase tracking-[0.25em] text-[#F2D675] font-extrabold">
                  Palace Charters
                </span>
                <span className="text-[10px] font-mono text-[#D4AF37]">4 Protocols</span>
              </div>

              <div className="space-y-2 pt-2">
                {PREDEFINED_SYSTEM_PAGES.map((page) => {
                  const isActive = page.slug === slug;
                  return (
                    <Link
                      key={page.slug}
                      to={`/${page.slug}`}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-cinzel uppercase tracking-wider font-bold transition-all duration-300 border ${
                        isActive
                          ? 'border-[#F2D675] bg-gradient-to-r from-[#D4AF37]/25 via-[#D4AF37]/15 to-transparent text-[#FFFDF8] shadow-[0_4px_20px_rgba(212,175,55,0.25)]'
                          : 'border-transparent text-[#D8BE99] hover:bg-white/5 hover:text-[#F3E6D0] hover:border-[#D4AF37]/25'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className={`p-2 rounded-xl border ${
                          isActive
                            ? 'bg-[#D4AF37]/30 border-[#D4AF37] text-[#F2D675]'
                            : 'bg-black/50 border-[#D4AF37]/20 text-[#D8BE99]'
                        }`}>
                          {getPolicyIcon(page.slug, 'w-4 h-4')}
                        </div>
                        <span className="truncate">{page.defaultTitle}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive ? 'text-[#F2D675] translate-x-1' : 'text-[#D4AF37]/40'
                      }`} />
                    </Link>
                  );
                })}
              </div>

              {/* Questions Page Cross-Link */}
              <div className="pt-3 border-t border-[#D4AF37]/20">
                <Link
                  to="/faqs"
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-cinzel uppercase tracking-wider font-bold text-[#D8BE99] hover:text-[#F2D675] hover:bg-[#D4AF37]/10 transition-all border border-transparent hover:border-[#D4AF37]/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-black/50 border border-[#D4AF37]/20 text-[#D4AF37]">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span>Questions & FAQs Hub</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#D4AF37]/50" />
                </Link>
              </div>
            </div>

            {/* Concierge Assistance Mini-Callout Box */}
            <div className="bg-[#0B0A08]/92 border border-[#D4AF37]/30 rounded-3xl p-5 shadow-xl backdrop-blur-xl space-y-3 text-center">
              <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center mx-auto text-[#F2D675]">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-cinzel text-sm font-bold text-[#F3E6D0] uppercase tracking-wider">
                  Private Salon Inquiries
                </h4>
                <p className="text-[11px] text-[#D8BE99] mt-1 leading-relaxed">
                  Have unique courier, packaging, or bespoke acquisition requirements?
                </p>
              </div>
              <Link
                to="/contact"
                className="block w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-110 transition-all text-center"
              >
                Converse with Concierge
              </Link>
            </div>
          </div>

          {/* Right Column: Main Policy Content Box (Bigger, Clearer, High Contrast, Luxury) */}
          <div className="lg:col-span-8 bg-[#0B0A08]/92 border-2 border-[#D4AF37]/40 rounded-3xl p-8 sm:p-12 lg:p-14 shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-xl space-y-8">
            {loading ? (
              <div className="py-32 text-center text-[#D8BE99] space-y-4">
                <div className="w-10 h-10 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin mx-auto" />
                <p className="font-cinzel text-sm uppercase tracking-widest text-[#F2D675]">
                  Unsealing Sovereign Palace Archives...
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Protocol Certification Header */}
                <div className="flex flex-wrap items-center justify-between border-b border-[#D4AF37]/30 pb-5 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#F2D675]">
                      {getPolicyIcon(slug, 'w-4 h-4')}
                    </div>
                    <div>
                      <h3 className="font-cinzel text-base sm:text-lg font-bold text-[#FFFDF8] uppercase tracking-wide">
                        {displayTitle}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-[#D8BE99] mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Effective Sovereign Year: {new Date().getFullYear()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#F2D675] text-xs font-mono font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Certified Active</span>
                  </div>
                </div>

                {/* Big, Clear, High-Contrast Policy Body */}
                <div className="font-sans text-sm sm:text-base lg:text-[16.5px] text-[#F3E6D0] leading-[1.9] space-y-6 whitespace-pre-wrap selection:bg-[#D4AF37]/30 selection:text-white">
                  {policyData?.content ? (
                    policyData.content
                  ) : (
                    <div className="text-center py-16 space-y-3 bg-black/40 border border-[#D4AF37]/20 rounded-2xl p-8">
                      <p className="font-cinzel text-lg font-bold text-[#F2D675] uppercase tracking-wider">
                        Charter Protocol Verification
                      </p>
                      <p className="text-xs sm:text-sm text-[#D8BE99] max-w-md mx-auto">
                        The sovereign text for this policy is currently active and being synced with the latest palace legal decrees.
                      </p>
                    </div>
                  )}
                </div>

                {/* Sovereign Assurance Footer */}
                <div className="pt-8 border-t border-[#D4AF37]/25 flex flex-col sm:flex-row items-center justify-between gap-5 bg-black/40 -mx-8 -mb-8 sm:-mx-12 sm:-mb-12 lg:-mx-14 lg:-mb-14 p-8 sm:p-10 rounded-b-3xl border-b border-x border-[#D4AF37]/20">
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="font-cinzel text-sm font-bold text-[#F3E6D0] uppercase tracking-wider">
                      Need Bespoke Guidance or Order Details?
                    </p>
                    <p className="text-xs text-[#D8BE99]">
                      Our Private Concierge operates 24/7 for flacon authentication, tracking, and sovereign inquiries.
                    </p>
                  </div>
                  <Link
                    to="/contact"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-md shrink-0 inline-flex items-center gap-2"
                  >
                    <span>Contact Concierge</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
