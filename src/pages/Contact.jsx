import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Link } from '../router/RouterContext';
import { contentService } from '../services/contentService';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Share2,
  ExternalLink,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '../components/common/ScrollReveal';

export default function Contact() {
  const { language, currentLanguage, setLanguage, t } = useTranslation();
  const activeLang = String(language || currentLanguage || 'en').toLowerCase();
  const { isDark } = useTheme();
  const { success } = useToast();

  const [liveContacts, setLiveContacts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Bespoke Flacon Consultation',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLive = () => {
      contentService.getPublicContact()
        .then(items => {
          if (Array.isArray(items) && items.length > 0) {
            setLiveContacts(items);
          }
        })
        .catch(() => {});
    };

    fetchLive();
    window.addEventListener('arabian_contact_updated', fetchLive);
    window.addEventListener('storage', fetchLive);

    return () => {
      window.removeEventListener('arabian_contact_updated', fetchLive);
      window.removeEventListener('storage', fetchLive);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      success('Your inquiry has been conveyed to the Chief Concierge. We will reply within 24 hours.');
      setFormData({ name: '', email: '', subject: 'Bespoke Flacon Consultation', message: '' });
    }, 500);
  };

  return (
    <div className={`relative min-h-screen w-full overflow-hidden transition-colors duration-500 ${
      isDark ? 'text-[#F3E6D0]' : 'text-[#21130D]'
    }`}>
      {/* 1. Full-Bleed 24K Grand Palace Architecture Wallpaper */}
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
        
        {/* Breadcrumb & Language Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-cinzel tracking-wider text-[#D8BE99]">
            <Link to="/" className="hover:text-[#F2D675] transition-colors">
              Palace
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-[#F2D675] font-bold">Concierge</span>
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
          <div className="bg-[#0B0A08]/90 border-2 border-[#D4AF37]/35 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/15 text-[#F2D675] text-xs font-cinzel font-bold uppercase tracking-widest shadow-sm mx-auto">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Private Salons & Sovereign Concierge</span>
            </div>
            <h1 className="font-cinzel text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FFFDF8] via-[#F2D675] to-[#D4AF37]">
              {t('contact.title') || 'Concierge'}
            </h1>
            <p className="text-sm sm:text-base text-[#D8BE99] max-w-2xl mx-auto font-medium leading-relaxed">
              {t('contact.subtitle') || 'Converse directly with our Master Perfumers, reserve VIP salon appointments, or track bespoke sovereign acquisitions.'}
            </p>
          </div>
        </ScrollReveal>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (7 cols): Bespoke Concierge Inquiry Form Box */}
          <div className="lg:col-span-7">
            <ScrollReveal direction="right" className="bg-[#0B0A08]/92 border-2 border-[#D4AF37]/40 rounded-3xl p-8 sm:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-xl space-y-7">
              <div className="border-b border-[#D4AF37]/30 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#FFFDF8] uppercase tracking-wide">
                    {t('contact.formTitle') || 'Private Salon Consultation'}
                  </h2>
                  <p className="text-xs text-[#D8BE99] mt-1">
                    Direct transmission to our Chief Concierge desk.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#F2D675] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block font-cinzel text-xs uppercase tracking-wider text-[#F2D675] font-bold">
                      {t('contact.name') || 'Your Sovereign Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Sultan Mansoor"
                      className="w-full bg-black/60 border border-[#D4AF37]/35 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-[#F3E6D0] placeholder-[#D8BE99]/40 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/25 focus:outline-none transition-all shadow-inner"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-cinzel text-xs uppercase tracking-wider text-[#F2D675] font-bold">
                      {t('contact.email') || 'Official Email Address'}
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@palace.com"
                      className="w-full bg-black/60 border border-[#D4AF37]/35 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-[#F3E6D0] placeholder-[#D8BE99]/40 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/25 focus:outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-cinzel text-xs uppercase tracking-wider text-[#F2D675] font-bold">
                    {t('contact.subject') || 'Subject of Inquiry'}
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-black/60 border border-[#D4AF37]/35 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-[#F3E6D0] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/25 focus:outline-none cursor-pointer transition-all shadow-inner"
                  >
                    <option value="Bespoke Flacon Consultation" className="bg-[#0B0A08] text-[#F3E6D0]">Bespoke Flacon Consultation</option>
                    <option value="Private Salon VIP Booking" className="bg-[#0B0A08] text-[#F3E6D0]">Private Salon VIP Tasting Booking</option>
                    <option value="Royal Wedding & Gifting Request" className="bg-[#0B0A08] text-[#F3E6D0]">Royal Wedding & Imperial Gifting</option>
                    <option value="Order & Dispatch Inquiry" className="bg-[#0B0A08] text-[#F3E6D0]">Order & Diplomatic Courier Dispatch</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block font-cinzel text-xs uppercase tracking-wider text-[#F2D675] font-bold">
                    {t('contact.message') || 'Detail Your Request'}
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Detail your desired olfactory profile, appointment schedule, or courier notes..."
                    className="w-full bg-black/60 border border-[#D4AF37]/35 rounded-2xl px-4 py-3.5 text-sm sm:text-base text-[#F3E6D0] placeholder-[#D8BE99]/40 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/25 focus:outline-none transition-all shadow-inner leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#D4AF37] text-black font-cinzel font-bold text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer shadow-xl hover:brightness-110 hover:scale-[1.01] transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Transmitting to Concierge...' : (t('contact.submit') || 'Transmit to Chief Concierge')}</span>
                </button>
              </form>
            </ScrollReveal>
          </div>

          {/* Right Column (5 cols): Flagship Boutiques & Direct Concierge Lines */}
          <div className="lg:col-span-5 space-y-6">
            <ScrollReveal direction="left" className="space-y-6">
              
              {/* Flagship Boutiques Box (Bigger, Clear, Luxury) */}
              <div className="bg-[#0B0A08]/92 border-2 border-[#D4AF37]/40 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6">
                <div className="border-b border-[#D4AF37]/30 pb-3 flex items-center justify-between">
                  <h3 className="font-cinzel text-base sm:text-lg uppercase tracking-wider text-[#F2D675] font-bold">
                    {t('contact.boutiquesTitle') || 'Imperial Salons & Boutiques'}
                  </h3>
                  <MapPin className="w-4 h-4 text-[#D4AF37]" />
                </div>

                <div className="space-y-5 text-sm font-sans">
                  {liveContacts.filter(c => c.type === 'Address').length > 0 ? (
                    liveContacts.filter(c => c.type === 'Address').map((addr, idx) => (
                      <ScrollRevealItem key={idx} index={idx} desktopDirection="up">
                        <div className="flex gap-4 items-start bg-black/40 border border-[#D4AF37]/25 rounded-2xl p-4">
                          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F2D675] flex items-center justify-center shrink-0 mt-0.5">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <strong className="text-[#FFFDF8] block font-cinzel text-sm sm:text-base font-bold">Official Boutique Salon</strong>
                            <span className="text-[#D8BE99] text-xs sm:text-sm leading-relaxed block mt-1">{addr.value}</span>
                          </div>
                        </div>
                      </ScrollRevealItem>
                    ))
                  ) : (
                    <>
                      <ScrollRevealItem index={0} desktopDirection="up">
                        <div className="flex gap-4 items-start bg-black/40 border border-[#D4AF37]/25 rounded-2xl p-4">
                          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F2D675] flex items-center justify-center shrink-0 mt-0.5">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <strong className="text-[#FFFDF8] block font-cinzel text-sm sm:text-base font-bold">Dubai Flagship Palace</strong>
                            <span className="text-[#D8BE99] text-xs sm:text-sm leading-relaxed block mt-1">Downtown Dubai Boulevard, Burj Royale Pavilion, UAE</span>
                          </div>
                        </div>
                      </ScrollRevealItem>

                      <ScrollRevealItem index={1} desktopDirection="up">
                        <div className="flex gap-4 items-start bg-black/40 border border-[#D4AF37]/25 rounded-2xl p-4">
                          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F2D675] flex items-center justify-center shrink-0 mt-0.5">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <strong className="text-[#FFFDF8] block font-cinzel text-sm sm:text-base font-bold">London Private Salon</strong>
                            <span className="text-[#D8BE99] text-xs sm:text-sm leading-relaxed block mt-1">28 Mount Street, Mayfair, London W1K 2RY, UK</span>
                          </div>
                        </div>
                      </ScrollRevealItem>
                    </>
                  )}
                </div>
              </div>

              {/* Direct Concierge Lines Box (Bigger, Clear, Luxury) */}
              <div className="bg-[#0B0A08]/92 border-2 border-[#D4AF37]/40 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl space-y-5">
                <div className="border-b border-[#D4AF37]/30 pb-3 flex items-center justify-between">
                  <h3 className="font-cinzel text-base sm:text-lg uppercase tracking-wider text-[#F2D675] font-bold">
                    Direct Concierge Lines
                  </h3>
                  <Phone className="w-4 h-4 text-[#D4AF37]" />
                </div>

                <div className="space-y-4 text-xs sm:text-sm font-sans text-[#D8BE99]">
                  {liveContacts.filter(c => c.type === 'Phone').length > 0 ? (
                    liveContacts.filter(c => c.type === 'Phone').map((p, idx) => (
                      <p key={idx} className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F2D675] flex items-center justify-center shrink-0">
                          <Phone className="w-3.5 h-3.5" />
                        </span>
                        <a href={`tel:${p.value}`} className="hover:text-[#F2D675] hover:underline font-mono text-sm sm:text-base text-[#F3E6D0] font-bold transition-colors">
                          {p.value}
                        </a>
                      </p>
                    ))
                  ) : (
                    <p className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F2D675] flex items-center justify-center shrink-0">
                        <Phone className="w-3.5 h-3.5" />
                      </span>
                      <span className="font-mono text-sm sm:text-base text-[#F3E6D0] font-bold">+971 4 800-SHEIKH</span>
                    </p>
                  )}

                  {liveContacts.filter(c => c.type === 'Email').length > 0 ? (
                    liveContacts.filter(c => c.type === 'Email').map((em, idx) => (
                      <p key={idx} className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F2D675] flex items-center justify-center shrink-0">
                          <Mail className="w-3.5 h-3.5" />
                        </span>
                        <a href={`mailto:${em.value}`} className="hover:text-[#F2D675] hover:underline text-[#F3E6D0] font-medium transition-colors">
                          {em.value}
                        </a>
                      </p>
                    ))
                  ) : (
                    <p className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F2D675] flex items-center justify-center shrink-0">
                        <Mail className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[#F3E6D0] font-medium">concierge@arabiansheikh.com</span>
                    </p>
                  )}

                  {liveContacts.filter(c => c.type === 'Social').map((soc, idx) => (
                    <p key={idx} className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F2D675] flex items-center justify-center shrink-0">
                        <Share2 className="w-3.5 h-3.5" />
                      </span>
                      <a href={soc.value} target="_blank" rel="noreferrer" className="hover:text-[#F2D675] hover:underline truncate max-w-[260px] text-[#F3E6D0] transition-colors">
                        {soc.value}
                      </a>
                    </p>
                  ))}

                  <div className="flex items-center gap-3 pt-3 border-t border-[#D4AF37]/20 text-xs text-[#D8BE99]">
                    <span className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F2D675] flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </span>
                    <span>Daily: 08:00 — 22:00 Gulf Standard Time (GST)</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
