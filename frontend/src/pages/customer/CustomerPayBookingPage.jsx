import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StripeCheckoutBlock } from '@/components/StripeCheckoutBlock';
import { ArrowLeft } from 'lucide-react';

export function CustomerPayBookingPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = React.useState(null);
  const [paid, setPaid] = React.useState(false);

  React.useEffect(() => {
    api
      .get(`/bookings/${bookingId}`)
      .then(({ data }) => setBooking(data.booking))
      .catch(() => setBooking(null));
  }, [bookingId]);

  if (!booking) {
    return <p className="p-8 text-muted-foreground">Loading booking…</p>;
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Button asChild variant="ghost" className="gap-2 pl-0">
        <Link to="/customer/orders">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{booking.service_title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Booking</span>
            <span>#{booking.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge>{booking.status}</Badge>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>৳{Number(booking.total_price).toFixed(0)}</span>
          </div>
        </CardContent>
      </Card>

      {paid ? (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="py-6 text-center">
            <p className="font-medium text-emerald-700 dark:text-emerald-300">Payment complete</p>
            <Button className="mt-4" onClick={() => navigate('/customer/payments')}>
              View payment history
            </Button>
          </CardContent>
        </Card>
      ) : (
        <StripeCheckoutBlock
          bookingId={Number(bookingId)}
          amountBdt={booking.total_price}
          onSuccess={() => setPaid(true)}
        />
      )}
    </div>
  );
}
