import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { useToast } from '../context/ToastContext';
import { MapPin, Phone, Mail, Clock, Send, Sparkles } from 'lucide-react';

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
    <div className="pt-28 pb-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 animate-fade-in text-[#F3EEE5]">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-[#C6A15B] font-semibold">
          Concierge Services & Private Salons
        </span>
        <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#F3EEE5] uppercase tracking-wider">
          {t('contact.title')}
        </h1>
        <p className="text-xs sm:text-sm text-[#C5B8A8]">
          {t('contact.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Concierge Inquiry Form */}
        <div className="lg:col-span-7 bg-[#1C120E] border border-[#C6A15B]/30 p-8 sm:p-10 shadow-2xl space-y-6">
          <h2 className="font-cinzel text-xl font-bold text-[#F3EEE5] uppercase border-b border-[#C6A15B]/20 pb-3">
            {t('contact.formTitle')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block uppercase tracking-wider text-[#C5B8A8] mb-1">
                  {t('contact.name')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sultan Mansoor"
                  className="w-full bg-[#0F0D0C] border border-[#C6A15B]/30 px-3 py-2.5 text-[#F3EEE5] focus:border-[#C6A15B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[#C5B8A8] mb-1">
                  {t('contact.email')}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@palace.com"
                  className="w-full bg-[#0F0D0C] border border-[#C6A15B]/30 px-3 py-2.5 text-[#F3EEE5] focus:border-[#C6A15B] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block uppercase tracking-wider text-[#C5B8A8] mb-1">
                {t('contact.subject')}
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-[#0F0D0C] border border-[#C6A15B]/30 px-3 py-2.5 text-[#F3EEE5] focus:border-[#C6A15B] focus:outline-none"
              >
                <option value="Bespoke Flacon Consultation">Bespoke Flacon Consultation</option>
                <option value="Private Salon VIP Booking">Private Salon VIP Tasting Booking</option>
                <option value="Royal Wedding & Gifting Request">Royal Wedding & Gifting Request</option>
                <option value="Order & Dispatch Inquiry">Order & Dispatch Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block uppercase tracking-wider text-[#C5B8A8] mb-1">
                {t('contact.message')}
              </label>
              <textarea
                rows={5}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Detail your request or preferred fragrance notes..."
                className="w-full bg-[#0F0D0C] border border-[#C6A15B]/30 px-3 py-2.5 text-[#F3EEE5] focus:border-[#C6A15B] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full luxury-btn-gold py-3.5 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Transmitting to Concierge...' : t('contact.submit')}</span>
            </button>
          </form>
        </div>

        {/* Right: Flagship Boutiques & Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-[#1C120E] border border-[#C6A15B]/20 space-y-4">
            <h3 className="font-cinzel text-sm uppercase tracking-widest text-[#C6A15B] font-bold">
              {t('contact.boutiquesTitle')}
            </h3>

            <div className="space-y-4 text-xs font-sans text-[#C5B8A8]">
              <div className="flex gap-3 items-start">
                <MapPin className="w-4 h-4 text-[#C6A15B] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#F3EEE5] block font-cinzel">Dubai Flagship Palace</strong>
                  <span>Downtown Dubai Boulevard, Burj Royale Pavilion, UAE</span>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <MapPin className="w-4 h-4 text-[#C6A15B] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#F3EEE5] block font-cinzel">London Private Salon</strong>
                  <span>28 Mount Street, Mayfair, London W1K 2RY, UK</span>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <MapPin className="w-4 h-4 text-[#C6A15B] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#F3EEE5] block font-cinzel">Paris Atelier</strong>
                  <span>14 Place Vendôme, 75001 Paris, France</span>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <MapPin className="w-4 h-4 text-[#C6A15B] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#F3EEE5] block font-cinzel">Riyadh Royal Suite</strong>
                  <span>Al Olaya Towers, King Fahd Road, Riyadh, KSA</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#2B1A12] border border-[#C6A15B]/30 space-y-3">
            <h4 className="font-cinzel text-xs uppercase tracking-widest text-[#DFBF7A] font-bold">
              Direct Concierge Helpline
            </h4>
            <div className="flex items-center gap-2 text-xs text-[#F3EEE5]">
              <Phone className="w-4 h-4 text-[#C6A15B]" />
              <span>+971 4 800-SHEIKH</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#F3EEE5]">
              <Mail className="w-4 h-4 text-[#C6A15B]" />
              <span>concierge@arabiansheikh.com</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#C5B8A8]">
              <Clock className="w-4 h-4 text-[#C6A15B]" />
              <span>Daily 08:00 – 22:00 GMT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
