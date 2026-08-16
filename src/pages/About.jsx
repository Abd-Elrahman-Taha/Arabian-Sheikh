import React from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { Sparkles, ShieldCheck, Heart, Award, ArrowRight } from 'lucide-react';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="pt-28 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 animate-fade-in text-[#F3EEE5]">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-[#C6A15B] font-semibold">
          High Perfumery Heritage
        </span>
        <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-[#F3EEE5] uppercase tracking-wider">
          {t('about.title')}
        </h1>
        <p className="font-editorial italic text-lg sm:text-xl text-[#DFBF7A]">
          "{t('about.subtitle')}"
        </p>
      </div>

      {/* Mission Narrative */}
      <div className="bg-[#1C120E] border border-[#C6A15B]/30 p-8 sm:p-12 space-y-6 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#C6A15B]/40 bg-[#0F0D0C]">
          <Sparkles className="w-3.5 h-3.5 text-[#C6A15B]" />
          <span className="font-cinzel text-xs uppercase tracking-[0.25em] text-[#C6A15B]">
            {t('about.mission')}
          </span>
        </div>
        <p className="text-sm sm:text-base text-[#C5B8A8] font-sans leading-relaxed">
          {t('about.missionDesc')}
        </p>
        <p className="text-xs sm:text-sm text-[#C5B8A8] font-sans leading-relaxed">
          Established in Dubai with dedicated salons in London, Paris, and Riyadh, Arabian Sheikh serves a global clientele of dignitaries, royals, and fragrance connoisseurs who demand uncompromising raw ingredient integrity.
        </p>
      </div>

      {/* Guiding Pillars */}
      <div className="space-y-8">
        <h3 className="font-cinzel text-2xl font-bold text-center uppercase tracking-wider text-[#F3EEE5]">
          {t('about.values')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[#1C120E] border border-[#C6A15B]/20 space-y-3">
            <div className="w-8 h-8 rounded-none border border-[#C6A15B]/40 flex items-center justify-center text-[#C6A15B] bg-[#0F0D0C]">
              <Award className="w-4 h-4" />
            </div>
            <h4 className="font-cinzel text-sm font-bold text-[#F3EEE5] uppercase">
              {t('about.value1')}
            </h4>
            <p className="text-xs text-[#C5B8A8] leading-relaxed">
              {t('about.value1Desc')}
            </p>
          </div>

          <div className="p-6 bg-[#2B1A12] border border-[#C6A15B]/40 space-y-3 shadow-xl">
            <div className="w-8 h-8 rounded-none border border-[#C6A15B]/60 flex items-center justify-center text-[#C6A15B] bg-[#0F0D0C]">
              <Heart className="w-4 h-4" />
            </div>
            <h4 className="font-cinzel text-sm font-bold text-[#DFBF7A] uppercase">
              {t('about.value2')}
            </h4>
            <p className="text-xs text-[#C5B8A8] leading-relaxed">
              {t('about.value2Desc')}
            </p>
          </div>

          <div className="p-6 bg-[#1C120E] border border-[#C6A15B]/20 space-y-3">
            <div className="w-8 h-8 rounded-none border border-[#C6A15B]/40 flex items-center justify-center text-[#C6A15B] bg-[#0F0D0C]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-cinzel text-sm font-bold text-[#F3EEE5] uppercase">
              {t('about.value3')}
            </h4>
            <p className="text-xs text-[#C5B8A8] leading-relaxed">
              {t('about.value3Desc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
