import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  Calendar,
  CreditCard,
  FileCheck,
  Heart,
  LayoutGrid,
  Package,
  Settings,
  Shield,
  ShoppingCart,
  Star,
  User,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { UserIdentityBadge } from '@/components/dashboard/dashboardUi';

const customerNav = [
  { to: '/customer/dashboard', label: 'Overview', icon: LayoutGrid },
  { to: '/customer/profile', label: 'Profile', icon: User },
  { to: '/customer/bookings', label: 'Booking history', icon: Calendar },
  { to: '/customer/orders', label: 'Current orders', icon: Package },
  { to: '/customer/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/customer/notifications', label: 'Notifications', icon: Bell },
  { to: '/customer/payments', label: 'Payments', icon: CreditCard },
  { to: '/customer/reviews', label: 'Reviews', icon: Star },
  { to: '/customer/complaints', label: 'Reports', icon: Shield },
  { to: '/customer/cart', label: 'Cart', icon: ShoppingCart },
];

const workerNav = [
  { to: '/worker/dashboard', label: 'Overview', icon: LayoutGrid },
  { to: '/worker/profile', label: 'Profile setup', icon: User },
  { to: '/worker/documents', label: 'Verification', icon: FileCheck },
  { to: '/worker/availability', label: 'Availability', icon: Calendar },
  { to: '/worker/services', label: 'Services', icon: Wrench },
  { to: '/worker/orders', label: 'Incoming orders', icon: Package },
  { to: '/worker/earnings', label: 'Earnings', icon: Wallet },
  { to: '/worker/reviews', label: 'Reviews', icon: Star },
  { to: '/worker/notifications', label: 'Notifications', icon: Bell },
];

const adminNav = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutGrid },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/workers', label: 'Workers', icon: Wrench },
  { to: '/admin/verify', label: 'Verify workers', icon: FileCheck },
  { to: '/admin/services', label: 'Services', icon: Settings },
  { to: '/admin/orders', label: 'Orders', icon: Package },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/complaints', label: 'Complaints', icon: Shield },
];

const VARIANT_LABEL = { admin: 'Admin panel', worker: 'Worker hub', customer: 'Customer hub' };

export function DashboardLayout({ variant }) {
  const location = useLocation();
  const { user } = useAuth();
  const nav = variant === 'admin' ? adminNav : variant === 'worker' ? workerNav : customerNav;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl gap-6 px-4 py-6 sm:py-8">
      <aside className="glass hidden w-64 shrink-0 flex-col rounded-2xl p-4 md:flex">
        <div className="mb-4 px-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{VARIANT_LABEL[variant]}</p>
        </div>
        <nav className="flex flex-col gap-0.5">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        {user ? (
          <div className="mt-auto border-t border-border/60 pt-4">
            <UserIdentityBadge user={user} className="w-full border-0 bg-muted/50 shadow-none" />
          </div>
        ) : null}
      </aside>

      <div className="min-w-0 flex-1 space-y-6">
        <div className="flex items-center justify-end md:hidden">
          {user ? <UserIdentityBadge user={user} size="compact" /> : null}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:hidden">
          {nav.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  active ? 'border-primary bg-primary text-primary-foreground' : 'border-border/60 bg-card text-muted-foreground'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <Outlet />
      </div>
    </div>
  );
}
