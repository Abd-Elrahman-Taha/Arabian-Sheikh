import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { Sparkles, ShieldCheck, Heart, Award } from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '../components/common/ScrollReveal';
import CamelCaravan from '../components/motion/CamelCaravan';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="pt-36 sm:pt-40 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 animate-fade-in text-[var(--text-primary)]">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-[var(--gold-light)] drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)] font-bold">
            High Perfumery Heritage
          </span>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] uppercase tracking-wider">
            {t('about.title')}
          </h1>
          <p className="font-editorial italic text-lg sm:text-xl text-[var(--gold-light)] drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)] max-w-2xl mx-auto">
            "{t('about.subtitle')}"
          </p>
        </div>
      </ScrollReveal>

      {/* Desert Camel Caravan — Below First Section */}
      <div className="relative w-full h-32 sm:h-44 md:h-52 overflow-hidden -my-8 pointer-events-none">
        <CamelCaravan speedMultiplier={0.88} opacity={0.95} scale={1.05} />
      </div>

      {/* Mission Narrative */}
      <ScrollReveal direction="left">
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-8 sm:p-12 space-y-6 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-[var(--border-gold-subtle)] bg-[var(--bg-secondary)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--gold-primary)]" />
            <span className="font-cinzel text-xs uppercase tracking-[0.25em] text-[var(--gold-primary)] font-semibold">
              {t('about.mission')}
            </span>
          </div>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] font-sans leading-relaxed">
            {t('about.missionDesc')}
          </p>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-sans leading-relaxed">
            Established in Dubai with dedicated salons in London, Paris, and Riyadh, Arabian Sheikh serves a global clientele of dignitaries, royals, and fragrance connoisseurs who demand uncompromising raw ingredient integrity.
          </p>
        </div>
      </ScrollReveal>

      {/* Guiding Pillars */}
      <div className="space-y-8">
        <ScrollReveal direction="up">
          <h3 className="font-cinzel text-2xl font-bold text-center uppercase tracking-wider text-[var(--text-primary)]">
            {t('about.values')}
          </h3>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScrollRevealItem index={0}>
            <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3 shadow-sm h-full">
              <div className="w-8 h-8 rounded-none border border-[var(--border-gold-subtle)] flex items-center justify-center text-[var(--gold-primary)] bg-[var(--bg-primary)]">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="font-cinzel text-sm font-bold text-[var(--text-primary)] uppercase">
                {t('about.value1')}
              </h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {t('about.value1Desc')}
              </p>
            </div>
          </ScrollRevealItem>

          <ScrollRevealItem index={1}>
            <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-gold-subtle)] space-y-3 shadow-md h-full">
              <div className="w-8 h-8 rounded-none border border-[var(--border-gold-subtle)] flex items-center justify-center text-[var(--gold-primary)] bg-[var(--bg-primary)]">
                <Heart className="w-4 h-4" />
              </div>
              <h4 className="font-cinzel text-sm font-bold text-[var(--gold-light)] uppercase">
                {t('about.value2')}
              </h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {t('about.value2Desc')}
              </p>
            </div>
          </ScrollRevealItem>

          <ScrollRevealItem index={2}>
            <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3 shadow-sm h-full">
              <div className="w-8 h-8 rounded-none border border-[var(--border-gold-subtle)] flex items-center justify-center text-[var(--gold-primary)] bg-[var(--bg-primary)]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-cinzel text-sm font-bold text-[var(--text-primary)] uppercase">
                {t('about.value3')}
              </h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {t('about.value3Desc')}
              </p>
            </div>
          </ScrollRevealItem>
        </div>
      </div>
    </div>
  );
}
