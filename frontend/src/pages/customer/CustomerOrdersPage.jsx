import * as React from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function CustomerOrdersPage() {
  const [rows, setRows] = React.useState([]);
  const [paidIds, setPaidIds] = React.useState(new Set());

  React.useEffect(() => {
    Promise.all([api.get('/bookings'), api.get('/payments/mine')]).then(([bRes, pRes]) => {
      const list = (bRes.data.bookings || []).filter((b) => ['pending', 'accepted', 'in_progress'].includes(b.status));
      setRows(list);
      const paid = new Set(
        (pRes.data.payments || []).filter((p) => p.status === 'completed').map((p) => p.booking_id)
      );
      setPaidIds(paid);
    });
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Current orders</h1>
      <div className="space-y-3">
        {rows.map((b) => {
          const isPaid = paidIds.has(b.id);
          return (
            <Card key={b.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <div className="font-medium">{b.service_title}</div>
                  <div className="text-xs text-muted-foreground">{b.scheduled_at}</div>
                </div>
                <Badge>{b.status}</Badge>
                <div className="flex flex-wrap gap-2">
                  {!isPaid && (
                    <Button asChild size="sm">
                      <Link to={`/customer/pay/${b.id}`}>Pay with Stripe</Link>
                    </Button>
                  )}
                  {isPaid ? <Badge variant="success">Paid</Badge> : null}
                  <Link className="text-sm text-primary underline" to={`/bookings/${b.id}/chat`}>
                    Chat
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {!rows.length && <p className="text-sm text-muted-foreground">No active orders.</p>}
      </div>
    </div>
  );
}
