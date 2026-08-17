import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useToast } from '../context/ToastContext';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '../components/common/ScrollReveal';

export default function Contact() {
  const { t } = useTranslation();
  const { success } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Bespoke Flacon Consultation',
    message: ''
  });
  const [loading, setLoading] = useState(false);

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
    <div className="pt-36 sm:pt-40 pb-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 animate-fade-in text-[var(--text-primary)]">
      {/* Header */}
      <ScrollReveal direction="up" delay={0}>
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-[var(--gold-primary)] font-semibold">
            Concierge Services & Private Salons
          </span>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-[var(--text-primary)] uppercase tracking-wider">
            {t('contact.title')}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            {t('contact.subtitle')}
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Concierge Inquiry Form */}
        <div className="lg:col-span-7">
          <ScrollReveal direction="right" className="bg-[var(--bg-card)] border border-[var(--border-card)] p-8 sm:p-10 shadow-2xl space-y-6 h-full">
          <h2 className="font-cinzel text-xl font-bold text-[var(--text-primary)] uppercase border-b border-[var(--border-subtle)] pb-3">
            {t('contact.formTitle')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  {t('contact.name')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sultan Mansoor"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-card)] px-3 py-2.5 text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  {t('contact.email')}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@palace.com"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-card)] px-3 py-2.5 text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block uppercase tracking-wider text-[var(--text-muted)] mb-1">
                {t('contact.subject')}
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-card)] px-3 py-2.5 text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none cursor-pointer"
              >
                <option value="Bespoke Flacon Consultation">Bespoke Flacon Consultation</option>
                <option value="Private Salon VIP Booking">Private Salon VIP Tasting Booking</option>
                <option value="Royal Wedding & Gifting Request">Royal Wedding & Gifting Request</option>
                <option value="Order & Dispatch Inquiry">Order & Dispatch Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block uppercase tracking-wider text-[var(--text-muted)] mb-1">
                {t('contact.message')}
              </label>
              <textarea
                rows={5}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Detail your request or preferred fragrance notes..."
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-card)] px-3 py-2.5 text-[var(--text-primary)] focus:border-[var(--gold-primary)] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full luxury-btn-gold py-3.5 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Transmitting to Concierge...' : t('contact.submit')}</span>
            </button>
          </form>
          </ScrollReveal>
        </div>

        {/* Right: Flagship Boutiques & Contact Info */}
        <div className="lg:col-span-5">
          <ScrollReveal direction="left" className="space-y-6 h-full">
            <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4 shadow-sm">
              <h3 className="font-cinzel text-sm uppercase tracking-widest text-[var(--gold-primary)] font-bold">
                {t('contact.boutiquesTitle')}
              </h3>

              <div className="space-y-4 text-xs font-sans text-[var(--text-muted)]">
                <ScrollRevealItem index={0} desktopDirection="up">
                  <div className="flex gap-3 items-start">
                    <MapPin className="w-4 h-4 text-[var(--gold-primary)] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[var(--text-primary)] block font-cinzel">Dubai Flagship Palace</strong>
                      <span>Downtown Dubai Boulevard, Burj Royale Pavilion, UAE</span>
                    </div>
                  </div>
                </ScrollRevealItem>

                <ScrollRevealItem index={1} desktopDirection="up">
                  <div className="flex gap-3 items-start">
                    <MapPin className="w-4 h-4 text-[var(--gold-primary)] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[var(--text-primary)] block font-cinzel">London Private Salon</strong>
                      <span>28 Mount Street, Mayfair, London W1K 2RY, UK</span>
                    </div>
                  </div>
                </ScrollRevealItem>

                <ScrollRevealItem index={2} desktopDirection="up">
                  <div className="flex gap-3 items-start">
                    <MapPin className="w-4 h-4 text-[var(--gold-primary)] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[var(--text-primary)] block font-cinzel">Paris Atelier</strong>
                      <span>14 Place Vendôme, 75001 Paris, France</span>
                    </div>
                  </div>
                </ScrollRevealItem>
              </div>
            </div>

            <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3 shadow-sm">
              <h3 className="font-cinzel text-sm uppercase tracking-widest text-[var(--gold-primary)] font-bold">
                Direct Concierge Lines
              </h3>
              <div className="space-y-2 text-xs text-[var(--text-muted)] font-sans">
                <ScrollRevealItem index={0} desktopDirection="up">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[var(--gold-primary)]" />
                    <span>+971 4 800-SHEIKH (UAE Toll-Free)</span>
                  </p>
                </ScrollRevealItem>
                <ScrollRevealItem index={1} desktopDirection="up">
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[var(--gold-primary)]" />
                    <span>concierge@arabiansheikh.com</span>
                  </p>
                </ScrollRevealItem>
                <ScrollRevealItem index={2} desktopDirection="up">
                  <p className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[var(--gold-primary)]" />
                    <span>Daily: 08:00 — 22:00 Gulf Standard Time</span>
                  </p>
                </ScrollRevealItem>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
