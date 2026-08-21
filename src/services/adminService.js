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

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10);
    const outOfStockProducts = products.filter(p => p.stock === 0 || p.status === 'OUT_OF_STOCK');

    // Revenue chart breakdown (last 6 months simulated/aggregated)
    const monthlyRevenue = [
      { month: 'Mar', revenue: 14200, orders: 38 },
      { month: 'Apr', revenue: 18900, orders: 49 },
      { month: 'May', revenue: 22400, orders: 58 },
      { month: 'Jun', revenue: 28100, orders: 71 },
      { month: 'Jul', revenue: 34500, orders: 88 },
      { month: 'Aug', revenue: totalRevenue + 39200, orders: orders.length + 95 }
    ];

    // Family distribution
    const familyDistribution = [
      { name: 'Woody (Oud)', count: products.filter(p => p.fragranceFamily === 'Woody').length, percentage: 35 },
      { name: 'Oriental / Amber', count: products.filter(p => (p.fragranceFamily || '').includes('Oriental')).length, percentage: 30 },
      { name: 'Floral', count: products.filter(p => p.fragranceFamily === 'Floral').length, percentage: 15 },
      { name: 'Fresh', count: products.filter(p => p.fragranceFamily === 'Fresh').length, percentage: 10 },
      { name: 'Fruity', count: products.filter(p => p.fragranceFamily === 'Fruity').length, percentage: 10 }
    ];

    return {
      totalRevenue: totalRevenue + 157300, // baseline + dynamic orders
      totalOrders: orders.length + 399,
      totalCustomers: users.length + 184,
      totalProducts: products.length,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      lowStockProducts,
      recentOrders: orders.slice(0, 5),
      monthlyRevenue,
      familyDistribution
    };
  },

  async getDashboardMetrics() {
    return this.getDashboardMetricsSync();
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
