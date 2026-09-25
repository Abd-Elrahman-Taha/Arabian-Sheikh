import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { productService } from '../services/productService';
import { promotionService } from '../services/promotionService';
import { reviewService } from '../services/reviewService';
import { authService } from '../services/authService';
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
  ChevronLeft,
  Plus,
  Minus,
  MessageSquare,
  MessageSquarePlus,
  Droplets,
  Layers,
  Crown,
  Scale,
  Award,
  Lock,
  ArrowRight,
  Tag,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ProductDetail() {
  const { currentPath, navigate } = useRouter();
  const { t, language, isRtl } = useTranslation();
  const { isDark } = useTheme();
  const { addToCart, openDrawer } = useCart();
  const { isInWishlist, toggleWishlist, heartAnimatedId } = useWishlist();
  const { success, error } = useToast();

  // On refresh, currentPath is set from window.location.pathname in the router — also use direct fallback
  const rawPath = currentPath || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const pathMatch = rawPath.match(/\/product\/([^/?#]+)/i);
  const productId = pathMatch ? decodeURIComponent(pathMatch[1]).trim() : '';

  // Instant 0ms synchronous initialization from memory cache
  const initialProduct = productId ? productService.getProductByIdSync(productId) : null;
  const initialRelated = initialProduct ? productService.getRelatedProductsSync(initialProduct.id, 4) : [];

  const [product, setProduct] = useState(initialProduct);
  const [promoInfo, setPromoInfo] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState(initialRelated);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(initialProduct?.size || '60 ml / 2.0 fl oz');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('pyramid');
  const [loading, setLoading] = useState(!initialProduct);
  const [loadError, setLoadError] = useState(false);

  // Reviews & Rating state
  const [reviews, setReviews] = useState(initialProduct?.reviewsPreview || initialProduct?.reviews || []);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const [reviewsTotalCount, setReviewsTotalCount] = useState(initialProduct?.reviewCount || initialProduct?.reviewsCount || 0);
  const [ratingFilter, setRatingFilter] = useState(null); // null = all, 1..5
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Review submission modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [manualOrderId, setManualOrderId] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState('');
  const [reviewErrorMessage, setReviewErrorMessage] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!productId) return;

    let isMounted = true;
    setLoadError(false);

    const setupPromo = (prod) => {
      promotionService.getActivePromotions().then(promos => {
        if (isMounted && prod) {
          const info = promotionService.calculateProductPromotion(prod, promos);
          setPromoInfo(info);
        }
      }).catch(() => {});
    };

    const cached = productService.getProductByIdSync(productId);
    if (cached) {
      setProduct(cached);
      setSelectedImage(0);
      setSelectedSize(cached.size || '60 ml / 2.0 fl oz');
      setRelatedProducts(productService.getRelatedProductsSync(cached.id, 4));
      setReviews(cached.reviewsPreview || cached.reviews || []);
      setReviewsTotalCount(cached.reviewCount || cached.reviewsCount || 0);
      setupPromo(cached);
      setLoading(false);
    }

    // Always fetch fresh data from the API (critical on page refresh when memoryCatalog is empty)
    // Only show loading skeleton if we have NO cached data at all
    if (!cached) setLoading(true);

    productService.getProductById(productId).then(item => {
      if (item && isMounted) {
        setProduct(item);
        setSelectedImage(0);
        setSelectedSize(item.size || '60 ml / 2.0 fl oz');
        setRelatedProducts(productService.getRelatedProductsSync(item.id, 4));
        setReviews(item.reviewsPreview || item.reviews || []);
        setReviewsTotalCount(item.reviewCount || item.reviewsCount || 0);
        setupPromo(item);
        setLoadError(false);
      } else if (!item && isMounted && !cached) {
        setLoadError(true);
      }
      if (isMounted) setLoading(false);
    }).catch(() => {
      if (isMounted) {
        setLoading(false);
        if (!cached) setLoadError(true);
      }
    });

    return () => { isMounted = false; };
  }, [productId, language]);

  // ── ALL useEffect hooks MUST come before any early returns (Rules of Hooks) ──

  // fetchProductReviews helper — defined before hooks so it can be referenced
  const fetchProductReviews = async (page = 1, filter = ratingFilter) => {
    const targetId = product?.numericId || product?.id;
    if (!targetId) return;
    setLoadingReviews(true);
    try {
      const res = await reviewService.getProductReviews(targetId, {
        page,
        pageSize: 10,
        rating: filter !== null && filter !== undefined ? filter : undefined
      });
      setReviews(res.items || []);
      setReviewsPage(res.page || 1);
      setReviewsTotalPages(res.totalPages || 1);
      setReviewsTotalCount(res.totalCount || 0);
    } catch (err) {
      console.warn('Failed to load reviews:', err.message);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Load reviews when the Reviews tab is active
  useEffect(() => {
    if (activeTab === 'reviews' && (product?.id || product?.numericId)) {
      fetchProductReviews(reviewsPage, ratingFilter);
    }
  }, [activeTab, ratingFilter, reviewsPage, product?.id]);

  // Fetch review count on product load so the tab header shows accurate count
  useEffect(() => {
    if (product?.id || product?.numericId) {
      const targetId = product?.numericId || product?.id;
      reviewService.getProductReviews(targetId, { page: 1, pageSize: 1 }).then(res => {
        if (res.totalCount !== undefined) {
          setReviewsTotalCount(res.totalCount);
        }
      }).catch(() => {});
    }
  }, [product?.id, product?.numericId]);

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

  if (loadError && !product) {
    return (
      <div className={`pt-36 pb-24 max-w-xl mx-auto px-4 text-center space-y-6 ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>
        <div className="text-5xl mb-4">🏺</div>
        <h2 className="font-cinzel text-2xl font-bold">Royal Creation Unavailable</h2>
        <p className={`text-sm ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>
          This creation could not be retrieved at the moment. Please try again.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => {
              setLoadError(false);
              setLoading(true);
              productService.getProductById(productId).then(item => {
                if (item) {
                  setProduct(item);
                  setSelectedSize(item.size || '60 ml / 2.0 fl oz');
                  setLoadError(false);
                } else {
                  setLoadError(true);
                }
                setLoading(false);
              }).catch(() => { setLoading(false); setLoadError(true); });
            }}
            className="px-6 py-3 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel font-bold text-xs uppercase tracking-widest rounded-full transition-colors"
          >
            Try Again
          </button>
          <Link to="/shop" className={`px-6 py-3 border border-[#D4AF37]/50 font-cinzel font-bold text-xs uppercase tracking-widest rounded-full transition-colors ${isDark ? 'text-[#F3E6D0] hover:bg-white/5' : 'text-[#120B06] hover:bg-black/5'}`}>
            Explore Boutique
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-36 pb-24 max-w-xl mx-auto px-4 text-center space-y-6">
        <h2 className="font-cinzel text-2xl font-bold">{t('shop.noProductsFound') || 'Product Not Found'}</h2>
        <Link to="/shop" className="luxury-btn-gold px-8 py-3.5 inline-block text-xs uppercase tracking-widest font-bold">
          {t('cart.startShopping') || 'Explore Boutique'}
        </Link>
      </div>
    );
  }

  const isSaved = isInWishlist(product.id);
  const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.stock === 0;
  const galleryImages = product.images && product.images.length > 0 ? product.images : ['/products/luxury_designs/07_arabian_gold.webp'];

  const currentPrice = Number(promoInfo?.hasPromotion ? promoInfo.price : product.price) || 0;
  const strikePrice = promoInfo?.hasPromotion 
    ? (promoInfo.originalPrice ? Number(promoInfo.originalPrice) : null)
    : (product.originalPrice && Number(product.originalPrice) > currentPrice ? Number(product.originalPrice) : null);
  const discountPct = promoInfo?.hasPromotion 
    ? (promoInfo.discountPercent || 0)
    : (Number(product.discountPercent) || (strikePrice && currentPrice > 0 ? Math.round((1 - currentPrice / strikePrice) * 100) : (product.discount?.value ? Number(product.discount.value) : 0)));
  const hasActiveDiscount = Boolean(promoInfo?.hasPromotion || product.isDiscounted || product.hasDiscount || (strikePrice && strikePrice > currentPrice) || discountPct > 0);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const itemToAdd = {
      ...product,
      price: currentPrice,
      originalPrice: strikePrice
    };
    addToCart(itemToAdd, selectedSize, quantity);
    success(`${displayName} ${t('product.addToCart') || 'added to your bag.'}`);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const itemToAdd = {
      ...product,
      price: currentPrice,
      originalPrice: strikePrice
    };
    addToCart(itemToAdd, selectedSize, quantity);
    navigate('/checkout');
  };


  const handleOpenReviewModal = async () => {
    const user = authService.getCurrentUser();
    if (!user) {
      error('Please sign in to your Royal Patron account to submit a review.');
      navigate(`/login?returnUrl=/product/${product.slug || product.id}`);
      return;
    }

    setIsReviewModalOpen(true);
    setReviewSuccessMessage('');
    setReviewErrorMessage('');
    setLoadingOrders(true);

    try {
      const orders = await reviewService.getEligibleOrdersForProduct(product.numericId || product.id);
      setEligibleOrders(orders);
      if (orders.length > 0) {
        setSelectedOrderId(orders[0].orderNumber || orders[0].numericId || orders[0].id);
      } else {
        setSelectedOrderId('');
      }
    } catch (err) {
      console.warn('Failed to load eligible orders:', err.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewErrorMessage('');

    const user = authService.getCurrentUser();
    if (!user) {
      setReviewErrorMessage('Please sign in to submit a review.');
      return;
    }

    const orderToUse = selectedOrderId || manualOrderId;
    if (!orderToUse) {
      setReviewErrorMessage('Please select or enter the qualifying order ID where you purchased this flacon.');
      return;
    }

    setSubmittingReview(true);
    try {
      await reviewService.createReview(product.numericId || product.id, {
        orderId: orderToUse,
        rating: reviewRating,
        comment: reviewComment,
        productName: product.name || displayName
      });

      setReviewSuccessMessage('Thank you for sharing your royal impression! Your review has been submitted for royal moderation and will appear once approved.');
      success('Review submitted for royal moderation.');
      setReviewComment('');
      setManualOrderId('');
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setReviewSuccessMessage('');
      }, 3000);
    } catch (err) {
      setReviewErrorMessage(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatPatronName = (name) => {
    if (!name || name === 'Anonymous' || name === 'Anonymous Patron') return 'Royal Patron';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
  };

  const displayName = language === 'bg' && product.bulgarianName
    ? product.bulgarianName
    : language === 'es' && product.spanishName
    ? product.spanishName
    : product.name;

  return (
    <div className={`min-h-screen bg-transparent pt-28 sm:pt-32 pb-12 transition-colors duration-500 relative overflow-hidden ${
      isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'
    }`}>
      <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
        
        {/* Breadcrumb */}
        <div className={`flex items-center gap-2 text-xs mb-8 font-cinzel uppercase tracking-wider ${
          isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'
        }`}>
          <Link to="/" className="hover:text-[#D4AF37] transition-colors">{t('nav.theHouse') || 'Home'}</Link>
          <ChevronRight className="w-3 h-3 rtl:rotate-180" />
          <Link to="/shop" className="hover:text-[#D4AF37] transition-colors">{t('nav.shop') || 'Shop'}</Link>
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
            <div className={`relative aspect-[3/4] p-0 flex items-center justify-center overflow-hidden rounded-2xl border transition-all duration-500 ${
              isDark
                ? 'bg-gradient-to-b from-[#0B0A08] via-[#0B0A08] to-[#0B0A08] border-[#D4AF37]/25 shadow-2xl'
                : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/45 shadow-[0_20px_50px_rgba(212,175,55,0.22)]'
            }`}>
              
              {/* Badges */}
              <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 z-10 flex flex-col gap-2">
                {product.tier && (
                  <span className="bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    {t('tiers.' + product.tier.toLowerCase()) || product.tier}
                  </span>
                )}
                {isOutOfStock && (
                  <span className="bg-red-900/90 text-white font-sans text-xs uppercase px-2.5 py-0.5 rounded-full">
                    {t('shop.outOfStock') || 'Out of Stock'}
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
                    : 'bg-[#FAF1DF]/90 text-[#120B06] border-[#D4AF37]/40 hover:border-[#D4AF37] shadow-sm'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>

              {/* High Resolution Flacon Showcase */}
              <img
                src={galleryImages[selectedImage] || galleryImages[0]}
                alt={displayName}
                className="w-full h-full object-contain filter drop-shadow-[0_25px_40px_rgba(0,0,0,0.4)] hover:scale-105 transition-transform duration-700 select-none"
              />

              {/* Ambient ground drop shadow (hidden on phones in light mode) */}
              <div className={`absolute bottom-6 w-48 h-5 rounded-full blur-lg pointer-events-none ${
                isDark ? 'bg-black/40' : 'hidden sm:block bg-black/15'
              }`} />
            </div>

            {/* Thumbnail Navigation */}
            {galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`h-20 w-20 flex-shrink-0 border p-0 overflow-hidden flex items-center justify-center rounded-xl transition-all ${
                      selectedImage === idx
                        ? 'border-[#D4AF37] bg-[#D4AF37]/25 ring-2 ring-[#D4AF37]/60'
                        : isDark
                        ? 'bg-[#0B0A08] border-white/10 hover:border-white/30'
                        : 'bg-gradient-to-br from-[#FFFDF8] to-[#FAF1DF] border-[#D4AF37]/35 hover:border-[#D4AF37]'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-contain" />
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
                {product.rating && (product.reviewCount > 0 || product.reviewsCount > 0 || reviewsTotalCount > 0) ? (
                  <>
                    <div className="flex gap-1 text-[#D4AF37]">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s <= Math.round(product.rating) ? 'fill-current' : 'text-neutral-500'}`}
                        />
                      ))}
                    </div>
                    <span className={`font-bold ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>
                      {Number(product.rating).toFixed(1)}
                    </span>
                    <span className="text-neutral-400">•</span>
                    <button
                      onClick={() => {
                        setActiveTab('reviews');
                        const el = document.getElementById('product-details-tabs');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`hover:underline cursor-pointer font-medium ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}
                    >
                      {reviewsTotalCount || product.reviewCount || product.reviewsCount} {t('product.verifiedReviews') || 'Verified Patron Reviews'}
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 text-neutral-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3.5 h-3.5" />
                      ))}
                    </div>
                    <span className={`italic ${isDark ? 'text-[#D8BE99]' : 'text-[#8C6239]'}`}>
                      {t('product.noReviewsYet') || 'No reviews yet'}
                    </span>
                    <span className="text-neutral-400">•</span>
                    <button
                      onClick={handleOpenReviewModal}
                      className="text-[#D4AF37] hover:underline font-bold cursor-pointer transition-colors"
                    >
                      {t('product.beFirstToReview') || 'Be the first to review'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Price Display */}
            <div className="py-4 border-y border-[#D4AF37]/20 flex flex-wrap items-baseline gap-4">
              <span className="font-cinzel text-3xl font-bold text-[#D4AF37]">
                €{currentPrice}
              </span>
              {strikePrice && strikePrice > currentPrice && (
                <span className="text-lg line-through text-neutral-400 font-mono">
                  €{strikePrice}
                </span>
              )}
              {promoInfo?.hasPromotion ? (
                <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-600 via-[#D4AF37] to-amber-700 text-black font-cinzel font-bold text-xs uppercase tracking-wider shadow-md border border-[#F2D675] flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>{discountPct}% OFF • {promoInfo.promotionName}</span>
                </span>
              ) : (hasActiveDiscount && discountPct > 0) ? (
                <span className="px-3 py-1 rounded-full bg-red-800/90 text-white font-cinzel font-bold text-xs uppercase tracking-widest shadow-md">
                  {discountPct}% OFF
                </span>
              ) : null}
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
                  <span className="relative z-10 drop-shadow-sm">
                    {isOutOfStock ? (t('shop.outOfStock') || 'Out of Stock') : `${t('shop.addToBag') || 'Add to Bag'} (€${currentPrice * quantity})`}
                  </span>
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
                <span>{t('catalog.expressCheckout') || 'Instant Express Checkout'}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </button>
            </div>

            {/* Trust Badges & DHL Shipping Estimate */}
            <div className={`p-5 border rounded-2xl space-y-2.5 text-xs ${
              isDark
                ? 'bg-[#0B0A08] border-white/10 text-[#D8BE99]'
                : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/45 text-[#2C180F] shadow-[0_10px_30px_rgba(212,175,55,0.18)]'
            }`}>
              <div className={`flex items-center gap-2 ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>
                <Truck className="w-4 h-4 text-[#D4AF37]" />
                <span><strong>DHL Express:</strong> {t('confirmation.deliveryDays') || 'Estimated Delivery in 2-4 Business Days'}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>{t('catalog.authenticCreation') || '100% Authentic Andalusian Artisanal Creation'}</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#D4AF37]" />
                <span>{t('catalog.returnsPolicy') || 'Complimentary 14-Day Vault Return Policy'}</span>
              </div>
            </div>

          </div>

        </div>

        {/* Olfactory Notes Pyramid & Technical Specifications */}
        <div id="product-details-tabs" className="border-t border-[#D4AF37]/20 pt-12 mb-20 scroll-mt-32">
          
          {/* Enhanced Grand Tabs Navigation */}
          <div className="flex justify-center mb-12">
            <div className={`inline-flex flex-wrap items-center justify-center gap-3 sm:gap-4 p-2 rounded-2xl sm:rounded-full border backdrop-blur-md shadow-2xl ${
              isDark
                ? 'bg-[#0B0A08]/90 border-[#D4AF37]/30 shadow-[0_10px_35px_rgba(0,0,0,0.8)]'
                : 'bg-white/80 border-[#D4AF37]/40 shadow-[0_10px_35px_rgba(212,175,55,0.15)]'
            }`}>
              <button
                onClick={() => setActiveTab('pyramid')}
                className={`px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-cinzel font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase transition-all duration-300 flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'pyramid'
                    ? 'bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#D4AF37] text-black shadow-[0_4px_20px_rgba(212,175,55,0.4)] scale-105'
                    : isDark
                    ? 'text-[#D8BE99] hover:text-[#F2D675] hover:bg-white/5'
                    : 'text-[#5A3517] hover:text-black hover:bg-black/5'
                }`}
              >
                <Droplets className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-current" />
                <span>{t('catalog.olfactoryPyramid') || 'Olfactory Pyramid'}</span>
              </button>

              <button
                onClick={() => setActiveTab('performance')}
                className={`px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-cinzel font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase transition-all duration-300 flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'performance'
                    ? 'bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#D4AF37] text-black shadow-[0_4px_20px_rgba(212,175,55,0.4)] scale-105'
                    : isDark
                    ? 'text-[#D8BE99] hover:text-[#F2D675] hover:bg-white/5'
                    : 'text-[#5A3517] hover:text-black hover:bg-black/5'
                }`}
              >
                <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-current" />
                <span>{t('catalog.performanceProfile') || 'Performance Profile'}</span>
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-cinzel font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase transition-all duration-300 flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'bg-gradient-to-r from-[#D4AF37] via-[#F2D675] to-[#D4AF37] text-black shadow-[0_4px_20px_rgba(212,175,55,0.4)] scale-105'
                    : isDark
                    ? 'text-[#D8BE99] hover:text-[#F2D675] hover:bg-white/5'
                    : 'text-[#5A3517] hover:text-black hover:bg-black/5'
                }`}
              >
                <Star className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-current" />
                <span>Verified Patron Reviews ({reviewsTotalCount || product.reviewCount || product.reviewsCount || 0})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Fragrance Pyramid */}
          {activeTab === 'pyramid' && (() => {
            // Support both API field formats: topNotes/heartNotes/baseNotes or notes.top/notes.heart/notes.base
            let topNotes = (product.notes?.top?.length ? product.notes.top : null) || (product.topNotes?.length ? product.topNotes : null) || [];
            let heartNotes = (product.notes?.heart?.length ? product.notes.heart : null) || (product.heartNotes?.length ? product.heartNotes : null) || [];
            let baseNotes = (product.notes?.base?.length ? product.notes.base : null) || (product.baseNotes?.length ? product.baseNotes : null) || [];

            // Guarantee notes are never empty
            if (!topNotes.length || !heartNotes.length || !baseNotes.length) {
              const defaultTop = ['Imperial Saffron', 'Wild Bergamot', 'Golden Amber Dust'];
              const defaultHeart = ['Assamese Royal Oud', 'Smoked Incense', 'Taif Rose Petals'];
              const defaultBase = ['Black Ambergris', 'Dark Sandalwood', 'Cashmere Musk'];
              if (!topNotes.length) topNotes = defaultTop;
              if (!heartNotes.length) heartNotes = defaultHeart;
              if (!baseNotes.length) baseNotes = defaultBase;
            }

            return (
              <div className="max-w-5xl mx-auto space-y-10">

                {/* Pyramid Section Title */}
                <div className="text-center space-y-3 mb-2">
                  <div className={`inline-flex items-center justify-center gap-3 px-5 py-2 rounded-full border text-xs sm:text-sm uppercase tracking-[0.3em] font-cinzel font-bold ${
                    isDark ? 'bg-[#0B0A08] border-[#D4AF37]/40 text-[#F2D675]' : 'bg-[#FAF1DF] border-[#D4AF37]/50 text-[#8C6239]'
                  }`}>
                    <Droplets className="w-4 h-4 text-[#D4AF37]" />
                    <span>Sovereign Olfactory Architecture</span>
                    <Droplets className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <h3 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wider">
                    The Tri-Phase Sillage Evolution
                  </h3>
                  <p className={`text-sm sm:text-base font-serif italic max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-[#D8BE99]/80' : 'text-[#5A3517]/80'}`}>
                    An opulent journey orchestrated in three distinct symphonic acts, unfolding from first mist to deep drydown over 18+ hours.
                  </p>
                </div>

                {/* Pyramid Visual + Cards */}
                <div className="flex flex-col gap-6">

                  {/* Top Notes — Apex */}
                  <div className="flex justify-center">
                    <div className={`w-full max-w-xl p-8 sm:p-10 border-2 rounded-3xl text-center space-y-5 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-2xl ${
                      isDark
                        ? 'bg-gradient-to-br from-[#1E1409] via-[#0F0C06] to-[#0B0A08] border-[#D4AF37]/50 shadow-[0_10px_40px_rgba(212,175,55,0.15)]'
                        : 'bg-gradient-to-br from-[#FFFEFB] via-[#FBF5E6] to-[#F5EDD8] border-[#D4AF37]/60 shadow-[0_15px_45px_rgba(212,175,55,0.22)]'
                    }`}>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-[#D4AF37]/15 blur-2xl rounded-full pointer-events-none" />

                      <div className="relative z-10 flex justify-center">
                        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#D4AF37]/35 to-[#D4AF37]/10 border-2 border-[#D4AF37]/60 flex items-center justify-center shadow-xl">
                          <Droplets className="w-8 h-8 sm:w-9 sm:h-9 text-[#D4AF37]" />
                        </div>
                      </div>

                      <div className="relative z-10 space-y-1">
                        <div className="text-xs sm:text-sm uppercase tracking-[0.35em] text-[#D4AF37] font-cinzel font-bold">
                          Top Notes (Opening)
                        </div>
                        <div className={`text-xs sm:text-sm font-serif italic ${isDark ? 'text-[#D8BE99]/80' : 'text-[#8C6239]/80'}`}>
                          Initial Diffusion · First 15–30 Minutes
                        </div>
                      </div>

                      <div className="relative z-10 pt-2">
                        <div className="flex flex-wrap justify-center gap-3">
                          {topNotes.map((n, i) => (
                            <span key={i} className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm font-bold tracking-wide border transition-transform hover:scale-105 ${
                              isDark
                                ? 'bg-[#D4AF37]/15 border-[#D4AF37]/45 text-[#F2D675] shadow-md'
                                : 'bg-gradient-to-r from-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/55 text-[#5A3517] shadow-sm'
                            }`}>
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pyramid connector arrow */}
                  <div className="flex justify-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-px h-5 bg-gradient-to-b from-[#D4AF37]/80 to-[#D4AF37]/20" />
                      <div className="w-0 h-0 border-l-[7px] border-r-[7px] border-t-[9px] border-l-transparent border-r-transparent border-t-[#D4AF37]/70" />
                    </div>
                  </div>

                  {/* Heart Notes — Middle */}
                  <div className="flex justify-center">
                    <div className={`w-full max-w-2xl p-9 sm:p-12 border-2 rounded-3xl text-center space-y-5 relative overflow-hidden transition-all duration-300 hover:scale-[1.015] shadow-2xl ${
                      isDark
                        ? 'bg-gradient-to-br from-[#241709] via-[#140E06] to-[#0B0A08] border-[#D4AF37]/60 shadow-[0_15px_60px_rgba(212,175,55,0.22)] ring-1 ring-[#D4AF37]/30'
                        : 'bg-gradient-to-br from-[#FFFEFB] via-[#FAF3E2] to-[#F3EAD3] border-[#D4AF37]/70 shadow-[0_20px_55px_rgba(212,175,55,0.30)] ring-1 ring-[#D4AF37]/35'
                    }`}>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-28 bg-[#D4AF37]/20 blur-3xl rounded-full pointer-events-none" />

                      <div className="absolute top-4 right-5 rtl:right-auto rtl:left-5">
                        <span className="inline-flex items-center gap-1.5 bg-[#D4AF37] text-black text-[10px] sm:text-xs font-cinzel font-bold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-lg">
                          <Crown className="w-3.5 h-3.5" />
                          Signature Core
                        </span>
                      </div>

                      <div className="relative z-10 flex justify-center">
                        <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-br from-[#D4AF37]/45 to-[#D4AF37]/15 border-2 border-[#D4AF37]/70 flex items-center justify-center shadow-2xl">
                          <Layers className="w-9 h-9 sm:w-10 sm:h-10 text-[#D4AF37]" />
                        </div>
                      </div>

                      <div className="relative z-10 space-y-1">
                        <div className="text-sm sm:text-base uppercase tracking-[0.35em] text-[#D4AF37] font-cinzel font-bold">
                          Heart Notes (Core Sillage)
                        </div>
                        <div className={`text-xs sm:text-sm font-serif italic ${isDark ? 'text-[#D8BE99]/80' : 'text-[#8C6239]/80'}`}>
                          The Signature Heartwood · 30 min – 4 Hours
                        </div>
                      </div>

                      <div className="relative z-10 pt-2">
                        <div className="flex flex-wrap justify-center gap-3">
                          {heartNotes.map((n, i) => (
                            <span key={i} className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm font-bold tracking-wide border transition-transform hover:scale-105 ${
                              isDark
                                ? 'bg-[#D4AF37]/20 border-[#D4AF37]/50 text-[#F2D675] shadow-lg'
                                : 'bg-gradient-to-r from-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/65 text-[#4A2C0E] shadow-sm'
                            }`}>
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pyramid connector arrow */}
                  <div className="flex justify-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-px h-5 bg-gradient-to-b from-[#D4AF37]/80 to-[#D4AF37]/20" />
                      <div className="w-0 h-0 border-l-[7px] border-r-[7px] border-t-[9px] border-l-transparent border-r-transparent border-t-[#D4AF37]/70" />
                    </div>
                  </div>

                  {/* Base Notes — Foundation */}
                  <div className="flex justify-center">
                    <div className={`w-full max-w-4xl p-10 sm:p-14 border-2 rounded-3xl text-center space-y-5 relative overflow-hidden transition-all duration-300 hover:scale-[1.01] shadow-2xl ${
                      isDark
                        ? 'bg-gradient-to-br from-[#1C1106] via-[#100903] to-[#0B0A08] border-[#D4AF37]/45 shadow-[0_15px_50px_rgba(212,175,55,0.18)]'
                        : 'bg-gradient-to-br from-[#FAF5EA] via-[#F3EDD8] to-[#EDE4CA] border-[#D4AF37]/55 shadow-[0_15px_45px_rgba(212,175,55,0.22)]'
                    }`}>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[#8C6239]/15 blur-3xl rounded-full pointer-events-none" />

                      <div className="relative z-10 flex justify-center">
                        <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-br from-[#8C6239]/30 to-[#D4AF37]/15 border-2 border-[#D4AF37]/55 flex items-center justify-center shadow-xl">
                          <Award className="w-9 h-9 sm:w-10 sm:h-10 text-[#D4AF37]" />
                        </div>
                      </div>

                      <div className="relative z-10 space-y-1">
                        <div className="text-sm sm:text-base uppercase tracking-[0.35em] text-[#D4AF37] font-cinzel font-bold">
                          Base Notes (Drydown)
                        </div>
                        <div className={`text-xs sm:text-sm font-serif italic ${isDark ? 'text-[#D8BE99]/80' : 'text-[#8C6239]/80'}`}>
                          Deep Sovereign Foundation · 4 to 18+ Hours of Eternal Sillage
                        </div>
                      </div>

                      <div className="relative z-10 pt-2">
                        <div className="flex flex-wrap justify-center gap-3">
                          {baseNotes.map((n, i) => (
                            <span key={i} className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm font-bold tracking-wide border transition-transform hover:scale-105 ${
                              isDark
                                ? 'bg-[#8C6239]/20 border-[#D4AF37]/35 text-[#E6CDA3] shadow-md'
                                : 'bg-[#8C6239]/15 border-[#D4AF37]/45 text-[#3A1E08] shadow-sm'
                            }`}>
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Fragrance Family Footer */}
                {(product.fragranceFamily || product.scentFamily) && (
                  <div className={`flex items-center justify-center gap-4 text-xs sm:text-sm font-cinzel pt-4 ${isDark ? 'text-[#D8BE99]' : 'text-[#8C6239]'}`}>
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#D4AF37]/40" />
                    <span className="uppercase tracking-widest font-bold">{product.fragranceFamily || product.scentFamily}</span>
                    {product.concentration && (
                      <>
                        <span className="text-[#D4AF37]">•</span>
                        <span className="uppercase tracking-widest">{product.concentration}</span>
                      </>
                    )}
                    <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#D4AF37]/40" />
                  </div>
                )}

              </div>
            );
          })()}

          {/* TAB 2: Performance Profile */}
          {activeTab === 'performance' && (
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="text-center space-y-3 mb-2">
                <div className={`inline-flex items-center justify-center gap-2.5 px-5 py-2 rounded-full border text-xs sm:text-sm uppercase tracking-[0.3em] font-cinzel font-bold ${
                  isDark ? 'bg-[#0B0A08] border-[#D4AF37]/40 text-[#F2D675]' : 'bg-[#FAF1DF] border-[#D4AF37]/50 text-[#8C6239]'
                }`}>
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>Technical & Artistic Specifications</span>
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <h3 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wider">
                  Imperial Performance Telemetry
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Longevity */}
                <div className={`p-7 rounded-2xl border transition-all hover:scale-[1.02] shadow-xl ${
                  isDark
                    ? 'bg-[#0E0C09] border-[#D4AF37]/30 shadow-[0_8px_30px_rgba(0,0,0,0.6)]'
                    : 'bg-gradient-to-br from-white via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/50 shadow-[0_8px_30px_rgba(212,175,55,0.18)]'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37]">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-cinzel uppercase tracking-[0.2em] font-bold text-[#D4AF37]">Skin Longevity</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-cinzel font-bold text-[#F3E6D0] dark:text-[#F3E6D0] mb-1">
                    {product.longevity || '18+ Hours'}
                  </div>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-[#D8BE99]/70' : 'text-[#5A3517]/80'}`}>
                    High-affinity pure resins adhering continuously to pulse points throughout the day and evening.
                  </p>
                </div>

                {/* 2. Sillage / Projection */}
                <div className={`p-7 rounded-2xl border transition-all hover:scale-[1.02] shadow-xl ${
                  isDark
                    ? 'bg-[#0E0C09] border-[#D4AF37]/30 shadow-[0_8px_30px_rgba(0,0,0,0.6)]'
                    : 'bg-gradient-to-br from-white via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/50 shadow-[0_8px_30px_rgba(212,175,55,0.18)]'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37]">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-cinzel uppercase tracking-[0.2em] font-bold text-[#D4AF37]">Sillage / Projection</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-cinzel font-bold text-[#F3E6D0] dark:text-[#F3E6D0] mb-1">
                    {product.sillage || 'Imperial (6+ Feet)'}
                  </div>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-[#D8BE99]/70' : 'text-[#5A3517]/80'}`}>
                    Commands attention across the room without overpowering, casting a majestic sillage trail.
                  </p>
                </div>

                {/* 3. Concentration */}
                <div className={`p-7 rounded-2xl border transition-all hover:scale-[1.02] shadow-xl ${
                  isDark
                    ? 'bg-[#0E0C09] border-[#D4AF37]/30 shadow-[0_8px_30px_rgba(0,0,0,0.6)]'
                    : 'bg-gradient-to-br from-white via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/50 shadow-[0_8px_30px_rgba(212,175,55,0.18)]'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37]">
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-cinzel uppercase tracking-[0.2em] font-bold text-[#D4AF37]">Concentration</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-cinzel font-bold text-[#F3E6D0] dark:text-[#F3E6D0] mb-1">
                    {product.concentration || 'Extrait (30% Oil)'}
                  </div>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-[#D8BE99]/70' : 'text-[#5A3517]/80'}`}>
                    Artisanal cold-macerated extract using royal grade essential oils and distilled extracts.
                  </p>
                </div>

                {/* 4. Fragrance Family */}
                <div className={`p-7 rounded-2xl border transition-all hover:scale-[1.02] shadow-xl ${
                  isDark
                    ? 'bg-[#0E0C09] border-[#D4AF37]/30 shadow-[0_8px_30px_rgba(0,0,0,0.6)]'
                    : 'bg-gradient-to-br from-white via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/50 shadow-[0_8px_30px_rgba(212,175,55,0.18)]'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37]">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-cinzel uppercase tracking-[0.2em] font-bold text-[#D4AF37]">Olfactory Family</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-cinzel font-bold text-[#F3E6D0] dark:text-[#F3E6D0] mb-1">
                    {product.fragranceFamily || product.scentFamily || 'Royal Oriental Woody'}
                  </div>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-[#D8BE99]/70' : 'text-[#5A3517]/80'}`}>
                    Harmonized with precious Oud, golden Amber, and exotic Taif flora.
                  </p>
                </div>

                {/* 5. Ideal Seasons */}
                <div className={`p-7 rounded-2xl border transition-all hover:scale-[1.02] shadow-xl ${
                  isDark
                    ? 'bg-[#0E0C09] border-[#D4AF37]/30 shadow-[0_8px_30px_rgba(0,0,0,0.6)]'
                    : 'bg-gradient-to-br from-white via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/50 shadow-[0_8px_30px_rgba(212,175,55,0.18)]'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37]">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-cinzel uppercase tracking-[0.2em] font-bold text-[#D4AF37]">Optimal Climate</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-cinzel font-bold text-[#F3E6D0] dark:text-[#F3E6D0] mb-1">
                    {Array.isArray(product.season) ? product.season.join(', ') : (product.season || 'Autumn, Winter & Gala')}
                  </div>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-[#D8BE99]/70' : 'text-[#5A3517]/80'}`}>
                    Formulated to flourish in cooler air and temperature-controlled grand royal palaces.
                  </p>
                </div>

                {/* 6. Recommended Occasion */}
                <div className={`p-7 rounded-2xl border transition-all hover:scale-[1.02] shadow-xl ${
                  isDark
                    ? 'bg-[#0E0C09] border-[#D4AF37]/30 shadow-[0_8px_30px_rgba(0,0,0,0.6)]'
                    : 'bg-gradient-to-br from-white via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/50 shadow-[0_8px_30px_rgba(212,175,55,0.18)]'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37]">
                      <Crown className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-cinzel uppercase tracking-[0.2em] font-bold text-[#D4AF37]">Ideal Occasion</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-cinzel font-bold text-[#F3E6D0] dark:text-[#F3E6D0] mb-1">
                    {Array.isArray(product.occasion) ? product.occasion.join(', ') : (product.occasion || 'Royal Galas & Soirées')}
                  </div>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-[#D8BE99]/70' : 'text-[#5A3517]/80'}`}>
                    Designed to leave an unforgettable signature on milestone ceremonies and black-tie galas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Reviews */}
          {activeTab === 'reviews' && (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Header & Rating Metric Card */}
              <div className={`p-6 sm:p-8 border rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 ${
                isDark
                  ? 'bg-[#0B0A08] border-[#D4AF37]/30 shadow-xl'
                  : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/45 shadow-[0_12px_35px_rgba(212,175,55,0.18)]'
              }`}>
                <div className="flex items-center gap-6 text-center sm:text-left">
                  <div>
                    <div className="font-cinzel text-4xl sm:text-5xl font-extrabold text-[#D4AF37]">
                      {product.rating ? Number(product.rating).toFixed(1) : '—'}
                    </div>
                    <div className="text-[11px] uppercase tracking-wider font-cinzel text-neutral-400 mt-1">
                      out of 5.0
                    </div>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <div className="flex gap-1 text-[#D4AF37]">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${product.rating && s <= Math.round(product.rating) ? 'fill-current' : 'text-neutral-500'}`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-semibold ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>
                      {reviewsTotalCount || product.reviewCount || 0} {t('product.verifiedPatronImpressions') || 'Verified Patron Impressions'}
                    </p>
                    <p className={`text-[11px] ${isDark ? 'text-[#D8BE99]/80' : 'text-[#5A3517]/80'}`}>
                      All reviews undergo royal moderation to ensure authentic purchase experiences.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleOpenReviewModal}
                  className="w-full sm:w-auto px-6 py-3.5 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel text-xs font-bold uppercase tracking-[0.2em] rounded-full shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>{t('product.writeReview') || 'Share Olfactory Review'}</span>
                </button>
              </div>

              {/* Star Rating Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-cinzel font-bold uppercase tracking-wider mr-2 ${
                  isDark ? 'text-[#D8BE99]' : 'text-[#8C6239]'
                }`}>
                  Filter:
                </span>
                <button
                  onClick={() => { setRatingFilter(null); setReviewsPage(1); }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-cinzel tracking-wider transition-all cursor-pointer ${
                    ratingFilter === null
                      ? 'bg-[#D4AF37] text-black font-bold shadow-md'
                      : isDark
                      ? 'bg-black/50 border border-white/10 text-[#D8BE99] hover:border-[#D4AF37]'
                      : 'bg-white/80 border border-[#D4AF37]/30 text-[#120B06] hover:border-[#D4AF37]'
                  }`}
                >
                  All Reviews
                </button>
                {[5, 4, 3, 2, 1].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => { setRatingFilter(stars); setReviewsPage(1); }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-cinzel tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                      ratingFilter === stars
                        ? 'bg-[#D4AF37] text-black font-bold shadow-md'
                        : isDark
                        ? 'bg-black/50 border border-white/10 text-[#D8BE99] hover:border-[#D4AF37]'
                        : 'bg-white/80 border border-[#D4AF37]/30 text-[#120B06] hover:border-[#D4AF37]'
                    }`}
                  >
                    <span>{stars}</span>
                    <Star className="w-3 h-3 fill-current text-amber-500" />
                  </button>
                ))}
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {loadingReviews ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-6 border border-white/5 rounded-2xl animate-pulse bg-white/5 h-28" />
                    ))}
                  </div>
                ) : reviews && reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className={`p-6 border space-y-3 rounded-2xl transition-all ${
                        isDark
                          ? 'bg-[#0B0A08] border-white/10 hover:border-[#D4AF37]/40'
                          : 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF1DF] to-[#F5E6CC] border-[#D4AF37]/45 shadow-[0_10px_30px_rgba(212,175,55,0.14)]'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full border border-[#D4AF37] bg-[#D4AF37]/15 flex items-center justify-center font-cinzel font-bold text-xs text-[#D4AF37]">
                            {(rev.userName || rev.author || 'P')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-cinzel font-bold text-xs ${isDark ? 'text-[#F3E6D0]' : 'text-[#120B06]'}`}>
                                {formatPatronName(rev.userName || rev.author)}
                              </span>
                              <span className="inline-flex items-center gap-1 text-emerald-500 text-[10px] font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                <Check className="w-2.5 h-2.5" />
                                <span>Verified Patron</span>
                              </span>
                            </div>
                            <span className="text-[10px] text-neutral-400">
                              {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : 'Recent'}
                            </span>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex text-[#D4AF37]">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${s <= Number(rev.rating) ? 'fill-current' : 'text-neutral-500'}`}
                            />
                          ))}
                        </div>
                      </div>

                      {rev.title && (
                        <h4 className="text-xs font-bold text-[#D4AF37]">{rev.title}</h4>
                      )}

                      <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-[#D8BE99]' : 'text-[#5A3517]'}`}>
                        {rev.comment || rev.body}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className={`p-10 border rounded-2xl text-center space-y-4 ${
                    isDark ? 'bg-[#0B0A08] border-white/10 text-[#D8BE99]' : 'bg-[#FAF1DF]/50 border-[#D4AF37]/30 text-[#5A3517]'
                  }`}>
                    <p className="text-xs">
                      {ratingFilter !== null
                        ? `No reviews found matching ${ratingFilter} stars.`
                        : 'No patron reviews yet. Be the first to share your olfactory impression.'}
                    </p>
                    {ratingFilter !== null ? (
                      <button
                        onClick={() => { setRatingFilter(null); setReviewsPage(1); }}
                        className="text-xs text-[#D4AF37] font-semibold hover:underline"
                      >
                        Clear star filter
                      </button>
                    ) : (
                      <button
                        onClick={handleOpenReviewModal}
                        className="px-5 py-2 border border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] font-cinzel text-xs font-bold uppercase rounded-full hover:bg-[#D4AF37] hover:text-black transition-colors"
                      >
                        Share First Review
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {reviewsTotalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-4">
                  <button
                    onClick={() => setReviewsPage(p => Math.max(1, p - 1))}
                    disabled={reviewsPage === 1}
                    className="p-2 border border-[#D4AF37]/30 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#D4AF37]/20 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#D4AF37]" />
                  </button>
                  <span className="text-xs font-mono text-[#D4AF37]">
                    Page {reviewsPage} of {reviewsTotalPages}
                  </span>
                  <button
                    onClick={() => setReviewsPage(p => Math.min(reviewsTotalPages, p + 1))}
                    disabled={reviewsPage === reviewsTotalPages}
                    className="p-2 border border-[#D4AF37]/30 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#D4AF37]/20 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* WRITE REVIEW MODAL */}
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className={`relative w-full max-w-lg border p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6 ${
              isDark ? 'bg-[#0E0C09] border-[#D4AF37]/40 text-[#F3E6D0]' : 'bg-[#FFFDF9] border-[#D4AF37]/50 text-[#120B06]'
            }`}>
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20">
                <div>
                  <h3 className="font-cinzel text-base sm:text-lg font-bold text-[#D4AF37] uppercase tracking-wider">
                    Submit Olfactory Review
                  </h3>
                  <p className="text-[11px] text-neutral-400 truncate max-w-xs mt-0.5">
                    {displayName}
                  </p>
                </div>
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-2 text-neutral-400 hover:text-[#D4AF37] transition-colors rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Feedback messages */}
              {reviewSuccessMessage && (
                <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                  <span>{reviewSuccessMessage}</span>
                </div>
              )}

              {reviewErrorMessage && (
                <div className="p-4 bg-red-950/60 border border-red-500/50 rounded-xl text-xs text-red-300 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                  <span>{reviewErrorMessage}</span>
                </div>
              )}

              {!reviewSuccessMessage && (
                <form onSubmit={handleReviewSubmit} className="space-y-5">
                  {/* Order Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-cinzel font-bold uppercase tracking-wider text-[#D4AF37]">
                      Qualifying Purchase Order: <span className="text-red-500">*</span>
                    </label>

                    {loadingOrders ? (
                      <p className="text-xs text-neutral-400 animate-pulse">Checking verified orders...</p>
                    ) : eligibleOrders.length > 0 ? (
                      <select
                        value={selectedOrderId}
                        onChange={(e) => setSelectedOrderId(e.target.value)}
                        required
                        className={`w-full border px-3.5 py-2.5 text-xs rounded-xl focus:border-[#D4AF37] focus:outline-none ${
                          isDark ? 'bg-black/60 border-white/20 text-[#F3E6D0]' : 'bg-white border-[#D4AF37]/40 text-[#120B06]'
                        }`}
                      >
                        {eligibleOrders.map((ord) => (
                          <option key={ord.id} value={ord.orderNumber || ord.numericId || ord.id}>
                            {ord.orderNumber || `Order #${ord.id}`} — {new Date(ord.date).toLocaleDateString()} ({ord.status})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="space-y-2">
                        <p className={`text-[11px] leading-relaxed ${isDark ? 'text-[#D8BE99]/80' : 'text-[#5A3517]/80'}`}>
                          Verified Purchase Required: To maintain authentic impressions, reviews can only be linked to completed orders containing this creation.
                        </p>
                        <input
                          type="text"
                          placeholder="Enter your Order ID (e.g. 101)"
                          value={manualOrderId}
                          onChange={(e) => setManualOrderId(e.target.value)}
                          required
                          className={`w-full border px-3.5 py-2 text-xs rounded-xl focus:border-[#D4AF37] focus:outline-none ${
                            isDark ? 'bg-black/60 border-white/20 text-[#F3E6D0]' : 'bg-white border-[#D4AF37]/40 text-[#120B06]'
                          }`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Star Rating Picker */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-cinzel font-bold uppercase tracking-wider text-[#D4AF37]">
                        Rating: <span className="text-red-500">*</span>
                      </label>
                      <span className="text-xs font-serif italic text-neutral-400">
                        {reviewRating === 5 && '5 — Royal & Exceptional'}
                        {reviewRating === 4 && '4 — Very Good'}
                        {reviewRating === 3 && '3 — Pleasant'}
                        {reviewRating === 2 && '2 — Modest'}
                        {reviewRating === 1 && '1 — Disappointing'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onMouseEnter={() => setReviewHoverRating(s)}
                          onMouseLeave={() => setReviewHoverRating(0)}
                          onClick={() => setReviewRating(s)}
                          className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              (reviewHoverRating || reviewRating) >= s
                                ? 'fill-[#D4AF37] text-[#D4AF37]'
                                : 'text-neutral-500'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment Textarea with Character Counter */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-cinzel font-bold uppercase tracking-wider text-[#D4AF37]">
                        Patron Impressions:
                      </label>
                      <span className={`font-mono text-[11px] ${reviewComment.length >= 1900 ? 'text-amber-500 font-bold' : 'text-neutral-400'}`}>
                        {reviewComment.length} / 2000
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      maxLength={2000}
                      placeholder="Describe the projection, notes, longevity, and emotional feeling of this creation..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className={`w-full border p-3.5 text-xs rounded-xl focus:border-[#D4AF37] focus:outline-none transition-colors leading-relaxed ${
                        isDark ? 'bg-black/60 border-white/20 text-[#F3E6D0]' : 'bg-white border-[#D4AF37]/40 text-[#120B06]'
                      }`}
                    />
                  </div>

                  {/* Moderation Warning */}
                  <div className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
                    isDark ? 'bg-[#0B0A08] border-white/10 text-[#D8BE99]' : 'bg-[#FAF1DF]/60 border-[#D4AF37]/30 text-[#5A3517]'
                  }`}>
                    Submitted reviews undergo royal moderation before being published to ensure authentic patron experiences.
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsReviewModalOpen(false)}
                      className="px-5 py-2.5 border border-white/20 text-xs uppercase font-cinzel rounded-full hover:border-[#D4AF37] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Royal Review'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

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
                          src={relatedProducts[0].cutoutImage || relatedProducts[0].images?.[0] || '/products/luxury_designs/07_arabian_gold.webp'}
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
