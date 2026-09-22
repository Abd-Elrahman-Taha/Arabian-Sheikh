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
    <div className="pt-36 sm:pt-40 pb-6 min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 animate-fade-in text-[var(--color-earth-dark)]">
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
          <div className="space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-900/40 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <Mail className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h2 className="font-cinzel text-base font-bold text-[var(--color-earth-dark)] uppercase tracking-wider">
                Recovery Email Sent
              </h2>
              <p className="text-xs text-[var(--color-terracotta-deep)] leading-relaxed">
                We've dispatched password reset instructions to{' '}
                <strong className="text-[var(--color-terracotta)]">{email}</strong>.
              </p>
              <p className="text-[11px] text-[var(--color-terracotta-deep)]/70 leading-relaxed pt-1">
                Please check your inbox (and spam folder). Click the link in the email to set a new password.
              </p>
            </div>
            <button
              onClick={() => { setDispatched(false); }}
              className="text-xs text-[var(--color-terracotta)] hover:underline font-cinzel font-bold"
            >
              ← Try a different email
            </button>
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
