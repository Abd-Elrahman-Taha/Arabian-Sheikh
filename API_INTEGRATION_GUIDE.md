# Arabian Sheikh — Full Real API Integration Guide

This document outlines the complete REST API specification and contract required to connect a real backend to the Arabian Sheikh Haute Parfumerie platform.

---

## 1. Quick Start & Environment Variables

Configure your API endpoint in the `.env` file located in the root of the frontend project:

```env
# Base URL for all API requests (include version prefix if applicable)
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1

# Set to false to send live HTTP requests to your backend
# (Frontend will automatically fall back to local cached mock data if your server is unreachable during development)
VITE_USE_MOCK_API=false

# Request timeout in milliseconds
VITE_API_TIMEOUT=15000
```

---

## 2. Authentication & Authorization

All authenticated endpoints require an `Authorization` header containing a standard JWT Bearer token:

```http
Authorization: Bearer <jwt_access_token>
```

### Standard Response Envelope Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Standard Error Response Format

```json
{
  "success": false,
  "status": 401,
  "code": "UNAUTHORIZED",
  "message": "Invalid credentials or token expired",
  "errors": []
}
```

---

## 3. Endpoints Specification

### 3.1. Authentication (`/auth`)

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/auth/login` | No | Authenticate user with email and password |
| `POST` | `/auth/signup` | No | Register a new customer or admin account |
| `POST` | `/auth/logout` | Yes | Invalidate active session/token |
| `GET` | `/auth/me` | Yes | Retrieve current user profile and roles |
| `PUT` | `/auth/profile` | Yes | Update profile name, phone, preferences |
| `POST` | `/auth/forgot-password` | No | Dispatch password reset email |
| `POST` | `/auth/reset-password` | No | Reset password using one-time token |

#### Payload: `POST /auth/login`
```json
{
  "email": "patron@arabiansheikh.com",
  "password": "RoyalPassword123!"
}
```

#### Response: `POST /auth/login`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "refreshToken": "dGhpcy1pcy1hLXJlZnJlc2g...",
  "user": {
    "id": "user-101",
    "name": "Tariq Al-Hashemi",
    "email": "patron@arabiansheikh.com",
    "role": "USER",
    "status": "ACTIVE",
    "memberSince": "2026-01-15",
    "ordersCount": 4,
    "totalSpent": 320,
    "addresses": [],
    "paymentMethods": []
  }
}
```

---

### 3.2. Products & Fragrance Catalog (`/products`)

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/products` | No | List products with filtering, search, pagination, and sorting |
| `GET` | `/products/:idOrSlug` | No | Retrieve product detail by slug or ID |
| `GET` | `/products/featured` | No | Get featured and curated home products |
| `GET` | `/products/best-sellers` | No | Get best-selling creations |
| `GET` | `/products/:id/related` | No | Get related fragrance creations |
| `POST` | `/products/:id/reviews` | Yes | Submit a customer review with star rating |
| `POST` | `/products` | Yes (Admin) | Create a new product |
| `PUT` | `/products/:id` | Yes (Admin) | Update product details |
| `DELETE` | `/products/:id` | Yes (Admin) | Delete a product |
| `PATCH` | `/products/:id/stock` | Yes (Admin) | Update product inventory level |

#### Query Parameters for `GET /products`:
- `search` (string): Search query for name, notes, family.
- `category` (string): `perfumes`, `oils`, `bakhoor`, `cosmetics`, `bundles`.
- `tier` (string): `Luxury`, `Royal`, `Classic`.
- `gender` (string): `Masculine`, `Feminine`, `Unisex`.
- `family` (string): `Woody`, `Oriental`, `Floral`, `Fresh`.
- `minPrice` & `maxPrice` (number): Price range filter.
- `sortBy` (string): `price-low`, `price-high`, `rating`, `newest`, `featured`.

#### Product Object Schema:
```json
{
  "id": "as-luxury-black-diamond",
  "slug": "black-diamond-luxury",
  "name": "Black Diamond",
  "arabicName": "الماس الأسود",
  "spanishName": "Black Diamond",
  "bulgarianName": "Черен Диамант",
  "tier": "Luxury",
  "category": "perfumes",
  "gender": "Unisex",
  "price": 50,
  "originalPrice": null,
  "stock": 42,
  "size": "60 ml / 2.0 fl oz",
  "status": "ACTIVE",
  "featured": true,
  "isBestSeller": true,
  "rating": 5.0,
  "reviewsCount": 24,
  "description": "The ultimate golden crown of Arabian perfumery.",
  "fragranceFamily": "Oriental / Amber",
  "topNotes": ["Ambergris", "Bergamot", "Saffron"],
  "heartNotes": ["Cambodian Oud", "Taif Rose"],
  "baseNotes": ["Fossilized Amber", "Cedarwood"],
  "season": ["All Seasons", "Winter"],
  "occasion": ["Evening", "Royal"],
  "longevity": "14+ Hours",
  "sillage": "Regal & Intimate",
  "concentration": "35% Pure Extrait Oil",
  "images": ["/products/black_diamond_gold.png?v=5"],
  "cutoutImage": "/products/black_diamond_gold.png?v=5"
}
```

---

### 3.3. Orders & Commerce (`/orders`)

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/orders` | Yes | Place and initialize a new royal order |
| `GET` | `/orders` | Yes (Admin) | List all orders with filters and pagination |
| `GET` | `/orders/:id` | Yes | Get order details by ID |
| `GET` | `/orders/user/:userId` | Yes | Get customer order history |
| `GET` | `/orders/track/:trackingCode`| No | Public shipment tracking status |
| `PATCH`| `/orders/:id/status` | Yes (Admin) | Update status (`CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`) |

#### Order Creation Payload: `POST /orders`
```json
{
  "userId": "user-101",
  "customerName": "Tariq Al-Hashemi",
  "customerEmail": "patron@arabiansheikh.com",
  "customerPhone": "+971 50 123 4567",
  "items": [
    {
      "productId": "as-luxury-black-diamond",
      "name": "Black Diamond",
      "size": "60 ml",
      "price": 50,
      "quantity": 2
    }
  ],
  "subtotal": 100,
  "tax": 0,
  "shipping": 0,
  "discount": 10,
  "discountCode": "ROYAL10",
  "total": 90,
  "giftWrap": true,
  "shippingAddress": {
    "recipientName": "Tariq Al-Hashemi",
    "streetAddress": "Al Wasl Road, Villa 42",
    "city": "Dubai",
    "country": "United Arab Emirates",
    "postalCode": "00000"
  },
  "paymentMethod": "stripe",
  "paymentStatus": "PAID"
}
```

---

### 3.4. Discounts & Privilege Codes (`/discounts`)

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/discounts/validate` | No / Yes | Validate a coupon code against basket total |
| `GET` | `/discounts` | Yes (Admin) | List all active promo codes |
| `POST` | `/discounts` | Yes (Admin) | Create a promo discount code |
| `DELETE`| `/discounts/:id` | Yes (Admin) | Delete/deactivate a discount code |

#### Validation Request: `POST /discounts/validate`
```json
{
  "code": "ROYAL10",
  "subtotal": 120
}
```

#### Response:
```json
{
  "code": "ROYAL10",
  "type": "percentage",
  "value": 10,
  "minSpend": 50,
  "description": "10% Royal Privilege Discount",
  "validUntil": "2027-12-31"
}
```

---

### 3.5. Admin Analytics (`/analytics`)

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/analytics/overview` | Yes (Admin) | Total revenue, orders, inventory, top regions, weekly trends |
| `GET` | `/analytics/sales-trends` | Yes (Admin) | Revenue by timeframe (7d, 30d, 90d, 1y) |
| `GET` | `/analytics/inventory-status` | Yes (Admin) | Stock alerts and reorder thresholds |

---

## 4. Frontend Architecture Details

The frontend client is organized as follows:
- **`src/api/client.js`**: Universal HTTP engine handling base URL, authorization headers, timeouts, and error interception.
- **`src/api/endpoints.js`**: Route path registry.
- **`src/api/normalizers.js`**: Schema translation bridging snake_case backend keys with frontend camelCase properties.
- **`src/api/*.api.js`**: Dedicated modular domain clients (`auth`, `product`, `order`, `cart`, `wishlist`, `discount`, `user`, `analytics`).
- **`src/services/*.js`**: Service layer with hybrid fallback logic for maximum reliability during local development and production.
