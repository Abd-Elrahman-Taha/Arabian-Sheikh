import React from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import PalaceMemoryVideo from '../components/media/PalaceMemoryVideo';
import ArabianLogo from '../components/common/ArabianLogo';
import {
  Crown,
  Trees,
  Flame,
  Award,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Compass,
  Heart,
  Droplets
} from 'lucide-react';

export default function ThePalace() {
  const { navigate } = useRouter();
  const { t, language } = useTranslation();

  return (
    <div className="space-y-24 sm:space-y-32 pb-24 animate-fade-in bg-transparent text-[#F3E6D0]">
      
      {/* 1. Grand Palace Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-36 sm:pt-44 pb-20">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero_arabian_palace.jpg"
            alt="The Sovereign Palace of Arabian Sheikh"
            className="w-full h-full object-cover object-center opacity-35 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A08] via-[#0B0A08]/70 to-[#0B0A08]/90" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#D4AF37]/40 bg-[#21130D]/80 backdrop-blur-md shadow-sm">
            <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="font-cinzel text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-bold">
              {language === 'es' ? 'Santuario de Alta Perfumería' : 'Haute Parfumerie Sanctuary'}
            </span>
          </div>

          <h1 className="font-cinzel text-4xl sm:text-6xl font-bold tracking-[0.1em] text-[#F3E6D0] uppercase leading-tight">
            {language === 'es' ? 'El Palacio' : 'The Palace'}
          </h1>

          <p className="italic text-xl sm:text-2xl text-[#D4AF37] max-w-2xl mx-auto font-serif">
            "{language === 'es' ? 'Donde el tiempo se convierte en aroma y la memoria en eternidad.' : 'Where time dissolves into fragrance and memory into eternity.'}"
          </p>

          <div className="pt-4 flex justify-center gap-4">
            <Link
              to="/shop?category=perfumes"
              className="px-8 py-3.5 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-xl"
            >
              {language === 'es' ? 'Explorar el Catálogo Real' : 'Explore Palace Reserves'}
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CINEMATIC VIDEO SECTION: SCENT AS LIVING MEMORY */}
      <PalaceMemoryVideo
        videoSrc="/intro.mp4"
        posterSrc="/hero_arabian_palace.jpg"
      />

      {/* 3. OUR ROYAL STORY & ANDALUSIAN PROVENANCE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="font-cinzel text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-bold block">
              Chapter I • The Sovereign Origins
            </span>
            <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F3E6D0] uppercase">
              The Architecture of Scent
            </h2>
            <p className="text-sm sm:text-base text-[#D8BE99] font-sans leading-relaxed">
              Born from the royal courts of Andalusia and the ancient incense trade routes of the Arabian Peninsula, Arabian Sheikh was founded to preserve the sacred heritage of pure perfumery.
            </p>
            <p className="text-xs sm:text-sm text-[#D8BE99] font-sans leading-relaxed">
              In our palace ateliers, perfume is not an accessory—it is an aura of presence, an aromatic tapestry woven from wild harvest extracts that cannot be replicated by synthetic modern chemistry.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-[4/3] border border-[#D4AF37]/25 bg-[#0B0A08] shadow-2xl overflow-hidden group">
              <img
                src="/arabian_sheikh_palace.jpg"
                alt="Palace Architecture"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-xs font-cinzel text-[#D4AF37] font-bold">
                The Arabian Majlis • Where Fragrance Signifies Eternal Hospitality
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. THE 3 PILLARS OF PALACE DISTILLATION */}
      <section className="bg-[#0B0A08] border-y border-[#D4AF37]/15 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-cinzel">
              Sacred Pillars
            </span>
            <h2 className="text-2xl sm:text-3xl font-cinzel font-bold text-[#F3E6D0]">
              The Secret Formulation Disciplines
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-[#21130D] border border-[#D4AF37]/20 space-y-4">
              <Droplets className="w-8 h-8 text-[#D4AF37]" />
              <h3 className="font-cinzel text-base font-bold text-[#F3E6D0]">High Concentration Extraits</h3>
              <p className="text-xs text-[#D8BE99] leading-relaxed">
                All 60ml flacons are bottled at 30%+ pure perfume oil concentration, ensuring an unbroken sillage that unfolds for up to 16 hours.
              </p>
            </div>

            <div className="p-8 bg-[#21130D] border border-[#D4AF37]/20 space-y-4">
              <Flame className="w-8 h-8 text-[#D4AF37]" />
              <h3 className="font-cinzel text-base font-bold text-[#F3E6D0]">Aged Artisanal Bakhoor</h3>
              <p className="text-xs text-[#D8BE99] leading-relaxed">
                Incense chips soaked in Cambodian resins and Taif rose oils, burned on charcoal in sovereign majlis welcoming rituals.
              </p>
            </div>

            <div className="p-8 bg-[#21130D] border border-[#D4AF37]/20 space-y-4">
              <Award className="w-8 h-8 text-[#D4AF37]" />
              <h3 className="font-cinzel text-base font-bold text-[#F3E6D0]">Numbered Flacon Provenance</h3>
              <p className="text-xs text-[#D8BE99] leading-relaxed">
                Each bottle is hand-poured, inspected, and sealed under palace seal, ready for DHL Express temperature-controlled courier transit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EXPLORE THE PALACE COLLECTION */}
      <section className="text-center max-w-2xl mx-auto px-4 space-y-6 pt-6">
        <ArabianLogo variant="crest" size="md" />
        <h2 className="text-2xl sm:text-3xl font-cinzel font-bold text-[#F3E6D0]">
          Begin Your Sovereign Journey
        </h2>
        <p className="text-xs text-[#D8BE99]">
          Explore the Luxury, Royal, and Classic tiers distilled exclusively at the Palace.
        </p>
        <Link
          to="/shop"
          className="inline-block px-10 py-4 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel font-bold text-xs uppercase tracking-[0.25em] transition-all duration-300 shadow-2xl"
        >
          Enter the Boutique
        </Link>
      </section>

    </div>
  );
}
