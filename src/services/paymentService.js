export const paymentService = {
  /**
   * Mock payment processor abstraction.
   * In a live production environment, this is replaced by Stripe / Checkout / Adyen API calls.
   */
  async processPayment(paymentDetails) {
    // Simulate gateway handshaking delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Basic client-side format checks
    const { cardNumber, cardholderName, expiry, cvv } = paymentDetails;

    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 15) {
      throw new Error('Please provide a valid 16-digit payment card number.');
    }

    if (!cardholderName || cardholderName.trim().length < 3) {
      throw new Error('Please provide the cardholder full name.');
    }

    if (!expiry || !expiry.includes('/')) {
      throw new Error('Please enter card expiry in MM/YY format.');
    }

    if (!cvv || cvv.length < 3) {
      throw new Error('Please provide a valid 3 or 4-digit security code (CVV).');
    }

    // Return mock gateway token and authorization
    return {
      success: true,
      transactionId: 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      authorizationCode: 'AUTH-' + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toISOString(),
      brand: cardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
      last4: cardNumber.slice(-4)
    };
  }
};
