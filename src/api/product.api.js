import apiClient from './client';
import ENDPOINTS from './endpoints';
import { normalizeProduct, normalizeReview, toAbsoluteUrl } from './normalizers';

export const productApi = {
  // ==========================================
  // CUSTOMER STOREFRONT ENDPOINTS
  // ==========================================

  /**
   * Get Products with filtering & sorting
   * GET /api/products
   */
  async getProducts(filters = {}) {
    const params = {};

    // Map pagination (only positive integers)
    const page = Number(filters.page || filters.Page);
    if (!isNaN(page) && page > 0) params.Page = page;

    const pageSize = Number(filters.pageSize || filters.PageSize);
    if (!isNaN(pageSize) && pageSize > 0) params.PageSize = pageSize;

    // Search query (only non-empty strings)
    const search = (filters.search || filters.Search || '').toString().trim();
    if (search) params.Search = search;

    // Entity IDs (must be valid positive numbers)
    const brandId = Number(filters.brandId || filters.BrandId);
    if (!isNaN(brandId) && brandId > 0) params.BrandId = brandId;

    const categoryId = Number(filters.categoryId || filters.CategoryId);
    if (!isNaN(categoryId) && categoryId > 0) params.CategoryId = categoryId;

    const subcategoryId = Number(filters.subcategoryId || filters.SubcategoryId);
    if (!isNaN(subcategoryId) && subcategoryId > 0) params.SubcategoryId = subcategoryId;

    const perfumeCategoryId = Number(filters.perfumeCategoryId || filters.PerfumeCategoryId);
    if (!isNaN(perfumeCategoryId) && perfumeCategoryId > 0) params.PerfumeCategoryId = perfumeCategoryId;

    // Gender enum: STRICTLY 'Male' | 'Female' | 'Unisex'.
    const rawGender = (filters.gender || filters.Gender || '').toString().toLowerCase().trim();
    if (rawGender === 'men' || rawGender === 'male') params.Gender = 'Male';
    else if (rawGender === 'women' || rawGender === 'female') params.Gender = 'Female';
    else if (rawGender === 'unisex') params.Gender = 'Unisex';

    // Language
    const activeLang = (filters.language || filters.Language || (typeof window !== 'undefined' ? localStorage.getItem('arabian_sheikh_lang') : 'en') || 'en').toString().trim();
    params.Language = activeLang.toLowerCase();

    const response = await apiClient.get(ENDPOINTS.PRODUCTS.LIST, { params, requiresAuth: false });
    const rawList = Array.isArray(response) 
      ? response 
      : (response?.items || response?.products || response?.data || (response && typeof response === 'object' && !response.items ? [response] : []));
    
    return {
      items: rawList.map(normalizeProduct).filter(Boolean),
      page: response?.page || 1,
      pageSize: response?.pageSize || 20,
      totalCount: response?.totalCount || rawList.length,
      totalPages: response?.totalPages || 1,
      hasPreviousPage: Boolean(response?.hasPreviousPage),
      hasNextPage: Boolean(response?.hasNextPage)
    };
  },

  /**
   * Get Product Details
   * GET /api/products/{id}
   */
  async getProductById(id, language) {
    const activeLang = language || (typeof window !== 'undefined' ? localStorage.getItem('arabian_sheikh_lang') : 'en') || 'en';
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.DETAILS(id), { params: { language: activeLang }, requiresAuth: false });
    const rawProduct = response?.product || response?.data || response;
    return normalizeProduct(rawProduct);
  },

  /**
   * Get Home Page Data
   * GET /api/home
   */
  async getHome(language) {
    const activeLang = language || (typeof window !== 'undefined' ? localStorage.getItem('arabian_sheikh_lang') : 'en') || 'en';
    const response = await apiClient.get(ENDPOINTS.HOME, { params: { language: activeLang }, requiresAuth: false });
    return response;
  },

  /**
   * Get Categories
   * GET /api/categories
   */
  async getCategories(language) {
    const activeLang = language || (typeof window !== 'undefined' ? localStorage.getItem('arabian_sheikh_lang') : 'en') || 'en';
    const response = await apiClient.get(ENDPOINTS.CATEGORIES.LIST, { params: { language: activeLang }, requiresAuth: false });
    return response?.items || (Array.isArray(response) ? response : []);
  },

  /**
   * Get Brands
   * GET /api/brands
   */
  async getBrands(language = 'en') {
    const response = await apiClient.get(ENDPOINTS.BRANDS.LIST, { params: { language }, requiresAuth: false });
    return response?.items || (Array.isArray(response) ? response : []);
  },

  /**
   * Get Product Reviews
   * GET /api/products/{productId}/reviews
   */
  async getReviews(productId, params = {}) {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.REVIEWS(productId), { params, requiresAuth: false });
    const rawList = response?.items || (Array.isArray(response) ? response : []);
    return rawList.map(normalizeReview);
  },

  /**
   * Add Product Review (Customer Auth Required)
   * POST /api/products/{productId}/reviews
   */
  async addReview(productId, { rating, comment, orderId }) {
    const response = await apiClient.post(ENDPOINTS.PRODUCTS.CREATE_REVIEW(productId), {
      productId: Number(productId),
      rating: Number(rating),
      comment,
      orderId: orderId ? Number(orderId) : null
    });
    return normalizeReview(response);
  },

  // ==========================================
  // ADMIN BACK-OFFICE ENDPOINTS
  // ==========================================

  /**
   * Admin: List all products (with pagination & internal filters)
   * GET /api/admin/products
   */
  async adminGetProducts(filters = {}) {
    const params = {};
    const page = Number(filters.page || filters.Page);
    if (!isNaN(page) && page > 0) params.Page = page;

    const pageSize = Number(filters.pageSize || filters.PageSize);
    if (!isNaN(pageSize) && pageSize > 0) params.PageSize = pageSize;

    const search = (filters.search || filters.Search || '').toString().trim();
    if (search) params.Search = search;

    const brandId = Number(filters.brandId || filters.BrandId);
    if (!isNaN(brandId) && brandId > 0) params.BrandId = brandId;

    const categoryId = Number(filters.categoryId || filters.CategoryId);
    if (!isNaN(categoryId) && categoryId > 0) params.CategoryId = categoryId;

    const subcategoryId = Number(filters.subcategoryId || filters.SubcategoryId);
    if (!isNaN(subcategoryId) && subcategoryId > 0) params.SubcategoryId = subcategoryId;

    const perfumeCategoryId = Number(filters.perfumeCategoryId || filters.PerfumeCategoryId);
    if (!isNaN(perfumeCategoryId) && perfumeCategoryId > 0) params.PerfumeCategoryId = perfumeCategoryId;

    if (filters.isActive !== undefined && filters.isActive !== null && filters.isActive !== '') {
      params.IsActive = Boolean(filters.isActive);
    }

    const rawSort = (filters.sortBy || filters.SortBy || '').toString().toLowerCase();
    if (rawSort.includes('price')) {
      params.SortBy = 'price';
      params.SortDirection = rawSort === 'price-high' || rawSort === 'desc' ? 'desc' : 'asc';
    } else if (rawSort.includes('rating')) {
      params.SortBy = 'rating';
      params.SortDirection = 'desc';
    }

    const lang = (filters.language || filters.Language || '').toString().trim();
    if (lang) params.Language = lang;

    const response = await apiClient.get(ENDPOINTS.ADMIN.PRODUCTS.LIST, { params });
    const rawList = Array.isArray(response)
      ? response
      : (response?.items || response?.products || response?.data || (response && typeof response === 'object' && !response.items ? [response] : []));

    return {
      items: rawList.map(normalizeProduct).filter(Boolean),
      totalCount: response?.totalCount || rawList.length,
      page: response?.page || 1,
      pageSize: response?.pageSize || 20,
      totalPages: response?.totalPages || 1,
      hasPreviousPage: Boolean(response?.hasPreviousPage),
      hasNextPage: Boolean(response?.hasNextPage)
    };
  },

  /**
   * Admin: Create product
   * POST /api/admin/products
   * Note: If Perfume, perfumeCategoryId is required and price is omitted.
   * If non-perfume, price is required and perfumeCategoryId is omitted.
   */
  async adminCreateProduct(payload) {
    const isPerfume = Boolean(payload.perfumeCategoryId || payload.category === 'perfumes' || Number(payload.categoryId) === 1);
    
    // Build translations array required by ASP.NET
    const translations = Array.isArray(payload.translations) && payload.translations.length > 0
      ? payload.translations
      : [
          {
            languageCode: 'En',
            name: payload.name || 'Imperial Extrait',
            description: payload.description || payload.tagline || 'Haute Parfumerie Creation',
            ingredients: payload.ingredients || 'Rare Oud, Amber Crystals, Taif Rose, White Musk'
          },
          {
            languageCode: 'Ar',
            name: payload.arabicName || payload.name || 'عطر ملكي فاخر',
            description: payload.arabicDescription || payload.description || 'عطر شرقي ملكي فاخر',
            ingredients: payload.ingredients || 'دهن عود كمبودي، ورد طائفي، عنبر فاخر، مسك أبيض'
          }
        ];

    const body = {
      brandId: Number(payload.brandId) || 1,
      categoryId: Number(payload.categoryId) || (isPerfume ? 1 : 2),
      subcategoryId: payload.subcategoryId ? Number(payload.subcategoryId) : null,
      gender: payload.gender === 'Female' ? 'Female' : (payload.gender === 'Male' ? 'Male' : 'Unisex'),
      nameIsTranslatable: true,
      isActive: payload.isActive !== false,
      imageUrl: toAbsoluteUrl(payload.imageUrl || payload.image || (Array.isArray(payload.images) ? payload.images[0] : '/products/luxury_designs/07_arabian_gold.webp')),
      translations
    };

    if (isPerfume) {
      body.perfumeCategoryId = Number(payload.perfumeCategoryId) || 1;
    } else {
      body.price = Number(payload.price) || 0;
    }

    const response = await apiClient.post(ENDPOINTS.ADMIN.PRODUCTS.CREATE, body);
    return normalizeProduct(response);
  },

  /**
   * Admin: Update product
   * PUT /api/admin/products/{id}
   */
  async adminUpdateProduct(id, payload) {
    const isPerfume = Boolean(payload.perfumeCategoryId || payload.category === 'perfumes' || Number(payload.categoryId) === 1);
    const body = {
      brandId: Number(payload.brandId) || 1,
      categoryId: Number(payload.categoryId) || (isPerfume ? 1 : 2),
      subcategoryId: payload.subcategoryId ? Number(payload.subcategoryId) : null,
      gender: payload.gender === 'Female' ? 'Female' : (payload.gender === 'Male' ? 'Male' : 'Unisex'),
      nameIsTranslatable: true,
      isActive: payload.isActive !== false,
      imageUrl: toAbsoluteUrl(payload.imageUrl || payload.image || (Array.isArray(payload.images) ? payload.images[0] : '/products/luxury_designs/07_arabian_gold.webp'))
    };

    if (isPerfume) {
      body.perfumeCategoryId = Number(payload.perfumeCategoryId) || 1;
    } else {
      body.price = Number(payload.price) || 0;
    }

    const response = await apiClient.put(ENDPOINTS.ADMIN.PRODUCTS.UPDATE(id), body);
    
    // Update translations across all supported languages (En, Bg, Ar, Es) so edits persist permanently across all locales on refresh
    if (payload.name || payload.description || payload.ingredients) {
      const transBody = {
        name: payload.name || 'Imperial Extrait',
        description: payload.description || 'Haute Parfumerie Creation',
        ingredients: payload.ingredients || 'Rare Oud, Amber Crystals, Taif Rose'
      };
      await Promise.allSettled([
        apiClient.put(ENDPOINTS.ADMIN.PRODUCTS.UPSERT_TRANSLATION(id, 'En'), transBody),
        apiClient.put(ENDPOINTS.ADMIN.PRODUCTS.UPSERT_TRANSLATION(id, 'Bg'), transBody),
        apiClient.put(ENDPOINTS.ADMIN.PRODUCTS.UPSERT_TRANSLATION(id, 'Ar'), transBody),
        apiClient.put(ENDPOINTS.ADMIN.PRODUCTS.UPSERT_TRANSLATION(id, 'Es'), transBody)
      ]);
    }

    return normalizeProduct(response);
  },

  /**
   * Admin: Activate product
   * PUT /api/admin/products/{id} with isActive: true
   */
  async adminActivateProduct(id, currentProduct = {}) {
    return await this.adminUpdateProduct(id, { ...currentProduct, isActive: true });
  },

  /**
   * Admin: Deactivate product
   * PUT /api/admin/products/{id} with isActive: false
   */
  async adminDeactivateProduct(id, currentProduct = {}) {
    return await this.adminUpdateProduct(id, { ...currentProduct, isActive: false });
  },

  /**
   * Admin: Delete or archive product
   * DELETE /api/admin/products/{id}
   */
  async adminDeleteProduct(id) {
    return await apiClient.delete(ENDPOINTS.ADMIN.PRODUCTS.DELETE(id));
  },

  /**
   * Admin: Upload product image
   * POST /api/admin/products/{id}/image
   */
  async adminUploadImage(id, file) {
    const formData = new FormData();
    formData.append('file', file);
    return await apiClient.upload(ENDPOINTS.ADMIN.PRODUCTS.UPLOAD_IMAGE(id), formData);
  },

  /**
   * Admin: Upsert product translation
   * PUT /api/admin/products/{productId}/translations/{languageCode}
   */
  async adminUpsertTranslation(productId, languageCode, translation) {
    return await apiClient.put(
      ENDPOINTS.ADMIN.PRODUCTS.UPSERT_TRANSLATION(productId, languageCode),
      translation
    );
  },

  /**
   * Admin: Get product by ID
   * GET /api/admin/products/{id}
   */
  async adminGetProductById(id) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.PRODUCTS.DETAILS(id));
    return normalizeProduct(response);
  },

  /**
   * Admin: Upload product images
   * POST /api/admin/products/images
   */
  async adminUploadProductImages(files) {
    const formData = new FormData();
    if (Array.isArray(files)) {
      files.forEach(f => formData.append('files', f));
    } else {
      formData.append('file', files);
    }
    return await apiClient.upload(ENDPOINTS.ADMIN.PRODUCTS.IMAGES, formData);
  },

  /**
   * Admin: Delete product translation
   * DELETE /api/admin/products/{productId}/translations/{languageCode}
   */
  async adminDeleteTranslation(productId, languageCode) {
    return await apiClient.delete(
      ENDPOINTS.ADMIN.PRODUCTS.DELETE_TRANSLATION(productId, languageCode)
    );
  },

  // ==========================================
  // ADMIN CATEGORIES
  // ==========================================
  async adminGetCategories(params = {}) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.CATEGORIES.LIST, { params });
    return response?.items || (Array.isArray(response) ? response : []);
  },

  async adminCreateCategory(payload) {
    return await apiClient.post(ENDPOINTS.ADMIN.CATEGORIES.CREATE, payload);
  },

  async adminGetCategoryById(id) {
    return await apiClient.get(ENDPOINTS.ADMIN.CATEGORIES.DETAILS(id));
  },

  async adminUpdateCategory(id, payload) {
    return await apiClient.put(ENDPOINTS.ADMIN.CATEGORIES.UPDATE(id), payload);
  },

  async adminDeleteCategory(id) {
    return await apiClient.delete(ENDPOINTS.ADMIN.CATEGORIES.DELETE(id));
  },

  async adminUpdateCategoryTranslation(id, languageCode, payload) {
    return await apiClient.put(ENDPOINTS.ADMIN.CATEGORIES.UPDATE_TRANSLATION(id, languageCode), payload);
  },

  async adminDeleteCategoryTranslation(id, languageCode) {
    return await apiClient.delete(ENDPOINTS.ADMIN.CATEGORIES.DELETE_TRANSLATION(id, languageCode));
  },

  // ==========================================
  // ADMIN PERFUME CATEGORIES
  // ==========================================
  async adminGetPerfumeCategories(params = {}) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.PERFUME_CATEGORIES.LIST, { params });
    return response?.items || (Array.isArray(response) ? response : []);
  },

  async adminCreatePerfumeCategory(payload) {
    return await apiClient.post(ENDPOINTS.ADMIN.PERFUME_CATEGORIES.CREATE, payload);
  },

  async adminGetPerfumeCategoryById(id) {
    return await apiClient.get(ENDPOINTS.ADMIN.PERFUME_CATEGORIES.DETAILS(id));
  },

  async adminUpdatePerfumeCategory(id, payload) {
    return await apiClient.put(ENDPOINTS.ADMIN.PERFUME_CATEGORIES.UPDATE(id), payload);
  },

  async adminDeletePerfumeCategory(id) {
    return await apiClient.delete(ENDPOINTS.ADMIN.PERFUME_CATEGORIES.DELETE(id));
  },

  // ==========================================
  // ADMIN SUBCATEGORIES
  // ==========================================
  async adminGetSubcategories(params = {}) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.SUBCATEGORIES.LIST, { params });
    return response?.items || (Array.isArray(response) ? response : []);
  },

  async adminCreateSubcategory(payload) {
    return await apiClient.post(ENDPOINTS.ADMIN.SUBCATEGORIES.CREATE, payload);
  },

  async adminGetSubcategoryById(id) {
    return await apiClient.get(ENDPOINTS.ADMIN.SUBCATEGORIES.DETAILS(id));
  },

  async adminUpdateSubcategory(id, payload) {
    return await apiClient.put(ENDPOINTS.ADMIN.SUBCATEGORIES.UPDATE(id), payload);
  },

  async adminDeleteSubcategory(id) {
    return await apiClient.delete(ENDPOINTS.ADMIN.SUBCATEGORIES.DELETE(id));
  },

  // ==========================================
  // ADMIN BRANDS
  // ==========================================
  async adminGetBrands(params = {}) {
    const response = await apiClient.get(ENDPOINTS.ADMIN.BRANDS.LIST, { params });
    return response?.items || (Array.isArray(response) ? response : []);
  },

  async adminCreateBrand(payload) {
    return await apiClient.post(ENDPOINTS.ADMIN.BRANDS.CREATE, payload);
  },

  async adminGetBrandById(id) {
    return await apiClient.get(ENDPOINTS.ADMIN.BRANDS.DETAILS(id));
  },

  async adminUpdateBrand(id, payload) {
    return await apiClient.put(ENDPOINTS.ADMIN.BRANDS.UPDATE(id), payload);
  },

  async adminDeleteBrand(id) {
    return await apiClient.delete(ENDPOINTS.ADMIN.BRANDS.DELETE(id));
  },

  async adminUpdateBrandTranslation(id, languageCode, payload) {
    return await apiClient.put(ENDPOINTS.ADMIN.BRANDS.UPDATE_TRANSLATION(id, languageCode), payload);
  }
};

export default productApi;
