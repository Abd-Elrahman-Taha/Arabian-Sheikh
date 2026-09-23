import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, XCircle, Mail, Loader2, RefreshCw, ArrowLeft, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import ScrollReveal from '../../components/common/ScrollReveal';

export default function VerifyEmail() {
  const { queryParams, navigate } = useRouter();
  const { t, language } = useTranslation();
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
          success(
            language === 'ar'
              ? 'تم تأكيد بريدك الإلكتروني بنجاح. يمكنك الآن الدخول إلى الدار.'
              : 'Your email has been verified. Welcome to Arabian Sheikh.'
          );
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          const msg = err?.message || (language === 'ar' ? 'فشل التحقق. قد يكون الرابط منتهي الصلاحية.' : 'Verification failed. The link may have expired.');
          setErrorMsg(msg);
          error(msg);
        }
      }
    }

    verify();
    return () => { cancelled = true; };
  }, [token, language, success, error]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    setResendLoading(true);
    try {
      await authService.resendVerification(resendEmail.trim().toLowerCase());
      setResendSent(true);
      success(
        language === 'ar'
          ? 'تم إرسال رابط تأكيد جديد إلى بريدك الإلكتروني.'
          : 'A fresh verification seal has been dispatched to your inbox.'
      );
    } catch (err) {
      error(
        err?.message ||
        (language === 'ar' ? 'تعذر إرسال بريد التأكيد. يرجى التحقق من العنوان.' : 'Could not resend verification email.')
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="pt-36 sm:pt-40 pb-16 min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 animate-fade-in text-[#F3E6D0]">
      <ScrollReveal direction="up">
        <div className="max-w-md w-full bg-[#0B0A08]/90 backdrop-blur-md border border-[#D4AF37]/35 p-8 sm:p-10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] space-y-6 relative overflow-hidden">
          {/* Top Royal Gold Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent pointer-events-none" />

          {/* STATE 1: Verifying */}
          {status === 'verifying' && (
            <div className="text-center space-y-4 py-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37]/60 bg-gradient-to-br from-[#D4AF37]/25 via-black to-[#8C6239]/20 flex items-center justify-center mx-auto text-[#F2D675] shadow-[0_0_25px_rgba(212,175,55,0.35)]">
                <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
              </div>
              <div className="space-y-1">
                <span className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                  <span>{language === 'ar' ? 'مصادقة الهوية الملكية' : 'Authenticating Royal Patron'}</span>
                </span>
                <h1 className="font-cinzel text-2xl font-bold uppercase tracking-wider text-[#F3E6D0]">
                  {language === 'ar' ? 'جارٍ التحقق من الحساب' : 'Verifying Your Credentials'}
                </h1>
                <p className="text-xs text-[#D8BE99] font-medium leading-relaxed">
                  {language === 'ar' ? 'يرجى الانتظار بينما نقوم بتوثيق بريدك الإلكتروني في السجلات...' : 'Please hold while we authenticate your royal credentials in the vault...'}
                </p>
              </div>
            </div>
          )}

          {/* STATE 2: Success */}
          {status === 'success' && (
            <div className="text-center space-y-5 animate-fade-in py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-950/60 border-2 border-emerald-500/60 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <span className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'تم التوثيق والاعتماد' : 'Royal Patron Verified'}</span>
                </span>
                <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0]">
                  {language === 'ar' ? 'تم تأكيد الحساب بنجاح' : 'Email Confirmed'}
                </h1>
                <p className="text-xs text-[#D8BE99] font-medium leading-relaxed max-w-xs mx-auto">
                  {language === 'ar'
                    ? 'أهلاً بك رسمياً في دار الشيخ العربي. حسابك مفعل الآن وجاهز للاستخدام.'
                    : 'Your account has been sanctified. You now hold full privileges to explore the royal fragrance reserves.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full luxury-btn-gold py-4 text-xs font-bold uppercase tracking-[0.22em] flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-xl"
              >
                <span>{language === 'ar' ? 'تسجيل الدخول إلى الدار' : 'Enter the Palace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STATE 3: Error */}
          {status === 'error' && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-rose-950/60 border-2 border-rose-500/60 flex items-center justify-center mx-auto text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                  <XCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h1 className="font-cinzel text-xl sm:text-2xl font-bold uppercase tracking-wider text-[#F3E6D0]">
                    {language === 'ar' ? 'تعذر تأكيد الرابط' : 'Verification Expired'}
                  </h1>
                  <p className="text-xs text-rose-300/90 leading-relaxed font-sans">
                    {errorMsg || (language === 'ar' ? 'قد يكون هذا الرابط منتهي الصلاحية أو تم استخدامه سابقاً.' : 'This verification link may have expired or was already used.')}
                  </p>
                </div>
              </div>

              {!resendSent ? (
                <form onSubmit={handleResend} className="space-y-3.5 font-sans text-xs border-t border-[#D4AF37]/20 pt-4">
                  <p className="text-xs text-[#D8BE99] font-medium text-center">
                    {language === 'ar' ? 'أدخل بريدك الإلكتروني لتلقي رابط تأكيد جديد:' : 'Request a fresh verification seal:'}
                  </p>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="your.email@palace.com"
                      className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-3 pl-10 pr-4 text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 focus:outline-none transition-all duration-300"
                    />
                    <Mail className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    disabled={resendLoading}
                    className="w-full luxury-btn-gold py-3.5 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60"
                  >
                    {resendLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                        <span>{language === 'ar' ? 'جارٍ الإرسال...' : 'Dispatching...'}</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'إعادة إرسال رابط التأكيد' : 'Resend Verification Seal'}</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                  <p className="text-xs text-emerald-300 font-medium">
                    {language === 'ar'
                      ? `تم إرسال رابط تأكيد جديد إلى ${resendEmail}. يرجى مراجعة بريدك.`
                      : `A new verification email has been dispatched to ${resendEmail}. Please check your inbox.`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STATE 4: Needs Resend (Visited without token) */}
          {status === 'needs_resend' && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37]/60 bg-gradient-to-br from-[#D4AF37]/25 via-black to-[#8C6239]/20 flex items-center justify-center mx-auto text-[#F2D675] shadow-[0_0_25px_rgba(212,175,55,0.35)]">
                  <Mail className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <span className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                    <span>{language === 'ar' ? 'توثيق البريد الإلكتروني' : 'Patron Verification'}</span>
                  </span>
                  <h1 className="font-cinzel text-2xl font-bold uppercase tracking-wider text-[#F3E6D0]">
                    {language === 'ar' ? 'تأكيد الحساب' : 'Verify Your Email'}
                  </h1>
                  <p className="text-xs text-[#D8BE99] font-medium leading-relaxed max-w-xs mx-auto">
                    {language === 'ar'
                      ? 'أدخل بريدك الإلكتروني لتلقي رابط تفعيل حسابك الملكي.'
                      : 'Enter your registered email address to receive an official activation link.'}
                  </p>
                </div>
              </div>

              {!resendSent ? (
                <form onSubmit={handleResend} className="space-y-4 font-sans text-xs">
                  <div>
                    <label className="block uppercase tracking-wider text-[#D8BE99] font-semibold mb-1.5 text-[11px]">
                      {t('auth.email') || (language === 'ar' ? 'البريد الإلكتروني' : 'Email Address')}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        placeholder="your.email@palace.com"
                        className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-3 pl-10 pr-4 text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 focus:outline-none transition-all duration-300"
                      />
                      <Mail className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resendLoading}
                    className="w-full luxury-btn-gold py-4 text-xs font-bold uppercase tracking-[0.22em] flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-xl disabled:opacity-60"
                  >
                    {resendLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                        <span>{language === 'ar' ? 'جارٍ الإرسال...' : 'Dispatching...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{language === 'ar' ? 'إرسال رابط التأكيد' : 'Send Verification Seal'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                  <p className="text-xs text-emerald-300 font-medium">
                    {language === 'ar'
                      ? `تم إرسال رابط تأكيد إلى ${resendEmail}. يرجى مراجعة بريدك الإلكتروني.`
                      : `A verification link has been dispatched to ${resendEmail}. Please check your inbox.`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer Back Link */}
          <div className="text-center text-xs text-[#D8BE99] pt-4 border-t border-[#D4AF37]/20 font-medium">
            <Link
              to="/login"
              className="text-[#F2D675] hover:text-[#FFE8A3] inline-flex items-center gap-1.5 font-cinzel font-bold tracking-wider uppercase transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Palace Sign In'}</span>
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
