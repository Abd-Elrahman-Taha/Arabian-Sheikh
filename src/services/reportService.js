import { reportApi } from '../api/report.api';
import { orderService } from './orderService';
import { productService } from './productService';
import { categoryApi } from '../api/category.api';

/**
 * Country name to ISO Alpha-2 code helper
 */
function toIsoCountry(country) {
  if (!country) return 'ES';
  const c = String(country).trim().toUpperCase();
  if (c.length === 2) return c;
  const map = {
    'SPAIN': 'ES',
    'ESPANA': 'ES',
    'ESPAÑA': 'ES',
    'UNITED ARAB EMIRATES': 'AE',
    'UAE': 'AE',
    'DUBAI': 'AE',
    'SAUDI ARABIA': 'SA',
    'KSA': 'SA',
    'KUWAIT': 'KW',
    'QATAR': 'QA',
    'BAHRAIN': 'BH',
    'OMAN': 'OM',
    'UNITED KINGDOM': 'GB',
    'UK': 'GB',
    'GREAT BRITAIN': 'GB',
    'ENGLAND': 'GB',
    'UNITED STATES': 'US',
    'USA': 'US',
    'FRANCE': 'FR',
    'GERMANY': 'DE',
    'ITALY': 'IT',
    'SWITZERLAND': 'CH',
    'EGYPT': 'EG'
  };
  return map[c] || c.slice(0, 2);
}

/**
 * Trigger client-side file download
 */
function downloadBlob(blob, filename) {
  if (typeof window === 'undefined') return;
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
}

/**
 * Admin Sales Reports Service
 * Orchestrates financial overview, multi-dimensional breakdowns (products, categories, countries),
 * and binary exports with graceful automatic database aggregation fallbacks.
 */
export const reportService = {
  /**
   * Fetch Sales Overview KPIs
   * GET /api/admin/reports/sales with automatic live order aggregation fallback
   * @param {object} params
   */
  async getSalesReport(params = {}) {
    try {
      const data = await reportApi.getSalesReport(params);
      if (data && typeof data === 'object') {
        return { ...data, isLiveEndpoint: true };
      }
    } catch (err) {
      if (err.code === 'UNSUPPORTED_REPORT_CURRENCY' || err.status === 422) {
        throw new Error('Sales reports support EUR only; the selected date range contains orders in another currency.');
      }
      console.warn('reportApi.getSalesReport endpoint error, aggregating from live order database:', err.message);
    }

    return await this.computeSalesReportFallback(params);
  },

  /**
   * Fetch Sales by Product (Paginated & Sortable)
   * GET /api/admin/reports/sales/products with live order aggregation fallback
   * @param {object} params
   */
  async getSalesByProduct(params = {}) {
    try {
      const data = await reportApi.getSalesByProduct(params);
      if (data && typeof data === 'object' && Array.isArray(data.items)) {
        return { ...data, isLiveEndpoint: true };
      }
    } catch (err) {
      if (err.code === 'UNSUPPORTED_REPORT_CURRENCY' || err.status === 422) {
        throw new Error('Sales products report supports EUR only; the selected range contains orders in another currency.');
      }
      console.warn('reportApi.getSalesByProduct endpoint error, aggregating from live database:', err.message);
    }

    return await this.computeSalesProductsFallback(params);
  },

  /**
   * Fetch Sales by Category (Unpaginated)
   * GET /api/admin/reports/sales/categories with live order aggregation fallback
   * @param {object} params
   */
  async getSalesByCategory(params = {}) {
    try {
      const data = await reportApi.getSalesByCategory(params);
      if (data && typeof data === 'object' && Array.isArray(data.items)) {
        return { ...data, isLiveEndpoint: true };
      }
    } catch (err) {
      if (err.code === 'UNSUPPORTED_REPORT_CURRENCY' || err.status === 422) {
        throw new Error('Sales categories report supports EUR only; the selected range contains orders in another currency.');
      }
      console.warn('reportApi.getSalesByCategory endpoint error, aggregating from live database:', err.message);
    }

    return await this.computeSalesCategoriesFallback(params);
  },

  /**
   * Fetch Sales by Country (Unpaginated)
   * GET /api/admin/reports/sales/countries with live order aggregation fallback
   * @param {object} params
   */
  async getSalesByCountry(params = {}) {
    try {
      const data = await reportApi.getSalesByCountry(params);
      if (data && typeof data === 'object' && Array.isArray(data.items)) {
        return { ...data, isLiveEndpoint: true };
      }
    } catch (err) {
      if (err.code === 'UNSUPPORTED_REPORT_CURRENCY' || err.status === 422) {
        throw new Error('Sales country report supports EUR only; the selected range contains orders in another currency.');
      }
      console.warn('reportApi.getSalesByCountry endpoint error, aggregating from live database:', err.message);
    }

    return await this.computeSalesCountriesFallback(params);
  },

  /**
   * Download Export File (CSV ZIP, XLSX, or PDF)
   * GET /api/admin/reports/sales/export with client-side export fallback
   * @param {object} params { format: 'csv'|'xlsx'|'pdf', from, to }
   */
  async downloadExport(params = {}) {
    try {
      return await reportApi.downloadSalesExport(params);
    } catch (err) {
      if (err.code === 'UNSUPPORTED_REPORT_CURRENCY' || err.status === 422) {
        throw new Error('Sales export supports EUR only; the selected range contains orders in another currency.');
      }
      console.warn('reportApi.downloadSalesExport server error, generating client-side export:', err.message);
      return await this.generateClientSideExport(params);
    }
  },

  /**
   * Resolves date range bounds from preset or custom from/to parameters
   */
  resolveDateRange(params = {}) {
    const preset = params.period || params.Period;
    if (preset && preset !== 'custom') {
      const dates = this.getPresetDates(preset);
      return {
        type: preset,
        from: dates.from,
        to: dates.to,
        fromIso: `${dates.from}T00:00:00.000Z`,
        toIso: `${dates.to}T23:59:59.999Z`
      };
    }

    const from = params.from || params.From || this.getPresetDates('monthly').from;
    const to = params.to || params.To || this.getPresetDates('monthly').to;
    return {
      type: 'custom',
      from: from.split('T')[0],
      to: to.split('T')[0],
      fromIso: `${from.split('T')[0]}T00:00:00.000Z`,
      toIso: `${to.split('T')[0]}T23:59:59.999Z`
    };
  },

  /**
   * Filters orders by date range and optional criteria
   */
  filterOrders(orders, range, filters = {}) {
    const fromDate = range.from;
    const toDate = range.to;
    const statusFilter = (filters.status || filters.Status || '').trim().toLowerCase();
    const productId = filters.productId || filters.ProductId;
    const categoryId = filters.categoryId || filters.CategoryId;
    const brandId = filters.brandId || filters.BrandId;
    const country = (filters.country || filters.Country || '').trim().toLowerCase();

    return orders.filter(o => {
      // Date bounds
      const oDate = (o.date || o.createdAt || '').slice(0, 10);
      if (fromDate && oDate && oDate < fromDate) return false;
      if (toDate && oDate && oDate > toDate) return false;

      // Status exclusion: Cancelled orders are excluded unless explicitly requested
      const orderStatus = (o.status || o.orderStatus || 'Pending').toLowerCase();
      if (statusFilter && statusFilter !== 'all') {
        if (orderStatus !== statusFilter) return false;
      } else if (!statusFilter || statusFilter === 'all') {
        if (orderStatus === 'cancelled' || orderStatus === 'cancelpending') return false;
      }

      // Product ID filter
      if (productId) {
        const hasProd = Array.isArray(o.items) && o.items.some(
          it => String(it.productId || it.id) === String(productId)
        );
        if (!hasProd) return false;
      }

      // Category ID filter
      if (categoryId) {
        const hasCat = Array.isArray(o.items) && o.items.some(
          it => String(it.categoryId || it.category?.id) === String(categoryId)
        );
        if (!hasCat) return false;
      }

      // Brand ID filter
      if (brandId) {
        const hasBrand = Array.isArray(o.items) && o.items.some(
          it => String(it.brandId || it.brand?.id) === String(brandId)
        );
        if (!hasBrand) return false;
      }

      // Country filter
      if (country) {
        const orderCountry = (o.shippingAddress?.country || o.country || '').toLowerCase();
        const iso = toIsoCountry(orderCountry).toLowerCase();
        if (orderCountry !== country && iso !== country) return false;
      }

      return true;
    });
  },

  /**
   * Fallback KPI Calculation from Live Database
   */
  async computeSalesReportFallback(params = {}) {
    const range = this.resolveDateRange(params);
    let orders = [];
    try {
      const ordersResult = await orderService.getAdminOrders();
      orders = Array.isArray(ordersResult?.items) ? ordersResult.items : (Array.isArray(ordersResult) ? ordersResult : []);
    } catch {
      orders = orderService.getAllOrdersSync();
    }

    const matching = this.filterOrders(orders, range, params);

    if (matching.length === 0) {
      return {
        period: {
          type: range.type,
          from: range.fromIso,
          to: range.toIso
        },
        currency: 'EUR',
        orders: 0,
        grossSales: 0,
        discounts: 0,
        shipping: 0,
        refunds: 0,
        netSales: 0,
        averageOrderValue: 0,
        customers: 0,
        message: 'No sales recorded in the selected period.',
        isFallback: true
      };
    }

    let grossSales = 0;
    let discounts = 0;
    let shipping = 0;
    let refunds = 0;
    const customerKeys = new Set();

    matching.forEach(o => {
      const cust = (o.customerEmail || o.userId || o.customerName || '').trim().toLowerCase();
      if (cust) customerKeys.add(cust);

      discounts += Number(o.discount || o.discountAmount || 0);
      shipping += Number(o.shippingFee || o.shipping || 0);
      refunds += Number(o.refundedAmount || o.refund || 0);

      if (Array.isArray(o.items) && o.items.length > 0) {
        grossSales += o.items.reduce((s, it) => s + (Number(it.price || it.unitPrice || 0) * (Number(it.quantity) || 1)), 0);
      } else {
        grossSales += Number(o.subtotal || o.total || 0);
      }
    });

    grossSales = Math.round(grossSales * 100) / 100;
    discounts = Math.round(discounts * 100) / 100;
    shipping = Math.round(shipping * 100) / 100;
    refunds = Math.round(refunds * 100) / 100;
    const netSales = Math.max(0, Math.round((grossSales - discounts - refunds) * 100) / 100);
    const averageOrderValue = matching.length > 0 ? Math.round((netSales / matching.length) * 100) / 100 : 0;

    return {
      period: {
        type: range.type,
        from: range.fromIso,
        to: range.toIso
      },
      currency: 'EUR',
      orders: matching.length,
      grossSales,
      discounts,
      shipping,
      refunds,
      netSales,
      averageOrderValue,
      customers: customerKeys.size || matching.length,
      message: null,
      isFallback: true
    };
  },

  /**
   * Fallback Sales by Product Breakdown
   */
  async computeSalesProductsFallback(params = {}) {
    const range = this.resolveDateRange(params);
    let orders = [];
    let products = [];

    try {
      const [ordersResult, prods] = await Promise.all([
        orderService.getAdminOrders().catch(() => orderService.getAllOrdersSync()),
        productService.getAllProducts({ includeDrafts: true }).catch(() => [])
      ]);
      orders = Array.isArray(ordersResult?.items) ? ordersResult.items : (Array.isArray(ordersResult) ? ordersResult : []);
      products = Array.isArray(prods) ? prods : [];
    } catch {
      orders = orderService.getAllOrdersSync();
      products = productService.getAllProductsSync({ includeDrafts: true });
    }

    const matching = this.filterOrders(orders, range, params);
    const productMap = new Map();

    products.forEach(p => {
      const pId = Number(p.id || p.numericId || 1);
      if (!productMap.has(pId)) {
        productMap.set(pId, {
          productId: pId,
          productName: p.name || `Fragrance #${pId}`,
          quantitySold: 0,
          grossRevenue: 0,
          discountGiven: 0,
          netRevenue: 0
        });
      }
    });

    matching.forEach(o => {
      if (Array.isArray(o.items)) {
        o.items.forEach(it => {
          const pId = Number(it.productId || it.id || 1);
          const qty = Number(it.quantity) || 1;
          const price = Number(it.price || it.unitPrice || 0);
          const lineTotal = price * qty;

          if (!productMap.has(pId)) {
            productMap.set(pId, {
              productId: pId,
              productName: it.name || it.productName || `Fragrance #${pId}`,
              quantitySold: 0,
              grossRevenue: 0,
              discountGiven: 0,
              netRevenue: 0
            });
          }

          const entry = productMap.get(pId);
          entry.quantitySold += qty;
          entry.grossRevenue += lineTotal;
          entry.netRevenue += lineTotal;
        });
      }
    });

    let list = Array.from(productMap.values());

    const sortBy = (params.sortBy || 'revenue').toLowerCase();
    const sortDir = (params.sortDirection || 'desc').toLowerCase();
    list.sort((a, b) => {
      const valA = sortBy === 'quantity' ? a.quantitySold : a.netRevenue;
      const valB = sortBy === 'quantity' ? b.quantitySold : b.netRevenue;
      return sortDir === 'asc' ? valA - valB : valB - valA;
    });

    const page = Math.max(1, Number(params.page || 1));
    const pageSize = Math.max(1, Number(params.pageSize || 20));
    const totalCount = list.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const paginated = list.slice((page - 1) * pageSize, page * pageSize);

    return {
      items: paginated,
      page,
      pageSize,
      totalCount,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
      isFallback: true
    };
  },

  /**
   * Fallback Sales by Category Breakdown
   */
  async computeSalesCategoriesFallback(params = {}) {
    const range = this.resolveDateRange(params);
    let orders = [];
    let categories = [];

    try {
      const [ordersResult, cats] = await Promise.all([
        orderService.getAdminOrders().catch(() => orderService.getAllOrdersSync()),
        categoryApi.getCategories().catch(() => [])
      ]);
      orders = Array.isArray(ordersResult?.items) ? ordersResult.items : (Array.isArray(ordersResult) ? ordersResult : []);
      categories = Array.isArray(cats) ? cats : [];
    } catch {
      orders = orderService.getAllOrdersSync();
    }

    const matching = this.filterOrders(orders, range, params);
    const categoryMap = new Map();

    if (categories.length > 0) {
      categories.forEach(c => {
        const cId = Number(c.id || 1);
        categoryMap.set(cId, {
          categoryId: cId,
          categoryName: c.name || `Category #${cId}`,
          quantitySold: 0,
          revenue: 0
        });
      });
    } else {
      categoryMap.set(1, { categoryId: 1, categoryName: 'Perfumes', quantitySold: 0, revenue: 0 });
      categoryMap.set(2, { categoryId: 2, categoryName: 'Oud & Oils', quantitySold: 0, revenue: 0 });
      categoryMap.set(3, { categoryId: 3, categoryName: 'Discovery Sets', quantitySold: 0, revenue: 0 });
    }

    matching.forEach(o => {
      if (Array.isArray(o.items)) {
        o.items.forEach(it => {
          const cId = Number(it.categoryId || it.category?.id || 1);
          const cName = it.categoryName || it.category?.name || 'Perfumes';
          const qty = Number(it.quantity) || 1;
          const price = Number(it.price || it.unitPrice || 0);

          if (!categoryMap.has(cId)) {
            categoryMap.set(cId, {
              categoryId: cId,
              categoryName: cName,
              quantitySold: 0,
              revenue: 0
            });
          }

          const entry = categoryMap.get(cId);
          entry.quantitySold += qty;
          entry.revenue += (price * qty);
        });
      }
    });

    return {
      items: Array.from(categoryMap.values()),
      isFallback: true
    };
  },

  /**
   * Fallback Sales by Country Breakdown
   */
  async computeSalesCountriesFallback(params = {}) {
    const range = this.resolveDateRange(params);
    let orders = [];

    try {
      const ordersResult = await orderService.getAdminOrders();
      orders = Array.isArray(ordersResult?.items) ? ordersResult.items : (Array.isArray(ordersResult) ? ordersResult : []);
    } catch {
      orders = orderService.getAllOrdersSync();
    }

    const matching = this.filterOrders(orders, range, params);
    const countryMap = new Map();

    matching.forEach(o => {
      const rawCountry = o.shippingAddress?.country || o.country || 'Spain';
      const code = toIsoCountry(rawCountry);
      const cust = (o.customerEmail || o.userId || '').toLowerCase();
      const total = Number(o.total || o.subtotal || 0);

      if (!countryMap.has(code)) {
        countryMap.set(code, {
          countryCode: code,
          orders: 0,
          revenue: 0,
          averageOrderValue: 0,
          customers: 0,
          currency: 'EUR',
          customerSet: new Set()
        });
      }

      const entry = countryMap.get(code);
      entry.orders += 1;
      entry.revenue += total;
      if (cust) entry.customerSet.add(cust);
    });

    let items = Array.from(countryMap.values()).map(c => ({
      countryCode: c.countryCode,
      orders: c.orders,
      revenue: Math.round(c.revenue * 100) / 100,
      averageOrderValue: c.orders > 0 ? Math.round((c.revenue / c.orders) * 100) / 100 : 0,
      customers: c.customerSet.size || c.orders,
      currency: 'EUR'
    }));

    const codeFilter = (params.country || params.Country || '').trim().toUpperCase();
    if (codeFilter) {
      items = items.filter(c => c.countryCode === codeFilter);
    }

    return {
      items,
      isFallback: true
    };
  },

  /**
   * Generate Client-side Binary / Text Sales Export when backend 500s
   */
  async generateClientSideExport(params = {}) {
    const format = String(params.format || 'csv').toLowerCase();
    const from = String(params.from || '').trim() || this.getPresetDates('monthly').from;
    const to = String(params.to || '').trim() || this.getPresetDates('monthly').to;

    const [overview, ordersResult] = await Promise.all([
      this.computeSalesReportFallback({ from, to }),
      orderService.getAdminOrders().catch(() => orderService.getAllOrdersSync())
    ]);

    const orders = Array.isArray(ordersResult?.items) ? ordersResult.items : (Array.isArray(ordersResult) ? ordersResult : []);
    const matchingOrders = this.filterOrders(orders, { from, to });

    const filename = `sales-report_${from}_${to}.${format === 'xlsx' ? 'xls' : (format === 'pdf' ? 'txt' : 'csv')}`;

    if (format === 'csv') {
      let csv = '\uFEFF';
      csv += '--- ARABIAN SHEIKH SALES OVERVIEW ---\r\n';
      csv += `Resolved UTC Range,${from} to ${to}\r\n`;
      csv += `Reporting Currency,EUR\r\n`;
      csv += `Total Orders,${overview.orders}\r\n`;
      csv += `Gross Sales (EUR),${overview.grossSales.toFixed(2)}\r\n`;
      csv += `Discounts Deducted (EUR),${overview.discounts.toFixed(2)}\r\n`;
      csv += `Refunds Deducted (EUR),${overview.refunds.toFixed(2)}\r\n`;
      csv += `Net Sales (EUR),${overview.netSales.toFixed(2)}\r\n`;
      csv += `Average Order Value (EUR),${overview.averageOrderValue.toFixed(2)}\r\n`;
      csv += `Distinct Customers,${overview.customers}\r\n\r\n`;

      csv += '--- MATCHING ORDERS DETAIL ---\r\n';
      csv += 'Order ID,Date,Customer,Email,Country,Status,Subtotal,Discount,Shipping,Total,Currency\r\n';
      matchingOrders.forEach(o => {
        const country = toIsoCountry(o.shippingAddress?.country || o.country);
        const line = [
          `"${o.id || o.orderNumber}"`,
          `"${(o.date || o.createdAt || '').slice(0, 10)}"`,
          `"${(o.customerName || '').replace(/"/g, '""')}"`,
          `"${(o.customerEmail || '').replace(/"/g, '""')}"`,
          `"${country}"`,
          `"${o.status || o.orderStatus || 'Pending'}"`,
          (Number(o.subtotal) || 0).toFixed(2),
          (Number(o.discount) || 0).toFixed(2),
          (Number(o.shippingFee) || 0).toFixed(2),
          (Number(o.total) || 0).toFixed(2),
          'EUR'
        ].join(',');
        csv += line + '\r\n';
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      downloadBlob(blob, filename);
      return { filename, success: true, isFallback: true };
    }

    if (format === 'xlsx') {
      let tableHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head><meta charset="utf-8" /></head>
        <body>
          <h2>Arabian Sheikh - Sales Report (${from} to ${to})</h2>
          <table border="1">
            <tr><th>Metric</th><th>Value (EUR)</th></tr>
            <tr><td>Total Orders</td><td>${overview.orders}</td></tr>
            <tr><td>Gross Sales</td><td>${overview.grossSales.toFixed(2)}</td></tr>
            <tr><td>Discounts Deducted</td><td>${overview.discounts.toFixed(2)}</td></tr>
            <tr><td>Refunds Deducted</td><td>${overview.refunds.toFixed(2)}</td></tr>
            <tr><td>Net Sales</td><td>${overview.netSales.toFixed(2)}</td></tr>
            <tr><td>Average Order Value</td><td>${overview.averageOrderValue.toFixed(2)}</td></tr>
            <tr><td>Distinct Customers</td><td>${overview.customers}</td></tr>
          </table>
          <br/>
          <h3>Orders Breakdown</h3>
          <table border="1">
            <tr><th>Order ID</th><th>Date</th><th>Customer</th><th>Country</th><th>Status</th><th>Total (EUR)</th></tr>
            ${matchingOrders.map(o => `<tr><td>${o.id || o.orderNumber}</td><td>${(o.date || o.createdAt || '').slice(0, 10)}</td><td>${o.customerName || ''}</td><td>${toIsoCountry(o.shippingAddress?.country || o.country)}</td><td>${o.status || 'Pending'}</td><td>${(Number(o.total) || 0).toFixed(2)}</td></tr>`).join('')}
          </table>
        </body></html>`;
      const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      downloadBlob(blob, filename);
      return { filename, success: true, isFallback: true };
    }

    let reportText = `ARABIAN SHEIKH HAUTE PARFUMERIE - SALES REPORT\n`;
    reportText += `Period: ${from} to ${to} (EUR Guaranteed)\n\n`;
    reportText += `Gross Sales:        €${overview.grossSales.toFixed(2)}\n`;
    reportText += `Discounts Deducted: €${overview.discounts.toFixed(2)}\n`;
    reportText += `Refunds Deducted:   €${overview.refunds.toFixed(2)}\n`;
    reportText += `Net Sales:          €${overview.netSales.toFixed(2)}\n`;
    reportText += `Total Orders:       ${overview.orders}\n`;
    reportText += `Average Order Value:€${overview.averageOrderValue.toFixed(2)}\n`;
    reportText += `Distinct Customers: ${overview.customers}\n`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' });
    downloadBlob(blob, filename);
    return { filename, success: true, isFallback: true };
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
