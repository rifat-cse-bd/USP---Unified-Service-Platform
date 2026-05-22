import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function AdminPageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-1">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p> : null}
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description ? <p className="max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function AdminStatCard({ label, value, hint, icon: Icon, accent }) {
  return (
    <Card className={cn('overflow-hidden border-border/70', accent && 'border-primary/30 bg-primary/5')}>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {Icon ? (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function AdminLoadingRows({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function AdminEmptyState({ title, description }) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-14 text-center">
        <p className="text-lg font-medium">{title}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

const STATUS_VARIANT = {
  pending: 'secondary',
  accepted: 'outline',
  in_progress: 'default',
  completed: 'success',
  cancelled: 'destructive',
  rejected: 'destructive',
  open: 'destructive',
  reviewing: 'secondary',
  resolved: 'success',
  dismissed: 'outline',
  failed: 'destructive',
  refunded: 'outline',
};

export function StatusBadge({ status }) {
  const key = String(status || '').toLowerCase();
  const variant = STATUS_VARIANT[key] || 'secondary';
  const label = key.replace(/_/g, ' ');
  return (
    <Badge variant={variant} className="capitalize">
      {label || 'unknown'}
    </Badge>
  );
}

export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatMoney(amount) {
  return `৳${Number(amount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
