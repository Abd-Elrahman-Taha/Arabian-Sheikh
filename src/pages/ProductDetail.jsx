import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/common/ProductCard';
import BlurText from '../components/common/BlurText';
import {
  Heart,
  ShoppingBag,
  Star,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ChevronRight,
  Plus,
  Minus,
  MessageSquare,
  Droplets,
  Layers,
  Crown,
  Scale,
  Award,
  Lock,
  ArrowRight
} from 'lucide-react';

export default function ProductDetail() {
  const { currentPath, navigate } = useRouter();
  const { t, language, isRtl } = useTranslation();
  const { isDark } = useTheme();
  const { addToCart, openDrawer } = useCart();
  const { isInWishlist, toggleWishlist, heartAnimatedId } = useWishlist();
  const { success, error } = useToast();

  const productId = currentPath.split('/product/')[1]?.split('?')[0];

  // Instant 0ms synchronous initialization from memory cache
  const initialProduct = productService.getProductByIdSync(productId);
  const initialRelated = initialProduct ? productService.getRelatedProductsSync(initialProduct.id, 4) : [];

  const [product, setProduct] = useState(initialProduct);
  const [relatedProducts, setRelatedProducts] = useState(initialRelated);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(initialProduct?.size || '60 ml / 2.0 fl oz');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('pyramid');
  const [loading, setLoading] = useState(!initialProduct);

  // Review submission state
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!productId) return;

    const cached = productService.getProductByIdSync(productId);
    if (cached) {
      setProduct(cached);
      setSelectedImage(0);
      setSelectedSize(cached.size || '60 ml / 2.0 fl oz');
      setRelatedProducts(productService.getRelatedProductsSync(cached.id, 4));
      setLoading(false);
    } else {
      setLoading(true);
      productService.getProductById(productId).then(item => {
        if (item) {
          setProduct(item);
          setSelectedImage(0);
          setSelectedSize(item.size || '60 ml / 2.0 fl oz');
          setRelatedProducts(productService.getRelatedProductsSync(item.id, 4));
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="pt-32 pb-24 max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-[3/4] bg-white/5 rounded" />
          <div className="space-y-6">
            <div className="h-8 bg-white/5 w-3/4 rounded" />
            <div className="h-4 bg-white/5 w-1/2 rounded" />
            <div className="h-32 bg-white/5 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-36 pb-24 text-center max-w-md mx-auto px-4 space-y-4">
        <h2 className="font-cinzel text-2xl font-bold text-[#F3E6D0]">
          Creation Not Found
        </h2>
        <p className="text-xs text-[#D8BE99]">
          This flacon may have been archived or retired to our historical vaults.
        </p>
        <Link to="/shop" className="px-6 py-2.5 bg-[#D4AF37] text-black font-cinzel text-xs uppercase font-bold tracking-wider inline-block">
          Return to Boutique
        </Link>
      </div>
    );
  }

  const isSaved = isInWishlist(product.id);
  const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.stock === 0;
  const galleryImages = product.images && product.images.length > 0 ? product.images : ['/products/black_diamond_gold.png'];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedSize, quantity);
    success(`${product.name} added to your royal shopping bag.`);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedSize, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      await productService.addReview(product.id, {
        author: reviewAuthor || 'Anonymous Patron',
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment
      });
      setReviewSubmitted(true);
      success('Your review has been submitted for royal moderation.');
      setReviewAuthor('');
      setReviewTitle('');
      setReviewComment('');
    } catch (err) {
      error('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const displayName = language === 'bg' && product.bulgarianName
    ? product.bulgarianName
    : language === 'es' && product.spanishName
    ? product.spanishName
    : product.name;

  return (
    <div className={`min-h-screen bg-transparent pt-28 sm:pt-32 pb-12 transition-colors duration-500 ${
      isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
    }`}>
      <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        
        {/* Breadcrumb */}
        <div className={`flex items-center gap-2 text-xs mb-8 font-cinzel uppercase tracking-wider ${
          isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'
        }`}>
          <Link to="/" className="hover:text-[#D4AF37] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 rtl:rotate-180" />
          <Link to="/shop" className="hover:text-[#D4AF37] transition-colors">Shop</Link>
          {product.category && (
            <>
              <ChevronRight className="w-3 h-3 rtl:rotate-180" />
              <Link to={`/shop?category=${product.category}`} className="hover:text-[#D4AF37] transition-colors">
                {product.category}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 rtl:rotate-180" />
          <span className={`truncate max-w-xs font-semibold ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>{displayName}</span>
        </div>

        {/* Product Master Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          
          {/* Left Column: Flacon Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Main Stage */}
            <div className={`relative aspect-[3/4] p-8 sm:p-12 flex items-center justify-center overflow-hidden rounded-2xl border transition-all duration-500 ${
              isDark
                ? 'bg-gradient-to-b from-[#0B0A08] via-[#0B0A08] to-[#0B0A08] border-[#D4AF37]/25 shadow-2xl'
                : 'bg-[#FAF7F2] border-[#D4AF37]/35 shadow-[0_10px_30px_rgba(0,0,0,0.06)]'
            }`}>
              
              {/* Badges */}
              <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 z-10 flex flex-col gap-2">
                {product.tier && (
                  <span className="bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    {product.tier} Tier
                  </span>
                )}
                {isOutOfStock && (
                  <span className="bg-red-900/90 text-white font-sans text-xs uppercase px-2.5 py-0.5 rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`absolute top-4 right-4 rtl:right-auto rtl:left-4 z-10 p-3 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                    : isDark
                    ? 'bg-black/60 text-[#F3E6D0] border-white/20 hover:border-[#D4AF37]'
                    : 'bg-white/80 text-[#120B06] border-black/10 hover:border-[#D4AF37] shadow-sm'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>

              {/* High Resolution Flacon Showcase */}
              <img
                src={galleryImages[selectedImage] || galleryImages[0]}
                alt={displayName}
                className="max-h-[90%] w-auto object-contain filter drop-shadow-[0_25px_40px_rgba(0,0,0,0.4)] hover:scale-105 transition-transform duration-700 select-none"
              />

              {/* Ambient ground drop shadow */}
              <div className="absolute bottom-6 w-48 h-5 bg-black/40 rounded-full blur-lg pointer-events-none" />
            </div>

            {/* Thumbnail Navigation */}
            {galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`h-20 w-20 flex-shrink-0 border p-2 flex items-center justify-center rounded-xl transition-all ${
                      selectedImage === idx
                        ? 'border-[#D4AF37] bg-[#D4AF37]/15 ring-2 ring-[#D4AF37]/50'
                        : isDark
                        ? 'bg-[#0B0A08] border-white/10 hover:border-white/30'
                        : 'bg-white border-black/10 hover:border-[#D4AF37]/40'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="max-h-full max-w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Information & Purchase Suite */}
          <div className="lg:col-span-6 space-y-6">
            
            <div>
              {/* Scent Family & Concentration */}
              <div className={`flex items-center gap-3 text-xs uppercase tracking-[0.25em] font-cinzel font-bold mb-2 ${
                isDark ? 'text-[#F2D675]' : 'text-[#8C6239]'
              }`}>
                <span>{product.fragranceFamily || 'Haute Parfumerie'}</span>
                <span>•</span>
                <span>{product.concentration || 'Extrait de Parfum'}</span>
              </div>

              {/* Main Title */}
              <BlurText
                key={displayName}
                text={displayName}
                delay={70}
                animateBy="words"
                direction="top"
                className={`text-3xl sm:text-4xl font-cinzel font-bold leading-tight mb-2 ${
                  isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
                }`}
                as="h1"
              />

              {/* Tagline */}
              <p className={`text-sm font-serif italic mb-4 ${
                isDark ? 'text-[#D4AF37]' : 'text-[#8C6239]'
              }`}>
                "{product.tagline || product.description}"
              </p>

              {/* Rating Summary */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex gap-1 text-[#D4AF37]">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                </div>
                <span className={`font-bold ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>{product.rating || '5.0'}</span>
                <span className="text-neutral-400">•</span>
                <span className={isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}>{product.reviewsCount || product.reviews?.length || 1} Verified Patron Reviews</span>
              </div>
            </div>

            {/* Price Display */}
            <div className="py-4 border-y border-[#D4AF37]/20 flex items-baseline gap-4">
              <span className="font-cinzel text-3xl font-bold text-[#D4AF37]">
                €{product.price}
              </span>
              <span className={`text-xs uppercase tracking-wider font-medium ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>
                EUR (Tax Included • Complimentary DHL over €100)
              </span>
            </div>

            {/* Fixed 60ml Size Selector */}
            <div className="space-y-2">
              <label className={`text-xs uppercase tracking-widest font-cinzel flex items-center justify-between font-bold ${
                isDark ? 'text-[#D8BE99]' : 'text-[#8C6239]'
              }`}>
                <span>Flacon Volume:</span>
                <span className="text-[#D4AF37] font-semibold">{selectedSize}</span>
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="px-5 py-2.5 border border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] font-cinzel font-bold text-xs tracking-wider rounded-full shadow-sm"
                >
                  {product.size || '60 ml / 2.0 fl oz'}
                </button>
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                {/* Quantity Controls */}
                <div className={`flex items-center border rounded-full ${
                  isDark ? 'border-[#D4AF37]/30 bg-black/50' : 'border-[#D4AF37]/40 bg-white shadow-sm'
                }`}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className={`p-3 transition-colors ${isDark ? 'text-[#F3E6D0] hover:text-[#D4AF37]' : 'text-[#120B06] hover:text-[#D4AF37]'}`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-mono font-bold text-[#D4AF37]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className={`p-3 transition-colors ${isDark ? 'text-[#F3E6D0] hover:text-[#D4AF37]' : 'text-[#120B06] hover:text-[#D4AF37]'}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`group/btn relative flex-1 py-4 px-6 rounded-full font-cinzel font-bold text-xs uppercase tracking-[0.22em] flex items-center justify-center gap-2.5 transition-all duration-400 overflow-hidden cursor-pointer ${
                    isOutOfStock
                      ? 'bg-neutral-900 text-neutral-500 border border-neutral-800 cursor-not-allowed'
                      : isDark
                      ? 'bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] hover:from-[#F2D675] hover:via-[#D4AF37] hover:to-[#F2D675] text-white hover:text-black border border-[#F2D675]/50 shadow-[0_10px_30px_rgba(140,98,57,0.45)] hover:scale-[1.02]'
                      : 'bg-gradient-to-r from-[#2C180F] via-[#120B06] to-[#2C180F] hover:from-[#D4AF37] hover:via-[#F2D675] hover:to-[#D4AF37] text-[#FFFDF9] hover:text-[#120B06] border border-[#D4AF37]/50 shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:scale-[1.02]'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover/btn:scale-110" />
                  <span className="relative z-10 drop-shadow-sm">{isOutOfStock ? 'Out of Stock' : `Add to Bag (€${product.price * quantity})`}</span>
                </button>
              </div>

              {/* Express Buy Now */}
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`group/btn relative w-full py-3.5 px-6 rounded-full border font-cinzel font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-sm hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2 ${
                  isDark
                    ? 'bg-[#0B0A08]/90 hover:bg-[#21130D] border-[#D4AF37]/45 text-[#F3E6D0] hover:text-[#F2D675]'
                    : 'bg-[#FAF7F2] hover:bg-[#F0E8DC] border-[#D4AF37]/40 text-[#120B06] hover:text-[#B8860B]'
                }`}
              >
                <span>Instant Express Checkout</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </button>
            </div>

            {/* Trust Badges & DHL Shipping Estimate */}
            <div className={`p-5 border rounded-2xl space-y-2.5 text-xs ${
              isDark ? 'bg-[#0B0A08] border-white/10 text-[#D8BE99]' : 'bg-white border-[#D4AF37]/30 text-[#2C180F] shadow-[0_6px_20px_rgba(0,0,0,0.04)]'
            }`}>
              <div className={`flex items-center gap-2 ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>
                <Truck className="w-4 h-4 text-[#D4AF37]" />
                <span><strong>DHL Express:</strong> Estimated Delivery in 2-4 Business Days</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>100% Authentic Andalusian Artisanal Creation</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#D4AF37]" />
                <span>Complimentary 14-Day Vault Return Policy</span>
              </div>
            </div>

          </div>

        </div>

        {/* Olfactory Notes Pyramid & Technical Specifications */}
        <div className="border-t border-[#D4AF37]/20 pt-12 mb-20">
          
          <div className="flex justify-center border-b border-black/10 dark:border-white/10 mb-8">
            <div className="flex gap-8 text-xs uppercase font-cinzel tracking-[0.25em]">
              <button
                onClick={() => setActiveTab('pyramid')}
                className={`pb-3 border-b-2 transition-colors font-bold ${
                  activeTab === 'pyramid' ? 'border-[#D4AF37] text-[#D4AF37]' : isDark ? 'border-transparent text-[#D8BE99]' : 'border-transparent text-[#5A3517]'
                }`}
              >
                Olfactory Pyramid
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`pb-3 border-b-2 transition-colors font-bold ${
                  activeTab === 'performance' ? 'border-[#D4AF37] text-[#D4AF37]' : isDark ? 'border-transparent text-[#D8BE99]' : 'border-transparent text-[#5A3517]'
                }`}
              >
                Performance Profile
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 border-b-2 transition-colors font-bold ${
                  activeTab === 'reviews' ? 'border-[#D4AF37] text-[#D4AF37]' : isDark ? 'border-transparent text-[#D8BE99]' : 'border-transparent text-[#5A3517]'
                }`}
              >
                Patron Reviews ({product.reviews?.length || 1})
              </button>
            </div>
          </div>

          {/* TAB 1: Fragrance Pyramid */}
          {activeTab === 'pyramid' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                
                {/* Top Notes */}
                <div className={`p-6 border space-y-3 rounded-2xl ${
                  isDark ? 'bg-[#0B0A08] border-[#D4AF37]/20 text-[#F3E6D0]' : 'bg-white border-[#D4AF37]/30 text-[#120B06] shadow-md'
                }`}>
                  <div className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-cinzel font-bold">
                    Top Notes (Opening)
                  </div>
                  <ul className={`space-y-1.5 text-xs font-medium ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>
                    {product.notes?.top?.map((n, i) => <li key={i}>{n}</li>) || <li>Add fragrance notes</li>}
                  </ul>
                </div>

                {/* Heart Notes */}
                <div className={`p-6 border space-y-3 rounded-2xl ${
                  isDark ? 'bg-[#0B0A08] border-[#D4AF37]/30 text-[#F3E6D0] shadow-lg' : 'bg-white border-[#D4AF37]/35 text-[#120B06] shadow-lg ring-1 ring-[#D4AF37]/20'
                }`}>
                  <div className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-cinzel font-bold">
                    Heart Notes (Core Sillage)
                  </div>
                  <ul className={`space-y-1.5 text-xs font-medium ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>
                    {product.notes?.heart?.map((n, i) => <li key={i}>{n}</li>) || <li>Add fragrance notes</li>}
                  </ul>
                </div>

                {/* Base Notes */}
                <div className={`p-6 border space-y-3 rounded-2xl ${
                  isDark ? 'bg-[#0B0A08] border-[#D4AF37]/20 text-[#F3E6D0]' : 'bg-white border-[#D4AF37]/30 text-[#120B06] shadow-md'
                }`}>
                  <div className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-cinzel font-bold">
                    Base Notes (Drydown)
                  </div>
                  <ul className={`space-y-1.5 text-xs font-medium ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>
                    {product.notes?.base?.map((n, i) => <li key={i}>{n}</li>) || <li>Add fragrance notes</li>}
                  </ul>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: Performance Profile */}
          {activeTab === 'performance' && (
            <div className={`max-w-3xl mx-auto border p-8 space-y-6 rounded-2xl ${
              isDark ? 'bg-[#0B0A08] border-[#D4AF37]/20' : 'bg-white border-[#D4AF37]/30 shadow-md'
            }`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div>
                  <span className={`uppercase tracking-wider block mb-1 font-bold ${isDark ? 'text-[#D8BE99]' : 'text-[#8C6239]'}`}>Longevity</span>
                  <span className="font-semibold text-base text-[#D4AF37]">{product.longevity || '10-12 Hours'}</span>
                </div>
                <div>
                  <span className={`uppercase tracking-wider block mb-1 font-bold ${isDark ? 'text-[#D8BE99]' : 'text-[#8C6239]'}`}>Sillage / Projection</span>
                  <span className={`font-semibold text-base ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>{product.sillage || 'Strong & Sophisticated'}</span>
                </div>
                <div>
                  <span className={`uppercase tracking-wider block mb-1 font-bold ${isDark ? 'text-[#D8BE99]' : 'text-[#8C6239]'}`}>Ideal Season</span>
                  <span className={`font-semibold ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>{product.season?.join(', ') || 'All Seasons'}</span>
                </div>
                <div>
                  <span className={`uppercase tracking-wider block mb-1 font-bold ${isDark ? 'text-[#D8BE99]' : 'text-[#8C6239]'}`}>Recommended Occasion</span>
                  <span className={`font-semibold ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>{product.occasion?.join(', ') || 'Daily Luxury, Gala'}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Reviews */}
          {activeTab === 'reviews' && (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Existing Reviews */}
              <div className="space-y-4">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((rev) => (
                    <div key={rev.id} className={`p-6 border space-y-2 rounded-2xl ${
                      isDark ? 'bg-[#0B0A08] border-white/10' : 'bg-white border-[#D4AF37]/30 shadow-sm'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`font-cinzel font-bold text-xs ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>{rev.author}</span>
                          <span className="text-emerald-500 text-[10px] font-semibold">Verified Patron</span>
                        </div>
                        <div className="flex text-[#D4AF37]">
                          {[...Array(rev.rating || 5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                        </div>
                      </div>
                      {rev.title && <h4 className="text-xs font-bold text-[#D4AF37]">{rev.title}</h4>}
                      <p className={`text-xs font-medium ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className={`text-xs text-center py-6 ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>No patron reviews yet. Be the first to share your olfactory impression.</p>
                )}
              </div>

              {/* Review Submission Form */}
              <div className={`p-6 border space-y-4 rounded-2xl ${
                isDark ? 'bg-[#0B0A08] border-[#D4AF37]/30' : 'bg-white border-[#D4AF37]/35 shadow-md'
              }`}>
                <h3 className="font-cinzel text-sm font-bold text-[#D4AF37] uppercase tracking-wider">
                  Submit an Olfactory Review
                </h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Your Name (e.g. Sultan M.)"
                      required
                      value={reviewAuthor}
                      onChange={(e) => setReviewAuthor(e.target.value)}
                      className={`border px-3 py-2 text-xs rounded-full focus:border-[#D4AF37] focus:outline-none ${
                        isDark ? 'bg-black/60 border-white/10 text-[#F3E6D0]' : 'bg-[#FAF7F2] border-[#D4AF37]/35 text-[#120B06]'
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Review Title"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className={`border px-3 py-2 text-xs rounded-full focus:border-[#D4AF37] focus:outline-none ${
                        isDark ? 'bg-black/60 border-white/10 text-[#F3E6D0]' : 'bg-[#FAF7F2] border-[#D4AF37]/35 text-[#120B06]'
                      }`}
                    />
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Describe the projection, notes, and emotional impression of this fragrance..."
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 p-3 text-xs rounded text-[#F3E6D0] focus:border-[#D4AF37] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-6 py-2.5 bg-[#D4AF37] text-black font-cinzel text-xs font-bold uppercase tracking-wider transition-colors hover:bg-[#F2D675]"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Royal Review'}
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>

        {/* Related Creations & Layering Rituals */}
        {relatedProducts.length > 0 && (
          <div className="pt-16 border-t border-[#D4AF37]/20 space-y-10">
            
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#D4AF37]/40 bg-[#0B0A08] text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#F2D675] font-cinzel font-bold shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Curated Olfactory Layering</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-cinzel font-bold text-[#F3E6D0]">
                Complementary Master Creations
              </h2>
              <p className="text-xs sm:text-sm text-[#D8BE99] font-medium">
                Flacons specifically composed to harmonize and layer with <strong className="text-[#F2D675]">{displayName}</strong>.
              </p>
            </div>

            {/* Frequently Layered Together (Dual Flacon Ritual) */}
            {relatedProducts[0] && (
              <div className="bg-[#0B0A08]/90 border border-[#D4AF37]/35 p-6 sm:p-8 rounded-sm shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
                  
                  {/* Left: 2 Products Visual Flow */}
                  <div className="flex items-center justify-center gap-3 sm:gap-6">
                    {/* Flacon 1 (Current) */}
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="w-24 sm:w-28 h-28 sm:h-32 bg-black/60 border border-[#D4AF37]/30 p-2 flex items-center justify-center">
                        <img
                          src={galleryImages[0]}
                          alt={displayName}
                          className="max-h-full object-contain filter drop-shadow-md"
                        />
                      </div>
                      <span className="font-cinzel text-xs font-bold text-[#F3E6D0] line-clamp-1 max-w-[110px]">{displayName}</span>
                      <span className="text-xs font-mono font-bold text-[#F2D675]">€{product.price}</span>
                    </div>

                    {/* Plus Icon */}
                    <div className="w-8 h-8 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-bold shrink-0">
                      <Plus className="w-4 h-4" />
                    </div>

                    {/* Flacon 2 (Top Related) */}
                    <div
                      onClick={() => navigate(`/product/${relatedProducts[0].slug || relatedProducts[0].id}`)}
                      className="flex flex-col items-center text-center space-y-2 cursor-pointer group"
                    >
                      <div className="w-24 sm:w-28 h-28 sm:h-32 bg-black/60 border border-[#D4AF37]/30 group-hover:border-[#D4AF37] p-2 flex items-center justify-center transition-colors">
                        <img
                          src={relatedProducts[0].cutoutImage || relatedProducts[0].images?.[0] || '/products/black_diamond_gold.png'}
                          alt={relatedProducts[0].name}
                          className="max-h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <span className="font-cinzel text-xs font-bold text-[#F3E6D0] group-hover:text-[#D4AF37] line-clamp-1 max-w-[110px] transition-colors">
                        {relatedProducts[0].name}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#F2D675]">€{relatedProducts[0].price}</span>
                    </div>
                  </div>

                  {/* Center: Layering Advice */}
                  <div className="flex-1 text-center lg:text-left space-y-2 max-w-md">
                    <span className="text-[10px] uppercase tracking-widest text-[#F2D675] font-cinzel font-bold">
                      Royal Sillage Synergy
                    </span>
                    <h3 className="font-cinzel text-base sm:text-lg font-bold text-[#F3E6D0]">
                      The Sovereign Dual Pairing
                    </h3>
                    <p className="text-xs text-[#D8BE99] leading-relaxed">
                      Layering <span className="text-[#F3E6D0] font-semibold">{displayName}</span> with <span className="text-[#F3E6D0] font-semibold">{relatedProducts[0].name}</span> deepens the base notes and extends sillage up to 18+ hours.
                    </p>
                  </div>

                  {/* Right: 1-Click Dual Add Button */}
                  <div className="w-full lg:w-auto flex flex-col items-center lg:items-end gap-3 shrink-0">
                    <div className="text-center lg:text-right">
                      <span className="text-xs text-[#D8BE99] block">Combined Ritual Price:</span>
                      <span className="font-cinzel text-2xl font-bold text-[#D4AF37]">
                        €{product.price + relatedProducts[0].price}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        addToCart(product, selectedSize, 1);
                        addToCart(relatedProducts[0], relatedProducts[0].size || '60 ml', 1);
                        success(`Added the Sovereign Pairing to your bag (${displayName} + ${relatedProducts[0].name})`);
                      }}
                      className="group/btn relative w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#8C6239] via-[#B8860B] to-[#7A5228] hover:from-[#F2D675] hover:via-[#D4AF37] hover:to-[#F2D675] text-white hover:text-black border border-[#F2D675]/50 hover:border-white font-cinzel font-bold text-xs uppercase tracking-[0.22em] shadow-[0_10px_30px_rgba(140,98,57,0.45)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.65)] flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-400 hover:scale-105 overflow-hidden"
                    >
                      {/* Light Glint */}
                      <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

                      <ShoppingBag className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover/btn:scale-110" />
                      <span className="relative z-10 drop-shadow-sm">Add Pair to Bag</span>
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* Grid of All Related Creations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
