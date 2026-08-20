import React, { useState, useEffect } from 'react';
import { Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useWishlist } from '../../context/WishlistContext';
import { productService } from '../../services/productService';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import ScrollReveal, { ScrollRevealItem } from '../../components/common/ScrollReveal';

export default function AccountWishlist() {
  const { t } = useTranslation();
  const { wishlist, removeFromWishlist, moveToCart } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlistProducts() {
      setLoading(true);
      try {
        const all = await productService.getAllProducts({ includeDrafts: true });
        const filtered = all.filter((p) => wishlist.includes(p.id));
        setProducts(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadWishlistProducts();
  }, [wishlist]);

  return (
    <div className="space-y-6 animate-fade-in text-[var(--color-earth-dark)]">
      <ScrollReveal direction="up">
        <div className="flex justify-between items-center border-b border-[var(--color-terracotta-deep)]/20 pb-3">
          <h2 className="font-cinzel text-xl font-bold uppercase text-[var(--color-earth-dark)]">
            {t('account.wishlist')}
          </h2>
          <span className="text-xs text-[var(--color-terracotta-deep)] font-mono font-semibold">{products.length} items saved</span>
        </div>
      </ScrollReveal>

      {loading ? (
        <div className="text-center py-12 text-xs text-[var(--color-terracotta-deep)] font-medium">Retrieving wishlist items...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-[var(--color-desert-primary)]/20 border border-[var(--color-terracotta-deep)]/20 space-y-3">
          <Heart className="w-10 h-10 text-[var(--color-terracotta)] mx-auto opacity-70" />
          <h3 className="font-cinzel text-base font-bold text-[var(--color-earth-dark)]">Your Wishlist is Empty</h3>
          <p className="text-xs text-[var(--color-terracotta-deep)] max-w-xs mx-auto font-medium">
            You have not preserved any masterpieces in your private wishlist yet.
          </p>
          <Link to="/shop" className="luxury-btn-gold px-6 py-2.5 text-xs inline-block cursor-pointer">
            {t('cart.startShopping')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <ScrollRevealItem key={product.id} index={index}>
            <div
              className="bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 flex flex-col justify-between overflow-hidden group shadow-sm h-full"
            >
              <div className="relative aspect-[4/5] bg-[var(--color-desert-primary)]">
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-3 right-3 p-2 bg-[var(--color-desert-light)]/90 text-[var(--color-earth-dark)] hover:text-rose-600 border border-[var(--color-terracotta-deep)]/30 backdrop-blur-sm cursor-pointer"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[var(--color-terracotta)] font-mono font-bold">
                    {product.fragranceFamily}
                  </span>
                  <h4 className="font-cinzel text-base font-bold text-[var(--color-earth-dark)] line-clamp-1">
                    {product.name}
                  </h4>
                  <p className="font-arabic text-xs text-[var(--color-terracotta-deep)] font-semibold">{product.arabicName}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--color-terracotta-deep)]/20">
                  <span className="font-cinzel text-base font-bold text-[var(--color-terracotta)]">
                    ${product.price}
                  </span>
                  <button
                    onClick={() => moveToCart(product, '100ml')}
                    className="luxury-btn-gold px-3.5 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </div>
            </div>
            </ScrollRevealItem>
          ))}
        </div>
      )}
    </div>
  );
}
