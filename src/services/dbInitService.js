import { brandApi } from '../api/brand.api';
import { productApi } from '../api/product.api';
import { INITIAL_PRODUCTS } from './mockData';

export const dbInitService = {
  /**
   * Initialize and seed PostgreSQL database on runasp.net with official catalog
   */
  async seedDatabase(progressCallback = null) {
    const report = (msg) => {
      console.log(`[DB Seed] ${msg}`);
      if (typeof progressCallback === 'function') progressCallback(msg);
    };

    report('Checking brands in PostgreSQL database...');
    let brands = [];
    try {
      brands = await brandApi.adminGetBrands();
    } catch {}

    let brandId = 1;
    if (!brands || brands.length === 0) {
      report('Creating master brand Arabian Sheikh...');
      try {
        const createdBrand = await brandApi.adminCreateBrand({
          name: 'Arabian Sheikh',
          logoUrl: '/assets/arabian-sheikh-logo.svg',
          isActive: true
        });
        brandId = createdBrand?.id || 1;
      } catch (err) {
        console.warn('Brand creation note:', err.message);
      }
    } else {
      brandId = brands[0]?.id || 1;
    }

    report('Checking categories in PostgreSQL database...');
    let categories = [];
    try {
      categories = await productApi.adminGetCategories();
    } catch {}

    const categoryMap = { perfumes: 1, oils: 2, bakhoor: 3, cosmetics: 4, bundles: 5 };
    if (!categories || categories.length === 0) {
      report('Creating official store categories...');
      const seedCats = [
        { name: 'Perfumes', slug: 'perfumes', isActive: true },
        { name: 'Oils', slug: 'oils', isActive: true },
        { name: 'Bakhoor', slug: 'bakhoor', isActive: true },
        { name: 'Cosmetics', slug: 'cosmetics', isActive: true },
        { name: 'Bundles', slug: 'bundles', isActive: true }
      ];
      for (const cat of seedCats) {
        try {
          const res = await productApi.adminCreateCategory(cat);
          if (res?.id && cat.slug) categoryMap[cat.slug] = res.id;
        } catch {}
      }
    }

    report('Checking perfume categories (Tiers) in PostgreSQL database...');
    let perfumeCats = [];
    try {
      perfumeCats = await productApi.adminGetPerfumeCategories();
    } catch {}

    const tierMap = { luxury: 1, royal: 2, classic: 3 };
    if (!perfumeCats || perfumeCats.length === 0) {
      report('Creating perfume tiers (Luxury, Royal, Classic)...');
      const seedTiers = [
        { name: 'Luxury', price: 55, notes: 'Haute Parfumerie Extrait' },
        { name: 'Royal', price: 50, notes: 'Royal Collection Extrait' },
        { name: 'Classic', price: 40, notes: 'Signature Classic' }
      ];
      for (const tier of seedTiers) {
        try {
          const res = await productApi.adminCreatePerfumeCategory(tier);
          if (res?.id && tier.name) tierMap[tier.name.toLowerCase()] = res.id;
        } catch {}
      }
    }

    report('Checking products in PostgreSQL database...');
    let existingProducts = [];
    try {
      const res = await productApi.adminGetProducts();
      existingProducts = res?.items || [];
    } catch {}

    if (!existingProducts || existingProducts.length === 0) {
      report(`Seeding ${INITIAL_PRODUCTS.length} official royal creations to database...`);
      for (let i = 0; i < INITIAL_PRODUCTS.length; i++) {
        const prod = INITIAL_PRODUCTS[i];
        report(`Uploading [${i + 1}/${INITIAL_PRODUCTS.length}] '${prod.name}'...`);
        
        const tierKey = (prod.tier || 'luxury').toLowerCase();
        const pTierId = tierMap[tierKey] || 1;
        const catKey = (prod.category || 'perfumes').toLowerCase();
        const pCatId = categoryMap[catKey] || 1;

        try {
          await productApi.adminCreateProduct({
            ...prod,
            brandId: Number(brandId),
            categoryId: Number(pCatId),
            perfumeCategoryId: Number(pTierId),
            gender: prod.gender === 'Female' ? 'Female' : (prod.gender === 'Male' ? 'Male' : 'Unisex'),
            price: Number(prod.price) || 55,
            isActive: prod.status !== 'INACTIVE',
            imageUrl: prod.cutoutImage || prod.originalImage || (prod.images && prod.images[0]) || '/products/luxury_designs/07_arabian_gold.webp'
          });
        } catch (prodErr) {
          console.warn(`Product seed error on '${prod.name}':`, prodErr.message);
        }
      }
      report('Database seed completed successfully!');
    } else {
      report(`Database already populated with ${existingProducts.length} live products.`);
    }

    return true;
  }
};
