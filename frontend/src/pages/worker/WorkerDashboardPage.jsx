import * as React from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function WorkerDashboardPage() {
  const [stats, setStats] = React.useState({ total: 0, monthly: [] });
  const [orders, setOrders] = React.useState([]);
  React.useEffect(() => {
    api.get('/workers/me/earnings').then(({ data }) => setStats({ total: data.total, monthly: data.monthly || [] }));
    api.get('/bookings').then(({ data }) => setOrders((data.bookings || []).slice(0, 5)));
  }, []);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Worker dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Lifetime earnings</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">৳{Number(stats.total).toFixed(0)}</CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Recent bookings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {orders.map((b) => (
              <div key={b.id} className="flex justify-between rounded-lg border border-border/60 px-3 py-2">
                <span>{b.service_title}</span>
                <Link className="text-primary underline" to={`/bookings/${b.id}/chat`}>
                  Chat
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
