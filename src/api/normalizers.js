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
 * Strips remote ASP.NET domain from static asset paths so local bundled webp/png assets display cleanly
 */
export function cleanImageUrl(url) {
  if (!url || typeof url !== 'string') return '/products/luxury_designs/07_arabian_gold.webp';
  let clean = url.trim();
  if (clean.includes('runasp.net/products/') || clean.includes('runasp.net/editorial/') || clean.includes('runasp.net/assets/')) {
    clean = clean.replace(/https?:\/\/[^\/]+/, '');
  }
  return clean || '/products/luxury_designs/07_arabian_gold.webp';
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
  const perfumeCategoryName = typeof p.perfumeCategory === 'object' ? p.perfumeCategory?.name : (p.perfumeCategoryName || p.perfumeCategory || null);

  // Accurately derive tier from perfumeCategoryName or perfumeCategoryId
  let derivedTier = 'Luxury';
  if (perfumeCategoryName) {
    const rawTier = String(perfumeCategoryName).trim();
    if (rawTier.toLowerCase().includes('royal') || Number(p.perfumeCategoryId) === 2) derivedTier = 'Royal';
    else if (rawTier.toLowerCase().includes('classic') || Number(p.perfumeCategoryId) === 3) derivedTier = 'Classic';
    else if (rawTier.toLowerCase().includes('luxury') || Number(p.perfumeCategoryId) === 1) derivedTier = 'Luxury';
    else derivedTier = rawTier;
  } else if (Number(p.perfumeCategoryId) === 2) {
    derivedTier = 'Royal';
  } else if (Number(p.perfumeCategoryId) === 3) {
    derivedTier = 'Classic';
  } else if (categoryName.toLowerCase() === 'perfumes' || categoryName.toLowerCase() === 'perfume') {
    derivedTier = p.tier || 'Luxury';
  } else {
    derivedTier = p.tier || null;
  }

  const isPerfumeItem = categoryName.toLowerCase() === 'perfumes' || categoryName.toLowerCase() === 'perfume' || !!derivedTier;
  let finalPrice = Number(p.price || 0);

  if (isPerfumeItem && derivedTier) {
    const tLower = derivedTier.toLowerCase();
    if (tLower.includes('royal') || Number(p.perfumeCategoryId) === 2) {
      finalPrice = 40;
    } else if (tLower.includes('classic') || Number(p.perfumeCategoryId) === 3) {
      finalPrice = 30;
    } else {
      finalPrice = 50; // Luxury default
    }
  }

  const originalPrice = p.originalPrice ? Number(p.originalPrice) : (p.discount ? Number(p.discount.originalPrice || finalPrice) : null);
  const isDiscounted = Boolean(p.isDiscounted || (p.discount && p.discount.value > 0) || (originalPrice && originalPrice > finalPrice));
  const isActive = p.isActive !== undefined ? Boolean(p.isActive) : (p.status ? p.status !== 'INACTIVE' : true);

  const currentLang = (typeof window !== 'undefined' ? localStorage.getItem('arabian_sheikh_lang') : 'en') || 'en';

  let resolvedName = p.name || 'Imperial Extrait';
  let resolvedDesc = p.description || '';
  let resolvedIngredients = p.ingredients || 'Rare Oud wood, amber crystals, Taif rose, sandalwood, musk.';

  if (Array.isArray(p.translations) && p.translations.length > 0) {
    const matched = p.translations.find(t => (t.languageCode || t.language || '').toLowerCase() === currentLang.toLowerCase())
      || p.translations.find(t => (t.languageCode || t.language || '').toLowerCase() === 'en')
      || p.translations[0];
    if (matched) {
      if (matched.name) resolvedName = matched.name;
      if (matched.description) resolvedDesc = matched.description;
      if (matched.ingredients) resolvedIngredients = matched.ingredients;
    }
  } else {
    if (currentLang === 'ar' && (p.arabicName || p.arabic_name)) {
      resolvedName = p.arabicName || p.arabic_name;
      if (p.arabicDescription || p.arabic_description) resolvedDesc = p.arabicDescription || p.arabic_description;
    } else if (currentLang === 'bg' && (p.bulgarianName || p.bulgarian_name)) {
      resolvedName = p.bulgarianName || p.bulgarian_name;
      if (p.bulgarianDescription || p.bulgarian_description) resolvedDesc = p.bulgarianDescription || p.bulgarian_description;
    } else if (currentLang === 'es' && (p.spanishName || p.spanish_name)) {
      resolvedName = p.spanishName || p.spanish_name;
      if (p.spanishDescription || p.spanish_description) resolvedDesc = p.spanishDescription || p.spanish_description;
    }
  }

  return {
    id: p.id !== undefined && p.id !== null ? p.id : (p.productId || `as-${p.slug || 'prod'}`),
    numericId: typeof p.id === 'number' ? p.id : (!isNaN(Number(p.id)) && Number(p.id) > 0 ? Number(p.id) : (typeof p.productId === 'number' ? p.productId : null)),
    slug: p.slug || (p.name ? p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `prod-${p.id || 'item'}`),
    name: resolvedName,
    rawName: p.name || resolvedName,
    arabicName: p.arabicName || p.arabic_name || '',
    bulgarianName: p.bulgarianName || p.bulgarian_name || '',
    spanishName: p.spanishName || p.spanish_name || '',
    tier: derivedTier,
    perfumeCategoryName: derivedTier,
    category: (categoryName || 'perfumes').toLowerCase(),
    categoryName: categoryName || 'Perfumes',
    subcategoryName,
    brandName,
    gender: p.gender || 'Unisex',
    price: finalPrice,
    originalPrice,
    isDiscounted,
    discountPercent: p.discount?.value || (originalPrice && originalPrice > finalPrice ? Math.round((1 - finalPrice / originalPrice) * 100) : (p.discountPercent || 0)),
    hasDiscount: isDiscounted || Boolean(p.hasDiscount || (p.discountPercent > 0)),
    isOffer: isDiscounted || Boolean(p.isOffer || p.hasDiscount || (p.discountPercent > 0)),
    currency: p.currency || 'EUR',
    stock: Number(p.stock !== undefined ? p.stock : 50),
    status: isActive ? 'ACTIVE' : 'INACTIVE',
    isActive: isActive,
    featured: Boolean(p.featured !== undefined ? p.featured : (p.isFeatured !== undefined ? p.isFeatured : true)),
    isBestSeller: Boolean(p.isBestSeller || p.bestSeller),
    rating: Number(p.rating || 5.0),
    reviewsCount: Number(p.reviewCount || p.reviewsCount || (p.reviews ? p.reviews.length : 0)),
    description: resolvedDesc,
    ingredients: resolvedIngredients,
    spanishDescription: p.spanishDescription || p.description || '',
    bulgarianDescription: p.bulgarianDescription || p.description || '',
    fragranceFamily: p.fragranceFamily || p.scentFamily || 'Oriental Woody',
    scentFamily: p.scentFamily || p.fragranceFamily || 'Oriental Woody',
    tagline: p.tagline || '',
    images: Array.isArray(p.images) && p.images.length > 0 
      ? p.images.map(cleanImageUrl)
      : [cleanImageUrl(p.imageUrl || p.image || '/products/luxury_designs/07_arabian_gold.webp')],
    image: cleanImageUrl(p.imageUrl || (Array.isArray(p.images) && p.images[0]) || p.image || '/products/luxury_designs/07_arabian_gold.webp'),
    imageUrl: cleanImageUrl(p.imageUrl || (Array.isArray(p.images) && p.images[0]) || p.image || '/products/luxury_designs/07_arabian_gold.webp'),
    cutoutImage: cleanImageUrl(p.cutoutImage || p.imageUrl || p.image || '/products/luxury_designs/07_arabian_gold.webp'),
    originalImage: cleanImageUrl(p.originalImage || p.imageUrl || p.image || '/products/luxury_designs/07_arabian_gold.webp'),
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
 * Coupon Validation Normalizer (Storefront Cart)
 */
export function normalizeCouponValidation(raw) {
  if (!raw) return { valid: false, message: 'Invalid coupon response.' };
  const c = normalizeObjectKeys(raw);
  return {
    valid: Boolean(c.valid),
    code: c.code || '',
    type: c.discountType || c.type || 'Percentage',
    value: Number(c.discountValue ?? c.value ?? 0),
    discountAmount: Number(c.discountAmount || 0),
    eligibleItemsSubtotal: Number(c.eligibleItemsSubtotal || 0),
    message: c.message || (c.valid ? 'Coupon applied successfully.' : 'Invalid coupon.')
  };
}

/**
 * Single Admin Coupon Normalizer
 */
export function normalizeCoupon(raw) {
  if (!raw) return null;
  const c = normalizeObjectKeys(raw);
  
  const rawApplicabilities = Array.isArray(c.applicabilities)
    ? c.applicabilities
    : (Array.isArray(c.applicability) ? c.applicability : []);

  const applicability = rawApplicabilities.map(app => {
    const a = normalizeObjectKeys(app);
    return {
      id: a.id || null,
      targetType: a.targetType || 'Category',
      targetId: Number(a.targetId || 0),
      isExcluded: Boolean(a.isExcluded)
    };
  });

  const isActive = c.isActive !== undefined ? Boolean(c.isActive) : true;
  const usageLimit = c.usageLimit !== null && c.usageLimit !== undefined ? Number(c.usageLimit) : null;
  const usageCount = Number(c.usageCount || 0);

  // Compute or format status
  let status = c.status || 'Active';
  if (!c.status) {
    if (!isActive) {
      status = 'Inactive';
    } else if (c.endDate && new Date(c.endDate).getTime() < Date.now()) {
      status = 'Expired';
    } else if (usageLimit !== null && usageCount >= usageLimit) {
      status = 'Depleted';
    } else {
      status = 'Active';
    }
  }

  return {
    id: c.id,
    code: (c.code || '').toUpperCase().trim(),
    type: c.type === 'Fixed' ? 'Fixed' : 'Percentage',
    value: Number(c.value || 0),
    startDate: c.startDate || new Date().toISOString(),
    endDate: c.endDate || new Date().toISOString(),
    usageLimit,
    usageCount,
    minOrderAmount: c.minOrderAmount !== null && c.minOrderAmount !== undefined ? Number(c.minOrderAmount) : null,
    maxDiscountAmount: c.maxDiscountAmount !== null && c.maxDiscountAmount !== undefined ? Number(c.maxDiscountAmount) : null,
    allowOnDiscountedItems: Boolean(c.allowOnDiscountedItems),
    isActive,
    status,
    applicability,
    applicabilities: applicability,
    createdAt: c.createdAt || null,
    updatedAt: c.updatedAt || null
  };
}

/**
 * Admin Coupons Paginated List Normalizer
 */
export function normalizeCouponList(raw) {
  if (!raw) {
    return {
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false
    };
  }

  if (Array.isArray(raw)) {
    const items = raw.map(normalizeCoupon).filter(Boolean);
    return {
      items,
      page: 1,
      pageSize: items.length || 20,
      totalCount: items.length,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false
    };
  }

  const res = normalizeObjectKeys(raw);
  const rawItems = Array.isArray(res.items) ? res.items : [];
  const items = rawItems.map(normalizeCoupon).filter(Boolean);

  return {
    items,
    page: Number(res.page || 1),
    pageSize: Number(res.pageSize || 20),
    totalCount: Number(res.totalCount || items.length),
    totalPages: Number(res.totalPages || Math.ceil((res.totalCount || items.length) / (res.pageSize || 20)) || 1),
    hasPreviousPage: Boolean(res.hasPreviousPage),
    hasNextPage: Boolean(res.hasNextPage)
  };
}

/**
 * Admin Coupon Analytics Normalizer
 */
export function normalizeCouponAnalytics(raw) {
  if (!raw) return { couponId: 0, code: '', totalOrders: 0, totalDiscountGiven: 0 };
  const a = normalizeObjectKeys(raw);
  return {
    couponId: Number(a.couponId || a.id || 0),
    code: (a.code || '').toUpperCase().trim(),
    totalOrders: Number(a.totalOrders ?? a.ordersUsingCoupon ?? a.ordersCount ?? 0),
    totalDiscountGiven: Number(a.totalDiscountGiven ?? a.discountGiven ?? a.totalDiscount ?? 0)
  };
}

/**
 * Customer Address Normalizer
 * Exact mapping with PerfumeStore.Application.DTOs.Address.AddressResponse
 */
export function normalizeAddress(raw) {
  if (!raw) return null;
  const a = normalizeObjectKeys(raw);

  const rawLabel = a.label || 'Home';
  // Capitalize first letter: Home, Work, Other
  const label = typeof rawLabel === 'string'
    ? rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1)
    : 'Home';

  return {
    id: Number(a.id || 0),
    label: ['Home', 'Work', 'Other'].includes(label) ? label : 'Other',
    customLabel: a.customLabel ? String(a.customLabel).trim() : null,
    fullName: a.fullName ? String(a.fullName).trim() : '',
    phone: a.phone ? String(a.phone).trim() : '',
    countryCode: a.countryCode ? String(a.countryCode).toUpperCase().trim() : 'AE',
    region: a.region ? String(a.region).trim() : '',
    city: a.city ? String(a.city).trim() : '',
    addressLine1: a.addressLine1 ? String(a.addressLine1).trim() : '',
    addressLine2: a.addressLine2 ? String(a.addressLine2).trim() : null,
    postalCode: a.postalCode ? String(a.postalCode).trim() : '',
    isDefaultShipping: Boolean(a.isDefaultShipping ?? a.isDefault ?? false)
  };
}

/**
 * Customer Address List Normalizer
 */
export function normalizeAddressList(raw) {
  if (!raw) return [];
  const rawList = Array.isArray(raw)
    ? raw
    : (Array.isArray(raw?.items) ? raw.items : (Array.isArray(raw?.data) ? raw.data : []));

  return rawList.map(normalizeAddress).filter(Boolean);
}

/**
 * Customer Address Snapshot Normalizer
 * Exact mapping with PerfumeStore.Application.DTOs.Address.AddressSnapshotResponse
 */
export function normalizeAddressSnapshot(raw) {
  if (!raw) return null;
  const a = normalizeObjectKeys(raw);

  return {
    fullName: a.fullName ? String(a.fullName).trim() : '',
    phone: a.phone ? String(a.phone).trim() : '',
    countryCode: a.countryCode ? String(a.countryCode).toUpperCase().trim() : 'AE',
    region: a.region ? String(a.region).trim() : '',
    city: a.city ? String(a.city).trim() : '',
    addressLine1: a.addressLine1 ? String(a.addressLine1).trim() : '',
    addressLine2: a.addressLine2 ? String(a.addressLine2).trim() : null,
    postalCode: a.postalCode ? String(a.postalCode).trim() : ''
  };
}

