/**
 * Arabian Sheikh API Suite
 * Barrel export for API client, endpoints, domain modules, and normalizers.
 */

export { default as apiClient, ApiError, tokenManager, TOKEN_KEY, REFRESH_TOKEN_KEY } from './client';
export { default as ENDPOINTS } from './endpoints';
export * from './normalizers';

export { default as authApi } from './auth.api';
export { default as productApi } from './product.api';
export { default as orderApi } from './order.api';
export { default as cartApi } from './cart.api';
export { default as wishlistApi } from './wishlist.api';
export { default as discountApi } from './discount.api';
export { default as userApi } from './user.api';
export { default as addressApi } from './address.api';
export { default as brandApi } from './brand.api';
export { default as analyticsApi } from './analytics.api';

