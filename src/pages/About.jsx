import React from 'react';
import { Link } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  Crown,
  Sparkles,
  ShieldCheck,
  Heart,
  Award,
  Gem,
  Droplets,
  MapPin,
  Clock,
  ArrowRight,
  Compass,
  CheckCircle2
} from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '../components/common/ScrollReveal';
import BlurText from '../components/common/BlurText';
import AnimatedCounter from '../components/common/AnimatedCounter';

export default function About() {
  const { t, language } = useTranslation();
  const { isDark } = useTheme();

  const stats = [
    {
      target: 46,
      suffix: '+',
      label: language === 'ar' ? 'تحفة عطرية استثنائية' : 'Haute Parfumerie Masterpieces',
      sub: language === 'ar' ? 'عطور، دهن عود، وبخور ملكي' : 'Extraits, Oils & Rare Bakhoor'
    },
    {
      target: 35,
      suffix: '%',
      label: language === 'ar' ? 'تركيز الزيوت الخالصة' : 'Pure Extrait Concentration',
      sub: language === 'ar' ? 'أعلى درجات الفوحان والثبات' : 'Uncompromising Sillage'
    },
    {
      target: 60,
      suffix: '+',
      label: language === 'ar' ? 'عاماً عمر أشجار العود' : 'Years Wild Agarwood Age',
      sub: language === 'ar' ? 'تقطير نحاسي بطيء وأصيل' : 'Slow Copper Artisanal Stills'
    },
    {
      target: 18,
      suffix: 'h+',
      label: language === 'ar' ? 'ثبات متواصل على البشرة' : 'Continuous Skin Longevity',
      sub: language === 'ar' ? 'أثر ملكي لا يُمحى' : 'Lasting Sovereign Presence'
    }
  ];

  const pillars = [
    {
      icon: Award,
      title: language === 'ar' ? 'نقاء الخلاصات الطبيعية' : 'Purity of Noble Botanicals',
      desc: language === 'ar'
        ? 'لا تنازل عن النقاء. دهن عود أسامي خالص، عنبر بحري معتق، وورد طائفي يُقطف يدوياً عند الفجر.'
        : 'Uncompromising natural authenticity. Wild Assamese agarwood, naturally aged marine ambergris, and dawn-harvested Taif roses.'
    },
    {
      icon: Heart,
      title: language === 'ar' ? 'كرم الضيافة العربية' : 'Sovereign Royal Hospitality',
      desc: language === 'ar'
        ? 'كل عميل يُعامل كضيف مبجل في قصر ملكي، مع استشارات عطرية خاصة وعينات استكشافية مجانية.'
        : 'Every patron is received as an honored palace guest with bespoke scent concierge guidance and tailored discovery vials.'
    },
    {
      icon: Gem,
      title: language === 'ar' ? 'تحف فنية تتوارثها الأجيال' : 'Heirloom Flacon Artistry',
      desc: language === 'ar'
        ? 'زجاج كريستالي ثقيل (450 جرام) مصقول يدوياً مع أغطية مذهبة بماء الذهب عيار 24 قيراط.'
        : 'Hand-sculpted 450g ultra-dense crystal flacons crowned with hand-polished 24K gold-plated stoppers.'
    },
    {
      icon: ShieldCheck,
      title: language === 'ar' ? 'شهادة أصالة وأختام مرقمة' : 'Certified Batch Authenticity',
      desc: language === 'ar'
        ? 'إصدارات محدودة مرقمة بختم شمعي أحمر وتوقيع خبير العطور الملكي لضمان خلوها من أي إضافات صناعية.'
        : 'Individually numbered batches sealed with our imperial royal wax stamp, guaranteeing 100% natural oil purity.'
    }
  ];

  const boutiques = [
    {
      city: language === 'ar' ? 'قصر دبي الرئيسي' : 'Dubai Flagship Palace',
      location: language === 'ar' ? 'داون تاون دبي، الإمارات العربية المتحدة' : 'Downtown Dubai, Boulevard Plaza',
      hours: language === 'ar' ? 'يومياً: 10:00 ص – 11:00 م' : 'Daily: 10:00 AM – 11:00 PM'
    },
    {
      city: language === 'ar' ? 'صالون لندن الخاص' : 'London Private Salon',
      location: language === 'ar' ? 'حي مايفير، لندن، المملكة المتحدة' : 'Mayfair, New Bond Street, London',
      hours: language === 'ar' ? 'الإثنين - السبت: 10:00 ص – 8:00 م' : 'Mon – Sat: 10:00 AM – 8:00 PM'
    },
    {
      city: language === 'ar' ? 'مشغل باريس الفاخر' : 'Paris Atelier de Parfum',
      location: language === 'ar' ? 'ساحة فاندوم، باريس، فرنسا' : 'Place Vendôme, Paris, France',
      hours: language === 'ar' ? 'الإثنين - السبت: 10:30 ص – 7:30 م' : 'Mon – Sat: 10:30 AM – 7:30 PM'
    },
    {
      city: language === 'ar' ? 'الجناح الملكي بالرياض' : 'Riyadh Sovereign Majlis',
      location: language === 'ar' ? 'شارع التحلية، العليا، الرياض، السعودية' : 'Tahlia Street, Al Olaya, Riyadh',
      hours: language === 'ar' ? 'يومياً: 1:00 م – 12:00 م' : 'Daily: 1:00 PM – 12:00 AM'
    }
  ];

  return (
    <div className={`space-y-24 sm:space-y-36 pb-32 animate-fade-in bg-transparent transition-colors duration-500 overflow-x-hidden ${
      isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
    }`}>
      
      {/* =========================================================================
          1. GRAND HERO BANNER
          ========================================================================= */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden pt-36 sm:pt-44 pb-20">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero_arabian_palace.jpg"
            alt="The Sovereign Palace of Arabian Sheikh"
            className="w-full h-full object-cover object-center opacity-35 scale-105"
          />
          <div className={`absolute inset-0 ${
            isDark
              ? 'bg-gradient-to-t from-[#0B0A08] via-[#0B0A08]/80 to-[#0B0A08]/90'
              : 'bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2]/80 to-[#FAF7F2]/90'
          }`} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.18)_0%,transparent_70%)] pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <ScrollReveal direction="up">
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/10 backdrop-blur-md shadow-[0_4px_20px_rgba(212,175,55,0.15)]">
              <Crown className="w-4 h-4 text-[#D4AF37]" />
              <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-[#D4AF37] font-bold">
                HIGH PERFUMERY HERITAGE • SINCE 1492
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={100}>
            <BlurText
              text={language === 'ar' ? 'دار الشيخ العربي' : 'THE HOUSE OF ARABIAN SHEIKH'}
              delay={40}
              animateBy="words"
              direction="top"
              className={`font-cinzel text-4xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-wider justify-center drop-shadow-lg ${
                isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
              }`}
              as="h1"
            />
          </ScrollReveal>

          <ScrollReveal direction="up" delay={200}>
            <p className="font-editorial italic text-xl sm:text-2xl lg:text-3xl text-[#D4AF37] max-w-3xl mx-auto leading-relaxed">
              "{t('about.subtitle')}"
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* =========================================================================
          2. MISSION NARRATIVE & ROYAL HERITAGE
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left: Mission Narrative Card */}
          <div className="lg:col-span-7">
            <ScrollReveal direction="left">
              <div className={`p-8 sm:p-12 lg:p-14 rounded-3xl transition-all duration-500 relative overflow-hidden ${
                isDark
                  ? 'bg-gradient-to-b from-[#170E09]/85 via-[#100905]/85 to-[#0B0A08]/95 border border-[#D4AF37]/30 shadow-2xl backdrop-blur-md'
                  : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border border-[#D4AF37]/60 shadow-[0_15px_40px_rgba(212,175,55,0.2)] backdrop-blur-md'
              }`}>
                {/* Subtle Luxury Corner Accent */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.2)_0%,transparent_70%)] pointer-events-none" />

                <div className="space-y-6 relative z-10">
                  <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/10">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-cinzel text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-bold">
                      {t('about.mission')}
                    </span>
                  </div>

                  <h2 className={`font-cinzel text-2xl sm:text-4xl font-bold leading-tight ${
                    isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
                  }`}>
                    {language === 'ar'
                      ? 'إعادة صياغة الفخامة العطرية بأيدي الحرفيين'
                      : 'Reinventing Haute Parfumerie with Sovereign Mastery'}
                  </h2>

                  <p className={`text-base sm:text-lg leading-relaxed font-sans ${
                    isDark ? 'text-[#E5D5C6]' : 'text-[#3A2116]'
                  }`}>
                    {t('about.missionDesc')}
                  </p>

                  <p className={`text-sm sm:text-base leading-relaxed font-sans ${
                    isDark ? 'text-[#C5A880]' : 'text-[#5A3517]'
                  }`}>
                    {language === 'ar'
                      ? 'انطلقت دار الشيخ العربي من قلب دبي برؤية ملكية تسعى لإحياء أسرار تقطير العود الأندلسي، والجمع بين نقاء التقاليد الشرقية وأدق معايير صناعة العطور الفرنسية الفاخرة. نخدم نخبة من أصحاب الذوق الرفيع وكبار الشخصيات في صالوناتنا الخاصة في دبي، لندن، باريس، والرياض.'
                      : 'Founded in Dubai with private salons spanning Mayfair London, Place Vendôme Paris, and Riyadh, Arabian Sheikh serves a distinguished international patronage who seek nothing less than absolute ingredient nobility and timeless presence.'}
                  </p>

                  {/* Highlights Bullet List */}
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      language === 'ar' ? 'خلاصات طبيعية 100% غير ممددة' : '100% Unadulterated Pure Oils',
                      language === 'ar' ? 'تعتيق يدوي في قدور النحاس' : 'Hand-Aged in Traditional Stills',
                      language === 'ar' ? 'خدمة كونسيرج واستشارات خاصة' : 'Dedicated Private Concierge',
                      language === 'ar' ? 'توصيل ملكي لكافة أنحاء العالم' : 'Bespoke Worldwide Delivery'
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                        <span className={`text-xs sm:text-sm font-cinzel font-medium ${
                          isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
                        }`}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right: Palace Heritage Imagery */}
          <div className="lg:col-span-5 relative">
            <ScrollReveal direction="right">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#D4AF37]/40 group">
                <img
                  src="/arabian_woman_palace.jpg"
                  alt="Haute Parfumerie Heritage"
                  className="w-full h-[460px] sm:h-[540px] object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                
                {/* Floating Seal Badge */}
                <div className="absolute bottom-6 inset-x-6 p-5 rounded-2xl bg-black/65 backdrop-blur-md border border-[#D4AF37]/40 text-center space-y-1 shadow-lg">
                  <span className="font-cinzel text-[11px] uppercase tracking-[0.25em] text-[#D4AF37] font-bold block">
                    {language === 'ar' ? 'صياغة عطرية استثنائية' : 'MASTER OF ARABIAN ESSENCES'}
                  </span>
                  <p className="text-xs text-[#F3E6D0] font-sans font-medium">
                    {language === 'ar'
                      ? 'تركيز استثنائي 35% لإطلالة تدوم أكثر من 18 ساعة'
                      : 'Extrait de Parfum 35% Concentration • 18+ Hours Longevity'}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>

        </div>
      </section>

      {/* =========================================================================
          4. STATS COUNTERS (The Maison in Numbers)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className={`p-8 sm:p-12 rounded-3xl transition-all duration-500 border ${
            isDark
              ? 'bg-gradient-to-r from-[#170E09]/90 via-[#120B06]/90 to-[#170E09]/90 border-[#D4AF37]/30 shadow-2xl'
              : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/50 shadow-[0_15px_35px_rgba(212,175,55,0.18)]'
          }`}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 divide-y sm:divide-y-0 sm:divide-x divide-[#D4AF37]/20 rtl:divide-x-reverse">
              {stats.map((st, i) => (
                <div key={i} className="text-center space-y-2 pt-6 sm:pt-0">
                  <div className="font-cinzel text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#D4AF37] tracking-tight">
                    <AnimatedCounter
                      target={st.target}
                      suffix={st.suffix}
                      duration={1800}
                    />
                  </div>
                  <div className={`font-cinzel text-sm sm:text-base font-bold uppercase tracking-wider ${
                    isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
                  }`}>
                    {st.label}
                  </div>
                  <div className={`text-xs font-sans ${
                    isDark ? 'text-[#C5A880]' : 'text-[#5A3517]'
                  }`}>
                    {st.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* =========================================================================
          5. GUIDING PILLARS & CORE VALUES
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <ScrollReveal direction="up">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-[#D4AF37] font-bold">
              OUR SACRED PILLARS
            </span>
            <h2 className={`font-cinzel text-3xl sm:text-5xl font-bold uppercase tracking-wider ${
              isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
            }`}>
              {t('about.values')}
            </h2>
            <div className="w-24 h-0.5 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mt-4" />
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {pillars.map((p, idx) => {
            const IconComponent = p.icon;
            return (
              <ScrollRevealItem key={idx} index={idx}>
                <div className={`p-8 rounded-3xl transition-all duration-400 h-full flex flex-col justify-between group relative overflow-hidden ${
                  isDark
                    ? 'bg-gradient-to-b from-[#170E09]/80 via-[#100905]/80 to-[#0B0A08]/90 border border-[#D4AF37]/25 shadow-xl hover:border-[#D4AF37]/60 hover:shadow-[0_15px_30px_rgba(212,175,55,0.15)]'
                    : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border border-[#D4AF37]/50 shadow-[0_12px_32px_rgba(212,175,55,0.18)] hover:shadow-[0_18px_45px_rgba(212,175,55,0.3)]'
                }`}>
                  {/* Top Golden Light Flare */}
                  <div className="absolute top-0 right-0 w-28 h-28 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.15)_0%,transparent_70%)] pointer-events-none" />

                  <div className="space-y-4 relative z-10">
                    <div className="w-14 h-14 rounded-2xl border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] bg-[#D4AF37]/10 group-hover:scale-110 group-hover:border-[#D4AF37] transition-transform duration-400">
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <h3 className={`font-cinzel text-lg font-bold uppercase tracking-wider ${
                      isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
                    }`}>
                      {p.title}
                    </h3>

                    <p className={`text-xs sm:text-sm leading-relaxed font-sans ${
                      isDark ? 'text-[#C5A880]' : 'text-[#5A3517]'
                    }`}>
                      {p.desc}
                    </p>
                  </div>
                </div>
              </ScrollRevealItem>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          6. GLOBAL BOUTIQUES & SALONS
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <ScrollReveal direction="up">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="font-cinzel text-xs uppercase tracking-[0.35em] text-[#D4AF37] font-bold">
              WORLDWIDE SANCTUARIES
            </span>
            <h2 className={`font-cinzel text-3xl sm:text-5xl font-bold uppercase tracking-wider ${
              isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
            }`}>
              {language === 'ar' ? 'الصالونات والبوتيكات الملكية' : 'Private Salons & Boutiques'}
            </h2>
            <p className={`text-sm sm:text-base font-sans max-w-2xl mx-auto ${
              isDark ? 'text-[#C5A880]' : 'text-[#5A3517]'
            }`}>
              {language === 'ar'
                ? 'استمتع بتجربة استكشاف عطري خاصة في أحد صالوناتنا المجهزة لاستقبال كبار الضيوف.'
                : 'Experience private olfactory consultations tailored for distinguished dignitaries and fragrance patrons.'}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {boutiques.map((b, idx) => (
            <ScrollRevealItem key={idx} index={idx}>
              <div className={`p-6 sm:p-7 rounded-3xl transition-all duration-400 h-full flex flex-col justify-between space-y-4 border ${
                isDark
                  ? 'bg-[#140D07]/80 border-[#D4AF37]/25 hover:border-[#D4AF37]/60 shadow-lg'
                  : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/50 shadow-[0_10px_25px_rgba(212,175,55,0.15)] hover:shadow-[0_15px_35px_rgba(212,175,55,0.25)]'
              }`}>
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] bg-[#D4AF37]/10">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h4 className={`font-cinzel text-base font-bold uppercase tracking-wide ${
                    isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
                  }`}>
                    {b.city}
                  </h4>
                  <p className={`text-xs font-sans leading-relaxed ${
                    isDark ? 'text-[#C5A880]' : 'text-[#5A3517]'
                  }`}>
                    {b.location}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#D4AF37]/20 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  <span className={`text-[11px] font-sans ${
                    isDark ? 'text-[#E5D5C6]' : 'text-[#3A2116]'
                  }`}>
                    {b.hours}
                  </span>
                </div>
              </div>
            </ScrollRevealItem>
          ))}
        </div>
      </section>

      {/* =========================================================================
          7. INVITATION CTA (Explore the Palace & Collection)
          ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className={`p-10 sm:p-16 rounded-3xl text-center space-y-8 relative overflow-hidden border ${
            isDark
              ? 'bg-gradient-to-b from-[#1C120B] via-[#120A05] to-[#0B0A08] border-[#D4AF37]/40 shadow-2xl'
              : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/60 shadow-[0_20px_50px_rgba(212,175,55,0.25)]'
          }`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15)_0%,transparent_70%)] pointer-events-none" />

            <div className="space-y-4 relative z-10 max-w-3xl mx-auto">
              <Crown className="w-8 h-8 text-[#D4AF37] mx-auto" />
              <h2 className={`font-cinzel text-3xl sm:text-5xl font-bold uppercase tracking-wider ${
                isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
              }`}>
                {language === 'ar' ? 'انضم إلى موكب الفخامة الملكية' : 'Enter the Sovereign Realm'}
              </h2>
              <p className={`text-base sm:text-lg font-editorial italic max-w-2xl mx-auto ${
                isDark ? 'text-[#E5D5C6]' : 'text-[#3A2116]'
              }`}>
                {language === 'ar'
                  ? 'اكتشف مجموعتنا الكاملة من العطور المستخلصة، دهن العود النادر، وتوليفات البخور الاستثنائية.'
                  : 'Explore our complete treasury of pure extraits, precious agarwood oils, and royal incense rituals.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 relative z-10">
              <Link
                to="/shop"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-cinzel font-bold text-xs uppercase tracking-[0.2em] bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#D4AF37] text-[#0B0A08] shadow-[0_10px_30px_rgba(212,175,55,0.4)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.6)] hover:scale-105 transition-all duration-300"
              >
                <span>{language === 'ar' ? 'تسوق المجموعة الملكية' : 'EXPLORE COLLECTION'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>

              <Link
                to="/the-palace"
                className={`inline-flex items-center gap-3 px-8 py-4 rounded-full font-cinzel font-bold text-xs uppercase tracking-[0.2em] border transition-all duration-300 ${
                  isDark
                    ? 'border-[#D4AF37]/50 text-[#F3E6D0] hover:bg-[#D4AF37]/10'
                    : 'border-[#3A2116]/50 text-[#120B06] hover:bg-[#3A2116]/10'
                }`}
              >
                <span>{language === 'ar' ? 'جولة في القصر' : 'TOUR THE PALACE'}</span>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

    </div>
  );
}

