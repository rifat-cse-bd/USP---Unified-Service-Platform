import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as React from 'react';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Layers,
  MapPin,
  MessageSquare,
  Shield,
  Star,
  Users,
  Zap,
} from 'lucide-react';
import api from '@/services/api';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { HOW_IT_WORKS, PLATFORM_FEATURES } from '@/lib/sectorCopy';
import { SectionHeader } from '@/components/marketing/SectionHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const FEATURE_ICONS = {
  Shield,
  CircleDollarSign,
  Zap,
  Layers,
  Star,
  MapPin,
};

const stats = [
  { label: 'Verified workers', value: '2,400+', detail: 'ID & document reviewed', icon: Users },
  { label: 'Jobs completed', value: '18,000+', detail: 'Across six core sectors', icon: CheckCircle2 },
  { label: 'Average rating', value: '4.9 / 5', detail: 'From verified reviews', icon: Star },
  { label: 'Cities active', value: '12+', detail: 'Dhaka, Chattogram & more', icon: Shield },
];

const trustBadges = ['Background checks', 'Secure payments', 'Live booking chat', 'Admin oversight'];

const testimonials = [
  {
    name: 'Ayesha Rahman',
    role: 'Homeowner · Dhaka',
    quote:
      'We booked a deep clean through WorkSure and had a verified team the same week. Pricing was clear on the invoice, and the worker sent updates before arriving.',
    rating: 5,
  },
  {
    name: 'Imran Hossain',
    role: 'Electrician · WorkSure Pro',
    quote:
      'My dashboard shows every booking, payout, and review in one place. Verification took a few days, but clients trust the badge on my profile.',
    rating: 5,
  },
  {
    name: 'Samira Khan',
    role: 'Office Manager · Gulshan',
    quote:
      'Corporate lunch catering rotates between three vetted vendors. Consolidated history helps our finance team — no more scattered receipts.',
    rating: 5,
  },
];

const pricing = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'for customers',
    desc: 'Everything you need to discover, book, and pay as you go.',
    features: ['Browse 38+ sub-services', 'Wishlist & cart', 'Reviews & notifications', 'Mock bKash / Nagad demo'],
    cta: 'Create free account',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Pro Teams',
    price: '৳2,999',
    period: '/ month',
    desc: 'For households and small teams that book services regularly.',
    features: ['Priority worker matching', 'Consolidated billing', 'Dedicated support queue', 'SLA-backed response times'],
    cta: 'Talk to sales',
    href: '/contact',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'annual contracts',
    desc: 'Multi-site operations, compliance exports, and custom onboarding.',
    features: ['Success manager', 'Bulk worker pools', 'Custom categories', 'SSO & audit logs (roadmap)'],
    cta: 'Book a demo',
    href: '/contact',
    highlighted: false,
  },
];

export function HomePage() {
  const [categories, setCategories] = React.useState([]);

  React.useEffect(() => {
    api.get('/services/categories').then(({ data }) => setCategories(data.majors || data.categories || []));
  }, []);

  const totalSubs = categories.reduce((n, c) => n + (c.subfeatures?.length || 0), 0);

  return (
    <div className="pb-4">
      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24 lg:py-28">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="flex-1 space-y-8"
            >
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold">
                  Bangladesh&apos;s integrated service marketplace
                </Badge>
                <Badge variant="outline" className="gap-1 px-3 py-1 text-xs">
                  <BadgeCheck className="h-3.5 w-3.5 text-primary" /> Verified pros only
                </Badge>
              </div>

              <div className="space-y-5">
                <h1 className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                  Professional services for your home, team, and{' '}
                  <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                    every real-world need
                  </span>
                </h1>
                <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  WorkSure unifies cleaning, electrical, security, catering, childcare, and pet care under one trusted
                  platform — with specialized sub-services, transparent pricing, and end-to-end booking from first click
                  to final review.
                </p>
              </div>

              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {trustBadges.map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    {t}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="h-12 rounded-xl px-8 text-base shadow-lg">
                  <Link to="/search">
                    Find a professional <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-xl px-8 text-base">
                  <Link to="/services">Explore all services</Link>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">6 major sectors</span>
                {totalSubs > 0 ? (
                  <>
                    {' '}
                    · <span className="font-medium text-foreground">{totalSubs} specialized offerings</span>
                  </>
                ) : null}{' '}
                · Serving households and businesses nationwide
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12, duration: 0.5 }}
              className="w-full lg:max-w-md xl:max-w-lg"
            >
              <div className="glass rounded-3xl p-6 shadow-2xl">
                <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">Platform at a glance</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {stats.map((s) => (
                    <Card key={s.label} className="border-border/60 bg-background/70">
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium leading-snug">{s.label}</CardTitle>
                        <s.icon className="h-4 w-4 shrink-0 text-primary" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold tracking-tight">{s.value}</div>
                        <p className="mt-1 text-xs text-muted-foreground">{s.detail}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="mx-auto max-w-7xl space-y-12 px-4 py-20">
        <SectionHeader
          eyebrow="Service catalog"
          title="Six core sectors, dozens of specialists"
          description="Every major category breaks down into focused sub-services — so you book exactly what you need, whether it's a wedding buffet, night security, or post-construction cleaning."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 6).map((c, idx) => {
            const Icon = getCategoryIcon(c.icon);
            const cover = c.image_url?.startsWith('/') ? c.image_url : null;
            const subCount = c.subfeatures?.length ?? 0;
            return (
              <motion.div
                key={c.id || c.slug}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link to={`/services/${c.slug}`} className="group block h-full">
                  <Card className="card-lift h-full overflow-hidden border-border/70">
                    <div className="relative">
                      {cover ? (
                        <img src={cover} alt={c.name} className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      ) : (
                        <div className="flex h-40 items-center justify-center bg-muted">
                          <Icon className="h-12 w-12 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                          <Icon className="h-5 w-5" />
                        </span>
                        {subCount > 0 ? (
                          <Badge className="bg-background/90 text-foreground backdrop-blur">{subCount} services</Badge>
                        ) : null}
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg group-hover:text-primary">{c.name}</CardTitle>
                      <CardDescription className="line-clamp-2 leading-relaxed">{c.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                        View sub-services <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
        <div className="flex justify-center">
          <Button asChild size="lg" variant="outline" className="rounded-xl">
            <Link to="/services">
              See full services directory <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section className="section-muted py-20">
        <div className="mx-auto max-w-7xl space-y-14 px-4">
          <SectionHeader
            eyebrow="How it works"
            title="From browse to booked in four clear steps"
            description="No phone-tag or unclear quotes. WorkSure keeps discovery, booking, payment, and follow-up in one professional workflow."
            align="center"
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                className="relative rounded-2xl border border-border/70 bg-card p-6 shadow-sm"
              >
                <span className="text-4xl font-bold text-primary/20">{item.step}</span>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why WorkSure */}
      <section className="mx-auto max-w-7xl space-y-14 px-4 py-20">
        <SectionHeader
          eyebrow="Why WorkSure"
          title="Enterprise-grade trust, built for everyday bookings"
          description="Whether you're hiring a weekend sitter or securing a retail storefront, the same verification, payments, and support infrastructure applies."
          align="center"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORM_FEATURES.map((f, idx) => {
            const Icon = FEATURE_ICONS[f.icon] || Shield;
            return (
              <Card key={f.title} className="border-border/70">
                <CardHeader>
                  <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-muted-foreground">{f.description}</CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-muted py-20">
        <div className="mx-auto max-w-7xl space-y-12 px-4">
          <SectionHeader
            eyebrow="Customer stories"
            title="Trusted by households, professionals, and teams"
            description="Real feedback from customers, service providers, and operations leads using WorkSure every week."
            align="center"
          />
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((t, idx) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.06 }}>
                <Card className="h-full border-border/70 bg-card/80">
                  <CardHeader>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <CardDescription className="mt-4 text-base leading-relaxed text-foreground">&ldquo;{t.quote}&rdquo;</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-7xl space-y-12 px-4 py-20">
        <SectionHeader
          eyebrow="Plans"
          title="Start free, scale when your team does"
          description="Individuals book on demand. Growing teams unlock priority matching and consolidated billing without changing how workers get paid."
          align="center"
        />
        <div className="grid gap-8 lg:grid-cols-3">
          {pricing.map((p) => (
            <Card
              key={p.name}
              className={`flex flex-col ${p.highlighted ? 'border-primary shadow-lg ring-2 ring-primary/20' : 'border-border/70'}`}
            >
              {p.highlighted ? (
                <div className="rounded-t-xl bg-primary px-4 py-2 text-center text-xs font-semibold text-primary-foreground">Most popular for teams</div>
              ) : null}
              <CardHeader>
                <CardTitle className="text-xl">{p.name}</CardTitle>
                <CardDescription className="leading-relaxed">{p.desc}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-6">
                <div>
                  <span className="text-4xl font-bold">{p.price}</span>
                  <span className="text-muted-foreground"> {p.period}</span>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-auto w-full rounded-xl" variant={p.highlighted ? 'default' : 'outline'}>
                  <Link to={p.href}>{p.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-10 sm:p-14">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to hire with confidence?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Search verified professionals in your city, or browse our full services directory to find the right specialist in minutes.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="rounded-xl px-8">
                <Link to="/register">Create your account</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl px-8">
                <Link to="/contact">Contact our team</Link>
              </Button>
            </div>
            <p className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Book in minutes
              </span>
              <span className="inline-flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" /> In-app chat
              </span>
              <span className="inline-flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Verified profiles
              </span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
