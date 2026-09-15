import { productApi } from '../api/product.api';
import { perfumeCategoryService } from './perfumeCategoryService';
import { promotionApi } from '../api/promotion.api';
import { promotionService } from './promotionService';

const DISCOUNT_STORAGE_KEY = 'arabian_sheikh_product_discounts';

function getStoredDiscounts() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(DISCOUNT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredDiscounts(map) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DISCOUNT_STORAGE_KEY, JSON.stringify(map));
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
      const targetTier = filters.tier.toLowerCase().trim();
      result = result.filter(p => {
        const t = (p.tier || p.perfumeCategoryName || '').toLowerCase().trim();
        return t === targetTier;
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
          const tiersRes = await perfumeCategoryService.getAdminPerfumeCategories({ pageSize: 100 }).catch(() => null);
          tiers = tiersRes?.items || [];
        }
        if (Array.isArray(tiers) && tiers.length > 0) {
          const tierMap = new Map();
          tiers.forEach(t => {
            tierMap.set(Number(t.id), t);
            if (t.name) tierMap.set(String(t.name).toLowerCase(), t);
          });

          items = items.map(p => {
            const pCatId = Number(p.perfumeCategoryId);
            const isPerfume = Number(p.categoryId) === 1 || p.category === 'perfumes' || !!pCatId;
            if (isPerfume) {
              const matchedTier = pCatId ? tierMap.get(pCatId) : (p.tier ? tierMap.get(String(p.tier).toLowerCase()) : null);
              if (matchedTier) {
                const tierPrice = Number(matchedTier.price);
                return {
                  ...p,
                  tier: matchedTier.name,
                  perfumeCategoryName: matchedTier.name,
                  perfumeCategoryId: matchedTier.id,
                  price: tierPrice > 0 ? tierPrice : (Number(p.price) || 0)
                };
              }
            }
            return p;
          });
        }
      } catch (e) {
        // Continue with raw backend items if tier enrichment fails
      }

      // Enrich products with active discounts (Persistent Storage + Backend Promotions)
      try {
        const storedDiscounts = getStoredDiscounts();
        let activePromos = [];
        try {
          activePromos = await promotionService.getActivePromotions().catch(() => []);
        } catch {}

        items = items.map(p => {
          const pIdStr = String(p.id);
          const pNumStr = p.numericId ? String(p.numericId) : null;
          const discountOverride = storedDiscounts[pIdStr] || (pNumStr && storedDiscounts[pNumStr]);

          if (discountOverride && discountOverride.hasDiscount) {
            const pct = Number(discountOverride.discountPercent) || 10;
            const basePrice = p.originalPrice || p.price;
            return {
              ...p,
              hasDiscount: true,
              isOffer: true,
              discountPercent: pct,
              originalPrice: basePrice,
              price: Math.round(basePrice * (1 - pct / 100))
            };
          }

          if (Array.isArray(activePromos) && activePromos.length > 0) {
            const promoCalc = promotionService.calculateProductPromotion(p, activePromos);
            if (promoCalc?.hasPromotion) {
              return {
                ...p,
                hasDiscount: true,
                isOffer: true,
                discountPercent: promoCalc.discountPercent,
                originalPrice: promoCalc.originalPrice || p.price,
                price: promoCalc.price
              };
            }
          }

          return p;
        });
      } catch (e) {
        console.warn('Discount enrichment error:', e.message);
      }

      if (items.length > 0) {
        memoryCatalog = items;
      }
      return this.applyFilters(memoryCatalog, filters);
    } catch (err) {
      console.warn('API getAllProducts error:', err.message);
      return this.applyFilters(memoryCatalog, filters);
    }
  },

  getProductByIdSync(idOrSlug) {
    if (!idOrSlug) return null;
    return memoryCatalog.find(p => String(p.id) === String(idOrSlug) || p.slug === idOrSlug || String(p.numericId) === String(idOrSlug)) || null;
  },

  async getProductById(idOrSlug) {
    if (!idOrSlug) return null;

    const numId = Number(idOrSlug);
    if (!isNaN(numId) && numId > 0) {
      try {
        const remote = await productApi.getProductById(numId);
        if (remote) {
          if (remote.perfumeCategoryId || Number(remote.categoryId) === 1) {
            const tierPrice = perfumeCategoryService.getTierPrice(remote.perfumeCategoryId);
            if (tierPrice && tierPrice > 0) {
              remote.price = tierPrice;
            }
            const tier = perfumeCategoryService.getTierById(remote.perfumeCategoryId);
            if (tier?.name) {
              remote.tier = tier.name;
              remote.perfumeCategoryName = tier.name;
            }
          }
          return remote;
        }
      } catch (err) {
        console.warn('API getProductById fallback:', err.message);
      }
    }

    const all = await this.getAllProducts({ includeDrafts: true });
    return all.find(p => String(p.id) === String(idOrSlug) || p.slug === idOrSlug || String(p.numericId) === String(idOrSlug)) || null;
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
    const found = memoryCatalog.find(p => String(p.id) === String(id) || String(p.numericId) === String(id) || p.slug === id);
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
    const pct = Math.max(1, Math.min(99, Number(discountPercent) || 10));
    const targetId = this.resolveTargetId(id) || id;
    const targetKey = String(targetId);

    // 1. Save to persistent storage immediately so refresh never loses the discount
    const stored = getStoredDiscounts();
    stored[targetKey] = {
      discountPercent: pct,
      hasDiscount: true,
      isOffer: true,
      updatedAt: Date.now()
    };
    if (String(id) !== targetKey) {
      stored[String(id)] = stored[targetKey];
    }
    saveStoredDiscounts(stored);

    // 2. Also create/activate backend promotion in database via promotionApi
    try {
      const prod = memoryCatalog.find(p => String(p.id) === String(id) || String(p.numericId) === String(targetId));
      const prodName = prod?.name || `Product #${targetId}`;

      const promosRes = await promotionApi.adminGetPromotions({ pageSize: 100 }).catch(() => null);
      const items = promosRes?.items || (Array.isArray(promosRes) ? promosRes : []);
      const existingPromo = items.find(p => {
        const rules = p.applicability || p.applicabilities || [];
        return rules.some(r => r.targetType === 'Product' && Number(r.targetId) === Number(targetId));
      });

      if (existingPromo?.id) {
        await promotionApi.adminUpdatePromotion(existingPromo.id, {
          name: existingPromo.name || `Special Offer - ${prodName}`,
          type: 'Discount',
          discountType: 'Percentage',
          discountValue: pct,
          startDate: existingPromo.startDate || new Date().toISOString(),
          endDate: existingPromo.endDate || '2028-12-31T23:59:59Z',
          isActive: true,
          applicability: [{ targetType: 'Product', targetId: Number(targetId), isExcluded: false }]
        }).catch(() => {});
        await promotionApi.adminActivatePromotion(existingPromo.id).catch(() => {});
      } else {
        await promotionApi.adminCreatePromotion({
          name: `Special Offer - ${prodName}`,
          type: 'Discount',
          discountType: 'Percentage',
          discountValue: pct,
          startDate: new Date().toISOString(),
          endDate: '2028-12-31T23:59:59Z',
          isActive: true,
          applicability: [{ targetType: 'Product', targetId: Number(targetId), isExcluded: false }]
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Backend promotion sync warning:', e.message);
    }

    // 3. Update memory catalog
    memoryCatalog = memoryCatalog.map(p => {
      if (String(p.id) === String(id) || String(p.numericId) === String(targetId) || p.slug === id) {
        const base = p.originalPrice || p.price;
        return {
          ...p,
          hasDiscount: true,
          isOffer: true,
          discountPercent: pct,
          originalPrice: base,
          price: Math.round(base * (1 - pct / 100))
        };
      }
      return p;
    });

    return { id: targetId, discountPercent: pct, hasDiscount: true };
  },

  async removeProductDiscount(id) {
    const targetId = this.resolveTargetId(id) || id;
    const targetKey = String(targetId);

    // 1. Remove from persistent storage
    const stored = getStoredDiscounts();
    delete stored[targetKey];
    delete stored[String(id)];
    saveStoredDiscounts(stored);

    // 2. Deactivate backend promotion if exists
    try {
      const promosRes = await promotionApi.adminGetPromotions({ pageSize: 100 }).catch(() => null);
      const items = promosRes?.items || (Array.isArray(promosRes) ? promosRes : []);
      const existingPromo = items.find(p => {
        const rules = p.applicability || p.applicabilities || [];
        return rules.some(r => r.targetType === 'Product' && Number(r.targetId) === Number(targetId));
      });
      if (existingPromo?.id) {
        await promotionApi.adminDeactivatePromotion(existingPromo.id, 'Discount removed from dashboard').catch(() => {});
      }
    } catch (e) {
      console.warn('Backend promotion removal warning:', e.message);
    }

    // 3. Update memory catalog
    memoryCatalog = memoryCatalog.map(p => {
      if (String(p.id) === String(id) || String(p.numericId) === String(targetId) || p.slug === id) {
        const orig = p.originalPrice || p.price;
        return {
          ...p,
          hasDiscount: false,
          isOffer: false,
          discountPercent: 0,
          originalPrice: null,
          price: orig
        };
      }
      return p;
    });

    return { id: targetId, discountPercent: 0, hasDiscount: false };
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

