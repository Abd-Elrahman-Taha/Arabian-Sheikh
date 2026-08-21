import React, { useState } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Lock, Mail, ArrowRight, ShieldAlert, KeyRound } from 'lucide-react';
import ScrollReveal from '../../components/common/ScrollReveal';

export default function Login({ returnPath }) {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const { login } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      success(`Welcome back to the Palace, ${user.name}.`);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (returnPath) {
        navigate(returnPath);
      } else {
        navigate('/account');
      }
    } catch (err) {
      error(err.message || 'Login credentials unverified.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = () => {
    setEmail('admin@arabiansheikh.com');
    setPassword('admin123');
  };

  const handleDemoCustomer = () => {
    setEmail('sheikh.user@luxury.com');
    setPassword('user123');
  };

  return (
    <div className="pt-36 sm:pt-40 pb-24 min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 animate-fade-in text-[#F3E6D0]">
      <ScrollReveal direction="up">
        <div className="max-w-md w-full rounded-3xl bg-[#0B0A08]/90 border border-[#D4AF37]/35 p-8 sm:p-10 shadow-2xl space-y-6 backdrop-blur-md">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl border border-[#D4AF37]/50 bg-gradient-to-br from-[#D4AF37]/20 via-black to-[#8C6239]/20 flex items-center justify-center mx-auto text-[#F2D675] shadow-[0_0_20px_rgba(212,175,55,0.25)] mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0]">
            {t('auth.loginTitle')}
          </h1>
          <p className="text-xs text-[#D8BE99] font-medium">
            {t('auth.loginSubtitle')}
          </p>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="p-3.5 rounded-2xl bg-black/60 border border-[#D4AF37]/30 space-y-2 text-xs shadow-inner">
          <p className="text-[11px] uppercase tracking-wider text-[#F2D675] font-cinzel font-bold text-center">
            ✦ Quick Access Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoCustomer}
              className="py-2 px-2.5 rounded-xl bg-black/60 hover:bg-[#21130D] border border-[#D4AF37]/25 text-[11px] text-[#F3E6D0] font-semibold text-center transition-all cursor-pointer hover:border-[#D4AF37]"
            >
              Patron User
            </button>
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="py-2 px-2.5 rounded-xl bg-black/60 hover:bg-[#21130D] border border-[#D4AF37]/40 text-[11px] text-[#F2D675] font-bold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:border-[#F2D675]"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Grand Admin</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block uppercase tracking-wider text-[#D8BE99] font-semibold mb-1">
              {t('auth.email')}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@palace.com"
                className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-3 pl-10 pr-3 text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:outline-none font-medium"
              />
              <Mail className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="uppercase tracking-wider text-[#D8BE99] font-semibold">
                {t('auth.password')}
              </label>
              <Link to="/forgot-password" className="text-[11px] text-[#F2D675] font-bold hover:underline">
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-3 pl-10 pr-3 text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:outline-none"
              />
              <KeyRound className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-[#D4AF37] cursor-pointer"
            />
            <label htmlFor="remember" className="text-xs text-[#D8BE99] font-medium cursor-pointer">
              {t('auth.rememberMe')}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full luxury-btn-gold py-4 text-xs font-bold uppercase tracking-[0.22em] flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-xl"
          >
            <span>{loading ? 'Authenticating...' : t('auth.login')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Signup Link */}
        <div className="text-center text-xs text-[#D8BE99] pt-4 border-t border-[#D4AF37]/20 font-medium">
          <span>{t('auth.noAccount')} </span>
          <Link to="/signup" className="text-[#F2D675] hover:underline font-bold font-cinzel ml-1">
            {t('auth.signup')}
          </Link>
        </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
