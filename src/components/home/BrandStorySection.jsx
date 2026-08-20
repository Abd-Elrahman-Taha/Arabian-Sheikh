import React from 'react';
import { Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { Sparkles, Crown, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '../common/ScrollReveal';

export default function BrandStorySection() {
  const { language } = useTranslation();
  const isArabic = language === 'ar';
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  return (
    <section className="py-24 sm:py-36 border-y border-white/[0.06] bg-[#0B0A08] relative overflow-hidden select-none">
      
      {/* Background Soft Gold Spotlight */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle_at_center,rgba(201,161,92,0.07)_0%,transparent_70%)] blur-3xl pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-center">
          
          {/* Main Huge Typography Statement (Left in LTR / Right in RTL) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            
            <div className="flex items-center gap-3">
              <span className="w-8 h-[1px] bg-[#D4AF37]" />
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                {isArabic ? 'بيان الدار والتراث' : 'THE HOUSE MANIFESTO'}
              </span>
            </div>

            {/* Giant Arabic / Latin Headline */}
            <h2 className="font-arabic font-extralight text-4xl sm:text-6xl lg:text-7xl text-[#F3E6D0] leading-[1.15] tracking-tight">
              {isArabic ? (
                <>
                  مِنْ قَلْبِ الشَّرْق، <br />
                  <span className="font-bold text-[#F2D675] italic">نَصُوغُ أَثَراً</span> لَا يُنْسَى.
                </>
              ) : (
                <>
                  FROM THE HEART OF ARABIA, <br />
                  <span className="font-bold text-[#F2D675] italic">WE CRAFT AN UNFORGETTABLE</span> PRESENCE.
                </>
              )}
            </h2>

            {/* Craftsmanship Paragraph with High Line-Height */}
            <p className="font-sans font-light text-sm sm:text-base text-[#D8BE99] max-w-2xl leading-[1.9]">
              {isArabic
                ? 'تأسست دار سَـراب على عقيدة واحدة: إعادة تعريف العطور الشرقية النادرة من خلال المزج بين الحرفية السويسرية الدقيقة وكيمياء التقطير العربية المتوارثة عبر أربعة عقود. لا نساوم على نقاء المكونات؛ فكل قطرة تُعتّق في ظلمات الخزائن الحجرية لتصبح تحفة حسية تدوم طويلاً.'
                : 'Founded on an unyielding belief: to distill the rarest Arabian wild woods and fossilized ambers through the lens of modern Swiss precision. Every flacon is an individually numbered monument to patience, craftsmanship, and timeless aristocracy.'}
            </p>

            {/* Link to Full Monograph */}
            <div className="pt-4">
              <Link
                to="/the-house"
                className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 hover:bg-[#D4AF37] hover:text-[#0B0A08] text-[#F2D675] text-xs font-sans font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-lg group hover:scale-105"
                data-cursor="explore"
              >
                <span>{isArabic ? 'قراءة سجل التراث الكامل' : 'DISCOVER THE MONOGRAPH'}</span>
                <ArrowIcon className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </Link>
            </div>

          </div>

          {/* Right Column: Architectural Heritage Stats & Monogram Frame */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="p-8 sm:p-10 rounded-3xl bg-[#0B0A08] border border-white/[0.08] shadow-2xl relative overflow-hidden">
              
              {/* Background Arabic Calligraphy Watermark */}
              <div className="absolute -bottom-10 -end-6 text-8xl font-arabic font-bold text-white/[0.02] pointer-events-none select-none">
                سَـراب
              </div>

              <div className="space-y-6 relative z-10">
                
                <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
                  <Crown className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-xs font-sans font-bold uppercase tracking-widest text-[#F3E6D0]">
                    {isArabic ? 'معايير النقاء الملكي' : 'ROYAL PURITY STANDARDS'}
                  </span>
                </div>

                {/* 3 Key Heritage Metrics */}
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <span className="text-3xl sm:text-4xl font-mono font-bold text-[#D4AF37] block">
                      38%
                    </span>
                    <span className="text-xs font-sans text-[#F3E6D0] font-semibold block mt-0.5">
                      {isArabic ? 'تركيز الزيت العطري الخالص (Extrait)' : 'Pure Oil Concentration'}
                    </span>
                    <span className="text-[11px] text-[#D8BE99] block">
                      {isArabic ? 'ثبات يدوم لأكثر من 48 ساعة على الأقمشة' : 'Guaranteed 48+ hour royal trail'}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-white/[0.06]">
                    <span className="text-3xl sm:text-4xl font-mono font-bold text-[#D4AF37] block">
                      40+
                    </span>
                    <span className="text-xs font-sans text-[#F3E6D0] font-semibold block mt-0.5">
                      {isArabic ? 'عاماً من تعتيق أخشاب العود' : 'Years of Agarwood Maturation'}
                    </span>
                    <span className="text-[11px] text-[#D8BE99] block">
                      {isArabic ? 'مخزون خاص من غابات أسام المحمية' : 'Sourced from private protected wild reserves'}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-white/[0.06]">
                    <span className="text-3xl sm:text-4xl font-mono font-bold text-[#D4AF37] block">
                      24K
                    </span>
                    <span className="text-xs font-sans text-[#F3E6D0] font-semibold block mt-0.5">
                      {isArabic ? 'ذهب خالص مطلي على التيجان' : 'Pure Gold Plated Flacon Crowns'}
                    </span>
                    <span className="text-[11px] text-[#D8BE99] block">
                      {isArabic ? 'صناعة كريستالية يدوية بالكامل' : 'Hand-blown heavy crystal precision'}
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>

    </section>
  );
}
