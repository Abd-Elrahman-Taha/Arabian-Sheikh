import React, { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { Save, ShieldCheck, Truck, Lock, Globe } from 'lucide-react';

export default function AdminSettings() {
  const { t } = useTranslation();
  const { success } = useToast();

  const [settings, setSettings] = useState(() => {
    const saved = adminService.getSettings();
    return {
      ...saved,
      currency: 'EUR',
      freeShippingThreshold: 100,
      expressShippingFee: 15,
      stripeTestMode: true,
      stripePublishableKey: 'pk_test_sample_arabiansheikh_key',
      stripeSecretKey: 'sk_test_sample_arabiansheikh_secret',
      dhlTestMode: true,
      dhlAccountNumber: 'DHL-EXP-889021',
      dhlApiKey: 'dhl_test_api_key_andalusia'
    };
  });

  const handleSave = (e) => {
    e.preventDefault();
    adminService.saveSettings(settings);
    success('Admin parameters & API credentials saved.');
  };

  return (
    <div className="space-y-6 text-[#F8F5F0] max-w-4xl">
      <div className="border-b border-[#D4AF37]/20 pb-4">
        <h1 className="font-cinzel text-xl font-bold uppercase tracking-wider text-[#F8F5F0]">
          House Configuration & API Integrations
        </h1>
        <p className="text-xs text-[#8C6D37]">
          Manage Stripe payments, DHL shipping logistics, and multi-language controls.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-[#121010] border border-[#D4AF37]/20 p-8 space-y-8 shadow-2xl text-xs">
        
        {/* Stripe Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <Lock className="w-4 h-4" />
              <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider">
                Stripe Payments Configuration
              </h3>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.stripeTestMode}
                onChange={(e) => setSettings({ ...settings, stripeTestMode: e.target.checked })}
                className="accent-[#D4AF37]"
              />
              <span className="text-xs font-mono text-[#D4AF37]">Test / Sandbox Mode</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[#8C6D37] uppercase">Publishable Key</label>
              <input
                type="text"
                value={settings.stripePublishableKey}
                onChange={(e) => setSettings({ ...settings, stripePublishableKey: e.target.value })}
                className="w-full bg-black/60 border border-white/10 p-2.5 rounded font-mono text-xs text-[#F8F5F0]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[#8C6D37] uppercase">Secret Key (Server Token)</label>
              <input
                type="password"
                value={settings.stripeSecretKey}
                onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                className="w-full bg-black/60 border border-white/10 p-2.5 rounded font-mono text-xs text-[#F8F5F0]"
              />
            </div>
          </div>
        </div>

        {/* DHL Section */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <Truck className="w-4 h-4" />
              <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider">
                DHL Express Logistics
              </h3>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.dhlTestMode}
                onChange={(e) => setSettings({ ...settings, dhlTestMode: e.target.checked })}
                className="accent-[#D4AF37]"
              />
              <span className="text-xs font-mono text-[#D4AF37]">Test Sandbox Active</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[#8C6D37] uppercase">DHL Account Number</label>
              <input
                type="text"
                value={settings.dhlAccountNumber}
                onChange={(e) => setSettings({ ...settings, dhlAccountNumber: e.target.value })}
                className="w-full bg-black/60 border border-white/10 p-2.5 rounded font-mono text-xs text-[#F8F5F0]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[#8C6D37] uppercase">Free Shipping Threshold (€)</label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                className="w-full bg-black/60 border border-white/10 p-2.5 rounded font-mono text-xs text-[#F8F5F0]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[#8C6D37] uppercase">Standard DHL Rate (€)</label>
              <input
                type="number"
                value={settings.expressShippingFee}
                onChange={(e) => setSettings({ ...settings, expressShippingFee: Number(e.target.value) })}
                className="w-full bg-black/60 border border-white/10 p-2.5 rounded font-mono text-xs text-[#F8F5F0]"
              />
            </div>
          </div>
        </div>

        {/* Multi-Language & Currency */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-[#D4AF37] pb-2 border-b border-white/10">
            <Globe className="w-4 h-4" />
            <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider">
              Localization & Currency Engine
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[#8C6D37] uppercase block mb-1">Primary Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full bg-black/60 border border-white/10 p-2.5 rounded text-xs text-[#F8F5F0]"
              >
                <option value="EUR">EUR (€) — Official Default</option>
                <option value="USD">USD ($)</option>
                <option value="AED">AED (د.إ)</option>
              </select>
            </div>
            <div>
              <label className="text-[#8C6D37] uppercase block mb-1">Supported Languages</label>
              <div className="p-2.5 bg-black/60 border border-white/10 rounded text-xs text-[#A69E94]">
                English (EN), Spanish (ES), Bulgarian (BG)
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 bg-[#D4AF37] hover:bg-[#E5C07B] text-black font-cinzel font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Parameters</span>
          </button>
        </div>

      </form>
    </div>
  );
}
