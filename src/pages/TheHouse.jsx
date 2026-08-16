import React from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import {
  Sparkles,
  Compass,
  Flame,
  Award,
  Crown,
  Trees,
  Droplets,
  ArrowRight
} from 'lucide-react';

export default function TheHouse() {
  const { navigate } = useRouter();
  const { t } = useTranslation();

  return (
    <div className="space-y-24 sm:space-y-32 pb-24 animate-fade-in text-[#F3EEE5]">
      {/* 1. Grand Editorial Hero */}
      <section className="relative min-h-[75vh] flex items-center justify-center bg-[#0F0D0C] overflow-hidden pt-28 pb-16">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=2000&q=90"
            alt="The House of Arabian Sheikh"
            className="w-full h-full object-cover object-center opacity-25 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0D0C] via-[#0F0D0C]/75 to-[#0F0D0C]/90" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#C6A15B]/40 bg-[#1C120E]/80 backdrop-blur-md">
            <Crown className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span className="font-cinzel text-xs uppercase tracking-[0.3em] text-[#C6A15B]">
              Haute Parfumerie Sanctuary
            </span>
          </div>

          <h1 className="font-cinzel text-4xl sm:text-6xl font-bold tracking-[0.1em] text-[#F3EEE5] uppercase leading-tight">
            {t('theHouse.title')}
          </h1>

          <p className="font-editorial italic text-xl sm:text-2xl text-[#DFBF7A] max-w-2xl mx-auto">
            "{t('theHouse.subtitle')}"
          </p>

          <div className="pt-4 flex justify-center gap-4">
            <Link to="/shop" className="luxury-btn-gold px-8 py-3.5 text-xs">
              Explore Royal Reserves
            </Link>
          </div>
        </div>
      </section>

      {/* 2. OUR ROYAL STORY */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="font-cinzel text-xs uppercase tracking-[0.3em] text-[#C6A15B] font-semibold block">
              Chapter I • The Heritage
            </span>
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F3EEE5] uppercase">
              {t('theHouse.storyTitle')}
            </h2>
            <p className="text-sm sm:text-base text-[#C5B8A8] font-sans leading-relaxed">
              {t('theHouse.storyDesc')}
            </p>
            <p className="text-xs sm:text-sm text-[#C5B8A8] font-sans leading-relaxed">
              In our ateliers, perfume is not an accessory—it is an aura of presence, an aromatic tapestry woven from wild harvest extracts that cannot be replicated by synthetic modern chemistry.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-[4/3] border-2 border-[#C6A15B]/30 bg-[#1C120E] shadow-2xl overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=85"
                alt="Palace Heritage"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F0D0C]/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-xs font-cinzel text-[#DFBF7A]">
                The Arabian Majlis • Where Fragrance Signifies Eternal Hospitality
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE ART OF OUD & THE RITUAL OF BAKHOOR (Split Editorial) */}
      <section className="bg-[#140D0A] border-y border-[#C6A15B]/20 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {/* Oud */}
          <div id="oud" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="relative aspect-[4/5] border border-[#C6A15B]/40 bg-[#0F0D0C] shadow-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=85"
                  alt="Aged Assamese Agarwood"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#C6A15B]/30 bg-[#0F0D0C]">
                <Trees className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span className="font-cinzel text-xs uppercase tracking-[0.25em] text-[#C6A15B]">
                  Black Gold of the Orient
                </span>
              </div>
              <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F3EEE5] uppercase">
                {t('theHouse.oudTitle')}
              </h2>
              <p className="text-sm text-[#C5B8A8] font-sans leading-relaxed">
                {t('theHouse.oudDesc')}
              </p>
              <div className="p-4 bg-[#1C120E] border-l-2 border-[#C6A15B] text-xs text-[#DFBF7A] italic font-editorial text-base">
                "Dehn Al Oud is the heartbeat of Arabian Sheikh. A single drop holds decades of rain, sun, earth, and sacred resin."
              </div>
            </div>
          </div>

          {/* Bakhoor */}
          <div id="bakhoor" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#C6A15B]/30 bg-[#0F0D0C]">
                <Flame className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span className="font-cinzel text-xs uppercase tracking-[0.25em] text-[#C6A15B]">
                  Sacred Smoke Ritual
                </span>
              </div>
              <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F3EEE5] uppercase">
                {t('theHouse.bakhoorTitle')}
              </h2>
              <p className="text-sm text-[#C5B8A8] font-sans leading-relaxed">
                {t('theHouse.bakhoorDesc')}
              </p>
              <div className="p-4 bg-[#1C120E] border-l-2 border-[#C6A15B] text-xs text-[#DFBF7A] italic font-editorial text-base">
                "To perfume a guest with Bakhoor is an ancient Arab gesture declaring: you are honored, protected, and cherished under our roof."
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="relative aspect-[4/5] border border-[#C6A15B]/40 bg-[#0F0D0C] shadow-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85"
                  alt="Sacred Bakhoor Smoke"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CRAFTSMANSHIP & NOBLE INGREDIENTS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="font-cinzel text-xs uppercase tracking-[0.3em] text-[#C6A15B] font-semibold">
            The Atelier Standard
          </span>
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F3EEE5] uppercase">
            {t('theHouse.craftsmanshipTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-[#1C120E] border border-[#C6A15B]/20 space-y-4">
            <div className="w-10 h-10 border border-[#C6A15B]/40 flex items-center justify-center text-[#C6A15B]">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="font-cinzel text-base font-bold text-[#F3EEE5] uppercase">
              35-40% Extrait Concentration
            </h3>
            <p className="text-xs text-[#C5B8A8] font-sans leading-relaxed">
              Every creation is formulated at the highest oil concentration allowed in haute perfumery, ensuring unparalleled sillage and 24+ hour longevity.
            </p>
          </div>

          <div className="p-8 bg-[#2B1A12] border border-[#C6A15B]/40 space-y-4 shadow-xl">
            <div className="w-10 h-10 border border-[#C6A15B]/60 flex items-center justify-center text-[#C6A15B]">
              <Crown className="w-5 h-5" />
            </div>
            <h3 className="font-cinzel text-base font-bold text-[#DFBF7A] uppercase">
              Solid Zamak Gold Cap
            </h3>
            <p className="text-xs text-[#C5B8A8] font-sans leading-relaxed">
              Forged with substantial weight, hand-polished, and engraved with bespoke classical Arabic calligraphy. A heirloom artifact for your collection.
            </p>
          </div>

          <div className="p-8 bg-[#1C120E] border border-[#C6A15B]/20 space-y-4">
            <div className="w-10 h-10 border border-[#C6A15B]/40 flex items-center justify-center text-[#C6A15B]">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-cinzel text-base font-bold text-[#F3EEE5] uppercase">
              Stone Cellar Matured
            </h3>
            <p className="text-xs text-[#C5B8A8] font-sans leading-relaxed">
              Following distillation, our botanical extracts mature for a minimum of 180 days in temperature-controlled dark vaults to harmonize every facet.
            </p>
          </div>
        </div>
      </section>

      {/* 5. PHILOSOPHY CTA BANNER */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 bg-[#1C120E] border border-[#C6A15B]/40 p-10 sm:p-14 shadow-2xl">
        <span className="font-cinzel text-xs uppercase tracking-[0.3em] text-[#C6A15B] font-semibold">
          The Palace Doctrine
        </span>
        <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F3EEE5] uppercase">
          {t('theHouse.philosophyTitle')}
        </h2>
        <p className="font-editorial italic text-lg sm:text-xl text-[#C5B8A8] leading-relaxed">
          "{t('theHouse.philosophyDesc')}"
        </p>
        <div className="pt-4">
          <Link to="/shop" className="luxury-btn-gold px-8 py-3.5 text-xs inline-flex items-center gap-2">
            <span>Discover The Flacons</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
