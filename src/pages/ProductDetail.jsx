import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { useTranslation } from '../i18n/LanguageContext';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/common/ProductCard';
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
  Lock
} from 'lucide-react';

export default function ProductDetail() {
  const { currentPath, navigate } = useRouter();
  const { t, language, isRtl } = useTranslation();
  const { addToCart, openDrawer } = useCart();
  const { isInWishlist, toggleWishlist, heartAnimatedId } = useWishlist();
  const { success, error } = useToast();

  const productId = currentPath.split('/product/')[1]?.split('?')[0];

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('60 ml / 2.0 fl oz');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('pyramid');
  const [loading, setLoading] = useState(true);

  // Review submission state
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      setLoading(true);
      try {
        const item = await productService.getProductById(productId);
        if (item) {
          setProduct(item);
          setSelectedImage(0);
          setSelectedSize(item.size || '60 ml / 2.0 fl oz');
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
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <h2 className="font-cinzel text-2xl font-bold text-[#F8F5F0]">
          Creation Not Found
        </h2>
        <p className="text-xs text-[#A69E94]">
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
    <div className="min-h-screen bg-[#0A0A0B] text-[#F8F5F0] pt-28 sm:pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#8C6D37] mb-8 font-cinzel uppercase tracking-wider">
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
          <span className="text-[#F8F5F0] truncate max-w-xs">{displayName}</span>
        </div>

        {/* Product Master Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          
          {/* Left Column: Flacon Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Main Stage */}
            <div className="relative aspect-[3/4] bg-gradient-to-b from-[#141212] via-[#0D0B0B] to-[#0A0A0B] border border-[#D4AF37]/25 p-8 sm:p-12 flex items-center justify-center overflow-hidden shadow-2xl">
              
              {/* Badges */}
              <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 z-10 flex flex-col gap-2">
                {product.tier && (
                  <span className="bg-[#D4AF37] text-black font-cinzel font-bold text-xs uppercase tracking-widest px-3 py-1 shadow-md">
                    {product.tier} Tier
                  </span>
                )}
                {isOutOfStock && (
                  <span className="bg-red-900/90 text-white font-sans text-xs uppercase px-2.5 py-0.5">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`absolute top-4 right-4 rtl:right-auto rtl:left-4 z-10 p-3 rounded-full backdrop-blur-md border transition-all ${
                  isSaved
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                    : 'bg-black/60 text-[#E5E0D8] border-white/20 hover:border-[#D4AF37]'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>

              {/* High Resolution Flacon Showcase */}
              <img
                src={galleryImages[selectedImage] || galleryImages[0]}
                alt={displayName}
                className="max-h-[90%] w-auto object-contain filter drop-shadow-[0_25px_40px_rgba(0,0,0,0.95)] hover:scale-105 transition-transform duration-700 select-none"
              />

              {/* Ambient ground drop shadow */}
              <div className="absolute bottom-6 w-48 h-5 bg-black/80 rounded-full blur-lg pointer-events-none" />
            </div>

            {/* Thumbnail Navigation */}
            {galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`h-20 w-20 flex-shrink-0 bg-[#121010] border p-2 flex items-center justify-center transition-all ${
                      selectedImage === idx ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-white/10 hover:border-white/30'
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
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-cinzel mb-2">
                <span>{product.fragranceFamily || 'Haute Parfumerie'}</span>
                <span>•</span>
                <span>{product.concentration || 'Extrait de Parfum'}</span>
              </div>

              {/* Main Title */}
              <h1 className="text-3xl sm:text-4xl font-cinzel font-bold text-[#F8F5F0] leading-tight mb-2">
                {displayName}
              </h1>

              {/* Tagline */}
              <p className="text-sm text-[#C5A059] font-serif italic mb-4">
                "{product.tagline || product.description}"
              </p>

              {/* Rating Summary */}
              <div className="flex items-center gap-3 text-xs text-[#A69E94]">
                <div className="flex gap-1 text-[#D4AF37]">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                </div>
                <span className="text-[#F8F5F0] font-bold">{product.rating || '5.0'}</span>
                <span>•</span>
                <span>{product.reviewsCount || product.reviews?.length || 1} Verified Patron Reviews</span>
              </div>
            </div>

            {/* Price Display */}
            <div className="py-4 border-y border-[#D4AF37]/15 flex items-baseline gap-4">
              <span className="font-cinzel text-3xl font-bold text-[#D4AF37]">
                €{product.price}
              </span>
              <span className="text-xs text-[#8C6D37] uppercase tracking-wider">
                EUR (Tax Included • Complimentary DHL over €100)
              </span>
            </div>

            {/* Fixed 60ml Size Selector */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-[#8C6D37] font-cinzel flex items-center justify-between">
                <span>Flacon Volume:</span>
                <span className="text-[#D4AF37] font-semibold">{selectedSize}</span>
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="px-5 py-2.5 border border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] font-cinzel font-bold text-xs tracking-wider rounded-xs"
                >
                  {product.size || '60 ml / 2.0 fl oz'}
                </button>
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                {/* Quantity Controls */}
                <div className="flex items-center border border-[#D4AF37]/30 bg-black/50 rounded-xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-[#E5E0D8] hover:text-[#D4AF37] transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-mono font-bold text-[#D4AF37]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 text-[#E5E0D8] hover:text-[#D4AF37] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3.5 font-cinzel font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300 shadow-xl ${
                    isOutOfStock
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      : 'bg-[#D4AF37] hover:bg-[#E5C07B] text-black font-bold'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Out of Stock' : `Add to Bag (€${product.price * quantity})`}</span>
                </button>
              </div>

              {/* Express Buy Now */}
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/20 text-[#F8F5F0] font-cinzel font-semibold text-xs uppercase tracking-[0.2em] transition-colors"
              >
                Instant Express Checkout
              </button>
            </div>

            {/* Trust Badges & DHL Shipping Estimate */}
            <div className="p-4 bg-[#121010] border border-white/10 rounded space-y-2.5 text-xs text-[#A69E94]">
              <div className="flex items-center gap-2 text-[#E5E0D8]">
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
          
          <div className="flex justify-center border-b border-white/10 mb-8">
            <div className="flex gap-8 text-xs uppercase font-cinzel tracking-[0.25em]">
              <button
                onClick={() => setActiveTab('pyramid')}
                className={`pb-3 border-b-2 transition-colors ${
                  activeTab === 'pyramid' ? 'border-[#D4AF37] text-[#D4AF37] font-bold' : 'border-transparent text-[#A69E94]'
                }`}
              >
                Olfactory Pyramid
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`pb-3 border-b-2 transition-colors ${
                  activeTab === 'performance' ? 'border-[#D4AF37] text-[#D4AF37] font-bold' : 'border-transparent text-[#A69E94]'
                }`}
              >
                Performance Profile
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 border-b-2 transition-colors ${
                  activeTab === 'reviews' ? 'border-[#D4AF37] text-[#D4AF37] font-bold' : 'border-transparent text-[#A69E94]'
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
                <div className="p-6 bg-[#121010] border border-[#D4AF37]/20 space-y-3">
                  <div className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-cinzel font-bold">
                    Top Notes (Opening)
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#E5E0D8]">
                    {product.notes?.top?.map((n, i) => <li key={i}>{n}</li>) || <li>Add fragrance notes</li>}
                  </ul>
                </div>

                {/* Heart Notes */}
                <div className="p-6 bg-[#121010] border border-[#D4AF37]/30 space-y-3 shadow-lg">
                  <div className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-cinzel font-bold">
                    Heart Notes (Core Sillage)
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#E5E0D8]">
                    {product.notes?.heart?.map((n, i) => <li key={i}>{n}</li>) || <li>Add fragrance notes</li>}
                  </ul>
                </div>

                {/* Base Notes */}
                <div className="p-6 bg-[#121010] border border-[#D4AF37]/20 space-y-3">
                  <div className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-cinzel font-bold">
                    Base Notes (Drydown)
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#E5E0D8]">
                    {product.notes?.base?.map((n, i) => <li key={i}>{n}</li>) || <li>Add fragrance notes</li>}
                  </ul>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: Performance Profile */}
          {activeTab === 'performance' && (
            <div className="max-w-3xl mx-auto bg-[#121010] border border-[#D4AF37]/20 p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div>
                  <span className="text-[#8C6D37] uppercase tracking-wider block mb-1">Longevity</span>
                  <span className="font-semibold text-base text-[#D4AF37]">{product.longevity || '10-12 Hours'}</span>
                </div>
                <div>
                  <span className="text-[#8C6D37] uppercase tracking-wider block mb-1">Sillage / Projection</span>
                  <span className="font-semibold text-base text-[#F8F5F0]">{product.sillage || 'Strong & Sophisticated'}</span>
                </div>
                <div>
                  <span className="text-[#8C6D37] uppercase tracking-wider block mb-1">Ideal Season</span>
                  <span className="font-semibold text-[#F8F5F0]">{product.season?.join(', ') || 'All Seasons'}</span>
                </div>
                <div>
                  <span className="text-[#8C6D37] uppercase tracking-wider block mb-1">Recommended Occasion</span>
                  <span className="font-semibold text-[#F8F5F0]">{product.occasion?.join(', ') || 'Daily Luxury, Gala'}</span>
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
                    <div key={rev.id} className="p-6 bg-[#121010] border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-cinzel font-bold text-xs text-[#F8F5F0]">{rev.author}</span>
                          <span className="text-emerald-400 text-[10px]">Verified Patron</span>
                        </div>
                        <div className="flex text-[#D4AF37]">
                          {[...Array(rev.rating || 5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                        </div>
                      </div>
                      {rev.title && <h4 className="text-xs font-bold text-[#D4AF37]">{rev.title}</h4>}
                      <p className="text-xs text-[#A69E94]">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-center text-[#8C6D37] py-6">No patron reviews yet. Be the first to share your olfactory impression.</p>
                )}
              </div>

              {/* Review Submission Form */}
              <div className="p-6 bg-[#141212] border border-[#D4AF37]/30 space-y-4">
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
                      className="bg-black/60 border border-white/10 px-3 py-2 text-xs rounded text-[#F8F5F0] focus:border-[#D4AF37] focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Review Title"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="bg-black/60 border border-white/10 px-3 py-2 text-xs rounded text-[#F8F5F0] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Describe the projection, notes, and emotional impression of this fragrance..."
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 p-3 text-xs rounded text-[#F8F5F0] focus:border-[#D4AF37] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-6 py-2.5 bg-[#D4AF37] text-black font-cinzel text-xs font-bold uppercase tracking-wider transition-colors hover:bg-[#E5C07B]"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Royal Review'}
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>

        {/* Related Creations */}
        {relatedProducts.length > 0 && (
          <div className="pt-12 border-t border-white/10 space-y-6">
            <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-[#F8F5F0]">
              Complementary Master Creations
            </h2>
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
