import React, { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Save } from 'lucide-react';

export default function AdminSettings() {
  const { t } = useTranslation();
  const { success } = useToast();

  const [settings, setSettings] = useState(() => adminService.getSettings());

  const handleSave = (e) => {
    e.preventDefault();
    adminService.saveSettings(settings);
    success('Palace store settings saved.');
  };

  return (
    <div className="space-y-6 animate-fade-in text-[var(--color-earth-dark)] max-w-4xl">
      <div className="border-b border-[var(--color-terracotta-deep)]/20 pb-4">
        <h1 className="font-cinzel text-2xl font-bold uppercase tracking-wider text-[var(--color-earth-dark)]">
          {t('admin.settings')}
        </h1>
        <p className="text-xs text-[var(--color-terracotta-deep)] font-medium">
          Configure general house parameters, shipping rules, and VIP threshold limits.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 p-6 sm:p-8 space-y-6 shadow-2xl text-xs font-sans">
        <div className="space-y-4">
          <h3 className="font-cinzel text-sm font-bold uppercase text-[var(--color-terracotta)] border-b border-[var(--color-terracotta-deep)]/20 pb-2">
            General Palace Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[var(--color-terracotta-deep)] font-semibold mb-1 uppercase tracking-wider">House Brand Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-[var(--color-earth-dark)] focus:border-[var(--color-terracotta)] focus:outline-none font-cinzel font-bold"
              />
            </div>

            <div>
              <label className="block text-[var(--color-terracotta-deep)] font-semibold mb-1 uppercase tracking-wider">Concierge Helpline Phone</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-[var(--color-earth-dark)] focus:border-[var(--color-terracotta)] focus:outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[var(--color-terracotta-deep)] font-semibold mb-1 uppercase tracking-wider">Concierge Support Email</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-[var(--color-earth-dark)] focus:border-[var(--color-terracotta)] focus:outline-none font-medium"
            />
          </div>
        </div>

        {/* Shipping & Commerce Rules */}
        <div className="space-y-4 pt-4 border-t border-[var(--color-terracotta-deep)]/20">
          <h3 className="font-cinzel text-sm font-bold uppercase text-[var(--color-terracotta)] border-b border-[var(--color-terracotta-deep)]/20 pb-2">
            Logistics & Currency
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[var(--color-terracotta-deep)] font-semibold mb-1 uppercase tracking-wider">Free Shipping Threshold ($)</label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-[var(--color-earth-dark)] focus:border-[var(--color-terracotta)] focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-[var(--color-terracotta-deep)] font-semibold mb-1 uppercase tracking-wider">Standard Express Courier Fee ($)</label>
              <input
                type="number"
                value={settings.expressShippingFee}
                onChange={(e) => setSettings({ ...settings, expressShippingFee: Number(e.target.value) })}
                className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-[var(--color-earth-dark)] focus:border-[var(--color-terracotta)] focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-[var(--color-terracotta-deep)] font-semibold mb-1 uppercase tracking-wider">Base Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-2.5 text-[var(--color-earth-dark)] focus:border-[var(--color-terracotta)] focus:outline-none cursor-pointer font-semibold"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="AED">AED (د.إ)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--color-terracotta-deep)]/20">
          <button
            type="submit"
            className="luxury-btn-gold px-8 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
