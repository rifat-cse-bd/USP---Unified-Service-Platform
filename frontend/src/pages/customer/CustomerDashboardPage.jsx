import * as React from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function CustomerDashboardPage() {
  const [rec, setRec] = React.useState([]);
  const [notifs, setNotifs] = React.useState([]);

  React.useEffect(() => {
    api.get('/services/recommendations').then(({ data }) => setRec(data.data || []));
    api.get('/notifications').then(({ data }) => setNotifs((data.notifications || []).slice(0, 5)));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customer dashboard</h1>
        <p className="text-muted-foreground">Track bookings, payments, and personalized picks.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick links</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <Link className="text-primary underline" to="/customer/orders">
              Current orders
            </Link>
            <Link className="text-primary underline" to="/customer/cart">
              Cart
            </Link>
            <Link className="text-primary underline" to="/customer/payments">
              Payments
            </Link>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Recent notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {notifs.map((n) => (
              <div key={n.id} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
                <span>{n.title}</span>
                {!n.is_read ? <Badge variant="secondary">New</Badge> : null}
              </div>
            ))}
            {!notifs.length && <p className="text-muted-foreground">You are all caught up.</p>}
          </CardContent>
        </Card>
      </div>
      <div>
        <h2 className="mb-3 text-lg font-semibold">Recommended for you</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {rec.map((s) => (
            <Link key={s.id} to={`/offer/${s.id}`}>
              <Card className="hover:shadow-md">
                <CardContent className="py-4">
                  <div className="font-medium">{s.title}</div>
                  <div className="text-xs text-muted-foreground">{s.category_name}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
