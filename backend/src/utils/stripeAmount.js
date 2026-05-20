/** Convert booking price (BDT) to Stripe charge amount. Test accounts often require USD. */
export function toStripeCharge(bdtAmount) {
  const currency = (process.env.STRIPE_CURRENCY || 'usd').toLowerCase();
  const amount = Number(bdtAmount) || 0;

  if (currency === 'bdt') {
    return {
      currency: 'bdt',
      unitAmount: Math.max(100, Math.round(amount * 100)),
      displayNote: null,
    };
  }

  const rate = Number(process.env.STRIPE_BDT_PER_USD) || 110;
  const usd = amount / rate;
  return {
    currency: 'usd',
    unitAmount: Math.max(50, Math.round(usd * 100)),
    displayNote: `Test charge ~$${(usd).toFixed(2)} USD (৳${amount.toFixed(0)} BDT at rate ${rate})`,
  };
}
