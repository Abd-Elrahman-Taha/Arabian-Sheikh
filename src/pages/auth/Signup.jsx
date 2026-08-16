import React, { useState } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserPlus, Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function Signup() {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const { signup } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      error('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      error('Password should contain at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const newUser = await signup({ name, email, password });
      success(`Welcome to Arabian Sheikh, ${newUser.name}.`);
      navigate('/account');
    } catch (err) {
      error(err.message || 'Account registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-24 min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 animate-fade-in text-[#F3EEE5]">
      <div className="max-w-md w-full bg-[#1C120E] border border-[#C6A15B]/30 p-8 sm:p-10 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-none border border-[#C6A15B]/40 bg-[#0F0D0C] flex items-center justify-center mx-auto text-[#C6A15B] mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider">
            {t('auth.signupTitle')}
          </h1>
          <p className="text-xs text-[#C5B8A8]">
            {t('auth.signupSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block uppercase tracking-wider text-[#C5B8A8] mb-1">
              {t('auth.fullName')}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Princess Jasmine"
                className="w-full bg-[#0F0D0C] border border-[#C6A15B]/30 py-2.5 pl-9 pr-3 text-[#F3EEE5] focus:border-[#C6A15B] focus:outline-none"
              />
              <User className="w-4 h-4 text-[#C6A15B] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

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
            <label className="block uppercase tracking-wider text-[#C5B8A8] mb-1">
              {t('auth.password')}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0F0D0C] border border-[#C6A15B]/30 py-2.5 pl-9 pr-3 text-[#F3EEE5] focus:border-[#C6A15B] focus:outline-none"
              />
              <Lock className="w-4 h-4 text-[#C6A15B] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block uppercase tracking-wider text-[#C5B8A8] mb-1">
              {t('auth.confirmPassword')}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0F0D0C] border border-[#C6A15B]/30 py-2.5 pl-9 pr-3 text-[#F3EEE5] focus:border-[#C6A15B] focus:outline-none"
              />
              <Lock className="w-4 h-4 text-[#C6A15B] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full luxury-btn-gold py-3.5 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 mt-4"
          >
            <span>{loading ? 'Registering...' : t('auth.signup')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[#C5B8A8] pt-4 border-t border-[#C6A15B]/15">
          <span>{t('auth.haveAccount')} </span>
          <Link to="/login" className="text-[#C6A15B] hover:underline font-semibold font-cinzel">
            {t('auth.login')}
          </Link>
        </div>
      </div>
    </div>
  );
}
