import React, { useState } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { Lock, ArrowRight } from 'lucide-react';
import ScrollReveal from '../../components/common/ScrollReveal';

export default function ResetPassword() {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const { success, error } = useToast();

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
      error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword('mock-token', password);
      success('Your password has been successfully renewed.');
      navigate('/login');
    } catch (err) {
      error(err.message || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-36 sm:pt-40 pb-24 min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 animate-fade-in text-[var(--color-earth-dark)]">
      <ScrollReveal direction="up">
        <div className="max-w-md w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-8 sm:p-10 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-none border border-[var(--color-terracotta)]/40 bg-[var(--color-desert-primary)]/30 flex items-center justify-center mx-auto text-[var(--color-terracotta)] mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-cinzel text-2xl font-bold uppercase tracking-wider text-[var(--color-earth-dark)]">
            {t('auth.resetTitle')}
          </h1>
          <p className="text-xs text-[var(--color-terracotta-deep)] font-medium">
            {t('auth.resetSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block uppercase tracking-wider text-[var(--color-terracotta-deep)] font-semibold mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[var(--color-desert-primary)]/40 border border-[var(--color-terracotta-deep)]/25 py-2.5 px-3 text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block uppercase tracking-wider text-[var(--color-terracotta-deep)] font-semibold mb-1">
              {t('auth.confirmPassword')}
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[var(--color-desert-primary)]/40 border border-[var(--color-terracotta-deep)]/25 py-2.5 px-3 text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full luxury-btn-gold py-3.5 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-md"
          >
            <span>{loading ? 'Saving...' : t('auth.saveNewPassword')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
      </ScrollReveal>
    </div>
  );
}
