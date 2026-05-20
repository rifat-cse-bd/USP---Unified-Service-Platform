/** Platform commission split (default 20% platform / 80% worker). */
export function splitPayment(amount, rate = Number(process.env.PLATFORM_COMMISSION_RATE) || 0.2) {
  const total = Number(amount);
  const commission = Math.round(total * rate * 100) / 100;
  const workerPayout = Math.round((total - commission) * 100) / 100;
  return { amount: total, platform_commission: commission, worker_payout: workerPayout };
}
