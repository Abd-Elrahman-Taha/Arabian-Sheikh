import React, { useState } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { KeyRound, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const { navigate } = useRouter();
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
    <div className="pt-28 pb-24 min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 animate-fade-in text-[#F3EEE5]">
      <div className="max-w-md w-full bg-[#1C120E] border border-[#C6A15B]/30 p-8 sm:p-10 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-none border border-[#C6A15B]/40 bg-[#0F0D0C] flex items-center justify-center mx-auto text-[#C6A15B] mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="font-cinzel text-2xl font-bold uppercase tracking-wider">
            {t('auth.forgotTitle')}
          </h1>
          <p className="text-xs text-[#C5B8A8]">
            {t('auth.forgotSubtitle')}
          </p>
        </div>

        {dispatched ? (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-[#0F0D0C] border border-[#C6A15B]/40 text-xs text-[#C6A15B] space-y-2">
              <p>✓ Instructions sent to <strong>{email}</strong></p>
              <p className="text-[11px] text-[#C5B8A8]">
                Please check your inbox or proceed to the simulated reset step below:
              </p>
            </div>
            <Link
              to="/reset-password?token=mock-recovery-token"
              className="w-full luxury-btn-gold py-3 text-xs block font-semibold uppercase tracking-wider text-center"
            >
              Continue to Reset Password
            </Link>
          </div>
        ) : (
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

            <button
              type="submit"
              disabled={loading}
              className="w-full luxury-btn-gold py-3.5 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 mt-4"
            >
              <span>{loading ? 'Dispatching...' : t('auth.sendReset')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center text-xs text-[#C5B8A8] pt-4 border-t border-[#C6A15B]/15">
          <Link to="/login" className="text-[#C6A15B] hover:underline inline-flex items-center gap-1 font-cinzel">
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
