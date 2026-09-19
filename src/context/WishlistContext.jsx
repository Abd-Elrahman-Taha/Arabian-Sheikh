import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistService } from '../services/wishlistService';
import { productService } from '../services/productService';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { success, error, info } = useToast();
  const { addToCart, openAuthModal, refreshCart } = useCart();

  // wishlistItems — raw items from backend GET /api/wishlist
  const [wishlistItems, setWishlistItems] = useState([]);
  // wishlistProducts — enriched items with catalog data for rich UI
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [heartAnimatedId, setHeartAnimatedId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Hydrate wishlist from backend GET /api/wishlist
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      setWishlistProducts([]);
      return;
    }
    setLoading(true);
    try {
      const items = await wishlistService.getWishlist();
      setWishlistItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.warn('[WishlistContext] Failed to load wishlist:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Enrich wishlist items with product catalog data whenever wishlistItems change
  useEffect(() => {
    if (wishlistItems.length === 0) {
      setWishlistProducts([]);
      return;
    }

    const allCached = productService.getAllProductsSync({});
    const enriched = wishlistItems.map(item => {
      const pId = Number(item.productId || item.id);
      const matchedCatalog = allCached.find(p => Number(p.id || p.productId) === pId || p.slug === item.productId || String(p.id) === String(item.productId));

      const img = item.imageUrl || item.image || matchedCatalog?.cutoutImage || matchedCatalog?.images?.[0] || '/products/luxury_designs/07_arabian_gold.webp';

      return {
        ...(matchedCatalog || {}),
        ...item,
        id: item.id || matchedCatalog?.id,
        productId: pId || matchedCatalog?.id,
        name: item.productName || matchedCatalog?.name || 'Imperial Creation',
        productName: item.productName || matchedCatalog?.name || 'Imperial Creation',
        price: item.price !== undefined && item.price !== null ? Number(item.price) : (matchedCatalog?.price || 0),
        currency: item.currency || 'EUR',
        imageUrl: img,
        image: img,
        cutoutImage: img,
        images: [img],
        tier: item.tier || matchedCatalog?.tier || matchedCatalog?.perfumeCategoryName || 'Standard'
      };
    });

    setWishlistProducts(enriched);
  }, [wishlistItems]);

  const wishlistIds = wishlistItems.map(item => Number(item.productId || item.id)).filter(id => !isNaN(id) && id > 0);

  const isInWishlist = useCallback((productId) => {
    if (!productId) return false;
    const targetId = Number(productId);
    return wishlistItems.some(item => {
      const pId = Number(item.productId || item.id);
      return (!isNaN(targetId) && pId === targetId) || String(item.productId) === String(productId) || String(item.id) === String(productId);
    });
  }, [wishlistItems]);

  const toggleWishlist = useCallback(async (product) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    if (!product) return;
    const pId = Number(product.productId || product.id || product.numericId);
    if (!pId || isNaN(pId)) {
      error('Could not identify product for wishlist.');
      return;
    }

    const isSaved = isInWishlist(pId);
    setHeartAnimatedId(pId);
    setTimeout(() => setHeartAnimatedId(null), 500);

    try {
      if (isSaved) {
        await wishlistService.removeItem(pId);
        info(`Removed ${product.name || 'Creation'} from your saved vault.`);
      } else {
        await wishlistService.addItem(pId);
        success(`Saved ${product.name || 'Creation'} to your Private Vault.`);
      }
      await fetchWishlist();
    } catch (err) {
      console.error('[WishlistContext] Toggle error:', err);
      error(err.message || 'Failed to update wishlist.');
    }
  }, [isAuthenticated, isInWishlist, openAuthModal, fetchWishlist, success, info, error]);

  const removeFromWishlist = useCallback(async (productId) => {
    const pId = Number(productId);
    if (!pId || isNaN(pId)) return;

    try {
      await wishlistService.removeItem(pId);
      info('Item removed from your saved vault.');
      await fetchWishlist();
    } catch (err) {
      console.error('[WishlistContext] Remove error:', err);
      error('Failed to remove item from wishlist.');
    }
  }, [fetchWishlist, info, error]);

  const moveToCart = useCallback(async (product, size = '60 ml') => {
    if (!product) return;
    const pId = Number(product.productId || product.id || product.numericId);

    try {
      if (isAuthenticated) {
        await wishlistService.moveToCart(pId);
        if (refreshCart) {
          await refreshCart();
        }
      } else {
        addToCart(product, size, 1);
        await removeFromWishlist(pId);
      }
      success(`Moved ${product.name || product.productName || 'Creation'} to your bag.`);
      await fetchWishlist();
    } catch (err) {
      console.error('[WishlistContext] Move to cart error:', err);
      // Fallback: addToCart directly and remove from wishlist
      try {
        const added = addToCart(product, size, 1);
        if (added) {
          await removeFromWishlist(pId);
          success(`Moved ${product.name || 'Creation'} to your bag.`);
        }
      } catch (fallbackErr) {
        error(fallbackErr.message || 'Failed to move creation to bag.');
      }
    }
  }, [isAuthenticated, addToCart, removeFromWishlist, refreshCart, fetchWishlist, success, error]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist: wishlistProducts,
        wishlistIds,
        wishlistCount: wishlistProducts.length,
        loading,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        moveToCart,
        heartAnimatedId,
        refreshWishlist: fetchWishlist
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

export default WishlistContext;
