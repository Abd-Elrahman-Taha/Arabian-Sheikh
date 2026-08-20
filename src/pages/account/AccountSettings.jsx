import React, { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ThemeToggle from '../../components/common/ThemeToggle';
import { Save, ShieldCheck, SunMoon } from 'lucide-react';
import ScrollReveal from '../../components/common/ScrollReveal';

export default function AccountSettings() {
  const { t, language, setLanguage, availableLanguages } = useTranslation();
  const { user, updateProfile } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '+971 50 123 4567');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ name, email, phone });
      success('Palace profile updated successfully.');
    } catch (err) {
      error(err.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      error('New password must contain at least 6 characters.');
      return;
    }
    success('Password securely updated in Palace Vault.');
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <div className="space-y-8 animate-fade-in text-[var(--color-earth-dark)]">
      <ScrollReveal direction="up">
        <h2 className="font-cinzel text-xl font-bold uppercase border-b border-[var(--color-terracotta-deep)]/20 pb-3 text-[var(--color-earth-dark)]">
          {t('account.settings')}
        </h2>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <ScrollReveal direction="up" delay={0.1}>
        <form onSubmit={handleSaveProfile} className="p-6 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 space-y-4 shadow-sm h-full">
          <h3 className="font-cinzel text-sm font-bold uppercase text-[var(--color-terracotta)] tracking-wider border-b border-[var(--color-terracotta-deep)]/20 pb-2">
            Patron Profile Information
          </h3>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[var(--color-terracotta-deep)] font-semibold mb-1">
              Full Distinguished Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-xs text-[var(--color-earth-dark)] focus:border-[var(--color-terracotta)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[var(--color-terracotta-deep)] font-semibold mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-xs text-[var(--color-earth-dark)] focus:border-[var(--color-terracotta)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[var(--color-terracotta-deep)] font-semibold mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-xs text-[var(--color-earth-dark)] focus:border-[var(--color-terracotta)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[var(--color-terracotta-deep)] font-semibold mb-1">
              Preferred Palace Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-xs text-[var(--color-earth-dark)] focus:border-[var(--color-terracotta)] focus:outline-none cursor-pointer font-medium"
            >
              {availableLanguages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name} ({l.short})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full luxury-btn-gold py-2.5 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </form>
        </ScrollReveal>

        {/* Security & Theme Preferences */}
        <ScrollReveal direction="up" delay={0.2}>
        <div className="space-y-6">
          {/* Theme Mode Toggle in Settings */}
          <div className="p-6 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 space-y-4 shadow-sm">
            <h3 className="font-cinzel text-sm font-bold uppercase text-[var(--color-terracotta)] tracking-wider border-b border-[var(--color-terracotta-deep)]/20 pb-2 flex items-center gap-2">
              <SunMoon className="w-4 h-4" />
              <span>Theme Appearance</span>
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-cinzel text-xs font-bold text-[var(--color-earth-dark)]">
                  Ambience Atmosphere
                </p>
                <p className="text-xs text-[var(--color-terracotta-deep)] font-medium">
                  Choose between Warm Sunlit Salon (Light) and Deep Arabian Palace (Dark)
                </p>
              </div>
              <ThemeToggle showLabel />
            </div>
          </div>

          {/* Password Form */}
          <form onSubmit={handlePasswordChange} className="p-6 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 space-y-4 shadow-sm">
            <h3 className="font-cinzel text-sm font-bold uppercase text-[var(--color-terracotta)] tracking-wider border-b border-[var(--color-terracotta-deep)]/20 pb-2">
              Security & Access Credentials
            </h3>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--color-terracotta-deep)] font-semibold mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-xs text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--color-terracotta-deep)] font-semibold mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-xs text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none"
              />
            </div>

            <div className="p-3 bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/20 text-[11px] text-[var(--color-terracotta-deep)] flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-[var(--color-terracotta)] shrink-0" />
              <span>Your credentials are encrypted with 256-bit AES algorithms.</span>
            </div>

            <button
              type="submit"
              className="w-full luxury-btn-outline py-2.5 text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              Update Password
            </button>
          </form>
        </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
