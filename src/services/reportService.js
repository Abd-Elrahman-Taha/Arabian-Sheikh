import { reportApi } from '../api/report.api';

/**
 * Admin Sales Reports Service
 * Orchestrates financial overview, multi-dimensional breakdowns (products, categories, countries),
 * and binary exports (ZIP CSV, XLSX, PDF).
 */
export const reportService = {
  /**
   * Fetch Sales Overview KPIs
   * @param {object} params
   */
  async getSalesReport(params = {}) {
    try {
      return await reportApi.getSalesReport(params);
    } catch (err) {
      if (err.code === 'UNSUPPORTED_REPORT_CURRENCY' || err.status === 422) {
        throw new Error('Sales reports support EUR only; the selected date range contains orders in another currency.');
      }
      throw err;
    }
  },

  /**
   * Fetch Sales by Product (Paginated & Sortable)
   * @param {object} params
   */
  async getSalesByProduct(params = {}) {
    try {
      return await reportApi.getSalesByProduct(params);
    } catch (err) {
      if (err.code === 'UNSUPPORTED_REPORT_CURRENCY' || err.status === 422) {
        throw new Error('Sales products report supports EUR only; the selected range contains orders in another currency.');
      }
      throw err;
    }
  },

  /**
   * Fetch Sales by Category (Unpaginated)
   * @param {object} params
   */
  async getSalesByCategory(params = {}) {
    try {
      return await reportApi.getSalesByCategory(params);
    } catch (err) {
      if (err.code === 'UNSUPPORTED_REPORT_CURRENCY' || err.status === 422) {
        throw new Error('Sales categories report supports EUR only; the selected range contains orders in another currency.');
      }
      throw err;
    }
  },

  /**
   * Fetch Sales by Country (Unpaginated)
   * @param {object} params
   */
  async getSalesByCountry(params = {}) {
    try {
      return await reportApi.getSalesByCountry(params);
    } catch (err) {
      if (err.code === 'UNSUPPORTED_REPORT_CURRENCY' || err.status === 422) {
        throw new Error('Sales country report supports EUR only; the selected range contains orders in another currency.');
      }
      throw err;
    }
  },

  /**
   * Download Export File
   * @param {object} params { format: 'csv'|'xlsx'|'pdf', from, to }
   */
  async downloadExport(params = {}) {
    try {
      return await reportApi.downloadSalesExport(params);
    } catch (err) {
      if (err.code === 'UNSUPPORTED_REPORT_CURRENCY' || err.status === 422) {
        throw new Error('Sales export supports EUR only; the selected range contains orders in another currency.');
      }
      throw err;
    }
  },

  /**
   * Format Euro currency
   * @param {number} amount 
   */
  formatEur(amount) {
    const val = Number(amount) || 0;
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  },

  /**
   * Computes client-side UTC date range strings (yyyy-MM-dd) for export and custom picker defaults
   */
  getPresetDates(preset = 'monthly') {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const toYmd = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

    if (preset === 'weekly') {
      // Monday of current week
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const day = d.getUTCDay();
      const diffToMon = (day === 0 ? -6 : 1) - day;
      d.setUTCDate(d.getUTCDate() + diffToMon);
      const from = toYmd(d);

      // Next Monday
      d.setUTCDate(d.getUTCDate() + 7);
      const to = toYmd(d);
      return { from, to };
    }

    if (preset === 'quarterly') {
      const qMonth = Math.floor(now.getUTCMonth() / 3) * 3;
      const fromDate = new Date(Date.UTC(now.getUTCFullYear(), qMonth, 1));
      const toDate = new Date(Date.UTC(now.getUTCFullYear(), qMonth + 3, 1));
      return { from: toYmd(fromDate), to: toYmd(toDate) };
    }

    if (preset === 'last30Days') {
      const toDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
      const fromDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 30));
      return { from: toYmd(fromDate), to: toYmd(toDate) };
    }

    // Default: monthly (First of current month to first of next month)
    const fromDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const toDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    return { from: toYmd(fromDate), to: toYmd(toDate) };
  }
};

export default reportService;
