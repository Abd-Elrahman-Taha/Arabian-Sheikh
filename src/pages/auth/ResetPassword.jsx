import React, { useState } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { Lock, ArrowRight, ArrowLeft, Eye, EyeOff, Check, ShieldCheck, KeyRound, Loader2, Sparkles } from 'lucide-react';
import ScrollReveal from '../../components/common/ScrollReveal';

export default function ResetPassword() {
  const { navigate, queryParams } = useRouter();
  const { t, language } = useTranslation();
  const { success, error } = useToast();

  const tokenFromUrl = queryParams?.get('token') || '';
  const emailFromUrl = queryParams?.get('email') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Live password security criteria
  const hasLength = password.length >= 6;
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const allCriteriaMet = hasLength && hasUpper && hasDigit && hasSpecial;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanToken = token.trim();
    if (!cleanToken) {
      error(
        language === 'ar'
          ? 'رمز استعادة كلمة المرور مفقود. يرجى إدخال الرمز أو الضغط على الرابط من البريد الإلكتروني.'
          : 'Reset token is required. Please paste your reset token or open the link from your email.'
      );
      return;
    }

    if (!hasLength) {
      error(language === 'ar' ? 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.' : 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      error(language === 'ar' ? 'كلمات المرور غير متطابقة.' : 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(cleanToken, password);
      success(
        language === 'ar'
          ? 'تم تجديد كلمة المرور الملكية بنجاح. يمكنك الآن تسجيل الدخول.'
          : 'Your royal password has been successfully renewed. You may now sign in.'
      );
      navigate('/login');
    } catch (err) {
      error(
        err.message ||
        (language === 'ar' ? 'فشل تجديد كلمة المرور. قد يكون الرابط أو الرمز قد انتهى.' : 'Reset failed. The token may be expired or invalid.')
      );
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
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span>{language === 'ar' ? 'حماية الحساب والخصوصية' : 'Credential Vault Renewal'}</span>
              </span>
              <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0]">
                {t('auth.resetTitle') || (language === 'ar' ? 'تعيين كلمة مرور جديدة' : 'Renew Password')}
              </h1>
              <p className="text-xs text-[#D8BE99] font-medium leading-relaxed max-w-xs mx-auto">
                {t('auth.resetSubtitle') || (language === 'ar' ? 'اختر كلمة مرور قوية لحماية حسابك الملكي ومشترياتك.' : 'Set a secure cipher to protect your private orders and privileges.')}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
            {/* Token Input or Active Token Badge */}
            {tokenFromUrl ? (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{language === 'ar' ? 'تم التعرف على رمز الأمان تلقائياً' : 'Security Token Authenticated'}</span>
                </div>
                {emailFromUrl && (
                  <span className="text-[11px] font-mono text-[#D8BE99]/80 truncate max-w-[140px]">
                    {emailFromUrl}
                  </span>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block uppercase tracking-wider text-[#D8BE99] font-semibold text-[11px]">
                    {language === 'ar' ? 'رمز أو رابط الاستعادة' : 'Reset Token / Code'}
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[10px] text-[#D4AF37] hover:underline font-cinzel font-medium"
                  >
                    {language === 'ar' ? 'طلب رمز جديد؟' : 'Request new token?'}
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder={language === 'ar' ? 'الصق الرمز المستلم في البريد الإلكتروني' : 'Paste token from email instructions'}
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-3 pl-10 pr-4 text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 focus:outline-none transition-all duration-300 font-mono text-xs"
                  />
                  <KeyRound className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block uppercase tracking-wider text-[#D8BE99] font-semibold mb-1.5 text-[11px]">
                {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-3 pl-10 pr-10 text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 focus:outline-none transition-all duration-300"
                />
                <Lock className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#D8BE99]/70 hover:text-[#F2D675] transition-colors p-1 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Live Password Security Requirements Checklist */}
              <div className="mt-2.5 p-3 rounded-xl bg-black/40 border border-[#D4AF37]/20 space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between text-[11px] font-sans font-semibold text-[#D8BE99] uppercase tracking-wider mb-1">
                  <span>{language === 'ar' ? 'معايير قوة كلمة المرور' : 'Security Standards'}</span>
                  {allCriteriaMet && (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 normal-case text-[10px]">
                      <ShieldCheck className="w-3.5 h-3.5" /> {language === 'ar' ? 'مستوفاة بالكامل' : 'All Satisfied'}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className={`flex items-center gap-1.5 transition-colors ${
                    hasLength ? 'text-emerald-400 font-bold' : 'text-[#D8BE99]/60'
                  }`}>
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border ${
                      hasLength ? 'border-emerald-400 bg-emerald-400/20' : 'border-[#D4AF37]/30 bg-black/40'
                    }`}>
                      {hasLength ? <Check className="w-2.5 h-2.5" /> : '•'}
                    </div>
                    <span>{language === 'ar' ? '6+ خانات' : '6+ Characters'}</span>
                  </div>

                  <div className={`flex items-center gap-1.5 transition-colors ${
                    hasUpper ? 'text-emerald-400 font-bold' : 'text-[#D8BE99]/60'
                  }`}>
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border ${
                      hasUpper ? 'border-emerald-400 bg-emerald-400/20' : 'border-[#D4AF37]/30 bg-black/40'
                    }`}>
                      {hasUpper ? <Check className="w-2.5 h-2.5" /> : '•'}
                    </div>
                    <span>{language === 'ar' ? 'حرف كبير (A-Z)' : '1 Uppercase'}</span>
                  </div>

                  <div className={`flex items-center gap-1.5 transition-colors ${
                    hasDigit ? 'text-emerald-400 font-bold' : 'text-[#D8BE99]/60'
                  }`}>
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border ${
                      hasDigit ? 'border-emerald-400 bg-emerald-400/20' : 'border-[#D4AF37]/30 bg-black/40'
                    }`}>
                      {hasDigit ? <Check className="w-2.5 h-2.5" /> : '•'}
                    </div>
                    <span>{language === 'ar' ? 'رقم (0-9)' : '1 Number'}</span>
                  </div>

                  <div className={`flex items-center gap-1.5 transition-colors ${
                    hasSpecial ? 'text-emerald-400 font-bold' : 'text-[#D8BE99]/60'
                  }`}>
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border ${
                      hasSpecial ? 'border-emerald-400 bg-emerald-400/20' : 'border-[#D4AF37]/30 bg-black/40'
                    }`}>
                      {hasSpecial ? <Check className="w-2.5 h-2.5" /> : '•'}
                    </div>
                    <span>{language === 'ar' ? 'رمز خاص (!@#$)' : '1 Symbol'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block uppercase tracking-wider text-[#D8BE99] font-semibold mb-1.5 text-[11px]">
                {t('auth.confirmPassword') || (language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password')}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-black/60 border rounded-xl py-3 pl-10 pr-10 text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:outline-none transition-all duration-300 ${
                    confirmPassword && confirmPassword === password
                      ? 'border-emerald-500/70 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50'
                      : 'border-[#D4AF37]/30 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50'
                  }`}
                />
                <Lock className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#D8BE99]/70 hover:text-[#F2D675] transition-colors p-1 cursor-pointer"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-[10px] text-rose-400 mt-1">
                  {language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match'}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full luxury-btn-gold py-4 text-xs font-bold uppercase tracking-[0.22em] flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-xl disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  <span>{language === 'ar' ? 'جارٍ الحفظ والتحديث...' : 'Saving Credentials...'}</span>
                </>
              ) : (
                <>
                  <span>{t('auth.saveNewPassword') || (language === 'ar' ? 'حفظ وتحديث كلمة المرور' : 'Save New Password')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

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
