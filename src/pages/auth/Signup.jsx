import React, { useState } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserPlus, Mail, Lock, User, ArrowRight, Check, Eye, EyeOff, ShieldCheck, Phone } from 'lucide-react';
import ScrollReveal from '../../components/common/ScrollReveal';

const COUNTRIES = [
  { code: 'EG', dialCode: '+20', label: '🇪🇬 Egypt (EG)' },
  { code: 'SA', dialCode: '+966', label: '🇸🇦 Saudi Arabia (SA)' },
  { code: 'AE', dialCode: '+971', label: '🇦🇪 UAE (AE)' },
  { code: 'KW', dialCode: '+965', label: '🇰🇼 Kuwait (KW)' },
  { code: 'QA', dialCode: '+974', label: '🇶🇦 Qatar (QA)' },
  { code: 'OM', dialCode: '+968', label: '🇴🇲 Oman (OM)' },
  { code: 'BH', dialCode: '+973', label: '🇧🇭 Bahrain (BH)' },
  { code: 'BG', dialCode: '+359', label: '🇧🇬 Bulgaria (BG)' },
  { code: 'ES', dialCode: '+34', label: '🇪🇸 Spain (ES)' },
  { code: 'FR', dialCode: '+33', label: '🇫🇷 France (FR)' },
  { code: 'GB', dialCode: '+44', label: '🇬🇧 UK (GB)' },
  { code: 'DE', dialCode: '+49', label: '🇩🇪 Germany (DE)' },
  { code: 'IT', dialCode: '+39', label: '🇮🇹 Italy (IT)' },
  { code: 'US', dialCode: '+1', label: '🇺🇸 USA (US)' },
  { code: 'TR', dialCode: '+90', label: '🇹🇷 Turkey (TR)' },
  { code: 'JO', dialCode: '+962', label: '🇯🇴 Jordan (JO)' },
  { code: 'LB', dialCode: '+961', label: '🇱🇧 Lebanon (LB)' },
  { code: 'MA', dialCode: '+212', label: '🇲🇦 Morocco (MA)' },
  { code: 'DZ', dialCode: '+213', label: '🇩🇿 Algeria (DZ)' },
  { code: 'TN', dialCode: '+216', label: '🇹🇳 Tunisia (TN)' },
  { code: 'IQ', dialCode: '+964', label: '🇮🇶 Iraq (IQ)' }
];

export default function Signup() {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const { signup } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('EG');
  const [phone, setPhone] = useState('+20');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ASP.NET Identity Live Criteria
  const hasLength = password.length >= 6;
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const allCriteriaMet = hasLength && hasUpper && hasDigit && hasSpecial;

  const handleCountryChange = (newCode) => {
    setCountryCode(newCode);
    const matched = COUNTRIES.find(c => c.code === newCode);
    if (matched) {
      const dial = matched.dialCode;
      // If phone starts with an old dial code or is just a code, update the prefix
      if (!phone || phone.startsWith('+')) {
        const rawDigits = phone.replace(/^\+\d+/, '');
        setPhone(`${dial}${rawDigits}`);
      } else {
        setPhone(`${dial}${phone}`);
      }
    }
  };

  const handlePhoneChange = (val) => {
    let clean = val.trim();
    if (clean && !clean.startsWith('+')) {
      const matched = COUNTRIES.find(c => c.code === countryCode);
      const prefix = matched ? matched.dialCode : '+20';
      clean = `${prefix}${clean}`;
    }
    setPhone(clean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      error('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      error('Password must contain at least 6 characters.');
      return;
    }

    // ASP.NET Identity rules: 1 uppercase, 1 digit, 1 special character
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!hasUpper || !hasDigit || !hasSpecial) {
      error('Password must include at least 1 uppercase letter, 1 number, and 1 symbol (e.g. Sheikh123*).');
      return;
    }

    // Format phone with international code if provided
    let finalPhone = phone.trim();
    if (finalPhone && !finalPhone.startsWith('+')) {
      const matched = COUNTRIES.find(c => c.code === countryCode);
      const prefix = matched ? matched.dialCode : '+20';
      finalPhone = `${prefix}${finalPhone}`;
    }

    setLoading(true);
    try {
      const newUser = await signup({
        name,
        email,
        password,
        phone: finalPhone || null,
        countryCode: countryCode || 'EG'
      });
      success(`Welcome to Arabian Sheikh, ${newUser.name || 'Patron'}.`);
      navigate('/');
    } catch (err) {
      error(err.message || 'Account registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-36 sm:pt-40 pb-6 min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 animate-fade-in text-[#F3E6D0]">
      <ScrollReveal direction="up">
        <div className="max-w-md w-full rounded-3xl bg-[#0B0A08]/90 border border-[#D4AF37]/35 p-8 sm:p-10 shadow-2xl space-y-6 backdrop-blur-md">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl border border-[#D4AF37]/50 bg-gradient-to-br from-[#D4AF37]/20 via-black to-[#8C6239]/20 flex items-center justify-center mx-auto text-[#F2D675] shadow-[0_0_20px_rgba(212,175,55,0.25)] mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0]">
            {t('auth.signupTitle')}
          </h1>
          <p className="text-xs text-[#D8BE99] font-medium">
            {t('auth.signupSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block uppercase tracking-wider text-[#D8BE99] font-semibold mb-1">
              {t('auth.fullName')}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Princess Jasmine"
                className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-3 pl-10 pr-3 text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:outline-none"
              />
              <User className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block uppercase tracking-wider text-[#D8BE99] font-semibold mb-1">
              {t('auth.email')}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@palace.com"
                className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-3 pl-10 pr-3 text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:outline-none"
              />
              <Mail className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Phone Number & Country Code */}
          <div>
            <label className="block uppercase tracking-wider text-[#D8BE99] font-semibold mb-1">
              Phone Number (رقم الهاتف)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={countryCode}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="bg-black/60 border border-[#D4AF37]/30 rounded-xl py-3 px-2 text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none cursor-pointer text-xs font-medium"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>

              <div className="relative sm:col-span-2">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="+201000000000"
                  className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl py-3 pl-10 pr-3 text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:border-[#D4AF37] focus:outline-none font-mono"
                />
                <Phone className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <p className="text-[10px] text-[#D8BE99]/70 mt-1">
              Format: e.g. +201000000000 (Country Code: {countryCode})
            </p>
          </div>

          <div>
            <label className="block uppercase tracking-wider text-[#D8BE99] font-semibold mb-1">
              {t('auth.password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-black/60 border rounded-xl py-3 pl-10 pr-10 text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:outline-none transition-colors ${
                  password
                    ? allCriteriaMet
                      ? 'border-emerald-500/70 focus:border-emerald-400'
                      : 'border-[#D4AF37]/50 focus:border-[#D4AF37]'
                    : 'border-[#D4AF37]/30 focus:border-[#D4AF37]'
                }`}
              />
              <Lock className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#D8BE99]/70 hover:text-[#F2D675] transition-colors p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Live Password Requirements Checklist */}
            <div className="mt-2.5 p-3 rounded-xl bg-black/40 border border-[#D4AF37]/20 space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between text-[11px] font-sans font-semibold text-[#D8BE99] uppercase tracking-wider mb-1">
                <span>Password Requirements</span>
                {allCriteriaMet && (
                  <span className="text-emerald-400 font-bold flex items-center gap-1 normal-case text-[10px]">
                    <ShieldCheck className="w-3.5 h-3.5" /> All Satisfied
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
                  <span>6+ Characters</span>
                </div>

                <div className={`flex items-center gap-1.5 transition-colors ${
                  hasUpper ? 'text-emerald-400 font-bold' : 'text-[#D8BE99]/60'
                }`}>
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border ${
                    hasUpper ? 'border-emerald-400 bg-emerald-400/20' : 'border-[#D4AF37]/30 bg-black/40'
                  }`}>
                    {hasUpper ? <Check className="w-2.5 h-2.5" /> : '•'}
                  </div>
                  <span>1 Uppercase (A-Z)</span>
                </div>

                <div className={`flex items-center gap-1.5 transition-colors ${
                  hasDigit ? 'text-emerald-400 font-bold' : 'text-[#D8BE99]/60'
                }`}>
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border ${
                    hasDigit ? 'border-emerald-400 bg-emerald-400/20' : 'border-[#D4AF37]/30 bg-black/40'
                  }`}>
                    {hasDigit ? <Check className="w-2.5 h-2.5" /> : '•'}
                  </div>
                  <span>1 Number (0-9)</span>
                </div>

                <div className={`flex items-center gap-1.5 transition-colors ${
                  hasSpecial ? 'text-emerald-400 font-bold' : 'text-[#D8BE99]/60'
                }`}>
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border ${
                    hasSpecial ? 'border-emerald-400 bg-emerald-400/20' : 'border-[#D4AF37]/30 bg-black/40'
                  }`}>
                    {hasSpecial ? <Check className="w-2.5 h-2.5" /> : '•'}
                  </div>
                  <span>1 Symbol (*!@#$)</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block uppercase tracking-wider text-[#D8BE99] font-semibold mb-1">
              {t('auth.confirmPassword')}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-black/60 border rounded-xl py-3 pl-10 pr-10 text-[#F3E6D0] placeholder-[#D8BE99]/50 focus:outline-none transition-colors ${
                  confirmPassword && confirmPassword === password
                    ? 'border-emerald-500/70 focus:border-emerald-400'
                    : 'border-[#D4AF37]/30 focus:border-[#D4AF37]'
                }`}
              />
              <Lock className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#D8BE99]/70 hover:text-[#F2D675] transition-colors p-1"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full luxury-btn-gold py-4 text-xs font-bold uppercase tracking-[0.22em] flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-xl"
          >
            <span>{loading ? 'Registering...' : t('auth.signup')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[#D8BE99] pt-4 border-t border-[#D4AF37]/20 font-medium">
          <span>{t('auth.haveAccount')} </span>
          <Link to="/login" className="text-[#F2D675] hover:underline font-bold font-cinzel ml-1">
            {t('auth.login')}
          </Link>
        </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
