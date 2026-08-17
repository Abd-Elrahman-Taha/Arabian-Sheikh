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
    <div className="space-y-8 animate-fade-in text-[var(--text-primary)]">
      <div className="border-b border-[var(--border-subtle)] pb-4">
        <h1 className="font-cinzel text-2xl font-bold uppercase tracking-wider text-[var(--text-primary)]">
          {t('admin.analytics')}
        </h1>
        <p className="text-xs text-[var(--text-muted)]">
          Sales velocity, olfactory family preferences, and VIP customer retention.
        </p>
      </div>

      {/* Top Conversion Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-card)] space-y-2 shadow-sm">
          <span className="text-[11px] uppercase tracking-wider font-cinzel text-[var(--gold-primary)] font-semibold">Average Order Value</span>
          <p className="font-cinzel text-3xl font-bold text-[var(--text-primary)]">$462.50</p>
          <p className="text-[10px] text-emerald-500 font-mono font-semibold">+12% vs prior quarter</p>
        </div>

        <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-card)] space-y-2 shadow-sm">
          <span className="text-[11px] uppercase tracking-wider font-cinzel text-[var(--gold-primary)] font-semibold">Repeat Patron Rate</span>
          <p className="font-cinzel text-3xl font-bold text-[var(--text-primary)]">43.8%</p>
          <p className="text-[10px] text-[var(--gold-light)] font-mono font-semibold">High connoisseur loyalty</p>
        </div>

        <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-card)] space-y-2 shadow-sm">
          <span className="text-[11px] uppercase tracking-wider font-cinzel text-[var(--gold-primary)] font-semibold">Discovery Sample Conversion</span>
          <p className="font-cinzel text-3xl font-bold text-[var(--text-primary)]">31.2%</p>
          <p className="text-[10px] text-emerald-500 font-mono font-semibold">Convert to full 100ml flacons</p>
        </div>
      </div>

      {/* Most Coveted Notes Matrix */}
      <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4 shadow-xl">
        <h3 className="font-cinzel text-sm font-bold uppercase text-[var(--gold-primary)] border-b border-[var(--border-subtle)] pb-2">
          Top Searched & Preferred Olfactory Notes
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
          <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
            <span className="font-cinzel text-[var(--text-primary)] font-bold block">Wild Assamese Oud</span>
            <span className="text-[11px] text-[var(--gold-primary)] font-mono">42% of inquiries</span>
          </div>
          <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
            <span className="font-cinzel text-[var(--text-primary)] font-bold block">Mountain Taif Rose</span>
            <span className="text-[11px] text-[var(--gold-primary)] font-mono">28% of inquiries</span>
          </div>
          <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
            <span className="font-cinzel text-[var(--text-primary)] font-bold block">Fossilized Amber</span>
            <span className="text-[11px] text-[var(--gold-primary)] font-mono">22% of inquiries</span>
          </div>
          <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
            <span className="font-cinzel text-[var(--text-primary)] font-bold block">Sacred Bakhoor Smoke</span>
            <span className="text-[11px] text-[var(--gold-primary)] font-mono">19% of inquiries</span>
          </div>
        </div>
      </div>
    </div>
  );
}
