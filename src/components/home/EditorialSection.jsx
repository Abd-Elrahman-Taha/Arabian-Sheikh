import React from 'react';
import { Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '../common/ScrollReveal';

export default function EditorialSection() {
  const { language } = useTranslation();
  const isArabic = language === 'ar';
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  const EDITORIAL_TILES = [
    {
      id: 'alchemist',
      tagEn: 'THE OLFACTORY ALCHEMIST',
      tagAr: 'حكاية العطر',
      titleEn: 'Four Decades of Master Distillation',
      titleAr: 'حكيم العطور وسر الخلطات',
      descEn: 'Four decades of mastering rare agarwood resins, copper alembic distillation, and royal maturation.',
      descAr: 'أربعة عقود من إتقان تقطير أندر أخشاب العود البري في المعوجات النحاسية والتعتيق الملكي في قوارير معتمة.',
      ctaEn: 'Explore Heritage',
      ctaAr: 'اكتشف الحرفة',
      image: '/editorial/master_alchemist.jpg',
      link: '/the-house'
    },
    {
      id: 'flacon-alchemy',
      tagEn: 'THE FLACON ALCHEMY',
      tagAr: 'صُنِعَ ليبقى',
      titleEn: 'Crystal & Gold Precision',
      titleAr: 'كيمياء القارورة ودقة الكريستال',
      descEn: 'Hand-blown ultra-dense crystal topped with solid 24k gold-plated zamak calligraphy caps.',
      descAr: 'كريستال مدخن عالي الكثافة مصبوب يدوياً ومتوج بتاج من الزاماك المطلي بذهب عيار ٢٤ ونقوش الخط العربي.',
      ctaEn: 'Discover Design',
      ctaAr: 'استكشف التصميم',
      image: '/editorial/flacon_craftsmanship.jpg',
      link: '/the-house'
    },
    {
      id: 'monograph',
      tagEn: 'THE MONOGRAPH',
      tagAr: 'من الشرق إلى العالم',
      titleEn: 'Centuries of Royal Craft',
      titleAr: 'سجل التراث والمسار التاريخي',
      descEn: 'Archival records of sovereign royal blends, incense trade routes, and sacred Arabian majlis rituals.',
      descAr: 'مخطوطات أرشيفية توثق خلطات الملوك ومسارات قوافل البخور وطريق الحرير عبر القرون.',
      ctaEn: 'Read Monograph',
      ctaAr: 'قراءة التاريخ',
      image: '/editorial/imperial_monograph.jpg',
      link: '/the-house'
    }
  ];

  return (
    <section className="py-16 sm:py-24 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 select-none">
      
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-2">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.28em] text-[#C9A15C]">
            {isArabic ? 'الإصدارات التوثيقية' : 'EDITORIAL ARCHIVE'}
          </span>
          <h2 className="font-arabic font-light text-2xl sm:text-4xl text-[#F4F1EA] tracking-wide">
            {isArabic ? 'كيمياء الإتقان والتراث' : 'Craftsmanship, Alchemy & Heritage'}
          </h2>
        </div>
        <p className="text-xs text-[#8E8880] max-w-sm font-sans">
          {isArabic
            ? 'نظرة معمقة داخل كواليس المشاغل الملكية ودفاتر الوصفات السرية لدار سَـراب.'
            : 'An intimate chronicle of our private ateliers, rare extractions, and sacred royal formulations.'}
        </p>
      </div>

      {/* 3 Editorial Spread Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {EDITORIAL_TILES.map((tile, index) => (
          <ScrollRevealItem key={tile.id} index={index}>
            <Link
              to={tile.link}
              className="group block relative h-[460px] sm:h-[520px] lg:h-[560px] rounded-3xl overflow-hidden bg-[#0D0C0A] border border-white/[0.08] shadow-2xl transition-all duration-500 hover:border-[#C9A15C]/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
              data-cursor="view"
            >
              {/* Image with 1.04x smooth zoom */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={tile.image}
                  alt={isArabic ? tile.titleAr : tile.titleEn}
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Dark Luxury Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/45 to-transparent" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />

              {/* Top Tag Pill */}
              <div className="absolute top-6 start-6 z-10">
                <span className="px-3.5 py-1 rounded-full border border-white/20 bg-black/50 backdrop-blur-md text-[10px] font-sans font-bold uppercase tracking-[0.22em] text-[#E5C07B] shadow-sm">
                  {isArabic ? tile.tagAr : tile.tagEn}
                </span>
              </div>

              {/* Bottom Content Area */}
              <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 space-y-2.5 z-10">
                <span className="text-[10px] uppercase font-sans font-bold tracking-[0.25em] text-[#C9A15C]">
                  {isArabic ? tile.tagEn : tile.tagAr}
                </span>
                
                <h3 className="font-arabic font-semibold text-xl sm:text-2xl text-[#F4F1EA] tracking-wide leading-tight group-hover:text-[#E5C07B] transition-colors">
                  {isArabic ? tile.titleAr : tile.titleEn}
                </h3>
                
                <p className="text-xs text-[#8E8880] line-clamp-2 leading-relaxed font-sans font-normal">
                  {isArabic ? tile.descAr : tile.descEn}
                </p>

                {/* Elegant Arrow CTA */}
                <div className="pt-3 flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-wider text-[#C9A15C] group-hover:text-[#E6C587] transition-all">
                  <span>{isArabic ? tile.ctaAr : tile.ctaEn}</span>
                  <ArrowIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-[-4px] rtl:group-hover:translate-x-[-4px]" />
                </div>
              </div>
            </Link>
          </ScrollRevealItem>
        ))}
      </div>

    </section>
  );
}
