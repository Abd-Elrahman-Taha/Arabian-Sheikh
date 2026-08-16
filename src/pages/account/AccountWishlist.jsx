import React, { useState, useEffect } from 'react';
import { Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useWishlist } from '../../context/WishlistContext';
import { productService } from '../../services/productService';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

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
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-[#C6A15B]/20 pb-3">
        <h2 className="font-cinzel text-xl font-bold uppercase text-[#F3EEE5]">
          {t('account.wishlist')}
        </h2>
        <span className="text-xs text-[#C5B8A8] font-mono">{products.length} items saved</span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-[#C5B8A8]">Retrieving wishlist items...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-[#241712] border border-[#C6A15B]/15 space-y-3">
          <Heart className="w-10 h-10 text-[#C6A15B] mx-auto opacity-50" />
          <h3 className="font-cinzel text-base text-[#F3EEE5]">Your Wishlist is Empty</h3>
          <p className="text-xs text-[#C5B8A8] max-w-xs mx-auto">
            You have not preserved any masterpieces in your private wishlist yet.
          </p>
          <Link to="/shop" className="luxury-btn-gold px-6 py-2.5 text-xs inline-block">
            {t('cart.startShopping')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-[#241712] border border-[#C6A15B]/20 flex flex-col justify-between overflow-hidden group shadow-lg"
            >
              <div className="relative aspect-[4/5] bg-[#0F0D0C]">
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-3 right-3 p-2 bg-[#0F0D0C]/80 text-[#C5B8A8] hover:text-red-400 border border-[#C6A15B]/20"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#C6A15B] font-mono">
                    {product.fragranceFamily}
                  </span>
                  <h4 className="font-cinzel text-base font-semibold text-[#F3EEE5] line-clamp-1">
                    {product.name}
                  </h4>
                  <p className="font-arabic text-xs text-[#C5B8A8]">{product.arabicName}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#C6A15B]/15">
                  <span className="font-cinzel text-base font-bold text-[#C6A15B]">
                    ${product.price}
                  </span>
                  <button
                    onClick={() => moveToCart(product, '100ml')}
                    className="luxury-btn-gold px-3.5 py-1.5 text-xs flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
