import React, { useRef, useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import {
  ShoppingBag,
  Heart,
  Sparkles,
  ArrowRight,
  Crown
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import BlurText from '../common/BlurText';
import DepthCarousel from '../common/DepthCarousel';

gsap.registerPlugin(ScrollTrigger);

export default function HorizontalCollectionShowcase({
  collection,
  index = 0,
  isEven = false
}) {
  const { navigate } = useRouter();
  const { language, t } = useTranslation();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const sectionRef = useRef(null);
  const titleRef = useRef(null);

  // GSAP ScrollTrigger Entrance Animation
  useEffect(() => {
    const el = sectionRef.current;
    const titleEl = titleRef.current;
    if (!el || !titleEl) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleEl,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  const collectionNumber = String(index + 1).padStart(2, '0');
  const title = language === 'bg' && collection.bulgarianTitle
    ? collection.bulgarianTitle
    : language === 'es' && collection.spanishTitle
    ? collection.spanishTitle
    : collection.title;

  const description = language === 'bg' && collection.bulgarianDescription
    ? collection.bulgarianDescription
    : language === 'es' && collection.spanishDescription
    ? collection.spanishDescription
    : collection.description;

  const products = collection.products || [];

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-24 bg-transparent border-t border-white/10 relative overflow-hidden"
    >
      {/* Ambient Silk Shimmer Accent */}
      <div className="absolute inset-0 bg-radial-vignette opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Collection Header: High Contrast & Crisp Typography */}
        <div ref={titleRef} className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/15 mb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#F2D675] font-bold tracking-widest px-3 py-1 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/40 shadow-sm">
                COLLECTION {collectionNumber}
              </span>
              {collection.tag && (
                <span className="font-cinzel text-xs font-bold uppercase tracking-[0.25em] text-[#F2D675]">
                  {collection.tag}
                </span>
              )}
            </div>

            <BlurText
              text={title}
              delay={70}
              animateBy="words"
              direction="top"
              className="text-3xl sm:text-4xl lg:text-5xl font-cinzel font-bold text-[#F3E6D0] tracking-[0.04em] leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              as="h2"
            />

            <p className="text-sm sm:text-base text-[#F3E6D0] font-sans font-medium leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-1.5 text-[11px] font-mono text-[#F2D675] font-bold">
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              3D PERSPECTIVE DEPTH STAGE
            </span>
            <span className="text-[#D8BE99] font-normal">
              Drag, swipe, or use arrows to navigate creations
            </span>
          </div>
        </div>

        {/* 3D Depth Carousel Container */}
        <div className="relative w-full h-[520px] sm:h-[560px] py-4">
          <DepthCarousel
            items={products}
            cardWidth={330}
            cardHeight={470}
            depth={200}
            spread={100}
            tilt={18}
            perspective={1400}
            visibleCards={4}
            falloff={0.22}
            blur={3.5}
            tint="#21130D"
            radius={8}
            autoplay={false}
            loop={products.length > 2}
            showControls={true}
            showIndicators={true}
            className="w-full h-full"
            renderItem={(product, pIdx, isActive) => {
              const isSaved = isInWishlist(product.id);
              const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.stock === 0;

              const displayName = language === 'bg' && product.bulgarianName
                ? product.bulgarianName
                : language === 'es' && product.spanishName
                ? product.spanishName
                : product.name;

              const topNote = product.notes?.top?.[0] || product.topNotes?.[0] || 'Rare Resins';
              const heartNote = product.notes?.heart?.[0] || product.heartNotes?.[0] || 'Taif Rose';

              return (
                <div className="w-full h-full p-5 flex flex-col justify-between bg-[#21130D] border border-[#D4AF37]/35 rounded-lg select-none relative overflow-hidden group">
                  
                  {/* Card Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#3A2116]/40 via-transparent to-[#0B0A08]/90 pointer-events-none" />

                  {/* Top Bar: Tier Badge & Wishlist */}
                  <div className="relative z-10 flex items-center justify-between gap-2 mb-2">
                    {product.tier ? (
                      <span className="px-3 py-1 rounded text-[11px] font-cinzel font-bold uppercase tracking-wider bg-[#D4AF37] text-black shadow-md flex items-center gap-1.5">
                        <Crown className="w-3 h-3" />
                        <span>{product.tier}</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded text-[11px] font-cinzel font-bold uppercase tracking-wider bg-black/70 text-[#F2D675] border border-[#D4AF37]/40">
                        {product.category || 'Palace Reserve'}
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                      className={`p-2 rounded-full border transition-all cursor-pointer ${
                        isSaved
                          ? 'border-[#D4AF37] bg-[#D4AF37] text-black shadow-md'
                          : 'border-white/20 bg-black/60 text-[#D4AF37] hover:border-[#D4AF37]'
                      }`}
                      title="Save to Wishlist"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Flacon Visual */}
                  <div
                    onClick={() => navigate(`/product/${product.slug || product.id}`)}
                    className="relative z-10 flex-1 flex items-center justify-center p-3 my-1 cursor-pointer"
                  >
                    <img
                      src={product.cutoutImage || product.images?.[0] || '/products/black_diamond_gold.png'}
                      alt={product.name}
                      className="max-h-[220px] sm:max-h-[240px] w-auto object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)] group-hover:scale-106 transition-transform duration-500 pointer-events-none"
                    />
                  </div>

                  {/* High Contrast Product Info */}
                  <div className="relative z-10 space-y-2 mt-1">
                    <div className="flex items-center justify-between">
                      <h3
                        onClick={() => navigate(`/product/${product.slug || product.id}`)}
                        className="font-cinzel text-base sm:text-lg font-bold text-[#F3E6D0] group-hover:text-[#F2D675] transition-colors cursor-pointer line-clamp-1 drop-shadow-sm"
                      >
                        {displayName}
                      </h3>
                      <span className="font-cinzel font-bold text-[#F2D675] text-base sm:text-lg shrink-0 ml-2">
                        €{product.price}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#D8BE99] font-mono text-[11px] font-medium">
                        {product.size || '60 ml'} • {product.fragranceFamily || 'Extrait'}
                      </span>
                      <span className="text-[#D8BE99] text-[11px] font-sans truncate max-w-[150px]">
                        {topNote} • {heartNote}
                      </span>
                    </div>

                    {/* Card Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#D4AF37]/20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product, product.size || '60 ml', 1);
                        }}
                        disabled={isOutOfStock}
                        className="py-2.5 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel font-bold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-md"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
                      </button>

                      <Link
                        to={`/product/${product.slug || product.id}`}
                        className="py-2.5 bg-black/70 hover:bg-white/10 border border-[#D4AF37]/50 text-[#F3E6D0] hover:text-[#F2D675] font-cinzel font-bold text-[11px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1 text-center"
                      >
                        <span>Discover</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                  </div>

                </div>
              );
            }}
          />
        </div>

      </div>
    </section>
  );
}
