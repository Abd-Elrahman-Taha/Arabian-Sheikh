/**
 * Arabian Sheikh - Shipping Module Data Models & TypeScript Definitions
 * Strictly complies with the PerfumeStore Backend-to-Frontend Handoff Guide
 * Version: 1.0 (Production Certified)
 */

/**
 * Valid shipment lifecycle states managed by the backend
 */
export type ShipmentStatus =
  | 'Pending'
  | 'Creating'
  | 'Created'
  | 'Shipped'
  | 'OutForDelivery'
  | 'Delivered'
  | 'Failed'
  | 'Cancelled';

/**
 * Valid overall order fulfillment states
 */
export type OrderStatus =
  | 'Pending'
  | 'Processing'
  | 'Shipped'
  | 'OutForDelivery'
  | 'Delivered'
  | 'Cancelled';

/**
 * Supported carrier identifiers
 */
export type CarrierCode = 'ECONT' | 'SPEEDY' | 'DHL' | 'FEDEX';

/**
 * Request payload for POST /api/shipping/quotes
 */
export interface ShippingQuoteRequest {
  addressId: number;
  countryCode?: string;
  postalCode?: string;
  city?: string;
  items?: Array<{
    productId: number;
    quantity: number;
    weight?: number;
  }>;
  couponCode?: string;
}

/**
 * Individual shipping option returned by POST /api/shipping/quotes
 */
export interface ShippingOption {
  quoteId: string;
  shippingCompanyId: number;
  carrier: string;
  shippingMethodId: number;
  shippingMethod: string;
  fee: number;
  currency: string;
  estimatedDays: number;
  isFree: boolean;
  rateSource?: string;
}

/**
 * Response wrapper for POST /api/shipping/quotes
 */
export interface ShippingQuotesResponse {
  options: ShippingOption[];
}

/**
 * Response payload for GET /api/orders/{id}/delivery-status
 */
export interface DeliveryStatusResponse {
  orderId: number;
  orderStatus: OrderStatus;
  shipmentStatus: ShipmentStatus | null;
  carrierStatus: string | null;
  trackingNumber: string | null;
}

/**
 * Individual checkpoint event in the tracking timeline
 */
export interface TrackingEventResponse {
  status: ShipmentStatus | string;
  description?: string;
  location?: string;
  occurredAt: string;
}

/**
 * Response payload for GET /api/orders/{id}/tracking
 */
export interface OrderTrackingResponse {
  orderId: number;
  shipmentId: number | null;
  carrier: string;
  trackingNumber: string | null;
  currentStatus: ShipmentStatus | null;
  carrierStatus: string | null;
  expectedDeliveryDate: string | null;
  events: TrackingEventResponse[];
}

/**
 * Request payload for POST /api/orders/{id}/cancel
 */
export interface CancelOrderRequest {
  reason: string;
}

/**
 * Response payload for POST /api/orders/{id}/cancel
 */
export interface CancelOrderResponse {
  orderId: number;
  orderStatus: OrderStatus;
  shipmentCancelled: boolean;
  cancelledAt: string;
}
