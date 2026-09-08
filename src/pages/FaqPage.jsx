import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { contentService } from '../services/contentService';
import { Link } from '../router/RouterContext';
import {
  HelpCircle,
  ChevronDown,
  Search,
  Sparkles,
  MessageCircle,
  Phone,
  Mail,
  ShieldCheck,
  Shield,
  Truck,
  RotateCcw,
  FileText,
  ArrowRight
} from 'lucide-react';
import ScrollReveal from '../components/common/ScrollReveal';

const PALACE_POLICIES = [
  {
    title: 'Shipping & Delivery',
    path: '/shipping-policy',
    desc: 'Diplomatic couriers & express royal dispatch.',
    icon: Truck
  },
  {
    title: 'Returns & Exchange',
    path: '/returns-policy',
    desc: '30-Day Royal Privilege & bespoke exchange.',
    icon: RotateCcw
  },
  {
    title: 'Privacy & Security',
    path: '/privacy-policy',
    desc: 'Sovereign confidentiality & patron data defense.',
    icon: Shield
  },
  {
    title: 'Terms of Service',
    path: '/terms-and-conditions',
    desc: 'Imperial covenants & acquisition agreements.',
    icon: FileText
  }
];

export default function FaqPage() {
  const { language, currentLanguage, setLanguage, t } = useTranslation();
  const activeLang = String(language || currentLanguage || 'en').toLowerCase();
  const { isDark } = useTheme();

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState(0); // Open first FAQ by default

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setOpenIndex(0);

    contentService.getPublicFaqs(activeLang)
      .then(items => {
        if (isMounted) {
          setFaqs(items || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [activeLang]);

  const filteredFaqs = faqs.filter(faq => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (faq.question || '').toLowerCase().includes(q) ||
      (faq.answer || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className={`relative min-h-screen w-full overflow-hidden transition-colors duration-500 ${
      isDark ? 'text-[#F3E6D0]' : 'text-[#21130D]'
    }`}>
      {/* 1. Full-Bleed 24K Grand Palace Architecture Wallpaper (Same as Home Page) */}
      <div className="fixed inset-0 z-0 select-none pointer-events-none overflow-hidden">
        <picture className="w-full h-full">
          {/* Mobile Phone WebP (< 768px) */}
          <source
            media="(max-width: 767px)"
            type="image/webp"
            srcSet="/editorial/arabian_palace_phone_opt.webp"
          />
          {/* Mobile Phone JPG Fallback (< 768px) */}
          <source
            media="(max-width: 767px)"
            srcSet="/editorial/arabian_palace_phone_opt.jpg"
          />
          {/* Desktop / Tablet WebP (>= 768px) */}
          <source
            type="image/webp"
            srcSet="/editorial/arabian_palace_desktop_opt.webp"
          />
          {/* Desktop Fallback */}
          <img
            src="/editorial/arabian_palace_desktop_opt.jpg"
            alt="The Grand Sovereign Palace of Arabian Sheikh"
            className="w-full h-full object-cover object-center transform scale-100 sm:scale-105 transition-transform duration-1000"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </picture>

        {/* Top Vignette for Navbar Readability */}
        <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-black/85 via-black/50 to-transparent pointer-events-none" />

        {/* Center Subtle Golden Radiant Bloom */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(212,175,55,0.18),transparent_70%)] pointer-events-none" />

        {/* Protective Tint Layer / Layout Overlay */}
        <div className={`absolute inset-0 pointer-events-none transition-colors duration-700 backdrop-blur-[3px] ${
          isDark
            ? 'bg-gradient-to-b from-[#0B0A08]/85 via-[#0B0A08]/80 to-[#0B0A08]/92'
            : 'bg-gradient-to-b from-[#CBB198]/90 via-[#F3E6D0]/85 to-[#CBB198]/92'
        }`} />
      </div>

      {/* 2. Structured Content Layout Container */}
      <div className="relative z-10 pt-36 sm:pt-40 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in">
        {/* Page Header */}
        <ScrollReveal direction="up">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#F2D675] text-[11px] font-cinzel font-bold uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Palace Guidance & Sovereign Charters</span>
            </div>
            <h1 className="font-cinzel text-3xl sm:text-5xl font-bold uppercase tracking-wider text-[#F3E6D0]">
              Questions & Policies
            </h1>
          <p className="text-xs sm:text-sm text-[#D8BE99] max-w-2xl mx-auto font-medium leading-relaxed">
            Consult our official palace charters, delivery covenants, and answers to common inquiries regarding our haute parfumerie collection.
          </p>
        </div>
      </ScrollReveal>

      {/* Royal Charters & Policies Quick Access Cards */}
      <ScrollReveal direction="up" delay={0.1}>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-cinzel text-xs uppercase tracking-[0.25em] text-[#F2D675] font-bold">
              Official Palace Policies
            </h2>
            <span className="text-[11px] text-[#D8BE99]/60 font-cinzel">4 Sovereign Charters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {PALACE_POLICIES.map((policy) => {
              const Icon = policy.icon;
              return (
                <Link
                  key={policy.path}
                  to={policy.path}
                  className="group bg-[#0B0A08]/85 border border-[#D4AF37]/30 hover:border-[#D4AF37] rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(212,175,55,0.15)] flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#F2D675] group-hover:bg-[#D4AF37]/20 group-hover:border-[#D4AF37] transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-cinzel text-sm font-bold text-[#F3E6D0] group-hover:text-[#F2D675] transition-colors">
                      {policy.title}
                    </h3>
                    <p className="text-[11px] text-[#D8BE99] leading-relaxed line-clamp-2">
                      {policy.desc}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#D4AF37]/15 flex items-center justify-between text-[11px] font-cinzel font-bold text-[#D4AF37] uppercase tracking-wider group-hover:text-[#F2D675]">
                    <span>View Charter</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      {/* Instant Search Bar & FAQ Section Header */}
      <ScrollReveal direction="up" delay={0.15}>
        <div className="space-y-4 pt-4 border-t border-[#D4AF37]/20">
          <div className="text-center space-y-1.5">
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold uppercase tracking-wider text-[#F3E6D0]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-[#D8BE99]">
              Instant answers regarding rare oud macerations, dispatch timelines, and authentic bottle seals.
            </p>
          </div>

          {/* Language Selector Pills */}
          <div className="flex items-center justify-center gap-2 pt-1 pb-1">
            {[
              { code: 'en', label: 'English', flag: '🇬🇧' },
              { code: 'es', label: 'Español', flag: '🇪🇸' },
              { code: 'bg', label: 'Български', flag: '🇧🇬' }
            ].map((langItem) => {
              const isSelected = activeLang === langItem.code;
              return (
                <button
                  key={langItem.code}
                  type="button"
                  onClick={() => setLanguage(langItem.code)}
                  className={`px-4 py-1.5 rounded-full text-xs font-cinzel font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer border ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#D4AF37] text-black border-[#F2D675] shadow-[0_0_15px_rgba(212,175,55,0.45)] scale-105'
                      : 'bg-black/60 text-[#D8BE99] border-[#D4AF37]/30 hover:border-[#D4AF37] hover:text-[#F3E6D0]'
                  }`}
                >
                  <span className="text-sm">{langItem.flag}</span>
                  <span>{langItem.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative max-w-lg mx-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search inquiries (e.g. shipping, returns, oud authenticity)..."
              className="w-full bg-[#0B0A08]/90 border border-[#D4AF37]/40 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:outline-none shadow-xl backdrop-blur-md"
            />
            <Search className="w-4 h-4 text-[#D4AF37] absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </ScrollReveal>

      {/* Accordion FAQ List */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="py-20 text-center text-[#D8BE99]">
            <div className="w-8 h-8 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin mx-auto mb-3" />
            <p className="font-cinzel text-xs uppercase tracking-wider">Consulting Palace Archives...</p>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="p-8 text-center bg-[#0B0A08]/80 border border-[#D4AF37]/25 rounded-2xl space-y-3">
            <HelpCircle className="w-10 h-10 text-[#D4AF37]/40 mx-auto" />
            <p className="font-cinzel text-sm text-[#F3E6D0] uppercase tracking-wider">No Inquiries Found</p>
            <p className="text-xs text-[#D8BE99]">
              {search ? 'Try adjusting your search terms, or converse directly with our Private Concierge below.' : 'Palace inquiries will appear shortly.'}
            </p>
          </div>
        ) : (
          filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.id || index}
                className="bg-[#0B0A08]/90 border border-[#D4AF37]/30 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md transition-all duration-300 hover:border-[#D4AF37]/60"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F2D675] text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="font-cinzel text-sm sm:text-base font-bold text-[#F3E6D0] leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#D4AF37] shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-[#D8BE99] font-sans leading-relaxed border-t border-[#D4AF37]/15 whitespace-pre-wrap animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Concierge Help Callout */}
      <div className="bg-gradient-to-r from-[#140D07] via-[#0B0A08] to-[#140D07] border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 via-black to-[#8C6239]/20 border border-[#D4AF37]/50 flex items-center justify-center mx-auto text-[#F2D675] shadow-md">
          <MessageCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-cinzel text-lg sm:text-xl font-bold uppercase tracking-wider text-[#F3E6D0]">
            Still Seeking Flacon Guidance?
          </h3>
          <p className="text-xs text-[#D8BE99] max-w-md mx-auto">
            Our Chief Concierge and Master Perfumers remain at your service for bespoke inquiries and private salon appointments.
          </p>
        </div>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Link
            to="/contact"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-110 transition-all inline-flex items-center gap-2"
          >
            <span>Converse with Concierge</span>
          </Link>
          <Link
            to="/shipping-policy"
            className="px-5 py-2.5 rounded-xl bg-black/60 border border-[#D4AF37]/30 text-[#D8BE99] hover:text-[#F3E6D0] hover:border-[#D4AF37] font-cinzel font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Shipping Policy</span>
          </Link>
        </div>
      </div>
    </div>
  </div>
  );
}
