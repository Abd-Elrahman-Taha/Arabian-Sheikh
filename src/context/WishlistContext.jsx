import React, { createContext, useContext, useState, useEffect } from 'react';
import { wishlistService } from '../services/wishlistService';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { success, info } = useToast();
  const { addToCart, openAuthModal } = useCart();
  const [wishlist, setWishlist] = useState(() => wishlistService.getWishlist());
  const [heartAnimatedId, setHeartAnimatedId] = useState(null);

  const toggleWishlist = (product) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    const isSaved = wishlist.includes(product.id);
    const updated = wishlistService.toggleWishlist(product.id);
    setWishlist(updated);

    // Trigger animation for this specific product heart
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
    setWishlist(updated);
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  const moveToCart = (product, size = '100ml') => {
    const added = addToCart(product, size, 1);
    if (added) {
      removeFromWishlist(product.id);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
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
