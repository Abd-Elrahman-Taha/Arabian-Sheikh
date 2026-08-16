// Comprehensive Seed Data for Arabian Sheikh Haute Parfumerie

export const INITIAL_PRODUCTS = [
  {
    id: 'as-oud-royal-01',
    name: 'Dehn Al Oud Royal',
    arabicName: 'دهن العود الملكي',
    tagline: 'The Pinnacle of Wild Aged Assamese Agarwood & Royal Resins',
    description: 'An exalted vintage creation distilled from 60-year-old wild Assamese agarwood trees. Matured in obsidian jars within dark stone palace vaults, Dehn Al Oud Royal unfolds with smoky leathery richness, sacred incense smoke, and a deep golden balsamic resonance that commands reverent silence.',
    price: 420,
    originalPrice: 490,
    gender: 'unisex',
    category: 'Extrait de Parfum',
    fragranceFamily: 'Woody',
    familyArabic: 'الخشبية',
    topNotes: ['Aged Wild Oud', 'Rare Saffron Threads', 'Cardamom Smoke'],
    heartNotes: ['Smoky Birch Wood', 'Royal Cambodian Resin', 'Balsam Fir'],
    baseNotes: ['Assamese Dehn Al Oud', 'Dark Ambergris', 'Earthy Patchouli'],
    sizes: ['50ml', '100ml', '200ml Flacon'],
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1000&q=85'
    ],
    featured: true,
    isBestSeller: true,
    collection: 'Royal Oud Reserve',
    discount: 15,
    status: 'ACTIVE',
    rating: 4.95,
    reviewsCount: 84,
    concentration: '38% Extrait de Parfum',
    reviews: [
      { id: 'r1', author: 'Sultan Al-Mansoor', rating: 5, date: '2026-06-12', comment: 'The most authentic, deep, non-synthetic wild Oud I have experienced outside private Gulf royal reserves.' },
      { id: 'r2', author: 'Lord Montgomery', rating: 5, date: '2026-05-20', comment: 'A fragrance of pure majesty. Lasts easily over 24 hours on cashmere and linen with an aristocratic trail.' }
    ]
  },
  {
    id: 'as-amber-malaki-02',
    name: 'Amber Al Malaki',
    arabicName: 'عنبر الملكي',
    tagline: 'Warm Fossilized Amber, Madagascar Vanilla & Sacred Bakhoor',
    description: 'A monument to Arabian hospitality and regal warmth. Amber Al Malaki fuses dark balsamic labdanum with golden fossilized amber nectar, velvety Bourbon vanilla, and the smoldering embers of sacred frankincense.',
    price: 360,
    originalPrice: null,
    gender: 'unisex',
    category: 'Extrait de Parfum',
    fragranceFamily: 'Oriental / Amber',
    familyArabic: 'الشرقية',
    topNotes: ['Golden Ambergris', 'Nutmeg from Malabar', 'Cinnamon Bark'],
    heartNotes: ['Sacred Bakhoor Smoke', 'Benzoin Tears', 'Myrrh Resin'],
    baseNotes: ['Bourbon Vanilla Pods', 'Dark Labdanum', 'White Musk'],
    sizes: ['50ml', '100ml', '200ml Flacon'],
    stock: 24,
    images: [
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85'
    ],
    featured: true,
    isBestSeller: true,
    collection: 'Desert Gold',
    discount: 0,
    status: 'ACTIVE',
    rating: 4.9,
    reviewsCount: 62,
    concentration: '35% Extrait de Parfum',
    reviews: [
      { id: 'r3', author: 'Elena Rostova', rating: 5, date: '2026-07-01', comment: 'Hypnotic and comforting yet profoundly luxurious. The vanilla and bakhoor interplay is heavenly.' }
    ]
  },
  {
    id: 'as-rose-taif-03',
    name: 'Rose de Taif Imperial',
    arabicName: 'ورد الطائف الإمبراطوري',
    tagline: 'Highland Taif Rose Nectar & White Amber Velvet',
    description: 'Gathered by hand in the misty mountain peaks of Taif before sunrise, thirty pristine petals distill into every single crystal flacon drop. Enhanced by delicate Damascene Rose, French Centifolia, and an ethereal whisper of royal white musk.',
    price: 340,
    originalPrice: 390,
    gender: 'women',
    category: 'Extrait de Parfum',
    fragranceFamily: 'Floral',
    familyArabic: 'الزهرية',
    topNotes: ['Taif Mountain Rose', 'Pink Peppercorn', 'Dewy Green Petals'],
    heartNotes: ['Damascene Rose Absolute', 'Moroccan Orange Blossom', 'Night Jasmine'],
    baseNotes: ['White Sandalwood', 'Ethereal Musk', 'Golden Honeycomb'],
    sizes: ['50ml', '100ml', '200ml Flacon'],
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=85'
    ],
    featured: true,
    isBestSeller: false,
    collection: 'Imperial Silk',
    discount: 12,
    status: 'ACTIVE',
    rating: 4.88,
    reviewsCount: 47,
    concentration: '32% Extrait de Parfum',
    reviews: [
      { id: 'r4', author: 'Princess Noura', rating: 5, date: '2026-04-18', comment: 'The true queen of roses. Fresh, noble, never cloying, and exquisitely refined.' }
    ]
  },
  {
    id: 'as-black-monarch-04',
    name: 'Black Monarch Oud',
    arabicName: 'العود الأسود للملوك',
    tagline: 'Dark Italian Leather, Smoky Oud & Royal Castoreum',
    description: 'Created for the modern Sheikh. An uncompromising declaration of strength and distinction featuring dark hand-tanned Florentine leather, intense Cambodian Oud, black pepper, and sacred incense braziers.',
    price: 450,
    originalPrice: null,
    gender: 'men',
    category: 'Extrait de Parfum',
    fragranceFamily: 'Woody',
    familyArabic: 'الخشبية',
    topNotes: ['Black Leather', 'Smoked Bergamot', 'Crushed Black Pepper'],
    heartNotes: ['Cambodian Dark Oud', 'Cistus Labdanum', 'Tobacco Leaf'],
    baseNotes: ['Smoky Vetiver', 'Dark Cedarwood', 'Castoreum Musk'],
    sizes: ['50ml', '100ml', '200ml Flacon'],
    stock: 9,
    images: [
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85'
    ],
    featured: false,
    isBestSeller: true,
    collection: 'Royal Oud Reserve',
    discount: 0,
    status: 'ACTIVE',
    rating: 4.98,
    reviewsCount: 92,
    concentration: '40% Extrait de Parfum',
    reviews: []
  },
  {
    id: 'as-oasis-breeze-05',
    name: 'Oasis Breeze Al-Fajr',
    arabicName: 'نسيم الواحة الفجر',
    tagline: 'Zesty Calabrian Bergamot, Morning Palm Dew & Clean Airy Musk',
    description: 'Inspired by dawn breaking over an ancient oasis. Crisp Italian citrus zests mingle with crisp crushed mint leaves, neroli blossom, and a cooling base of clean cedarwood and white amber.',
    price: 290,
    originalPrice: null,
    gender: 'unisex',
    category: 'Extrait de Parfum',
    fragranceFamily: 'Fresh',
    familyArabic: 'المنعشة',
    topNotes: ['Calabrian Bergamot', 'Menthol Mint Leaves', 'Sicilian Lemon'],
    heartNotes: ['Neroli Sunflowers', 'Oasis Palm Dew', 'Cardamom Pod'],
    baseNotes: ['White Cedarwood', 'Clean Airy Musks', 'Crisp Amber'],
    sizes: ['50ml', '100ml', '200ml Flacon'],
    stock: 31,
    images: [
      'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85'
    ],
    featured: false,
    isBestSeller: false,
    collection: 'Desert Gold',
    discount: 0,
    status: 'ACTIVE',
    rating: 4.79,
    reviewsCount: 35,
    concentration: '30% Extrait de Parfum',
    reviews: []
  },
  {
    id: 'as-pomegranate-babylon-06',
    name: 'Imperial Pomegranate of Babylon',
    arabicName: 'رمان بابل الإمبراطوري',
    tagline: 'Ripe Arabian Pomegranate Nectar, Fig & Spiced Plum',
    description: 'A sumptuous, regal fruity elixir. Deep crimson pomegranate gems crushed with sweet ripe desert figs, purple plum syrup, pink peppercorns, and an opulent foundation of smooth patchouli and creamy sandalwood.',
    price: 320,
    originalPrice: 370,
    gender: 'women',
    category: 'Extrait de Parfum',
    fragranceFamily: 'Fruity',
    familyArabic: 'الفاكهية',
    topNotes: ['Ripe Crimson Pomegranate', 'Black Currant', 'Pink Peppercorn'],
    heartNotes: ['Sweet Desert Fig', 'Juicy Plum Syrup', 'Night Lily'],
    baseNotes: ['Creamy Mysore Sandalwood', 'Soft Patchouli', 'Vanilla Caviar'],
    sizes: ['50ml', '100ml', '200ml Flacon'],
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85'
    ],
    featured: true,
    isBestSeller: true,
    collection: 'Imperial Silk',
    discount: 13,
    status: 'ACTIVE',
    rating: 4.86,
    reviewsCount: 51,
    concentration: '34% Extrait de Parfum',
    reviews: []
  },
  {
    id: 'as-bakhoor-royale-07',
    name: 'Bakhoor Royale Supreme',
    arabicName: 'بخور ملكي سوبريم',
    tagline: 'Smoldering Agarwood Chips, Frankincense Tears & Honeyed Amber',
    description: 'The definitive scent of an Arabian royal reception. Captures the intoxicating atmosphere of burning precious bakhoor over golden braziers, sweetened with rich mountain honey and framed by dark resinous woods.',
    price: 390,
    originalPrice: null,
    gender: 'unisex',
    category: 'Extrait de Parfum',
    fragranceFamily: 'Oriental / Amber',
    familyArabic: 'الشرقية',
    topNotes: ['Omani Frankincense Tears', 'Wild Honey', 'Clove Bud'],
    heartNotes: ['Charred Agarwood Chips', 'Royal Ambergris', 'Labdanum Gum'],
    baseNotes: ['Dark Tonka Bean', 'Leather Accord', 'Smoky Vanilla'],
    sizes: ['50ml', '100ml', '200ml Flacon'],
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85'
    ],
    featured: false,
    isBestSeller: true,
    collection: 'Royal Oud Reserve',
    discount: 0,
    status: 'ACTIVE',
    rating: 4.93,
    reviewsCount: 78,
    concentration: '36% Extrait de Parfum',
    reviews: []
  },
  {
    id: 'as-jasmine-sultana-08',
    name: 'Jasmine Al Sultana',
    arabicName: 'ياسمين السلطانة',
    tagline: 'Night-Blooming Sambac Jasmine, Lily & Orange Blossom Dew',
    description: 'An intoxicating tribute to Arabian palace gardens at midnight. Pure night-blooming Sambac Jasmine absolute enriched with royal white lilies, delicate violet petals, and warm shimmering amber.',
    price: 310,
    originalPrice: null,
    gender: 'women',
    category: 'Extrait de Parfum',
    fragranceFamily: 'Floral',
    familyArabic: 'الزهرية',
    topNotes: ['Orange Blossom Dew', 'Bergamot Zest', 'Green Violet Leaves'],
    heartNotes: ['Night-Blooming Sambac Jasmine', 'Royal White Lily', 'Damask Rose'],
    baseNotes: ['White Amber', 'Cashmere Woods', 'Solar Musk'],
    sizes: ['50ml', '100ml', '200ml Flacon'],
    stock: 16,
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1000&q=85'
    ],
    featured: false,
    isBestSeller: false,
    collection: 'Imperial Silk',
    discount: 0,
    status: 'ACTIVE',
    rating: 4.82,
    reviewsCount: 29,
    concentration: '32% Extrait de Parfum',
    reviews: []
  },
  {
    id: 'as-sahara-cedar-09',
    name: 'Sahara Cedar & Smoked Vetiver',
    arabicName: 'أرز الصحراء و الفيتيفر المدخن',
    tagline: 'Atlas Mountain Cedar, Earthy Vetiver Roots & Warm Spices',
    description: 'The dignity of desert mountains captured in wood. Crisp Atlas cedarwood blended with smoky Bourbon vetiver, dry coriander seeds, and a touch of golden frankincense.',
    price: 330,
    originalPrice: null,
    gender: 'men',
    category: 'Extrait de Parfum',
    fragranceFamily: 'Woody',
    familyArabic: 'الخشبية',
    topNotes: ['Atlas Cedar Needles', 'Dry Coriander', 'Grapefruit Rind'],
    heartNotes: ['Smoky Haitian Vetiver', 'Papyrus Bark', 'Nutmeg Spice'],
    baseNotes: ['Aged Sandalwood', 'Dark Cedar Resin', 'Oakmoss'],
    sizes: ['50ml', '100ml', '200ml Flacon'],
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=1000&q=85'
    ],
    featured: false,
    isBestSeller: false,
    collection: 'Desert Gold',
    discount: 0,
    status: 'ACTIVE',
    rating: 4.76,
    reviewsCount: 33,
    concentration: '33% Extrait de Parfum',
    reviews: []
  },
  {
    id: 'as-desert-bergamot-10',
    name: 'Desert Bergamot & Solar Amber',
    arabicName: 'برغموت الصحراء و العنبر الشمسي',
    tagline: 'Sparkling Sunlit Citrus, Cardamom Breeze & Airy Amber',
    description: 'Golden morning sunlight breaking across shifting dunes. Sparkling sun-drenched bergamot and green mandarin woven into clean airy jasmine and glowing warm amber crystals.',
    price: 280,
    originalPrice: 320,
    gender: 'unisex',
    category: 'Extrait de Parfum',
    fragranceFamily: 'Fresh',
    familyArabic: 'المنعشة',
    topNotes: ['Sunlit Bergamot', 'Green Mandarin', 'Cardamom Breeze'],
    heartNotes: ['White Neroli', 'Airy Tea Leaves', 'Solar Jasmine'],
    baseNotes: ['Golden Amber Crystals', 'Silky Cedar', 'Skin Musks'],
    sizes: ['50ml', '100ml', '200ml Flacon'],
    stock: 28,
    images: [
      'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85'
    ],
    featured: false,
    isBestSeller: false,
    collection: 'Desert Gold',
    discount: 12,
    status: 'ACTIVE',
    rating: 4.81,
    reviewsCount: 40,
    concentration: '30% Extrait de Parfum',
    reviews: []
  },
  {
    id: 'as-palace-fig-11',
    name: 'Palace Fig & Royal Mango',
    arabicName: 'تين القصر و المانجو الملكي',
    tagline: 'Sun-Drenched Arabian Figs, Sweet Mango Pulp & Velvet Musks',
    description: 'A decadent oasis banquet. Sun-ripened Arabian figs sliced open over juicy alphonso mango nectar, dusted with sweet cinnamon and resting on a foundation of warm cedar and vanilla.',
    price: 310,
    originalPrice: null,
    gender: 'unisex',
    category: 'Extrait de Parfum',
    fragranceFamily: 'Fruity',
    familyArabic: 'الفاكهية',
    topNotes: ['Alphonso Mango Nectar', 'Sweet Wild Fig', 'Crisp Red Apple'],
    heartNotes: ['White Peach Flesh', 'Cinnamon Dust', 'Orris Butter'],
    baseNotes: ['Velvet Vanilla Musk', 'Blonde Cedar', 'Warm Amber'],
    sizes: ['50ml', '100ml', '200ml Flacon'],
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85'
    ],
    featured: false,
    isBestSeller: false,
    collection: 'Imperial Silk',
    discount: 0,
    status: 'ACTIVE',
    rating: 4.85,
    reviewsCount: 22,
    concentration: '32% Extrait de Parfum',
    reviews: []
  },
  {
    id: 'as-majlis-velvet-12',
    name: 'Majlis Velvet & Rare Spices',
    arabicName: 'مخمل المجلس و التوابل النادرة',
    tagline: 'Saffron Threads, Roasted Coffee Beans, Tonka & Smoky Amber',
    description: 'The sacred sensory tapestry of an evening majlis. Aromatic roasted Arabic coffee beans, golden saffron threads, rich Indonesian patchouli, and deep vanilla tonka bean aged to perfection.',
    price: 375,
    originalPrice: 425,
    gender: 'men',
    category: 'Extrait de Parfum',
    fragranceFamily: 'Oriental / Amber',
    familyArabic: 'الشرقية',
    topNotes: ['Golden Saffron Threads', 'Arabic Coffee Infusion', 'Cardamom'],
    heartNotes: ['Roasted Tonka Bean', 'Leather Cushions', 'Smoky Labdanum'],
    baseNotes: ['Indonesian Patchouli', 'Sacred Amber Resin', 'Bourbon Vanilla'],
    sizes: ['50ml', '100ml', '200ml Flacon'],
    stock: 7,
    images: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=85'
    ],
    featured: false,
    isBestSeller: true,
    collection: 'Royal Oud Reserve',
    discount: 11,
    status: 'ACTIVE',
    rating: 4.97,
    reviewsCount: 65,
    concentration: '36% Extrait de Parfum',
    reviews: []
  }
];

export const INITIAL_DISCOUNTS = [
  {
    code: 'ROYAL10',
    type: 'percentage',
    value: 10,
    minSpend: 0,
    description: '10% privilege discount on all royal fragrances',
    status: 'ACTIVE',
    usedCount: 42,
    maxUsage: 500,
    validUntil: '2027-12-31'
  },
  {
    code: 'SHEIKH20',
    type: 'percentage',
    value: 20,
    minSpend: 300,
    description: '20% VIP discount on orders above $300',
    status: 'ACTIVE',
    usedCount: 18,
    maxUsage: 100,
    validUntil: '2027-12-31'
  },
  {
    code: 'OUD50',
    type: 'fixed',
    value: 50,
    minSpend: 250,
    description: '$50 compliment on purchases above $250',
    status: 'ACTIVE',
    usedCount: 31,
    maxUsage: 200,
    validUntil: '2027-12-31'
  },
  {
    code: 'WELCOMEVIP',
    type: 'percentage',
    value: 15,
    minSpend: 100,
    description: '15% welcome privilege for new palace patrons',
    status: 'ACTIVE',
    usedCount: 95,
    maxUsage: 1000,
    validUntil: '2027-12-31'
  }
];

export const INITIAL_USERS = [
  {
    id: 'user-admin-01',
    name: 'Grand Concierge (Admin)',
    email: 'admin@arabiansheikh.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    memberSince: '2024-01-01',
    ordersCount: 14,
    totalSpent: 5890,
    addresses: [
      {
        id: 'addr-1',
        isDefault: true,
        fullName: 'Grand Concierge',
        address: 'Al Wasl Road, Villa 42',
        city: 'Dubai',
        country: 'United Arab Emirates',
        postalCode: '00000',
        phone: '+971 50 123 4567'
      }
    ],
    paymentMethods: [
      {
        id: 'pm-1',
        isDefault: true,
        cardholderName: 'Grand Concierge',
        last4: '8892',
        brand: 'Visa',
        expiry: '08/29'
      }
    ]
  },
  {
    id: 'user-patron-02',
    name: 'Sheikh Tariq Al-Fassi',
    email: 'sheikh.user@luxury.com',
    role: 'USER',
    status: 'ACTIVE',
    memberSince: '2025-03-15',
    ordersCount: 3,
    totalSpent: 1230,
    addresses: [
      {
        id: 'addr-2',
        isDefault: true,
        fullName: 'Sheikh Tariq Al-Fassi',
        address: 'Royal Palm Estate, Avenue 7',
        city: 'Riyadh',
        country: 'Saudi Arabia',
        postalCode: '11564',
        phone: '+966 55 987 6543'
      }
    ],
    paymentMethods: [
      {
        id: 'pm-2',
        isDefault: true,
        cardholderName: 'Sheikh Tariq Al-Fassi',
        last4: '4112',
        brand: 'Mastercard',
        expiry: '11/28'
      }
    ]
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'ORD-98421',
    userId: 'user-patron-02',
    customerName: 'Sheikh Tariq Al-Fassi',
    customerEmail: 'sheikh.user@luxury.com',
    date: '2026-08-10T14:30:00Z',
    status: 'SHIPPED',
    trackingCode: '9842104-AE',
    items: [
      {
        productId: 'as-oud-royal-01',
        name: 'Dehn Al Oud Royal',
        size: '100ml',
        price: 420,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85'
      },
      {
        productId: 'as-amber-malaki-02',
        name: 'Amber Al Malaki',
        size: '100ml',
        price: 360,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85'
      }
    ],
    subtotal: 780,
    discountAmount: 78,
    discountCode: 'ROYAL10',
    shipping: 0,
    total: 702,
    shippingAddress: {
      fullName: 'Sheikh Tariq Al-Fassi',
      address: 'Royal Palm Estate, Avenue 7',
      city: 'Riyadh',
      country: 'Saudi Arabia',
      postalCode: '11564',
      phone: '+966 55 987 6543'
    },
    paymentMethod: {
      type: 'card',
      last4: '4112',
      brand: 'Mastercard'
    }
  },
  {
    id: 'ORD-98350',
    userId: 'user-patron-02',
    customerName: 'Sheikh Tariq Al-Fassi',
    customerEmail: 'sheikh.user@luxury.com',
    date: '2026-07-22T09:15:00Z',
    status: 'DELIVERED',
    trackingCode: '9835011-AE',
    items: [
      {
        productId: 'as-black-monarch-04',
        name: 'Black Monarch Oud',
        size: '100ml',
        price: 450,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=85'
      }
    ],
    subtotal: 450,
    discountAmount: 0,
    discountCode: null,
    shipping: 0,
    total: 450,
    shippingAddress: {
      fullName: 'Sheikh Tariq Al-Fassi',
      address: 'Royal Palm Estate, Avenue 7',
      city: 'Riyadh',
      country: 'Saudi Arabia',
      postalCode: '11564',
      phone: '+966 55 987 6543'
    },
    paymentMethod: {
      type: 'card',
      last4: '4112',
      brand: 'Mastercard'
    }
  }
];
