import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare, Shield, User, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ROLE_META = {
  admin: { label: 'Admin', icon: Shield, className: 'bg-violet-500/15 text-violet-700 dark:text-violet-300' },
  worker: { label: 'Worker', icon: Wrench, className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
  customer: { label: 'Customer', icon: User, className: 'bg-primary/15 text-primary' },
};

export function UserIdentityBadge({ user, className, showRole = true, size = 'default' }) {
  if (!user) return null;
  const meta = ROLE_META[user.role] || ROLE_META.customer;
  const Icon = meta.icon;
  const initial = user.full_name?.charAt(0)?.toUpperCase() || '?';
  const compact = size === 'compact';

  return (
    <div
      className={cn(
        'flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/80 px-2.5 py-1.5 shadow-sm backdrop-blur-sm',
        compact && 'gap-2 px-2 py-1',
        className
      )}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/25 to-accent/25 font-bold text-primary',
          compact ? 'h-8 w-8 text-sm' : 'h-9 w-9 text-base'
        )}
      >
        {initial}
      </span>
      <div className="min-w-0 text-left">
        <p className={cn('truncate font-semibold leading-tight', compact ? 'max-w-[120px] text-xs' : 'max-w-[160px] text-sm')}>
          {user.full_name}
        </p>
        {showRole ? (
          <Badge variant="outline" className={cn('mt-0.5 gap-1 border-0 px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide', meta.className)}>
            <Icon className="h-3 w-3" />
            {meta.label}
          </Badge>
        ) : null}
      </div>
    </div>
  );
}

export function DashboardPageHeader({ title, description, user, actions }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/30 p-5 shadow-sm">
      <div className="min-w-0 flex-1 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground sm:text-base">{description}</p> : null}
        {actions ? <div className="flex flex-wrap gap-2 pt-2">{actions}</div> : null}
      </div>
      {user ? <UserIdentityBadge user={user} className="shrink-0" /> : null}
    </div>
  );
}

export function QuickActionCard({ to, icon: Icon, title, description, accent }) {
  return (
    <Link
      to={to}
      className={cn(
        'group flex items-start gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md',
        accent && 'border-primary/25 bg-primary/5'
      )}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold group-hover:text-primary">{title}</p>
        {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100" />
    </Link>
  );
}

export function ChatLinkButton({ to, className }) {
  return (
    <Button asChild variant="outline" size="sm" className={cn('rounded-xl gap-1.5', className)}>
      <Link to={to}>
        <MessageSquare className="h-3.5 w-3.5" />
        Chat
      </Link>
    </Button>
  );
}
