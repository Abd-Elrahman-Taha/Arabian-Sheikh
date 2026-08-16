import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { useToast } from './ToastContext';
import { useCart } from './CartContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => userService.getWishlist());
  const { success, info } = useToast();
  const { addToCart } = useCart();

  const toggleWishlist = (product) => {
    const isSaved = wishlist.includes(product.id);
    const updated = userService.toggleWishlist(product.id);
    setWishlist(updated);

    if (isSaved) {
      info(`Removed ${product.name} from your saved creations.`);
    } else {
      success(`Saved ${product.name} to your wishlist.`);
    }
  };

  const removeFromWishlist = (productId) => {
    const updated = userService.removeFromWishlist(productId);
    setWishlist(updated);
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  const moveToCart = (product, size = '100ml') => {
    addToCart(product, size, 1);
    removeFromWishlist(product.id);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        moveToCart
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
