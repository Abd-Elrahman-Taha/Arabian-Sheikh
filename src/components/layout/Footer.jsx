import React, { useState } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import ArabianLogo from '../common/ArabianLogo';
import { Sparkles, ArrowRight, ShieldCheck, Truck, Award, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  const { success } = useToast();
  const { isDark } = useTheme();
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
    <footer className="bg-[#0B0A08] border-t-2 border-[#D4AF37]/45 text-[#F3E6D0] mt-auto transition-colors duration-400">
      {/* Guarantees & Pillars Row */}
      <div className="border-b border-[#D4AF37]/30 py-4 bg-[#140D07]/95">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full border border-[#D4AF37]/60 flex items-center justify-center mb-2 text-[#D4AF37] bg-[#0B0A08] shadow-sm">
                <Truck className="w-4 h-4" />
              </div>
              <h5 className="font-cinzel text-xs uppercase tracking-widest text-[#F3E6D0] mb-0.5 font-semibold">
                Royal Express Delivery
              </h5>
              <p className="text-[11px] text-[#D8BE99] leading-tight">
                Insured worldwide courier dispatch with live tracking
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full border border-[#D4AF37]/60 flex items-center justify-center mb-2 text-[#D4AF37] bg-[#0B0A08] shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <h5 className="font-cinzel text-xs uppercase tracking-widest text-[#F3E6D0] mb-0.5 font-semibold">
                Complimentary Samples
              </h5>
              <p className="text-[11px] text-[#D8BE99] leading-tight">
                Two 2ml discovery vials in velvet pouches with each flacon
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full border border-[#D4AF37]/60 flex items-center justify-center mb-2 text-[#D4AF37] bg-[#0B0A08] shadow-sm">
                <Award className="w-4 h-4" />
              </div>
              <h5 className="font-cinzel text-xs uppercase tracking-widest text-[#F3E6D0] mb-0.5 font-semibold">
                Pure Wild Harvests
              </h5>
              <p className="text-[11px] text-[#D8BE99] leading-tight">
                100% sustainable wild Assamese Oud & mountain Taif roses
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full border border-[#D4AF37]/60 flex items-center justify-center mb-2 text-[#D4AF37] bg-[#0B0A08] shadow-sm">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h5 className="font-cinzel text-xs uppercase tracking-widest text-[#F3E6D0] mb-0.5 font-semibold">
                30-Day Royal Privilege
              </h5>
              <p className="text-[11px] text-[#D8BE99] leading-tight">
                Test the sample first; complimentary returns if unopened
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-3">
            <Link to="/" className="inline-block py-0.5">
              <span className="font-cinzel font-bold text-[#D4AF37] hover:text-[#FFF2B2] transition-colors text-lg tracking-[0.25em] uppercase">
                ARABIAN SHEIKH
              </span>
            </Link>
            <p className="text-xs text-[#D8BE99] leading-relaxed max-w-sm font-sans">
              An eternal sanctuary of Arabian olfactory nobility. Distilling wild aged Dehn Al Oud, sacred Bakhoor, and crystalline Amber for discerning connoisseurs worldwide.
            </p>
            <div className="pt-1 text-xs font-sans text-[#D8BE99] space-y-0.5">
              <p><strong className="text-[#F3E6D0] font-cinzel">Flagship Palace:</strong> Downtown Dubai, UAE</p>
              <p><strong className="text-[#F3E6D0] font-cinzel">Concierge:</strong> +971 4 800-SHEIKH (08:00 - 22:00 GMT)</p>
            </div>
          </div>

          {/* Quick Links: Boutique */}
          <div>
            <h4 className="font-cinzel text-xs uppercase tracking-[0.25em] text-[#D4AF37] border-b border-[#D4AF37]/30 pb-1.5 mb-3 font-bold">
              {t('nav.shop')}
            </h4>
            <ul className="space-y-2 text-xs text-[#D8BE99] font-sans">
              <li>
                <Link to="/shop" className="hover:text-[#FFF2B2] transition-colors">
                  {t('nav.allPerfumes')}
                </Link>
              </li>
              <li>
                <Link to="/men" className="hover:text-[#FFF2B2] transition-colors">
                  {t('nav.men')}
                </Link>
              </li>
              <li>
                <Link to="/women" className="hover:text-[#FFF2B2] transition-colors">
                  {t('nav.women')}
                </Link>
              </li>
              <li>
                <Link to="/unisex" className="hover:text-[#FFF2B2] transition-colors">
                  {t('nav.unisex')}
                </Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-[#FFF2B2] transition-colors">
                  {t('nav.collections')}
                </Link>
              </li>
              <li>
                <Link to="/shop?family=woody" className="hover:text-[#FFF2B2] transition-colors">
                  {t('families.woody')} (Oud)
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links: The House */}
          <div>
            <h4 className="font-cinzel text-xs uppercase tracking-[0.25em] text-[#D4AF37] border-b border-[#D4AF37]/30 pb-1.5 mb-3 font-bold">
              {t('nav.theHouse')}
            </h4>
            <ul className="space-y-2 text-xs text-[#D8BE99] font-sans">
              <li>
                <Link to="/the-house" className="hover:text-[#FFF2B2] transition-colors">
                  {t('theHouse.storyTitle')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#FFF2B2] transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#FFF2B2] transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
              <li>
                <Link to="/the-house" className="hover:text-[#FFF2B2] transition-colors">
                  Private Olfactory Salons
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter VIP */}
          <div>
            <h4 className="font-cinzel text-xs uppercase tracking-[0.25em] text-[#D4AF37] border-b border-[#D4AF37]/30 pb-1.5 mb-3 font-bold">
              Palace Privileges
            </h4>
            <p className="text-xs text-[#D8BE99] leading-relaxed mb-2">
              Subscribe to receive private flacon allocations and invitations to exclusive previews.
            </p>
            {subscribed ? (
              <div className="p-2.5 bg-[#D4AF37]/20 border border-[#D4AF37] text-xs text-[#FFF2B2] flex items-center gap-2 rounded-lg">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#D4AF37]" />
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
                    className="w-full bg-[#140D07] border border-[#D4AF37]/50 focus:border-[#D4AF37] py-2 px-3 text-xs text-[#F3E6D0] placeholder:text-[#D8BE99]/50 rounded-lg focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#0B0A08] hover:bg-[#1A1008] text-[#FFF2B2] hover:text-[#D4AF37] border border-[#D4AF37]/70 py-2 text-[11px] font-cinzel font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all hover:border-[#FFF2B2]"
                >
                  <span>Request VIP Access</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Legal Row */}
        <div className="mt-8 pt-4 border-t border-[#D4AF37]/25 flex flex-col sm:flex-row items-center justify-between text-xs text-[#D8BE99]/70 font-sans gap-2">
          <p>© {new Date().getFullYear()} Arabian Sheikh Haute Parfumerie. All Sovereign Rights Reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-[#D4AF37] cursor-pointer transition-colors">Privacy Charter</span>
            <span className="hover:text-[#D4AF37] cursor-pointer transition-colors">Terms of Patronage</span>
            <span className="hover:text-[#D4AF37] cursor-pointer transition-colors">Authenticity Certificate</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
