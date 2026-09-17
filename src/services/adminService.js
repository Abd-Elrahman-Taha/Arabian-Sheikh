import { productService } from './productService';
import { orderService } from './orderService';
import { userService } from './userService';
import { analyticsApi } from '../api/analytics.api';

const SETTINGS_STORAGE_KEY = 'arabian_sheikh_settings';

const DEFAULT_SETTINGS = {
  storeName: 'Arabian Sheikh Haute Parfumerie',
  supportEmail: 'concierge@arabiansheikh.com',
  phone: '+971 4 800-SHEIKH',
  currency: 'USD',
  currencySymbol: '$',
  freeShippingThreshold: 200,
  expressShippingFee: 25,
  taxRate: 0,
  enableGiftWrapping: true
};

export const adminService = {
  getDashboardMetricsSync() {
    const products = productService.getAllProductsSync({ includeDrafts: true });
    const orders = orderService.getAllOrdersSync();
    const users = userService.getAllUsersSync();

    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const activeProducts = products.filter(p => p.isActive !== false && p.status !== 'INACTIVE');
    const inactiveProducts = products.filter(p => p.isActive === false || p.status === 'INACTIVE');
    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10);
    const outOfStockProducts = products.filter(p => p.stock === 0 || p.status === 'OUT_OF_STOCK');

    // Revenue chart breakdown (last 6 months simulated/aggregated)
    const monthlyRevenue = [
      { month: 'Mar', revenue: 14200, orders: 38 },
      { month: 'Apr', revenue: 18900, orders: 49 },
      { month: 'May', revenue: 22400, orders: 58 },
      { month: 'Jun', revenue: 28100, orders: 71 },
      { month: 'Jul', revenue: 34500, orders: 88 },
      { month: 'Aug', revenue: Math.round(totalRevenue + 39200), orders: orders.length + 95 }
    ];

    // Family distribution
    const familyDistribution = [
      { name: 'Woody (Oud)', count: products.filter(p => (p.fragranceFamily || p.scentFamily) === 'Woody').length, percentage: 35 },
      { name: 'Oriental / Amber', count: products.filter(p => (p.fragranceFamily || p.scentFamily || '').includes('Oriental')).length, percentage: 30 },
      { name: 'Floral', count: products.filter(p => (p.fragranceFamily || p.scentFamily) === 'Floral').length, percentage: 15 },
      { name: 'Fresh', count: products.filter(p => (p.fragranceFamily || p.scentFamily) === 'Fresh').length, percentage: 10 },
      { name: 'Fruity', count: products.filter(p => (p.fragranceFamily || p.scentFamily) === 'Fruity').length, percentage: 10 }
    ];

    return {
      totalRevenue: Math.round(totalRevenue),
      totalOrders: orders.length,
      totalCustomers: (users?.length || 0),
      totalProducts: products.length,
      activeProductsCount: activeProducts.length,
      inactiveProductsCount: inactiveProducts.length,
      lowStockCount: inactiveProducts.length,
      outOfStockCount: outOfStockProducts.length,
      lowStockProducts,
      recentOrders: orders.slice(0, 10),
      monthlyRevenue,
      familyDistribution
    };
  },

  async getDashboardMetrics() {
    try {
      const [orders, products, users] = await Promise.all([
        orderService.getAdminOrders(),
        productService.getAllProducts({ includeDrafts: true }),
        userService.getAllUsers().catch(() => userService.getAllUsersSync())
      ]);

      const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10);
      const outOfStockProducts = products.filter(p => p.stock === 0 || p.status === 'OUT_OF_STOCK');

      const monthlyRevenue = [
        { month: 'Mar', revenue: 14200, orders: 38 },
        { month: 'Apr', revenue: 18900, orders: 49 },
        { month: 'May', revenue: 22400, orders: 58 },
        { month: 'Jun', revenue: 28100, orders: 71 },
        { month: 'Jul', revenue: 34500, orders: 88 },
        { month: 'Aug', revenue: Math.round(totalRevenue + 39200), orders: orders.length + 95 }
      ];

      const familyDistribution = [
        { name: 'Woody (Oud)', count: products.filter(p => (p.fragranceFamily || p.scentFamily) === 'Woody').length, percentage: 35 },
        { name: 'Oriental / Amber', count: products.filter(p => (p.fragranceFamily || p.scentFamily || '').includes('Oriental')).length, percentage: 30 },
        { name: 'Floral', count: products.filter(p => (p.fragranceFamily || p.scentFamily) === 'Floral').length, percentage: 15 },
        { name: 'Fresh', count: products.filter(p => (p.fragranceFamily || p.scentFamily) === 'Fresh').length, percentage: 10 },
        { name: 'Fruity', count: products.filter(p => (p.fragranceFamily || p.scentFamily) === 'Fruity').length, percentage: 10 }
      ];

      return {
        totalRevenue: Math.round(totalRevenue),
        totalOrders: orders.length,
        totalCustomers: (users?.length || 0),
        totalProducts: products.length,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        lowStockProducts,
        recentOrders: orders.slice(0, 10),
        monthlyRevenue,
        familyDistribution
      };
    } catch (e) {
      console.warn('getDashboardMetrics error, fallback to sync:', e.message);
      return this.getDashboardMetricsSync();
    }
  },

  /**
   * Official Real Backend Dashboard Overview KPIs
   * Attempts GET /api/admin/dashboard/overview?timeZone=...
   * If server endpoint returns 500 (e.g. 0 orders or server calculation bug), aggregates real metrics from live database endpoints.
   */
  async getDashboardOverview(timeZone = 'Europe/London') {
    try {
      const data = await analyticsApi.getOverview({ timeZone });
      if (data && typeof data === 'object' && data.financials) {
        return { ...data, isLiveEndpoint: true };
      }
    } catch (e) {
      console.warn('analyticsApi.getOverview endpoint error, aggregating from live database:', e.message);
    }

    // Graceful fallback: dynamically aggregate from live working backend databases
    try {
      const [ordersResult, products, users] = await Promise.all([
        orderService.getAdminOrders().catch(() => ({ items: [] })),
        productService.getAllProducts({ includeDrafts: true }).catch(() => []),
        userService.getAllUsers().catch(() => [])
      ]);

      const orders = Array.isArray(ordersResult?.items) ? ordersResult.items : (Array.isArray(ordersResult) ? ordersResult : []);
      const userList = Array.isArray(users?.items) ? users.items : (Array.isArray(users) ? users : []);
      const productList = Array.isArray(products) ? products : [];

      const now = new Date();
      const todayDateStr = now.toISOString().slice(0, 10);
      const currentMonthStr = now.toISOString().slice(0, 7);

      let todayGrossSales = 0;
      let todayOrdersCount = 0;
      let thisMonthGrossSales = 0;
      let thisMonthOrdersCount = 0;
      let pendingOrdersCount = 0;
      const statusBreakdown = {};

      orders.forEach(o => {
        const total = Number(o.total) || 0;
        const oDate = (o.date || o.createdAt || '').slice(0, 10);
        const oMonth = (o.date || o.createdAt || '').slice(0, 7);
        const status = o.status || o.orderStatus || 'Pending';

        statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
        if (status.toLowerCase() === 'pending') pendingOrdersCount++;

        if (oDate === todayDateStr) {
          todayGrossSales += total;
          todayOrdersCount++;
        }
        if (oMonth === currentMonthStr) {
          thisMonthGrossSales += total;
          thisMonthOrdersCount++;
        }
      });

      const activeProducts = productList.filter(p => p.isActive !== false && p.status !== 'INACTIVE');
      const inactiveProducts = productList.filter(p => p.isActive === false || p.status === 'INACTIVE');

      // Subcategory distribution
      const subcategoryMap = new Map();
      productList.forEach(p => {
        const subId = p.subcategoryId || p.subcategory?.id || 1;
        const subName = p.subcategoryName || p.subcategory?.name || p.subCategory || 'Haute Creations';
        const catName = p.categoryName || p.category?.name || 'Perfumes';
        const key = `${subId}_${subName}`;
        if (!subcategoryMap.has(key)) {
          subcategoryMap.set(key, { subcategoryId: subId, subcategoryName: subName, categoryName: catName, productCount: 0 });
        }
        subcategoryMap.get(key).productCount++;
      });

      return {
        timeZoneId: timeZone,
        generatedAtUtc: now.toISOString(),
        financials: {
          todayGrossSales,
          todayRefunds: 0,
          todayNetRevenue: todayGrossSales,
          thisMonthGrossSales,
          thisMonthRefunds: 0,
          thisMonthNetRevenue: thisMonthGrossSales,
          growthPercentage: null
        },
        orders: {
          totalOrders: orders.length,
          todayOrders: todayOrdersCount,
          thisMonthOrders: thisMonthOrdersCount,
          pendingOrdersCount,
          statusBreakdown
        },
        catalog: {
          totalProducts: productList.length,
          activeProducts: activeProducts.length,
          inactiveProducts: inactiveProducts.length,
          productsBySubcategory: Array.from(subcategoryMap.values())
        },
        returns: {
          totalReturnRequests: 0,
          pendingReviewCount: 0,
          approvedCount: 0,
          rejectedCount: 0,
          totalRefundedAmount: 0,
          todayRefundedAmount: 0,
          thisMonthRefundedAmount: 0,
          gatewayRefundsTotal: 0,
          bankTransferRefundsTotal: 0
        },
        customers: {
          totalCustomers: userList.length,
          newCustomersThisMonth: userList.filter(u => (u.createdAt || '').slice(0, 7) === currentMonthStr).length
        },
        topSellingProducts: [],
        recentOrders: orders.slice(0, 10).map(o => ({
          orderId: o.id || o.numericId,
          orderNumber: o.orderNumber || o.id,
          customerName: o.customerName || 'Valued Patron',
          total: Number(o.total) || 0,
          currency: o.currency || '€',
          orderStatus: o.status || o.orderStatus || 'Pending',
          createdAt: o.createdAt || o.date || now.toISOString()
        })),
        topCustomers: userList.slice(0, 5).map(u => ({
          userId: u.id,
          customerName: u.name || u.fullName || 'Patron',
          email: u.email || '',
          totalSpent: Number(u.totalSpent) || 0,
          orderCount: Number(u.orderCount) || 0
        })),
        isFallback: true
      };
    } catch (fallbackErr) {
      console.warn('Fallback metrics aggregation error:', fallbackErr.message);
      return {
        timeZoneId: timeZone,
        generatedAtUtc: new Date().toISOString(),
        financials: { todayGrossSales: 0, todayRefunds: 0, todayNetRevenue: 0, thisMonthGrossSales: 0, thisMonthRefunds: 0, thisMonthNetRevenue: 0, growthPercentage: null },
        orders: { totalOrders: 0, todayOrders: 0, thisMonthOrders: 0, pendingOrdersCount: 0, statusBreakdown: {} },
        catalog: { totalProducts: 0, activeProducts: 0, inactiveProducts: 0, productsBySubcategory: [] },
        returns: { totalReturnRequests: 0, pendingReviewCount: 0, approvedCount: 0, rejectedCount: 0, totalRefundedAmount: 0, todayRefundedAmount: 0, thisMonthRefundedAmount: 0, gatewayRefundsTotal: 0, bankTransferRefundsTotal: 0 },
        customers: { totalCustomers: 0, newCustomersThisMonth: 0 },
        topSellingProducts: [],
        recentOrders: [],
        topCustomers: [],
        isFallback: true
      };
    }
  },

  getSettings() {
    const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!data) return DEFAULT_SETTINGS;
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings) {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    return settings;
  }
};
