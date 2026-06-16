import * as React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileCheck, Package, Star, Wallet, Wrench } from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { ChatLinkButton, DashboardPageHeader, QuickActionCard } from '@/components/dashboard/dashboardUi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/admin/adminUi';

const QUICK_ACTIONS = [
  { to: '/worker/orders', icon: Package, title: 'Incoming orders', description: 'Accept and manage jobs', accent: true },
  { to: '/worker/earnings', icon: Wallet, title: 'Earnings', description: 'Payouts and monthly totals' },
  { to: '/worker/services', icon: Wrench, title: 'My services', description: 'Edit listings and pricing' },
  { to: '/worker/documents', icon: FileCheck, title: 'Verification', description: 'Upload ID & certificates' },
  { to: '/worker/availability', icon: Calendar, title: 'Availability', description: 'Set your weekly schedule' },
  { to: '/worker/reviews', icon: Star, title: 'Reviews', description: 'See customer feedback' },
];

export function WorkerDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = React.useState({ total: 0, monthly: [] });
  const [orders, setOrders] = React.useState([]);

  React.useEffect(() => {
    api.get('/workers/me/earnings').then(({ data }) => setStats({ total: data.total, monthly: data.monthly || [] }));
    api.get('/bookings').then(({ data }) => setOrders((data.bookings || []).slice(0, 5)));
  }, []);

  const greeting = user?.full_name?.split(' ')[0] || 'Pro';

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        user={user}
        title={`Hello, ${greeting}`}
        description="Manage orders, earnings, and your professional profile from one dashboard."
        actions={
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/worker/profile">Edit profile</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lifetime earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">৳{Number(stats.total).toFixed(0)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{orders.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ৳{Number(stats.monthly[0]?.total || 0).toFixed(0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <QuickActionCard key={action.to} {...action} />
          ))}
        </div>
      </div>

      <Card className="border-border/70">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Recent bookings</CardTitle>
            <CardDescription>Latest jobs assigned to you</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link to="/worker/orders">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.map((b) => (
            <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 transition-colors hover:bg-muted/30">
              <div className="min-w-0">
                <p className="font-medium">{b.service_title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <StatusBadge status={b.status} />
                  <span className="text-xs text-muted-foreground">#{b.id}</span>
                </div>
              </div>
              <ChatLinkButton to={`/bookings/${b.id}/chat`} />
            </div>
          ))}
          {!orders.length && (
            <p className="py-8 text-center text-sm text-muted-foreground">No bookings yet — complete your profile to get discovered.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
