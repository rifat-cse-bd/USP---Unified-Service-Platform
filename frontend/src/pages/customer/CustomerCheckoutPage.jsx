import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { StripeCheckoutBlock } from '@/components/StripeCheckoutBlock';

export function CustomerCheckoutPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [address, setAddress] = React.useState('Dhanmondi, Dhaka');
  const [booking, setBooking] = React.useState(null);
  const [step, setStep] = React.useState('cart');

  const checkoutCart = async () => {
    const { data: cart } = await api.get('/cart');
    if (!cart.items?.length) {
      toast({ title: 'Cart empty' });
      return null;
    }
    const { data: checkout } = await api.post('/cart/checkout', { default_address: address });
    const list = checkout.bookings || [];
    if (!list.length) return null;
    setBooking(list[0]);
    setStep('pay');
    return list;
  };

  const payMock = async (provider) => {
    try {
      let b = booking;
      if (!b) {
        const list = await checkoutCart();
        b = list?.[0];
      }
      if (!b) return;
      await api.post('/payments/mock', { booking_id: b.id, provider, simulate: 'success' });
      toast({ title: 'Paid (mock)', description: `${provider.toUpperCase()} completed` });
      navigate('/customer/payments');
    } catch (e) {
      toast({ title: 'Checkout failed', description: e.response?.data?.message || e.message });
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Checkout</h1>

      {step === 'cart' && (
        <Card>
          <CardHeader>
            <CardTitle>Delivery address</CardTitle>
            <CardDescription>Cart items become bookings, then you pay.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Address</Label>
              <Input className="mt-1" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <Button className="w-full" onClick={checkoutCart}>
              Create booking & continue to payment
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'pay' && booking && (
        <>
          <Card>
            <CardContent className="py-4 text-sm">
              Booking <strong>#{booking.id}</strong> ready — pay below with Stripe sandbox.
            </CardContent>
          </Card>

          <StripeCheckoutBlock
            bookingId={booking.id}
            amountBdt={booking.total_price}
            onSuccess={() => navigate('/customer/payments')}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Or pay with mock wallet (demo)</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => payMock('bkash')}>
                bKash (mock)
              </Button>
              <Button variant="secondary" onClick={() => payMock('nagad')}>
                Nagad (mock)
              </Button>
              <Button variant="outline" onClick={() => payMock('mock_card')}>
                Card (mock)
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
