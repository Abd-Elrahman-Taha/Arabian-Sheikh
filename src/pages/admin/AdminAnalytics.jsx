import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { adminService } from '../../services/adminService';
import { BarChart3, TrendingUp, DollarSign, Award, Flame, Users, Sparkles } from 'lucide-react';

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
    return <div className="p-8 text-center text-xs text-[#C5B8A8]">Calculating olfactory analytics...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in text-[#F3EEE5]">
      <div className="border-b border-[#C6A15B]/20 pb-4">
        <h1 className="font-cinzel text-2xl font-bold uppercase tracking-wider">
          {t('admin.analytics')}
        </h1>
        <p className="text-xs text-[#C5B8A8]">
          Sales velocity, olfactory family preferences, and VIP customer retention.
        </p>
      </div>

      {/* Top Conversion Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-[#1C120E] border border-[#C6A15B]/20 space-y-2">
          <span className="text-[11px] uppercase tracking-wider font-cinzel text-[#C6A15B]">Average Order Value</span>
          <p className="font-cinzel text-3xl font-bold text-[#F3EEE5]">$462.50</p>
          <p className="text-[10px] text-emerald-400 font-mono">+12% vs prior quarter</p>
        </div>

        <div className="p-6 bg-[#1C120E] border border-[#C6A15B]/20 space-y-2">
          <span className="text-[11px] uppercase tracking-wider font-cinzel text-[#C6A15B]">Repeat Patron Rate</span>
          <p className="font-cinzel text-3xl font-bold text-[#F3EEE5]">43.8%</p>
          <p className="text-[10px] text-[#DFBF7A] font-mono">High connoisseur loyalty</p>
        </div>

        <div className="p-6 bg-[#1C120E] border border-[#C6A15B]/20 space-y-2">
          <span className="text-[11px] uppercase tracking-wider font-cinzel text-[#C6A15B]">Discovery Discovery Sample Conversion</span>
          <p className="font-cinzel text-3xl font-bold text-[#F3EEE5]">31.2%</p>
          <p className="text-[10px] text-emerald-400 font-mono">Convert to full 100ml flacons</p>
        </div>
      </div>

      {/* Most Coveted Notes Matrix */}
      <div className="p-6 bg-[#1C120E] border border-[#C6A15B]/20 space-y-4 shadow-xl">
        <h3 className="font-cinzel text-sm font-bold uppercase text-[#C6A15B] border-b border-[#C6A15B]/15 pb-2">
          Top Searched & Preferred Olfactory Notes
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
          <div className="p-4 bg-[#241712] border border-[#C6A15B]/15 space-y-1">
            <span className="font-cinzel text-[#F3EEE5] font-bold block">Wild Assamese Oud</span>
            <span className="text-[11px] text-[#C6A15B] font-mono">42% of inquiries</span>
          </div>
          <div className="p-4 bg-[#241712] border border-[#C6A15B]/15 space-y-1">
            <span className="font-cinzel text-[#F3EEE5] font-bold block">Mountain Taif Rose</span>
            <span className="text-[11px] text-[#C6A15B] font-mono">28% of inquiries</span>
          </div>
          <div className="p-4 bg-[#241712] border border-[#C6A15B]/15 space-y-1">
            <span className="font-cinzel text-[#F3EEE5] font-bold block">Fossilized Amber</span>
            <span className="text-[11px] text-[#C6A15B] font-mono">22% of inquiries</span>
          </div>
          <div className="p-4 bg-[#241712] border border-[#C6A15B]/15 space-y-1">
            <span className="font-cinzel text-[#F3EEE5] font-bold block">Sacred Bakhoor Smoke</span>
            <span className="text-[11px] text-[#C6A15B] font-mono">19% of inquiries</span>
          </div>
        </div>
      </div>
    </div>
  );
}
