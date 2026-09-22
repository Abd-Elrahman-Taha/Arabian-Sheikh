import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, XCircle, Mail, Loader2, RefreshCw } from 'lucide-react';
import ScrollReveal from '../../components/common/ScrollReveal';

export default function VerifyEmail() {
  const { queryParams, navigate } = useRouter();
  const { success, error } = useToast();

  const token = queryParams?.get('token') || '';

  const [status, setStatus] = useState(token ? 'verifying' : 'needs_resend'); // verifying | success | error | needs_resend
  const [errorMsg, setErrorMsg] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  // Auto-verify on mount if token is present
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    async function verify() {
      try {
        await authService.verifyEmail(token);
        if (!cancelled) {
          setStatus('success');
          success('Your email has been verified. You can now sign in.');
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          setErrorMsg(err?.message || 'Verification failed. The link may have expired.');
          error(err?.message || 'Email verification failed.');
        }
      }
    }

    verify();
    return () => { cancelled = true; };
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    setResendLoading(true);
    try {
      await authService.resendVerification(resendEmail.trim().toLowerCase());
      setResendSent(true);
      success('Verification email resent. Please check your inbox.');
    } catch (err) {
      error(err?.message || 'Could not resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="pt-36 sm:pt-40 pb-6 min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 animate-fade-in text-[var(--color-earth-dark)]">
      <ScrollReveal direction="up">
        <div className="max-w-md w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-8 sm:p-10 shadow-2xl space-y-6">

          {/* Verifying */}
          {status === 'verifying' && (
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 text-[var(--color-terracotta)] animate-spin mx-auto" />
              <h1 className="font-cinzel text-xl font-bold uppercase tracking-wider text-[var(--color-earth-dark)]">
                Verifying Your Email
              </h1>
              <p className="text-xs text-[var(--color-terracotta-deep)]">
                Please wait while we confirm your email address...
              </p>
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <div className="text-center space-y-5">
              <div className="w-14 h-14 rounded-full bg-emerald-900/40 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h1 className="font-cinzel text-xl font-bold uppercase tracking-wider text-[var(--color-earth-dark)]">
                  Email Verified
                </h1>
                <p className="text-xs text-[var(--color-terracotta-deep)]">
                  Your email has been successfully verified. You can now sign in to your account.
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full luxury-btn-gold py-3.5 text-xs font-semibold uppercase tracking-widest cursor-pointer shadow-md"
              >
                Sign In Now
              </button>
            </div>
          )}

          {/* Error — show resend option */}
          {status === 'error' && (
            <div className="space-y-5">
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-rose-900/40 border border-rose-500/40 flex items-center justify-center mx-auto">
                  <XCircle className="w-7 h-7 text-rose-400" />
                </div>
                <h1 className="font-cinzel text-xl font-bold uppercase tracking-wider text-[var(--color-earth-dark)]">
                  Verification Failed
                </h1>
                <p className="text-xs text-[var(--color-terracotta-deep)]">
                  {errorMsg}
                </p>
              </div>

              {!resendSent ? (
                <form onSubmit={handleResend} className="space-y-3 font-sans text-xs border-t border-[var(--color-terracotta-deep)]/20 pt-4">
                  <p className="text-xs text-[var(--color-terracotta-deep)] font-medium text-center">
                    Request a new verification email:
                  </p>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full bg-[var(--color-desert-primary)]/40 border border-[var(--color-terracotta-deep)]/25 py-2.5 pl-9 pr-3 text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none"
                    />
                    <Mail className="w-4 h-4 text-[var(--color-terracotta)] absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    disabled={resendLoading}
                    className="w-full luxury-btn-gold py-3 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    {resendLoading
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
                      : <><RefreshCw className="w-3.5 h-3.5" /> Resend Verification Email</>
                    }
                  </button>
                </form>
              ) : (
                <div className="text-center text-xs text-emerald-600 font-medium border-t border-[var(--color-terracotta-deep)]/20 pt-4">
                  ✓ New verification email sent. Please check your inbox.
                </div>
              )}
            </div>
          )}

          {/* No token — resend form */}
          {status === 'needs_resend' && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 border border-[var(--color-terracotta)]/40 bg-[var(--color-desert-primary)]/30 flex items-center justify-center mx-auto text-[var(--color-terracotta)]">
                  <Mail className="w-6 h-6" />
                </div>
                <h1 className="font-cinzel text-2xl font-bold uppercase tracking-wider text-[var(--color-earth-dark)]">
                  Verify Your Email
                </h1>
                <p className="text-xs text-[var(--color-terracotta-deep)]">
                  Enter your email address to receive a new verification link.
                </p>
              </div>

              {!resendSent ? (
                <form onSubmit={handleResend} className="space-y-4 font-sans text-xs">
                  <div>
                    <label className="block uppercase tracking-wider text-[var(--color-terracotta-deep)] font-semibold mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        placeholder="your.email@palace.com"
                        className="w-full bg-[var(--color-desert-primary)]/40 border border-[var(--color-terracotta-deep)]/25 py-2.5 pl-9 pr-3 text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none"
                      />
                      <Mail className="w-4 h-4 text-[var(--color-terracotta)] absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={resendLoading}
                    className="w-full luxury-btn-gold py-3.5 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    {resendLoading
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
                      : <><Mail className="w-3.5 h-3.5" /> Send Verification Email</>
                    }
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-900/40 border border-emerald-500/40 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  </div>
                  <p className="text-xs text-[var(--color-terracotta-deep)] font-medium">
                    Verification email sent to <strong>{resendEmail}</strong>. Please check your inbox.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="text-center text-xs text-[var(--color-terracotta-deep)] pt-2 border-t border-[var(--color-terracotta-deep)]/20">
            <Link to="/login" className="text-[var(--color-terracotta)] hover:underline inline-flex items-center gap-1 font-cinzel font-bold">
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
