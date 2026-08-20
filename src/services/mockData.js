// Official Arabian Sheikh Catalog & Store Data
// Authentic Flacons: Black Diamond (Luxury - €50), Millionaire (Royal - €40), Ana Sukkar (Classic - €30)

export const INITIAL_PRODUCTS = [
  {
    id: 'as-luxury-black-diamond',
    slug: 'black-diamond-luxury',
    name: 'Black Diamond',
    arabicName: 'بلاك دايموند',
    bulgarianName: 'Черен Диамант',
    tier: 'Luxury',
    price: 50,
    originalPrice: null,
    size: '60 ml / 2.0 fl oz',
    category: 'perfumes',
    gender: 'Unisex',
    season: ['Autumn', 'Winter', 'Evening / Gala'],
    occasion: ['Evening / Gala', 'Royal Celebrations'],
    longevity: '14+ Hours (Ultra Long Lasting)',
    sillage: 'Heavy & Regal',
    stock: 25,
    tagline: 'An opulent golden sovereign crowned with radiant majesty.',
    description: 'The pinnacle of the Arabian Sheikh collection. Black Diamond is encased in a striking mirror-gold flacon crowned with the royal Andalusian finial. Crafted for evenings of unmatched splendor and unforgettable distinction.',
    notes: {
      top: ['Precious Ambergris', 'Smoked Saffron', 'Bergamot Zest'],
      heart: ['Royal Cambodian Agarwood', 'Midnight Rose', 'Cistus Labdanum'],
      base: ['Dark Fossilized Amber', 'Smoky Cedar', 'Imperial White Musk']
    },
    topNotes: ['Precious Ambergris', 'Smoked Saffron', 'Bergamot Zest'],
    heartNotes: ['Royal Cambodian Agarwood', 'Midnight Rose', 'Cistus Labdanum'],
    baseNotes: ['Dark Fossilized Amber', 'Smoky Cedar', 'Imperial White Musk'],
    scentFamily: 'Oriental / Amber',
    fragranceFamily: 'Oriental / Amber',
    familyArabic: 'الشرقية',
    featured: true,
    isBestSeller: true,
    isHeroDefault: true,
    rating: 5.0,
    reviewsCount: 38,
    concentration: '35% Extrait de Parfum',
    images: [
      '/products/black_diamond_gold.png?v=5',
      '/products/black_diamond_gold.jpg?v=5'
    ],
    cutoutImage: '/products/black_diamond_gold.png?v=5',
    originalImage: '/products/black_diamond_gold.jpg?v=5',
    status: 'ACTIVE',
    reviews: [
      {
        id: 'rev-bd-1',
        author: 'Tariq Al-Hashemi',
        rating: 5,
        date: '2026-07-15',
        title: 'Pure Royalty in a Bottle',
        comment: 'The projection and longevity are remarkable. The gold flacon is a true centerpiece in my collection.',
        verifiedPurchase: true,
        status: 'approved'
      }
    ]
  },
  {
    id: 'as-royal-millionaire',
    slug: 'millionaire-royal',
    name: 'Millionaire',
    arabicName: 'مليونير',
    bulgarianName: 'Милионер',
    tier: 'Royal',
    price: 40,
    originalPrice: null,
    size: '60 ml / 2.0 fl oz',
    category: 'perfumes',
    gender: 'Masculine',
    season: ['All Seasons', 'Autumn', 'Spring'],
    occasion: ['Daily Luxury', 'Signature', 'Evening / Gala'],
    longevity: '10-12 Hours',
    sillage: 'Strong & Sophisticated',
    stock: 30,
    tagline: 'Dark charisma, power, and magnetic sophistication.',
    description: 'Millionaire commands the room with an assertive obsidian silhouette and gold crown ornament. A refined composition blending noble woods, spiced warmth, and a clean aristocratic drydown.',
    notes: {
      top: ['Cardamom Infusion', 'Crushed Black Pepper', 'Sparkling Grapefruit'],
      heart: ['Smoky Leather Accord', 'Aged Sandalwood', 'Clary Sage'],
      base: ['Smoked Vetiver', 'Warm Amber', 'Cashmeran Wood']
    },
    topNotes: ['Cardamom Infusion', 'Crushed Black Pepper', 'Sparkling Grapefruit'],
    heartNotes: ['Smoky Leather Accord', 'Aged Sandalwood', 'Clary Sage'],
    baseNotes: ['Smoked Vetiver', 'Warm Amber', 'Cashmeran Wood'],
    scentFamily: 'Woody / Spicy',
    fragranceFamily: 'Woody',
    familyArabic: 'الخشبية',
    featured: true,
    isBestSeller: true,
    isHeroDefault: false,
    rating: 4.9,
    reviewsCount: 42,
    concentration: '30% Extrait de Parfum',
    images: [
      '/products/millionaire_black.png?v=5',
      '/products/millionaire_black.jpg?v=5'
    ],
    cutoutImage: '/products/millionaire_black.png?v=5',
    originalImage: '/products/millionaire_black.jpg?v=5',
    status: 'ACTIVE',
    reviews: [
      {
        id: 'rev-mil-1',
        author: 'Alexander D.',
        rating: 5,
        date: '2026-06-28',
        title: 'Masterpiece of Modern Luxury',
        comment: 'Sophisticated, masculine, and long-lasting. Gets compliments everywhere I go.',
        verifiedPurchase: true,
        status: 'approved'
      }
    ]
  },
  {
    id: 'as-classic-ana-sukkar',
    slug: 'ana-sukkar-classic',
    name: 'Ana Sukkar',
    arabicName: 'أنا سكر',
    bulgarianName: 'Ана Сукар',
    tier: 'Classic',
    price: 30,
    originalPrice: null,
    size: '60 ml / 2.0 fl oz',
    category: 'perfumes',
    gender: 'Feminine',
    season: ['Spring', 'Summer', 'Daily Luxury'],
    occasion: ['Daily Luxury', 'Signature'],
    longevity: '8-10 Hours',
    sillage: 'Moderate & Alluring',
    stock: 45,
    tagline: 'Velvety sweetness, delicate petals, and sweet confection.',
    description: 'Ana Sukkar presents an angelic white flacon accented in radiant gold. A gourmand and floral melody capturing spun sugar, blooming blossoms, and creamy vanilla comfort.',
    notes: {
      top: ['Spun Sugar Nectar', 'Sweet Mandarin', 'White Peach'],
      heart: ['Orange Blossom Petals', 'Gourmand Vanilla Cream', 'Jasmine Sambac'],
      base: ['Fluffy White Musk', 'Tonka Bean', 'Soft Amber']
    },
    topNotes: ['Spun Sugar Nectar', 'Sweet Mandarin', 'White Peach'],
    heartNotes: ['Orange Blossom Petals', 'Gourmand Vanilla Cream', 'Jasmine Sambac'],
    baseNotes: ['Fluffy White Musk', 'Tonka Bean', 'Soft Amber'],
    scentFamily: 'Gourmand / Floral',
    fragranceFamily: 'Floral',
    familyArabic: 'الزهرية',
    featured: true,
    isBestSeller: true,
    isHeroDefault: false,
    rating: 4.85,
    reviewsCount: 29,
    concentration: '25% Eau de Parfum Intense',
    images: [
      '/products/ana_sukkar_white.png?v=5',
      '/products/ana_sukkar_white.jpg?v=5'
    ],
    cutoutImage: '/products/ana_sukkar_white.png?v=5',
    originalImage: '/products/ana_sukkar_white.jpg?v=5',
    status: 'ACTIVE',
    reviews: [
      {
        id: 'rev-as-1',
        author: 'Layla K.',
        rating: 5,
        date: '2026-07-02',
        title: 'Irresistibly Delicious & Elegant',
        comment: 'The sweet cream and floral balance is perfection. The white bottle looks stunning on my vanity.',
        verifiedPurchase: true,
        status: 'approved'
      }
    ]
  },
  // Oils Category Product (Placeholder for admin photo upload)
  {
    id: 'as-oil-attar-malaki',
    slug: 'attar-al-malaki-oil',
    name: 'Attar Al Malaki (Pure Oil)',
    arabicName: 'عطر الملكي زيتي',
    bulgarianName: 'Атар Ал Малаки (Масло)',
    category: 'oils',
    price: 35,
    originalPrice: null,
    size: '12 ml / 1 Tola',
    gender: 'Unisex',
    season: ['All Seasons'],
    occasion: ['Daily Luxury', 'Royal Celebrations'],
    longevity: '24+ Hours (Pure Concentrated Oil)',
    sillage: 'Intimate & Profound',
    stock: 20,
    tagline: '100% pure alcohol-free concentrated royal perfume oil.',
    description: 'Distilled using ancient artisanal techniques. A single drop offers an enduring aura of rare woods, warm amber, and golden musk. Admin can upload custom flacon photo.',
    notes: {
      top: ['Pure Cambodian Oud', 'Saffron Oil'],
      heart: ['Taif Rose Concentrate', 'Frankincense Resin'],
      base: ['Aged Sandalwood', 'Ambergris Nectar']
    },
    topNotes: ['Pure Cambodian Oud', 'Saffron Oil'],
    heartNotes: ['Taif Rose Concentrate', 'Frankincense Resin'],
    baseNotes: ['Aged Sandalwood', 'Ambergris Nectar'],
    scentFamily: 'Oriental Oil',
    fragranceFamily: 'Woody',
    familyArabic: 'الخشبية',
    featured: false,
    isBestSeller: false,
    rating: 4.9,
    reviewsCount: 15,
    images: ['/products/black_diamond_gold.png'],
    cutoutImage: '/products/black_diamond_gold.png',
    status: 'ACTIVE',
    reviews: []
  },
  // Bakhoor Category Product
  {
    id: 'as-bakhoor-andalusia',
    slug: 'bakhoor-andalusia-incense',
    name: 'Bakhoor Andalusia Luxury Chips',
    arabicName: 'بخور أندلوسيا فاخر',
    bulgarianName: 'Бахур Андалусия',
    category: 'bakhoor',
    price: 45,
    originalPrice: null,
    size: '75g Premium Jar',
    gender: 'Unisex',
    season: ['All Seasons'],
    occasion: ['Daily Luxury', 'Royal Celebrations'],
    longevity: 'Enduring Home Fragrance',
    sillage: 'Voluminous & Atmospheric',
    stock: 35,
    tagline: 'Hand-infused Agarwood chips scented with musk, rose, and amber.',
    description: 'Slow-burning natural agarwood steeped in essential fragrance oils for home sanctification and welcoming guests with royal hospitality.',
    notes: {
      top: ['Oud Wood Chips', 'Cardamom Dust'],
      heart: ['Balsam Resin', 'Damask Rose Petals'],
      base: ['White Amber Crystals', 'Smoky Cedar']
    },
    topNotes: ['Oud Wood Chips', 'Cardamom Dust'],
    heartNotes: ['Balsam Resin', 'Damask Rose Petals'],
    baseNotes: ['White Amber Crystals', 'Smoky Cedar'],
    scentFamily: 'Incense / Smoky',
    fragranceFamily: 'Oriental / Amber',
    familyArabic: 'الشرقية',
    featured: false,
    isBestSeller: false,
    rating: 4.8,
    reviewsCount: 19,
    images: ['/products/millionaire_black.png'],
    cutoutImage: '/products/millionaire_black.png',
    status: 'ACTIVE',
    reviews: []
  },
  // Cosmetics Category Product
  {
    id: 'as-cosmetics-royal-body-cream',
    slug: 'royal-scented-body-butter',
    name: 'Royal Perfumed Body Silk',
    arabicName: 'حرير الجسم الملكي المعطر',
    bulgarianName: 'Кралска коприна за тяло',
    category: 'cosmetics',
    price: 28,
    originalPrice: null,
    size: '200 ml / 6.7 fl oz',
    gender: 'Unisex',
    season: ['All Seasons'],
    occasion: ['Daily Luxury'],
    longevity: '12 Hours Hydration & Scent',
    sillage: 'Delicate Skin Veil',
    stock: 40,
    tagline: 'Nourishing shea and argan butter scented with Arabian Sheikh signature notes.',
    description: 'A silky, fast-absorbing luxury body cream enriched with organic Moroccan argan oil, golden shimmer, and enduring fragrance.',
    notes: {
      top: ['Citrus Blossom', 'Sweet Almond'],
      heart: ['Jasmine Milk', 'Shea Nectar'],
      base: ['Vanilla Butter', 'Soft Sandalwood']
    },
    topNotes: ['Citrus Blossom', 'Sweet Almond'],
    heartNotes: ['Jasmine Milk', 'Shea Nectar'],
    baseNotes: ['Vanilla Butter', 'Soft Sandalwood'],
    scentFamily: 'Cosmetic Luxury',
    fragranceFamily: 'Floral',
    familyArabic: 'الزهرية',
    featured: false,
    isBestSeller: false,
    rating: 4.75,
    reviewsCount: 11,
    images: ['/products/ana_sukkar_white.png'],
    cutoutImage: '/products/ana_sukkar_white.png',
    status: 'ACTIVE',
    reviews: []
  },
  // Bundles Category Product
  {
    id: 'as-bundle-imperial-trio',
    slug: 'imperial-trilogy-bundle',
    name: 'The Imperial Flacon Trilogy (3 x 60ml)',
    arabicName: 'ثلاثية الفخامة الإمبراطورية (٣ عطور)',
    bulgarianName: 'Имперска трилогия (3 x 60мл)',
    category: 'bundles',
    price: 105,
    originalPrice: 120,
    size: '3 x 60 ml Full Set',
    gender: 'Unisex',
    season: ['All Seasons'],
    occasion: ['Royal Celebrations', 'Signature'],
    longevity: 'Complete Fragrance Wardrobe',
    sillage: 'Variable by Flacon',
    stock: 15,
    tagline: 'All three signature flacons: Black Diamond, Millionaire & Ana Sukkar in a bespoke presentation box.',
    description: 'Experience the entire prestige collection. Contains 1x Luxury Black Diamond (60ml), 1x Royal Millionaire (60ml), and 1x Classic Ana Sukkar (60ml) packaged in a velvet-lined gold-crested keepsake coffret.',
    notes: {
      top: ['Ambergris', 'Cardamom', 'Spun Sugar'],
      heart: ['Cambodian Oud', 'Smoky Leather', 'Vanilla Blossom'],
      base: ['Fossilized Amber', 'Cashmeran', 'White Musk']
    },
    topNotes: ['Ambergris', 'Cardamom', 'Spun Sugar'],
    heartNotes: ['Cambodian Oud', 'Smoky Leather', 'Vanilla Blossom'],
    baseNotes: ['Fossilized Amber', 'Cashmeran', 'White Musk'],
    scentFamily: 'Collector Trilogy',
    fragranceFamily: 'Oriental / Amber',
    familyArabic: 'الشرقية',
    featured: true,
    isBestSeller: true,
    rating: 5.0,
    reviewsCount: 22,
    images: ['/products/black_diamond_gold.png?v=5'],
    cutoutImage: '/products/black_diamond_gold.png?v=5',
    status: 'ACTIVE',
    reviews: []
  }
];

export const PERFUME_TIERS = [
  {
    id: 'Luxury',
    name: 'Luxury Tier',
    arabicName: 'الفئة الفاخرة (لاكجري)',
    bulgarianName: 'Луксозен клас',
    price: 50,
    size: '60 ml / 2.0 fl oz',
    bottle: 'Black Diamond',
    color: '#D4AF37',
    image: '/products/black_diamond_gold.png?v=5',
    description: 'The highest expression of Andalusian perfumery. Encased in brilliant gold with concentrated precious oud, ambergris, and rare resins.',
    filterParam: 'Luxury'
  },
  {
    id: 'Royal',
    name: 'Royal Tier',
    arabicName: 'الفئة الملكية (رويال)',
    bulgarianName: 'Кралски клас',
    price: 40,
    size: '60 ml / 2.0 fl oz',
    bottle: 'Millionaire',
    color: '#2A2A2A',
    image: '/products/millionaire_black.png?v=5',
    description: 'Commanding obsidian elegance with intense woods, spice, and magnetic masculine charisma.',
    filterParam: 'Royal'
  },
  {
    id: 'Classic',
    name: 'Classic Tier',
    arabicName: 'الفئة الكلاسيكية (كلاسيك)',
    bulgarianName: 'Класически клас',
    price: 30,
    size: '60 ml / 2.0 fl oz',
    bottle: 'Ana Sukkar',
    color: '#E8D29F',
    image: '/products/ana_sukkar_white.png?v=5',
    description: 'Pristine porcelain-white flacon offering gourmand sweetness, delicate floral petals, and comforting creamy vanilla.',
    filterParam: 'Classic'
  }
];

export const CATEGORIES = [
  {
    id: 'perfumes',
    slug: 'perfumes',
    name: 'Perfumes',
    arabicName: 'العطور',
    bulgarianName: 'Парфюми',
    description: 'Signature 60ml flacons in Classic, Royal, and Luxury tiers.',
    image: '/products/black_diamond_gold.png'
  },
  {
    id: 'oils',
    slug: 'oils',
    name: 'Oils (Attar)',
    arabicName: 'الزيوت العطرية',
    bulgarianName: 'Парфюмни масла',
    description: 'Alcohol-free pure concentrated perfume attars.',
    image: '/products/black_diamond_gold.png'
  },
  {
    id: 'bakhoor',
    slug: 'bakhoor',
    name: 'Bakhoor & Incense',
    arabicName: 'البخور والعود',
    bulgarianName: 'Бахур и благовония',
    description: 'Artisanal agarwood chips and fragrant incense blends.',
    image: '/products/millionaire_black.png'
  },
  {
    id: 'cosmetics',
    slug: 'cosmetics',
    name: 'Cosmetics',
    arabicName: 'مستحضرات التجميل',
    bulgarianName: 'Козметика',
    description: 'Perfumed body silk, lotions, and royal self-care.',
    image: '/products/ana_sukkar_white.png'
  },
  {
    id: 'bundles',
    slug: 'bundles',
    name: 'Exclusive Bundles',
    arabicName: 'الباقات والعروض',
    bulgarianName: 'Комплекти',
    description: 'Curated gift coffrets and fragrance trilogy collections.',
    image: '/products/black_diamond_gold.png'
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'ORD-9842',
    customer: {
      name: 'Sheikh Hamdan Al-Maktoum',
      email: 'h.maktoum@royal.ae',
      phone: '+971 50 123 4567',
      address: 'Al-Zabeel Palace, Dubai, UAE'
    },
    items: [
      {
        productId: 'as-luxury-black-diamond',
        productName: 'Black Diamond',
        productImage: '/products/black_diamond_gold.png',
        price: 50,
        quantity: 2,
        size: '60 ml'
      },
      {
        productId: 'as-royal-millionaire',
        productName: 'Millionaire',
        productImage: '/products/millionaire_black.png',
        price: 40,
        quantity: 1,
        size: '60 ml'
      }
    ],
    total: 140,
    shippingFee: 0,
    status: 'SHIPPED',
    paymentStatus: 'PAID',
    paymentMethod: 'Stripe Credit Card',
    dhlTrackingNumber: 'DHL-EXP-9823471029',
    createdAt: '2026-08-18T10:30:00Z'
  }
];

export const INITIAL_ADMIN_SETTINGS = {
  stripe: {
    testMode: true,
    publishableKey: 'pk_test_sample_arabiansheikh_key',
    secretKey: 'sk_test_sample_arabiansheikh_secret',
    currency: 'EUR'
  },
  dhl: {
    testMode: true,
    accountNumber: 'DHL-EXP-889021',
    apiKey: 'dhl_test_api_key_andalusia',
    defaultShippingFee: 15,
    freeShippingThreshold: 100,
    originCountry: 'Spain / UAE'
  }
};

export const INITIAL_USERS = [
  {
    id: 'usr-admin-01',
    name: 'Sheikh Tariq Al-Fassi',
    email: 'admin@arabiansheikh.com',
    phone: '+971 50 123 4567',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    createdAt: '2026-01-01',
    addresses: [
      {
        id: 'addr-1',
        title: 'Primary Residence',
        street: 'Royal Mirage Boulevard, Villa 42',
        city: 'Dubai',
        country: 'United Arab Emirates',
        postalCode: '00000',
        isDefault: true
      }
    ],
    wishlist: ['as-luxury-black-diamond', 'as-royal-millionaire']
  },
  {
    id: 'usr-customer-02',
    name: 'Princess Noura Al-Saud',
    email: 'noura@royal.sa',
    phone: '+966 50 987 6543',
    role: 'CUSTOMER',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    createdAt: '2026-03-15',
    addresses: [
      {
        id: 'addr-2',
        title: 'Riyadh Residence',
        street: 'Diplomatic Quarter, Palace 18',
        city: 'Riyadh',
        country: 'Saudi Arabia',
        postalCode: '11564',
        isDefault: true
      }
    ],
    wishlist: ['as-classic-ana-sukkar']
  }
];

export const INITIAL_DISCOUNTS = [
  {
    id: 'disc-sheikh10',
    code: 'SHEIKH10',
    percentage: 10,
    minSpend: 50,
    validUntil: '2027-12-31',
    isActive: true
  },
  {
    id: 'disc-royal20',
    code: 'ROYAL20',
    percentage: 20,
    minSpend: 100,
    validUntil: '2027-12-31',
    isActive: true
  }
];
