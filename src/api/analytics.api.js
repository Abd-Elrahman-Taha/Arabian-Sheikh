import apiClient from './client';
import ENDPOINTS from './endpoints';
import { normalizeObjectKeys } from './normalizers';

export const analyticsApi = {
  async getOverview() {
    const response = await apiClient.get(ENDPOINTS.ANALYTICS.OVERVIEW);
    return normalizeObjectKeys(response?.overview || response?.data || response);
  },

  async getSalesTrends(timeframe = '30d') {
    const response = await apiClient.get(ENDPOINTS.ANALYTICS.SALES_TRENDS, { params: { timeframe } });
    return normalizeObjectKeys(response?.trends || response?.data || response);
  },

  async getInventoryStatus() {
    const response = await apiClient.get(ENDPOINTS.ANALYTICS.INVENTORY_STATUS);
    return normalizeObjectKeys(response?.inventory || response?.data || response);
  }
};

export default analyticsApi;
