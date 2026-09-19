import { shippingApi } from '../api/shipping.api';

/**
 * Shipment Status Display and Badge Mappings
 * Strictly complies with the Backend-to-Frontend Handoff Guide:
 * Section 5: Shipment Status Reference & Section 14: Frontend Data Models
 */
export const SHIPMENT_STATUS_MAP = {
  Pending: {
    label: 'Awaiting Shipment',
    color: 'bg-neutral-900/80 text-neutral-300 border-neutral-600/40',
    description: 'Shipment queued, awaiting royal preparation'
  },
  Creating: {
    label: 'Preparing Shipment',
    color: 'bg-neutral-900/80 text-neutral-300 border-neutral-600/40',
    description: 'Palace logistics communicating with carrier'
  },
  Created: {
    label: 'Shipment Created',
    color: 'bg-blue-950/80 text-blue-300 border-blue-500/40',
    description: 'Carrier has confirmed booking and generated tracking'
  },
  Shipped: {
    label: 'Shipped',
    color: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    description: 'Carrier has picked up the flacons and is in transit'
  },
  OutForDelivery: {
    label: 'Out for Delivery',
    color: 'bg-orange-950/80 text-orange-300 border-orange-500/40',
    description: 'Courier is delivering your parcel today'
  },
  Delivered: {
    label: 'Delivered',
    color: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    description: 'Royal creation delivered safely into patron hands'
  },
  Failed: {
    label: 'Shipment Failed',
    color: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
    description: 'Carrier dispatch encountered an issue — please contact concierge'
  },
  Cancelled: {
    label: 'Cancelled',
    color: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
    description: 'Shipment and order have been cancelled'
  }
};

export const shippingService = {
  /**
   * Map backend ShipmentStatus to customer-friendly display text
   * @param {string} status
   */
  getShipmentStatusLabel(status) {
    if (!status) return 'Awaiting Shipment';
    return SHIPMENT_STATUS_MAP[status]?.label || status;
  },

  /**
   * Get Tailwind CSS badge class for shipment status
   * @param {string} status
   */
  getShipmentStatusBadge(status) {
    if (!status) return SHIPMENT_STATUS_MAP.Pending.color;
    return SHIPMENT_STATUS_MAP[status]?.color || SHIPMENT_STATUS_MAP.Pending.color;
  },

  /**
   * Check if status is terminal (no further updates expected)
   * @param {string} status
   */
  isTerminalStatus(status) {
    return ['Delivered', 'Cancelled', 'Failed'].includes(status);
  },

  /**
   * Request live carrier shipping quotes (ECONT, DHL, etc.)
   * @param {object} params { addressId, countryCode, postalCode, items, couponCode }
   * @param {object} [options] { signal }
   */
  async getQuotes(params = {}, options = {}) {
    return await shippingApi.getQuotes(params, options);
  }
};

export default shippingService;
