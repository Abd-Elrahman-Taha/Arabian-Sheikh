import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { adminService } from '../../services/adminService';
import { DollarSign, Sparkles, TrendingUp, Award } from 'lucide-react';

export default function AdminAnalytics() {
  const { t } = useTranslation();
  
  // Instant 0ms synchronous initialization
  const initialMetrics = adminService.getDashboardMetricsSync();
  const [metrics, setMetrics] = useState(initialMetrics);

  useEffect(() => {
    const data = adminService.getDashboardMetricsSync();
    if (data) setMetrics(data);
  }, []);

  if (!metrics) {
    return <div className="p-8 text-center text-xs text-[#D8BE99]">Calculating olfactory analytics...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in text-[#F3E6D0]">
      <div className="border-b border-[#D4AF37]/20 pb-4">
        <h1 className="font-cinzel text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F3E6D0]">
          {t('admin.analytics')}
        </h1>
        <p className="text-xs text-[#D8BE99] font-medium mt-0.5">
          Sales velocity, olfactory family preferences, and VIP customer retention.
        </p>
      </div>

      {/* Top Conversion Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-2 shadow-2xl backdrop-blur-md hover:border-[#D4AF37] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-cinzel text-[#F2D675] font-bold">Average Order Value</span>
            <div className="w-8 h-8 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center text-[#F2D675]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="font-cinzel text-3xl font-bold text-[#F3E6D0]">€462.50</p>
          <p className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+12% vs prior quarter</span>
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-2 shadow-2xl backdrop-blur-md hover:border-[#D4AF37] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-cinzel text-[#F2D675] font-bold">Repeat Patron Rate</span>
            <div className="w-8 h-8 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center text-[#F2D675]">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="font-cinzel text-3xl font-bold text-[#F3E6D0]">43.8%</p>
          <p className="text-[10px] text-[#F2D675] font-mono font-bold">High connoisseur loyalty</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-2 shadow-2xl backdrop-blur-md hover:border-[#D4AF37] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-cinzel text-[#F2D675] font-bold">Discovery Sample Conversion</span>
            <div className="w-8 h-8 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center text-[#F2D675]">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="font-cinzel text-3xl font-bold text-[#F3E6D0]">31.2%</p>
          <p className="text-[10px] text-emerald-400 font-mono font-bold">Convert to full 60ml flacons</p>
        </div>
      </div>

      {/* Most Coveted Notes Matrix */}
      <div className="p-6 rounded-2xl bg-[#0B0A08]/90 border border-[#D4AF37]/30 space-y-4 shadow-2xl backdrop-blur-md">
        <h3 className="font-cinzel text-sm font-bold uppercase text-[#F2D675] border-b border-[#D4AF37]/20 pb-3 tracking-wider">
          Top Searched & Preferred Olfactory Notes
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
          <div className="p-5 rounded-xl bg-black/60 border border-[#D4AF37]/25 space-y-1 hover:border-[#D4AF37] transition-all">
            <span className="font-cinzel text-[#F3E6D0] font-bold block text-sm">Wild Assamese Oud</span>
            <span className="text-[11px] text-[#F2D675] font-mono font-bold">42% of inquiries</span>
          </div>
          <div className="p-5 rounded-xl bg-black/60 border border-[#D4AF37]/25 space-y-1 hover:border-[#D4AF37] transition-all">
            <span className="font-cinzel text-[#F3E6D0] font-bold block text-sm">Mountain Taif Rose</span>
            <span className="text-[11px] text-[#F2D675] font-mono font-bold">28% of inquiries</span>
          </div>
          <div className="p-5 rounded-xl bg-black/60 border border-[#D4AF37]/25 space-y-1 hover:border-[#D4AF37] transition-all">
            <span className="font-cinzel text-[#F3E6D0] font-bold block text-sm">Fossilized Amber</span>
            <span className="text-[11px] text-[#F2D675] font-mono font-bold">22% of inquiries</span>
          </div>
          <div className="p-5 rounded-xl bg-black/60 border border-[#D4AF37]/25 space-y-1 hover:border-[#D4AF37] transition-all">
            <span className="font-cinzel text-[#F3E6D0] font-bold block text-sm">Sacred Bakhoor Smoke</span>
            <span className="text-[11px] text-[#F2D675] font-mono font-bold">19% of inquiries</span>
          </div>
        </div>
      </div>
    </div>
  );
}
