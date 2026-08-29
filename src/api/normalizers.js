/**
 * Arabian Sheikh - Data Transfer Object (DTO) Normalizers
 * 
 * Strict alignment with:
 * - Customer API & DTO Documentation
 * - Admin API & DTO Documentation
 * 
 * Ensures robust bi-directional translation between backend API payloads
 * and frontend entity representations.
 */

// Helper to convert snake_case to camelCase
function toCamel(str) {
  return str.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
}

// Deep normalizer for object keys
export function normalizeObjectKeys(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(item => normalizeObjectKeys(item));
  if (typeof obj !== 'object' || obj instanceof Date || obj instanceof RegExp || obj instanceof Blob) {
    return obj;
  }

  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = toCamel(key);
    acc[camelKey] = normalizeObjectKeys(obj[key]);
    return acc;
  }, {});
}

/**
 * Ensures any image or asset URL is a fully qualified absolute URL compliant with ASP.NET backend validation
 */
export function toAbsoluteUrl(url) {
  if (!url || typeof url !== 'string') return 'https://arabian-sheikh.runasp.net/products/luxury_designs/07_arabian_gold.webp';
  const clean = url.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  const domain = 'https://arabian-sheikh.runasp.net';
  const path = clean.startsWith('/') ? clean : `/${clean}`;
  return `${domain}${path}`;
}

/**
 * Product Normalizer (supports both ProductListItemResponse and ProductDetailsResponse)
 */
export function normalizeProduct(raw) {
  if (!raw) return null;
  const p = normalizeObjectKeys(raw);

  // Extract brand and category names whether returned as string or object
  const brandName = typeof p.brand === 'object' ? p.brand?.name : (p.brandName || p.brand || 'Arabian Sheikh');
  const categoryName = typeof p.category === 'object' ? p.category?.name : (p.categoryName || p.category || 'Perfumes');
  const subcategoryName = typeof p.subcategory === 'object' ? p.subcategory?.name : (p.subcategoryName || p.subcategory || null);
  const perfumeCategoryName = typeof p.perfumeCategory === 'object' ? p.perfumeCategory?.name : (p.perfumeCategoryName || null);

  const price = Number(p.price || 0);
  const originalPrice = p.originalPrice ? Number(p.originalPrice) : (p.discount ? Number(p.discount.originalPrice || price) : null);
  const isDiscounted = Boolean(p.isDiscounted || (p.discount && p.discount.value > 0) || (originalPrice && originalPrice > price));

  return {
    id: p.id || p.productId || `as-${p.slug || 'prod'}`,
    numericId: typeof p.id === 'number' ? p.id : (!isNaN(Number(p.id)) && Number(p.id) > 0 ? Number(p.id) : (typeof p.productId === 'number' ? p.productId : null)),
    slug: p.slug || (p.name ? p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''),
    name: p.name || 'Imperial Extrait',
    arabicName: p.arabicName || p.arabic_name || '',
    bulgarianName: p.bulgarianName || p.bulgarian_name || '',
    spanishName: p.spanishName || p.spanish_name || '',
    tier: p.tier || (categoryName === 'Perfumes' ? 'Luxury' : null),
    category: categoryName.toLowerCase(),
    categoryName,
    subcategoryName,
    perfumeCategoryName,
    brandName,
    gender: p.gender || 'Unisex',
    price,
    originalPrice,
    isDiscounted,
    discountPercent: p.discount?.value || (originalPrice && originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0),
    hasDiscount: isDiscounted,
    currency: p.currency || 'EUR',
    stock: Number(p.stock !== undefined ? p.stock : 50),
    status: p.isActive === false ? 'INACTIVE' : (p.status || 'ACTIVE'),
    isActive: p.isActive !== undefined ? Boolean(p.isActive) : true,
    featured: Boolean(p.featured || p.isFeatured),
    isBestSeller: Boolean(p.isBestSeller || p.bestSeller),
    rating: Number(p.rating || 5.0),
    reviewsCount: Number(p.reviewCount || p.reviewsCount || (p.reviews ? p.reviews.length : 0)),
    description: p.description || '',
    ingredients: p.ingredients || 'Rare Oud wood, amber crystals, Taif rose, sandalwood, musk.',
    spanishDescription: p.spanishDescription || p.description || '',
    bulgarianDescription: p.bulgarianDescription || p.description || '',
    fragranceFamily: p.fragranceFamily || p.scentFamily || 'Haute Parfumerie',
    scentFamily: p.scentFamily || p.fragranceFamily || 'Haute Parfumerie',
    tagline: p.tagline || '',
    images: Array.isArray(p.images) && p.images.length > 0 
      ? p.images 
      : [p.imageUrl || '/products/luxury_designs/07_arabian_gold.webp'],
    image: p.imageUrl || (Array.isArray(p.images) && p.images[0]) || '/products/luxury_designs/07_arabian_gold.webp',
    imageUrl: p.imageUrl || (Array.isArray(p.images) && p.images[0]) || '/products/luxury_designs/07_arabian_gold.webp',
    cutoutImage: p.cutoutImage || p.imageUrl || '/products/luxury_designs/07_arabian_gold.webp',
    originalImage: p.originalImage || p.imageUrl || '/products/luxury_designs/07_arabian_gold.webp',
    reviews: Array.isArray(p.reviews) ? p.reviews.map(normalizeReview) : []
  };
}

/**
 * Review Normalizer (Compliant with ReviewResponse)
 */
export function normalizeReview(raw) {
  if (!raw) return null;
  const r = normalizeObjectKeys(raw);
  return {
    id: r.id || `rev-${Date.now()}`,
    productId: r.productId || null,
    author: r.userName || r.author || 'Anonymous Patron',
    userName: r.userName || r.author || 'Anonymous Patron',
    rating: Number(r.rating || 5),
    comment: r.comment || r.body || '',
    createdAt: r.createdAt || r.date || new Date().toISOString(),
    status: r.status || 'Approved'
  };
}

/**
 * User / Customer Normalizer (Compliant with UserResponse & AdminProfileResponse)
 */
export function normalizeUser(raw) {
  if (!raw) return null;
  const u = normalizeObjectKeys(raw);
  const fullName = u.fullName || (u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : (u.name || 'Patron'));

  return {
    id: u.id || u.userId || `user-${Date.now()}`,
    name: fullName,
    firstName: u.firstName || fullName.split(' ')[0] || '',
    lastName: u.lastName || fullName.split(' ').slice(1).join(' ') || '',
    email: u.email || '',
    phone: u.phone || u.phoneNumber || u.telephone || '',
    countryCode: u.countryCode || '',
    preferredLanguage: u.preferredLanguage || u.preferredDashboardLanguage || 'en',
    emailVerifiedAt: u.emailVerifiedAt || null,
    role: u.isSuperAdmin ? 'SUPER_ADMIN' : (u.role || (u.email?.includes('admin') ? 'ADMIN' : 'USER')),
    isSuperAdmin: Boolean(u.isSuperAdmin),
    isActive: u.isActive !== undefined ? Boolean(u.isActive) : true,
    isBlocked: Boolean(u.isBlocked),
    memberSince: u.createdAt || u.memberSince || new Date().toISOString().split('T')[0]
  };
}

/**
 * Cart Item Normalizer (Compliant with CartItemResponse)
 */
export function normalizeCartItem(raw) {
  if (!raw) return null;
  const item = normalizeObjectKeys(raw);
  return {
    id: item.id || `ci-${Date.now()}`,
    productId: item.productId || item.product?.id,
    productName: item.productName || item.product?.name || item.name || 'Imperial Extrait',
    imageUrl: item.imageUrl || item.product?.imageUrl || '/products/luxury_designs/07_arabian_gold.webp',
    quantity: Number(item.quantity || 1),
    unitPriceSnapshot: Number(item.unitPriceSnapshot || item.price || 0),
    priceChangeDetectedAt: item.priceChangeDetectedAt || null,
    priceLockExpiresAt: item.priceLockExpiresAt || null,
    lineTotal: Number(item.lineTotal || (item.unitPriceSnapshot || item.price || 0) * (item.quantity || 1))
  };
}

/**
 * Cart Normalizer (Compliant with CartResponse)
 */
export function normalizeCart(raw) {
  if (!raw) return null;
  const c = normalizeObjectKeys(raw);
  return {
    id: c.id || `cart-${Date.now()}`,
    items: Array.isArray(c.items) ? c.items.map(normalizeCartItem) : [],
    subtotal: Number(c.subtotal || 0),
    discountTotal: Number(c.discountTotal || c.discount || 0),
    discount: Number(c.discountTotal || c.discount || 0),
    shippingEstimate: Number(c.shippingEstimate || c.shipping || 0),
    total: Number(c.total || 0),
    currency: c.currency || 'EUR',
    expiresAt: c.expiresAt || null
  };
}

/**
 * Order Normalizer (Compliant with OrderResponse)
 */
export function normalizeOrder(raw) {
  if (!raw) return null;
  const o = normalizeObjectKeys(raw);
  const orderId = o.id || `ORD-${o.orderNumber || Date.now()}`;
  const trackingNumber = o.trackingNumber || o.trackingCode || o.shipping?.trackingNumber || o.dhlTrackingNumber || '';
  return {
    id: orderId,
    orderNumber: o.orderNumber || (typeof orderId === 'string' && orderId.startsWith('ORD-') ? orderId : `ORD-${orderId}`),
    createdAt: o.createdAt || o.date || new Date().toISOString(),
    date: o.date || o.createdAt || new Date().toISOString(),
    deliveredAt: o.deliveredAt || null,
    subtotal: Number(o.subtotal || 0),
    discountTotal: Number(o.discountTotal || o.discount || 0),
    shippingCost: Number(o.shippingCost || o.shipping || 0),
    total: Number(o.total || 0),
    currency: o.currency || 'EUR',
    orderStatus: o.orderStatus || o.status || 'Pending',
    status: o.status || o.orderStatus || 'CONFIRMED',
    paymentStatus: o.paymentStatus || 'Paid',
    customerName: o.customerName || o.patronName || o.userName || o.shippingAddress?.fullName || 'Valued Patron',
    customerEmail: o.customerEmail || o.email || o.userEmail || '',
    customerPhone: o.customerPhone || o.phone || '',
    userId: o.userId || o.customerId || null,
    items: Array.isArray(o.items) ? o.items.map(item => {
      const norm = normalizeObjectKeys(item);
      return {
        ...norm,
        name: norm.name || norm.productName || 'Imperial Flacon',
        quantity: Number(norm.quantity ?? norm.qty ?? 1),
        price: Number(norm.price ?? norm.unitPriceSnapshot ?? 0)
      };
    }) : [],
    shipping: o.shipping || {
      shippingCompanyName: o.carrier || 'DHL Express',
      trackingNumber,
      trackingUrl: o.trackingUrl || ''
    },
    trackingCode: trackingNumber,
    dhlTrackingNumber: trackingNumber,
    returns: Array.isArray(o.returns) ? o.returns.map(r => normalizeObjectKeys(r)) : [],
    refunds: Array.isArray(o.refunds) ? o.refunds.map(r => normalizeObjectKeys(r)) : []
  };
}

/**
 * Return Request Normalizer (Compliant with ReturnResponse)
 */
export function normalizeReturn(raw) {
  if (!raw) return null;
  const ret = normalizeObjectKeys(raw);
  return {
    id: ret.id,
    orderId: ret.orderId,
    orderItemId: ret.orderItemId,
    reason: ret.reason,
    status: ret.status || 'PendingReturn',
    rejectionReason: ret.rejectionReason || null,
    requiresPhoto: Boolean(ret.requiresPhoto),
    returnLabelUrl: ret.returnLabelUrl || null,
    requestedAt: ret.requestedAt || new Date().toISOString()
  };
}

/**
 * Coupon Validation Normalizer
 */
export function normalizeCouponValidation(raw) {
  if (!raw) return { valid: false, message: 'Invalid coupon response.' };
  const c = normalizeObjectKeys(raw);
  return {
    valid: Boolean(c.valid),
    code: c.code || '',
    type: c.type || 'Percentage',
    value: Number(c.value || 0),
    discountAmount: Number(c.discountAmount || 0),
    message: c.message || (c.valid ? 'Coupon applied successfully.' : 'Invalid coupon.')
  };
}
