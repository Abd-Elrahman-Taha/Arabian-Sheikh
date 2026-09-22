import { contentApi } from '../api/content.api';

/**
 * Arabian Sheikh - Content Management Service
 * 
 * Business logic, validation, error normalization, and caching for:
 * - FAQs
 * - Static Pages / Policies
 * - Contact Information
 * - Public Storefront Content
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'bg', label: 'Bulgarian', flag: '🇧🇬' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' }
];

export const CONTACT_TYPES = ['Phone', 'Email', 'Address', 'Social'];

export const PREDEFINED_SYSTEM_PAGES = [
  {
    slug: 'privacy-policy',
    defaultTitle: 'Privacy Policy',
    description: 'Data protection, privacy rights, and personal information handling principles.'
  },
  {
    slug: 'terms-and-conditions',
    defaultTitle: 'Terms & Conditions',
    description: 'Terms of service, boutique policies, order rules, and patron responsibilities.'
  },
  {
    slug: 'shipping-policy',
    defaultTitle: 'Shipping & Delivery Policy',
    description: 'Royal Express delivery timelines, worldwide courier dispatches, and rates.'
  },
  {
    slug: 'returns-policy',
    defaultTitle: 'Returns & Refunds Policy',
    description: '30-day Royal Privilege, specimen testing terms, and refund guidelines.'
  }
];

export const contentService = {
  // ==========================================
  // 1. FAQS
  // ==========================================

  validateFaq(payload) {
    if (payload.sortOrder !== undefined && Number(payload.sortOrder) < 0) {
      throw new Error('Sort order must be greater than or equal to 0.');
    }

    const translations = Array.isArray(payload.translations) ? payload.translations : [];
    if (translations.length === 0) {
      throw new Error('At least one language translation is required for this FAQ.');
    }

    const validCodes = ['en', 'bg', 'es'];
    const seenLanguages = new Set();

    for (const t of translations) {
      const code = String(t.languageCode || '').toLowerCase().trim();
      if (!code || !validCodes.includes(code)) {
        throw new Error(`Language code must be 'en', 'bg', or 'es'. Found: '${t.languageCode}'`);
      }

      if (seenLanguages.has(code)) {
        throw new Error(`Duplicate translation found for language '${code}'. Each language can only appear once.`);
      }
      seenLanguages.add(code);

      const q = String(t.question || '').trim();
      const a = String(t.answer || '').trim();

      if (!q) {
        throw new Error(`Question is required for [${code.toUpperCase()}] translation.`);
      }
      if (q.length > 500) {
        throw new Error(`Question for [${code.toUpperCase()}] exceeds maximum length of 500 characters.`);
      }

      if (!a) {
        throw new Error(`Answer is required for [${code.toUpperCase()}] translation.`);
      }
      if (a.length > 2000) {
        throw new Error(`Answer for [${code.toUpperCase()}] exceeds maximum length of 2000 characters.`);
      }
    }

    return true;
  },

  async getAdminFaqs(params = {}) {
    try {
      return await contentApi.adminGetFaqs(params);
    } catch (err) {
      this.handleApiError(err, 'Failed to fetch FAQs.');
    }
  },

  async getAdminFaqById(id) {
    try {
      return await contentApi.adminGetFaqById(id);
    } catch (err) {
      this.handleApiError(err, 'Failed to fetch FAQ details.');
    }
  },

  async createFaq(payload) {
    this.validateFaq(payload);
    try {
      return await contentApi.adminCreateFaq(payload);
    } catch (err) {
      this.handleApiError(err, 'Failed to create FAQ.');
    }
  },

  async updateFaq(id, payload) {
    this.validateFaq(payload);
    try {
      return await contentApi.adminUpdateFaq(id, payload);
    } catch (err) {
      this.handleApiError(err, 'Failed to update FAQ.');
    }
  },

  async toggleFaqActive(id, isActive) {
    try {
      return await contentApi.adminSetFaqActive(id, isActive);
    } catch (err) {
      this.handleApiError(err, 'Failed to update FAQ status.');
    }
  },

  async deleteFaq(id) {
    try {
      return await contentApi.adminDeleteFaq(id);
    } catch (err) {
      this.handleApiError(err, 'Failed to delete FAQ.');
    }
  },

  // ==========================================
  // 2. STATIC PAGES / POLICIES
  // ==========================================

  validatePage(payload) {
    const translations = Array.isArray(payload.translations) ? payload.translations : [];
    if (translations.length === 0) {
      throw new Error('At least one language translation is required for this policy page.');
    }

    const validCodes = ['en', 'bg', 'es'];
    const seenLanguages = new Set();

    for (const t of translations) {
      const code = String(t.languageCode || '').toLowerCase().trim();
      if (!code || !validCodes.includes(code)) {
        throw new Error(`Language code must be 'en', 'bg', or 'es'. Found: '${t.languageCode}'`);
      }

      if (seenLanguages.has(code)) {
        throw new Error(`Duplicate translation found for language '${code}'.`);
      }
      seenLanguages.add(code);

      const title = String(t.title || '').trim();
      const content = String(t.content || '').trim();

      if (!title) {
        throw new Error(`Title is required for [${code.toUpperCase()}] translation.`);
      }
      if (title.length > 200) {
        throw new Error(`Title for [${code.toUpperCase()}] exceeds maximum length of 200 characters.`);
      }

      if (!content) {
        throw new Error(`Content is required for [${code.toUpperCase()}] translation.`);
      }
    }

    return true;
  },

  async getAdminPages() {
    try {
      const pages = await contentApi.adminGetPages();
      // Ensure all 4 predefined system pages exist in presentation
      const existingSlugs = new Set(pages.map(p => p.slug));
      const completeList = [...pages];

      for (const predefined of PREDEFINED_SYSTEM_PAGES) {
        if (!existingSlugs.has(predefined.slug)) {
          completeList.push({
            slug: predefined.slug,
            isActive: true,
            translations: [
              { languageCode: 'en', title: predefined.defaultTitle, content: '' }
            ],
            title: predefined.defaultTitle,
            content: '',
            availableLanguages: ['en'],
            description: predefined.description
          });
        }
      }

      return completeList;
    } catch (err) {
      this.handleApiError(err, 'Failed to fetch static policy pages.');
    }
  },

  async getAdminPageBySlug(slug) {
    try {
      return await contentApi.adminGetPageBySlug(slug);
    } catch (err) {
      this.handleApiError(err, 'Failed to fetch policy page details.');
    }
  },

  async updatePage(slug, payload) {
    this.validatePage(payload);
    try {
      return await contentApi.adminUpdatePage(slug, payload);
    } catch (err) {
      this.handleApiError(err, 'Failed to update policy page.');
    }
  },

  // ==========================================
  // 3. CONTACT INFORMATION
  // ==========================================

  validateContact(payload) {
    const type = String(payload.type || '').trim();
    if (!CONTACT_TYPES.includes(type)) {
      throw new Error(`Contact type must be one of: ${CONTACT_TYPES.join(', ')}.`);
    }

    const val = String(payload.value || '').trim();
    if (!val) {
      throw new Error('Contact value is required.');
    }
    if (val.length > 500) {
      throw new Error('Contact value exceeds maximum length of 500 characters.');
    }

    if (type === 'Email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        throw new Error('Please provide a valid email address (e.g. concierge@arabiansheikh.com).');
      }
    }

    if (type === 'Social') {
      try {
        const parsed = new URL(val);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          throw new Error('Social media link must begin with http:// or https://');
        }
      } catch {
        throw new Error('Social media link must be a valid absolute URL (e.g. https://instagram.com/arabiansheikh).');
      }
    }

    return true;
  },

  async getAdminContact() {
    try {
      const data = await contentApi.adminGetContact();
      if (Array.isArray(data) && data.length > 0) {
        try {
          localStorage.setItem('arabian_sheikh_public_contacts', JSON.stringify(data));
        } catch (_) {}
      }
      return data;
    } catch (err) {
      this.handleApiError(err, 'Failed to fetch contact information.');
    }
  },

  async getAdminContactById(id) {
    try {
      return await contentApi.adminGetContactById(id);
    } catch (err) {
      this.handleApiError(err, 'Failed to fetch contact item.');
    }
  },

  async createContact(payload) {
    this.validateContact(payload);
    try {
      return await contentApi.adminCreateContact(payload);
    } catch (err) {
      this.handleApiError(err, 'Failed to create contact item.');
    }
  },

  async updateContact(id, payload) {
    this.validateContact(payload);
    try {
      return await contentApi.adminUpdateContact(id, payload);
    } catch (err) {
      this.handleApiError(err, 'Failed to update contact item.');
    }
  },

  async deleteContact(id) {
    try {
      return await contentApi.adminDeleteContact(id);
    } catch (err) {
      this.handleApiError(err, 'Failed to delete contact item.');
    }
  },

  // ==========================================
  // 4. PUBLIC STOREFRONT CONTENT
  // ==========================================

  async getPublicFaqs(lang = 'en') {
    try {
      return await contentApi.getPublicFaqs(lang);
    } catch (err) {
      console.warn('Public FAQs fallback:', err.message);
      return [];
    }
  },

  async getPublicPage(slug, lang = 'en') {
    try {
      return await contentApi.getPublicPage(slug, lang);
    } catch (err) {
      console.warn(`Public page [${slug}] fallback:`, err.message);
      return null;
    }
  },

  async getPublicContact() {
    try {
      const items = await contentApi.getPublicContact();
      if (Array.isArray(items) && items.length > 0) {
        try {
          localStorage.setItem('arabian_sheikh_public_contacts', JSON.stringify(items));
        } catch (_) {}
        return items;
      }
      try {
        const cached = localStorage.getItem('arabian_sheikh_public_contacts');
        if (cached) return JSON.parse(cached);
      } catch (_) {}
      return [];
    } catch (err) {
      console.warn('Public contact fallback:', err.message);
      try {
        const cached = localStorage.getItem('arabian_sheikh_public_contacts');
        if (cached) return JSON.parse(cached);
      } catch (_) {}
      return [];
    }
  },

  // ==========================================
  // 5. ERROR PARSING
  // ==========================================

  handleApiError(err, fallbackMessage = 'Operation failed.') {
    const status = err.status || err.response?.status;
    const data = err.data || err.response?.data;
    const code = data?.code || '';
    const msg = data?.message || err.message || fallbackMessage;

    // Field-specific validation errors
    if (data?.errors && typeof data.errors === 'object') {
      const errorKeys = Object.keys(data.errors);
      if (errorKeys.length > 0) {
        const firstKey = errorKeys[0];
        const val = data.errors[firstKey];
        const firstMsg = Array.isArray(val) ? val[0] : val;
        const validationErr = new Error(firstMsg || msg);
        validationErr.status = status || 400;
        validationErr.code = code || 'VALIDATION_ERROR';
        validationErr.errors = data.errors;
        throw validationErr;
      }
    }

    if (code === 'FAQ_NOT_FOUND' || (status === 404 && msg.toLowerCase().includes('faq'))) {
      const notFound = new Error('The requested FAQ could not be found. The list has been refreshed.');
      notFound.status = 404;
      notFound.code = 'FAQ_NOT_FOUND';
      throw notFound;
    }

    if (code === 'STATIC_PAGE_NOT_FOUND' || (status === 404 && msg.toLowerCase().includes('page'))) {
      const notFound = new Error('The requested static policy page could not be found.');
      notFound.status = 404;
      notFound.code = 'STATIC_PAGE_NOT_FOUND';
      throw notFound;
    }

    if (code === 'CONTACT_INFO_NOT_FOUND' || (status === 404 && msg.toLowerCase().includes('contact'))) {
      const notFound = new Error('The requested contact entry could not be found.');
      notFound.status = 404;
      notFound.code = 'CONTACT_INFO_NOT_FOUND';
      throw notFound;
    }

    if (status === 403 || code === 'FORBIDDEN') {
      const forbidden = new Error('You do not have administrative permission to modify site content.');
      forbidden.status = 403;
      throw forbidden;
    }

    if (status === 401 || code === 'UNAUTHORIZED') {
      const authErr = new Error('Your administrative session has expired. Please sign in again.');
      authErr.status = 401;
      throw authErr;
    }

    const finalErr = new Error(msg);
    finalErr.status = status;
    finalErr.code = code;
    throw finalErr;
  }
};

export default contentService;
