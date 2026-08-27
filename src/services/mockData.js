// Official Arabian Sheikh Catalog & Store Data
// All products are served dynamically via the backend REST API. Nothing is hardcoded locally.

export const INITIAL_PRODUCTS = [];

export const PERFUME_TIERS = [
  {
    "id": "Luxury",
    "name": "Luxury Tier",
    "price": 50,
    "color": "#D4AF37"
  },
  {
    "id": "Royal",
    "name": "Royal Tier",
    "price": 40,
    "color": "#D4AF37"
  },
  {
    "id": "Classic",
    "name": "Classic Tier",
    "price": 30,
    "color": "#D4AF37"
  }
];

export const CATEGORIES = [
  {
    "id": "perfumes",
    "name": "Perfumes",
    "icon": "Sparkles"
  },
  {
    "id": "oils",
    "name": "Concentrated Oils",
    "icon": "Droplet"
  },
  {
    "id": "bakhoor",
    "name": "Bakhoor & Incense",
    "icon": "Flame"
  },
  {
    "id": "cosmetics",
    "name": "Cosmetics",
    "icon": "Heart"
  },
  {
    "id": "bundles",
    "name": "Gift Sets & Bundles",
    "icon": "Gift"
  }
];

export const INITIAL_USERS = [
  {
    "id": "user-admin-1",
    "name": "Grand Concierge",
    "email": "admin@arabiansheikh.com",
    "role": "ADMIN",
    "avatar": "/arabian-sheikh-logo.svg",
    "joinedDate": "2025-01-01",
    "ordersCount": 12,
    "totalSpent": 1250,
    "status": "ACTIVE"
  },
  {
    "id": "user-vip-1",
    "name": "Lord Tariq Al-Mansoor",
    "email": "tariq@arabiansheikh.com",
    "role": "CUSTOMER",
    "vipTier": "SOVEREIGN",
    "avatar": null,
    "joinedDate": "2025-03-12",
    "ordersCount": 8,
    "totalSpent": 620,
    "status": "ACTIVE"
  },
  {
    "id": "user-demo-1",
    "name": "Sheikh Al-Mansoor",
    "email": "sheikh.user@luxury.com",
    "role": "USER",
    "vipTier": "PATRON",
    "avatar": null,
    "joinedDate": "2025-05-10",
    "ordersCount": 4,
    "totalSpent": 260,
    "status": "ACTIVE"
  }
];

export const INITIAL_ORDERS = [
  {
    "id": "AS-882194",
    "customerName": "Lord Tariq Al-Mansoor",
    "customerEmail": "tariq@arabiansheikh.com",
    "date": "2026-08-18",
    "status": "CONFIRMED",
    "paymentMethod": "Credit Card (Visa)",
    "total": 140,
    "currency": "EUR",
    "items": [],
    "shippingAddress": {
      "fullName": "Lord Tariq Al-Mansoor",
      "street": "Gran Vía 45, Planta 8",
      "city": "Madrid",
      "postalCode": "28013",
      "country": "Spain"
    }
  }
];

export const INITIAL_DISCOUNTS = [
  {
    "id": "disc-sheikh10",
    "code": "SHEIKH10",
    "discountType": "percentage",
    "discountValue": 10,
    "minOrderAmount": 50,
    "status": "ACTIVE",
    "usageLimit": 100,
    "usedCount": 14,
    "description": "10% OFF on all orders over €50"
  },
  {
    "id": "disc-royalty20",
    "code": "ROYALTY20",
    "discountType": "percentage",
    "discountValue": 20,
    "minOrderAmount": 100,
    "status": "ACTIVE",
    "usageLimit": 50,
    "usedCount": 9,
    "description": "20% OFF on Sovereign VIP orders over €100"
  }
];
