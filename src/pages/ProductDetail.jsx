import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/common/ProductCard';
import { ProductSkeleton } from '../components/common/SkeletonLoader';
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
  ArrowRight
} from 'lucide-react';

export default function ProductDetail() {
  const { currentPath, navigate } = useRouter();
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { success } = useToast();

  const productId = currentPath.split('/product/')[1]?.split('?')[0];

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('100ml');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);

  // Review Form
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      setLoading(true);
      try {
        const item = await productService.getProductById(productId);
        if (item) {
          setProduct(item);
          setSelectedImage(0);
          setSelectedSize(item.sizes?.[1] || item.sizes?.[0] || '100ml');
          const related = await productService.getRelatedProducts(item.id, 4);
          setRelatedProducts(related);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[4/5] skeleton-shimmer" />
          <div className="space-y-6">
            <div className="h-8 w-3/4 skeleton-shimmer" />
            <div className="h-4 w-1/2 skeleton-shimmer" />
            <div className="h-20 w-full skeleton-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-36 pb-24 text-center max-w-md mx-auto px-4 space-y-4">
        <h2 className="font-cinzel text-2xl font-bold text-[#F3EEE5]">
          Creation Not Found
        </h2>
        <p className="text-xs text-[#C5B8A8]">
          This bespoke flacon may have been archived or retired to our private historical vaults.
        </p>
        <Link to="/shop" className="luxury-btn-gold px-6 py-2.5 text-xs inline-block">
          Return to Boutique
        </Link>
      </div>
    );
  }

  const isSaved = isInWishlist(product.id);
  const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.stock === 0;

  // Price adjustment based on size
  const sizeMultiplier = selectedSize.includes('50ml') ? 0.75 : selectedSize.includes('200ml') ? 1.65 : 1.0;
  const currentPrice = Math.round(product.price * sizeMultiplier);
  const originalPrice = product.originalPrice ? Math.round(product.originalPrice * sizeMultiplier) : null;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(
      {
        ...product,
        price: currentPrice
      },
      selectedSize,
      quantity
    );
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(
      {
        ...product,
        price: currentPrice
      },
      selectedSize,
      quantity
    );
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const updated = await productService.addReview(product.id, {
        author: reviewAuthor,
        rating: reviewRating,
        comment: reviewComment
      });
      setProduct(updated);
      setReviewAuthor('');
      setReviewComment('');
      success('Your review has been preserved in the Palace Register.');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-sans text-[#C5B8A8]">
        <Link to="/" className="hover:text-[#C6A15B] transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-[#C6A15B] transition-colors">{t('nav.shop')}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/shop?family=${product.fragranceFamily.toLowerCase()}`} className="hover:text-[#C6A15B] transition-colors">
          {product.fragranceFamily}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#F3EEE5] font-semibold truncate">{product.name}</span>
      </nav>

      {/* Main Product Showcase (Left Gallery + Right Info) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Product Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/5] bg-[#140D0A] border border-[#C6A15B]/30 overflow-hidden shadow-2xl group">
            <img
              src={product.images?.[selectedImage] || product.images?.[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 bg-[#4A2F22] text-[#DFBF7A] border border-[#C6A15B]/40 text-xs font-semibold px-3 py-1">
                -{product.discount}% Privilege
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all ${
                isSaved
                  ? 'bg-[#C6A15B] text-[#0F0D0C]'
                  : 'bg-[#0F0D0C]/70 text-[#F3EEE5] hover:bg-[#C6A15B] hover:text-[#0F0D0C]'
              }`}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-24 bg-[#140D0A] border transition-all overflow-hidden ${
                    selectedImage === index
                      ? 'border-[#C6A15B] ring-1 ring-[#C6A15B]'
                      : 'border-[#C6A15B]/20 hover:border-[#C6A15B]/50 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Information */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header & Badges */}
          <div className="space-y-2 border-b border-[#C6A15B]/20 pb-6">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-cinzel">
                <span>{product.fragranceFamily}</span>
                <span>•</span>
                <span className="capitalize">{product.gender}</span>
              </div>
              <span className="font-arabic text-base text-[#DFBF7A] font-bold">
                {product.familyArabic}
              </span>
            </div>

            <h1 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F3EEE5] uppercase tracking-wide">
              {product.name}
            </h1>
            <p className="font-arabic text-xl text-[#C5B8A8]">
              {product.arabicName}
            </p>

            <p className="text-xs text-[#C6A15B] uppercase tracking-[0.2em] font-sans">
              {product.concentration || t('product.flaconDetails')}
            </p>

            {/* Rating & Reviews summary */}
            <div className="flex items-center gap-2 pt-2">
              <div className="flex text-[#C6A15B]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.rating) ? 'fill-current' : 'opacity-30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-[#F3EEE5]">{product.rating}</span>
              <span className="text-xs text-[#C5B8A8]">({product.reviewsCount} {t('common.reviews')})</span>
            </div>

            {/* Price */}
            <div className="pt-2 flex items-baseline gap-3">
              <span className="font-cinzel text-3xl font-bold text-[#C6A15B]">
                ${currentPrice}
              </span>
              {originalPrice && originalPrice > currentPrice && (
                <span className="text-sm text-[#C5B8A8] line-through font-mono">
                  ${originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[#C5B8A8] leading-relaxed font-sans">
            {product.description}
          </p>

          {/* Size Selection */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="font-cinzel uppercase text-[#C6A15B] tracking-wider font-semibold">
                {t('product.selectSize')}
              </span>
              <span className="text-[#C5B8A8] font-mono">{selectedSize}</span>
            </div>
            <div className="flex gap-3">
              {(product.sizes || ['50ml', '100ml', '200ml Flacon']).map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`flex-1 py-3 px-4 text-xs font-cinzel uppercase tracking-wider border transition-all ${
                    selectedSize === s
                      ? 'border-[#C6A15B] bg-[#C6A15B] text-[#0F0D0C] font-bold shadow-lg'
                      : 'border-[#C6A15B]/30 text-[#F3EEE5] bg-[#1C120E] hover:border-[#C6A15B]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 text-xs">
            {isOutOfStock ? (
              <span className="text-red-400 font-medium">● {t('product.outOfStockMsg')}</span>
            ) : product.stock <= 10 ? (
              <span className="text-[#DFBF7A] font-medium">
                ● {t('product.lowStock', { count: product.stock })}
              </span>
            ) : (
              <span className="text-[#C6A15B] font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{t('product.inStock')}</span>
              </span>
            )}
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex gap-4">
              {/* Quantity Counter */}
              <div className="flex items-center border border-[#C6A15B]/40 bg-[#1C120E] px-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="p-2 text-[#C5B8A8] hover:text-[#C6A15B] disabled:opacity-30"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-mono font-bold text-[#F3EEE5]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= product.stock}
                  className="p-2 text-[#C5B8A8] hover:text-[#C6A15B] disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add To Cart */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-4 text-xs tracking-[0.2em] font-cinzel font-semibold flex items-center justify-center gap-2 transition-all ${
                  isOutOfStock
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'luxury-btn-gold shadow-2xl'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? t('shop.outOfStock') : t('product.addToCart')}</span>
              </button>
            </div>

            {/* Buy Now 1-Click */}
            {!isOutOfStock && (
              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 luxury-btn-outline text-xs tracking-[0.2em] font-semibold"
              >
                {t('product.buyNow')}
              </button>
            )}
          </div>

          {/* Complimentary Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-6 border-t border-[#C6A15B]/20 text-[11px] text-[#C5B8A8]">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#C6A15B] shrink-0" />
              <span>Complimentary Insured Courier</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C6A15B] shrink-0" />
              <span>Two 2ml Discovery Vials Included</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C6A15B] shrink-0" />
              <span>Gold Seal Wax Presentation</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#C6A15B] shrink-0" />
              <span>30-Day Tasting Return Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Olfactory Notes Hierarchy & Tabs */}
      <div className="bg-[#1C120E] border border-[#C6A15B]/30 p-6 sm:p-10 space-y-8 shadow-2xl">
        {/* Olfactory Pyramid (Visual Pillars) */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="font-cinzel text-xs uppercase tracking-[0.3em] text-[#C6A15B] font-semibold">
              Olfactory Architecture
            </span>
            <h3 className="font-cinzel text-2xl font-bold text-[#F3EEE5] uppercase">
              {t('product.olfactoryPyramid')}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top Notes */}
            <div className="p-6 bg-[#241712] border border-[#C6A15B]/20 text-center space-y-3">
              <div className="w-8 h-8 rounded-none border border-[#C6A15B]/40 mx-auto flex items-center justify-center text-[#C6A15B]">
                <Droplets className="w-4 h-4" />
              </div>
              <h4 className="font-cinzel text-xs uppercase tracking-[0.2em] text-[#C6A15B] font-bold">
                {t('product.topNotes')}
              </h4>
              <p className="text-[11px] text-[#C5B8A8] italic">Initial impression (0 - 30 mins)</p>
              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                {product.topNotes?.map((n) => (
                  <span key={n} className="text-xs px-2.5 py-1 bg-[#0F0D0C] border border-[#C6A15B]/20 text-[#F3EEE5]">
                    {n}
                  </span>
                ))}
              </div>
            </div>

            {/* Heart Notes */}
            <div className="p-6 bg-[#2B1A12] border border-[#C6A15B]/40 text-center space-y-3 shadow-lg">
              <div className="w-8 h-8 rounded-none border border-[#C6A15B]/60 mx-auto flex items-center justify-center text-[#C6A15B]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="font-cinzel text-xs uppercase tracking-[0.2em] text-[#DFBF7A] font-bold">
                {t('product.heartNotes')}
              </h4>
              <p className="text-[11px] text-[#C5B8A8] italic">The emotional core (30 mins - 4 hrs)</p>
              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                {product.heartNotes?.map((n) => (
                  <span key={n} className="text-xs px-2.5 py-1 bg-[#0F0D0C] border border-[#C6A15B]/30 text-[#F3EEE5]">
                    {n}
                  </span>
                ))}
              </div>
            </div>

            {/* Base Notes */}
            <div className="p-6 bg-[#241712] border border-[#C6A15B]/20 text-center space-y-3">
              <div className="w-8 h-8 rounded-none border border-[#C6A15B]/40 mx-auto flex items-center justify-center text-[#C6A15B]">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="font-cinzel text-xs uppercase tracking-[0.2em] text-[#C6A15B] font-bold">
                {t('product.baseNotes')}
              </h4>
              <p className="text-[11px] text-[#C5B8A8] italic">The lingering sillage (4 hrs - 24+ hrs)</p>
              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                {product.baseNotes?.map((n) => (
                  <span key={n} className="text-xs px-2.5 py-1 bg-[#0F0D0C] border border-[#C6A15B]/20 text-[#F3EEE5]">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Informational Tabs & Review System */}
        <div className="pt-8 border-t border-[#C6A15B]/20">
          <div className="flex flex-wrap border-b border-[#C6A15B]/20 gap-2 sm:gap-6">
            {[
              { id: 'description', label: t('product.description') },
              { id: 'ritual', label: t('product.ritual') },
              { id: 'ingredients', label: t('product.ingredients') },
              { id: 'shipping', label: t('product.shippingReturns') },
              { id: 'reviews', label: `${t('product.customerReviews')} (${product.reviews?.length || 0})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 font-cinzel text-xs uppercase tracking-wider transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-[#C6A15B] text-[#C6A15B] font-bold'
                    : 'border-transparent text-[#C5B8A8] hover:text-[#F3EEE5]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="py-6 text-xs sm:text-sm text-[#C5B8A8] leading-relaxed font-sans">
            {activeTab === 'description' && (
              <div className="space-y-4 animate-fade-in">
                <p>{product.description}</p>
                <p>
                  Hand-poured into our signature weighted crystal flacons, finished with a heavy zamak gold-plated cap featuring intricate classical Islamic engravings.
                </p>
              </div>
            )}

            {activeTab === 'ritual' && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="font-cinzel text-sm text-[#F3EEE5] uppercase">
                  {t('product.ritual')}
                </h4>
                <p>{t('product.ritualDesc')}</p>
                <div className="p-4 bg-[#0F0D0C] border border-[#C6A15B]/20 text-xs text-[#DFBF7A]">
                  ✦ Master Perfumer Advice: Apply upon warm skin directly after showering. Allow 10 minutes for the top saffron and oud resins to interact with your body chemistry before experiencing the heart notes.
                </div>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="font-cinzel text-sm text-[#F3EEE5] uppercase">
                  {t('product.ingredients')}
                </h4>
                <p>{t('product.ingredientsDesc')}</p>
                <p className="text-xs">
                  Alcohol Denat. (Organic Grain), Parfum (Fragrance Concentrate), Aqua (Water), Dehn Al Oud (Aquilaria Agallocha Oil), Rosa Damascena Extract, Benzyl Benzoate, Linalool, Eugenol, Limonene, Alpha-Isomethyl Ionone, Farnesol.
                </p>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="font-cinzel text-sm text-[#F3EEE5] uppercase">
                  {t('product.shippingReturns')}
                </h4>
                <p>{t('product.shippingReturnsDesc')}</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8 animate-fade-in">
                {/* Existing Reviews */}
                <div className="space-y-4">
                  {(!product.reviews || product.reviews.length === 0) ? (
                    <p className="italic text-[#C5B8A8]">
                      Be the first distinguished connoisseur to preserve your impressions of this masterpiece.
                    </p>
                  ) : (
                    product.reviews.map((rev) => (
                      <div key={rev.id} className="p-4 bg-[#241712] border border-[#C6A15B]/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-cinzel font-semibold text-xs text-[#F3EEE5]">
                              {rev.author}
                            </span>
                            <span className="text-[10px] text-[#C6A15B] font-mono">
                              Verified Patron
                            </span>
                          </div>
                          <span className="text-[11px] text-[#C5B8A8]">{rev.date}</span>
                        </div>
                        <div className="flex text-[#C6A15B]">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <p className="text-xs text-[#C5B8A8] leading-relaxed font-sans">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Review Form */}
                <form onSubmit={handleReviewSubmit} className="p-6 bg-[#0F0D0C] border border-[#C6A15B]/30 space-y-4">
                  <h4 className="font-cinzel text-sm uppercase text-[#C6A15B] font-bold">
                    {t('product.writeReview')}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#C5B8A8] mb-1">
                        Your Distinguished Name
                      </label>
                      <input
                        type="text"
                        value={reviewAuthor}
                        onChange={(e) => setReviewAuthor(e.target.value)}
                        placeholder="e.g. Lord Alexander"
                        required
                        className="w-full bg-[#1C120E] border border-[#C6A15B]/30 px-3 py-2 text-xs text-[#F3EEE5] focus:border-[#C6A15B] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#C5B8A8] mb-1">
                        Royal Rating
                      </label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="w-full bg-[#1C120E] border border-[#C6A15B]/30 px-3 py-2 text-xs text-[#F3EEE5] focus:border-[#C6A15B] focus:outline-none"
                      >
                        <option value={5}>★★★★★ (5 Stars - Exceptional)</option>
                        <option value={4}>★★★★☆ (4 Stars - Highly Refined)</option>
                        <option value={3}>★★★☆☆ (3 Stars - Noble)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#C5B8A8] mb-1">
                      Your Olfactory Impressions
                    </label>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Describe your sensory journey, longevity, and projection..."
                      required
                      className="w-full bg-[#1C120E] border border-[#C6A15B]/30 px-3 py-2 text-xs text-[#F3EEE5] focus:border-[#C6A15B] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="luxury-btn-gold px-6 py-2.5 text-xs font-semibold uppercase tracking-wider"
                  >
                    {submittingReview ? 'Preserving in Register...' : 'Submit Connoisseur Review'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Masterpieces Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-8">
          <div className="border-b border-[#C6A15B]/20 pb-4 flex justify-between items-end">
            <div>
              <span className="font-cinzel text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-semibold block mb-1">
                Harmonious Pairings
              </span>
              <h2 className="font-cinzel text-2xl font-bold text-[#F3EEE5] uppercase">
                {t('product.relatedCreations')}
              </h2>
            </div>
            <Link to="/shop" className="text-xs uppercase text-[#C6A15B] font-cinzel hover:underline flex items-center gap-1">
              <span>View All Boutique</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
