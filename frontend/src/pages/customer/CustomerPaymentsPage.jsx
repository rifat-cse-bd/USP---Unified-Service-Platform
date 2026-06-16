import * as React from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function CustomerPaymentsPage() {
  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    api.get('/payments/mine').then(({ data }) => setRows(data.payments || []));
  }, []);

  const viewInvoice = async (id) => {
    const { data } = await api.get(`/payments/invoice/${id}`);
    alert(
      `Invoice ${data.invoice.invoice_number}\n` +
        `Service: ${data.invoice.service_title}\n` +
        `Total: ৳${data.invoice.amount}\n` +
        `Platform fee: ৳${data.invoice.platform_commission}\n` +
        `Worker payout: ৳${data.invoice.worker_payout}\n` +
        `Status: ${data.invoice.status_label || data.invoice.status}`
    );
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Payment history</h1>
      <div className="space-y-3">
        {rows.map((p) => (
          <Card key={p.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
              <div>
                <div className="font-medium">{p.service_title}</div>
                <div className="text-xs text-muted-foreground">
                  {p.provider?.toUpperCase()} · {p.invoice_number || p.transaction_ref}
                </div>
                {p.platform_commission != null && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Fee ৳{p.platform_commission} · Worker ৳{p.worker_payout}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="font-semibold">৳{Number(p.amount).toFixed(0)}</div>
                <Badge className="mt-1">{p.status_label || p.status}</Badge>
              </div>
              {p.status === 'completed' && (
                <Button size="sm" variant="outline" onClick={() => viewInvoice(p.id)}>
                  Invoice
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {!rows.length && (
          <div className="flex flex-wrap gap-2 py-4">
            <p className="w-full text-sm text-muted-foreground">No payments yet.</p>
            <Button asChild size="sm" variant="outline" className="rounded-xl">
              <Link to="/customer/checkout">Go to checkout</Link>
            </Button>
            <Button asChild size="sm" className="rounded-xl">
              <Link to="/customer/orders">View current orders</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
