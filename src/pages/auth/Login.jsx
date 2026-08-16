import React, { useState } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Lock, Mail, Sparkles, ArrowRight, ShieldAlert, KeyRound } from 'lucide-react';

export default function Login() {
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
    <div className="pt-28 pb-24 min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 animate-fade-in text-[#F3EEE5]">
      <div className="max-w-md w-full bg-[#1C120E] border border-[#C6A15B]/30 p-8 sm:p-10 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-none border border-[#C6A15B]/40 bg-[#0F0D0C] flex items-center justify-center mx-auto text-[#C6A15B] mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider">
            {t('auth.loginTitle')}
          </h1>
          <p className="text-xs text-[#C5B8A8]">
            {t('auth.loginSubtitle')}
          </p>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="p-3 bg-[#0F0D0C] border border-[#C6A15B]/20 space-y-2 text-xs">
          <p className="text-[11px] uppercase tracking-wider text-[#C6A15B] font-cinzel font-semibold text-center">
            ✦ Quick Access Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoCustomer}
              className="py-1.5 px-2 bg-[#2B1A12] hover:bg-[#382319] border border-[#C6A15B]/30 text-[11px] text-[#F3EEE5] text-center transition-colors"
            >
              Patron User
            </button>
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="py-1.5 px-2 bg-[#2B1A12] hover:bg-[#382319] border border-[#C6A15B]/50 text-[11px] text-[#DFBF7A] font-semibold text-center transition-colors flex items-center justify-center gap-1"
            >
              <ShieldAlert className="w-3 h-3 text-[#C6A15B]" />
              <span>Grand Admin</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block uppercase tracking-wider text-[#C5B8A8] mb-1">
              {t('auth.email')}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@palace.com"
                className="w-full bg-[#0F0D0C] border border-[#C6A15B]/30 py-2.5 pl-9 pr-3 text-[#F3EEE5] focus:border-[#C6A15B] focus:outline-none"
              />
              <Mail className="w-4 h-4 text-[#C6A15B] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="uppercase tracking-wider text-[#C5B8A8]">
                {t('auth.password')}
              </label>
              <Link to="/forgot-password" className="text-[11px] text-[#C6A15B] hover:underline">
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
                className="w-full bg-[#0F0D0C] border border-[#C6A15B]/30 py-2.5 pl-9 pr-3 text-[#F3EEE5] focus:border-[#C6A15B] focus:outline-none"
              />
              <KeyRound className="w-4 h-4 text-[#C6A15B] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-[#C6A15B]"
            />
            <label htmlFor="remember" className="text-xs text-[#C5B8A8] cursor-pointer">
              {t('auth.rememberMe')}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full luxury-btn-gold py-3.5 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 mt-4"
          >
            <span>{loading ? 'Authenticating...' : t('auth.login')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Signup Link */}
        <div className="text-center text-xs text-[#C5B8A8] pt-4 border-t border-[#C6A15B]/15">
          <span>{t('auth.noAccount')} </span>
          <Link to="/signup" className="text-[#C6A15B] hover:underline font-semibold font-cinzel">
            {t('auth.signup')}
          </Link>
        </div>
      </div>
    </div>
  );
}
