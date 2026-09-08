import apiClient from './client';
import ENDPOINTS from './endpoints';
import {
  normalizeFaq,
  normalizeFaqList,
  normalizeStaticPage,
  normalizeContact,
  normalizeContactList,
  normalizeObjectKeys
} from './normalizers';

/**
 * Arabian Sheikh - Content Management API Client
 * 
 * Provides API connectivity for:
 * 1. Admin FAQs (list, get, create, update, delete, toggle active)
 * 2. Admin Static Pages / Policies (list, get, update)
 * 3. Admin Contact Information (list, get, create, update, delete)
 * 4. Public Storefront Content (faqs, pages, contact)
 */
export const contentApi = {
  // ==========================================
  // 1. ADMIN FAQS
  // ==========================================

  /**
   * Admin: List FAQs with pagination
   * GET /api/admin/content/faqs?page=1&pageSize=20
   */
  async adminGetFaqs(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined && params.page !== null) {
      queryParams.append('page', params.page);
    }
    if (params.pageSize !== undefined && params.pageSize !== null) {
      queryParams.append('pageSize', params.pageSize);
    }

    const queryStr = queryParams.toString();
    const endpoint = queryStr ? `${ENDPOINTS.ADMIN.CONTENT.FAQS}?${queryStr}` : ENDPOINTS.ADMIN.CONTENT.FAQS;

    const response = await apiClient.get(endpoint);
    return normalizeFaqList(response);
  },

  /**
   * Admin: Get single FAQ details with all translations
   * GET /api/admin/content/faqs/{id}
   */
  async adminGetFaqById(id) {
    const targetId = Number(id);
    if (!targetId || isNaN(targetId)) throw new Error('Valid FAQ ID is required.');
    const response = await apiClient.get(ENDPOINTS.ADMIN.CONTENT.FAQ_DETAILS(targetId));
    return normalizeFaq(response);
  },

  /**
   * Admin: Create FAQ with translations
   * POST /api/admin/content/faqs
   * Body: { sortOrder: number, isActive: boolean, translations: [{ languageCode, question, answer }] }
   */
  async adminCreateFaq(payload) {
    const body = {
      sortOrder: Math.max(0, Number(payload.sortOrder) || 0),
      isActive: payload.isActive !== false,
      translations: Array.isArray(payload.translations)
        ? payload.translations.map(t => ({
            languageCode: String(t.languageCode || 'en').trim(),
            question: String(t.question || '').trim(),
            answer: String(t.answer || '').trim()
          }))
        : []
    };

    const response = await apiClient.post(ENDPOINTS.ADMIN.CONTENT.CREATE_FAQ, body);
    return normalizeFaq(response);
  },

  /**
   * Admin: Update FAQ with translations (replaces translations array)
   * PUT /api/admin/content/faqs/{id}
   */
  async adminUpdateFaq(id, payload) {
    const targetId = Number(id);
    if (!targetId || isNaN(targetId)) throw new Error('Valid FAQ ID is required.');

    const body = {
      sortOrder: Math.max(0, Number(payload.sortOrder) || 0),
      isActive: payload.isActive !== false,
      translations: Array.isArray(payload.translations)
        ? payload.translations.map(t => ({
            languageCode: String(t.languageCode || 'en').trim(),
            question: String(t.question || '').trim(),
            answer: String(t.answer || '').trim()
          }))
        : []
    };

    const response = await apiClient.put(ENDPOINTS.ADMIN.CONTENT.UPDATE_FAQ(targetId), body);
    return normalizeFaq(response);
  },

  /**
   * Admin: Toggle FAQ active status
   * PATCH /api/admin/content/faqs/{id}/active
   * Body: { isActive: boolean }
   */
  async adminSetFaqActive(id, isActive) {
    const targetId = Number(id);
    if (!targetId || isNaN(targetId)) throw new Error('Valid FAQ ID is required.');

    const response = await apiClient.patch(ENDPOINTS.ADMIN.CONTENT.SET_FAQ_ACTIVE(targetId), {
      isActive: Boolean(isActive)
    });
    return normalizeObjectKeys(response);
  },

  /**
   * Admin: Delete FAQ
   * DELETE /api/admin/content/faqs/{id}
   */
  async adminDeleteFaq(id) {
    const targetId = Number(id);
    if (!targetId || isNaN(targetId)) throw new Error('Valid FAQ ID is required.');

    await apiClient.delete(ENDPOINTS.ADMIN.CONTENT.DELETE_FAQ(targetId));
    return true;
  },

  // ==========================================
  // 2. ADMIN STATIC PAGES / POLICIES
  // ==========================================

  /**
   * Admin: List all system static pages
   * GET /api/admin/content/pages
   */
  async adminGetPages() {
    const response = await apiClient.get(ENDPOINTS.ADMIN.CONTENT.PAGES);
    const rawList = Array.isArray(response) ? response : [];
    return rawList.map(normalizeStaticPage).filter(Boolean);
  },

  /**
   * Admin: Get single static page details by slug
   * GET /api/admin/content/pages/{slug}
   */
  async adminGetPageBySlug(slug) {
    if (!slug) throw new Error('Valid page slug is required.');
    const response = await apiClient.get(ENDPOINTS.ADMIN.CONTENT.PAGE_DETAILS(slug));
    return normalizeStaticPage(response);
  },

  /**
   * Admin: Update static page translations & active status
   * PUT /api/admin/content/pages/{slug}
   */
  async adminUpdatePage(slug, payload) {
    if (!slug) throw new Error('Valid page slug is required.');

    const body = {
      isActive: payload.isActive !== false,
      translations: Array.isArray(payload.translations)
        ? payload.translations.map(t => ({
            languageCode: String(t.languageCode || 'en').trim(),
            title: String(t.title || '').trim(),
            content: String(t.content || '').trim()
          }))
        : []
    };

    const response = await apiClient.put(ENDPOINTS.ADMIN.CONTENT.UPDATE_PAGE(slug), body);
    return normalizeStaticPage(response);
  },

  // ==========================================
  // 3. ADMIN CONTACT INFORMATION
  // ==========================================

  /**
   * Admin: List all contact entries
   * GET /api/admin/content/contact
   */
  async adminGetContact() {
    const response = await apiClient.get(ENDPOINTS.ADMIN.CONTENT.CONTACT);
    return normalizeContactList(response);
  },

  /**
   * Admin: Get single contact item by ID
   * GET /api/admin/content/contact/{id}
   */
  async adminGetContactById(id) {
    const targetId = Number(id);
    if (!targetId || isNaN(targetId)) throw new Error('Valid contact ID is required.');
    const response = await apiClient.get(ENDPOINTS.ADMIN.CONTENT.CONTACT_DETAILS(targetId));
    return normalizeContact(response);
  },

  /**
   * Admin: Create new contact item
   * POST /api/admin/content/contact
   * Body: { type: 'Phone'|'Email'|'Address'|'Social', value: string, isActive: boolean }
   */
  async adminCreateContact(payload) {
    const body = {
      type: String(payload.type || 'Phone').trim(),
      value: String(payload.value || '').trim(),
      isActive: payload.isActive !== false
    };

    const response = await apiClient.post(ENDPOINTS.ADMIN.CONTENT.CREATE_CONTACT, body);
    return normalizeContact(response);
  },

  /**
   * Admin: Update contact item
   * PUT /api/admin/content/contact/{id}
   */
  async adminUpdateContact(id, payload) {
    const targetId = Number(id);
    if (!targetId || isNaN(targetId)) throw new Error('Valid contact ID is required.');

    const body = {
      type: String(payload.type || 'Phone').trim(),
      value: String(payload.value || '').trim(),
      isActive: payload.isActive !== false
    };

    const response = await apiClient.put(ENDPOINTS.ADMIN.CONTENT.UPDATE_CONTACT(targetId), body);
    return normalizeContact(response);
  },

  /**
   * Admin: Delete contact item
   * DELETE /api/admin/content/contact/{id}
   */
  async adminDeleteContact(id) {
    const targetId = Number(id);
    if (!targetId || isNaN(targetId)) throw new Error('Valid contact ID is required.');

    await apiClient.delete(ENDPOINTS.ADMIN.CONTENT.DELETE_CONTACT(targetId));
    return true;
  },

  // ==========================================
  // 4. PUBLIC STOREFRONT CONTENT
  // ==========================================

  /**
   * Public: List FAQs for requested language
   * GET /api/content/faqs?lang=en
   */
  async getPublicFaqs(lang = 'en') {
    const response = await apiClient.get(`${ENDPOINTS.CONTENT.FAQS}?lang=${encodeURIComponent(lang)}`);
    const rawList = Array.isArray(response) ? response : [];
    return rawList.map(item => {
      const norm = normalizeObjectKeys(item);
      return {
        id: Number(norm.id),
        question: norm.question || '',
        answer: norm.answer || ''
      };
    });
  },

  /**
   * Public: Get localized static page by slug
   * GET /api/content/pages/{slug}?lang=en
   */
  async getPublicPage(slug, lang = 'en') {
    if (!slug) return null;
    const response = await apiClient.get(`${ENDPOINTS.CONTENT.PAGE(slug)}?lang=${encodeURIComponent(lang)}`);
    const norm = normalizeObjectKeys(response);
    return {
      slug: norm.slug || slug,
      language: norm.language || lang,
      title: norm.title || '',
      content: norm.content || ''
    };
  },

  /**
   * Public: Get contact information
   * GET /api/content/contact
   */
  async getPublicContact() {
    const response = await apiClient.get(ENDPOINTS.CONTENT.CONTACT);
    const norm = normalizeObjectKeys(response);
    const rawItems = Array.isArray(norm?.items) ? norm.items : (Array.isArray(response) ? response : []);
    return rawItems.map(i => {
      const item = normalizeObjectKeys(i);
      return {
        type: item.type || 'Phone',
        value: item.value || ''
      };
    });
  }
};

export default contentApi;
