import React, { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Settings, Save, ShieldCheck, Truck, DollarSign } from 'lucide-react';

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
    <div className="space-y-6 animate-fade-in text-[#F3EEE5] max-w-4xl">
      <div className="border-b border-[#C6A15B]/20 pb-4">
        <h1 className="font-cinzel text-2xl font-bold uppercase tracking-wider">
          {t('admin.settings')}
        </h1>
        <p className="text-xs text-[#C5B8A8]">
          Configure general house parameters, shipping rules, and VIP threshold limits.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-[#1C120E] border border-[#C6A15B]/30 p-6 sm:p-8 space-y-6 shadow-2xl text-xs font-sans">
        <div className="space-y-4">
          <h3 className="font-cinzel text-sm font-bold uppercase text-[#C6A15B] border-b border-[#C6A15B]/15 pb-2">
            General Palace Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#C5B8A8] mb-1 uppercase tracking-wider">House Brand Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full bg-[#0F0D0C] border border-[#C6A15B]/30 p-2.5 text-[#F3EEE5] focus:outline-none font-cinzel"
              />
            </div>

            <div>
              <label className="block text-[#C5B8A8] mb-1 uppercase tracking-wider">Concierge Helpline Phone</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full bg-[#0F0D0C] border border-[#C6A15B]/30 p-2.5 text-[#F3EEE5] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#C5B8A8] mb-1 uppercase tracking-wider">Concierge Support Email</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full bg-[#0F0D0C] border border-[#C6A15B]/30 p-2.5 text-[#F3EEE5] focus:outline-none"
            />
          </div>
        </div>

        {/* Shipping & Commerce Rules */}
        <div className="space-y-4 pt-4 border-t border-[#C6A15B]/15">
          <h3 className="font-cinzel text-sm font-bold uppercase text-[#C6A15B] border-b border-[#C6A15B]/15 pb-2">
            Logistics & Currency
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#C5B8A8] mb-1 uppercase tracking-wider">Free Shipping Threshold ($)</label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                className="w-full bg-[#0F0D0C] border border-[#C6A15B]/30 p-2.5 text-[#F3EEE5] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#C5B8A8] mb-1 uppercase tracking-wider">Standard Express Courier Fee ($)</label>
              <input
                type="number"
                value={settings.expressShippingFee}
                onChange={(e) => setSettings({ ...settings, expressShippingFee: Number(e.target.value) })}
                className="w-full bg-[#0F0D0C] border border-[#C6A15B]/30 p-2.5 text-[#F3EEE5] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#C5B8A8] mb-1 uppercase tracking-wider">Base Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full bg-[#0F0D0C] border border-[#C6A15B]/30 p-2.5 text-[#F3EEE5] focus:outline-none cursor-pointer"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="AED">AED (د.إ)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#C6A15B]/20">
          <button
            type="submit"
            className="luxury-btn-gold px-8 py-3 text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
