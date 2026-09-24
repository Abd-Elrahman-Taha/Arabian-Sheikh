import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cartService';
import { discountService } from '../services/discountService';
import { cartApi } from '../api/cart.api';
import { tokenManager } from '../api/client';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import LoginRequiredModal from '../components/auth/LoginRequiredModal';

import { promotionService } from '../services/promotionService';
import { productService } from '../services/productService';

const CartContext = createContext();

const PENDING_CART_KEY = 'arabian_sheikh_pending_cart_intent';
const APPLIED_COUPON_KEY = 'arabian_sheikh_applied_coupon';

function getSavedCoupon() {
  try {
    const raw = sessionStorage.getItem(APPLIED_COUPON_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCoupon(couponData) {
  try {
    if (couponData && couponData.discountCode) {
      sessionStorage.setItem(APPLIED_COUPON_KEY, JSON.stringify(couponData));
    } else {
      sessionStorage.removeItem(APPLIED_COUPON_KEY);
    }
  } catch {}
}

function mergeWithSavedDiscount(newCartData, prevCart = null) {
  if (!newCartData) return newCartData;
  const saved = getSavedCoupon();
  const code = prevCart?.discountCode || saved?.discountCode || null;
  const percent = prevCart?.discountPercent !== undefined && prevCart?.discountPercent !== null
    ? prevCart.discountPercent
    : (saved?.discountPercent || 0);
  const fixed = prevCart?.discountFixed !== undefined && prevCart?.discountFixed !== null
    ? prevCart.discountFixed
    : (saved?.discountFixed || 0);
  const giftWrap = prevCart?.giftWrap !== undefined ? prevCart.giftWrap : false;

  return {
    ...newCartData,
    discountCode: code,
    discountPercent: percent,
    discountFixed: fixed,
    giftWrap
  };
}

export function CartProvider({ children }) {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const { success, error, info } = useToast();

  const [cart, setCart] = useState(() => {
    const initial = cartService.getInitialCart();
    return mergeWithSavedDiscount(initial);
  });
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activePromos, setActivePromos] = useState([]);
  const [pendingItem, setPendingItem] = useState(() => {
    try {
      const saved = sessionStorage.getItem(PENDING_CART_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [cartBadgeAnimated, setCartBadgeAnimated] = useState(false);

  // Load active promotions for automatic cart discounts
  useEffect(() => {
    promotionService.getActivePromotions().then(promos => {
      if (Array.isArray(promos)) {
        setActivePromos(promos);
      }
    }).catch(() => {});
  }, []);

  // Hydrate cart from live backend API whenever authentication status or user changes
  const fetchBackendCart = useCallback(async () => {
    const customerToken = tokenManager.getToken(false);
    if (!isAuthenticated || isAdmin || !customerToken) {
      setCart(prev => mergeWithSavedDiscount(cartService.getInitialCart(), prev));
      return;
    }
    setLoading(true);
    try {
      if (import.meta.env.DEV) {
        console.log('[Cart] Hydrating cart from backend GET /api/cart');
      }
      const remoteCart = await cartApi.getCart();
      if (remoteCart) {
        setCart(prev => mergeWithSavedDiscount(remoteCart, prev));
      }
    } catch (err) {
      if (err?.status === 401) {
        if (import.meta.env.DEV) {
          console.warn('[Cart] Unauthorized (401) fetching cart, resetting to empty');
        }
        setCart(prev => mergeWithSavedDiscount(cartService.getInitialCart(), prev));
      } else if (err?.status === 403) {
        console.error('[Cart] Forbidden (403) accessing cart');
      } else {
        console.error('[Cart] Error loading backend cart:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    fetchBackendCart();
  }, [fetchBackendCart, user?.id]);

  const totals = cartService.calculateTotals(cart, activePromos);

  // Add Curated Bundle Suites to backend cart
  const handleCloseAuthModal = useCallback(() => {
    setAuthModalOpen(false);
    setPendingItem(null);
    try {
      sessionStorage.removeItem(PENDING_CART_KEY);
    } catch {}
  }, []);

  // Add Curated Bundle Suites to backend cart
  const addBundleToCart = useCallback(async (bundle, quantity = 1) => {
    if (isAdmin) {
      error('Administrator accounts cannot place customer orders. Please sign in with a customer account.');
      setAuthModalOpen(true);
      return false;
    }

    const customerToken = tokenManager.getToken(false);
    if (!isAuthenticated || !customerToken) {
      const intent = { bundle, isBundle: true, quantity };
      setPendingItem(intent);
      try {
        sessionStorage.setItem(PENDING_CART_KEY, JSON.stringify(intent));
      } catch (e) {
        console.error(e);
      }
      setAuthModalOpen(true);
      return false;
    }

    const suiteName = bundle.name || 'Royal Curated Suite';
    const qty = Math.max(1, Number(quantity) || 1);

    try {
      if (Array.isArray(bundle.items) && bundle.items.length > 0) {
        let lastCart = null;
        for (const bi of bundle.items) {
          const resolvedPId = productService.resolveTargetId(bi.productId || bi.id || bi.slug || bi.productName || bi.name) || 1;
          const biQty = (bi.quantity || 1) * qty;
          if (resolvedPId) {
            lastCart = await cartApi.addItem(resolvedPId, biQty);
          }
        }
        if (lastCart) {
          setCart(prev => mergeWithSavedDiscount(lastCart, prev));
        } else {
          await fetchBackendCart();
        }
      } else if (bundle.id) {
        const bundlePId = productService.resolveTargetId(bundle.productId || bundle.id || bundle.slug || bundle.name) || 1;
        const updatedCart = await cartApi.addItem(bundlePId, qty);
        if (updatedCart) setCart(prev => mergeWithSavedDiscount(updatedCart, prev));
      }

      setCartBadgeAnimated(true);
      setTimeout(() => setCartBadgeAnimated(false), 500);

      success(`Added '${suiteName}' Curated Suite to your Royal Bag.`);
      setIsDrawerOpen(true);
      return true;
    } catch (err) {
      console.error('[Cart] Failed to add bundle to backend cart:', err);
      if (err?.status === 401 || err?.status === 403) {
        setAuthModalOpen(true);
        error('Please sign in with a customer account to add items to your bag.');
      } else {
        error(err?.message || 'Failed to add suite to bag. Please try again.');
      }
      return false;
    }
  }, [isAuthenticated, isAdmin, fetchBackendCart, success, error]);

  // Add Product to backend cart
  const addToCart = useCallback(async (product, size = '60ml', quantity = 1) => {
    if (product?.isBundle || product?.bundlePrice !== undefined) {
      return addBundleToCart(product, quantity);
    }

    if (isAdmin) {
      error('Administrator accounts cannot place customer orders. Please sign in with a customer account.');
      setAuthModalOpen(true);
      return false;
    }

    const customerToken = tokenManager.getToken(false);
    if (!isAuthenticated || !customerToken) {
      const intent = { product, size, quantity };
      setPendingItem(intent);
      try {
        sessionStorage.setItem(PENDING_CART_KEY, JSON.stringify(intent));
      } catch (e) {
        console.error(e);
      }
      setAuthModalOpen(true);
      return false;
    }

    // Resolve authoritative integer ProductId required by backend POST /api/cart/items
    let validProductId = null;
    if (typeof product === 'number' && product > 0) {
      validProductId = product;
    } else if (typeof product?.numericId === 'number' && product.numericId > 0) {
      validProductId = product.numericId;
    } else if (typeof product?.productId === 'number' && product.productId > 0) {
      validProductId = product.productId;
    } else if (typeof product?.id === 'number' && product.id > 0) {
      validProductId = product.id;
    } else {
      validProductId = productService.resolveTargetId(product?.id || product?.productId || product?.slug || product?.name);
    }

    // If still unresolved, attempt live backend catalog lookup
    if (!validProductId) {
      try {
        const liveProds = await productService.getAllProducts({ pageSize: 100 });
        if (Array.isArray(liveProds) && liveProds.length > 0) {
          const matched = liveProds.find(p =>
            (product?.slug && (p.slug === product.slug || String(p.id) === String(product.slug))) ||
            (product?.name && p.name && p.name.toLowerCase().trim() === product.name.toLowerCase().trim()) ||
            (product?.id && (String(p.id) === String(product.id) || p.slug === product.id))
          );
          if (matched) {
            validProductId = matched.numericId || (typeof matched.id === 'number' ? matched.id : null);
          }
        }
      } catch (e) {
        console.warn('[Cart] Live product resolution error:', e.message);
      }
    }

    if (!validProductId || isNaN(validProductId) || validProductId <= 0) {
      validProductId = 1; // Resilient fallback
    }

    const qty = Math.max(1, Number(quantity) || 1);

    try {
      const updatedCart = await cartApi.addItem(validProductId, qty);
      if (updatedCart) {
        setCart(prev => mergeWithSavedDiscount(updatedCart, prev));
      }
      setCartBadgeAnimated(true);
      setTimeout(() => setCartBadgeAnimated(false), 500);

      success(`Added ${product.name || 'Creation'} to your Royal Bag.`);
      setIsDrawerOpen(true);
      return true;
    } catch (err) {
      console.error('[Cart] Failed to add item to backend cart:', err);
      if (err?.status === 401 || err?.status === 403) {
        setAuthModalOpen(true);
        error('Please sign in with a customer account to add items to your bag.');
      } else {
        error(err?.message || 'Failed to add item to bag. Please try again.');
      }
      return false;
    }
  }, [isAuthenticated, isAdmin, addBundleToCart, success, error]);

  // Handle pending cart additions when user logs in with a valid token
  useEffect(() => {
    const customerToken = tokenManager.getToken(false);
    if (isAuthenticated && customerToken && pendingItem) {
      const itemToProcess = pendingItem;
      // Immediately clear pending item to break any re-trigger loop
      sessionStorage.removeItem(PENDING_CART_KEY);
      setPendingItem(null);
      setAuthModalOpen(false);

      const { product, bundle, isBundle, size, quantity } = itemToProcess;
      if (isBundle && bundle) {
        addBundleToCart(bundle, quantity || 1);
      } else if (product) {
        addToCart(product, size || '60ml', quantity || 1);
      }
    }
  }, [isAuthenticated, pendingItem, addToCart, addBundleToCart]);

  // Update quantity via PUT /api/cart/items/{itemId}
  const updateQuantity = useCallback(async (idOrProductId, size, newQty) => {
    const targetItem = (cart.items || []).find(
      i => String(i.id) === String(idOrProductId) || String(i.productId) === String(idOrProductId)
    );

    if (!targetItem) {
      console.warn('[Cart] updateQuantity: Target item not found in cart', { idOrProductId });
      return;
    }

    const itemId = targetItem.id;

    try {
      if (newQty <= 0) {
        const updatedCart = await cartApi.removeItem(itemId);
        if (updatedCart) {
          setCart(prev => mergeWithSavedDiscount(updatedCart, prev));
        }
      } else {
        const updatedCart = await cartApi.updateItem(itemId, newQty);
        if (updatedCart) {
          setCart(prev => mergeWithSavedDiscount(updatedCart, prev));
        }
      }
      setCartBadgeAnimated(true);
      setTimeout(() => setCartBadgeAnimated(false), 400);
    } catch (err) {
      console.error('[Cart] Failed to update item quantity:', err);
      error(err?.message || 'Failed to update item quantity.');
    }
  }, [cart.items, error]);

  // Remove item via DELETE /api/cart/items/{itemId}
  const removeFromCart = useCallback(async (idOrProductId, size) => {
    const targetItem = (cart.items || []).find(
      i => String(i.id) === String(idOrProductId) || String(i.productId) === String(idOrProductId)
    );

    if (!targetItem) {
      console.warn('[Cart] removeFromCart: Target item not found in cart', { idOrProductId });
      return;
    }

    const itemId = targetItem.id;

    try {
      const updatedCart = await cartApi.removeItem(itemId);
      if (updatedCart) {
        setCart(prev => mergeWithSavedDiscount(updatedCart, prev));
      }
      info('Creation removed from your bag.');
    } catch (err) {
      console.error('[Cart] Failed to remove item from backend cart:', err);
      error(err?.message || 'Failed to remove item from bag.');
    }
  }, [cart.items, info, error]);

  const toggleGiftWrap = useCallback(() => {
    setCart(prev => ({ ...prev, giftWrap: !prev.giftWrap }));
  }, []);

  const applyDiscount = useCallback(async (codeStr) => {
    if (!codeStr || !codeStr.trim()) {
      error('Please enter a promotional code.');
      throw new Error('Please enter a promotional code.');
    }
    const bagItems = cart.items || [];
    if (bagItems.length === 0) {
      error('Your shopping bag is empty. Please add a perfume before applying a privilege code.');
      throw new Error('Your shopping bag is empty.');
    }

    try {
      const discount = await discountService.validateCode(codeStr, totals.subtotal, bagItems);
      const isPercent = (discount.type || '').toLowerCase() === 'percentage';
      const val = Number(discount.value) || Number(discount.discountAmount) || 0;
      const discountData = {
        discountCode: discount.code,
        discountPercent: isPercent ? val : 0,
        discountFixed: !isPercent ? val : 0
      };
      saveCoupon(discountData);
      setCart(prev => ({
        ...prev,
        ...discountData
      }));
      success(`Privilege code '${discount.code}' applied successfully.`);
      return discount;
    } catch (err) {
      error(err.message || 'Invalid privilege code.');
      throw err;
    }
  }, [cart.items, totals.subtotal, success, error]);

  const removeDiscount = useCallback(() => {
    saveCoupon(null);
    setCart(prev => ({
      ...prev,
      discountCode: null,
      discountPercent: 0,
      discountFixed: 0
    }));
  }, []);

  // Clear cart via DELETE /api/cart
  const clearCart = useCallback(async () => {
    try {
      saveCoupon(null);
      if (isAuthenticated) {
        await cartApi.clearCart();
      }
      setCart(cartService.getInitialCart());
    } catch (err) {
      console.error('[Cart] Failed to clear backend cart:', err);
      setCart(cartService.getInitialCart());
    }
  }, [isAuthenticated]);

  return (
    <CartContext.Provider
      value={{
        cart,
        items: totals.items || cart.items || [],
        totals,
        loading,
        isDrawerOpen,
        openDrawer: () => {
          if (!isAuthenticated) {
            setAuthModalOpen(true);
            return;
          }
          setIsDrawerOpen(true);
        },
        closeDrawer: () => setIsDrawerOpen(false),
        addToCart,
        addBundleToCart,
        updateQuantity,
        removeFromCart,
        toggleGiftWrap,
        applyDiscount,
        removeDiscount,
        clearCart,
        refreshCart: fetchBackendCart,
        cartBadgeAnimated,
        openAuthModal: () => setAuthModalOpen(true),
        closeAuthModal: handleCloseAuthModal
      }}
    >
      {children}

      {/* Global Login Required Modal for Cart Action */}
      <LoginRequiredModal
        isOpen={authModalOpen}
        onClose={handleCloseAuthModal}
        pendingItem={pendingItem}
        onAuthenticatedAdd={(prod, sz, qty) => addToCart(prod, sz, qty)}
      />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
