/**
 * Arabian Sheikh - Data Transfer Object (DTO) Normalizers
 * 
 * Ensures robust bi-directional translation between backend API payloads
 * (supporting snake_case, camelCase, or custom schemas) and frontend entities.
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
 * Product Normalizer
 */
export function normalizeProduct(raw) {
  if (!raw) return null;
  const p = normalizeObjectKeys(raw);

  return {
    id: p.id || p.productId || `as-${p.slug || 'prod'}`,
    slug: p.slug || (p.name ? p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''),
    name: p.name || 'Imperial Extrait',
    arabicName: p.arabicName || p.arabic_name || '',
    bulgarianName: p.bulgarianName || p.bulgarian_name || '',
    spanishName: p.spanishName || p.spanish_name || '',
    tier: p.tier || 'Luxury',
    category: p.category || 'perfumes',
    gender: p.gender || 'Unisex',
    price: Number(p.price || 0),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
    stock: Number(p.stock !== undefined ? p.stock : 50),
    size: p.size || '60 ml / 2.0 fl oz',
    status: p.status || (p.stock > 0 ? 'ACTIVE' : 'OUT_OF_STOCK'),
    featured: Boolean(p.featured || p.isFeatured),
    isBestSeller: Boolean(p.isBestSeller || p.bestSeller),
    rating: Number(p.rating || 5.0),
    reviewsCount: Number(p.reviewsCount || (p.reviews ? p.reviews.length : 0)),
    description: p.description || '',
    spanishDescription: p.spanishDescription || p.description || '',
    bulgarianDescription: p.bulgarianDescription || p.description || '',
    fragranceFamily: p.fragranceFamily || p.scentFamily || 'Haute Parfumerie',
    scentFamily: p.scentFamily || p.fragranceFamily || 'Haute Parfumerie',
    tagline: p.tagline || '',
    spanishTagline: p.spanishTagline || '',
    topNotes: Array.isArray(p.topNotes) ? p.topNotes : (p.top_notes || []),
    heartNotes: Array.isArray(p.heartNotes) ? p.heartNotes : (p.heart_notes || []),
    baseNotes: Array.isArray(p.baseNotes) ? p.baseNotes : (p.base_notes || []),
    season: Array.isArray(p.season) ? p.season : ['All Seasons'],
    occasion: Array.isArray(p.occasion) ? p.occasion : ['Evening', 'Daily Luxury'],
    longevity: p.longevity || '14+ Hours',
    sillage: p.sillage || 'Regal & Intimate',
    concentration: p.concentration || '35% Pure Extrait Oil',
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image ? [p.image] : ['/products/luxury_designs/07_arabian_gold.webp']),
    cutoutImage: p.cutoutImage || p.cutout_image || (p.images ? p.images[0] : '/products/luxury_designs/07_arabian_gold.webp'),
    badge: p.badge || null,
    reviews: Array.isArray(p.reviews) ? p.reviews.map(normalizeReview) : []
  };
}

/**
 * Review Normalizer
 */
export function normalizeReview(raw) {
  if (!raw) return null;
  const r = normalizeObjectKeys(raw);
  return {
    id: r.id || `rev-${Date.now()}`,
    author: r.author || r.userName || r.user_name || 'Anonymous Patron',
    rating: Number(r.rating || 5),
    title: r.title || 'Exquisite Fragrance',
    comment: r.comment || r.body || '',
    date: r.date || r.createdAt || new Date().toISOString().split('T')[0],
    verifiedPurchase: Boolean(r.verifiedPurchase !== undefined ? r.verifiedPurchase : true),
    status: r.status || 'approved'
  };
}

/**
 * User Normalizer
 */
export function normalizeUser(raw) {
  if (!raw) return null;
  const u = normalizeObjectKeys(raw);
  return {
    id: u.id || u.userId || `user-${Date.now()}`,
    name: u.name || '',
    email: u.email || '',
    role: u.role || 'USER',
    status: u.status || 'ACTIVE',
    phone: u.phone || '',
    memberSince: u.memberSince || u.createdAt || new Date().toISOString().split('T')[0],
    ordersCount: Number(u.ordersCount || 0),
    totalSpent: Number(u.totalSpent || 0),
    addresses: Array.isArray(u.addresses) ? u.addresses : [],
    paymentMethods: Array.isArray(u.paymentMethods) ? u.paymentMethods : []
  };
}

/**
 * Order Normalizer
 */
export function normalizeOrder(raw) {
  if (!raw) return null;
  const o = normalizeObjectKeys(raw);
  return {
    id: o.id || (o.orderNumber ? `ORD-${o.orderNumber}` : `ORD-${Date.now().toString().slice(-5)}`),
    userId: o.userId || o.user_id || '',
    customerName: o.customerName || o.customer_name || '',
    customerEmail: o.customerEmail || o.customer_email || '',
    customerPhone: o.customerPhone || o.customer_phone || '',
    date: o.date || o.createdAt || new Date().toISOString(),
    status: o.status || 'CONFIRMED',
    items: Array.isArray(o.items) ? o.items.map(item => normalizeObjectKeys(item)) : [],
    subtotal: Number(o.subtotal || 0),
    tax: Number(o.tax || 0),
    shipping: Number(o.shipping || 0),
    discount: Number(o.discount || 0),
    discountCode: o.discountCode || o.discount_code || null,
    total: Number(o.total || 0),
    shippingAddress: o.shippingAddress || o.shipping_address || {},
    paymentMethod: o.paymentMethod || o.payment_method || 'stripe',
    paymentStatus: o.paymentStatus || o.payment_status || 'PAID',
    trackingCode: o.trackingCode || o.tracking_code || '',
    carrier: o.carrier || 'DHL Express',
    giftWrap: Boolean(o.giftWrap || o.gift_wrap),
    timeline: Array.isArray(o.timeline) ? o.timeline : [
      { status: 'PLACED', title: 'Order Placed', timestamp: o.date || new Date().toISOString() }
    ]
  };
}
