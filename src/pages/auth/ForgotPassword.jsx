import React, { useState } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { KeyRound, Mail, ArrowRight, ArrowLeft, Loader2, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import ScrollReveal from '../../components/common/ScrollReveal';

export default function ForgotPassword() {
  const { t, language } = useTranslation();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      setDispatched(true);
      success(
        language === 'ar'
          ? 'تم إرسال تعليمات استعادة كلمة المرور إلى بريدك الإلكتروني.'
          : 'Recovery parchment instructions sent to your email.'
      );
    } catch (err) {
      error(err.message || (language === 'ar' ? 'فشل إرسال بريد الاستعادة.' : 'Recovery email failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-36 sm:pt-40 pb-16 min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 animate-fade-in text-[#F3E6D0]">
      <ScrollReveal direction="up">
        <div className="max-w-md w-full bg-[#0B0A08]/90 backdrop-blur-md border border-[#D4AF37]/35 p-8 sm:p-10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] space-y-6 relative overflow-hidden">
          {/* Top Royal Gold Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent pointer-events-none" />

          {/* Header Medallion */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37]/60 bg-gradient-to-br from-[#D4AF37]/25 via-black to-[#8C6239]/20 flex items-center justify-center mx-auto text-[#F2D675] shadow-[0_0_25px_rgba(212,175,55,0.35)]">
              <KeyRound className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span>{language === 'ar' ? 'أمان الحساب الملكي' : 'Royal Patron Security'}</span>
              </span>
              <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0]">
                {t('auth.forgotTitle') || (language === 'ar' ? 'استعادة كلمة المرور' : 'Reset Password')}
              </h1>
              <p className="text-xs text-[#D8BE99] font-medium leading-relaxed max-w-xs mx-auto">
                {t('auth.forgotSubtitle') || (language === 'ar' ? 'أدخل بريدك الإلكتروني لإرسال رابط إعادة تعيين كلمة المرور.' : 'Enter your registered email to receive access recovery instructions.')}
              </p>
            </div>
          </div>

          {dispatched ? (
            <div className="space-y-6 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="font-cinzel text-base font-bold text-[#F3E6D0] uppercase tracking-wider">
                  {language === 'ar' ? 'تم إرسال رابط الاستعادة' : 'Recovery Parchment Dispatched'}
                </h2>
                <p className="text-xs text-[#D8BE99] leading-relaxed">
                  {language === 'ar' ? 'أرسلنا تعليمات الاستعادة إلى:' : 'We have dispatched password reset instructions to:'}
                </p>
                <div className="bg-black/60 border border-[#D4AF37]/30 rounded-xl py-2 px-3 font-mono text-xs text-[#F2D675] shadow-inner select-all">
                  {email}
                </div>
                <p className="text-[11px] text-[#D8BE99]/70 leading-relaxed pt-2">
                  {language === 'ar'
                    ? 'يرجى مراجعة صندوق الوارد (أو الرسائل غير المرغوب فيها / Spam). انقر على الرابط لتعيين كلمة مرور جديدة.'
                    : 'Please check your inbox (and spam folder). Click the enclosed royal seal to renew your credentials.'}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDispatched(false)}
                  className="w-full luxury-btn-outline py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:border-[#D4AF37]"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{language === 'ar' ? 'إعادة الإرسال أو تجربة بريد آخر' : 'Resend or Try Another Email'}</span>
                </button>

                <Link
                  to="/login"
                  className="w-full luxury-btn-gold py-3.5 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 cursor-pointer shadow-lg inline-flex"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{language === 'ar' ? 'العودة لتسجيل الدخول' : 'Return to Palace Sign In'}</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block uppercase tracking-wider text-[#D8BE99] font-semibold mb-1.5 text-[11px]">
                  {t('auth.email') || (language === 'ar' ? 'البريد الإلكتروني' : 'Email Address')}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@palace.com"
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-3 pl-10 pr-4 text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 focus:outline-none transition-all duration-300"
                  />
                  <Mail className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full luxury-btn-gold py-4 text-xs font-bold uppercase tracking-[0.22em] flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-xl disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                    <span>{language === 'ar' ? 'جارٍ الإرسال...' : 'Dispatching Instructions...'}</span>
                  </>
                ) : (
                  <>
                    <span>{t('auth.sendReset') || (language === 'ar' ? 'إرسال رابط الاستعادة' : 'Send Reset Link')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
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
