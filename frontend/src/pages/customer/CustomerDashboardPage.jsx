import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Calendar,
  CreditCard,
  Heart,
  Package,
  Search,
  ShoppingCart,
  Star,
} from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { DashboardPageHeader, QuickActionCard } from '@/components/dashboard/dashboardUi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const QUICK_ACTIONS = [
  { to: '/customer/orders', icon: Package, title: 'Current orders', description: 'Track active bookings', accent: true },
  { to: '/customer/cart', icon: ShoppingCart, title: 'Cart', description: 'Review items before checkout' },
  { to: '/customer/payments', icon: CreditCard, title: 'Payments', description: 'Invoices & payment history' },
  { to: '/customer/bookings', icon: Calendar, title: 'Booking history', description: 'Past and upcoming visits' },
  { to: '/customer/wishlist', icon: Heart, title: 'Wishlist', description: 'Saved services you love' },
  { to: '/customer/notifications', icon: Bell, title: 'Notifications', description: 'Updates from workers' },
  { to: '/customer/reviews', icon: Star, title: 'Reviews', description: 'Rate completed jobs' },
  { to: '/search', icon: Search, title: 'Find workers', description: 'Browse verified professionals' },
];

export function CustomerDashboardPage() {
  const { user } = useAuth();
  const [rec, setRec] = React.useState([]);
  const [notifs, setNotifs] = React.useState([]);

  React.useEffect(() => {
    api.get('/services/recommendations').then(({ data }) => setRec(data.data || []));
    api.get('/notifications').then(({ data }) => setNotifs((data.notifications || []).slice(0, 5)));
  }, []);

  const greeting = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        user={user}
        title={`Welcome back, ${greeting}`}
        description="Track bookings, payments, and personalized picks — everything in one place."
        actions={
          <Button asChild className="rounded-xl">
            <Link to="/search">Book a service</Link>
          </Button>
        }
      />

      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <QuickActionCard key={action.to} {...action} />
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/70 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Activity summary</CardTitle>
            <CardDescription>Your latest platform updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
              <span className="text-muted-foreground">Notifications</span>
              <Badge variant="secondary">{notifs.filter((n) => !n.is_read).length} new</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
              <span className="text-muted-foreground">Recommendations</span>
              <Badge variant="outline">{rec.length} picks</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent notifications</CardTitle>
              <CardDescription>Stay on top of booking updates</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link to="/customer/notifications">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {notifs.map((n) => (
              <div key={n.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3 text-sm transition-colors hover:bg-muted/40">
                <span className="font-medium">{n.title}</span>
                {!n.is_read ? <Badge variant="secondary">New</Badge> : null}
              </div>
            ))}
            {!notifs.length && <p className="py-6 text-center text-sm text-muted-foreground">You are all caught up.</p>}
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Recommended for you</h2>
            <p className="text-sm text-muted-foreground">Popular services based on your activity</p>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link to="/services">Browse all</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {rec.map((s) => (
            <Link key={s.id} to={`/offer/${s.id}`} className="group block">
              <Card className="card-lift border-border/70">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <div className="font-semibold group-hover:text-primary">{s.title}</div>
                    <div className="text-xs text-muted-foreground">{s.category_name}</div>
                  </div>
                  <Badge variant="outline">View</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
          {!rec.length && <p className="col-span-2 text-sm text-muted-foreground">Explore services to get recommendations.</p>}
        </div>
      </div>
    </div>
  );
}
