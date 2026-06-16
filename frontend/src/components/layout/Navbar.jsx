import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Moon, Sun, LogOut, LayoutDashboard, Sparkles } from 'lucide-react';
import * as React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { UserIdentityBadge } from '@/components/dashboard/dashboardUi';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const links = [
  { to: '/services', label: 'Services' },
  { to: '/search', label: 'Search' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/faq', label: 'FAQ' },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const dash = user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'worker' ? '/worker/dashboard' : '/customer/dashboard';

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-lg text-transparent">WorkSure</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                  isActive && 'bg-muted text-foreground'
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button type="button" variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {user ? (
            <>
              <UserIdentityBadge user={user} size="compact" />
              <Button variant="secondary" asChild className="rounded-xl">
                <Link to={dash}>
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={() => { logout(); navigate('/'); }}>
                <LogOut className="h-4 w-4" /> Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="rounded-xl">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild className="rounded-xl">
                <Link to="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {user ? <UserIdentityBadge user={user} size="compact" showRole={false} /> : null}
          <Button type="button" variant="ghost" size="icon" onClick={toggle}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setOpen((o) => !o)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/60 md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {user ? (
                <div className="mb-2 px-1">
                  <UserIdentityBadge user={user} className="w-full" />
                </div>
              ) : null}
              {links.map((l) => (
                <Link key={l.to} to={l.to} className="rounded-lg px-3 py-2 text-sm font-medium" onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link to={dash} className="rounded-lg px-3 py-2 text-sm font-medium" onClick={() => setOpen(false)}>
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    className="rounded-lg px-3 py-2 text-left text-sm font-medium"
                    onClick={() => {
                      logout();
                      setOpen(false);
                      navigate('/');
                    }}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium" onClick={() => setOpen(false)}>
                    Log in
                  </Link>
                  <Link to="/register" className="rounded-lg px-3 py-2 text-sm font-medium" onClick={() => setOpen(false)}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
