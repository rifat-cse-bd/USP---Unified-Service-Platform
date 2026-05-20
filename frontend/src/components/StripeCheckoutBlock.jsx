import * as React from 'react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StripePaymentForm } from '@/components/StripePaymentForm';
import { useToast } from '@/hooks/useToast';
import { CreditCard } from 'lucide-react';

/**
 * Stripe checkout for a single booking (sandbox).
 * @param {{ bookingId: number, amountBdt?: number, onSuccess?: () => void }} props
 */
export function StripeCheckoutBlock({ bookingId, amountBdt, onSuccess }) {
  const toast = useToast();
  const [config, setConfig] = React.useState({ enabled: false, publishableKey: '' });
  const [clientSecret, setClientSecret] = React.useState('');
  const [commission, setCommission] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [started, setStarted] = React.useState(false);

  React.useEffect(() => {
    api.get('/payments/stripe/config').then(({ data }) => setConfig(data));
  }, []);

  const startPayment = async () => {
    if (!bookingId) return;
    setLoading(true);
    try {
      const { data } = await api.post('/payments/stripe/create-intent', { booking_id: bookingId });
      setClientSecret(data.clientSecret);
      setCommission({
        amount: data.amount,
        platform_commission: data.platform_commission,
        worker_payout: data.worker_payout,
        stripe_display_note: data.stripe_display_note,
      });
      if (data.publishableKey) {
        setConfig((c) => ({ ...c, publishableKey: data.publishableKey, enabled: true }));
      }
      setStarted(true);
    } catch (e) {
      toast({
        title: 'Stripe error',
        description: e.response?.data?.message || e.response?.data?.hint || e.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaid = async (paymentIntentId) => {
    try {
      await api.post('/payments/stripe/confirm', {
        booking_id: bookingId,
        payment_intent_id: paymentIntentId,
      });
      toast({ title: 'Payment successful', description: 'Your booking is paid.' });
      onSuccess?.();
    } catch (e) {
      toast({ title: 'Confirmation failed', description: e.response?.data?.message || e.message });
    }
  };

  if (!config.enabled && !import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-6 text-sm text-muted-foreground">
          Stripe is not configured. Add STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY to backend/.env, then restart the API.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="h-5 w-5" />
          Pay with Stripe
        </CardTitle>
        <CardDescription>Sandbox card: 4242 4242 4242 4242 · any future expiry · any CVC</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {amountBdt != null && !commission && (
          <p className="text-sm">
            Amount due: <strong>৳{Number(amountBdt).toFixed(0)}</strong>
          </p>
        )}
        {commission && (
          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <p>
              Total <strong>৳{commission.amount}</strong> — Platform fee ৳{commission.platform_commission} · Worker receives ৳
              {commission.worker_payout}
            </p>
            {commission.stripe_display_note ? (
              <p className="mt-1 text-xs text-muted-foreground">{commission.stripe_display_note}</p>
            ) : null}
          </div>
        )}

        {!started ? (
          <Button onClick={startPayment} disabled={loading} className="w-full">
            {loading ? 'Preparing…' : 'Continue to payment'}
          </Button>
        ) : (
          <StripePaymentForm
            bookingId={bookingId}
            clientSecret={clientSecret}
            publishableKey={config.publishableKey || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY}
            onPaid={handlePaid}
          />
        )}
      </CardContent>
    </Card>
  );
}
