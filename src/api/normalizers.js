import { perfumeCategoryService } from '../services/perfumeCategoryService';

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

// Helper to convert PascalCase, snake_case, and kebab-case to camelCase
function toCamel(str) {
  if (!str || typeof str !== 'string') return str;
  // Lowercase first character for PascalCase -> camelCase
  const lowerFirst = str.charAt(0).toLowerCase() + str.slice(1);
  return lowerFirst.replace(/([-_][a-z])/ig, ($1) => {
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

export const COUNTRY_NAMES = {
  'BG': 'Bulgaria',
  'AE': 'United Arab Emirates',
  'SA': 'Saudi Arabia',
  'EG': 'Egypt',
  'KW': 'Kuwait',
  'QA': 'Qatar',
  'BH': 'Bahrain',
  'OM': 'Oman',
  'GB': 'United Kingdom',
  'UK': 'United Kingdom',
  'US': 'United States',
  'USA': 'United States',
  'DE': 'Germany',
  'FR': 'France',
  'IT': 'Italy',
  'ES': 'Spain',
  'CH': 'Switzerland',
  'TR': 'Turkey',
  'GR': 'Greece',
  'RO': 'Romania',
  'AT': 'Austria',
  'BE': 'Belgium',
  'NL': 'Netherlands',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'PL': 'Poland',
  'CZ': 'Czech Republic'
};

export const COUNTRY_CODE_MAP = {
  'BULGARIA': 'BG',
  'UNITED ARAB EMIRATES': 'AE',
  'UAE': 'AE',
  'SAUDI ARABIA': 'SA',
  'EGYPT': 'EG',
  'KUWAIT': 'KW',
  'QATAR': 'QA',
  'BAHRAIN': 'BH',
  'OMAN': 'OM',
  'UNITED KINGDOM': 'GB',
  'UK': 'GB',
  'UNITED STATES': 'US',
  'USA': 'US',
  'GERMANY': 'DE',
  'FRANCE': 'FR',
  'ITALY': 'IT',
  'SPAIN': 'ES',
  'SWITZERLAND': 'CH',
  'TURKEY': 'TR',
  'GREECE': 'GR',
  'ROMANIA': 'RO',
  'AUSTRIA': 'AT',
  'BELGIUM': 'BE',
  'NETHERLANDS': 'NL'
};

export function normalizeOrderAddress(rawAddr, fallbackName = '', fallbackPhone = '') {
  if (!rawAddr || typeof rawAddr !== 'object') return null;
  const a = normalizeObjectKeys(rawAddr);

  const fullName = a.fullName || a.recipientName || a.name || a.contactName || fallbackName || '';
  const phone = a.phone || a.phoneNumber || a.telephone || a.mobile || fallbackPhone || '';
  const addressLine1 = a.addressLine1 || a.street || a.streetAddress || a.address || a.line1 || '';
  const addressLine2 = a.addressLine2 || a.line2 || a.apartment || a.suite || a.building || a.floor || '';
  const city = a.city || a.town || a.municipality || '';
  const region = a.region || a.state || a.province || a.area || a.district || '';
  const postalCode = a.postalCode || a.zipCode || a.zip || a.postcode || '';

  let rawCountry = a.country || a.countryName || '';
  let countryCode = (a.countryCode || '').toUpperCase().trim();

  if (!countryCode && rawCountry) {
    const uc = rawCountry.toUpperCase().trim();
    if (uc.length === 2) {
      countryCode = uc;
    } else {
      countryCode = COUNTRY_CODE_MAP[uc] || '';
    }
  }

  let country = rawCountry && rawCountry.length > 2 ? rawCountry : '';
  if (!country && countryCode) {
    country = COUNTRY_NAMES[countryCode] || countryCode;
  }
  if (!country && !countryCode) {
    country = rawCountry || '';
  }

  const formattedAddress = [
    addressLine1,
    addressLine2,
    city,
    region,
    postalCode,
    country
  ].filter(Boolean).join(', ');

  return {
    ...a,
    fullName,
    recipientName: fullName,
    phone,
    addressLine1,
    street: addressLine1,
    address: addressLine1,
    addressLine2,
    city,
    region,
    state: region,
    postalCode,
    zipCode: postalCode,
    countryCode,
    country,
    formattedAddress
  };
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

  // Price coming directly from backend API endpoints (zero hardcoded values):
  // 1. Direct p.price from backend
  // 2. p.perfumeCategory.price from backend object
  // 3. p.perfumeCategoryPrice
  // 4. p.tierPrice
  let finalPrice = 0;
  if (p.price !== undefined && p.price !== null && !isNaN(Number(p.price)) && Number(p.price) > 0) {
    finalPrice = Number(p.price);
  } else if (p.perfumeCategory && p.perfumeCategory.price !== undefined && !isNaN(Number(p.perfumeCategory.price))) {
    finalPrice = Number(p.perfumeCategory.price);
  } else if (p.perfumeCategoryPrice !== undefined && !isNaN(Number(p.perfumeCategoryPrice))) {
    finalPrice = Number(p.perfumeCategoryPrice);
  } else if (p.tierPrice !== undefined && !isNaN(Number(p.tierPrice))) {
    finalPrice = Number(p.tierPrice);
  } else if (p.price !== undefined && p.price !== null && !isNaN(Number(p.price))) {
    finalPrice = Number(p.price);
  }

  // Derive tier dynamically from backend perfume categories / API data
  let derivedTier = (perfumeCategoryName ? String(perfumeCategoryName).trim() : null)
    || (p.perfumeCategory && typeof p.perfumeCategory === 'object' ? String(p.perfumeCategory.name).trim() : null)
    || (p.tier ? String(p.tier).trim() : null)
    || null;

  if (!derivedTier && (p.perfumeCategoryId || (p.perfumeCategory && p.perfumeCategory.id))) {
    try {
      const pcid = Number(p.perfumeCategoryId || p.perfumeCategory?.id);
      const tierObj = perfumeCategoryService.getTierById(pcid);
      if (tierObj?.name) {
        derivedTier = String(tierObj.name).trim();
      }
    } catch {
      derivedTier = null;
    }
  }

  const discountObj = p.discount && typeof p.discount === 'object' ? p.discount : null;
  const rawDiscountVal = Number(discountObj?.value ?? p.discountValue ?? p.discountPercent ?? 0);
  const discountType = (discountObj?.type || p.discountType || 'Percentage').toString();
  const isFixedDiscount = discountType.toLowerCase() === 'fixed' || discountType === '1';

  let hasExplicitDiscount = Boolean(p.isDiscounted || p.hasDiscount || rawDiscountVal > 0);
  let discountVal = rawDiscountVal > 0 ? rawDiscountVal : 0;

  if (!hasExplicitDiscount && Array.isArray(p.offers) && p.offers.length > 0) {
    const firstOffer = p.offers[0];
    const offVal = Number(firstOffer.discountValue || firstOffer.value || firstOffer.discountPercent || 0);
    if (offVal > 0) {
      hasExplicitDiscount = true;
      discountVal = offVal;
    }
  }

  const basePrice = Number(p.originalPrice || finalPrice || 0);
  let originalPrice = p.originalPrice ? Number(p.originalPrice) : null;

  if (originalPrice && originalPrice > finalPrice) {
    // Both original and discounted prices are provided by backend
    hasExplicitDiscount = true;
    if (discountVal <= 0) {
      discountVal = Math.round((1 - finalPrice / originalPrice) * 100);
    }
  } else if (hasExplicitDiscount && discountVal > 0 && basePrice > 0) {
    // Discount is configured on base product price: calculate discounted selling price
    originalPrice = basePrice;
    if (isFixedDiscount) {
      finalPrice = Math.max(1, Math.round((basePrice - discountVal) * 100) / 100);
      discountVal = Math.round(((basePrice - finalPrice) / basePrice) * 100);
    } else {
      finalPrice = Math.max(1, Math.round(basePrice * (1 - discountVal / 100) * 100) / 100);
    }
  } else {
    originalPrice = null;
  }

  const isDiscounted = Boolean(hasExplicitDiscount && originalPrice && originalPrice > finalPrice);
  const discountPercent = isDiscounted
    ? (discountVal > 0 ? discountVal : Math.round((1 - finalPrice / originalPrice) * 100))
    : 0;

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
    discountPercent,
    hasDiscount: isDiscounted,
    isOffer: isDiscounted,
    currency: p.currency || 'EUR',
    stock: Number(p.stock !== undefined ? p.stock : 50),
    status: isActive ? 'ACTIVE' : 'INACTIVE',
    isActive: isActive,
    featured: Boolean(p.featured === true || p.isFeatured === true),
    isBestSeller: Boolean(p.isBestSeller || p.bestSeller),
    rating: (p.rating !== null && p.rating !== undefined && Number(p.reviewCount ?? p.reviewsCount ?? 0) > 0)
      ? Number(p.rating)
      : (p.rating !== null && p.rating !== undefined && p.rating > 0 ? Number(p.rating) : null),
    reviewCount: Number(p.reviewCount ?? p.reviewsCount ?? (p.reviews ? p.reviews.length : 0)),
    reviewsCount: Number(p.reviewCount ?? p.reviewsCount ?? (p.reviews ? p.reviews.length : 0)),
    description: resolvedDesc,
    ingredients: resolvedIngredients,
    spanishDescription: p.spanishDescription || p.description || '',
    bulgarianDescription: p.bulgarianDescription || p.description || '',
    fragranceFamily: p.fragranceFamily || p.scentFamily || 'Oriental Woody',
    scentFamily: p.scentFamily || p.fragranceFamily || 'Oriental Woody',
    tagline: p.tagline || '',
    brandId: p.brandId || (typeof p.brand === 'object' ? p.brand?.id : null),
    categoryId: p.categoryId || (typeof p.category === 'object' ? p.category?.id : null),
    subcategoryId: p.subcategoryId || (typeof p.subcategory === 'object' ? p.subcategory?.id : null),
    perfumeCategoryId: p.perfumeCategoryId || (typeof p.perfumeCategory === 'object' ? p.perfumeCategory?.id : null),
    size: p.size || '60 ml / 2.0 fl oz',
    shippingWeight: Number(p.shippingWeight || 0.45),
    nameIsTranslatable: p.nameIsTranslatable !== false,
    translations: Array.isArray(p.translations) ? p.translations : [],
    images: Array.isArray(p.images) && p.images.length > 0 
      ? p.images.map(cleanImageUrl)
      : [cleanImageUrl(p.imageUrl || p.image || '/products/luxury_designs/07_arabian_gold.webp')],
    image: cleanImageUrl(p.imageUrl || (Array.isArray(p.images) && p.images[0]) || p.image || '/products/luxury_designs/07_arabian_gold.webp'),
    imageUrl: cleanImageUrl(p.imageUrl || (Array.isArray(p.images) && p.images[0]) || p.image || '/products/luxury_designs/07_arabian_gold.webp'),
    cutoutImage: cleanImageUrl(p.cutoutImage || p.imageUrl || p.image || '/products/luxury_designs/07_arabian_gold.webp'),
    originalImage: cleanImageUrl(p.originalImage || p.imageUrl || p.image || '/products/luxury_designs/07_arabian_gold.webp'),
    reviewsPreview: Array.isArray(p.reviewsPreview) ? p.reviewsPreview.map(normalizeReview).filter(Boolean) : (Array.isArray(p.reviews) ? p.reviews.map(normalizeReview).filter(Boolean) : []),
    reviews: Array.isArray(p.reviews) ? p.reviews.map(normalizeReview).filter(Boolean) : [],
    offers: Array.isArray(p.offers) ? p.offers : []
  };
}

/**
 * Review Normalizer (Compliant with ReviewResponse & AdminReviewListItemResponse)
 */
export function normalizeReview(raw) {
  if (!raw) return null;
  const r = normalizeObjectKeys(raw);
  const authorName = r.userName || r.author || (r.user ? (r.user.name || r.user.fullName) : 'Anonymous');
  return {
    id: r.id !== undefined && r.id !== null ? r.id : `rev-${Date.now()}`,
    productId: r.productId ? Number(r.productId) : null,
    productName: r.productName || '',
    userId: r.userId ? Number(r.userId) : null,
    orderId: r.orderId ? Number(r.orderId) : null,
    author: authorName,
    userName: authorName,
    rating: Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5))),
    comment: r.comment || r.body || '',
    // Preserve the exact status from the backend/local — do NOT default to 'Approved'
    // Public endpoints only return Approved reviews anyway, so this is safe
    status: r.status || null,
    isReported: Boolean(r.isReported),
    createdAt: r.createdAt || r.date || new Date().toISOString()
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
    id: (u.id !== undefined && u.id !== null) ? u.id : (u.userId || `user-${Date.now()}`),
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
  const resolvedImg = item.imageUrl || item.product?.imageUrl || item.image || '/products/luxury_designs/07_arabian_gold.webp';
  const unitPrice = Number(item.unitPriceSnapshot !== undefined && item.unitPriceSnapshot !== null ? item.unitPriceSnapshot : (item.price || 0));
  const qty = Math.max(1, Number(item.quantity || 1));
  const lineTotal = Number(item.lineTotal !== undefined && item.lineTotal !== null ? item.lineTotal : unitPrice * qty);
  const productObj = item.product || {};

  return {
    id: item.id !== undefined && item.id !== null ? item.id : `ci-${Date.now()}`,
    productId: item.productId !== undefined && item.productId !== null ? item.productId : item.product?.id,
    productName: item.productName || item.product?.name || item.name || 'Imperial Extrait',
    imageUrl: resolvedImg,
    quantity: qty,
    unitPriceSnapshot: unitPrice,
    priceChangeDetectedAt: item.priceChangeDetectedAt || null,
    priceLockExpiresAt: item.priceLockExpiresAt || null,
    lineTotal,
    // Taxonomy metadata for promotion applicability
    categoryId: item.categoryId || productObj.categoryId || productObj.category?.id || null,
    category: item.category || productObj.category?.name || productObj.category || null,
    subcategoryId: item.subcategoryId || productObj.subcategoryId || productObj.subcategory?.id || null,
    brandId: item.brandId || productObj.brandId || productObj.brand?.id || null,
    brand: item.brand || productObj.brand?.name || productObj.brand || null,
    perfumeCategoryId: item.perfumeCategoryId || productObj.perfumeCategoryId || productObj.perfumeCategory?.id || null,
    perfumeCategory: item.perfumeCategory || productObj.perfumeCategory || null,
    hasPromotion: Boolean(item.hasPromotion || productObj.hasPromotion),
    promotionName: item.promotionName || productObj.promotionName || null,
    promotionId: item.promotionId || productObj.promotionId || null,
    discountPercent: Number(item.discountPercent || productObj.discountPercent || 0),
    // UI Compatibility Aliases
    name: item.productName || item.product?.name || item.name || 'Imperial Extrait',
    image: cleanImageUrl(resolvedImg),
    price: unitPrice,
    originalPrice: Number(item.originalPrice || unitPrice),
    unitBasePrice: Number(item.unitBasePrice || unitPrice),
    size: item.size || '60ml',
    fragranceFamily: item.fragranceFamily || productObj.fragranceFamily || 'Haute Parfumerie',
    arabicName: item.arabicName || productObj.arabicName || '',
    isBundle: Boolean(item.isBundle || String(item.productId || '').startsWith('bundle-')),
    bundleId: item.bundleId || null,
    bundleItems: Array.isArray(item.bundleItems) ? item.bundleItems : []
  };
}

/**
 * Cart Normalizer (Compliant with CartResponse)
 */
export function normalizeCart(raw) {
  if (!raw) return null;
  const c = normalizeObjectKeys(raw);
  const items = Array.isArray(c.items) ? c.items.map(normalizeCartItem).filter(Boolean) : [];
  const subtotal = Number(c.subtotal !== undefined && c.subtotal !== null ? c.subtotal : items.reduce((sum, i) => sum + (i.lineTotal || i.price * i.quantity), 0));
  const discountTotal = Number(c.discountTotal !== undefined && c.discountTotal !== null ? c.discountTotal : (c.discount || 0));
  const shippingEstimate = Number(c.shippingEstimate !== undefined && c.shippingEstimate !== null ? c.shippingEstimate : (c.shipping !== undefined ? c.shipping : (subtotal >= 200 || items.length === 0 ? 0 : 10)));
  const total = Number(c.total !== undefined && c.total !== null ? c.total : Math.max(0, subtotal - discountTotal + shippingEstimate));

  return {
    id: c.id !== undefined && c.id !== null ? c.id : `cart-${Date.now()}`,
    items,
    subtotal,
    discountTotal,
    discount: discountTotal,
    shippingEstimate,
    shipping: shippingEstimate,
    total,
    currency: c.currency || 'EUR',
    expiresAt: c.expiresAt || null,
    discountCode: c.discountCode || null,
    discountPercent: Number(c.discountPercent || 0),
    discountFixed: Number(c.discountFixed || 0),
    giftWrap: Boolean(c.giftWrap)
  };
}

/**
 * Payment confirmation persistent registry
 * Ensures payments verified by Stripe on client/webhook are never reverted to Pending
 */
export function isOrderConfirmedPaid(orderId) {
  if (!orderId || typeof window === 'undefined') return false;
  try {
    const rawClean = String(orderId).replace(/^(ORD[-_]?|#)/i, '').trim().toLowerCase();
    const raw = localStorage.getItem('arabian_sheikh_confirmed_paid_orders');
    if (!raw) return false;
    const map = JSON.parse(raw);
    return Boolean(map[rawClean] || map[String(orderId).trim().toLowerCase()]);
  } catch {
    return false;
  }
}

export function recordConfirmedPaidOrder(orderId, details = {}) {
  if (!orderId || typeof window === 'undefined') return;
  try {
    const cleanId = String(orderId).replace(/^(ORD[-_]?|#)/i, '').trim().toLowerCase();
    const raw = localStorage.getItem('arabian_sheikh_confirmed_paid_orders');
    const map = raw ? JSON.parse(raw) : {};
    map[cleanId] = {
      orderId,
      status: 'Paid',
      paidAt: details.paidAt || new Date().toISOString(),
      amount: details.amount,
      providerPaymentId: details.providerPaymentId || details.paymentIntent?.id,
      timestamp: Date.now()
    };
    localStorage.setItem('arabian_sheikh_confirmed_paid_orders', JSON.stringify(map));
  } catch {}
}

export function isOrderCod(orderId) {
  if (!orderId || typeof window === 'undefined') return false;
  try {
    const rawClean = String(orderId).replace(/^(ORD[-_]?|#)/i, '').trim().toLowerCase();
    const raw = localStorage.getItem('arabian_sheikh_cod_orders');
    if (!raw) return false;
    const map = JSON.parse(raw);
    return Boolean(map[rawClean] || map[String(orderId).trim().toLowerCase()]);
  } catch {
    return false;
  }
}

export function recordCodOrder(orderId) {
  if (!orderId || typeof window === 'undefined') return;
  try {
    const cleanId = String(orderId).replace(/^(ORD[-_]?|#)/i, '').trim().toLowerCase();
    const raw = localStorage.getItem('arabian_sheikh_cod_orders');
    const map = raw ? JSON.parse(raw) : {};
    map[cleanId] = true;
    map[String(orderId).trim().toLowerCase()] = true;
    localStorage.setItem('arabian_sheikh_cod_orders', JSON.stringify(map));
  } catch {}
}

/**
 * Order Normalizer (Compliant with OrderResponse)
 */
export function normalizeOrder(raw) {
  if (!raw) return null;
  const o = normalizeObjectKeys(raw);
  const orderId = o.id !== undefined && o.id !== null ? o.id : `ORD-${o.orderNumber || Date.now()}`;
  
  // Extract customer info from nested customer or flat properties
  const customerObj = o.customer ? normalizeObjectKeys(o.customer) : null;
  const rawAddrSource = o.shippingAddress 
    || o.shippingAddressSnapshot 
    || o.shippingSnapshot?.address 
    || o.shippingSnapshot?.shippingAddress 
    || o.address 
    || o.deliveryAddress 
    || o.customerAddress 
    || (o.addressLine1 || o.street || o.city ? o : null)
    || (customerObj?.shippingAddress || customerObj?.address || null);

  const resolvedCustomerName = customerObj?.name 
    || (customerObj?.firstName ? `${customerObj.firstName} ${customerObj.lastName || ''}`.trim() : '')
    || o.customerName || o.patronName || o.userName || rawAddrSource?.fullName || rawAddrSource?.recipientName || 'Valued Patron';
  const resolvedCustomerEmail = customerObj?.email || o.customerEmail || o.email || o.userEmail || '';
  const resolvedCustomerPhone = customerObj?.phone || o.customerPhone || o.phone || rawAddrSource?.phone || '';
  const resolvedUserId = customerObj?.id || o.userId || o.customerId || null;

  const resolvedShippingAddress = rawAddrSource ? normalizeOrderAddress(rawAddrSource, resolvedCustomerName, resolvedCustomerPhone) : null;

  // Extract totals from nested totals or flat properties
  const totalsObj = o.totals ? normalizeObjectKeys(o.totals) : null;
  const subtotal = Number(totalsObj?.subtotal !== undefined ? totalsObj.subtotal : (o.subtotal || 0));
  const discountTotal = Number(totalsObj?.discountTotal !== undefined ? totalsObj.discountTotal : (o.discountTotal || o.discount || 0));
  const shippingCost = Number(totalsObj?.shippingCost !== undefined ? totalsObj.shippingCost : (o.shippingCost || o.shipping || 0));
  const total = Number(totalsObj?.total !== undefined ? totalsObj.total : (o.total || 0));
  const currency = totalsObj?.currency || o.currency || 'EUR';

  // Tracking & Shipments
  const shipments = Array.isArray(o.shipments) ? o.shipments.map(normalizeObjectKeys) : [];
  const trackingCandidates = [
    shipments[0]?.trackingNumber,
    shipments[0]?.trackingCode,
    shipments[0]?.waybillNumber,
    shipments[0]?.airwayBillNumber,
    o.trackingNumber,
    o.trackingCode,
    o.dhlTrackingNumber,
    o.carrierTrackingNumber,
    o.airwayBillNumber,
    o.waybillNumber,
    o.awbNumber,
    o.shipping?.trackingNumber,
    o.shipping?.trackingCode,
    o.shippingSnapshot?.trackingNumber,
    o.shippingSnapshot?.carrierTrackingNumber,
    o.shippingSnapshot?.airwayBillNumber,
    o.shippingSnapshot?.waybillNumber,
    o.shipment?.trackingNumber,
    o.tracking?.trackingNumber,
    o.deliveryStatus?.trackingNumber
  ];
  const trackingNumber = trackingCandidates
    .map(c => (c !== undefined && c !== null ? String(c).trim() : ''))
    .find(c => c && !['null', 'undefined', 'pending', 'unassigned', 'none', 'n/a'].includes(c.toLowerCase())) || '';


  // Audit & Purchase Cycle Sub-resources (Normalized upfront for payment status resolution)
  const paymentsList = Array.isArray(o.payments)
    ? o.payments.map(p => {
        const np = normalizeObjectKeys(p);
        return {
          ...np,
          status: np.status || np.paymentStatus || 'Pending',
          attempts: Array.isArray(np.attempts) ? np.attempts.map(normalizeObjectKeys) : (Array.isArray(np.paymentAttempts) ? np.paymentAttempts.map(normalizeObjectKeys) : [])
        };
      })
    : (o.payment ? [normalizeObjectKeys(o.payment)] : []);

  const isStatusSuccess = (st) => {
    if (!st) return false;
    const s = String(st).trim().toLowerCase();
    return s === 'paid' || s === 'succeeded' || s === 'success' || s === 'completed' || s === 'settled';
  };
  const isStatusFailed = (st) => {
    if (!st) return false;
    const s = String(st).trim().toLowerCase();
    return s === 'failed' || s === 'declined' || s === 'cancelled' || s === 'canceled';
  };
  const isStatusRefunded = (st) => {
    if (!st) return false;
    const s = String(st).trim().toLowerCase();
    return s.includes('refund');
  };

  const hasPaidPayment = paymentsList.some(p => isStatusSuccess(p.status) || (Array.isArray(p.attempts) && p.attempts.some(a => isStatusSuccess(a.status))));
  const hasFailedPayment = paymentsList.some(p => isStatusFailed(p.status));
  const rawPaymentStatus = o.paymentStatus || o.payment_status;
  const rawOrderStatus = o.orderStatus || o.status || 'Pending';
  const paymentMethodCandidates = [
    o.paymentMethod,
    o.paymentMethodCode,
    o.paymentMethodName,
    o.payment_method,
    o.paymentType,
    paymentsList[0]?.paymentMethod,
    paymentsList[0]?.method,
    paymentsList[0]?.provider,
    o.shippingSnapshot?.paymentMethod
  ];
  const orderIdRaw = o.id !== undefined && o.id !== null ? o.id : o.orderNumber;
  const isCod = Boolean(
    o.isCod ||
    isOrderCod(orderId) ||
    isOrderCod(orderIdRaw) ||
    (o.orderNumber && isOrderCod(o.orderNumber)) ||
    paymentMethodCandidates.some(val => {
      if (!val) return false;
      const s = String(val).toLowerCase().trim();
      return s.includes('cod') || s.includes('cash') || s.includes('delivery');
    })
  );

  if (isCod) {
    recordCodOrder(orderId);
    if (orderIdRaw) recordCodOrder(orderIdRaw);
    if (o.orderNumber) recordCodOrder(o.orderNumber);
  }

  // Check persistent verified payment registry (only applies to online Stripe payments, not COD)
  const isLocallyPaid = !isCod && (isOrderConfirmedPaid(orderId) || isOrderConfirmedPaid(orderIdRaw));

  let resolvedPaymentStatus = 'Pending';
  if (!isCod && (isLocallyPaid || hasPaidPayment || isStatusSuccess(rawPaymentStatus) || o.paidAt)) {
    resolvedPaymentStatus = 'Paid';
  } else if (isCod) {
    resolvedPaymentStatus = (hasPaidPayment || isStatusSuccess(rawPaymentStatus)) ? 'Paid' : 'Pending';
  } else if (isStatusRefunded(rawPaymentStatus) || paymentsList.some(p => isStatusRefunded(p.status))) {
    resolvedPaymentStatus = 'Refunded';
  } else if (hasFailedPayment || isStatusFailed(rawPaymentStatus)) {
    resolvedPaymentStatus = 'Failed';
  } else if (rawPaymentStatus && rawPaymentStatus !== 'Pending') {
    resolvedPaymentStatus = rawPaymentStatus;
  }

  const resolvedPaymentId = o.paymentId || paymentsList[0]?.id || paymentsList[0]?.paymentId || null;
  const resolvedProviderPaymentId = o.providerPaymentId || paymentsList[0]?.providerPaymentId || paymentsList[0]?.transactionId || null;

  // When order is paid, order status must advance past Pending to Processing
  const finalOrderStatus = (resolvedPaymentStatus === 'Paid' && !isCod && rawOrderStatus === 'Pending')
    ? 'Processing'
    : rawOrderStatus;

  return {
    id: orderId,
    numericId: typeof orderId === 'number' ? orderId : (!isNaN(Number(orderId)) && Number(orderId) > 0 ? Number(orderId) : null),
    orderNumber: o.orderNumber || (typeof orderId === 'string' && orderId.startsWith('ORD-') ? orderId : `ORD-${orderId}`),
    createdAt: o.createdAt || o.date || new Date().toISOString(),
    date: o.date || o.createdAt || new Date().toISOString(),
    deliveredAt: o.deliveredAt || null,
    subtotal,
    discountTotal,
    shippingCost,
    total,
    currency,
    orderStatus: finalOrderStatus,
    status: finalOrderStatus,
    paymentStatus: resolvedPaymentStatus,
    paymentId: resolvedPaymentId,
    providerPaymentId: resolvedProviderPaymentId,
    paidAt: o.paidAt || (resolvedPaymentStatus === 'Paid' ? (o.updatedAt || o.createdAt || new Date().toISOString()) : null),
    paymentMethod: isCod ? 'COD' : (o.paymentMethod || o.paymentMethodCode || ''),
    paymentMethodCode: isCod ? 'COD' : (o.paymentMethodCode || o.paymentMethod || ''),
    paymentMethodName: isCod ? 'Cash on Delivery (COD)' : (o.paymentMethodName || o.paymentMethod || ''),
    isCod,
    compensationFailure: Boolean(o.compensationFailure),
    
    // Customer
    customer: customerObj || {
      id: resolvedUserId,
      name: resolvedCustomerName,
      email: resolvedCustomerEmail,
      phone: resolvedCustomerPhone
    },
    customerName: resolvedCustomerName,
    customerEmail: resolvedCustomerEmail,
    customerPhone: resolvedCustomerPhone,
    userId: resolvedUserId,
    
    // Totals snapshot
    totals: totalsObj || {
      subtotal,
      discountTotal,
      shippingCost,
      total,
      currency
    },

    // Line Items
    items: Array.isArray(o.items) ? o.items.map(item => {
      const norm = normalizeObjectKeys(item);
      const name = norm.productName || norm.name || 'Imperial Flacon';
      const unitPrice = Number(norm.unitPrice !== undefined ? norm.unitPrice : (norm.price || 0));
      const originalUnitPrice = Number(norm.originalUnitPrice !== undefined ? norm.originalUnitPrice : unitPrice);
      const effectiveUnitPrice = Number(norm.effectiveUnitPrice !== undefined ? norm.effectiveUnitPrice : unitPrice);
      const quantity = Number(norm.quantity ?? norm.qty ?? 1);
      return {
        ...norm,
        id: norm.id,
        productId: norm.productId || norm.id,
        name,
        productName: name,
        productDescription: norm.productDescription || norm.description || '',
        skuCode: norm.skuCode || norm.sku || '',
        brandName: norm.brandName || norm.brand || 'Arabian Sheikh',
        categoryName: norm.categoryName || norm.category || 'Perfumes',
        unitPrice,
        originalUnitPrice,
        effectiveUnitPrice,
        price: effectiveUnitPrice,
        quantity,
        discountAmount: Number(norm.discountAmount || 0),
        promotionDiscountAmount: Number(norm.promotionDiscountAmount || 0),
        couponDiscountAmount: Number(norm.couponDiscountAmount || 0)
      };
    }) : [],

    // Shipping & Address Snapshots
    shippingAddress: resolvedShippingAddress,
    shippingSnapshot: o.shippingSnapshot ? normalizeObjectKeys(o.shippingSnapshot) : null,
    couponSnapshot: o.couponSnapshot ? normalizeObjectKeys(o.couponSnapshot) : null,
    promotionSnapshot: o.promotionSnapshot ? normalizeObjectKeys(o.promotionSnapshot) : null,

    // Logistics & Tracking
    shipping: o.shipping || {
      shippingCompanyName: o.shippingSnapshot?.shippingCompanyName || o.carrier || 'DHL Express',
      trackingNumber,
      trackingUrl: o.trackingUrl || ''
    },
    shipments,
    trackingNumber: trackingNumber || o.trackingNumber || '',
    trackingCode: trackingNumber,
    dhlTrackingNumber: trackingNumber,

    // Audit & Purchase Cycle Sub-resources
    payments: paymentsList,
    returns: Array.isArray(o.returns) ? o.returns.map(r => normalizeReturn(r)) : [],
    refunds: Array.isArray(o.refunds) ? o.refunds.map(normalizeObjectKeys) : [],
    statusHistory: Array.isArray(o.statusHistory) ? o.statusHistory.map(normalizeObjectKeys) : [],
    compensation: o.compensation ? normalizeObjectKeys(o.compensation) : null
  };
}

/**
 * Shipping Quote / Option Normalizer (Compliant with ShippingQuoteResponse & ShippingOption)
 */
export function normalizeShippingOption(raw) {
  if (!raw) return null;
  const opt = normalizeObjectKeys(raw);
  // quoteId must only come from quoteId, never opt.id (opt.id is the method/option ID)
  const quoteId = opt.quoteId && typeof opt.quoteId === 'string' ? opt.quoteId.trim() : null;

  // 1. Resolve carrier name directly from API (supporting all backend naming variants)
  let carrier = null;
  if (typeof opt.carrier === 'string' && opt.carrier.trim()) {
    carrier = opt.carrier.trim();
  } else if (typeof opt.carrierName === 'string' && opt.carrierName.trim()) {
    carrier = opt.carrierName.trim();
  } else if (typeof opt.shippingCompanyName === 'string' && opt.shippingCompanyName.trim()) {
    carrier = opt.shippingCompanyName.trim();
  } else if (typeof opt.companyName === 'string' && opt.companyName.trim()) {
    carrier = opt.companyName.trim();
  } else if (opt.shippingCompany && typeof opt.shippingCompany === 'object' && opt.shippingCompany.name) {
    carrier = String(opt.shippingCompany.name).trim();
  } else if (typeof opt.shippingCompany === 'string' && opt.shippingCompany.trim()) {
    carrier = opt.shippingCompany.trim();
  } else if (opt.company && typeof opt.company === 'object' && opt.company.name) {
    carrier = String(opt.company.name).trim();
  }

  // 2. Resolve shipping method name directly from API
  let shippingMethod = null;
  if (typeof opt.shippingMethod === 'string' && opt.shippingMethod.trim()) {
    shippingMethod = opt.shippingMethod.trim();
  } else if (typeof opt.shippingMethodName === 'string' && opt.shippingMethodName.trim()) {
    shippingMethod = opt.shippingMethodName.trim();
  } else if (typeof opt.methodName === 'string' && opt.methodName.trim()) {
    shippingMethod = opt.methodName.trim();
  } else if (typeof opt.serviceName === 'string' && opt.serviceName.trim()) {
    shippingMethod = opt.serviceName.trim();
  } else if (typeof opt.name === 'string' && opt.name.trim()) {
    shippingMethod = opt.name.trim();
  } else if (typeof opt.title === 'string' && opt.title.trim()) {
    shippingMethod = opt.title.trim();
  }

  const isExpress = String(shippingMethod || '').toLowerCase().includes('express') || String(shippingMethod || '').toLowerCase().includes('exp');

  const rawFee = opt.shippingFee !== undefined
    ? opt.shippingFee
    : (opt.cost !== undefined
      ? opt.cost
      : (opt.price !== undefined
        ? opt.price
        : (opt.fee !== undefined ? opt.fee : null)));

  const rawFeeNum = Number(rawFee);
  const hasPositiveRawFee = !isNaN(rawFeeNum) && rawFeeNum > 0;
  const baseShippingFee = hasPositiveRawFee ? rawFeeNum : (isExpress ? 12.00 : 5.00);

  let fee = hasPositiveRawFee ? rawFeeNum : (opt.isFree === true || rawFee === 0 || rawFee === '0' || opt.isFreeDelivery ? 0 : (isExpress ? 12.00 : 5.00));
  const isFree = fee === 0 || Boolean(opt.isFree || opt.isFreeDelivery);

  const minDays = opt.minDeliveryDays !== undefined && opt.minDeliveryDays !== null
    ? Number(opt.minDeliveryDays)
    : null;
  const maxDays = opt.maxDeliveryDays !== undefined && opt.maxDeliveryDays !== null
    ? Number(opt.maxDeliveryDays)
    : null;

  let estDays = null;
  if (opt.estimatedDeliveryDays !== undefined && opt.estimatedDeliveryDays !== null) {
    const rawEst = String(opt.estimatedDeliveryDays).trim();
    if (rawEst !== '' && rawEst !== '0' && rawEst !== '3-3') {
      const numEst = Number(rawEst);
      if (!isNaN(numEst)) {
        if (numEst > 0) estDays = numEst;
      } else {
        estDays = rawEst;
      }
    }
  }

  let shippingMethodId = opt.shippingMethodId !== undefined && opt.shippingMethodId !== null && !isNaN(Number(opt.shippingMethodId))
    ? Number(opt.shippingMethodId)
    : (opt.methodId !== undefined && opt.methodId !== null && !isNaN(Number(opt.methodId))
      ? Number(opt.methodId)
      : (opt.serviceId !== undefined && opt.serviceId !== null && !isNaN(Number(opt.serviceId))
        ? Number(opt.serviceId)
        : (typeof opt.id === 'number' || (!isNaN(Number(opt.id)) && Number(opt.id) > 0)
          ? Number(opt.id)
          : null)));

  let shippingCompanyId = opt.shippingCompanyId !== undefined && opt.shippingCompanyId !== null && !isNaN(Number(opt.shippingCompanyId))
    ? Number(opt.shippingCompanyId)
    : (opt.companyId !== undefined && opt.companyId !== null && !isNaN(Number(opt.companyId))
      ? Number(opt.companyId)
      : (opt.shippingCompany && typeof opt.shippingCompany === 'object' && opt.shippingCompany.id
        ? Number(opt.shippingCompany.id)
        : null));

  // Determine carrier and company mapping strictly from API response without assuming method IDs
  if (!carrier) {
    const mUpper = String(shippingMethod || '').toUpperCase();
    if (mUpper.includes('ECONT')) {
      carrier = 'ECONT';
    } else if (mUpper.includes('SPEEDY')) {
      carrier = 'Speedy';
    } else if (mUpper.includes('DHL')) {
      carrier = 'DHL Express';
    } else if (opt.companyName || opt.shippingCompanyName) {
      carrier = opt.companyName || opt.shippingCompanyName;
    } else {
      carrier = shippingMethod || 'Carrier';
    }
  }

  if (!shippingMethod) {
    shippingMethod = carrier ? `${carrier} ${isExpress ? 'Express' : 'Standard'}` : 'Standard Delivery';
  }

  if (!shippingMethodId) {
    const fallbackId = opt.id ?? opt.methodId ?? opt.serviceId;
    if (fallbackId !== undefined && fallbackId !== null && !isNaN(Number(fallbackId)) && Number(fallbackId) > 0) {
      shippingMethodId = Number(fallbackId);
    } else {
      const cUpper = String(carrier || shippingMethod || '').toUpperCase();
      if (cUpper.includes('ECONT')) {
        shippingMethodId = 1;
      } else if (cUpper.includes('SPEEDY')) {
        shippingMethodId = 2;
      } else if (cUpper.includes('DHL')) {
        shippingMethodId = 3;
      } else {
        shippingMethodId = 1;
      }
    }
  }

  return {
    quoteId,
    shippingMethodId,
    shippingCompanyId,
    carrier,
    carrierName: carrier,
    shippingMethod,
    methodName: shippingMethod,
    shippingFee: fee,
    cost: fee,
    price: fee,
    baseShippingFee,
    currency: opt.currency || 'EUR',
    estimatedDeliveryDays: estDays,
    minDeliveryDays: minDays,
    maxDeliveryDays: maxDays,
    isFree,
    rateSource: opt.rateSource || null
  };
}

/**
 * Order Tracking Normalizer (Compliant with OrderTrackingResponse & TrackingEventResponse)
 */
export function normalizeTrackingResponse(raw) {
  if (!raw) return null;
  const t = normalizeObjectKeys(raw);
  const rawEvents = Array.isArray(t.events) ? t.events : [];
  const events = rawEvents.map(e => {
    const norm = normalizeObjectKeys(e);
    return {
      status: norm.status || 'Updated',
      description: norm.description || null,
      location: norm.location || null,
      occurredAt: norm.occurredAt || norm.date || new Date().toISOString()
    };
  });

  // Section 7: Display tracking timeline in chronological order (oldest first, newest last)
  events.sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());

  const trackingCandidates = [
    t.trackingNumber,
    t.trackingCode,
    t.airwayBillNumber,
    t.waybillNumber,
    t.dhlTrackingNumber,
    t.carrierTrackingNumber,
    t.shippingSnapshot?.trackingNumber
  ];
  const trackingNumber = trackingCandidates
    .map(c => (c !== undefined && c !== null ? String(c).trim() : ''))
    .find(c => c && !['null', 'undefined', 'pending', 'unassigned', 'none', 'n/a'].includes(c.toLowerCase())) || null;

  const resolvedCarrier = t.carrier || t.carrierName || t.shippingCompanyName || t.companyName || 'Carrier';

  return {
    orderId: t.orderId ? Number(t.orderId) : null,
    shipmentId: t.shipmentId ? Number(t.shipmentId) : null,
    carrier: resolvedCarrier,
    trackingNumber,
    trackingCode: trackingNumber,
    dhlTrackingNumber: trackingNumber,
    currentStatus: t.currentStatus || t.shipmentStatus || t.status || null,
    carrierStatus: t.carrierStatus || null,
    expectedDeliveryDate: t.expectedDeliveryDate || null,
    events
  };
}

/**
 * Return Eligibility Normalizer (Customer)
 */
export function normalizeReturnEligibility(raw) {
  if (!raw) return { eligible: false, reason: 'Return eligibility information unavailable.' };
  const d = normalizeObjectKeys(raw);
  const eligibleItems = Array.isArray(d.eligibleItems)
    ? d.eligibleItems.map(item => {
        const i = normalizeObjectKeys(item);
        return {
          orderItemId: Number(i.orderItemId || i.id || 0),
          productName: i.productName || 'Imperial Creation',
          productImageUrl: cleanImageUrl(i.productImageUrl || i.imageUrl || i.image),
          unitPrice: Number(i.unitPrice || 0),
          orderedQuantity: Number(i.orderedQuantity || i.quantity || 1),
          eligibleQuantity: Number(i.eligibleQuantity !== undefined ? i.eligibleQuantity : (i.quantity || 1)),
          currency: i.currency || 'EUR'
        };
      })
    : [];

  return {
    orderId: Number(d.orderId || 0),
    eligible: Boolean(d.eligible),
    reason: d.reason || (d.eligible ? 'Order is eligible for return.' : 'This order is outside the return window.'),
    deliveredAt: d.deliveredAt || null,
    returnDeadline: d.returnDeadline || null,
    daysRemaining: d.daysRemaining !== undefined && d.daysRemaining !== null ? Number(d.daysRemaining) : null,
    eligibleItems
  };
}

/**
 * Return Item Normalizer
 */
export function normalizeReturnItem(raw) {
  if (!raw) return null;
  const item = normalizeObjectKeys(raw);
  const photos = Array.isArray(item.photos)
    ? item.photos.map(p => {
        if (typeof p === 'string') return { id: p, photoId: p, url: cleanImageUrl(p) };
        const np = normalizeObjectKeys(p);
        return {
          id: np.id || np.photoId,
          photoId: np.photoId || np.id,
          url: cleanImageUrl(np.url || np.photoUrl)
        };
      })
    : [];

  return {
    id: item.id !== undefined && item.id !== null ? item.id : null,
    orderItemId: Number(item.orderItemId || item.id || 0),
    productName: item.productName || 'Imperial Flacon',
    productImageUrl: cleanImageUrl(item.productImageUrl || item.imageUrl || item.image),
    image: cleanImageUrl(item.productImageUrl || item.imageUrl || item.image),
    unitPrice: Number(item.unitPrice || 0),
    quantity: Number(item.quantity || 1),
    reason: item.reason || 'Other',
    reasonNote: item.reasonNote || '',
    status: item.status || 'Pending',
    refundAmount: Number(item.refundAmount || 0),
    rejectionReason: item.rejectionReason || null,
    paidAt: item.paidAt || null,
    paidByAdmin: item.paidByAdmin || null,
    photos
  };
}

/**
 * Return Request Normalizer (Customer & Admin)
 */
export function normalizeReturn(raw) {
  if (!raw) return null;
  const ret = normalizeObjectKeys(raw);
  const items = Array.isArray(ret.items)
    ? ret.items.map(normalizeReturnItem).filter(Boolean)
    : [];

  return {
    id: ret.id !== undefined && ret.id !== null ? ret.id : null,
    orderId: ret.orderId !== undefined ? Number(ret.orderId) : null,
    orderNumber: ret.orderNumber || (ret.orderId ? `ORD-${ret.orderId}` : ''),
    status: ret.status || 'PendingReview',
    createdAt: ret.createdAt || ret.requestedAt || new Date().toISOString(),
    reviewedAt: ret.reviewedAt || null,
    totalRefundAmount: Number(ret.totalRefundAmount || 0),
    currency: ret.currency || 'EUR',
    items,
    // Admin specific fields
    customer: ret.customer || null,
    customerName: ret.customerName || ret.customer?.name || 'Valued Patron',
    customerEmail: ret.customerEmail || ret.customer?.email || '',
    customerPhone: ret.customerPhone || ret.customer?.phone || '',
    bankAccountNumber: ret.bankAccountNumber || '',
    bankAccountHolderName: ret.bankAccountHolderName || '',
    bankName: ret.bankName || '',
    reviewedBy: ret.reviewedBy || null
  };
}

/**
 * Admin Refund Item Normalizer
 */
export function normalizeRefund(raw) {
  if (!raw) return null;
  const ref = normalizeObjectKeys(raw);
  const approvedItems = Array.isArray(ref.approvedItems)
    ? ref.approvedItems.map(normalizeReturnItem).filter(Boolean)
    : (Array.isArray(ref.items) ? ref.items.map(normalizeReturnItem).filter(Boolean) : []);

  return {
    id: ref.id !== undefined && ref.id !== null ? ref.id : null,
    returnRequestId: Number(ref.returnRequestId || ref.returnId || 0),
    orderNumber: ref.orderNumber || (ref.orderId ? `ORD-${ref.orderId}` : ''),
    customer: ref.customer || ref.customerName || 'Valued Patron',
    email: ref.email || ref.customerEmail || '',
    bankAccount: ref.bankAccount || ref.bankAccountNumber || '',
    bankAccountNumber: ref.bankAccountNumber || ref.bankAccount || '',
    accountHolder: ref.accountHolder || ref.bankAccountHolderName || '',
    bankAccountHolderName: ref.bankAccountHolderName || ref.accountHolder || '',
    bankName: ref.bankName || '',
    reviewedDate: ref.reviewedDate || ref.reviewedAt || null,
    reviewedBy: ref.reviewedBy || null,
    currency: ref.currency || 'EUR',
    approvedItems,
    quantity: Number(ref.quantity || (approvedItems.reduce((sum, i) => sum + (i.quantity || 1), 0)) || 1),
    unitPrice: Number(ref.unitPrice || 0),
    refundAmount: Number(ref.refundAmount ?? ref.totalRefundAmount ?? 0),
    totalRefundAmount: Number(ref.totalRefundAmount ?? ref.refundAmount ?? 0),
    paidAt: ref.paidAt || null,
    paidByAdmin: ref.paidByAdmin || null,
    isPaid: Boolean(ref.isPaid || ref.paidAt)
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

  let rawCountry = a.country || a.countryName || '';
  let countryCode = (a.countryCode || '').toUpperCase().trim();
  if (!countryCode && rawCountry) {
    countryCode = rawCountry.length === 2 ? rawCountry.toUpperCase() : (COUNTRY_CODE_MAP[rawCountry.toUpperCase()] || 'BG');
  }
  if (!countryCode) countryCode = 'BG';

  let country = rawCountry && rawCountry.length > 2 ? rawCountry : (COUNTRY_NAMES[countryCode] || countryCode || 'Bulgaria');

  const addressLine1 = a.addressLine1 || a.street || a.streetAddress || a.address || a.line1 || '';
  const addressLine2 = a.addressLine2 || a.line2 || a.apartment || a.suite || null;
  const region = a.region || a.state || a.province || '';
  const city = a.city || a.town || '';
  const postalCode = a.postalCode || a.zipCode || a.zip || '';

  return {
    id: Number(a.id || 0),
    label: ['Home', 'Work', 'Other'].includes(label) ? label : 'Other',
    customLabel: a.customLabel ? String(a.customLabel).trim() : null,
    fullName: a.fullName ? String(a.fullName).trim() : '',
    phone: a.phone ? String(a.phone).trim() : '',
    countryCode,
    country,
    region,
    state: region,
    city,
    addressLine1,
    street: addressLine1,
    address: addressLine1,
    addressLine2,
    postalCode,
    zipCode: postalCode,
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

  let rawCountry = a.country || a.countryName || '';
  let countryCode = (a.countryCode || '').toUpperCase().trim();
  if (!countryCode && rawCountry) {
    countryCode = rawCountry.length === 2 ? rawCountry.toUpperCase() : (COUNTRY_CODE_MAP[rawCountry.toUpperCase()] || 'BG');
  }
  if (!countryCode) countryCode = 'BG';

  let country = rawCountry && rawCountry.length > 2 ? rawCountry : (COUNTRY_NAMES[countryCode] || countryCode || 'Bulgaria');

  const addressLine1 = a.addressLine1 || a.street || a.streetAddress || a.address || a.line1 || '';
  const addressLine2 = a.addressLine2 || a.line2 || a.apartment || a.suite || null;
  const region = a.region || a.state || a.province || '';
  const city = a.city || a.town || '';
  const postalCode = a.postalCode || a.zipCode || a.zip || '';

  return {
    fullName: a.fullName ? String(a.fullName).trim() : '',
    phone: a.phone ? String(a.phone).trim() : '',
    countryCode,
    country,
    region,
    state: region,
    city,
    addressLine1,
    street: addressLine1,
    address: addressLine1,
    addressLine2,
    postalCode,
    zipCode: postalCode
  };
}

/**
 * Bundle Item Normalizer
 */
export function normalizeBundleItem(raw) {
  if (!raw) return null;
  const item = normalizeObjectKeys(raw);
  return {
    productId: Number(item.productId || 0),
    productName: item.productName || item.name || '',
    name: item.productName || item.name || '',
    brandName: item.brandName || item.brand || '',
    imageUrl: cleanImageUrl(item.imageUrl || item.image || item.productImageUrl),
    unitPrice: Number(item.unitPrice || item.price || 0),
    quantity: Number(item.quantity || 1),
    lineTotal: Number(item.lineTotal || (Number(item.unitPrice || item.price || 0) * Number(item.quantity || 1)) || 0)
  };
}

/**
 * Promotion Bundle Normalizer
 */
export function normalizeBundle(raw) {
  if (!raw) return null;
  const b = normalizeObjectKeys(raw);
  const items = Array.isArray(b.items) ? b.items.map(normalizeBundleItem).filter(Boolean) : [];
  
  const computedOriginalTotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const bundlePrice = Number(b.bundlePrice ?? 0);
  const individualItemsTotal = Number(b.originalItemsPrice || b.individualItemsTotal || computedOriginalTotal);
  const savingsAmount = Number(b.savingsAmount ?? Math.max(0, individualItemsTotal - bundlePrice));
  const savingsPercentage = Number(b.savingsPercentage ?? (individualItemsTotal > 0 ? ((savingsAmount / individualItemsTotal) * 100) : 0));

  return {
    id: Number(b.id || 0),
    promotionId: Number(b.promotionId || 0),
    promotionName: b.promotionName || '',
    name: String(b.name || '').trim(),
    bundlePrice,
    originalItemsPrice: individualItemsTotal,
    individualItemsTotal,
    savingsAmount,
    savingsPercentage: Math.round(savingsPercentage * 10) / 10,
    items
  };
}

/**
 * Promotion Applicability Rule Normalizer
 */
export function normalizePromotionApplicability(raw) {
  if (!raw) return null;
  const rule = normalizeObjectKeys(raw);

  let targetType = 'Product';
  const rawTarget = rule.targetType;
  if (typeof rawTarget === 'number') {
    const map = { 0: 'Product', 1: 'Category', 2: 'Subcategory', 3: 'Brand', 4: 'PerfumeCategory' };
    targetType = map[rawTarget] || 'Product';
  } else if (rawTarget !== undefined && rawTarget !== null) {
    const s = String(rawTarget).toLowerCase();
    if (s.includes('product') || s === '0') targetType = 'Product';
    else if (s.includes('perfume') || s === '4') targetType = 'PerfumeCategory';
    else if (s.includes('subcat') || s === '2') targetType = 'Subcategory';
    else if (s.includes('cat') || s === '1') targetType = 'Category';
    else if (s.includes('brand') || s === '3') targetType = 'Brand';
    else targetType = String(rawTarget);
  }

  return {
    id: Number(rule.id || 0),
    targetType,
    targetId: Number(rule.targetId || 0),
    isExcluded: Boolean(rule.isExcluded)
  };
}

/**
 * Promotion Normalizer
 */
export function normalizePromotion(raw) {
  if (!raw) return null;
  const p = normalizeObjectKeys(raw);

  const isBundle = p.type === 1 || String(p.type || '').toLowerCase() === 'bundle';
  const type = isBundle ? 'Bundle' : 'Discount';

  let discountType = null;
  if (type === 'Discount') {
    if (p.discountType === 1 || String(p.discountType || '').toLowerCase() === 'fixed') {
      discountType = 'Fixed';
    } else {
      discountType = 'Percentage';
    }
  }

  const rawApplicabilities = p.applicabilities || p.applicability || [];
  const applicability = Array.isArray(rawApplicabilities)
    ? rawApplicabilities.map(normalizePromotionApplicability).filter(Boolean)
    : [];

  const rawBundles = p.bundles || [];
  const bundles = Array.isArray(rawBundles)
    ? rawBundles.map(normalizeBundle).filter(Boolean)
    : [];

  let status = 'Active';
  const rawStatus = p.status !== undefined && p.status !== null ? p.status : (p.Status !== undefined ? p.Status : null);
  if (typeof rawStatus === 'string' && rawStatus.trim()) {
    const sLower = rawStatus.trim().toLowerCase();
    if (sLower === 'active') status = 'Active';
    else if (sLower === 'inactive') status = 'Inactive';
    else if (sLower === 'scheduled') status = 'Scheduled';
    else if (sLower === 'expired') status = 'Expired';
    else status = rawStatus.trim();
  } else if (typeof rawStatus === 'number' || (typeof rawStatus === 'string' && !isNaN(Number(rawStatus)))) {
    const num = Number(rawStatus);
    if (num === 0) status = 'Scheduled';
    else if (num === 1) status = 'Active';
    else if (num === 2) status = 'Inactive';
    else if (num === 3) status = 'Expired';
  }

  // Deactivated indicators strictly override
  if (p.deactivatedAt || p.deactivatedBy || p.isActive === false || p.is_active === false || p.isActive === 0 || p.isActive === 'false') {
    status = 'Inactive';
  } else if (!status) {
    status = 'Active';
  }

  return {
    id: Number(p.id || 0),
    name: String(p.name || '').trim(),
    type,
    discountType,
    discountValue: p.discountValue !== null && p.discountValue !== undefined ? Number(p.discountValue) : null,
    startDate: p.startDate || '',
    endDate: p.endDate || '',
    minOrderAmount: p.minOrderAmount !== null && p.minOrderAmount !== undefined ? Number(p.minOrderAmount) : null,
    maxDiscountAmount: p.maxDiscountAmount !== null && p.maxDiscountAmount !== undefined ? Number(p.maxDiscountAmount) : null,
    usageLimit: p.usageLimit !== null && p.usageLimit !== undefined ? Number(p.usageLimit) : null,
    usageCount: Number(p.usageCount || 0),
    status,
    isActive: status === 'Active',
    deactivatedBy: p.deactivatedBy || null,
    deactivatedAt: p.deactivatedAt || null,
    applicability,
    applicabilities: applicability,
    bundles,
    bundlesCount: Number(p.bundlesCount ?? bundles.length),
    createdAt: p.createdAt || null,
    updatedAt: p.updatedAt || null
  };
}

/**
 * Check if a promotion is strictly active right now (not inactive, not scheduled, not expired, not deactivated)
 */
export function isPromotionActive(promo) {
  if (!promo || typeof promo !== 'object') return false;

  // 1. Explicit deactivation markers
  if (promo.deactivatedAt || promo.deactivatedBy) return false;
  if (promo.isActive === false || promo.is_active === false || promo.isActive === 0 || promo.isActive === 'false') {
    return false;
  }

  // 2. Status string / enum checks
  const rawStatus = promo.status !== undefined && promo.status !== null ? promo.status : '';
  const statusStr = String(rawStatus).trim().toLowerCase();

  if (statusStr === 'inactive' || statusStr === 'expired' || statusStr === 'scheduled' || statusStr === 'draft') {
    return false;
  }
  // In C# ASP.NET Core enum: Scheduled = 0, Active = 1, Inactive = 2, Expired = 3
  if (rawStatus === 2 || rawStatus === '2' || rawStatus === 3 || rawStatus === '3') {
    return false;
  }
  if (statusStr && statusStr !== 'active' && rawStatus !== 1 && rawStatus !== '1' && rawStatus !== 0) {
    return false;
  }

  // 3. Date validity check (real-time UTC)
  const now = new Date();
  if (promo.startDate) {
    const start = new Date(promo.startDate);
    if (!isNaN(start.getTime()) && start > now) {
      return false; // Scheduled for future
    }
  }

  if (promo.endDate) {
    const end = new Date(promo.endDate);
    if (!isNaN(end.getTime()) && end < now) {
      return false; // Expired in past
    }
  }

  return true;
}

/**
 * Promotion Paginated List Normalizer
 */
export function normalizePromotionList(raw) {
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
    const items = raw.map(normalizePromotion).filter(Boolean);
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
  const items = rawItems.map(normalizePromotion).filter(Boolean);

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
 * Promotion Analytics Normalizer
 */
export function normalizePromotionAnalytics(raw) {
  if (!raw) return { promotionId: 0, name: '', orders: 0, promotionUsageCount: 0, discountGiven: 0 };
  const a = normalizeObjectKeys(raw);
  return {
    promotionId: Number(a.promotionId || a.id || 0),
    name: a.name || '',
    orders: Number(a.orders ?? a.totalOrders ?? 0),
    promotionUsageCount: Number(a.promotionUsageCount ?? a.usageCount ?? 0),
    discountGiven: Number(a.discountGiven ?? a.totalDiscountGiven ?? 0)
  };
}

// ==========================================
// 14. SUPERADMIN / ADMINISTRATOR MANAGEMENT NORMALIZERS
// ==========================================

/**
 * Maps dashboard language values (0: Bg, 1: En, 2: Es or 'Bg', 'En', 'Es') to display labels
 */
export function getDashboardLanguageLabel(val) {
  if (val === 0 || val === '0' || String(val).toLowerCase() === 'bg') return 'Bulgarian';
  if (val === 2 || val === '2' || String(val).toLowerCase() === 'es') return 'Spanish';
  return 'English';
}

export function getDashboardLanguageCode(val) {
  if (val === 0 || val === '0' || String(val).toLowerCase() === 'bg') return 'Bg';
  if (val === 2 || val === '2' || String(val).toLowerCase() === 'es') return 'Es';
  return 'En';
}

export function getDashboardLanguageNumeric(val) {
  if (val === 0 || val === '0' || String(val).toLowerCase() === 'bg') return 0;
  if (val === 2 || val === '2' || String(val).toLowerCase() === 'es') return 2;
  return 1;
}

/**
 * Administrator Summary & Profile Normalizer
 */
export function normalizeAdmin(raw) {
  if (!raw) return null;
  const a = normalizeObjectKeys(raw);

  const rawLang = a.preferredDashboardLanguage !== undefined ? a.preferredDashboardLanguage : (a.dashboardLanguage ?? 1);
  const isSuperAdmin = Boolean(a.isSuperAdmin === true || (a.email && a.email.toLowerCase().includes('superadmin')));
  const isActive = a.isActive !== false;

  return {
    id: Number(a.id || 0),
    fullName: String(a.fullName || a.name || 'Administrator').trim(),
    email: String(a.email || '').trim(),
    isSuperAdmin,
    isActive,
    status: isActive ? 'ACTIVE' : 'INACTIVE',
    preferredDashboardLanguage: rawLang,
    languageLabel: getDashboardLanguageLabel(rawLang),
    languageCode: getDashboardLanguageCode(rawLang),
    languageNumeric: getDashboardLanguageNumeric(rawLang),
    lastLoginAt: a.lastLoginAt || null,
    promotedFromUserId: a.promotedFromUserId !== null && a.promotedFromUserId !== undefined ? Number(a.promotedFromUserId) : null,
    isPromoted: Boolean(a.promotedFromUserId),
    createdBy: a.createdBy !== null && a.createdBy !== undefined ? Number(a.createdBy) : null,
    createdAt: a.createdAt || null
  };
}

/**
 * Paginated Administrator List Normalizer
 */
export function normalizeAdminList(raw) {
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
    const items = raw.map(normalizeAdmin).filter(Boolean);
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
  const items = rawItems.map(normalizeAdmin).filter(Boolean);

  const page = Number(res.page || res.pageNumber || 1);
  const pageSize = Number(res.pageSize || 20);
  const totalCount = Number(res.totalCount !== undefined ? res.totalCount : items.length);
  const totalPages = Number(res.totalPages !== undefined ? res.totalPages : Math.ceil(totalCount / pageSize) || 1);

  return {
    items,
    page,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage: Boolean(res.hasPreviousPage || res.hasPrevious || page > 1),
    hasNextPage: Boolean(res.hasNextPage || res.hasNext || page < totalPages)
  };
}

// ==========================================
// CONTENT MANAGEMENT NORMALIZERS
// ==========================================

export function normalizeFaqTranslation(raw) {
  if (!raw) return null;
  const t = normalizeObjectKeys(raw);
  return {
    languageCode: String(t.languageCode || 'en').toLowerCase(),
    question: t.question || '',
    answer: t.answer || ''
  };
}

export function normalizeFaq(raw) {
  if (!raw) return null;
  const f = normalizeObjectKeys(raw);
  const rawTranslations = Array.isArray(f.translations) ? f.translations : [];
  const translations = rawTranslations.map(normalizeFaqTranslation).filter(Boolean);

  // Preferred display question: English -> first available translation -> top-level property
  const enTrans = translations.find(t => t.languageCode === 'en');
  const firstTrans = translations[0];
  const question = enTrans?.question || firstTrans?.question || f.question || '';
  const answer = enTrans?.answer || firstTrans?.answer || f.answer || '';
  const availableLanguages = translations.map(t => t.languageCode);

  return {
    id: Number(f.id),
    sortOrder: Number(f.sortOrder || 0),
    isActive: f.isActive !== false,
    translations,
    question,
    answer,
    availableLanguages
  };
}

export function normalizeFaqList(raw) {
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
    const items = raw.map(normalizeFaq).filter(Boolean);
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
  const items = rawItems.map(normalizeFaq).filter(Boolean);
  const page = Number(res.page || 1);
  const pageSize = Number(res.pageSize || 20);
  const totalCount = Number(res.totalCount !== undefined ? res.totalCount : items.length);
  const totalPages = Number(res.totalPages !== undefined ? res.totalPages : Math.ceil(totalCount / pageSize) || 1);

  return {
    items,
    page,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage: Boolean(res.hasPreviousPage || page > 1),
    hasNextPage: Boolean(res.hasNextPage || page < totalPages)
  };
}

export function normalizeStaticPageTranslation(raw) {
  if (!raw) return null;
  const t = normalizeObjectKeys(raw);
  return {
    languageCode: String(t.languageCode || 'en').toLowerCase(),
    title: t.title || '',
    content: t.content || ''
  };
}

export function normalizeStaticPage(raw) {
  if (!raw) return null;
  const p = normalizeObjectKeys(raw);
  const rawTranslations = Array.isArray(p.translations) ? p.translations : [];
  const translations = rawTranslations.map(normalizeStaticPageTranslation).filter(Boolean);

  const enTrans = translations.find(t => t.languageCode === 'en');
  const firstTrans = translations[0];
  const title = enTrans?.title || firstTrans?.title || p.title || p.name || '';
  const content = enTrans?.content || firstTrans?.content || p.content || '';
  const availableLanguages = translations.map(t => t.languageCode);

  return {
    slug: p.slug || '',
    isActive: p.isActive !== false,
    translations,
    title,
    content,
    availableLanguages
  };
}

export function normalizeContact(raw) {
  if (!raw) return null;
  const c = normalizeObjectKeys(raw);
  return {
    id: c.id !== undefined ? Number(c.id) : null,
    type: c.type || 'Phone',
    value: c.value || '',
    isActive: c.isActive !== false
  };
}

export function normalizeContactList(raw) {
  if (!raw) return [];
  const items = Array.isArray(raw)
    ? raw
    : Array.isArray(raw.items)
      ? raw.items
      : Array.isArray(raw.data)
        ? raw.data
        : [];
  return items.map(normalizeContact).filter(Boolean);
}

// ==========================================
// 15. SALES REPORTS NORMALIZERS
// ==========================================

export function normalizeSalesReport(raw) {
  if (!raw) return null;
  const r = normalizeObjectKeys(raw);
  const p = r.period || {};

  return {
    period: {
      type: p.type || 'monthly',
      from: p.from || '',
      to: p.to || ''
    },
    currency: r.currency || 'EUR',
    orders: Number(r.orders || 0),
    grossSales: Number(r.grossSales || 0),
    discounts: Number(r.discounts || 0),
    shipping: Number(r.shipping || 0),
    refunds: Number(r.refunds || 0),
    netSales: Number(r.netSales || 0),
    averageOrderValue: Number(r.averageOrderValue || 0),
    customers: Number(r.customers || 0),
    message: r.message || null
  };
}

export function normalizeSalesProductItem(raw) {
  if (!raw) return null;
  const r = normalizeObjectKeys(raw);
  return {
    productId: Number(r.productId || 0),
    productName: r.productName || '',
    quantitySold: Number(r.quantitySold || 0),
    grossRevenue: Number(r.grossRevenue || 0),
    discountGiven: Number(r.discountGiven || 0),
    netRevenue: Number(r.netRevenue || 0)
  };
}

export function normalizeSalesCategoryItem(raw) {
  if (!raw) return null;
  const r = normalizeObjectKeys(raw);
  return {
    categoryId: Number(r.categoryId || 0),
    categoryName: r.categoryName || '',
    quantitySold: Number(r.quantitySold || 0),
    revenue: Number(r.revenue || 0)
  };
}

export function normalizeSalesCountryItem(raw) {
  if (!raw) return null;
  const r = normalizeObjectKeys(raw);
  return {
    countryCode: String(r.countryCode || '').trim().toUpperCase(),
    orders: Number(r.orders || 0),
    revenue: Number(r.revenue || 0),
    averageOrderValue: Number(r.averageOrderValue || 0),
    customers: Number(r.customers || 0),
    currency: r.currency || 'EUR'
  };
}
