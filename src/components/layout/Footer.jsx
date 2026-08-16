import React, { useState } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Sparkles, ArrowRight, ShieldCheck, Truck, Clock, Award, Globe } from 'lucide-react';

export default function Footer() {
  const { t, language, setLanguage, availableLanguages } = useTranslation();
  const { success } = useToast();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    success('You have been granted access to the Arabian Sheikh Private VIP Circle.');
    setEmail('');
  };

  return (
    <footer className="bg-[#0F0D0C] border-t border-[#C6A15B]/20 text-[#F3EEE5] mt-auto">
      {/* Guarantees & Pillars Row */}
      <div className="border-b border-[#C6A15B]/15 py-8 bg-[#1C120E]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border border-[#C6A15B]/40 flex items-center justify-center mb-3 text-[#C6A15B]">
                <Truck className="w-5 h-5" />
              </div>
              <h5 className="font-cinzel text-xs uppercase tracking-widest text-[#F3EEE5] mb-1">
                Royal Express Delivery
              </h5>
              <p className="text-[11px] text-[#C5B8A8] leading-tight">
                Insured worldwide courier dispatch with live tracking
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border border-[#C6A15B]/40 flex items-center justify-center mb-3 text-[#C6A15B]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h5 className="font-cinzel text-xs uppercase tracking-widest text-[#F3EEE5] mb-1">
                Complimentary Samples
              </h5>
              <p className="text-[11px] text-[#C5B8A8] leading-tight">
                Two 2ml discovery vials in velvet pouches with each flacon
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border border-[#C6A15B]/40 flex items-center justify-center mb-3 text-[#C6A15B]">
                <Award className="w-5 h-5" />
              </div>
              <h5 className="font-cinzel text-xs uppercase tracking-widest text-[#F3EEE5] mb-1">
                Pure Wild Harvests
              </h5>
              <p className="text-[11px] text-[#C5B8A8] leading-tight">
                100% sustainable wild Assamese Oud & mountain Taif roses
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border border-[#C6A15B]/40 flex items-center justify-center mb-3 text-[#C6A15B]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h5 className="font-cinzel text-xs uppercase tracking-widest text-[#F3EEE5] mb-1">
                30-Day Royal Privilege
              </h5>
              <p className="text-[11px] text-[#C5B8A8] leading-tight">
                Test the sample first; complimentary returns if unopened
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <span className="block font-cinzel text-2xl font-bold tracking-[0.25em] text-[#F3EEE5]">
                ARABIAN SHEIKH
              </span>
              <span className="block text-[10px] uppercase tracking-[0.45em] text-[#C6A15B] font-sans font-medium mt-0.5">
                Haute Parfumerie Arabe
              </span>
            </Link>
            <p className="text-xs text-[#C5B8A8] leading-relaxed max-w-sm font-sans">
              An eternal sanctuary of Arabian olfactory nobility. Distilling wild aged Dehn Al Oud, sacred Bakhoor, and crystalline Amber for discerning connoisseurs worldwide.
            </p>
            <div className="pt-2 text-xs font-sans text-[#C5B8A8] space-y-1">
              <p><strong className="text-[#F3EEE5] font-cinzel">Flagship Palace:</strong> Downtown Dubai, UAE</p>
              <p><strong className="text-[#F3EEE5] font-cinzel">Concierge:</strong> +971 4 800-SHEIKH (08:00 - 22:00 GMT)</p>
            </div>
          </div>

          {/* Quick Links: Boutique */}
          <div>
            <h4 className="font-cinzel text-xs uppercase tracking-[0.25em] text-[#C6A15B] border-b border-[#C6A15B]/20 pb-2 mb-4">
              {t('nav.shop')}
            </h4>
            <ul className="space-y-2.5 text-xs text-[#C5B8A8] font-sans">
              <li>
                <Link to="/shop" className="hover:text-[#C6A15B] transition-colors">
                  {t('nav.allPerfumes')}
                </Link>
              </li>
              <li>
                <Link to="/men" className="hover:text-[#C6A15B] transition-colors">
                  {t('nav.men')}
                </Link>
              </li>
              <li>
                <Link to="/women" className="hover:text-[#C6A15B] transition-colors">
                  {t('nav.women')}
                </Link>
              </li>
              <li>
                <Link to="/unisex" className="hover:text-[#C6A15B] transition-colors">
                  {t('nav.unisex')}
                </Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-[#C6A15B] transition-colors">
                  {t('nav.collections')}
                </Link>
              </li>
              <li>
                <Link to="/shop?family=woody" className="hover:text-[#C6A15B] transition-colors">
                  {t('families.woody')} (Oud)
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links: The House */}
          <div>
            <h4 className="font-cinzel text-xs uppercase tracking-[0.25em] text-[#C6A15B] border-b border-[#C6A15B]/20 pb-2 mb-4">
              {t('nav.theHouse')}
            </h4>
            <ul className="space-y-2.5 text-xs text-[#C5B8A8] font-sans">
              <li>
                <Link to="/the-house" className="hover:text-[#C6A15B] transition-colors">
                  {t('theHouse.storyTitle')}
                </Link>
              </li>
              <li>
                <Link to="/the-house#oud" className="hover:text-[#C6A15B] transition-colors">
                  {t('theHouse.oudTitle')}
                </Link>
              </li>
              <li>
                <Link to="/the-house#bakhoor" className="hover:text-[#C6A15B] transition-colors">
                  {t('theHouse.bakhoorTitle')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#C6A15B] transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#C6A15B] transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
              <li>
                <Link to="/order-tracking/ORD-98421" className="hover:text-[#C6A15B] transition-colors">
                  {t('confirmation.trackOrder')}
                </Link>
              </li>
            </ul>
          </div>

          {/* VIP Newsletter Col */}
          <div>
            <h4 className="font-cinzel text-xs uppercase tracking-[0.25em] text-[#C6A15B] border-b border-[#C6A15B]/20 pb-2 mb-4">
              {t('home.vipTitle')}
            </h4>
            <p className="text-xs text-[#C5B8A8] mb-3 leading-relaxed">
              {t('home.vipDesc')}
            </p>
            {subscribed ? (
              <div className="p-3 border border-[#C6A15B]/40 bg-[#1C120E] text-xs text-[#C6A15B]">
                ✓ You are enrolled in the VIP Private Circle.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('home.emailPlaceholder')}
                  required
                  className="w-full bg-[#1C120E] border border-[#C6A15B]/30 px-3 py-2 text-xs text-[#F3EEE5] placeholder-[#C5B8A8]/50 focus:border-[#C6A15B] focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="w-full luxury-btn-gold py-2 text-xs flex items-center justify-center gap-1.5"
                >
                  <span>{t('home.subscribe')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Boutiques Strip */}
        <div className="mt-12 pt-8 border-t border-[#C6A15B]/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs text-[#C5B8A8]">
          <div className="p-2 border border-[#C6A15B]/10 bg-[#1C120E]/40">
            <span className="font-cinzel text-[#F3EEE5] block mb-0.5">DUBAI</span>
            <span className="text-[11px]">Downtown Palace</span>
          </div>
          <div className="p-2 border border-[#C6A15B]/10 bg-[#1C120E]/40">
            <span className="font-cinzel text-[#F3EEE5] block mb-0.5">LONDON</span>
            <span className="text-[11px]">Mayfair Salon</span>
          </div>
          <div className="p-2 border border-[#C6A15B]/10 bg-[#1C120E]/40">
            <span className="font-cinzel text-[#F3EEE5] block mb-0.5">PARIS</span>
            <span className="text-[11px]">Place Vendôme</span>
          </div>
          <div className="p-2 border border-[#C6A15B]/10 bg-[#1C120E]/40">
            <span className="font-cinzel text-[#F3EEE5] block mb-0.5">RIYADH</span>
            <span className="text-[11px]">Al Olaya Suite</span>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Language Selector */}
        <div className="mt-10 pt-6 border-t border-[#C6A15B]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#C5B8A8]">
          <p>© 2026 ARABIAN SHEIKH. {t('common.allRights')}</p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-[#C6A15B]" />
              <div className="flex gap-2">
                {availableLanguages.map(l => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    className={`text-[11px] uppercase tracking-wider ${
                      language === l.code ? 'text-[#C6A15B] font-bold underline underline-offset-4' : 'text-[#C5B8A8] hover:text-[#F3EEE5]'
                    }`}
                  >
                    {l.short}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
