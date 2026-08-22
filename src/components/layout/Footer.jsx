import React, { useState } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import ArabianLogo from '../common/ArabianLogo';
import { Sparkles, ArrowRight, ShieldCheck, Truck, Award, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
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
    <footer className="bg-[var(--color-earth-dark)] border-t border-[var(--color-terracotta)]/30 text-[var(--color-desert-light)] mt-auto transition-colors duration-400">
      {/* Guarantees & Pillars Row */}
      <div className="border-b border-[var(--color-terracotta-deep)]/40 py-4 bg-[var(--color-earth-dark)]/95">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full border border-[var(--color-terracotta)]/50 flex items-center justify-center mb-2 text-[var(--color-terracotta)] bg-[var(--color-earth-dark)]">
                <Truck className="w-4 h-4" />
              </div>
              <h5 className="font-cinzel text-xs uppercase tracking-widest text-[var(--color-desert-light)] mb-0.5 font-semibold">
                Royal Express Delivery
              </h5>
              <p className="text-[11px] text-[var(--color-desert-light)]/75 leading-tight">
                Insured worldwide courier dispatch with live tracking
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full border border-[var(--color-terracotta)]/50 flex items-center justify-center mb-2 text-[var(--color-terracotta)] bg-[var(--color-earth-dark)]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h5 className="font-cinzel text-xs uppercase tracking-widest text-[var(--color-desert-light)] mb-0.5 font-semibold">
                Complimentary Samples
              </h5>
              <p className="text-[11px] text-[var(--color-desert-light)]/75 leading-tight">
                Two 2ml discovery vials in velvet pouches with each flacon
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full border border-[var(--color-terracotta)]/50 flex items-center justify-center mb-2 text-[var(--color-terracotta)] bg-[var(--color-earth-dark)]">
                <Award className="w-4 h-4" />
              </div>
              <h5 className="font-cinzel text-xs uppercase tracking-widest text-[var(--color-desert-light)] mb-0.5 font-semibold">
                Pure Wild Harvests
              </h5>
              <p className="text-[11px] text-[var(--color-desert-light)]/75 leading-tight">
                100% sustainable wild Assamese Oud & mountain Taif roses
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full border border-[var(--color-terracotta)]/50 flex items-center justify-center mb-2 text-[var(--color-terracotta)] bg-[var(--color-earth-dark)]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h5 className="font-cinzel text-xs uppercase tracking-widest text-[var(--color-desert-light)] mb-0.5 font-semibold">
                30-Day Royal Privilege
              </h5>
              <p className="text-[11px] text-[var(--color-desert-light)]/75 leading-tight">
                Test the sample first; complimentary returns if unopened
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-3">
            <Link to="/" className="inline-block py-0.5">
              <span className="font-cinzel font-bold text-[var(--color-desert-light)] hover:text-[var(--color-terracotta)] transition-colors text-lg tracking-[0.25em] uppercase">
                ARABIAN SHEIKH
              </span>
            </Link>
            <p className="text-xs text-[var(--color-desert-light)]/80 leading-relaxed max-w-sm font-sans">
              An eternal sanctuary of Arabian olfactory nobility. Distilling wild aged Dehn Al Oud, sacred Bakhoor, and crystalline Amber for discerning connoisseurs worldwide.
            </p>
            <div className="pt-1 text-xs font-sans text-[var(--color-desert-light)]/75 space-y-0.5">
              <p><strong className="text-[var(--color-desert-light)] font-cinzel">Flagship Palace:</strong> Downtown Dubai, UAE</p>
              <p><strong className="text-[var(--color-desert-light)] font-cinzel">Concierge:</strong> +971 4 800-SHEIKH (08:00 - 22:00 GMT)</p>
            </div>
          </div>

          {/* Quick Links: Boutique */}
          <div>
            <h4 className="font-cinzel text-xs uppercase tracking-[0.25em] text-[var(--color-terracotta)] border-b border-[var(--color-terracotta)]/30 pb-1.5 mb-3 font-bold">
              {t('nav.shop')}
            </h4>
            <ul className="space-y-2 text-xs text-[var(--color-desert-light)]/80 font-sans">
              <li>
                <Link to="/shop" className="hover:text-[var(--color-terracotta)] transition-colors">
                  {t('nav.allPerfumes')}
                </Link>
              </li>
              <li>
                <Link to="/men" className="hover:text-[var(--color-terracotta)] transition-colors">
                  {t('nav.men')}
                </Link>
              </li>
              <li>
                <Link to="/women" className="hover:text-[var(--color-terracotta)] transition-colors">
                  {t('nav.women')}
                </Link>
              </li>
              <li>
                <Link to="/unisex" className="hover:text-[var(--color-terracotta)] transition-colors">
                  {t('nav.unisex')}
                </Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-[var(--color-terracotta)] transition-colors">
                  {t('nav.collections')}
                </Link>
              </li>
              <li>
                <Link to="/shop?family=woody" className="hover:text-[var(--color-terracotta)] transition-colors">
                  {t('families.woody')} (Oud)
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links: The House */}
          <div>
            <h4 className="font-cinzel text-xs uppercase tracking-[0.25em] text-[var(--color-terracotta)] border-b border-[var(--color-terracotta)]/30 pb-1.5 mb-3 font-bold">
              {t('nav.theHouse')}
            </h4>
            <ul className="space-y-2 text-xs text-[var(--color-desert-light)]/80 font-sans">
              <li>
                <Link to="/the-house" className="hover:text-[var(--color-terracotta)] transition-colors">
                  {t('theHouse.storyTitle')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[var(--color-terracotta)] transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[var(--color-terracotta)] transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
              <li>
                <Link to="/the-house" className="hover:text-[var(--color-terracotta)] transition-colors">
                  Private Olfactory Salons
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter VIP */}
          <div>
            <h4 className="font-cinzel text-xs uppercase tracking-[0.25em] text-[var(--color-terracotta)] border-b border-[var(--color-terracotta)]/30 pb-1.5 mb-3 font-bold">
              Palace Privileges
            </h4>
            <p className="text-xs text-[var(--color-desert-light)]/80 leading-relaxed mb-2">
              Subscribe to receive private flacon allocations and invitations to exclusive previews.
            </p>
            {subscribed ? (
              <div className="p-2.5 bg-[var(--color-terracotta)]/20 border border-[var(--color-terracotta)] text-xs text-[var(--color-desert-light)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--color-terracotta)]" />
                <span>Granted VIP Palace Access</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-[var(--color-earth-dark)]/90 border border-[var(--color-terracotta)]/40 focus:border-[var(--color-terracotta)] py-2 px-3 text-xs text-[var(--color-desert-light)] placeholder:text-[var(--color-desert-light)]/40 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full luxury-btn-gold py-2 text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Request VIP Access</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Legal Row */}
        <div className="mt-6 pt-3 border-t border-[var(--color-terracotta-deep)]/40 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--color-desert-light)]/70 font-sans gap-2">
          <p>© {new Date().getFullYear()} Arabian Sheikh Haute Parfumerie. All Sovereign Rights Reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-[var(--color-terracotta)] cursor-pointer">Privacy Charter</span>
            <span className="hover:text-[var(--color-terracotta)] cursor-pointer">Terms of Patronage</span>
            <span className="hover:text-[var(--color-terracotta)] cursor-pointer">Authenticity Certificate</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
