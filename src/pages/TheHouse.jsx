import React from 'react';
import ScrollReveal, { ScrollRevealItem } from '../components/common/ScrollReveal';
import { useRouter, Link } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import {
  Crown,
  Trees,
  Flame,
  Award,
  ArrowRight
} from 'lucide-react';

export default function TheHouse() {
  const { navigate } = useRouter();
  const { t } = useTranslation();

  return (
    <div className="space-y-24 sm:space-y-32 pb-24 animate-fade-in text-[var(--text-primary)]">
      {/* 1. Grand Editorial Hero */}
      <section className="relative min-h-[75vh] flex items-center justify-center bg-[var(--bg-secondary)] overflow-hidden pt-36 sm:pt-44 pb-16">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=2000&q=90"
            alt="The House of Arabian Sheikh"
            className="w-full h-full object-cover object-center opacity-25 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/75 to-[var(--bg-primary)]/90" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-[var(--border-gold-subtle)] bg-[var(--bg-card)]/80 backdrop-blur-md shadow-sm">
            <Crown className="w-3.5 h-3.5 text-[var(--gold-primary)]" />
            <span className="font-cinzel text-xs uppercase tracking-[0.3em] text-[var(--gold-primary)] font-semibold">
              Haute Parfumerie Sanctuary
            </span>
          </div>

          <h1 className="font-cinzel text-4xl sm:text-6xl font-bold tracking-[0.1em] text-[var(--text-primary)] uppercase leading-tight">
            {t('theHouse.title')}
          </h1>

          <p className="font-editorial italic text-xl sm:text-2xl text-[var(--gold-light)] max-w-2xl mx-auto">
            "{t('theHouse.subtitle')}"
          </p>

          <div className="pt-4 flex justify-center gap-4">
            <Link to="/shop" className="luxury-btn-gold px-8 py-3.5 text-xs cursor-pointer shadow-lg">
              Explore Royal Reserves
            </Link>
          </div>
        </div>
      </section>

      {/* 2. OUR ROYAL STORY */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <ScrollReveal direction="left" className="lg:col-span-6 space-y-6">
            <span className="font-cinzel text-xs uppercase tracking-[0.3em] text-[var(--gold-primary)] font-semibold block">
              Chapter I • The Heritage
            </span>
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[var(--text-primary)] uppercase">
              {t('theHouse.storyTitle')}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] font-sans leading-relaxed">
              {t('theHouse.storyDesc')}
            </p>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] font-sans leading-relaxed">
              In our ateliers, perfume is not an accessory—it is an aura of presence, an aromatic tapestry woven from wild harvest extracts that cannot be replicated by synthetic modern chemistry.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="right" className="lg:col-span-6">
            <div className="relative aspect-[4/3] border border-[var(--border-card)] bg-[var(--bg-card)] shadow-2xl overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=85"
                alt="Palace Heritage"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)]/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-xs font-cinzel text-[var(--gold-light)] font-semibold">
                The Arabian Majlis • Where Fragrance Signifies Eternal Hospitality
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 3. THE ART OF OUD & THE RITUAL OF BAKHOOR (Split Editorial) */}
      <section className="bg-[var(--bg-secondary)] border-y border-[var(--border-subtle)] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {/* Oud */}
          <div id="oud" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <ScrollReveal direction="left" className="lg:col-span-6 order-2 lg:order-1">
              <div className="relative aspect-[4/5] border border-[var(--border-card)] bg-[var(--bg-card)] shadow-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=85"
                  alt="Aged Assamese Agarwood"
                  className="w-full h-full object-cover"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" className="lg:col-span-6 order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-[var(--border-gold-subtle)] bg-[var(--bg-card)]">
                <Trees className="w-3.5 h-3.5 text-[var(--gold-primary)]" />
                <span className="font-cinzel text-xs uppercase tracking-[0.25em] text-[var(--gold-primary)] font-semibold">
                  Black Gold of the Orient
                </span>
              </div>
              <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[var(--text-primary)] uppercase">
                {t('theHouse.oudTitle')}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                {t('theHouse.oudDesc')}
              </p>
              <div className="p-4 bg-[var(--bg-card)] border-l-2 border-[var(--gold-primary)] text-xs text-[var(--gold-primary)] italic font-editorial text-base">
                "Dehn Al Oud is the heartbeat of Arabian Sheikh. A single drop holds decades of rain, sun, earth, and sacred resin."
              </div>
            </ScrollReveal>
          </div>

          {/* Bakhoor */}
          <div id="bakhoor" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <ScrollReveal direction="left" className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-[var(--border-gold-subtle)] bg-[var(--bg-card)]">
                <Flame className="w-3.5 h-3.5 text-[var(--gold-primary)]" />
                <span className="font-cinzel text-xs uppercase tracking-[0.25em] text-[var(--gold-primary)] font-semibold">
                  Sacred Smoke Ritual
                </span>
              </div>
              <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[var(--text-primary)] uppercase">
                {t('theHouse.bakhoorTitle')}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                {t('theHouse.bakhoorDesc')}
              </p>
              <div className="p-4 bg-[var(--bg-card)] border-l-2 border-[var(--gold-primary)] text-xs text-[var(--gold-primary)] italic font-editorial text-base">
                "To perfume a guest with Bakhoor is an ancient Arab gesture declaring: you are honored, protected, and cherished under our roof."
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" className="lg:col-span-6">
              <div className="relative aspect-[4/5] border border-[var(--border-card)] bg-[var(--bg-card)] shadow-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85"
                  alt="Incense burner Bakhoor"
                  className="w-full h-full object-cover"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 4. PRIVATE CRAFTSMANSHIP PILLARS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <ScrollReveal direction="up">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="font-cinzel text-xs uppercase tracking-[0.3em] text-[var(--gold-primary)] font-semibold">
              Uncompromising Standards
            </span>
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[var(--text-primary)] uppercase">
              {t('theHouse.craftTitle')}
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScrollRevealItem index={0} desktopDirection="up">
            <div className="p-8 bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4 shadow-sm">
              <Award className="w-8 h-8 text-[var(--gold-primary)]" />
              <h3 className="font-cinzel text-base font-bold text-[var(--text-primary)] uppercase">
                Aged Extraction
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-sans leading-relaxed">
                Every wild Dehn Al Oud oil is matured for a minimum of five years in temperature-controlled dark chambers to eliminate sharp edges and unlock balsamic warmth.
              </p>
            </div>
          </ScrollRevealItem>

          <ScrollRevealItem index={1} desktopDirection="up">
            <div className="p-8 bg-[var(--bg-card)] border border-[var(--border-gold-subtle)] space-y-4 shadow-md">
              <Crown className="w-8 h-8 text-[var(--gold-primary)]" />
              <h3 className="font-cinzel text-base font-bold text-[var(--text-primary)] uppercase">
                Extrait Concentration
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-sans leading-relaxed">
                All creations are formulated at a minimum 30% pure oil concentrate, ensuring extraordinary longevity that lingers seamlessly on skin and silk.
              </p>
            </div>
          </ScrollRevealItem>

          <ScrollRevealItem index={2} desktopDirection="up">
            <div className="p-8 bg-[var(--bg-card)] border border-[var(--border-card)] space-y-4 shadow-sm">
              <Trees className="w-8 h-8 text-[var(--gold-primary)]" />
              <h3 className="font-cinzel text-base font-bold text-[var(--text-primary)] uppercase">
                Ethical Sourcing
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-sans leading-relaxed">
                We partner exclusively with sustainable certified agarwood plantations in Assam and wild Taif rose families who harvest at dawn before the morning heat rises.
              </p>
            </div>
          </ScrollRevealItem>
        </div>
      </section>
    </div>
  );
}
