import Stripe from 'stripe';
import config from '../utils/config.js';

export default class PaymentService {
  constructor() {
    this.stripe = new Stripe(config.STRIPE_KEY);
  }

  createPaymentSession = async (data) => {
    return this.stripe.checkout.sessions.create(data);
  };
}
