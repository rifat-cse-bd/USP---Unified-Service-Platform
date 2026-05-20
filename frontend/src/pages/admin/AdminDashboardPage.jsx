import * as React from 'react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f97316', '#ec4899', '#94a3b8'];

export function AdminDashboardPage() {
  const [stats, setStats] = React.useState(null);
  const [analytics, setAnalytics] = React.useState(null);

  React.useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/admin/analytics')]).then(([s, a]) => {
      setStats(s.data.stats);
      setAnalytics(a.data);
    });
  }, []);

  if (!stats) return <p className="p-6 text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin overview</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Users', stats.users],
          ['Workers', stats.workers],
          ['Bookings', stats.bookings],
          ['Revenue (৳)', stats.revenue],
          ['Pending docs', stats.pendingDocs],
          ['Open complaints', stats.openComplaints],
        ].map(([k, v]) => (
          <Card key={k}>
            <CardHeader>
              <CardTitle className="text-sm">{k}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{v}</CardContent>
          </Card>
        ))}
      </div>
      {analytics && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="h-80">
            <CardHeader>
              <CardTitle>Bookings by status</CardTitle>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analytics.bookingsByStatus} dataKey="count" nameKey="status" outerRadius={80} label>
                    {analytics.bookingsByStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="h-80">
            <CardHeader>
              <CardTitle>Revenue by month</CardTitle>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...(analytics.revenueByMonth || [])].reverse()}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
