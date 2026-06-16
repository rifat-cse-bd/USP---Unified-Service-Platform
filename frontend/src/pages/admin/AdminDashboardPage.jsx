import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  CreditCard,
  FileCheck,
  LayoutDashboard,
  TrendingUp,
  Users,
  Wrench,
} from 'lucide-react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { DashboardPageHeader, QuickActionCard } from '@/components/dashboard/dashboardUi';
import {
  AdminEmptyState,
  AdminStatCard,
  formatMoney,
  StatusBadge,
} from '@/components/admin/adminUi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f97316', '#ec4899', '#94a3b8', '#06b6d4'];

const QUICK_LINKS = [
  { to: '/admin/orders', icon: CalendarCheck, title: 'Orders', description: 'Booking pipeline', accent: true },
  { to: '/admin/payments', icon: CreditCard, title: 'Payments', description: 'Revenue & payouts' },
  { to: '/admin/verify', icon: FileCheck, title: 'Verify', description: 'Worker documents' },
  { to: '/admin/complaints', icon: AlertTriangle, title: 'Complaints', description: 'Support queue' },
  { to: '/admin/users', icon: Users, title: 'Users', description: 'Manage accounts' },
  { to: '/admin/analytics', icon: LayoutDashboard, title: 'Analytics', description: 'Reports & charts' },
];

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = React.useState(null);
  const [analytics, setAnalytics] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    Promise.all([api.get('/admin/stats'), api.get('/admin/analytics')])
      .then(([s, a]) => {
        setStats(s.data.stats);
        setAnalytics(a.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const recentOrders = React.useMemo(() => {
    if (!analytics?.ordersByStatus) return [];
    const all = Object.values(analytics.ordersByStatus).flat();
    return all.slice(0, 8);
  }, [analytics]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (!stats) return <AdminEmptyState title="Unable to load dashboard" description="Check that you are logged in as admin and the API is running." />;

  const pieData = analytics?.bookingsByStatus || [];
  const barData = [...(analytics?.revenueByMonth || [])].reverse();

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        user={user}
        title="Admin overview"
        description="Monitor users, bookings, revenue, verification queue, and support complaints across the WorkSure marketplace."
        actions={
          <Button asChild variant="outline" className="rounded-xl gap-2">
            <Link to="/admin/analytics">
              Full analytics <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AdminStatCard label="Total users" value={stats.users} hint="Customers, workers & admins" icon={Users} />
        <AdminStatCard label="Workers" value={stats.workers} hint="Active provider profiles" icon={Wrench} />
        <AdminStatCard label="Bookings" value={stats.bookings} hint="All order statuses" icon={CalendarCheck} accent />
        <AdminStatCard label="Completed revenue" value={formatMoney(stats.revenue)} hint="Paid transactions" icon={TrendingUp} accent />
        <AdminStatCard label="Pending verification" value={stats.pendingDocs} hint="Documents awaiting review" icon={FileCheck} />
        <AdminStatCard label="Open complaints" value={stats.openComplaints} hint="Needs admin attention" icon={AlertTriangle} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_LINKS.map((item) => (
          <QuickActionCard key={item.to} {...item} />
        ))}
      </div>

      {analytics && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-primary" />
                Bookings by status
              </CardTitle>
              <CardDescription>Distribution across the order pipeline</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {pieData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label={({ status, count }) => `${status}: ${count}`}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-12 text-center text-sm text-muted-foreground">No booking data yet. Run npm run seed in backend.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Revenue by month
              </CardTitle>
              <CardDescription>Completed payment totals (BDT)</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {barData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => formatMoney(v)} />
                    <Bar dataKey="total" fill="#22c55e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-12 text-center text-sm text-muted-foreground">No completed payments yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-border/70">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>Latest bookings across all statuses</CardDescription>
          </div>
          <Button asChild size="sm" variant="outline" className="rounded-xl">
            <Link to="/admin/orders">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Order</th>
                    <th className="pb-3 pr-4 font-medium">Service</th>
                    <th className="pb-3 pr-4 font-medium">Customer</th>
                    <th className="pb-3 pr-4 font-medium">Worker</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-border/40 last:border-0">
                      <td className="py-3 pr-4 font-medium">#{o.id}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{o.service_title}</td>
                      <td className="py-3 pr-4">{o.customer_name}</td>
                      <td className="py-3 pr-4">{o.worker_name}</td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="py-3 text-right font-medium">{formatMoney(o.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No orders in database. Run <code className="rounded bg-muted px-1">cd backend && npm run seed</code>.
            </p>
          )}
        </CardContent>
      </Card>

      {analytics?.topWorkers?.length > 0 && (
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Top-rated workers</CardTitle>
            <CardDescription>Highest average ratings with review volume</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {analytics.topWorkers.slice(0, 6).map((w, i) => (
              <div key={w.id} className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{i + 1}</Badge>
                  <span className="font-medium">{w.full_name}</span>
                </div>
                <span className="text-muted-foreground">
                  {w.rating_avg}★ · {w.rating_count} reviews
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
