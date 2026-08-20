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
    <div className="pt-36 sm:pt-40 pb-24 min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 animate-fade-in text-[var(--color-earth-dark)]">
      <ScrollReveal direction="up">
        <div className="max-w-md w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-8 sm:p-10 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-none border border-[var(--color-terracotta)]/40 bg-[var(--color-desert-primary)]/30 flex items-center justify-center mx-auto text-[var(--color-terracotta)] mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[var(--color-earth-dark)]">
            {t('auth.loginTitle')}
          </h1>
          <p className="text-xs text-[var(--color-terracotta-deep)] font-medium">
            {t('auth.loginSubtitle')}
          </p>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="p-3 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta)]/30 space-y-2 text-xs">
          <p className="text-[11px] uppercase tracking-wider text-[var(--color-terracotta)] font-cinzel font-bold text-center">
            ✦ Quick Access Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoCustomer}
              className="py-1.5 px-2 bg-[var(--color-desert-light)] hover:bg-[var(--color-desert-primary)]/50 border border-[var(--color-terracotta-deep)]/25 text-[11px] text-[var(--color-earth-dark)] font-semibold text-center transition-colors cursor-pointer"
            >
              Patron User
            </button>
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="py-1.5 px-2 bg-[var(--color-desert-light)] hover:bg-[var(--color-desert-primary)]/50 border border-[var(--color-terracotta)]/40 text-[11px] text-[var(--color-terracotta)] font-bold text-center transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <ShieldAlert className="w-3 h-3 text-[var(--color-terracotta)]" />
              <span>Grand Admin</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block uppercase tracking-wider text-[var(--color-terracotta-deep)] font-semibold mb-1">
              {t('auth.email')}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@palace.com"
                className="w-full bg-[var(--color-desert-primary)]/40 border border-[var(--color-terracotta-deep)]/25 py-2.5 pl-9 pr-3 text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none font-medium"
              />
              <Mail className="w-4 h-4 text-[var(--color-terracotta)] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="uppercase tracking-wider text-[var(--color-terracotta-deep)] font-semibold">
                {t('auth.password')}
              </label>
              <Link to="/forgot-password" className="text-[11px] text-[var(--color-terracotta)] font-bold hover:underline">
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
                className="w-full bg-[var(--color-desert-primary)]/40 border border-[var(--color-terracotta-deep)]/25 py-2.5 pl-9 pr-3 text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none"
              />
              <KeyRound className="w-4 h-4 text-[var(--color-terracotta)] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-[#B45625] cursor-pointer"
            />
            <label htmlFor="remember" className="text-xs text-[var(--color-terracotta-deep)] font-medium cursor-pointer">
              {t('auth.rememberMe')}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full luxury-btn-gold py-3.5 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-md"
          >
            <span>{loading ? 'Authenticating...' : t('auth.login')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Signup Link */}
        <div className="text-center text-xs text-[var(--color-terracotta-deep)] pt-4 border-t border-[var(--color-terracotta-deep)]/20 font-medium">
          <span>{t('auth.noAccount')} </span>
          <Link to="/signup" className="text-[var(--color-terracotta)] hover:underline font-bold font-cinzel">
            {t('auth.signup')}
          </Link>
        </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
