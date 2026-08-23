import React, { useState } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { Sparkles, ArrowRight, RotateCcw, Check, ShoppingBag, Crown, Compass } from 'lucide-react';
import BlurText from '../components/common/BlurText';

export default function Discovery() {
  const { navigate } = useRouter();
  const { isRtl } = useTranslation();
  const { isDark } = useTheme();
  const { addToCart } = useCart();

  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    mood: '',
    family: '',
    longevity: '',
    occasion: ''
  });
  const [result, setResult] = useState(null);

  const steps = [
    {
      id: 1,
      title: 'What aura do you wish to project?',
      key: 'mood',
      options: [
        { id: 'luxury', label: 'Imperial Majesty & Golden Sovereign', tier: 'Luxury', desc: 'Precious oud, rare ambergris, and magnetic royal presence.' },
        { id: 'royal', label: 'Dark Charisma & Assertive Distinction', tier: 'Royal', desc: 'Noble leather, cardamom spice, and masculine strength.' },
        { id: 'classic', label: 'Angelic Sweetness & Gourmand Velvet', tier: 'Classic', desc: 'Spun sugar, creamy vanilla, and delicate floral blossom.' }
      ]
    },
    {
      id: 2,
      title: 'Which olfactory family speaks to your senses?',
      key: 'family',
      options: [
        { id: 'amber', label: 'Fossilized Amber & Precious Resins', match: 'Black Diamond' },
        { id: 'woody', label: 'Smoky Leather & Aged Agarwood', match: 'Millionaire' },
        { id: 'floral', label: 'Orange Blossom & Spun Sugar Nectar', match: 'Ana Sukkar' }
      ]
    },
    {
      id: 3,
      title: 'Desired Longevity & Projection',
      key: 'longevity',
      options: [
        { id: 'ultra', label: '14+ Hours (Ultra Concentrated Sovereign Sillage)' },
        { id: 'long', label: '10-12 Hours (Assertive & Sophisticated Presence)' },
        { id: 'moderate', label: '8-10 Hours (Intimate & Alluring Gourmand Trail)' }
      ]
    },
    {
      id: 4,
      title: 'Primary Occasion for this Fragrance',
      key: 'occasion',
      options: [
        { id: 'gala', label: 'Grand Royal Galas & Evening Celebrations' },
        { id: 'daily', label: 'Executive Signature & Daily Luxury' },
        { id: 'romance', label: 'Intimate Evenings & Serene Occasions' }
      ]
    }
  ];

  const handleSelectOption = (key, val, option) => {
    const updated = { ...answers, [key]: val };
    setAnswers(updated);

    if (step < 4) {
      setStep(step + 1);
    } else {
      // Calculate match
      if (updated.mood === 'luxury' || updated.family === 'amber') {
        setResult({
          slug: 'black-diamond-luxury',
          name: 'Black Diamond',
          tier: 'Luxury Tier',
          price: 50,
          size: '60 ml',
          image: '/products/black_diamond_gold.png?v=5',
          reason: 'Matches your desire for pure imperial majesty and unmatched 14+ hour ambergris sillage.'
        });
      } else if (updated.mood === 'royal' || updated.family === 'woody') {
        setResult({
          slug: 'millionaire-royal',
          name: 'Millionaire',
          tier: 'Royal Tier',
          price: 40,
          size: '60 ml',
          image: '/products/millionaire_black.png?v=5',
          reason: 'Matches your preference for commanding leather, cardamom spice, and dark charisma.'
        });
      } else {
        setResult({
          slug: 'ana-sukkar-classic',
          name: 'Ana Sukkar',
          tier: 'Classic Tier',
          price: 30,
          size: '60 ml',
          image: '/products/ana_sukkar_white.png?v=5',
          reason: 'Matches your affinity for velvety spun sugar, vanilla comfort, and ethereal florals.'
        });
      }
      setStep(5);
    }
  };

  const handleReset = () => {
    setStep(1);
    setAnswers({ mood: '', family: '', longevity: '', occasion: '' });
    setResult(null);
  };

  return (
    <div className={`min-h-screen bg-transparent pt-32 pb-12 transition-colors duration-500 ${
      isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
    }`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex p-3 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] mb-2 shadow-sm">
            <Compass className="w-6 h-6" />
          </div>
          <BlurText
            text="The Olfactory Discovery Journey"
            delay={70}
            animateBy="words"
            direction="top"
            className={`text-3xl sm:text-4xl font-cinzel font-bold justify-center ${
              isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
            }`}
            as="h1"
          />
          <p className={`text-xs sm:text-sm font-medium ${
            isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'
          }`}>
            Answer four curated questions to reveal your perfect Andalusian signature flacon.
          </p>
        </div>

        {/* Progress Bar */}
        {step <= 4 && (
          <div className="mb-8">
            <div className={`flex justify-between text-xs font-cinzel font-bold uppercase mb-2 ${
              isDark ? 'text-[#D8BE99]' : 'text-[#8C6239]'
            }`}>
              <span>Step {step} of 4</span>
              <span>{Math.round((step / 4) * 100)}% Completed</span>
            </div>
            <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D4AF37] transition-all duration-500"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Quiz Steps */}
        {step <= 4 && (
          <div className={`p-8 sm:p-10 shadow-2xl space-y-8 animate-fade-in border rounded-2xl ${
            isDark
              ? 'bg-[#0B0A08] border-[#D4AF37]/30 text-[#F3E6D0]'
              : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/45 text-[#120B06] shadow-[0_15px_35px_rgba(212,175,55,0.2)]'
          }`}>
            <h2 className={`text-xl font-cinzel font-bold text-center ${
              isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
            }`}>
              {steps[step - 1].title}
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {steps[step - 1].options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(steps[step - 1].key, opt.id, opt)}
                  className={`p-5 border text-left rtl:text-right rounded-xl transition-all duration-300 group flex flex-col justify-between cursor-pointer ${
                    isDark
                      ? 'bg-black/60 border-white/10 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10'
                      : 'bg-white/80 border-[#D4AF37]/35 hover:border-[#D4AF37] hover:bg-white shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`font-cinzel font-bold text-sm transition-colors ${
                      isDark ? 'text-[#F3E6D0] group-hover:text-[#D4AF37]' : 'text-[#120B06] group-hover:text-[#D4AF37]'
                    }`}>
                      {opt.label}
                    </span>
                    <ArrowRight className={`w-4 h-4 transition-colors rtl:rotate-180 ${
                      isDark ? 'text-[#D8BE99] group-hover:text-[#D4AF37]' : 'text-[#5A3517] group-hover:text-[#D4AF37]'
                    }`} />
                  </div>
                  {opt.desc && (
                    <p className={`text-xs mt-1 font-sans ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>{opt.desc}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Screen */}
        {step === 5 && result && (
          <div className={`p-8 sm:p-12 shadow-2xl space-y-8 text-center animate-fade-in border rounded-2xl ${
            isDark
              ? 'bg-[#0B0A08] border-[#D4AF37]/50 text-[#F3E6D0]'
              : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/50 text-[#120B06] shadow-[0_20px_45px_rgba(212,175,55,0.25)]'
          }`}>
            <div className="inline-flex px-3.5 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] text-xs uppercase font-cinzel font-bold tracking-widest">
              Your Olfactory Signature Match
            </div>

            <div className={`aspect-[3/4] max-h-72 mx-auto flex items-center justify-center p-0 overflow-hidden border rounded-2xl ${
              isDark ? 'bg-black/50 border-white/10' : 'bg-white/90 border-[#D4AF37]/35 shadow-inner'
            }`}>
              <img
                src={result.image}
                alt={result.name}
                className="w-full h-full object-contain filter drop-shadow-2xl"
              />
            </div>

            <div className="space-y-2">
              <span className={`text-xs uppercase tracking-widest font-cinzel font-bold ${
                isDark ? 'text-[#D8BE99]' : 'text-[#8C6239]'
              }`}>{result.tier}</span>
              <h2 className="text-3xl font-cinzel font-bold text-[#D4AF37]">{result.name}</h2>
              <p className={`text-xs sm:text-sm max-w-md mx-auto ${
                isDark ? 'text-[#F3E6D0]' : 'text-[#2C180F]'
              }`}>{result.reason}</p>
              <p className={`text-xl font-cinzel font-bold pt-2 ${
                isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
              }`}>€{result.price} / {result.size}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={async () => {
                  const prod = await productService.getProductById(result.slug);
                  if (prod) addToCart(prod, '60 ml', 1);
                }}
                className="px-8 py-3.5 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel font-bold text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-2 rounded-full cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag (€{result.price})</span>
              </button>

              <Link
                to={`/product/${result.slug}`}
                className={`px-8 py-3.5 border font-cinzel text-xs uppercase tracking-wider transition-colors flex items-center justify-center rounded-full ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 border-white/20 text-[#F3E6D0]'
                    : 'bg-[#FAF7F2] hover:bg-[#F0E8DC] border-[#D4AF37]/40 text-[#120B06]'
                }`}
              >
                View Creation Details
              </Link>
            </div>

            <div className="pt-6 border-t border-black/10 dark:border-white/10">
              <button
                onClick={handleReset}
                className={`text-xs flex items-center gap-1.5 mx-auto transition-colors cursor-pointer font-bold ${
                  isDark ? 'text-[#D8BE99] hover:text-[#D4AF37]' : 'text-[#5A3517] hover:text-[#B8860B]'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Olfactory Journey</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
