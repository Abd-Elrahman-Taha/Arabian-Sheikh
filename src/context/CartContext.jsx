import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cartService';
import { discountService } from '../services/discountService';
import { cartApi } from '../api/cart.api';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import LoginRequiredModal from '../components/auth/LoginRequiredModal';

import { promotionService } from '../services/promotionService';

const CartContext = createContext();

const PENDING_CART_KEY = 'arabian_sheikh_pending_cart_intent';

export function CartProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const { success, error, info } = useToast();

  const [cart, setCart] = useState(() => cartService.getCart());
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

  // Sync cart to storage
  useEffect(() => {
    cartService.saveCart(cart);
  }, [cart]);

  const totals = cartService.calculateTotals(cart, activePromos);

  // Direct internal add without auth check
  const _internalAdd = useCallback((product, size = '100ml', quantity = 1) => {
    setCart(prev => {
      const items = [...(prev.items || [])];
      const existingIndex = items.findIndex(
        item => item.productId === product.id && item.size === size
      );

      const basePrice = Number(product.originalPrice || product.price || 0);

      if (existingIndex > -1) {
        items[existingIndex].quantity += quantity;
      } else {
        items.push({
          productId: product.id,
          id: product.id,
          name: product.name,
          arabicName: product.arabicName || '',
          categoryId: product.categoryId || product.category?.id || (product.category === 'perfumes' ? 1 : 0),
          category: product.category,
          brandId: product.brandId || product.brand?.id || 0,
          brand: product.brand,
          subcategoryId: product.subcategoryId || product.subcategory?.id || 0,
          perfumeCategoryId: product.perfumeCategoryId || product.perfumeCategory?.id || 0,
          tier: product.tier,
          price: basePrice,
          originalPrice: basePrice,
          image: product.imageUrl || product.image || product.images?.[0] || '',
          fragranceFamily: product.fragranceFamily || 'Haute Parfumerie',
          size,
          quantity
        });
      }

      return { ...prev, items };
    });

    // If authenticated, sync to backend
    if (product.id) {
      cartApi.addItem(product.id, quantity).catch(() => {});
    }

    // Trigger cart badge bounce
    setCartBadgeAnimated(true);
    setTimeout(() => setCartBadgeAnimated(false), 500);

    success(`Added ${product.name} (${size}) to your Royal Bag.`);
    setIsDrawerOpen(true);
  }, [success]);

  // Handle pending cart additions when user logs in
  useEffect(() => {
    if (isAuthenticated && pendingItem) {
      const { product, size, quantity } = pendingItem;
      sessionStorage.removeItem(PENDING_CART_KEY);
      setPendingItem(null);
      setAuthModalOpen(false);

      // Auto add preserved product
      _internalAdd(product, size || '100ml', quantity || 1);
    }
  }, [isAuthenticated, pendingItem, _internalAdd]);

  const addToCart = (product, size = '100ml', quantity = 1) => {
    if (!isAuthenticated) {
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

    _internalAdd(product, size, quantity);
    return true;
  };

  const updateQuantity = (productId, size, newQty) => {
    setCart(prev => {
      let items = [...prev.items];
      if (newQty <= 0) {
        items = items.filter(i => !(i.productId === productId && i.size === size));
      } else {
        const index = items.findIndex(i => i.productId === productId && i.size === size);
        if (index > -1) {
          items[index].quantity = newQty;
        }
      }
      return { ...prev, items };
    });
    setCartBadgeAnimated(true);
    setTimeout(() => setCartBadgeAnimated(false), 400);
  };

  const removeFromCart = (productId, size) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.filter(i => !(i.productId === productId && i.size === size))
    }));
    info('Creation removed from your bag.');
  };

  const toggleGiftWrap = () => {
    setCart(prev => ({ ...prev, giftWrap: !prev.giftWrap }));
  };

  const applyDiscount = async (codeStr) => {
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
      // Sync items to backend cart before validating if authenticated
      if (isAuthenticated && bagItems.length > 0) {
        for (const item of bagItems) {
          if (item.productId) {
            await cartApi.addItem(item.productId, item.quantity).catch(() => {});
          }
        }
      }

      const discount = await discountService.validateCode(codeStr, totals.subtotal, bagItems);
      setCart(prev => ({
        ...prev,
        discountCode: discount.code,
        discountPercent: discount.type === 'percentage' ? discount.value : 0,
        discountFixed: discount.type === 'fixed' ? discount.value : 0
      }));
      success(`Privilege code '${discount.code}' applied successfully.`);
      return discount;
    } catch (err) {
      error(err.message || 'Invalid privilege code.');
      throw err;
    }
  };

  const removeDiscount = () => {
    setCart(prev => ({
      ...prev,
      discountCode: null,
      discountPercent: 0,
      discountFixed: 0
    }));
  };

  const clearCart = () => {
    setCart({
      items: [],
      discountCode: null,
      discountPercent: 0,
      discountFixed: 0,
      giftWrap: false
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        items: totals.items || cart.items || [],
        totals,
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
        updateQuantity,
        removeFromCart,
        toggleGiftWrap,
        applyDiscount,
        removeDiscount,
        clearCart,
        cartBadgeAnimated,
        openAuthModal: () => setAuthModalOpen(true),
        closeAuthModal: () => setAuthModalOpen(false)
      }}
    >
      {children}

      {/* Global Login Required Modal for Cart Action */}
      <LoginRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        pendingItem={pendingItem}
        onAuthenticatedAdd={(prod, sz, qty) => _internalAdd(prod, sz, qty)}
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
