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
  Printer
} from 'lucide-react';
import ScrollReveal from '../components/common/ScrollReveal';

export default function PolicyPage({ policySlug }) {
  const { currentPath } = useRouter();
  const { currentLanguage } = useTranslation();
  const { isDark } = useTheme();

  // Resolve slug either from prop or currentPath: e.g. '/privacy-policy' -> 'privacy-policy'
  const slug = policySlug || currentPath.replace(/^\//, '').split('?')[0] || 'privacy-policy';

  const [policyData, setPolicyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    contentService.getPublicPage(slug, currentLanguage || 'en')
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
  }, [slug, currentLanguage]);

  const getPolicyIcon = (s) => {
    switch (s) {
      case 'privacy-policy':
        return <Shield className="w-5 h-5 text-[#D4AF37]" />;
      case 'terms-and-conditions':
        return <FileText className="w-5 h-5 text-[#D4AF37]" />;
      case 'shipping-policy':
        return <Truck className="w-5 h-5 text-[#D4AF37]" />;
      case 'returns-policy':
        return <RotateCcw className="w-5 h-5 text-[#D4AF37]" />;
      default:
        return <FileText className="w-5 h-5 text-[#D4AF37]" />;
    }
  };

  const currentMeta = PREDEFINED_SYSTEM_PAGES.find(p => p.slug === slug);
  const displayTitle = policyData?.title || currentMeta?.defaultTitle || 'Palace Policy';

  return (
    <div className="pt-36 sm:pt-40 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in text-[#F3E6D0]">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-cinzel tracking-wider text-[#D8BE99]">
        <Link to="/" className="hover:text-[#F2D675] transition-colors">
          Palace
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span className="text-[#F2D675] font-bold">{displayTitle}</span>
      </div>

      {/* Hero Header */}
      <ScrollReveal direction="up">
        <div className="border-b border-[#D4AF37]/30 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#F2D675] text-[11px] font-cinzel font-bold uppercase tracking-widest">
              {getPolicyIcon(slug)}
              <span>Royal Legal Charter</span>
            </div>
            <h1 className="font-cinzel text-3xl sm:text-5xl font-bold uppercase tracking-wider text-[#F3E6D0]">
              {displayTitle}
            </h1>
            <p className="text-xs sm:text-sm text-[#D8BE99] max-w-2xl font-medium leading-relaxed">
              {currentMeta?.description || 'Authentic legal covenants governing client relations, data privacy, and haute parfumerie guarantees.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-black/60 border border-[#D4AF37]/30 text-xs font-cinzel text-[#D8BE99] hover:text-[#F2D675] hover:border-[#D4AF37] flex items-center gap-2 transition-all cursor-pointer"
              title="Print Charter"
            >
              <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Print Charter</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Main Grid: Policy Navigation Tabs + Policy Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sticky Policy Navigation */}
        <div className="lg:col-span-4 space-y-3 lg:sticky lg:top-28">
          <p className="font-cinzel text-xs uppercase tracking-[0.25em] text-[#F2D675] font-bold px-3">
            Legal & Patronage Charters
          </p>
          <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 rounded-2xl p-2 shadow-xl backdrop-blur-md space-y-1">
            {PREDEFINED_SYSTEM_PAGES.map((page) => {
              const isActive = page.slug === slug;
              return (
                <Link
                  key={page.slug}
                  to={`/${page.slug}`}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-cinzel uppercase tracking-wider font-semibold transition-all border ${
                    isActive
                      ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#F2D675] font-bold shadow-md'
                      : 'border-transparent text-[#D8BE99] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {getPolicyIcon(page.slug)}
                  <span className="truncate">{page.defaultTitle}</span>
                </Link>
              );
            })}

            <div className="pt-2 mt-2 border-t border-[#D4AF37]/20">
              <Link
                to="/faqs"
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-cinzel uppercase tracking-wider text-[#D8BE99] hover:text-[#F2D675] hover:bg-white/5 transition-all"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Frequently Asked Questions</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Policy Content Body */}
        <div className="lg:col-span-8 bg-[#0B0A08]/90 border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
          {loading ? (
            <div className="py-24 text-center text-[#D8BE99]">
              <div className="w-8 h-8 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin mx-auto mb-3" />
              <p className="font-cinzel text-xs uppercase tracking-wider">Unsealing Sovereign Terms...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4 text-[11px] text-[#D8BE99]">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Effective Sovereign Year: {new Date().getFullYear()}</span>
                </div>
                <span className="font-mono text-[#D4AF37] uppercase font-bold text-[10px] px-2 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                  Certified Active
                </span>
              </div>

              {/* Policy Body */}
              <div className="font-sans text-xs sm:text-sm text-[#F3E6D0] leading-relaxed space-y-4 whitespace-pre-wrap">
                {policyData?.content ? (
                  policyData.content
                ) : (
                  <div className="text-center py-12 space-y-2">
                    <p className="font-cinzel text-base text-[#F2D675]">Charter Being Finalized</p>
                    <p className="text-xs text-[#D8BE99]">
                      The official text for this royal policy is currently undergoing customary verification.
                    </p>
                  </div>
                )}
              </div>

              {/* Inquiries Footer */}
              <div className="pt-8 border-t border-[#D4AF37]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#D8BE99]">
                <p>Have questions regarding these sovereign covenants?</p>
                <Link
                  to="/contact"
                  className="px-4 py-2 rounded-xl bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-md shrink-0"
                >
                  Contact Concierge
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
