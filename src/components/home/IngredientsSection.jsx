import React, { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { Sparkles, Droplet, Flame, Compass } from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '../common/ScrollReveal';

export default function IngredientsSection({ onSelectIngredient }) {
  const { language } = useTranslation();
  const isArabic = language === 'ar';
  const [activeIngredientIndex, setActiveIngredientIndex] = useState(0);

  const INGREDIENTS = [
    {
      id: 'oud',
      nameEn: 'Aged Assamese Oud',
      nameAr: 'العود الأسامي المعتق',
      originEn: 'Assam, India • 40-Year Vintage',
      originAr: 'غابات أسام، الهند • معتق ٤٠ عاماً',
      categoryEn: 'SACRED WOOD',
      categoryAr: 'الأخشاب المقدسة',
      descEn: 'Harvested from century-old wild Aquilaria trees. Distilled through slow-fire copper stills to yield a dark, balsamic, smoky resonance.',
      descAr: 'يُستخلص من أقدم أشجار العود البري المعمرة، ويُقطر في معوجات نحاسية عتيقة على نار هادئة ليعطي نغمة خشبية بلسمية دخانية مهيبة.',
      notesEn: ['Smoky Leather', 'Balsamic Bark', 'Sacred Incense'],
      notesAr: ['جلد مدخن', 'لحاء بلسمي', 'بخور المعابد'],
      image: '/ingredients/ingredient_oud.jpg',
      colorGlow: 'rgba(201,161,92,0.35)'
    },
    {
      id: 'saffron',
      nameEn: 'Royal Kashmiri Saffron',
      nameAr: 'الزعفران الكشميري الملكي',
      originEn: 'Pampore Highlands • Grade 1 Mogra',
      originAr: 'مرتفعات بامبور • درجة أولى نقية',
      categoryEn: 'ROYAL SPICE',
      categoryAr: 'التوابل الملكية',
      descEn: 'The rarest crimson threads hand-picked at dawn. Imparts a warm golden radiance, bittersweet aristocratic spice, and velvety warmth.',
      descAr: 'مياسم قرمزية نقية تُقطف يدوياً مع بواكير الفجر، تمنح العطر إشعاعاً ذهبياً دافئاً ونفحة توابل أرستقراطية حلوة ومرة.',
      notesEn: ['Golden Radiance', 'Velvety Spice', 'Aristocratic Warmth'],
      notesAr: ['إشراق ذهبي', 'توابل مخملية', 'دفء أرستقراطي'],
      image: '/ingredients/ingredient_saffron.jpg',
      colorGlow: 'rgba(217,119,6,0.35)'
    },
    {
      id: 'amber',
      nameEn: 'Fossilized Grey Amber',
      nameAr: 'العنبر الرمادي الصافي',
      originEn: 'Arabian Sea Coasts • Cured Resins',
      originAr: 'سواحل بحر العرب • معتق بالشمس والملح',
      categoryEn: 'ANCIENT RESIN',
      categoryAr: 'الصموغ الخالدة',
      descEn: 'Cured for decades by ocean tides and desert sun. Releases a marine, sweet balsamic nectar that anchors the fragrance for days.',
      descAr: 'صمغ نقي صقلته أمواج المحيط وشمس الصحراء لعقود، ليفيض بنغمات بحرية بلسمية حلوة تُثبت الأثر العطري لأيام طويلة.',
      notesEn: ['Oceanic Balsam', 'Warm Honeycomb', 'Fossilized Mineral'],
      notesAr: ['بلسم بحري', 'شمع العسل الدافئ', 'معادن حجرية'],
      image: '/ingredients/ingredient_amber.jpg',
      colorGlow: 'rgba(245,158,11,0.35)'
    },
    {
      id: 'rose-musk',
      nameEn: 'Taif Rose & White Musk',
      nameAr: 'ورد الطائف والمسك النقي',
      originEn: 'Al-Hada Peaks • Morning Dew Harvest',
      originAr: 'قمم الهدا، الطائف • قطاف الندى الفجري',
      categoryEn: 'NOBLE FLORA',
      categoryAr: 'الأزهار النبيلة',
      descEn: 'Thirty pristine petals distilled for every single crystal drop, cradled in soft velvet white musk for unparalleled royal sillage.',
      descAr: 'ثلاثون بتلة قطفت مع الندى الفجري في قمم الطائف لكل قطرة كريستالية واحدة، ممزوجة بمسك أبيض مخملي لا يُضاهى.',
      notesEn: ['Mountain Mist', 'Petal Nectar', 'Silk White Musk'],
      notesAr: ['ندى الجبال', 'رحيق البتلات', 'مسك الحرير الأبيض'],
      image: '/ingredients/ingredient_rose_musk.jpg',
      colorGlow: 'rgba(244,114,182,0.30)'
    }
  ];

  const currentIng = INGREDIENTS[activeIngredientIndex];

  return (
    <section id="ingredients" className="py-20 sm:py-28 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative select-none">
      
      {/* Background Subtle Amber Atmosphere */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none transition-colors duration-1000 -z-10"
        style={{ background: currentIng.colorGlow }}
      />

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
        <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
          {isArabic ? 'المصادر والتقطير النقي' : 'RAW NOBLE INGREDIENTS'}
        </span>
        <h2 className="font-arabic font-light text-3xl sm:text-5xl text-[#F3E6D0] tracking-wide">
          {isArabic ? 'أندر خلاصات الشرق الطبيعية' : 'The Four Sacred Arabian Essences'}
        </h2>
        <p className="text-xs sm:text-sm text-[#D8BE99] leading-relaxed font-sans">
          {isArabic
            ? 'لا نستخدم المركبات الصناعية. كل نوتة عطرية في دار سَـراب تُستخلص من مصادر برية معمرة ومزارع ملكية خاصة.'
            : 'Uncompromising purity. Every botanical resin and distilled drop is sourced sustainably from ancient wild reserves.'}
        </p>
      </div>

      {/* 4 Ingredients Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Big Showcase Card */}
        <div className="lg:col-span-7">
          <div className="relative h-[380px] sm:h-[480px] lg:h-[540px] rounded-3xl overflow-hidden bg-[#0B0A08] border border-white/[0.12] shadow-2xl group">
            
            <img
              src={currentIng.image}
              alt={isArabic ? currentIng.nameAr : currentIng.nameEn}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A08] via-[#0B0A08]/40 to-transparent" />

            {/* Inset Metadata */}
            <div className="absolute top-6 start-6 z-10 flex items-center gap-2">
              <span className="px-3.5 py-1 rounded-full border border-white/20 bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold tracking-widest text-[#F2D675] uppercase">
                {isArabic ? currentIng.categoryAr : currentIng.categoryEn}
              </span>
            </div>

            {/* Bottom Content Card */}
            <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 space-y-3 z-10">
              <div className="flex items-center gap-2 text-xs font-mono text-[#D4AF37]">
                <Compass className="w-3.5 h-3.5" />
                <span>{isArabic ? currentIng.originAr : currentIng.originEn}</span>
              </div>
              
              <h3 className="font-arabic font-bold text-2xl sm:text-3xl text-[#F3E6D0]">
                {isArabic ? currentIng.nameAr : currentIng.nameEn}
              </h3>
              
              <p className="text-xs sm:text-sm text-[#D8BE99] max-w-xl leading-relaxed font-sans">
                {isArabic ? currentIng.descAr : currentIng.descEn}
              </p>

              {/* Olfactory Tags */}
              <div className="pt-2 flex flex-wrap gap-2">
                {(isArabic ? currentIng.notesAr : currentIng.notesEn).map((note, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-white/[0.08] border border-white/10 text-[10px] font-sans font-medium text-[#F3E6D0]"
                  >
                    ✦ {note}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: 4 Selectable Item List */}
        <div className="lg:col-span-5 space-y-3">
          {INGREDIENTS.map((ing, idx) => {
            const isActive = activeIngredientIndex === idx;
            return (
              <button
                key={ing.id}
                onClick={() => {
                  setActiveIngredientIndex(idx);
                  if (onSelectIngredient) onSelectIngredient(ing);
                }}
                className={`w-full text-start p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer group ${
                  isActive
                    ? 'bg-[#21130D] border-[#D4AF37] shadow-[0_8px_30px_rgba(201,161,92,0.2)]'
                    : 'bg-[#0B0A08]/70 border-white/[0.06] hover:border-white/20 hover:bg-[#0B0A08]'
                }`}
                data-cursor="view"
              >
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/10">
                    <img
                      src={ing.image}
                      alt={isArabic ? ing.nameAr : ing.nameEn}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono tracking-widest text-[#D8BE99] uppercase block">
                      {isArabic ? ing.categoryAr : ing.categoryEn}
                    </span>
                    <h4
                      className={`font-arabic text-base sm:text-lg font-bold transition-colors ${
                        isActive ? 'text-[#D4AF37]' : 'text-[#F3E6D0] group-hover:text-[#F2D675]'
                      }`}
                    >
                      {isArabic ? ing.nameAr : ing.nameEn}
                    </h4>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-colors ${
                    isActive
                      ? 'border-[#D4AF37] bg-[#D4AF37] text-[#0B0A08] font-bold'
                      : 'border-white/20 text-[#D8BE99] group-hover:border-white/40'
                  }`}
                >
                  {idx + 1}
                </div>
              </button>
            );
          })}
        </div>

      </div>

    </section>
  );
}
