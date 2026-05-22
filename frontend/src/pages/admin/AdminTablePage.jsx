import * as React from 'react';
import { Star } from 'lucide-react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import {
  AdminEmptyState,
  AdminLoadingRows,
  AdminPageHeader,
  formatDateTime,
  formatMoney,
  StatusBadge,
} from '@/components/admin/adminUi';

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
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState('all');

  React.useEffect(() => {
    setLoading(true);
    api
      .get('/admin/bookings')
      .then(({ data }) => setRows(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const counts = React.useMemo(() => {
    const c = { all: rows.length };
    for (const b of rows) c[b.status] = (c[b.status] || 0) + 1;
    return c;
  }, [rows]);

  const filtered = filter === 'all' ? rows : rows.filter((b) => b.status === filter);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Operations"
        title="Orders & bookings"
        description="Full booking pipeline — pending requests through completed jobs. Click status tabs to filter the list."
      />

      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'].map((s) => (
          <Button
            key={s}
            type="button"
            size="sm"
            variant={filter === s ? 'default' : 'outline'}
            className="rounded-full capitalize"
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? 'All' : s.replace(/_/g, ' ')} ({counts[s] || 0})
          </Button>
        ))}
      </div>

      {loading ? (
        <AdminLoadingRows count={5} />
      ) : !filtered.length ? (
        <AdminEmptyState
          title="No orders in this view"
          description="Run cd backend && npm run seed to load demo bookings, or switch to another status tab."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <Card key={b.id} className="border-border/70 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 bg-muted/30 px-5 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-lg font-bold">#{b.id}</span>
                    <StatusBadge status={b.status} />
                    {b.category_name ? <Badge variant="outline">{b.category_name}</Badge> : null}
                  </div>
                  <span className="text-lg font-semibold text-primary">{formatMoney(b.total_price)}</span>
                </div>
                <div className="grid gap-4 p-5 md:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Service</p>
                    <p className="mt-1 font-medium">{b.service_title}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Scheduled: {formatDateTime(b.scheduled_at)}</p>
                    <p className="text-xs text-muted-foreground">Booked: {formatDateTime(b.created_at)}</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer</p>
                    <p className="mt-1 font-medium">{b.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{b.customer_email}</p>
                    {b.customer_phone ? <p className="text-xs text-muted-foreground">{b.customer_phone}</p> : null}
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Worker</p>
                    <p className="mt-1 font-medium">{b.worker_name}</p>
                    <p className="text-xs text-muted-foreground">{b.worker_email}</p>
                    {b.worker_phone ? <p className="text-xs text-muted-foreground">{b.worker_phone}</p> : null}
                  </div>
                </div>
                {b.address ? (
                  <p className="border-t border-border/50 px-5 py-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Address:</span> {b.address}
                  </p>
                ) : null}
                {b.notes ? (
                  <p className="border-t border-border/50 px-5 py-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Notes:</span> {b.notes}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminPaymentsPage() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    api
      .get('/admin/payments')
      .then(({ data }) => setRows(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const completedTotal = rows.filter((p) => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0);
  const pendingCount = rows.filter((p) => p.status === 'pending').length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Finance"
        title="Payments"
        description="Track customer payments, platform commission, and worker payouts linked to bookings."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/70">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total transactions</p>
            <p className="mt-1 text-2xl font-bold">{rows.length}</p>
          </CardContent>
        </Card>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Completed volume</p>
            <p className="mt-1 text-2xl font-bold text-primary">{formatMoney(completedTotal)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Pending</p>
            <p className="mt-1 text-2xl font-bold">{pendingCount}</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <AdminLoadingRows count={5} />
      ) : !rows.length ? (
        <AdminEmptyState
          title="No payments recorded"
          description="Payments appear when bookings are paid. Re-run npm run seed to load demo completed transactions."
        />
      ) : (
        <div className="space-y-3">
          {rows.map((p) => (
            <Card key={p.id} className="border-border/70">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">Payment #{p.id}</span>
                    <StatusBadge status={p.status} />
                    <Badge variant="outline" className="uppercase">
                      {p.provider}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Booking #{p.booking_id} · {p.service_title}
                    {p.booking_status ? (
                      <>
                        {' '}
                        · <StatusBadge status={p.booking_status} />
                      </>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Payer: {p.payer_name} ({p.payer_email})
                  </p>
                  {p.invoice_number ? (
                    <p className="text-xs text-muted-foreground">Invoice: {p.invoice_number}</p>
                  ) : null}
                  {p.transaction_ref ? (
                    <p className="text-xs text-muted-foreground">Ref: {p.transaction_ref}</p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">{formatDateTime(p.created_at)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-2xl font-bold">{formatMoney(p.amount)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Platform: {formatMoney(p.platform_commission)} · Worker: {formatMoney(p.worker_payout)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminReviewsPage() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    api
      .get('/admin/reviews')
      .then(({ data }) => setRows(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const avgRating =
    rows.length > 0 ? (rows.reduce((s, r) => s + Number(r.rating), 0) / rows.length).toFixed(1) : '—';

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Quality"
        title="Customer reviews"
        description="Feedback left after completed bookings — used for worker reputation and marketplace trust."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/70">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total reviews</p>
            <p className="mt-1 text-2xl font-bold">{rows.length}</p>
          </CardContent>
        </Card>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Average rating</p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-primary">
              {avgRating}
              <Star className="h-6 w-6 fill-primary text-primary" />
            </p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <AdminLoadingRows count={4} />
      ) : !rows.length ? (
        <AdminEmptyState
          title="No reviews yet"
          description="Reviews are created after completed paid bookings. Run npm run seed to populate demo reviews."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((r) => (
            <Card key={r.id} className="border-border/70">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{r.reviewer_name}</CardTitle>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: Number(r.rating) }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
                <CardDescription>
                  {r.service_title} · Worker: {r.worker_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">&ldquo;{r.comment || 'No comment'}&rdquo;</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Booking #{r.booking_id} · {formatDateTime(r.created_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

const ORDER_STATUS_SECTIONS = [
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted (not started)' },
  { key: 'in_progress', label: 'In progress (started)' },
  { key: 'completed', label: 'Completed' },
];

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
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState(null);
  const [filter, setFilter] = React.useState('all');

  const load = React.useCallback(() => {
    setLoading(true);
    api
      .get('/admin/complaints')
      .then(({ data }) => setRows(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const resolve = async (id) => {
    setBusyId(id);
    try {
      await api.patch(`/admin/complaints/${id}`, {
        status: 'resolved',
        resolution_note: 'Handled via admin dashboard',
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

  const filtered = filter === 'all' ? rows : rows.filter((c) => c.status === filter);
  const openCount = rows.filter((c) => c.status === 'open' || c.status === 'reviewing').length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Support"
        title="Complaints & reports"
        description="Customer-submitted issues requiring review. Resolve or dismiss after investigation."
      />

      <div className="flex flex-wrap items-center gap-4">
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="px-5 py-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Needs attention</p>
            <p className="text-2xl font-bold">{openCount}</p>
          </CardContent>
        </Card>
        <div className="flex flex-wrap gap-2">
          {['all', 'open', 'reviewing', 'resolved', 'dismissed'].map((s) => (
            <Button
              key={s}
              type="button"
              size="sm"
              variant={filter === s ? 'default' : 'outline'}
              className="rounded-full capitalize"
              onClick={() => setFilter(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <AdminLoadingRows count={4} />
      ) : !filtered.length ? (
        <AdminEmptyState title="No complaints in this view" description="Try another filter or run npm run seed for demo data." />
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => (
            <Card key={c.id} className="border-border/70">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg font-semibold">{c.subject}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{c.message}</p>
                    <p className="text-xs text-muted-foreground">
                      Reported by <span className="font-medium text-foreground">{c.reporter_name}</span> ·{' '}
                      {formatDateTime(c.created_at)}
                    </p>
                    {c.resolution_note ? (
                      <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs">
                        <span className="font-medium">Resolution:</span> {c.resolution_note}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    {c.status !== 'resolved' && c.status !== 'dismissed' ? (
                      <Button type="button" size="sm" disabled={busyId === c.id} onClick={() => resolve(c.id)}>
                        {busyId === c.id ? 'Saving…' : 'Mark resolved'}
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
