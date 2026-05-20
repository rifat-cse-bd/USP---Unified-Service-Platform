import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const customerNav = [
  { to: '/customer/dashboard', label: 'Overview' },
  { to: '/customer/profile', label: 'Profile' },
  { to: '/customer/bookings', label: 'Booking history' },
  { to: '/customer/orders', label: 'Current orders' },
  { to: '/customer/wishlist', label: 'Wishlist' },
  { to: '/customer/notifications', label: 'Notifications' },
  { to: '/customer/payments', label: 'Payments' },
  { to: '/customer/reviews', label: 'Reviews' },
  { to: '/customer/complaints', label: 'Reports' },
  { to: '/customer/cart', label: 'Cart' },
];

const workerNav = [
  { to: '/worker/dashboard', label: 'Overview' },
  { to: '/worker/profile', label: 'Profile setup' },
  { to: '/worker/documents', label: 'Verification' },
  { to: '/worker/availability', label: 'Availability' },
  { to: '/worker/services', label: 'Services' },
  { to: '/worker/orders', label: 'Incoming orders' },
  { to: '/worker/earnings', label: 'Earnings' },
  { to: '/worker/reviews', label: 'Reviews' },
  { to: '/worker/notifications', label: 'Notifications' },
];

const adminNav = [
  { to: '/admin/dashboard', label: 'Overview' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/workers', label: 'Workers' },
  { to: '/admin/verify', label: 'Verify workers' },
  { to: '/admin/services', label: 'Services' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/payments', label: 'Payments' },
  { to: '/admin/reviews', label: 'Reviews' },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/complaints', label: 'Complaints' },
];

export function DashboardLayout({ variant }) {
  const location = useLocation();
  const { user } = useAuth();
  const nav = variant === 'admin' ? adminNav : variant === 'worker' ? workerNav : customerNav;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl gap-6 px-4 py-8">
      <aside className="glass hidden w-64 shrink-0 flex-col rounded-2xl p-4 md:flex">
        <div className="mb-4 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {variant === 'admin' ? 'Admin' : variant === 'worker' ? 'Worker' : 'Customer'}
        </div>
        <nav className="flex flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                location.pathname === item.to && 'bg-primary/10 text-primary'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-border/60 pt-4 text-xs text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{user?.full_name}</span>
        </div>
      </aside>
      <div className="min-w-0 flex-1 space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'whitespace-nowrap rounded-full border border-border/60 px-3 py-1 text-xs font-medium',
                location.pathname === item.to && 'border-primary bg-primary/10 text-primary'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <Outlet />
      </div>
    </div>
  );
}
