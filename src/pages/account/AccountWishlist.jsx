import React from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

export default function AccountWishlist() {
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-16 space-y-4 text-[#F3E6D0]">
        <div className="w-16 h-16 rounded-full border border-[#3A2116] flex items-center justify-center mx-auto text-[#D4AF37] bg-[#21130D]">
          <Heart className="w-8 h-8 opacity-60" />
        </div>
        <h3 className="font-cinzel text-lg font-bold text-[#F3E6D0]">Your Vault Wishlist is Empty</h3>
        <p className="text-xs text-[#D8BE99] max-w-sm mx-auto">
          Explore the Palace boutique and save your favored 60ml flacons and extraits.
        </p>
        <Link to="/shop" className="inline-block px-6 py-2.5 bg-[#D4AF37] text-black font-cinzel text-xs uppercase font-bold tracking-wider">
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#F3E6D0]">
      <div className="border-b border-[#3A2116]/40 pb-4">
        <h2 className="font-cinzel text-xl font-bold uppercase tracking-wider text-[#F3E6D0]">
          Vault Wishlist ({wishlist.length})
        </h2>
        <p className="text-xs text-[#D8BE99]">
          Curated creations saved for future acquisitions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {wishlist.map((item) => (
          <div key={item.id} className="p-4 bg-[#21130D] border border-[#3A2116]/60 flex flex-col justify-between space-y-3">
            <img
              src={item.cutoutImage || item.images?.[0] || '/products/black_diamond_gold.png'}
              alt={item.name}
              className="h-32 mx-auto object-contain"
            />
            <div>
              <h4 className="font-cinzel font-bold text-xs text-[#F3E6D0] line-clamp-1">{item.name}</h4>
              <p className="font-mono text-xs text-[#D4AF37] font-bold">€{item.price}</p>
            </div>
            <div className="flex gap-2 pt-2 border-t border-[#3A2116]/40">
              <button
                onClick={() => addToCart(item, '60 ml', 1)}
                className="flex-1 py-2 bg-[#D4AF37] hover:bg-[#F2D675] text-black font-cinzel font-bold text-[10px] uppercase tracking-wider transition-colors"
              >
                Add to Bag
              </button>
              <button
                onClick={() => removeFromWishlist(item.id)}
                className="p-2 bg-[#21130D] text-[#D8BE99] hover:text-rose-400 border border-[#3A2116]/50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
