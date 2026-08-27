import React, { createContext, useContext, useState, useEffect } from 'react';
import { wishlistService } from '../services/wishlistService';
import { productService } from '../services/productService';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { success, info } = useToast();
  const { addToCart, openAuthModal } = useCart();

  // wishlistIds — array of product IDs saved by the user
  const [wishlistIds, setWishlistIds] = useState(() => wishlistService.getWishlist());
  // wishlistProducts — full product objects resolved from IDs
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [heartAnimatedId, setHeartAnimatedId] = useState(null);

  // Whenever the saved IDs change, resolve them to full product objects
  useEffect(() => {
    if (wishlistIds.length === 0) {
      setWishlistProducts([]);
      return;
    }

    // Try to resolve from the local product cache first (sync, instant)
    const allCached = productService.getAllProductsSync({});
    const resolved = wishlistIds
      .map(id => allCached.find(p => String(p.id) === String(id)))
      .filter(Boolean);

    if (resolved.length === wishlistIds.length) {
      setWishlistProducts(resolved);
    } else {
      // Some products aren't in cache yet — fetch from API then resolve
      productService.getAllProducts({}).then(all => {
        const fromApi = wishlistIds
          .map(id => all.find(p => String(p.id) === String(id)))
          .filter(Boolean);
        setWishlistProducts(fromApi);
      }).catch(() => {
        setWishlistProducts(resolved); // fall back to whatever we found in cache
      });
    }
  }, [wishlistIds]);

  const toggleWishlist = (product) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    const isSaved = wishlistIds.includes(product.id);
    const updated = wishlistService.toggleWishlist(product.id);
    setWishlistIds(updated);

    setHeartAnimatedId(product.id);
    setTimeout(() => setHeartAnimatedId(null), 500);

    if (isSaved) {
      info(`Removed ${product.name} from your saved creations.`);
    } else {
      success(`Saved ${product.name} to your Private Vault.`);
    }
  };

  const removeFromWishlist = (productId) => {
    const updated = wishlistService.removeFromWishlist(productId);
    setWishlistIds(updated);
  };

  const isInWishlist = (productId) => wishlistIds.includes(productId);

  const moveToCart = (product, size = '100ml') => {
    const added = addToCart(product, size, 1);
    if (added) {
      removeFromWishlist(product.id);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist: wishlistProducts,   // full product objects for the UI
        wishlistIds,                  // raw IDs for isInWishlist checks
        wishlistCount: wishlistIds.length,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        moveToCart,
        heartAnimatedId
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
