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
    <footer
      className={`relative z-20 border-t-2 mt-auto transition-colors duration-400 ${
        isDark
          ? 'bg-[#0B0A08] border-[#D4AF37]/50 text-[#F5EAD3]'
          : 'bg-[#FAF6EE] border-[#A8853B]/40 text-[#1F140E]'
      }`}
    >
      {/* Guarantees & Pillars Row */}
      <div
        className={`border-b py-5 transition-colors ${
          isDark
            ? 'bg-[#140D07] border-[#D4AF37]/30 text-[#F5EAD3]'
            : 'bg-[#F2EAE0] border-[#A8853B]/30 text-[#1F140E]'
        }`}
      >
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {/* Guarantee 1 */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full border flex items-center justify-center mb-2.5 shadow-sm transition-colors ${
                  isDark
                    ? 'border-[#D4AF37] text-[#FFDF8A] bg-[#1E140B]'
                    : 'border-[#A8853B] text-[#704622] bg-white'
                }`}
              >
                <Truck className="w-4 h-4" />
              </div>
              <h5
                className={`font-cinzel text-xs uppercase tracking-widest mb-1 font-bold ${
                  isDark ? 'text-[#FFFDF8]' : 'text-[#2C180F]'
                }`}
              >
                Royal Express Delivery
              </h5>
              <p
                className={`text-[11px] leading-tight ${
                  isDark ? 'text-[#E2D5BC]' : 'text-[#5A3517]'
                }`}
              >
                Insured worldwide courier dispatch with live tracking
              </p>
            </div>

            {/* Guarantee 2 */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full border flex items-center justify-center mb-2.5 shadow-sm transition-colors ${
                  isDark
                    ? 'border-[#D4AF37] text-[#FFDF8A] bg-[#1E140B]'
                    : 'border-[#A8853B] text-[#704622] bg-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <h5
                className={`font-cinzel text-xs uppercase tracking-widest mb-1 font-bold ${
                  isDark ? 'text-[#FFFDF8]' : 'text-[#2C180F]'
                }`}
              >
                Complimentary Samples
              </h5>
              <p
                className={`text-[11px] leading-tight ${
                  isDark ? 'text-[#E2D5BC]' : 'text-[#5A3517]'
                }`}
              >
                Two 2ml discovery vials in velvet pouches with each flacon
              </p>
            </div>

            {/* Guarantee 3 */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full border flex items-center justify-center mb-2.5 shadow-sm transition-colors ${
                  isDark
                    ? 'border-[#D4AF37] text-[#FFDF8A] bg-[#1E140B]'
                    : 'border-[#A8853B] text-[#704622] bg-white'
                }`}
              >
                <Award className="w-4 h-4" />
              </div>
              <h5
                className={`font-cinzel text-xs uppercase tracking-widest mb-1 font-bold ${
                  isDark ? 'text-[#FFFDF8]' : 'text-[#2C180F]'
                }`}
              >
                Pure Wild Harvests
              </h5>
              <p
                className={`text-[11px] leading-tight ${
                  isDark ? 'text-[#E2D5BC]' : 'text-[#5A3517]'
                }`}
              >
                100% sustainable wild Assamese Oud & mountain Taif roses
              </p>
            </div>

            {/* Guarantee 4 */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full border flex items-center justify-center mb-2.5 shadow-sm transition-colors ${
                  isDark
                    ? 'border-[#D4AF37] text-[#FFDF8A] bg-[#1E140B]'
                    : 'border-[#A8853B] text-[#704622] bg-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h5
                className={`font-cinzel text-xs uppercase tracking-widest mb-1 font-bold ${
                  isDark ? 'text-[#FFFDF8]' : 'text-[#2C180F]'
                }`}
              >
                30-Day Royal Privilege
              </h5>
              <p
                className={`text-[11px] leading-tight ${
                  isDark ? 'text-[#E2D5BC]' : 'text-[#5A3517]'
                }`}
              >
                Test the sample first; complimentary returns if unopened
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block py-0.5 group">
              <span
                className={`font-cinzel font-bold text-xl tracking-[0.25em] uppercase transition-colors ${
                  isDark
                    ? 'text-[#FFDF8A] group-hover:text-white'
                    : 'text-[#704622] group-hover:text-[#A8853B]'
                }`}
              >
                ARABIAN SHEIKH
              </span>
            </Link>
            <p
              className={`text-xs leading-relaxed max-w-sm font-sans ${
                isDark ? 'text-[#E2D5BC]' : 'text-[#3A2116]'
              }`}
            >
              An eternal sanctuary of Arabian olfactory nobility. Distilling wild aged Dehn Al Oud, sacred Bakhoor, and crystalline Amber for discerning connoisseurs worldwide.
            </p>
            <div
              className={`pt-2 text-xs font-sans space-y-1.5 ${
                isDark ? 'text-[#E2D5BC]' : 'text-[#4A2A14]'
              }`}
            >
              <p>
                <strong className={`font-cinzel ${isDark ? 'text-[#FFFDF8]' : 'text-[#120B06]'}`}>
                  Flagship Palace:
                </strong>{' '}
                Downtown Dubai, UAE
              </p>
              <p>
                <strong className={`font-cinzel ${isDark ? 'text-[#FFFDF8]' : 'text-[#120B06]'}`}>
                  Concierge:
                </strong>{' '}
                +971 4 800-SHEIKH (08:00 - 22:00 GMT)
              </p>
            </div>
          </div>

          {/* Quick Links: Boutique */}
          <div>
            <h4
              className={`font-cinzel text-xs uppercase tracking-[0.25em] border-b pb-2 mb-3.5 font-bold ${
                isDark
                  ? 'text-[#FFDF8A] border-[#D4AF37]/40'
                  : 'text-[#704622] border-[#A8853B]/40'
              }`}
            >
              {t('nav.shop') || 'Boutique'}
            </h4>
            <ul
              className={`space-y-2.5 text-xs font-sans ${
                isDark ? 'text-[#E2D5BC]' : 'text-[#4A2A14]'
              }`}
            >
              <li>
                <Link
                  to="/shop"
                  className={`transition-colors ${
                    isDark ? 'hover:text-[#FFDF8A]' : 'hover:text-[#704622] font-medium'
                  }`}
                >
                  {t('nav.allPerfumes') || 'All Perfumes'}
                </Link>
              </li>
              <li>
                <Link
                  to="/men"
                  className={`transition-colors ${
                    isDark ? 'hover:text-[#FFDF8A]' : 'hover:text-[#704622] font-medium'
                  }`}
                >
                  {t('nav.men') || 'Men'}
                </Link>
              </li>
              <li>
                <Link
                  to="/women"
                  className={`transition-colors ${
                    isDark ? 'hover:text-[#FFDF8A]' : 'hover:text-[#704622] font-medium'
                  }`}
                >
                  {t('nav.women') || 'Women'}
                </Link>
              </li>
              <li>
                <Link
                  to="/unisex"
                  className={`transition-colors ${
                    isDark ? 'hover:text-[#FFDF8A]' : 'hover:text-[#704622] font-medium'
                  }`}
                >
                  {t('nav.unisex') || 'Unisex'}
                </Link>
              </li>
              <li>
                <Link
                  to="/collections"
                  className={`transition-colors ${
                    isDark ? 'hover:text-[#FFDF8A]' : 'hover:text-[#704622] font-medium'
                  }`}
                >
                  {t('nav.collections') || 'Collections'}
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?family=woody"
                  className={`transition-colors ${
                    isDark ? 'hover:text-[#FFDF8A]' : 'hover:text-[#704622] font-medium'
                  }`}
                >
                  {t('families.woody') || 'Woody'} (Oud)
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links: The House */}
          <div>
            <h4
              className={`font-cinzel text-xs uppercase tracking-[0.25em] border-b pb-2 mb-3.5 font-bold ${
                isDark
                  ? 'text-[#FFDF8A] border-[#D4AF37]/40'
                  : 'text-[#704622] border-[#A8853B]/40'
              }`}
            >
              {t('nav.theHouse') || 'The Sovereign House'}
            </h4>
            <ul
              className={`space-y-2.5 text-xs font-sans ${
                isDark ? 'text-[#E2D5BC]' : 'text-[#4A2A14]'
              }`}
            >
              <li>
                <Link
                  to="/the-house"
                  className={`transition-colors ${
                    isDark ? 'hover:text-[#FFDF8A]' : 'hover:text-[#704622] font-medium'
                  }`}
                >
                  {t('theHouse.storyTitle') || 'Our Royal Legacy'}
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className={`transition-colors ${
                    isDark ? 'hover:text-[#FFDF8A]' : 'hover:text-[#704622] font-medium'
                  }`}
                >
                  {t('nav.about') || 'About Us'}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className={`transition-colors ${
                    isDark ? 'hover:text-[#FFDF8A]' : 'hover:text-[#704622] font-medium'
                  }`}
                >
                  {t('nav.contact') || 'Concierge Contact'}
                </Link>
              </li>
              <li>
                <Link
                  to="/the-house"
                  className={`transition-colors ${
                    isDark ? 'hover:text-[#FFDF8A]' : 'hover:text-[#704622] font-medium'
                  }`}
                >
                  Private Olfactory Salons
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter VIP */}
          <div>
            <h4
              className={`font-cinzel text-xs uppercase tracking-[0.25em] border-b pb-2 mb-3.5 font-bold ${
                isDark
                  ? 'text-[#FFDF8A] border-[#D4AF37]/40'
                  : 'text-[#704622] border-[#A8853B]/40'
              }`}
            >
              Palace Privileges
            </h4>
            <p
              className={`text-xs leading-relaxed mb-3 ${
                isDark ? 'text-[#E2D5BC]' : 'text-[#3A2116]'
              }`}
            >
              Subscribe to receive private flacon allocations and invitations to exclusive previews.
            </p>
            {subscribed ? (
              <div className="p-3 bg-[#D4AF37]/20 border border-[#D4AF37] text-xs text-[#FFF2B2] flex items-center gap-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#D4AF37]" />
                <span className="font-medium">Granted VIP Palace Access</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2.5">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={`w-full py-2.5 px-3.5 text-xs rounded-xl focus:outline-none border transition-colors ${
                      isDark
                        ? 'bg-[#140D07] border-[#D4AF37]/50 focus:border-[#FFDF8A] text-[#FFFDF8] placeholder:text-[#E2D5BC]/60'
                        : 'bg-white border-[#A8853B]/50 focus:border-[#704622] text-[#1F140E] placeholder:text-[#8A6540]/70 shadow-xs'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  className={`w-full py-2.5 text-xs font-cinzel font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all duration-300 ${
                    isDark
                      ? 'bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] hover:from-[#F2D675] hover:via-[#D4AF37] hover:to-[#F2D675] text-white hover:text-black border border-[#F2D675]/60 hover:scale-[1.01]'
                      : 'bg-[#704622] hover:bg-[#4A2A14] text-white hover:text-[#FFDF8A] border border-[#A8853B]/50 hover:scale-[1.01]'
                  }`}
                >
                  <span>Request VIP Access</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Legal Row */}
        <div
          className={`mt-10 pt-5 border-t flex flex-col sm:flex-row items-center justify-between text-xs font-sans gap-3 ${
            isDark
              ? 'border-[#D4AF37]/25 text-[#E2D5BC]/80'
              : 'border-[#A8853B]/25 text-[#5A3517]'
          }`}
        >
          <p>© {new Date().getFullYear()} Arabian Sheikh Haute Parfumerie. All Sovereign Rights Reserved.</p>
          <div className="flex flex-wrap gap-5 sm:gap-6">
            <span
              className={`cursor-pointer transition-colors ${
                isDark ? 'hover:text-[#FFDF8A]' : 'hover:text-[#704622] font-medium'
              }`}
            >
              Privacy Charter
            </span>
            <span
              className={`cursor-pointer transition-colors ${
                isDark ? 'hover:text-[#FFDF8A]' : 'hover:text-[#704622] font-medium'
              }`}
            >
              Terms of Patronage
            </span>
            <span
              className={`cursor-pointer transition-colors ${
                isDark ? 'hover:text-[#FFDF8A]' : 'hover:text-[#704622] font-medium'
              }`}
            >
              Authenticity Certificate
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
