import * as React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';

function CheckoutForm({ onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const toast = useToast();
  const [busy, setBusy] = React.useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/customer/payments`,
      },
    });

    if (error) {
      toast({ title: 'Payment failed', description: error.message });
      setBusy(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      await onSuccess(paymentIntent.id);
    } else if (paymentIntent?.status === 'processing') {
      toast({ title: 'Processing', description: 'Payment is processing…' });
    }
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />
      <Button type="submit" disabled={!stripe || busy} className="w-full" size="lg">
        {busy ? 'Processing…' : 'Pay now'}
      </Button>
    </form>
  );
}

export function StripePaymentForm({ clientSecret, publishableKey, onPaid }) {
  const stripePromise = React.useMemo(() => {
    if (!publishableKey) return null;
    return loadStripe(publishableKey);
  }, [publishableKey]);

  if (!clientSecret || !stripePromise) {
    return (
      <p className="text-sm text-muted-foreground">
        Stripe could not load. Restart the backend after adding keys to backend/.env.
      </p>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: { theme: 'stripe', variables: { colorPrimary: '#6366f1' } },
      }}
    >
      <CheckoutForm onSuccess={onPaid} />
    </Elements>
  );
}
