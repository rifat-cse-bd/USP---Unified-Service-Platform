import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as React from 'react';
import { ArrowRight, CheckCircle2, Shield, Star, Users } from 'lucide-react';
import api from '@/services/api';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const stats = [
  { label: 'Verified workers', value: '2.4k+', icon: Users },
  { label: 'Jobs completed', value: '18k+', icon: CheckCircle2 },
  { label: 'Avg. rating', value: '4.9', icon: Star },
  { label: 'Cities covered', value: '12', icon: Shield },
];

const testimonials = [
  { name: 'Ayesha Rahman', role: 'Customer', quote: 'WorkSure matched us with a vetted cleaner in hours. Payments were transparent.' },
  { name: 'Imran Hossain', role: 'Worker', quote: 'The dashboard keeps my bookings and payouts organized. Verification was smooth.' },
  { name: 'Samira Khan', role: 'Operations', quote: 'We use WorkSure for office catering rotation — invoices are always attached.' },
];

const pricing = [
  { name: 'Starter', price: 'Free', desc: 'Browse services, wishlist, and book pay-as-you-go.', cta: 'Create account', href: '/register' },
  { name: 'Pro Teams', price: '৳2,999/mo', desc: 'Priority matching, consolidated billing, and SLA-backed support.', cta: 'Talk to sales', href: '/contact' },
  { name: 'Enterprise', price: 'Custom', desc: 'Dedicated success manager, compliance exports, and SSO.', cta: 'Book a demo', href: '/contact' },
];

export function HomePage() {
  const [categories, setCategories] = React.useState([]);
  React.useEffect(() => {
    api.get('/services/categories').then(({ data }) => setCategories(data.categories || []));
  }, []);

  return (
    <div>
      <section className="gradient-hero relative overflow-hidden">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-20 lg:flex-row lg:items-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex-1 space-y-6">
            <Badge variant="secondary" className="w-fit">
              Integrated service marketplace
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Hire trusted professionals for every{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">real-world</span> need.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              WorkSure connects customers with verified workers across cleaning, catering, security, electrical, pet care, and babysitting — with
              bookings, reviews, mock bKash/Nagad payments, and realtime updates.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/search">
                  Explore workers <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/services">Browse services</Link>
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.45 }}
            className="glass flex-1 rounded-3xl p-6 shadow-2xl"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {stats.map((s, i) => (
                <Card key={s.label} className="border-border/60 bg-background/60">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
                    <s.icon className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{s.value}</div>
                    <p className="text-xs text-muted-foreground">Live platform metrics (seed demo)</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-4 py-16">
        <motion.div className="flex flex-wrap items-end justify-between gap-4" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Marketplace sectors</h2>
            <p className="mt-2 text-muted-foreground">Pick a service — browse all available workers in that sector.</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/services">View all</Link>
          </Button>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 9).map((c, idx) => {
            const Icon = getCategoryIcon(c.icon);
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.04 }}>
                <Link to={`/services/${c.slug}`}>
                  <Card className="glass h-full border-border/70 transition-shadow hover:shadow-lg">
                    <CardHeader className="flex flex-row items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <CardTitle className="text-base">{c.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">{c.description}</CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-4 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Loved by households and teams</h2>
          <p className="mt-2 text-muted-foreground">Glassmorphism cards, motion, and responsive dashboards out of the box.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, idx) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}>
              <Card className="h-full border-border/70">
                <CardHeader>
                  <CardTitle className="text-base">{t.name}</CardTitle>
                  <CardDescription>{t.role}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{t.quote}</CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Simple pricing</h2>
            <p className="mt-2 text-muted-foreground">Upgrade when you need orchestration, not friction.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {pricing.map((p) => (
              <Card key={p.name} className="flex flex-col border-border/70">
                <CardHeader>
                  <CardTitle>{p.name}</CardTitle>
                  <CardDescription>{p.desc}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-4">
                  <div className="text-3xl font-bold">{p.price}</div>
                  <Button asChild className="w-full">
                    <Link to={p.href}>{p.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
