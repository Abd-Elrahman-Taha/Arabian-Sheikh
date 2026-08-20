import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { adminService } from '../../services/adminService';

export default function AdminAnalytics() {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await adminService.getDashboardMetrics();
      setMetrics(data);
    }
    load();
  }, []);

  if (!metrics) {
    return <div className="p-8 text-center text-xs text-[var(--text-muted)]">Calculating olfactory analytics...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in text-[var(--color-earth-dark)]">
      <div className="border-b border-[var(--color-terracotta-deep)]/20 pb-4">
        <h1 className="font-cinzel text-2xl font-bold uppercase tracking-wider text-[var(--color-earth-dark)]">
          {t('admin.analytics')}
        </h1>
        <p className="text-xs text-[var(--color-terracotta-deep)] font-medium">
          Sales velocity, olfactory family preferences, and VIP customer retention.
        </p>
      </div>

      {/* Top Conversion Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 space-y-2 shadow-sm">
          <span className="text-[11px] uppercase tracking-wider font-cinzel text-[var(--color-terracotta)] font-bold">Average Order Value</span>
          <p className="font-cinzel text-3xl font-bold text-[var(--color-earth-dark)]">$462.50</p>
          <p className="text-[10px] text-emerald-600 font-mono font-bold">+12% vs prior quarter</p>
        </div>

        <div className="p-6 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 space-y-2 shadow-sm">
          <span className="text-[11px] uppercase tracking-wider font-cinzel text-[var(--color-terracotta)] font-bold">Repeat Patron Rate</span>
          <p className="font-cinzel text-3xl font-bold text-[var(--color-earth-dark)]">43.8%</p>
          <p className="text-[10px] text-[var(--color-terracotta)] font-mono font-bold">High connoisseur loyalty</p>
        </div>

        <div className="p-6 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 space-y-2 shadow-sm">
          <span className="text-[11px] uppercase tracking-wider font-cinzel text-[var(--color-terracotta)] font-bold">Discovery Sample Conversion</span>
          <p className="font-cinzel text-3xl font-bold text-[var(--color-earth-dark)]">31.2%</p>
          <p className="text-[10px] text-emerald-600 font-mono font-bold">Convert to full 100ml flacons</p>
        </div>
      </div>

      {/* Most Coveted Notes Matrix */}
      <div className="p-6 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 space-y-4 shadow-xl">
        <h3 className="font-cinzel text-sm font-bold uppercase text-[var(--color-terracotta)] border-b border-[var(--color-terracotta-deep)]/20 pb-2">
          Top Searched & Preferred Olfactory Notes
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
          <div className="p-4 bg-[var(--color-desert-light)]/60 border border-[var(--color-terracotta-deep)]/20 space-y-1">
            <span className="font-cinzel text-[var(--color-earth-dark)] font-bold block">Wild Assamese Oud</span>
            <span className="text-[11px] text-[var(--color-terracotta)] font-mono font-bold">42% of inquiries</span>
          </div>
          <div className="p-4 bg-[var(--color-desert-light)]/60 border border-[var(--color-terracotta-deep)]/20 space-y-1">
            <span className="font-cinzel text-[var(--color-earth-dark)] font-bold block">Mountain Taif Rose</span>
            <span className="text-[11px] text-[var(--color-terracotta)] font-mono font-bold">28% of inquiries</span>
          </div>
          <div className="p-4 bg-[var(--color-desert-light)]/60 border border-[var(--color-terracotta-deep)]/20 space-y-1">
            <span className="font-cinzel text-[var(--color-earth-dark)] font-bold block">Fossilized Amber</span>
            <span className="text-[11px] text-[var(--color-terracotta)] font-mono font-bold">22% of inquiries</span>
          </div>
          <div className="p-4 bg-[var(--color-desert-light)]/60 border border-[var(--color-terracotta-deep)]/20 space-y-1">
            <span className="font-cinzel text-[var(--color-earth-dark)] font-bold block">Sacred Bakhoor Smoke</span>
            <span className="text-[11px] text-[var(--color-terracotta)] font-mono font-bold">19% of inquiries</span>
          </div>
        </div>
      </div>
    </div>
  );
}
