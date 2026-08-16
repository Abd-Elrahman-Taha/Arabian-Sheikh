import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { discountService } from '../services/discountService';
import { useToast } from './ToastContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => cartService.getCart());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    cartService.saveCart(cart);
  }, [cart]);

  const totals = cartService.calculateTotals(cart);

  const addToCart = (product, size = '100ml', quantity = 1) => {
    setCart(prev => {
      const items = [...prev.items];
      const existingIndex = items.findIndex(
        item => item.productId === product.id && item.size === size
      );

      if (existingIndex > -1) {
        items[existingIndex].quantity += quantity;
      } else {
        items.push({
          productId: product.id,
          name: product.name,
          arabicName: product.arabicName,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images?.[0] || '',
          fragranceFamily: product.fragranceFamily,
          size,
          quantity
        });
      }

      return { ...prev, items };
    });

    success(`Added ${product.name} (${size}) to your bag.`);
    setIsDrawerOpen(true);
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
  };

  const removeFromCart = (productId, size) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.filter(i => !(i.productId === productId && i.size === size))
    }));
  };

  const toggleGiftWrap = () => {
    setCart(prev => ({ ...prev, giftWrap: !prev.giftWrap }));
  };

  const applyDiscount = async (codeStr) => {
    try {
      const discount = await discountService.validateCode(codeStr, totals.subtotal);
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
        items: cart.items,
        totals,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        addToCart,
        updateQuantity,
        removeFromCart,
        toggleGiftWrap,
        applyDiscount,
        removeDiscount,
        clearCart
      }}
    >
      {children}
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
