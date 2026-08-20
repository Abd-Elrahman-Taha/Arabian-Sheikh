import React, { useState } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { Sparkles, ArrowRight, RotateCcw, Check, ShoppingBag, Crown, Compass } from 'lucide-react';

export default function Discovery() {
  const { navigate } = useRouter();
  const { isRtl } = useTranslation();
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
    <div className="min-h-screen bg-transparent text-[#F8F5F0] pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex p-3 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] mb-2">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-cinzel font-bold text-[#F8F5F0]">
            The Olfactory Discovery Journey
          </h1>
          <p className="text-xs sm:text-sm text-[#A69E94]">
            Answer four curated questions to reveal your perfect Andalusian signature flacon.
          </p>
        </div>

        {/* Progress Bar */}
        {step <= 4 && (
          <div className="mb-8">
            <div className="flex justify-between text-xs text-[#8C6D37] font-cinzel uppercase mb-2">
              <span>Step {step} of 4</span>
              <span>{Math.round((step / 4) * 100)}% Completed</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D4AF37] transition-all duration-500"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Quiz Steps */}
        {step <= 4 && (
          <div className="bg-[#121010] border border-[#D4AF37]/30 p-8 sm:p-10 shadow-2xl space-y-8 animate-fade-in">
            <h2 className="text-xl font-cinzel font-bold text-[#F8F5F0] text-center">
              {steps[step - 1].title}
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {steps[step - 1].options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(steps[step - 1].key, opt.id, opt)}
                  className="p-5 bg-black/60 border border-white/10 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 text-left rtl:text-right rounded transition-all duration-300 group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-cinzel font-bold text-sm text-[#F8F5F0] group-hover:text-[#D4AF37]">
                      {opt.label}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#8C6D37] group-hover:text-[#D4AF37] transition-colors rtl:rotate-180" />
                  </div>
                  {opt.desc && (
                    <p className="text-xs text-[#A69E94] mt-1 font-sans">{opt.desc}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Screen */}
        {step === 5 && result && (
          <div className="bg-[#121010] border border-[#D4AF37]/50 p-8 sm:p-12 shadow-2xl space-y-8 text-center animate-fade-in">
            <div className="inline-flex px-3.5 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] text-xs uppercase font-cinzel font-bold tracking-widest">
              Your Olfactory Signature Match
            </div>

            <div className="aspect-[3/4] max-h-72 mx-auto flex items-center justify-center p-4 bg-black/50 border border-white/10">
              <img
                src={result.image}
                alt={result.name}
                className="max-h-full object-contain filter drop-shadow-2xl animate-float"
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#8C6D37] font-cinzel">{result.tier}</span>
              <h2 className="text-3xl font-cinzel font-bold text-[#D4AF37]">{result.name}</h2>
              <p className="text-xs sm:text-sm text-[#E5E0D8] max-w-md mx-auto">{result.reason}</p>
              <p className="text-xl font-cinzel font-bold text-[#F8F5F0] pt-2">€{result.price} / {result.size}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={async () => {
                  const prod = await productService.getProductById(result.slug);
                  if (prod) addToCart(prod, '60 ml', 1);
                }}
                className="px-8 py-3.5 bg-[#D4AF37] hover:bg-[#E5C07B] text-black font-cinzel font-bold text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag (€{result.price})</span>
              </button>

              <Link
                to={`/product/${result.slug}`}
                className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/20 text-[#F8F5F0] font-cinzel text-xs uppercase tracking-wider transition-colors flex items-center justify-center"
              >
                View Creation Details
              </Link>
            </div>

            <div className="pt-6 border-t border-white/10">
              <button
                onClick={handleReset}
                className="text-xs text-[#8C6D37] hover:text-[#D4AF37] flex items-center gap-1.5 mx-auto transition-colors"
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
