import * as React from 'react';
import api from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';

function docStatusVariant(status) {
  if (status === 'approved') return 'success';
  if (status === 'rejected') return 'destructive';
  return 'secondary';
}

export function AdminUsersPage() {
  const toast = useToast();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState(null);

  const load = React.useCallback(() => {
    setLoading(true);
    api
      .get('/admin/users', { params: { limit: 100 } })
      .then(({ data }) => setRows(data.data || []))
      .catch((e) =>
        toast({ title: 'Failed to load users', description: e.response?.data?.message || e.message })
      )
      .finally(() => setLoading(false));
  }, [toast]);

  React.useEffect(() => {
    load();
  }, [load]);

  const ban = async (id, shouldBan) => {
    setBusyId(id);
    try {
      const { data } = await api.patch(`/admin/users/${id}/ban`, { is_banned: shouldBan });
      toast({
        title: shouldBan ? 'User banned' : 'User unbanned',
        description: data.message || 'Status updated successfully',
      });
      load();
    } catch (e) {
      toast({
        title: 'Action failed',
        description: e.response?.data?.message || e.message,
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Users</h1>
      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {!loading && !rows.length && <p className="text-sm text-muted-foreground">No users found.</p>}
      {rows.map((u) => {
        const isAdmin = u.role === 'admin';
        const banned = Boolean(Number(u.is_banned));
        return (
          <Card key={u.id} className={banned ? 'border-red-500/30' : ''}>
            <CardContent className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{u.full_name}</span>
                  <Badge variant="secondary">{u.role}</Badge>
                  {banned ? (
                    <Badge variant="destructive">Banned</Badge>
                  ) : (
                    <Badge variant="success">Active</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{u.email}</div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isAdmin || banned || busyId === u.id}
                  onClick={() => ban(u.id, true)}
                >
                  {busyId === u.id ? '...' : 'Ban'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={isAdmin || !banned || busyId === u.id}
                  onClick={() => ban(u.id, false)}
                >
                  Unban
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function AdminWorkersPage() {
  const [rows, setRows] = React.useState([]);
  React.useEffect(() => {
    api.get('/admin/workers').then(({ data }) => setRows(data.data || []));
  }, []);
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Workers</h1>
      {rows.map((w) => (
        <Card key={w.id}>
          <CardContent className="py-3 text-sm">
            <div className="font-medium">{w.full_name}</div>
            <div className="text-xs text-muted-foreground">{w.email}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AdminVerifyPage() {
  const toast = useToast();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState(null);

  const load = React.useCallback(() => {
    setLoading(true);
    api
      .get('/admin/documents')
      .then(({ data }) => setRows(data.data || []))
      .catch((e) =>
        toast({ title: 'Failed to load documents', description: e.response?.data?.message || e.message })
      )
      .finally(() => setLoading(false));
  }, [toast]);

  React.useEffect(() => {
    load();
  }, [load]);

  const decide = async (id, status, workerName) => {
    setBusyId(id);
    try {
      const { data } = await api.patch(`/admin/documents/${id}`, {
        status,
        admin_note: 'Reviewed in admin UI',
      });
      toast({
        title: status === 'approved' ? 'Worker verified' : 'Document rejected',
        description: data.message || `${workerName} — ${status}`,
      });
      load();
    } catch (e) {
      toast({
        title: 'Verification failed',
        description: e.response?.data?.message || e.message,
      });
    } finally {
      setBusyId(null);
    }
  };

  const pending = rows.filter((d) => d.status === 'pending');

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Verify workers</h1>
      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {!loading && !pending.length && (
        <p className="text-sm text-muted-foreground">No pending documents to review.</p>
      )}
      {pending.map((d) => (
        <Card key={d.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{d.worker_name}</span>
                <Badge variant="secondary">Pending</Badge>
              </div>
              <div className="text-xs text-muted-foreground">{d.doc_type}</div>
              <a className="text-xs text-primary underline" href={d.file_url} target="_blank" rel="noreferrer">
                View file
              </a>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                disabled={busyId === d.id}
                onClick={() => decide(d.id, 'approved', d.worker_name)}
              >
                {busyId === d.id ? '...' : 'Approve'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={busyId === d.id}
                onClick={() => decide(d.id, 'rejected', d.worker_name)}
              >
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {!loading && rows.length > pending.length && (
        <div className="space-y-2 pt-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Recently reviewed</h2>
          {rows
            .filter((d) => d.status !== 'pending')
            .slice(0, 10)
            .map((d) => (
              <Card key={`done-${d.id}`} className="opacity-80">
                <CardContent className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <div>
                    <span className="font-medium">{d.worker_name}</span>
                    <span className="mx-2 text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{d.doc_type}</span>
                  </div>
                  <Badge variant={docStatusVariant(d.status)}>{d.status}</Badge>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}

export function AdminServicesPage() {
  const [rows, setRows] = React.useState([]);
  React.useEffect(() => {
    api.get('/admin/services').then(({ data }) => setRows(data.data || []));
  }, []);
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Services</h1>
      {rows.map((s) => (
        <Card key={s.id}>
          <CardContent className="py-3 text-sm">
            {s.title} — {s.worker_name}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AdminOrdersPage() {
  const [rows, setRows] = React.useState([]);
  React.useEffect(() => {
    api.get('/admin/bookings').then(({ data }) => setRows(data.data || []));
  }, []);
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Orders</h1>
      {rows.map((b) => (
        <Card key={b.id}>
          <CardContent className="py-3 text-sm">
            #{b.id} {b.service_title} — {b.status}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AdminPaymentsPage() {
  const [rows, setRows] = React.useState([]);
  React.useEffect(() => {
    api.get('/admin/payments').then(({ data }) => setRows(data.data || []));
  }, []);
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Payments</h1>
      {rows.map((p) => (
        <Card key={p.id}>
          <CardContent className="py-3 text-sm">
            ৳{p.amount} — {p.provider} — {p.status}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AdminReviewsPage() {
  const [rows, setRows] = React.useState([]);
  React.useEffect(() => {
    api.get('/admin/reviews').then(({ data }) => setRows(data.data || []));
  }, []);
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Reviews</h1>
      {rows.map((r) => (
        <Card key={r.id}>
          <CardContent className="py-3 text-sm">
            {r.reviewer_name}: {r.rating}★ {r.comment}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const ORDER_STATUS_SECTIONS = [
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted (not started)' },
  { key: 'in_progress', label: 'In progress (started)' },
  { key: 'completed', label: 'Completed' },
];

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

function OrderStatusSection({ label, orders }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">{label}</h3>
          <Badge variant="secondary">
            {orders.length} order{orders.length === 1 ? '' : 's'}
          </Badge>
        </div>
        {!orders.length ? (
          <p className="text-sm text-muted-foreground">No orders in this status.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div
                key={o.id}
                className="rounded-lg border border-border/60 p-3 text-sm space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">Order #{o.id}</span>
                  <span className="text-xs text-muted-foreground">{o.service_title}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md bg-muted/40 p-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Customer</p>
                    <p className="font-medium">{o.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{o.customer_email}</p>
                    {o.customer_phone && (
                      <p className="text-xs text-muted-foreground">{o.customer_phone}</p>
                    )}
                  </div>
                  <div className="rounded-md bg-muted/40 p-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Worker</p>
                    <p className="font-medium">{o.worker_name}</p>
                    <p className="text-xs text-muted-foreground">{o.worker_email}</p>
                    {o.worker_phone && (
                      <p className="text-xs text-muted-foreground">{o.worker_phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>Scheduled: {formatDateTime(o.scheduled_at)}</span>
                  <span>Total: ৳{Number(o.total_price).toFixed(0)}</span>
                  <span>Booked: {formatDateTime(o.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    api
      .get('/admin/analytics')
      .then(({ data }) => setAnalytics(data))
      .finally(() => setLoading(false));
  }, []);
  const bookingsByStatus = analytics?.bookingsByStatus || [];
  const revenueByMonth = analytics?.revenueByMonth || [];
  const topWorkers = analytics?.topWorkers || [];
  const ordersByStatus = analytics?.ordersByStatus || {};

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports & analytics</h1>
      {loading && <p className="text-sm text-muted-foreground">Loading analytics...</p>}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 font-semibold">Bookings by status</h3>
            <div className="space-y-2 text-sm">
              {bookingsByStatus.map((r) => (
                <div key={r.status} className="flex justify-between">
                  <span className="capitalize">{String(r.status).replace(/_/g, ' ')}</span>
                  <span className="font-medium">{r.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 font-semibold">Revenue by month</h3>
            <div className="space-y-2 text-sm">
              {revenueByMonth.map((r) => (
                <div key={r.month} className="flex justify-between">
                  <span>{r.month}</span>
                  <span className="font-medium">৳{Number(r.total).toFixed(0)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 font-semibold">Top workers</h3>
          <div className="space-y-2 text-sm">
            {topWorkers.map((w) => (
              <div key={w.id} className="flex justify-between">
                <span>{w.full_name}</span>
                <span>
                  {w.rating_avg}★ · {w.rating_count} reviews
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Orders by status</h2>
        <p className="text-sm text-muted-foreground">
          Pipeline: pending → accepted → in progress → completed
        </p>
        {ORDER_STATUS_SECTIONS.map(({ key, label }) => (
          <OrderStatusSection key={key} label={label} orders={ordersByStatus[key] || []} />
        ))}
      </div>
    </div>
  );
}

export function AdminComplaintsPage() {
  const toast = useToast();
  const [rows, setRows] = React.useState([]);
  const [busyId, setBusyId] = React.useState(null);

  const load = React.useCallback(() => {
    api.get('/admin/complaints').then(({ data }) => setRows(data.data || []));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const resolve = async (id) => {
    setBusyId(id);
    try {
      await api.patch(`/admin/complaints/${id}`, {
        status: 'resolved',
        resolution_note: 'Handled via admin UI',
      });
      toast({ title: 'Complaint resolved', description: 'Marked as resolved' });
      load();
    } catch (e) {
      toast({
        title: 'Failed to resolve',
        description: e.response?.data?.message || e.message,
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Complaints</h1>
      {rows.map((c) => (
        <Card key={c.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
            <div>
              <div className="font-medium">{c.subject}</div>
              <div className="text-xs text-muted-foreground">{c.message}</div>
            </div>
            <Button
              type="button"
              size="sm"
              disabled={c.status === 'resolved' || busyId === c.id}
              onClick={() => resolve(c.id)}
            >
              {busyId === c.id ? '...' : 'Mark resolved'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
