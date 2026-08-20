import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/common/ProductCard';
import ScrollReveal, { ScrollRevealItem } from '../components/common/ScrollReveal';
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
  const { isInWishlist, toggleWishlist, heartAnimatedId } = useWishlist();
  const { success, error } = useToast();

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
            <div className="h-24 w-full skeleton-shimmer" />
            <div className="h-12 w-full skeleton-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-36 pb-24 text-center max-w-md mx-auto px-4 space-y-4">
        <h2 className="font-cinzel text-2xl font-bold text-[var(--text-primary)]">
          Creation Not Found
        </h2>
        <p className="text-xs text-[var(--text-muted)]">
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
  const isHeartPopping = heartAnimatedId === product.id;

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
    const added = addToCart(
      {
        ...product,
        price: currentPrice
      },
      selectedSize,
      quantity
    );
    if (added) {
      navigate('/checkout');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const updated = await productService.addReview(product.id, {
        author: reviewAuthor || 'Distinguished Patron',
        rating: reviewRating,
        comment: reviewComment
      });
      setProduct(updated);
      setReviewAuthor('');
      setReviewComment('');
      success('Your review has been preserved in the Palace Register.');
    } catch (err) {
      error(err.message || 'Unable to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="pt-36 sm:pt-40 pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 animate-fade-in text-[var(--color-earth-dark)]">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-sans text-[var(--color-terracotta-deep)] font-medium">
        <Link to="/" className="hover:text-[var(--color-terracotta)] transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-[var(--color-terracotta)] transition-colors">{t('nav.shop')}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/shop?family=${product.fragranceFamily.toLowerCase()}`} className="hover:text-[var(--color-terracotta)] transition-colors">
          {product.fragranceFamily}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[var(--color-earth-dark)] font-bold truncate">{product.name}</span>
      </nav>

      {/* Main Product Showcase (Left Gallery + Right Info) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Product Gallery */}
        <ScrollReveal direction="left" className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/5] bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 overflow-hidden shadow-xl group">
            <img
              src={product.images?.[selectedImage] || product.images?.[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 bg-[var(--color-terracotta)] text-[#F8D188] border border-[var(--color-terracotta-deep)]/40 text-xs font-semibold px-3 py-1 shadow-md">
                -{product.discount}% Privilege
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                isHeartPopping ? 'animate-heart-pop' : ''
              } ${
                isSaved
                  ? 'bg-[var(--color-terracotta)] text-[#F8D188] shadow-lg scale-105'
                  : 'bg-[var(--color-desert-light)]/90 text-[var(--color-earth-dark)] hover:bg-[var(--color-terracotta)] hover:text-[#F8D188]'
              }`}
              aria-label="Toggle Wishlist"
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-24 bg-[var(--color-desert-light)] border transition-all overflow-hidden cursor-pointer shrink-0 ${
                    selectedImage === index
                      ? 'border-[var(--color-terracotta)] ring-2 ring-[var(--color-terracotta)]'
                      : 'border-[var(--color-terracotta-deep)]/25 hover:border-[var(--color-terracotta)] opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </ScrollReveal>

        {/* Right: Product Information */}
        <ScrollReveal direction="right" className="lg:col-span-6 space-y-6">
          {/* Header & Badges */}
          <div className="space-y-2 border-b border-[var(--color-terracotta-deep)]/20 pb-6">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[var(--color-terracotta)] font-cinzel font-bold">
                <span>{product.fragranceFamily}</span>
                <span>•</span>
                <span className="capitalize">{product.gender}</span>
              </div>
              <span className="font-arabic text-base text-[var(--color-terracotta)] font-bold">
                {product.familyArabic}
              </span>
            </div>

            <h1 className="font-cinzel text-3xl sm:text-4xl font-bold text-[var(--color-earth-dark)] uppercase tracking-wide">
              {product.name}
            </h1>
            <p className="font-arabic text-xl text-[var(--color-terracotta-deep)] font-semibold">
              {product.arabicName}
            </p>

            <p className="text-xs text-[var(--color-terracotta)] uppercase tracking-[0.2em] font-sans font-bold">
              {product.concentration || t('product.flaconDetails')}
            </p>

            {/* Rating & Reviews summary */}
            <div className="flex items-center gap-2 pt-2">
              <div className="flex text-[var(--color-terracotta)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.rating) ? 'fill-current' : 'opacity-30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-[var(--color-earth-dark)]">{product.rating}</span>
              <span className="text-xs text-[var(--color-terracotta-deep)]">({product.reviewsCount} {t('common.reviews')})</span>
            </div>

            {/* Price */}
            <div className="pt-2 flex items-baseline gap-3">
              <span className="font-cinzel text-3xl font-bold text-[var(--color-terracotta)]">
                ${currentPrice}
              </span>
              {originalPrice && originalPrice > currentPrice && (
                <span className="text-sm text-[var(--color-terracotta-deep)] line-through font-mono">
                  ${originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[var(--color-terracotta-deep)] leading-relaxed font-sans font-medium">
            {product.description}
          </p>

          {/* Size Selection */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="font-cinzel uppercase text-[var(--color-terracotta)] tracking-wider font-bold">
                {t('product.selectSize')}
              </span>
              <span className="text-[var(--color-terracotta-deep)] font-mono font-semibold">{selectedSize}</span>
            </div>
            <div className="flex gap-3">
              {(product.sizes || ['50ml', '100ml', '200ml Flacon']).map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`flex-1 py-3 px-4 text-xs font-cinzel uppercase tracking-wider border transition-all cursor-pointer ${
                    selectedSize === s
                      ? 'border-[var(--color-terracotta)] bg-[var(--color-terracotta)] text-[#F8D188] font-bold shadow-lg'
                      : 'border-[var(--color-terracotta-deep)]/25 text-[var(--color-earth-dark)] bg-[var(--color-desert-light)] hover:border-[var(--color-terracotta)] font-semibold'
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
              <span className="text-rose-600 font-medium">● {t('product.outOfStockMsg')}</span>
            ) : product.stock <= 10 ? (
              <span className="text-[var(--color-terracotta)] font-bold">
                ● {t('product.lowStock', { count: product.stock })}
              </span>
            ) : (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{t('product.inStock')}</span>
              </span>
            )}
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex gap-4">
              {/* Quantity Counter */}
              <div className="flex items-center border border-[var(--color-terracotta-deep)]/25 bg-[var(--color-desert-light)] px-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="p-2 text-[var(--color-terracotta-deep)] hover:text-[var(--color-terracotta)] disabled:opacity-30 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-mono font-bold text-[var(--color-earth-dark)]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= product.stock}
                  className="p-2 text-[var(--color-terracotta-deep)] hover:text-[var(--color-terracotta)] disabled:opacity-30 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add To Cart */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-4 text-xs tracking-[0.2em] font-cinzel font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isOutOfStock
                    ? 'bg-neutral-400 text-neutral-600 cursor-not-allowed'
                    : 'luxury-btn-gold shadow-xl'
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
                className="w-full py-3.5 luxury-btn-outline text-xs tracking-[0.2em] font-semibold cursor-pointer"
              >
                {t('product.buyNow')}
              </button>
            )}
          </div>

          {/* Complimentary Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-6 border-t border-[var(--color-terracotta-deep)]/20 text-[11px] text-[var(--color-terracotta-deep)] font-medium">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[var(--color-terracotta)] shrink-0" />
              <span>Complimentary Insured Courier</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--color-terracotta)] shrink-0" />
              <span>Two 2ml Discovery Vials Included</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--color-terracotta)] shrink-0" />
              <span>Gold Seal Wax Presentation</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[var(--color-terracotta)] shrink-0" />
              <span>30-Day Tasting Return Guarantee</span>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Olfactory Notes Hierarchy & Tabs */}
      <ScrollReveal direction="up" className="bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 p-6 sm:p-10 space-y-8 shadow-xl">
        {/* Olfactory Pyramid (Visual Pillars) */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="font-cinzel text-xs uppercase tracking-[0.3em] text-[var(--color-terracotta)] font-bold">
              Olfactory Architecture
            </span>
            <h3 className="font-cinzel text-2xl font-bold text-[var(--color-earth-dark)] uppercase">
              {t('product.olfactoryPyramid')}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top Notes */}
            <div className="p-6 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 text-center space-y-3">
              <div className="w-8 h-8 rounded-none border border-[var(--color-terracotta)]/40 mx-auto flex items-center justify-center text-[var(--color-terracotta)] bg-[var(--color-desert-light)]">
                <Droplets className="w-4 h-4" />
              </div>
              <h4 className="font-cinzel text-xs uppercase tracking-[0.2em] text-[var(--color-terracotta)] font-bold">
                {t('product.topNotes')}
              </h4>
              <p className="text-[11px] text-[var(--color-terracotta-deep)] italic font-medium">Initial impression (0 - 30 mins)</p>
              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                {product.topNotes?.map((n) => (
                  <span key={n} className="text-xs px-2.5 py-1 bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/20 text-[var(--color-earth-dark)] font-medium">
                    {n}
                  </span>
                ))}
              </div>
            </div>

            {/* Heart Notes */}
            <div className="p-6 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta)]/40 text-center space-y-3 shadow-md ring-1 ring-[var(--color-terracotta)]/30">
              <div className="w-8 h-8 rounded-none border border-[var(--color-terracotta)]/40 mx-auto flex items-center justify-center text-[var(--color-terracotta)] bg-[var(--color-desert-light)]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="font-cinzel text-xs uppercase tracking-[0.2em] text-[var(--color-terracotta)] font-bold">
                {t('product.heartNotes')}
              </h4>
              <p className="text-[11px] text-[var(--color-terracotta-deep)] italic font-medium">The emotional core (30 mins - 4 hrs)</p>
              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                {product.heartNotes?.map((n) => (
                  <span key={n} className="text-xs px-2.5 py-1 bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/20 text-[var(--color-earth-dark)] font-medium">
                    {n}
                  </span>
                ))}
              </div>
            </div>

            {/* Base Notes */}
            <div className="p-6 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 text-center space-y-3">
              <div className="w-8 h-8 rounded-none border border-[var(--color-terracotta)]/40 mx-auto flex items-center justify-center text-[var(--color-terracotta)] bg-[var(--color-desert-light)]">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="font-cinzel text-xs uppercase tracking-[0.2em] text-[var(--color-terracotta)] font-bold">
                {t('product.baseNotes')}
              </h4>
              <p className="text-[11px] text-[var(--color-terracotta-deep)] italic font-medium">The lingering sillage (4 hrs - 24+ hrs)</p>
              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                {product.baseNotes?.map((n) => (
                  <span key={n} className="text-xs px-2.5 py-1 bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/20 text-[var(--color-earth-dark)] font-medium">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Informational Tabs & Review System */}
        <div className="pt-8 border-t border-[var(--color-terracotta-deep)]/20">
          <div className="flex flex-wrap border-b border-[var(--color-terracotta-deep)]/20 gap-2 sm:gap-6">
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
                className={`pb-3 font-cinzel text-xs uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[var(--color-terracotta)] text-[var(--color-terracotta)] font-bold'
                    : 'border-transparent text-[var(--color-terracotta-deep)] hover:text-[var(--color-earth-dark)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="py-6 text-xs sm:text-sm text-[var(--color-earth-dark)] leading-relaxed font-sans">
            {activeTab === 'description' && (
              <div className="space-y-4 animate-fade-in font-medium">
                <p>{product.description}</p>
                <p>
                  Hand-poured into our signature weighted crystal flacons, finished with a heavy zamak gold-plated cap featuring intricate classical Islamic engravings.
                </p>
              </div>
            )}

            {activeTab === 'ritual' && (
              <div className="space-y-4 animate-fade-in font-medium">
                <h4 className="font-cinzel text-sm text-[var(--color-earth-dark)] font-bold uppercase">
                  {t('product.ritual')}
                </h4>
                <p>{t('product.ritualDesc')}</p>
                <div className="p-4 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta)]/40 text-xs text-[var(--color-terracotta-deep)] font-semibold">
                  ✦ Master Perfumer Advice: Apply upon warm skin directly after showering. Allow 10 minutes for the top saffron and oud resins to interact with your body chemistry before experiencing the heart notes.
                </div>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="space-y-4 animate-fade-in font-medium">
                <h4 className="font-cinzel text-sm text-[var(--color-earth-dark)] font-bold uppercase">
                  {t('product.ingredients')}
                </h4>
                <p>{t('product.ingredientsDesc')}</p>
                <p className="text-xs text-[var(--color-terracotta-deep)]">
                  Alcohol Denat. (Organic Grain), Parfum (Fragrance Concentrate), Aqua (Water), Dehn Al Oud (Aquilaria Agallocha Oil), Rosa Damascena Extract, Benzyl Benzoate, Linalool, Eugenol, Limonene, Alpha-Isomethyl Ionone, Farnesol.
                </p>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-4 animate-fade-in font-medium">
                <h4 className="font-cinzel text-sm text-[var(--color-earth-dark)] font-bold uppercase">
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
                    <p className="italic text-[var(--color-terracotta-deep)]">
                      Be the first distinguished connoisseur to preserve your impressions of this masterpiece.
                    </p>
                  ) : (
                    product.reviews.map((rev) => (
                      <div key={rev.id} className="p-4 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-cinzel font-bold text-xs text-[var(--color-earth-dark)]">
                              {rev.author}
                            </span>
                            <span className="text-[10px] text-[var(--color-terracotta)] font-mono font-bold">
                              Verified Patron
                            </span>
                          </div>
                          <span className="text-[11px] text-[var(--color-terracotta-deep)]">{rev.date}</span>
                        </div>
                        <div className="flex text-[var(--color-terracotta)]">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <p className="text-xs text-[var(--color-earth-dark)] leading-relaxed font-sans font-medium">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Review Form */}
                <form onSubmit={handleReviewSubmit} className="p-6 bg-[var(--color-desert-primary)]/25 border border-[var(--color-terracotta-deep)]/20 space-y-4">
                  <h4 className="font-cinzel text-sm uppercase text-[var(--color-terracotta)] font-bold">
                    {t('product.writeReview')}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[var(--color-terracotta-deep)] font-semibold mb-1">
                        Your Distinguished Name
                      </label>
                      <input
                        type="text"
                        value={reviewAuthor}
                        onChange={(e) => setReviewAuthor(e.target.value)}
                        placeholder="e.g. Lord Alexander"
                        required
                        className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 px-3 py-2 text-xs text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[var(--color-terracotta-deep)] font-semibold mb-1">
                        Royal Rating
                      </label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 px-3 py-2 text-xs text-[var(--color-earth-dark)] focus:border-[var(--color-terracotta)] focus:outline-none cursor-pointer"
                      >
                        <option value={5}>★★★★★ (5 Stars - Exceptional)</option>
                        <option value={4}>★★★★☆ (4 Stars - Highly Refined)</option>
                        <option value={3}>★★★☆☆ (3 Stars - Noble)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[var(--color-terracotta-deep)] font-semibold mb-1">
                      Your Olfactory Impressions
                    </label>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Describe your sensory journey, longevity, and projection..."
                      required
                      className="w-full bg-[var(--color-desert-light)] border border-[var(--color-terracotta-deep)]/25 px-3 py-2 text-xs text-[var(--color-earth-dark)] placeholder-[var(--color-terracotta-deep)]/50 focus:border-[var(--color-terracotta)] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="luxury-btn-gold px-6 py-2.5 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                  >
                    {submittingReview ? 'Preserving in Register...' : 'Submit Connoisseur Review'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* Related Masterpieces Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-8">
          <ScrollReveal direction="up" className="border-b border-[var(--color-terracotta-deep)]/20 pb-4 flex justify-between items-end">
            <div>
              <span className="font-cinzel text-xs uppercase tracking-[0.25em] text-[var(--color-terracotta)] font-bold block mb-1">
                Harmonious Pairings
              </span>
              <h2 className="font-cinzel text-2xl font-bold text-[var(--color-earth-dark)] uppercase">
                {t('product.relatedCreations')}
              </h2>
            </div>
            <Link to="/shop" className="text-xs uppercase text-[var(--color-terracotta)] font-cinzel font-bold hover:underline flex items-center gap-1">
              <span>View All Boutique</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p, index) => (
              <ScrollRevealItem key={p.id} index={index}>
                <ProductCard product={p} />
              </ScrollRevealItem>
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Bottom Purchase Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[var(--color-desert-light)]/95 backdrop-blur-md border-t border-[var(--color-terracotta)]/40 p-3 shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={product.images?.[0]}
            alt={product.name}
            className="w-10 h-12 object-cover border border-[var(--color-terracotta-deep)]/30 shrink-0 bg-[var(--color-desert-primary)]"
          />
          <div className="min-w-0">
            <h4 className="font-cinzel text-xs font-bold text-[var(--color-earth-dark)] truncate">
              {product.name}
            </h4>
            <span className="font-cinzel text-sm font-bold text-[var(--color-terracotta)]">
              ${currentPrice}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="luxury-btn-gold px-3.5 py-2.5 text-[11px] flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
          </button>
          {!isOutOfStock && (
            <button
              onClick={handleBuyNow}
              className="luxury-btn-outline px-3 py-2.5 text-[11px] cursor-pointer"
            >
              Buy Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
