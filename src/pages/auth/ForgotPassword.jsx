import React, { useState } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { KeyRound, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import ScrollReveal from '../../components/common/ScrollReveal';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setDispatched(true);
      success('Recovery parchment instructions sent to your email.');
    } catch (err) {
      error(err.message || 'Recovery email failed.');
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
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="font-cinzel text-2xl font-bold uppercase tracking-wider text-[var(--color-earth-dark)]">
            {t('auth.forgotTitle')}
          </h1>
          <p className="text-xs text-[var(--color-terracotta-deep)] font-medium">
            {t('auth.forgotSubtitle')}
          </p>
        </div>

        {dispatched ? (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta)]/40 text-xs text-[var(--color-terracotta)] space-y-2 font-medium">
              <p>✓ Instructions sent to <strong>{email}</strong></p>
              <p className="text-[11px] text-[var(--color-terracotta-deep)]">
                Please check your inbox or proceed to the simulated reset step below:
              </p>
            </div>
            <Link
              to="/reset-password?token=mock-recovery-token"
              className="w-full luxury-btn-gold py-3 text-xs block font-semibold uppercase tracking-wider text-center cursor-pointer shadow-md"
            >
              Continue to Reset Password
            </Link>
          </div>
        ) : (
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
                  className="w-full bg-[var(--color-desert-primary)]/40 border border-[var(--color-terracotta-deep)]/25 py-2.5 pl-9 pr-3 text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none"
                />
                <Mail className="w-4 h-4 text-[var(--color-terracotta)] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full luxury-btn-gold py-3.5 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-md"
            >
              <span>{loading ? 'Dispatching...' : t('auth.sendReset')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center text-xs text-[var(--color-terracotta-deep)] pt-4 border-t border-[var(--color-terracotta-deep)]/20">
          <Link to="/login" className="text-[var(--color-terracotta)] hover:underline inline-flex items-center gap-1 font-cinzel font-bold">
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Sign In</span>
          </Link>
        </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
