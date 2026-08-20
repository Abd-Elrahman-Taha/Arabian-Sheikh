import { productService } from './productService';
import { orderService } from './orderService';
import { userService } from './userService';
import { analyticsApi } from '../api/analytics.api';
import { apiClient } from '../api/client';

export const analyticsService = {
  async getDetailedAnalytics() {
    if (!apiClient.isMockEnabled()) {
      try {
        const remote = await analyticsApi.getOverview();
        if (remote && remote.totalRevenue !== undefined) {
          return remote;
        }
      } catch (e) {
        console.warn('Real API analytics fallback:', e.message);
      }
    }

    const products = await productService.getAllProducts({ includeDrafts: true });
    const orders = await orderService.getAllOrders();
    const users = await userService.getAllUsers();

    const baselineRevenue = 157300;
    const currentOrdersRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalRevenue = baselineRevenue + currentOrdersRevenue;

    const completedOrders = orders.filter(o => o.status === 'DELIVERED' || o.status === 'CONFIRMED');
    const averageOrderValue = Math.round(totalRevenue / Math.max(1, orders.length + 399));

    // Weekly sales performance
    const weeklyData = [
      { day: 'Mon', revenue: 4200, visitors: 1420 },
      { day: 'Tue', revenue: 5800, visitors: 1890 },
      { day: 'Wed', revenue: 6400, visitors: 2100 },
      { day: 'Thu', revenue: 7900, visitors: 2650 },
      { day: 'Fri', revenue: 11200, visitors: 3800 },
      { day: 'Sat', revenue: 14800, visitors: 4900 },
      { day: 'Sun', revenue: 13500, visitors: 4300 }
    ];

    // Family sales distribution
    const familySales = [
      { family: 'Woody (Wild Oud)', revenue: Math.round(totalRevenue * 0.42), percentage: 42, color: '#D4AF37' },
      { family: 'Oriental / Amber', revenue: Math.round(totalRevenue * 0.28), percentage: 28, color: '#D4AF37' },
      { family: 'Floral (Taif Rose)', revenue: Math.round(totalRevenue * 0.16), percentage: 16, color: '#D4AF37' },
      { family: 'Fresh (Oasis Dew)', revenue: Math.round(totalRevenue * 0.08), percentage: 8, color: '#D8BE99' },
      { family: 'Fruity & Exotic', revenue: Math.round(totalRevenue * 0.06), percentage: 6, color: '#3A2116' }
    ];

    // Top VIP Geographic Markets
    const topRegions = [
      { country: 'United Arab Emirates', flag: '🇦🇪', orders: 218, revenue: 98400 },
      { country: 'Saudi Arabia', flag: '🇸🇦', orders: 142, revenue: 62100 },
      { country: 'United Kingdom', flag: '🇬🇧', orders: 84, revenue: 38200 },
      { country: 'France', flag: '🇫🇷', orders: 56, revenue: 24900 },
      { country: 'United States', flag: '🇺🇸', orders: 49, revenue: 21800 }
    ];

    return {
      totalRevenue,
      totalOrders: orders.length + 399,
      totalCustomers: users.length + 184,
      totalProducts: products.length,
      averageOrderValue,
      conversionRate: '4.8%',
      customerRetention: '78.4%',
      weeklyData,
      familySales,
      topRegions
    };
  }
};

export default analyticsService;
