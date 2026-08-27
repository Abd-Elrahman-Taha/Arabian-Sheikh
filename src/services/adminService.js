import { productService } from './productService';
import { orderService } from './orderService';
import { userService } from './userService';

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
