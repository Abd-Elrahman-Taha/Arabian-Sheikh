import { productApi } from '../api/product.api';
import { perfumeCategoryService } from './perfumeCategoryService';
import { promotionApi } from '../api/promotion.api';
import { promotionService } from './promotionService';

// Purge any legacy device-specific discount overrides so backend promotions are the sole source of truth
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('arabian_sheikh_product_discounts');
  } catch {}
}

let memoryCatalog = [];

export const productService = {
  /**
   * Filter an array of products locally using supplied filter parameters.
   */
  applyFilters(items, filters = {}) {
    let result = Array.isArray(items) ? [...items] : [];

    // Filter by search query across all languages (En, Ar, Bg, Es) and notes
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(p => {
        const transMatch = Array.isArray(p.translations) && p.translations.some(t => 
          t.name?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.ingredients?.toLowerCase().includes(q)
        );
        return (
          p.name?.toLowerCase().includes(q) ||
          p.arabicName?.toLowerCase().includes(q) ||
          p.bulgarianName?.toLowerCase().includes(q) ||
          p.spanishName?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.fragranceFamily?.toLowerCase().includes(q) ||
          p.scentFamily?.toLowerCase().includes(q) ||
          (p.topNotes && p.topNotes.some(n => String(n).toLowerCase().includes(q))) ||
          (p.heartNotes && p.heartNotes.some(n => String(n).toLowerCase().includes(q))) ||
          (p.baseNotes && p.baseNotes.some(n => String(n).toLowerCase().includes(q))) ||
          transMatch
        );
      });
    }

    // Filter by brand
    if (filters.brandId && filters.brandId !== 'all') {
      const bId = Number(filters.brandId);
      result = result.filter(p => Number(p.brandId || p.brand?.id) === bId);
    }

    // Filter by category
    if (filters.categoryId && filters.categoryId !== 'all') {
      const cId = Number(filters.categoryId);
      result = result.filter(p => Number(p.categoryId || p.category?.id) === cId);
    } else if (filters.category && filters.category !== 'all') {
      const cat = filters.category.toLowerCase().trim();
      if (cat === 'offers' || cat === 'discounts') {
        result = result.filter(p => p.hasDiscount || (p.discountPercent > 0) || (p.originalPrice && p.originalPrice > p.price) || p.isOffer);
      } else {
        result = result.filter(p => {
          const c = (p.category || p.categoryName || '').toLowerCase().trim();
          const catId = p.categoryId ? String(p.categoryId) : (p.category?.id ? String(p.category.id) : '');
          if (!c && !catId) return true;
          return c === cat || c.includes(cat) || cat.includes(c) || catId === cat ||
            (cat === 'perfumes' && (c === 'perfume' || c === 'perfumes' || catId === '1' || !c)) ||
            ((cat === 'body-bath-care' || cat === 'body care' || cat === 'body & bath care') && (c.includes('body') || c.includes('bath') || catId === '3')) ||
            (cat === 'cosmetics' && (c.includes('cosmetic') || catId === '7' || catId === '4')) ||
            ((cat === 'hair-care' || cat === 'hair care') && (c.includes('hair') || catId === '8'));
        });
      }
    }

    // Filter by subcategory
    if (filters.subcategoryId && filters.subcategoryId !== 'all') {
      const sId = Number(filters.subcategoryId);
      if (!isNaN(sId) && sId > 0) {
        result = result.filter(p => Number(p.subcategoryId || p.subcategory?.id) === sId);
      } else {
        const subStr = String(filters.subcategoryId).toLowerCase();
        result = result.filter(p => {
          const subName = (p.subcategory?.name || p.subcategoryName || '').toLowerCase();
          return subName.includes(subStr);
        });
      }
    } else if (filters.subcategory && filters.subcategory !== 'all') {
      const subStr = String(filters.subcategory).toLowerCase();
      result = result.filter(p => {
        const subName = (p.subcategory?.name || p.subcategoryName || '').toLowerCase();
        if (subStr === 'oriental') return subName.includes('oriental') || Number(p.subcategoryId) === 6;
        if (subStr === 'niche' || subStr === 'niche-rare') return subName.includes('niche') || Number(p.subcategoryId) === 7;
        return subName.includes(subStr);
      });
    }

    // Filter by perfume tier
    if (filters.tier && filters.tier !== 'all') {
      const targetTier = filters.tier.toLowerCase().replace(/tier/g, '').trim();
      result = result.filter(p => {
        const t = (p.tier || p.perfumeCategoryName || '').toLowerCase().replace(/tier/g, '').trim();
        const tId = String(p.perfumeCategoryId || p.perfumeCategory?.id || '');
        return (
          (t && (t === targetTier || t.includes(targetTier) || targetTier.includes(t))) ||
          tId === targetTier ||
          (p.perfumeCategory && String(p.perfumeCategory.name || '').toLowerCase().includes(targetTier))
        );
      });
    }

    // Filter by gender
    if (filters.gender && filters.gender !== 'all') {
      const target = filters.gender.toLowerCase().trim();
      result = result.filter(p => {
        const pg = (p.gender || '').toLowerCase().trim();
        return !pg || pg === 'unisex' || pg === target ||
          (target === 'men' && (pg === 'male' || pg === 'masculine')) ||
          (target === 'women' && (pg === 'female' || pg === 'feminine'));
      });
    }

    // Status filter
    if (filters.status && filters.status !== 'ALL') {
      result = result.filter(p => p.status === filters.status);
    } else if (!filters.includeDrafts) {
      result = result.filter(p => p.isActive !== false && p.status !== 'INACTIVE');
    }

    // Sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-low':
          result.sort((a, b) => (a.price || 0) - (b.price || 0));
          break;
        case 'price-high':
          result.sort((a, b) => (b.price || 0) - (a.price || 0));
          break;
        case 'rating':
          result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'newest':
          result.reverse();
          break;
        case 'featured':
        default:
          break;
      }
    }

    return result;
  },

  getAllProductsSync(filters = {}) {
    return this.applyFilters(memoryCatalog, filters);
  },

  /**
   * Fresh, pure Live API fetch. Zero localStorage caching.
   */
  async getAllProducts(filters = {}) {
    try {
      const apiFilters = { ...filters };
      delete apiFilters.category;
      delete apiFilters.Category;

      if (filters.categoryId && filters.categoryId !== 'all') {
        const cId = Number(filters.categoryId);
        if (!isNaN(cId) && cId > 0) apiFilters.categoryId = cId;
      } else {
        delete apiFilters.categoryId;
        delete apiFilters.CategoryId;
      }

      if (filters.subcategoryId && filters.subcategoryId !== 'all') {
        const sId = Number(filters.subcategoryId);
        if (!isNaN(sId) && sId > 0) apiFilters.subcategoryId = sId;
      } else {
        delete apiFilters.subcategoryId;
        delete apiFilters.SubcategoryId;
      }

      if (filters.brandId && filters.brandId !== 'all') {
        const bId = Number(filters.brandId);
        if (!isNaN(bId) && bId > 0) apiFilters.brandId = bId;
      } else {
        delete apiFilters.brandId;
        delete apiFilters.BrandId;
      }

      // Map tier name or id to perfumeCategoryId for backend API filtering
      if (filters.tier && filters.tier !== 'all') {
        const tiers = perfumeCategoryService.getCachedTiers() || [];
        const targetTierName = String(filters.tier).toLowerCase().replace(/tier/g, '').trim();
        const matched = tiers.find(t =>
          String(t.id) === targetTierName ||
          (t.name && t.name.toLowerCase().replace(/tier/g, '').trim() === targetTierName)
        );
        if (matched?.id) {
          apiFilters.perfumeCategoryId = matched.id;
        }
      }

      let response = null;
      if (filters.includeDrafts) {
        try {
          response = await productApi.adminGetProducts(apiFilters);
        } catch (adminErr) {
          console.warn('adminGetProducts fallback to public getProducts:', adminErr.message);
          response = await productApi.getProducts(apiFilters).catch(() => null);
        }
      } else {
        response = await productApi.getProducts(apiFilters);
      }

      let items = response?.items || (Array.isArray(response) ? response : []);

      // Ensure perfume products reflect the exact dynamic tier pricing from backend
      try {
        let tiers = perfumeCategoryService.getCachedTiers();
        if (!tiers || tiers.length === 0) {
          tiers = [
            { id: 1, name: 'Standard', price: 100, notes: 'Standard Perfume Tier' },
            { id: 2, name: 'Premium', price: 150, notes: 'Premium Perfume Tier' },
            { id: 3, name: 'Luxury', price: 300, notes: 'Luxury Perfume Tier' }
          ];
        }
        if (Array.isArray(tiers) && tiers.length > 0) {
          const tierById = new Map();
          const tierByName = new Map();
          const tierByPrice = new Map();
          tiers.forEach(t => {
            tierById.set(Number(t.id), t);
            if (t.name) tierByName.set(String(t.name).toLowerCase().replace(/tier/g, '').trim(), t);
            if (t.price !== undefined && !isNaN(Number(t.price)) && Number(t.price) > 0) {
              tierByPrice.set(Number(t.price), t);
            }
          });

          items = items.map(p => {
            const pCatId = Number(p.perfumeCategoryId || (typeof p.perfumeCategory === 'object' ? p.perfumeCategory?.id : null));
            const catIdNum = Number(p.categoryId || (typeof p.category === 'object' ? p.category?.id : null));
            const catNameStr = String(p.categoryName || (typeof p.category === 'object' ? p.category?.name : p.category) || '').toLowerCase();
            const isPerfume = catIdNum === 1 || catNameStr.includes('perfume') || !!pCatId;

            if (isPerfume) {
              const matchedTier = pCatId
                ? tierById.get(pCatId)
                : (p.tier
                    ? tierByName.get(String(p.tier).toLowerCase().replace(/tier/g, '').trim())
                    : (p.perfumeCategoryName
                        ? tierByName.get(String(p.perfumeCategoryName).toLowerCase().replace(/tier/g, '').trim())
                        : tierByPrice.get(Number(p.originalPrice || p.price))));

              if (matchedTier) {
                const tierPrice = Number(matchedTier.price);
                const basePrice = tierPrice > 0 ? tierPrice : (Number(p.price) || 0);
                return {
                  ...p,
                  tier: matchedTier.name,
                  perfumeCategoryName: matchedTier.name,
                  perfumeCategoryId: matchedTier.id,
                  price: basePrice,
                  originalPrice: basePrice,
                  tierPrice: tierPrice
                };
              }
            }
            return p;
          });
        }
      } catch (e) {
        // Continue with raw backend items if tier enrichment fails
      }

      // Enrich products with active discounts strictly from Backend Promotions
      try {
        let activePromos = [];
        try {
          activePromos = await promotionService.getActivePromotions().catch(() => []);
        } catch {}

        items = items.map(p => {
          const basePrice = p.tierPrice || (p.perfumeCategoryId ? perfumeCategoryService.getTierPrice(p.perfumeCategoryId) : null) || p.originalPrice || p.price;

          if (Array.isArray(activePromos) && activePromos.length > 0) {
            const promoCalc = promotionService.calculateProductPromotion({ ...p, price: basePrice, originalPrice: basePrice }, activePromos);
            if (promoCalc?.hasPromotion) {
              return {
                ...p,
                hasDiscount: true,
                isOffer: true,
                discountPercent: promoCalc.discountPercent,
                originalPrice: promoCalc.originalPrice || basePrice,
                price: promoCalc.price
              };
            }
          }

          return {
            ...p,
            hasDiscount: false,
            isOffer: false,
            discountPercent: 0,
            originalPrice: null,
            price: basePrice
          };
        });
      } catch (e) {
        console.warn('Backend promotions enrichment error:', e.message);
      }

      memoryCatalog = items;
      return this.applyFilters(memoryCatalog, filters);
    } catch (err) {
      console.warn('API getAllProducts error:', err.message);
      return this.applyFilters(memoryCatalog, filters);
    }
  },

  enrichProductWithNotes(prod) {
    if (!prod) return null;
    const enriched = { ...prod };

    // 1. If notes are already provided
    const hasTop = Array.isArray(enriched.topNotes) && enriched.topNotes.length > 0;
    const hasHeart = Array.isArray(enriched.heartNotes) && enriched.heartNotes.length > 0;
    const hasBase = Array.isArray(enriched.baseNotes) && enriched.baseNotes.length > 0;

    if (hasTop && hasHeart && hasBase) {
      if (!enriched.notes) {
        enriched.notes = { top: enriched.topNotes, heart: enriched.heartNotes, base: enriched.baseNotes };
      }
      return enriched;
    }

    if (enriched.notes && enriched.notes.top?.length && enriched.notes.heart?.length && enriched.notes.base?.length) {
      enriched.topNotes = enriched.notes.top;
      enriched.heartNotes = enriched.notes.heart;
      enriched.baseNotes = enriched.notes.base;
      return enriched;
    }

    // 2. Try parsing from ingredients if present (e.g. "Rare Oud, Amber Crystals, Taif Rose, White Musk")
    if (enriched.ingredients && typeof enriched.ingredients === 'string' && enriched.ingredients.trim()) {
      const parts = enriched.ingredients.split(/[,،•\n]+/).map(s => s.trim()).filter(Boolean);
      if (parts.length >= 3) {
        const third = Math.ceil(parts.length / 3);
        const top = parts.slice(0, third);
        const heart = parts.slice(third, third * 2);
        const base = parts.slice(third * 2);
        enriched.topNotes = top.length ? top : ['Imperial Saffron', 'Wild Bergamot'];
        enriched.heartNotes = heart.length ? heart : ['Royal Amber Resin', 'Taif Rose Petals'];
        enriched.baseNotes = base.length ? base : ['Assamese Heartwood Oud', 'Cashmere Musk'];
        enriched.notes = { top: enriched.topNotes, heart: enriched.heartNotes, base: enriched.baseNotes };
        if (!enriched.longevity) enriched.longevity = '16+ Hours';
        if (!enriched.sillage) enriched.sillage = 'Imperial Projection (6+ Feet)';
        if (!enriched.season) enriched.season = ['Autumn', 'Winter', 'Evening / Gala'];
        if (!enriched.occasion) enriched.occasion = ['Royal Galas', 'Formal Occasions'];
        if (!enriched.fragranceFamily) enriched.fragranceFamily = 'Oriental Haute Parfumerie';
        if (!enriched.concentration) enriched.concentration = 'Extrait de Parfum (30% Oil Concentration)';
        return enriched;
      }
    }

    // 4. Default Sovereign Royal Fragrance Notes
    const defaultTop = ['Imperial Saffron', 'Wild Bergamot', 'Golden Amber Dust'];
    const defaultHeart = ['Assamese Royal Oud', 'Smoked Incense', 'Taif Rose Petals'];
    const defaultBase = ['Black Ambergris', 'Dark Sandalwood', 'Cashmere Musk'];

    enriched.topNotes = defaultTop;
    enriched.heartNotes = defaultHeart;
    enriched.baseNotes = defaultBase;
    enriched.notes = { top: defaultTop, heart: defaultHeart, base: defaultBase };
    if (!enriched.longevity) enriched.longevity = '18+ Hours';
    if (!enriched.sillage) enriched.sillage = 'Magnificent Imperial Sillage';
    if (!enriched.season) enriched.season = ['Autumn', 'Winter', 'Evening / Gala'];
    if (!enriched.occasion) enriched.occasion = ['Royal Celebrations', 'Evening Soirée'];
    if (!enriched.fragranceFamily) enriched.fragranceFamily = 'Royal Andalusian Oriental';
    if (!enriched.concentration) enriched.concentration = 'Extrait de Parfum (30% Sillage Oil)';

    return enriched;
  },

  getProductByIdSync(idOrSlug) {
    if (!idOrSlug) return null;
    const clean = String(idOrSlug).trim().toLowerCase();
    let found = memoryCatalog.find(p => 
      String(p.id).toLowerCase() === clean || 
      String(p.slug || '').toLowerCase() === clean || 
      String(p.numericId || '').toLowerCase() === clean ||
      (p.name && p.name.toLowerCase().trim() === clean)
    ) || null;

    if (found) {
      if (!found.numericId || isNaN(Number(found.numericId)) || Number(found.numericId) <= 0) {
        if (typeof found.id === 'number' && found.id > 0) {
          found.numericId = found.id;
        }
      }
      return this.enrichProductWithNotes(found);
    }

    return null;
  },

  async getProductById(idOrSlug) {
    if (!idOrSlug) return null;
    const clean = String(idOrSlug).trim().toLowerCase();

    const numId = Number(idOrSlug);
    if (!isNaN(numId) && numId > 0) {
      try {
        const remote = await productApi.getProductById(numId);
        if (remote) {
          let basePrice = Number(remote.price) || 0;
          if (remote.perfumeCategoryId || Number(remote.categoryId) === 1) {
            const tierPrice = perfumeCategoryService.getTierPrice(remote.perfumeCategoryId);
            if (tierPrice && tierPrice > 0) {
              remote.price = tierPrice;
              basePrice = tierPrice;
            }
            const tier = perfumeCategoryService.getTierById(remote.perfumeCategoryId);
            if (tier?.name) {
              remote.tier = tier.name;
              remote.perfumeCategoryName = tier.name;
            }
          }
          try {
            const activePromos = await promotionService.getActivePromotions().catch(() => []);
            if (activePromos.length > 0) {
              const promoCalc = promotionService.calculateProductPromotion({ ...remote, price: basePrice, originalPrice: basePrice }, activePromos);
              if (promoCalc?.hasPromotion) {
                remote.hasDiscount = true;
                remote.isOffer = true;
                remote.discountPercent = promoCalc.discountPercent;
                remote.originalPrice = promoCalc.originalPrice || basePrice;
                remote.price = promoCalc.price;
              } else {
                remote.hasDiscount = false;
                remote.isOffer = false;
                remote.discountPercent = 0;
                remote.originalPrice = null;
                remote.price = basePrice;
              }
            }
          } catch {}
          return this.enrichProductWithNotes(remote);
        }
      } catch (err) {
        console.warn('API getProductById fallback:', err.message);
      }
    }

    // 2. Check if local memoryCatalog already contains a live-hydrated product with numeric ID
    const liveHydrated = memoryCatalog.find(p => 
      (typeof p.numericId === 'number' && p.numericId > 0 || typeof p.id === 'number' && p.id > 0) &&
      (String(p.id).toLowerCase() === clean || 
       String(p.slug || '').toLowerCase() === clean || 
       String(p.numericId || '').toLowerCase() === clean ||
       (p.name && p.name.toLowerCase().trim() === clean))
    );
    if (liveHydrated) {
      return this.enrichProductWithNotes(liveHydrated);
    }

    // 3. Fetch from all products from live backend API to resolve authoritative numeric ID
    try {
      const all = await this.getAllProducts({ pageSize: 100, includeDrafts: true });
      const found = all.find(p => 
        String(p.id).toLowerCase() === clean || 
        String(p.slug || '').toLowerCase() === clean || 
        String(p.numericId || '').toLowerCase() === clean ||
        (p.name && p.name.toLowerCase().trim() === clean)
      );
      if (found) {
        return this.enrichProductWithNotes(found);
      }
    } catch {}

    return null;
  },

  getFeaturedProductsSync(limit = 4) {
    return memoryCatalog.filter(p => p.featured).slice(0, limit);
  },

  async getFeaturedProducts(limit = 4) {
    const products = await this.getAllProducts();
    return products.filter(p => p.featured && (!p.status || p.status === 'ACTIVE')).slice(0, limit);
  },

  getProductsByCategorySync(category, limit) {
    const filtered = this.applyFilters(memoryCatalog, { category });
    return limit ? filtered.slice(0, limit) : filtered;
  },

  async getProductsByCategory(category, limit) {
    const products = await this.getAllProducts({ category });
    return limit ? products.slice(0, limit) : products;
  },

  getProductsByTierSync(tier, limit) {
    const filtered = this.applyFilters(memoryCatalog, { tier });
    return limit ? filtered.slice(0, limit) : filtered;
  },

  async getProductsByTier(tier, limit) {
    const products = await this.getAllProducts({ tier });
    return limit ? products.slice(0, limit) : products;
  },

  async getPerfumes() {
    const products = await this.getAllProducts({ category: 'perfumes' });
    return products.filter(p => !p.status || p.status === 'ACTIVE');
  },

  async getOils() {
    const products = await this.getAllProducts({ category: 'oils' });
    return products.filter(p => !p.status || p.status === 'ACTIVE');
  },

  async getBakhoor() {
    const products = await this.getAllProducts({ category: 'bakhoor' });
    return products.filter(p => !p.status || p.status === 'ACTIVE');
  },

  async getCosmetics() {
    const products = await this.getAllProducts({ category: 'cosmetics' });
    return products.filter(p => !p.status || p.status === 'ACTIVE');
  },

  async getBundles() {
    const products = await this.getAllProducts({ category: 'bundles' });
    return products.filter(p => !p.status || p.status === 'ACTIVE');
  },

  async getRelatedProducts(currentId, limit = 4) {
    const all = await this.getAllProducts();
    const current = all.find(p => String(p.id) === String(currentId) || p.slug === currentId);
    if (!current) return all.slice(0, limit);
    return all.filter(p => (String(p.id) !== String(current.id)) && (!p.status || p.status === 'ACTIVE') && (p.category === current.category || p.tier === current.tier)).slice(0, limit);
  },

  getRelatedProductsSync(currentId, limit = 4) {
    const current = memoryCatalog.find(p => String(p.id) === String(currentId) || p.slug === currentId);
    if (!current) return memoryCatalog.slice(0, limit);
    return memoryCatalog.filter(p => (String(p.id) !== String(current.id)) && (!p.status || p.status === 'ACTIVE') && (p.category === current.category || p.tier === current.tier)).slice(0, limit);
  },

  async searchProducts(query, limit = 10) {
    if (!query) return [];
    const all = await this.getAllProducts();
    return this.applyFilters(all, { search: query }).slice(0, limit);
  },

  async addReview(productId, review) {
    return await productApi.addReview(productId, review);
  },

  // ==========================================
  // Admin & Back-Office Live Database Mutations
  // ==========================================
  resolveTargetId(id) {
    if (typeof id === 'number' && !isNaN(id) && id > 0) return id;
    const num = Number(id);
    if (!isNaN(num) && num > 0) return num;
    const clean = String(id || '').trim().toLowerCase();
    const found = memoryCatalog.find(p => 
      String(p.id).toLowerCase() === clean || 
      String(p.numericId || '').toLowerCase() === clean || 
      String(p.slug || '').toLowerCase() === clean ||
      (p.name && p.name.toLowerCase().trim() === clean)
    );
    if (found?.numericId && Number(found.numericId) > 0) return Number(found.numericId);
    if (found?.id && !isNaN(Number(found.id)) && Number(found.id) > 0) return Number(found.id);

    return null;
  },

  async uploadProductImage(file) {
    const res = await productApi.adminUploadProductImages(file);
    return res?.url || res?.imageUrl || (Array.isArray(res) ? res[0]?.url : null) || res;
  },

  async createProduct(productData) {
    const created = await productApi.adminCreateProduct(productData);
    await this.getAllProducts({ includeDrafts: true });
    return created;
  },

  async updateProduct(id, productData) {
    const targetId = this.resolveTargetId(id);
    const existing = memoryCatalog.find(p => String(p.id) === String(id) || String(p.numericId) === String(id) || p.slug === id) || {};
    
    const isPerfume = Boolean(
      productData.perfumeCategoryId ||
      (existing?.perfumeCategoryId) ||
      productData.category === 'perfumes' ||
      existing?.category === 'perfumes' ||
      productData.tier ||
      existing?.tier ||
      Number(productData.categoryId || existing?.categoryId) === 1
    );

    let perfumeCatId = productData.perfumeCategoryId !== undefined ? productData.perfumeCategoryId : existing?.perfumeCategoryId;
    if (!perfumeCatId && isPerfume) {
      const tierName = productData.tier || existing?.tier;
      if (tierName) {
        const tiers = perfumeCategoryService.getCachedTiers();
        const found = tiers.find(t => t.name?.toLowerCase() === String(tierName).toLowerCase());
        if (found) perfumeCatId = found.id;
      }
    }

    let updatedRemote = null;
    if (targetId) {
      const mergedPayload = {
        brandId: Number(productData.brandId || existing?.brandId) || 1,
        categoryId: Number(productData.categoryId || existing?.categoryId) || (isPerfume ? 1 : 2),
        subcategoryId: productData.subcategoryId !== undefined ? productData.subcategoryId : (existing?.subcategoryId || null),
        perfumeCategoryId: isPerfume ? Number(perfumeCatId) : null,
        gender: productData.gender || existing?.gender || 'Unisex',
        price: Number(productData.price !== undefined ? productData.price : (existing?.price || 0)),
        isActive: productData.isActive !== undefined ? Boolean(productData.isActive) : (existing?.isActive !== false),
        imageUrl: productData.imageUrl || productData.image || existing?.imageUrl || existing?.image || (existing?.images?.[0]),
        shippingWeight: productData.shippingWeight !== undefined ? Number(productData.shippingWeight) : (Number(existing?.shippingWeight) || 0.45),
        nameIsTranslatable: productData.nameIsTranslatable !== undefined ? Boolean(productData.nameIsTranslatable) : true,
        translations: Array.isArray(productData.translations) ? productData.translations : undefined,
        name: productData.name || existing?.name,
        description: productData.description || existing?.description,
        ingredients: productData.ingredients || existing?.ingredients
      };

      updatedRemote = await productApi.adminUpdateProduct(targetId, mergedPayload);
    }

    await this.getAllProducts({ includeDrafts: true });
    return updatedRemote || productData;
  },

  async deleteProduct(id) {
    const targetId = this.resolveTargetId(id);
    if (targetId) {
      await productApi.adminDeleteProduct(targetId);
    }
    memoryCatalog = memoryCatalog.filter(p => String(p.id) !== String(id) && (!targetId || String(p.numericId) !== String(targetId)));
    return true;
  },

  async toggleProductActive(id, isActive) {
    const targetId = this.resolveTargetId(id);
    const existing = memoryCatalog.find(p => String(p.id) === String(id) || String(p.numericId) === String(id) || p.slug === id) || {};
    
    if (targetId) {
      if (Boolean(isActive)) {
        await productApi.adminActivateProduct(targetId, existing);
      } else {
        await productApi.adminDeactivateProduct(targetId, existing);
      }
    }

    memoryCatalog = memoryCatalog.map(p => {
      if (String(p.id) === String(id) || (targetId && String(p.numericId) === String(targetId)) || p.slug === id) {
        return { ...p, isActive: Boolean(isActive), status: isActive ? 'ACTIVE' : 'INACTIVE' };
      }
      return p;
    });

    return { id: targetId || id, isActive: Boolean(isActive) };
  },

  async updateStock(id, newStock) {
    const stockVal = Math.max(0, Number(newStock));
    return await this.updateProduct(id, { stock: stockVal });
  },

  async applyProductDiscount(id, discountPercent) {
    console.warn('applyProductDiscount is deprecated. Control all discounts via backend Promotions page.');
    promotionService.clearCache();
    return { id, discountPercent, hasDiscount: true };
  },

  async removeProductDiscount(id) {
    console.warn('removeProductDiscount is deprecated. Control all discounts via backend Promotions page.');
    promotionService.clearCache();
    return { id, discountPercent: 0, hasDiscount: false };
  },

  getDiscountedProductsSync() {
    return memoryCatalog.filter(p => 
      (!p.status || p.status === 'ACTIVE') && (
        p.hasDiscount || 
        (p.discountPercent && p.discountPercent > 0) || 
        (p.originalPrice && p.originalPrice > p.price) ||
        p.isOffer
      )
    );
  }
};

export default productService;

