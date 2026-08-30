import React from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import PalaceMemoryVideo from '../components/media/PalaceMemoryVideo';
import ArabianLogo from '../components/common/ArabianLogo';
import BlurText from '../components/common/BlurText';
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
  Droplets,
  Feather,
  BookOpen,
  Gem,
  CheckCircle2
} from 'lucide-react';

export default function ThePalace() {
  const { navigate } = useRouter();
  const { t, language } = useTranslation();
  const { isDark } = useTheme();

  const ingredients = [
    {
      id: 'oud',
      name: language === 'ar' ? 'دهن العود الأسامي العتيق' : 'Wild Assamese Agarwood',
      arabicName: 'دهن عود ملكي',
      origin: language === 'ar' ? 'غابات أسام العميقة' : 'Upper Assam Reserves, India',
      image: '/ingredients/ingredient_oud.jpg',
      notes: language === 'ar' ? 'خشب كهرماني • دخان نبيل • راتنج عتيق' : 'Smoky Resin • Noble Bark • Leathered Amber',
      desc: language === 'ar'
        ? 'مقطر ببطء من أشجار العود البرية المعمرة لأكثر من ستين عاماً في قدور النحاس التقليدية ليمنح فوحاناً أسطورياً يدوم لأكثر من 24 ساعة.'
        : 'Slowly distilled in artisanal copper stills from 60+ year-old wild agarwood trees, delivering an authoritative, balsamic resonance that lingers for days.'
    },
    {
      id: 'amber',
      name: language === 'ar' ? 'العنبر البحري المتحجر' : 'Fossilized Coastal Ambergris',
      arabicName: 'عنبر أشهب فاخر',
      origin: language === 'ar' ? 'سواحل بحر العرب' : 'Arabian Sea Shorelines',
      image: '/ingredients/ingredient_amber.jpg',
      notes: language === 'ar' ? 'بلسم دافئ • عسل ذهبي • لمعان شمسي' : 'Warm Balsam • Honeyed Gold • Solar Radiance',
      desc: language === 'ar'
        ? 'معتق بأشعة الشمس والمياه المالحة عبر عقود، يمنح العطر ثباتاً مخملياً وعمقاً حريرياً لا يُضاهى.'
        : 'Cured by marine tides and sunlight over decades, providing an irreplaceable velvet warmth and crystalline longevity to our extraits.'
    },
    {
      id: 'rose',
      name: language === 'ar' ? 'ورد الطائف الجبلي والمسك الأبيض' : 'Mountain Taif Royal Rose',
      arabicName: 'ورد الطائف النبيل',
      origin: language === 'ar' ? 'مرتفعات الهدا، الطائف' : 'Al-Hada Highlands, Taif',
      image: '/ingredients/ingredient_rose_musk.jpg',
      notes: language === 'ar' ? 'بتلات نضرة • ندى الصباح • مسك حريري' : 'Dewy Petals • Morning Dew • Silken Musk',
      desc: language === 'ar'
        ? 'تُقطف بتلات الورد يدوياً قبل بزوغ الفجر حين يكون تركيز الزيوت العطرية في ذروته الملكية.'
        : 'Hand-picked exclusively at dawn before sunrise when the essential petal oils reach their peak imperial concentration.'
    },
    {
      id: 'saffron',
      name: language === 'ar' ? 'زعفران كشمير الإمبراطوري' : 'Imperial Kashmiri Saffron',
      arabicName: 'زعفران أحمر خالص',
      origin: language === 'ar' ? 'وادي بامبور، كشمير' : 'Pampore Plateau, Kashmir',
      image: '/ingredients/ingredient_saffron.jpg',
      notes: language === 'ar' ? 'توابل ملكية • جلد ناعم • لمعان ذهبي' : 'Golden Spice • Soft Suede • Crimson Nectar',
      desc: language === 'ar'
        ? 'الخيوط الحمراء الأكثر ندرة في العالم تضفي دفئاً حاراً وتوهجاً أرستقراطياً على تركيبة العطر.'
        : 'The most prized crimson stigmas on earth, imparting a golden spicy radiance and royal warmth across our signature accords.'
    }
  ];

  return (
    <div className={`space-y-24 sm:space-y-36 pb-32 animate-fade-in bg-transparent transition-colors duration-500 ${
      isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
    }`}>
      
      {/* =========================================================================
          1. GRAND PALACE HERO
          ========================================================================= */}
      <section className="relative min-h-[82vh] flex items-center justify-center overflow-hidden pt-36 sm:pt-44 pb-20">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero_arabian_palace.jpg"
            alt="The Sovereign Palace of Arabian Sheikh"
            className="w-full h-full object-cover object-center opacity-40 scale-105"
          />
          <div className={`absolute inset-0 ${
            isDark
              ? 'bg-gradient-to-t from-[#0B0A08] via-[#0B0A08]/75 to-[#0B0A08]/90'
              : 'bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2]/75 to-[#FAF7F2]/90'
          }`} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15)_0%,transparent_70%)] pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 text-center space-y-6">
          <div className={`inline-flex items-center gap-2.5 px-5 py-2 border rounded-full backdrop-blur-md shadow-2xl ${
            isDark
              ? 'border-[#D4AF37]/50 bg-[#21130D]/90 text-[#F2D675]'
              : 'border-[#D4AF37]/60 bg-gradient-to-r from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] text-[#8C6239] shadow-[0_10px_30px_rgba(212,175,55,0.2)]'
          }`}>
            <Crown className="w-4 h-4 text-[#D4AF37]" />
            <span className="font-cinzel text-xs uppercase tracking-[0.3em] font-bold">
              {language === 'ar' ? 'صرح العطور الأندلسية والملكية' : language === 'bg' ? 'Светилище на висшата парфюмерия' : language === 'es' ? 'Santuario de Alta Perfumería' : 'Haute Parfumerie Sanctuary'}
            </span>
          </div>

          <BlurText
            text={language === 'ar' ? 'قصر أربيان شيخ' : language === 'bg' ? 'Дворецът' : language === 'es' ? 'El Palacio' : 'The Palace'}
            delay={70}
            animateBy="words"
            direction="top"
            className={`font-cinzel text-4xl sm:text-6xl lg:text-7xl font-bold tracking-[0.08em] uppercase leading-tight justify-center drop-shadow-2xl ${
              isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
            }`}
            as="h1"
          />

          <p className={`italic text-xl sm:text-2xl max-w-3xl mx-auto font-serif drop-shadow-md ${
            isDark ? 'text-[#D4AF37]' : 'text-[#8C6239] font-semibold'
          }`}>
            "{language === 'ar' ? 'حيث يتحول الزمان إلى شذى، والذاكرة إلى خلود ملكي.' : language === 'bg' ? 'Където времето се превръща в аромат, а паметта – във вечност.' : language === 'es' ? 'Donde el tiempo se convierte en aroma y la memoria en eternidad.' : 'Where time dissolves into fragrance and memory into eternity.'}"
          </p>

          <div className="pt-4 flex justify-center gap-4">
            <Link
              to="/shop"
              className={`group relative inline-flex items-center gap-3 px-9 py-4 rounded-full font-cinzel font-bold text-xs uppercase tracking-[0.22em] transition-all duration-400 border overflow-hidden cursor-pointer shadow-lg hover:scale-105 ${
                isDark
                  ? 'bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] hover:from-[#F2D675] hover:via-[#D4AF37] hover:to-[#F2D675] text-[#FFFDF8] hover:text-[#0B0A08] border-[#F2D675]/50 shadow-[0_10px_30px_rgba(140,98,57,0.45)]'
                  : 'bg-gradient-to-r from-[#2C180F] via-[#120B06] to-[#2C180F] hover:from-[#D4AF37] hover:via-[#F2D675] hover:to-[#D4AF37] text-[#FFFDF9] hover:text-[#120B06] border-[#D4AF37]/50 shadow-[0_10px_30px_rgba(0,0,0,0.15)]'
              }`}
            >
              <span>{language === 'ar' ? 'استكشف المجموعات الملكية' : language === 'bg' ? 'Разгледайте дворцовите резерви' : language === 'es' ? 'Explorar el Catálogo Real' : 'Explore Palace Reserves'}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. CINEMATIC LIVING MEMORY VIDEO
          ========================================================================= */}
      <PalaceMemoryVideo
        videoSrc="/intro.mp4"
        posterSrc="/hero_arabian_palace.jpg"
      />

      {/* =========================================================================
          3. ARTICLE CHAPTER I: THE ANDALUSIAN HERITAGE & ROYAL LINEAGE
          ========================================================================= */}
      <section className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-8 h-[1px] bg-[#D4AF37]" />
              <span className={`font-cinzel text-xs uppercase tracking-[0.3em] font-bold ${
                isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
              }`}>
                Chapter I • The Sovereign Origins
              </span>
            </div>

            <h2 className={`font-cinzel text-3xl sm:text-5xl font-bold uppercase leading-tight ${
              isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
            }`}>
              The Architecture of Royal Scent
            </h2>

            <p className={`text-sm sm:text-base font-sans leading-relaxed font-medium ${
              isDark ? 'text-[#D8BE99]' : 'text-[#2C180F]'
            }`}>
              Born from the majestic courts of Andalusia and the storied incense trade routes of Dhofar, <strong className={isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}>Arabian Sheikh</strong> was established to restore pure olfactory alchemy to the modern world.
            </p>

            <p className={`text-sm font-sans leading-relaxed font-medium ${
              isDark ? 'text-[#D8BE99]' : 'text-[#2C180F]'
            }`}>
              In our palace ateliers, perfume is not treated as a fleeting fashion accessory—it is an aura of sovereignty, an unwritten memoir bottled in numbered crystal flacons using hand-matured raw essences that synthetic chemistry can never emulate.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className={`p-4 rounded-xl border space-y-1 transition-colors ${
                isDark
                  ? 'bg-black/50 border-[#D4AF37]/25 text-[#F3E6D0]'
                  : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/45 text-[#120B06] shadow-[0_10px_30px_rgba(212,175,55,0.18)]'
              }`}>
                <span className={`font-cinzel text-lg font-bold block ${isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'}`}>30%+ Extrait</span>
                <span className={`text-[11px] block font-mono font-medium ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>Pure Oil Concentration</span>
              </div>
              <div className={`p-4 rounded-xl border space-y-1 transition-colors ${
                isDark
                  ? 'bg-black/50 border-[#D4AF37]/25 text-[#F3E6D0]'
                  : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/45 text-[#120B06] shadow-[0_10px_30px_rgba(212,175,55,0.18)]'
              }`}>
                <span className={`font-cinzel text-lg font-bold block ${isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'}`}>180+ Days</span>
                <span className={`text-[11px] block font-mono font-medium ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>Cold Dark Matured</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className={`relative aspect-[4/3] rounded-3xl border overflow-hidden group transition-colors ${
              isDark
                ? 'border-[#D4AF37]/35 bg-[#0B0A08] shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
                : 'border-[#D4AF37]/45 bg-gradient-to-br from-[#FFFDF8] to-[#FAF1DF] shadow-[0_20px_50px_rgba(212,175,55,0.2)]'
            }`}>
              <img
                src="/arabian_sheikh_palace.jpg"
                alt="The Sovereign Palace of Arabian Sheikh"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 space-y-1">
                <span className="text-[10px] uppercase font-cinzel tracking-[0.25em] text-[#F2D675] font-bold block">
                  Andalusian Architectural Sanctuary
                </span>
                <p className="text-xs sm:text-sm font-cinzel text-[#F3E6D0] font-semibold">
                  Where Sacred Agarwood and Taif Rose Accord Treatises are Penned
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          4. ARTICLE CHAPTER II: THE MASTER ALCHEMIST & THE DISTILLATION RITUAL
          ========================================================================= */}
      <section className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className={`relative aspect-[4/3] rounded-3xl border overflow-hidden group transition-colors ${
              isDark
                ? 'border-[#D4AF37]/35 bg-[#0B0A08] shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
                : 'border-[#D4AF37]/45 bg-gradient-to-br from-[#FFFDF8] to-[#FAF1DF] shadow-[0_20px_50px_rgba(212,175,55,0.2)]'
            }`}>
              <img
                src="/editorial/master_alchemist.jpg"
                alt="The Master Alchemist Distillation"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 space-y-1">
                <span className="text-[10px] uppercase font-cinzel tracking-[0.25em] text-[#F2D675] font-bold block">
                  Haute Alchemical Distillation
                </span>
                <p className="text-xs sm:text-sm font-cinzel text-[#F3E6D0] font-semibold">
                  Fractional Copper-Pot Distillation & Secret Barrel Maturation
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-[1px] bg-[#D4AF37]" />
              <span className={`font-cinzel text-xs uppercase tracking-[0.3em] font-bold ${
                isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
              }`}>
                Chapter II • The Sacred Craft
              </span>
            </div>

            <h2 className={`font-cinzel text-3xl sm:text-5xl font-bold uppercase leading-tight ${
              isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
            }`}>
              The Master Alchemist's Discipline
            </h2>

            <p className={`text-sm sm:text-base font-sans leading-relaxed font-medium ${
              isDark ? 'text-[#D8BE99]' : 'text-[#2C180F]'
            }`}>
              Every creation at Arabian Sheikh is supervised by our Master Nose. We utilize slow, low-temperature fractional distillation in heavy hand-hammered copper vessels to prevent the fragile floral ketones and complex oud terpenes from scorching.
            </p>

            <p className={`text-sm font-sans leading-relaxed font-medium ${
              isDark ? 'text-[#D8BE99]' : 'text-[#2C180F]'
            }`}>
              Once extracted, the liquid elixirs rest in lightless, temperature-calibrated vaults for a minimum of half a year. This quiet aging allows the notes to harmonize into a seamless, multi-faceted symphony that evolves exquisitely upon the warmth of the skin.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span className={`text-xs font-medium ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>Hand-selected Assamese heartwood chips inspected under microscope</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span className={`text-xs font-medium ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>Zero synthetic petroleum fixatives or artificial coloring agents</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span className={`text-xs font-medium ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>Triple-filtered pure organic alcohol base for crystalline projection</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          5. ARTICLE CHAPTER III: FLACON CRAFTSMANSHIP & 24K GOLD SCULPTURE
          ========================================================================= */}
      <section className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-8 h-[1px] bg-[#D4AF37]" />
              <span className={`font-cinzel text-xs uppercase tracking-[0.3em] font-bold ${
                isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
              }`}>
                Chapter III • Sacred Vessels
              </span>
            </div>

            <h2 className={`font-cinzel text-3xl sm:text-5xl font-bold uppercase leading-tight ${
              isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
            }`}>
              Flacon Sculpture & 24K Gold Sovereignty
            </h2>

            <p className={`text-sm sm:text-base font-sans leading-relaxed font-medium ${
              isDark ? 'text-[#D8BE99]' : 'text-[#2C180F]'
            }`}>
              A sovereign fragrance deserves an unyielding reliquary. Our signature 60ml flacons are individually weighted with dense volcanic obsidian glass and capped with mirror-finished 24-karat gold-plated crowns.
            </p>

            <p className={`text-sm font-sans leading-relaxed font-medium ${
              isDark ? 'text-[#D8BE99]' : 'text-[#2C180F]'
            }`}>
              Each flacon is housed inside an artisanal velvet-lined lacquer coffret, accompanied by a numbered certificate of authenticity and the alchemist's formulation seal.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className={`p-3.5 rounded-xl border text-center transition-colors ${
                isDark
                  ? 'bg-black/60 border-[#D4AF37]/30 text-[#F3E6D0]'
                  : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/45 text-[#120B06] shadow-[0_10px_30px_rgba(212,175,55,0.18)]'
              }`}>
                <span className={`font-cinzel text-xs font-bold block ${isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'}`}>Obsidian Glass</span>
                <span className={`text-[10px] block font-mono mt-0.5 font-medium ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>Heavy Crystal Base</span>
              </div>
              <div className={`p-3.5 rounded-xl border text-center transition-colors ${
                isDark
                  ? 'bg-black/60 border-[#D4AF37]/30 text-[#F3E6D0]'
                  : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/45 text-[#120B06] shadow-[0_10px_30px_rgba(212,175,55,0.18)]'
              }`}>
                <span className={`font-cinzel text-xs font-bold block ${isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'}`}>24K Gold</span>
                <span className={`text-[10px] block font-mono mt-0.5 font-medium ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>Mirror Plated Cap</span>
              </div>
              <div className={`p-3.5 rounded-xl border text-center transition-colors ${
                isDark
                  ? 'bg-black/60 border-[#D4AF37]/30 text-[#F3E6D0]'
                  : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/45 text-[#120B06] shadow-[0_10px_30px_rgba(212,175,55,0.18)]'
              }`}>
                <span className={`font-cinzel text-xs font-bold block ${isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'}`}>Numbered</span>
                <span className={`text-[10px] block font-mono mt-0.5 font-medium ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>Palace Serial Seal</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className={`relative aspect-[4/3] rounded-3xl border overflow-hidden group transition-colors ${
              isDark
                ? 'border-[#D4AF37]/35 bg-[#0B0A08] shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
                : 'border-[#D4AF37]/45 bg-gradient-to-br from-[#FFFDF8] to-[#FAF1DF] shadow-[0_20px_50px_rgba(212,175,55,0.2)]'
            }`}>
              <img
                src="/editorial/flacon_craftsmanship.jpg"
                alt="Flacon Craftsmanship"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 space-y-1">
                <span className="text-[10px] uppercase font-cinzel tracking-[0.25em] text-[#F2D675] font-bold block">
                  Mirror-Finished Atelier
                </span>
                <p className="text-xs sm:text-sm font-cinzel text-[#F3E6D0] font-semibold">
                  Hand-Polished 24K Gold Crowns & Numbered Crystal Flacons
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          6. ARTICLE CHAPTER IV: THE SACRED FOUR INGREDIENTS SPOTLIGHT
          ========================================================================= */}
      <section className={`border-y py-24 transition-colors duration-500 ${
        isDark ? 'bg-[#0B0A08]/90 border-[#D4AF37]/25' : 'bg-[#DECABB]/40 border-[#D4AF37]/35'
      }`}>
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${
              isDark ? 'border-[#D4AF37]/40 bg-[#21130D]' : 'border-[#D4AF37]/50 bg-[#FAF1DF]'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className={`text-[10px] uppercase tracking-[0.3em] font-cinzel font-bold ${
                isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
              }`}>
                Chapter IV • Olfactory Pillars
              </span>
            </div>
            <h2 className={`text-3xl sm:text-5xl font-cinzel font-bold uppercase ${
              isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
            }`}>
              The Four Sacred Harvests
            </h2>
            <p className={`text-xs sm:text-sm font-sans max-w-2xl mx-auto font-medium ${
              isDark ? 'text-[#D8BE99]' : 'text-[#3A2116]'
            }`}>
              Rare natural resins, aged barks, and mountain blossoms harvested in strict harmony with regional growing seasons.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {ingredients.map((ing) => (
              <div
                key={ing.id}
                className={`group relative rounded-3xl border p-6 flex flex-col justify-between space-y-6 shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
                  isDark
                    ? 'bg-[#21130D]/90 border-[#D4AF37]/30 hover:border-[#F2D675]'
                    : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/45 hover:border-[#D4AF37] shadow-[0_10px_30px_rgba(212,175,55,0.18)]'
                }`}
              >
                <div className="space-y-4">
                  {/* Ingredient Image */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#D4AF37]/25 bg-black">
                    <img
                      src={ing.image}
                      alt={ing.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/80 border border-[#D4AF37]/40 text-[9px] font-mono text-[#F2D675] font-bold">
                      {ing.arabicName}
                    </div>
                  </div>

                  {/* Text Details */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-mono font-bold block">
                      {ing.origin}
                    </span>
                    <h3 className={`font-cinzel text-lg font-bold transition-colors ${
                      isDark ? 'text-[#F3E6D0] group-hover:text-[#F2D675]' : 'text-[#120B06] group-hover:text-[#D4AF37]'
                    }`}>
                      {ing.name}
                    </h3>
                    <p className={`text-[11px] font-mono font-semibold ${
                      isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
                    }`}>
                      {ing.notes}
                    </p>
                  </div>

                  <p className={`text-xs leading-relaxed font-medium ${
                    isDark ? 'text-[#D8BE99]' : 'text-[#3A2116]'
                  }`}>
                    {ing.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px]">
                  <span className={`font-cinzel uppercase font-bold ${isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'}`}>Palace Reserve Grade</span>
                  <Award className="w-4 h-4 text-[#D4AF37]" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          7. ARTICLE CHAPTER V: THE IMPERIAL MONOGRAPH & ETHICAL SOURCING
          ========================================================================= */}
      <section className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-8 h-[1px] bg-[#D4AF37]" />
              <span className={`font-cinzel text-xs uppercase tracking-[0.3em] font-bold ${
                isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
              }`}>
                Chapter V • The Palace Archive
              </span>
            </div>

            <h2 className={`font-cinzel text-3xl sm:text-5xl font-bold uppercase leading-tight ${
              isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
            }`}>
              The Imperial Monograph & Sustainable Ethics
            </h2>

            <p className={`text-sm sm:text-base font-sans leading-relaxed font-medium ${
              isDark ? 'text-[#D8BE99]' : 'text-[#2C180F]'
            }`}>
              Preserving nature is the true cornerstone of luxury. Every batch of Assamese agarwood and Dhofar frankincense procured by Arabian Sheikh is certified sustainable, working directly with generational harvesting families without exploitative industrial middlemen.
            </p>

            <p className={`text-sm font-sans leading-relaxed font-medium ${
              isDark ? 'text-[#D8BE99]' : 'text-[#2C180F]'
            }`}>
              For every flacon distilled, Arabian Sheikh pledges funding to indigenous agarwood replanting reserves in Assam and water preservation initiatives in the Taif mountain ranges.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className={`p-4 rounded-xl border space-y-1 transition-colors ${
                isDark
                  ? 'bg-black/60 border-[#D4AF37]/30 text-[#F3E6D0]'
                  : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/45 text-[#120B06] shadow-[0_10px_30px_rgba(212,175,55,0.18)]'
              }`}>
                <ShieldCheck className="w-5 h-5 text-[#D4AF37] mb-1" />
                <span className={`font-cinzel text-xs font-bold block ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>Cruelty-Free Pure Extraits</span>
                <p className={`text-[10px] font-medium ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>Zero synthetic petrochemical fillers</p>
              </div>
              <div className={`p-4 rounded-xl border space-y-1 transition-colors ${
                isDark
                  ? 'bg-black/60 border-[#D4AF37]/30 text-[#F3E6D0]'
                  : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/45 text-[#120B06] shadow-[0_10px_30px_rgba(212,175,55,0.18)]'
              }`}>
                <Trees className="w-5 h-5 text-[#D4AF37] mb-1" />
                <span className={`font-cinzel text-xs font-bold block ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>Replanting Pledge</span>
                <p className={`text-[10px] font-medium ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>5 wild saplings planted per flacon</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className={`relative aspect-[4/3] rounded-3xl border overflow-hidden group transition-colors ${
              isDark
                ? 'border-[#D4AF37]/35 bg-[#0B0A08] shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
                : 'border-[#D4AF37]/45 bg-gradient-to-br from-[#FFFDF8] to-[#FAF1DF] shadow-[0_20px_50px_rgba(212,175,55,0.2)]'
            }`}>
              <img
                src="/editorial/imperial_monograph.jpg"
                alt="Imperial Monograph"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 space-y-1">
                <span className="text-[10px] uppercase font-cinzel tracking-[0.25em] text-[#F2D675] font-bold block">
                  Historical Formulation Treatise
                </span>
                <p className="text-xs sm:text-sm font-cinzel text-[#F3E6D0] font-semibold">
                  Archived Formulas Documenting Centuries of Noble Arabian Distillations
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          8. ARTICLE CHAPTER VI: THE ROYAL MAJLIS & ETERNAL HOSPITALITY
          ========================================================================= */}
      <section className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className={`relative aspect-[4/3] rounded-3xl border overflow-hidden group transition-colors ${
              isDark
                ? 'border-[#D4AF37]/35 bg-[#0B0A08] shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
                : 'border-[#D4AF37]/45 bg-gradient-to-br from-[#FFFDF8] to-[#FAF1DF] shadow-[0_20px_50px_rgba(212,175,55,0.2)]'
            }`}>
              <img
                src="/arabian_woman_palace.jpg"
                alt="The Arabian Majlis Hospitality"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 space-y-1">
                <span className="text-[10px] uppercase font-cinzel tracking-[0.25em] text-[#F2D675] font-bold block">
                  The Sovereign Majlis Ritual
                </span>
                <p className="text-xs sm:text-sm font-cinzel text-[#F3E6D0] font-semibold">
                  Incense and Perfume as the Universal Language of Arabian Honor
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-[1px] bg-[#D4AF37]" />
              <span className={`font-cinzel text-xs uppercase tracking-[0.3em] font-bold ${
                isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
              }`}>
                Chapter VI • Living Heritage
              </span>
            </div>

            <h2 className={`font-cinzel text-3xl sm:text-5xl font-bold uppercase leading-tight ${
              isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
            }`}>
              The Ritual of Arabian Hospitality
            </h2>

            <p className={`text-sm sm:text-base font-sans leading-relaxed font-medium ${
              isDark ? 'text-[#D8BE99]' : 'text-[#2C180F]'
            }`}>
              In our palace majlis, fragrance is the first greeting extended to arriving guests and the lingering embrace when parting. Charcoal mabkharas infuse fine garments with smoking Cambodian bakhoor before rare attar drops are bestowed upon pulse points.
            </p>

            <p className={`text-sm font-sans leading-relaxed font-medium ${
              isDark ? 'text-[#D8BE99]' : 'text-[#2C180F]'
            }`}>
              Through our global delivery network, we bring this authentic palace ceremony directly to your private salon, enclosed in velvet cases ready to crown your presence.
            </p>

            <div className="pt-2">
              <Link
                to="/shop?category=bakhoor"
                className={`inline-flex items-center gap-2 text-xs font-cinzel uppercase tracking-[0.2em] font-bold transition-colors ${
                  isDark ? 'text-[#F2D675] hover:text-white' : 'text-[#8C6239] hover:text-[#120B06]'
                }`}
              >
                <span>Discover Sacred Bakhoor Rituals</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          9. GRAND INVITATION & BOUTIQUE CALL-TO-ACTION
          ========================================================================= */}
      <section className="text-center max-w-3xl mx-auto px-4 space-y-8 pt-8">
        <ArabianLogo variant="crest" size="lg" />
        
        <div className="space-y-3">
          <span className={`text-xs uppercase tracking-[0.35em] font-cinzel font-bold ${
            isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
          }`}>
            Private Atelier Access
          </span>
          <h2 className={`text-3xl sm:text-5xl font-cinzel font-bold uppercase ${
            isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
          }`}>
            Begin Your Sovereign Journey
          </h2>
          <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed font-medium ${
            isDark ? 'text-[#D8BE99]' : 'text-[#3A2116]'
          }`}>
            Experience the Luxury, Royal, and Classic tiers distilled and matured exclusively at the Arabian Sheikh Palace.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/shop"
            className={`w-full sm:w-auto px-10 py-4 rounded-full font-cinzel font-bold text-xs uppercase tracking-[0.25em] transition-all duration-400 shadow-lg hover:scale-105 ${
              isDark
                ? 'bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] hover:from-[#F2D675] hover:via-[#D4AF37] hover:to-[#F2D675] text-[#FFFDF8] hover:text-[#0B0A08] border border-[#F2D675]/50 shadow-[0_10px_35px_rgba(140,98,57,0.5)]'
                : 'bg-gradient-to-r from-[#2C180F] via-[#120B06] to-[#2C180F] hover:from-[#D4AF37] hover:via-[#F2D675] hover:to-[#D4AF37] text-[#FFFDF9] hover:text-[#120B06] border border-[#D4AF37]/50 shadow-[0_10px_35px_rgba(0,0,0,0.15)]'
            }`}
          >
            Enter the Sovereign Boutique
          </Link>
          <Link
            to="/discovery"
            className={`w-full sm:w-auto px-10 py-4 rounded-full font-cinzel font-bold text-xs uppercase tracking-[0.25em] transition-all duration-300 shadow-md ${
              isDark
                ? 'bg-black/60 hover:bg-[#21130D] border border-[#D4AF37]/40 hover:border-[#D4AF37] text-[#F3E6D0] hover:text-[#F2D675]'
                : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] hover:bg-white border border-[#D4AF37]/50 hover:border-[#D4AF37] text-[#120B06] hover:text-[#8C6239]'
            }`}
          >
            Fragrance Finder Quiz
          </Link>
        </div>
      </section>

    </div>
  );
}
