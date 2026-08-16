import React, { useState } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';

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
    <div className="pt-28 pb-24 min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 animate-fade-in text-[#F3EEE5]">
      <div className="max-w-md w-full bg-[#1C120E] border border-[#C6A15B]/30 p-8 sm:p-10 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-none border border-[#C6A15B]/40 bg-[#0F0D0C] flex items-center justify-center mx-auto text-[#C6A15B] mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-cinzel text-2xl font-bold uppercase tracking-wider">
            {t('auth.resetTitle')}
          </h1>
          <p className="text-xs text-[#C5B8A8]">
            {t('auth.resetSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block uppercase tracking-wider text-[#C5B8A8] mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0F0D0C] border border-[#C6A15B]/30 py-2.5 px-3 text-[#F3EEE5] focus:border-[#C6A15B] focus:outline-none"
            />
          </div>

          <div>
            <label className="block uppercase tracking-wider text-[#C5B8A8] mb-1">
              {t('auth.confirmPassword')}
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0F0D0C] border border-[#C6A15B]/30 py-2.5 px-3 text-[#F3EEE5] focus:border-[#C6A15B] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full luxury-btn-gold py-3.5 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 mt-4"
          >
            <span>{loading ? 'Saving...' : t('auth.saveNewPassword')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
