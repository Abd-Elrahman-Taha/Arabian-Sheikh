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
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-gold-subtle)] text-[var(--text-primary)] mt-auto transition-colors duration-400">
      {/* Guarantees & Pillars Row */}
      <div className="border-b border-[var(--border-subtle)] py-8 bg-[var(--bg-card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border border-[var(--gold-primary)]/40 flex items-center justify-center mb-3 text-[var(--gold-primary)] bg-[var(--bg-primary)]">
                <Truck className="w-5 h-5" />
              </div>
              <h5 className="font-cinzel text-xs uppercase tracking-widest text-[var(--text-primary)] mb-1">
                Royal Express Delivery
              </h5>
              <p className="text-[11px] text-[var(--text-muted)] leading-tight">
                Insured worldwide courier dispatch with live tracking
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border border-[var(--gold-primary)]/40 flex items-center justify-center mb-3 text-[var(--gold-primary)] bg-[var(--bg-primary)]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h5 className="font-cinzel text-xs uppercase tracking-widest text-[var(--text-primary)] mb-1">
                Complimentary Samples
              </h5>
              <p className="text-[11px] text-[var(--text-muted)] leading-tight">
                Two 2ml discovery vials in velvet pouches with each flacon
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border border-[var(--gold-primary)]/40 flex items-center justify-center mb-3 text-[var(--gold-primary)] bg-[var(--bg-primary)]">
                <Award className="w-5 h-5" />
              </div>
              <h5 className="font-cinzel text-xs uppercase tracking-widest text-[var(--text-primary)] mb-1">
                Pure Wild Harvests
              </h5>
              <p className="text-[11px] text-[var(--text-muted)] leading-tight">
                100% sustainable wild Assamese Oud & mountain Taif roses
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border border-[var(--gold-primary)]/40 flex items-center justify-center mb-3 text-[var(--gold-primary)] bg-[var(--bg-primary)]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h5 className="font-cinzel text-xs uppercase tracking-widest text-[var(--text-primary)] mb-1">
                30-Day Royal Privilege
              </h5>
              <p className="text-[11px] text-[var(--text-muted)] leading-tight">
                Test the sample first; complimentary returns if unopened
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block py-1">
              <ArabianLogo variant="horizontal" size="md" showSubtitle={true} />
            </Link>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-sm font-sans">
              An eternal sanctuary of Arabian olfactory nobility. Distilling wild aged Dehn Al Oud, sacred Bakhoor, and crystalline Amber for discerning connoisseurs worldwide.
            </p>
            <div className="pt-2 text-xs font-sans text-[var(--text-muted)] space-y-1">
              <p><strong className="text-[var(--text-primary)] font-cinzel">Flagship Palace:</strong> Downtown Dubai, UAE</p>
              <p><strong className="text-[var(--text-primary)] font-cinzel">Concierge:</strong> +971 4 800-SHEIKH (08:00 - 22:00 GMT)</p>
            </div>
          </div>

          {/* Quick Links: Boutique */}
          <div>
            <h4 className="font-cinzel text-xs uppercase tracking-[0.25em] text-[var(--gold-primary)] border-b border-[var(--border-gold-subtle)] pb-2 mb-4">
              {t('nav.shop')}
            </h4>
            <ul className="space-y-2.5 text-xs text-[var(--text-muted)] font-sans">
              <li>
                <Link to="/shop" className="hover:text-[var(--gold-primary)] transition-colors">
                  {t('nav.allPerfumes')}
                </Link>
              </li>
              <li>
                <Link to="/men" className="hover:text-[var(--gold-primary)] transition-colors">
                  {t('nav.men')}
                </Link>
              </li>
              <li>
                <Link to="/women" className="hover:text-[var(--gold-primary)] transition-colors">
                  {t('nav.women')}
                </Link>
              </li>
              <li>
                <Link to="/unisex" className="hover:text-[var(--gold-primary)] transition-colors">
                  {t('nav.unisex')}
                </Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-[var(--gold-primary)] transition-colors">
                  {t('nav.collections')}
                </Link>
              </li>
              <li>
                <Link to="/shop?family=woody" className="hover:text-[var(--gold-primary)] transition-colors">
                  {t('families.woody')} (Oud)
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links: The House */}
          <div>
            <h4 className="font-cinzel text-xs uppercase tracking-[0.25em] text-[var(--gold-primary)] border-b border-[var(--border-gold-subtle)] pb-2 mb-4">
              {t('nav.theHouse')}
            </h4>
            <ul className="space-y-2.5 text-xs text-[var(--text-muted)] font-sans">
              <li>
                <Link to="/the-house" className="hover:text-[var(--gold-primary)] transition-colors">
                  {t('theHouse.storyTitle')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[var(--gold-primary)] transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[var(--gold-primary)] transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
              <li>
                <Link to="/the-house" className="hover:text-[var(--gold-primary)] transition-colors">
                  Private Olfactory Salons
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter VIP */}
          <div>
            <h4 className="font-cinzel text-xs uppercase tracking-[0.25em] text-[var(--gold-primary)] border-b border-[var(--border-gold-subtle)] pb-2 mb-4">
              Palace Privileges
            </h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">
              Subscribe to receive private flacon allocations and invitations to exclusive previews.
            </p>
            {subscribed ? (
              <div className="p-3 bg-[var(--gold-primary)]/15 border border-[var(--gold-primary)] text-xs text-[var(--gold-primary)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
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
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-gold-subtle)] focus:border-[var(--gold-primary)] py-2 px-3 text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full luxury-btn-gold py-2.5 text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Request VIP Access</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Legal Row */}
        <div className="mt-12 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-muted)] font-sans gap-4">
          <p>© {new Date().getFullYear()} Arabian Sheikh Haute Parfumerie. All Sovereign Rights Reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-[var(--gold-primary)] cursor-pointer">Privacy Charter</span>
            <span className="hover:text-[var(--gold-primary)] cursor-pointer">Terms of Patronage</span>
            <span className="hover:text-[var(--gold-primary)] cursor-pointer">Authenticity Certificate</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
