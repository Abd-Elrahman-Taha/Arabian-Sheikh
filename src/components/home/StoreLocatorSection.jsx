import React, { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { MapPin, Phone, Clock, Calendar, Check, ArrowUpRight, X } from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '../common/ScrollReveal';

export default function StoreLocatorSection() {
  const { language } = useTranslation();
  const isArabic = language === 'ar';
  const [selectedCityId, setSelectedCityId] = useState('riyadh');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', date: '', time: 'evening' });

  const BOUTIQUES = [
    {
      id: 'riyadh',
      cityEn: 'Riyadh',
      cityAr: 'الرياض',
      mallEn: 'Centria Mall • Al Olaya',
      mallAr: 'سنتريا مول • التحلية والعليا',
      addressEn: 'Ground Floor, Luxury Wing • Riyadh, KSA',
      addressAr: 'الطابق الأرضي، جناح الفخامة • الرياض',
      hoursEn: 'Sat - Thu: 10:00 AM – 11:00 PM | Fri: 2:00 PM – 11:30 PM',
      hoursAr: 'السبت - الخميس: ١٠:٠٠ ص – ١١:٠٠ م | الجمعة: ٢:٠٠ م – ١١:٣٠ م',
      phone: '+966 11 462 8899',
      lat: '24.7136',
      lng: '46.6753'
    },
    {
      id: 'dubai',
      cityEn: 'Dubai',
      cityAr: 'دبي',
      mallEn: 'The Dubai Mall • Fashion Avenue',
      mallAr: 'دبي مول • فاشن أفينيو',
      addressEn: 'Level 1, Private Fragrance Suites • Dubai, UAE',
      addressAr: 'المستوى الأول، أجنحة العطور الخاصة • دبي',
      hoursEn: 'Mon - Sun: 10:00 AM – Midnight',
      hoursAr: 'يومياً: ١٠:٠٠ ص – منتصف الليل',
      phone: '+971 4 362 7500',
      lat: '25.1972',
      lng: '55.2744'
    },
    {
      id: 'doha',
      cityEn: 'Doha',
      cityAr: 'الدوحة',
      mallEn: 'Place Vendôme • Lusail',
      mallAr: 'بلاس فاندوم • لوسيل',
      addressEn: 'Canal Level, Luxury Piazza • Doha, Qatar',
      addressAr: 'مستوى القناة المائية، الجناح الفاخر • الدوحة',
      hoursEn: 'Sat - Wed: 10:00 AM – 10:00 PM | Thu - Fri: 10:00 AM – Midnight',
      hoursAr: 'السبت - الأربعاء: ١٠:٠٠ ص – ١٠:٠٠ م | الخميس والجمعة حتى منتصف الليل',
      phone: '+974 4486 3322',
      lat: '25.4093',
      lng: '51.5273'
    },
    {
      id: 'kuwait',
      cityEn: 'Kuwait',
      cityAr: 'الكويت',
      mallEn: 'The Avenues • Prestige District',
      mallAr: 'مجمع الأفنيوز • منطقة برستيج',
      addressEn: 'Prestige Boulevard • Kuwait City',
      addressAr: 'بوليفارد برستيج • مدينة الكويت',
      hoursEn: 'Daily: 10:00 AM – 11:00 PM',
      hoursAr: 'يومياً: ١٠:٠٠ ص – ١١:٠٠ م',
      phone: '+965 2259 7000',
      lat: '29.3080',
      lng: '47.9350'
    },
    {
      id: 'abudhabi',
      cityEn: 'Abu Dhabi',
      cityAr: 'أبوظبي',
      mallEn: 'The Galleria • Al Maryah Island',
      mallAr: 'غاليريا مول • جزيرة الماريه',
      addressEn: 'Concourse Level • Abu Dhabi, UAE',
      addressAr: 'المستوى الرئيسي • أبوظبي',
      hoursEn: 'Sun - Thu: 10:00 AM – 10:00 PM | Fri - Sat: 10:00 AM – Midnight',
      hoursAr: 'الأحد - الخميس: ١٠:٠٠ ص – ١٠:٠٠ م | نهاية الأسبوع حتى منتصف الليل',
      phone: '+971 2 493 7400',
      lat: '24.4984',
      lng: '54.3888'
    },
    {
      id: 'paris',
      cityEn: 'Paris',
      cityAr: 'باريس',
      mallEn: '12 Place Vendôme',
      mallAr: 'ساحة فاندوم ١٢',
      addressEn: '12 Place Vendôme, 75001 Paris, France',
      addressAr: '١٢ ساحة فاندوم، ٧٥٠٠١ باريس، فرنسا',
      hoursEn: 'Mon - Sat: 10:30 AM – 7:30 PM (Private Salon by Appointment)',
      hoursAr: 'الاثنين - السبت: ١٠:٣٠ ص – ٧:٣٠ م (الصالون الخاص بالمواعيد)',
      phone: '+33 1 42 61 50 00',
      lat: '48.8675',
      lng: '2.3294'
    }
  ];

  const currentBoutique = BOUTIQUES.find(b => b.id === selectedCityId) || BOUTIQUES[0];

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingModalOpen(false);
      setBookingSuccess(false);
      setFormData({ name: '', phone: '', email: '', date: '', time: 'evening' });
    }, 2000);
  };

  return (
    <section id="boutiques" className="py-20 sm:py-32 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-2">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.28em] text-[#C9A15C]">
            {isArabic ? 'الصالونات والبوتيكات الملكية' : 'HAUTE FLAGSHIP BOUTIQUES'}
          </span>
          <h2 className="font-arabic font-light text-2xl sm:text-4xl text-[#F4F1EA] tracking-wide">
            {isArabic ? 'عواصم الفخامة العالمية' : 'Experience the Scents in Person'}
          </h2>
        </div>
        <p className="text-xs text-[#8E8880] max-w-sm font-sans">
          {isArabic
            ? 'تفضل بزيارة صالوناتنا الخاصة لتجربة طقوس التبخير الملكية وجلسات التقييم العطري المصممة خصيصاً لك.'
            : 'Visit our private salons for bespoke olfactory consultations and private flacon allocations.'}
        </p>
      </div>

      {/* Main Boutiques Grid: City Selector Tabs + Boutique Card + Dark Luxury Map Treatment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: 6 City Selector Buttons */}
        <div className="lg:col-span-4 flex flex-col gap-2">
          {BOUTIQUES.map((b) => {
            const isActive = selectedCityId === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setSelectedCityId(b.id)}
                className={`w-full text-start p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer group ${
                  isActive
                    ? 'bg-[#141210] border-[#C9A15C] shadow-[0_4px_25px_rgba(201,161,92,0.2)]'
                    : 'bg-[#0A0A09]/60 border-white/[0.06] hover:border-white/20 hover:bg-[#100F0D]'
                }`}
                data-cursor="view"
              >
                <div>
                  <h4
                    className={`font-arabic text-lg sm:text-xl font-bold transition-colors ${
                      isActive ? 'text-[#C9A15C]' : 'text-[#F4F1EA] group-hover:text-[#E5C07B]'
                    }`}
                  >
                    {isArabic ? b.cityAr : b.cityEn}
                  </h4>
                  <p className="text-xs text-[#8E8880] font-sans mt-0.5">
                    {isArabic ? b.mallAr : b.mallEn}
                  </p>
                </div>
                <div
                  className={`w-2 h-2 rounded-full transition-all ${
                    isActive ? 'bg-[#C9A15C] shadow-[0_0_8px_#C9A15C]' : 'bg-white/20'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Right Column: Selected Boutique Details & Dark Minimalist Map Card */}
        <div className="lg:col-span-8 bg-[#0D0C0A] border border-white/[0.08] rounded-3xl p-6 sm:p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          
          {/* Subtle Dark Luxury Architectural Lines Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#C9A15C_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

          {/* Top Boutique Info */}
          <div className="space-y-6 relative z-10">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
              <div>
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#C9A15C]">
                  {isArabic ? 'الصالون المعتمد' : 'FLAGSHIP SALON'}
                </span>
                <h3 className="font-arabic font-bold text-2xl sm:text-3xl text-[#F4F1EA] mt-1">
                  {isArabic ? currentBoutique.cityAr : currentBoutique.cityEn} — {isArabic ? currentBoutique.mallAr : currentBoutique.mallEn}
                </h3>
              </div>

              {/* Booking Button */}
              <button
                onClick={() => setBookingModalOpen(true)}
                className="px-6 py-3 rounded-full bg-[#C9A15C] hover:bg-[#E5C07B] text-[#050505] font-sans text-xs font-bold uppercase tracking-[0.18em] transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                data-cursor="view"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{isArabic ? 'حجز موعد استشارة خاصة' : 'Book Private Appointment'}</span>
              </button>
            </div>

            {/* Info Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              
              <div className="flex items-start gap-3.5 text-xs text-[#C8C2BA]">
                <MapPin className="w-4 h-4 text-[#C9A15C] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#8E8880] uppercase tracking-wider text-[10px] font-sans block">
                    {isArabic ? 'العنوان' : 'ADDRESS'}
                  </span>
                  <p className="font-sans font-medium text-sm text-[#F4F1EA] mt-0.5">
                    {isArabic ? currentBoutique.addressAr : currentBoutique.addressEn}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-xs text-[#C8C2BA]">
                <Clock className="w-4 h-4 text-[#C9A15C] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#8E8880] uppercase tracking-wider text-[10px] font-sans block">
                    {isArabic ? 'ساعات العمل' : 'OPENING HOURS'}
                  </span>
                  <p className="font-sans font-medium text-xs text-[#F4F1EA] mt-0.5">
                    {isArabic ? currentBoutique.hoursAr : currentBoutique.hoursEn}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-xs text-[#C8C2BA]">
                <Phone className="w-4 h-4 text-[#C9A15C] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#8E8880] uppercase tracking-wider text-[10px] font-sans block">
                    {isArabic ? 'الكونسيرج الهاتفي' : 'DIRECT TELEPHONE'}
                  </span>
                  <p className="font-mono font-medium text-sm text-[#F4F1EA] mt-0.5 dir-ltr">
                    {currentBoutique.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 text-xs text-[#C8C2BA]">
                <ArrowUpRight className="w-4 h-4 text-[#C9A15C] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#8E8880] uppercase tracking-wider text-[10px] font-sans block">
                    {isArabic ? 'الموقع على الخريطة' : 'NAVIGATION'}
                  </span>
                  <a
                    href={`https://maps.google.com/?q=${currentBoutique.lat},${currentBoutique.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans font-semibold text-xs text-[#C9A15C] hover:text-[#E6C587] transition-colors mt-0.5 inline-block"
                  >
                    {isArabic ? 'فتح عبر خرائط جوجل ↗' : 'Open in Google Maps ↗'}
                  </a>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Luxury Guarantee Note */}
          <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8E8880] gap-2">
            <span>{isArabic ? 'جميع البوتيكات توفر تجربة العطور في غرف كونسيرج خاصة.' : 'All salons offer private VIP majlis suites.'}</span>
            <span className="text-[#C9A15C] font-mono text-[11px] font-bold">
              {currentBoutique.lat}° N, {currentBoutique.lng}° E
            </span>
          </div>

        </div>

      </div>

      {/* =========================================================================
          VIP APPOINTMENT BOOKING MODAL
          ========================================================================= */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#12100E] border border-[#C9A15C]/40 rounded-3xl p-6 sm:p-10 max-w-lg w-full shadow-2xl relative">
            
            <button
              onClick={() => setBookingModalOpen(false)}
              className="absolute top-6 end-6 text-[#8E8880] hover:text-[#F4F1EA] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {bookingSuccess ? (
              <div className="text-center py-8 space-y-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-[#C9A15C]/20 border border-[#C9A15C] text-[#C9A15C] mx-auto flex items-center justify-center">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="font-arabic font-bold text-2xl text-[#F4F1EA]">
                  {isArabic ? 'تم تأكيد طلب موعدك بنجاح' : 'Appointment Request Received'}
                </h3>
                <p className="text-xs text-[#8E8880] max-w-xs mx-auto">
                  {isArabic
                    ? 'سيتواصل معك كونسيرج دار سَـراب خلال ساعتين لتأكيد الجلسة الخاصة وتجهيز القوارير المختارة.'
                    : 'Our head concierge will contact you within two hours to finalize your private salon session.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#C9A15C]">
                    {isArabic ? 'حجز جلسة خاصة' : 'PRIVATE APPOINTMENT'}
                  </span>
                  <h3 className="font-arabic font-bold text-2xl text-[#F4F1EA]">
                    {isArabic ? currentBoutique.cityAr : currentBoutique.cityEn} — {isArabic ? currentBoutique.mallAr : currentBoutique.mallEn}
                  </h3>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-[11px] text-[#8E8880] block mb-1">
                      {isArabic ? 'الاسم الكريم' : 'Full Name'}
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#0A0A09] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-[#F4F1EA] focus:border-[#C9A15C] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-[#8E8880] block mb-1">
                        {isArabic ? 'رقم الهاتف / واتساب' : 'Phone / WhatsApp'}
                      </label>
                      <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-[#0A0A09] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-[#F4F1EA] focus:border-[#C9A15C] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#8E8880] block mb-1">
                        {isArabic ? 'التاريخ المفضل' : 'Preferred Date'}
                      </label>
                      <input
                        required
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-[#0A0A09] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-[#F4F1EA] focus:border-[#C9A15C] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3.5 rounded-full bg-[#C9A15C] hover:bg-[#E5C07B] text-[#050505] text-xs font-sans font-bold uppercase tracking-widest transition-all shadow-lg cursor-pointer"
                >
                  {isArabic ? 'تأكيد طلب الجلسة الملكية' : 'CONFIRM RESERVATION'}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </section>
  );
}
