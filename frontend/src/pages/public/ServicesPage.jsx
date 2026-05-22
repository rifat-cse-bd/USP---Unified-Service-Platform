import * as React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  LayoutGrid,
  Search,
  Shield,
  Sparkles,
} from 'lucide-react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionHeader } from '@/components/marketing/SectionHeader';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { FALLBACK_MAJORS, imageSrc } from '@/lib/serviceCatalog';
import { SECTOR_COPY } from '@/lib/sectorCopy';

const PAGE_STATS = [
  { label: 'Core sectors', value: '6' },
  { label: 'Specialized sub-services', value: '38+' },
  { label: 'Verified worker network', value: '2,400+' },
  { label: 'Average satisfaction', value: '4.9★' },
];

const SERVICE_FAQ = [
  {
    q: 'What is the difference between a sector and a sub-service?',
    a: 'Sectors are broad categories like Cleaning or Security. Sub-services are specific jobs — for example “Kitchen Deep Degreasing” under Cleaning — so you match with the right professional.',
  },
  {
    q: 'Are all workers verified?',
    a: 'Workers can complete document verification and earn a verified badge. You can filter search results to show verified professionals only.',
  },
  {
    q: 'Can I book for my business?',
    a: 'Yes. Many sub-services support offices, retail, and events. Pro Teams and Enterprise plans add consolidated billing for recurring bookings.',
  },
];

export function ServicesPage() {
  const [majors, setMajors] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [apiError, setApiError] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setApiError(null);

    api
      .get('/services/categories', { timeout: 8000 })
      .then(({ data }) => {
        if (cancelled) return;
        const list = data.majors || [];
        setMajors(list.length ? list : FALLBACK_MAJORS);
      })
      .catch((err) => {
        if (cancelled) return;
        setApiError(err.message || 'Cannot reach API');
        setMajors(FALLBACK_MAJORS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const list = majors.length ? majors : FALLBACK_MAJORS;
  const totalSubs = list.reduce((n, m) => n + (m.subfeatures?.length || 0), 0);

  return (
    <div className="pb-20">
      {/* Page hero */}
      <section className="gradient-hero border-b border-border/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-6">
            <div className="flex items-center gap-2 text-primary">
              <LayoutGrid className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-widest">Services directory</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Every service your property and team needs —{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">organized and verified</span>
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              WorkSure groups professionals into six major sectors. Each sector offers specialized sub-services with clear
              descriptions, imagery, and direct access to rated workers in your city.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-xl">
                <Link to="/search">
                  <Search className="h-4 w-4" /> Search all workers
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <Link to="/register">List your skills as a pro</Link>
              </Button>
            </div>
          </motion.div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {PAGE_STATS.map((s) => (
              <div key={s.label} className="glass rounded-2xl px-5 py-4 text-center">
                <div className="text-2xl font-bold text-primary sm:text-3xl">{s.value}</div>
                <div className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-16">
        {apiError && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 text-sm">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-medium text-foreground">Showing offline catalog</p>
              <p className="mt-1 text-muted-foreground">
                Start the API with <code className="rounded bg-muted px-1">cd backend && npm run dev</code> for live worker counts.
              </p>
            </div>
          </div>
        )}

        <SectionHeader
          eyebrow="Browse by sector"
          title={`${list.length} major sectors · ${totalSubs || '38+'} specialized services`}
          description="Select a sector to explore sub-services, compare professionals, and book with transparent pricing. Each listing includes photos, scope descriptions, and worker availability."
        />

        {loading ? (
          <div className="space-y-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            {list.map((sector, index) => {
              const Icon = getCategoryIcon(sector.icon);
              const cover = imageSrc(sector.image_url);
              const copy = SECTOR_COPY[sector.slug] || {};
              const subs = sector.subfeatures || [];
              const subCount = subs.length;

              return (
                <motion.article
                  key={sector.id || sector.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.04 }}
                  className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm"
                >
                  <div className="grid lg:grid-cols-5">
                    <div className="relative lg:col-span-2">
                      {cover ? (
                        <img src={cover} alt={sector.name} className="h-full min-h-[16rem] w-full object-cover lg:min-h-full" loading="lazy" />
                      ) : (
                        <div className="flex min-h-[16rem] items-center justify-center bg-muted lg:min-h-full">
                          <Icon className="h-16 w-16 text-primary/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 hidden bg-gradient-to-r from-transparent to-card/80 lg:block" />
                    </div>

                    <div className="flex flex-col justify-between gap-6 p-8 lg:col-span-3">
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                            <Icon className="h-6 w-6" />
                          </span>
                          <div>
                            <h2 className="text-2xl font-bold tracking-tight">{sector.name}</h2>
                            {copy.tagline ? <p className="text-sm font-medium text-primary">{copy.tagline}</p> : null}
                          </div>
                          {subCount > 0 ? <Badge variant="secondary" className="ml-auto">{subCount} sub-services</Badge> : null}
                        </div>

                        <p className="leading-relaxed text-muted-foreground">
                          {copy.intro || sector.description}
                        </p>

                        {copy.highlights?.length ? (
                          <ul className="grid gap-2 sm:grid-cols-3">
                            {copy.highlights.map((h) => (
                              <li key={h} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                {h}
                              </li>
                            ))}
                          </ul>
                        ) : null}

                        {subs.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Popular offerings</p>
                            <div className="flex flex-wrap gap-2">
                              {subs.slice(0, 5).map((sub) => (
                                <Badge key={sub.slug} variant="outline" className="font-normal">
                                  {sub.name}
                                </Badge>
                              ))}
                              {subs.length > 5 ? (
                                <Badge variant="outline" className="font-normal text-muted-foreground">
                                  +{subs.length - 5} more
                                </Badge>
                              ) : null}
                            </div>
                          </div>
                        ) : null}

                        {copy.idealFor?.length ? (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Ideal for:</span> {copy.idealFor.join(' · ')}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button asChild size="lg" className="rounded-xl gap-2">
                          <Link to={`/services/${sector.slug}`}>
                            Explore {sector.name} <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="rounded-xl">
                          <Link to={`/search?category=${subs[0]?.slug || sector.slug}`}>Find workers now</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {/* Trust band */}
        <div className="grid gap-6 rounded-3xl border border-border/70 bg-muted/30 p-8 sm:grid-cols-3">
          <div className="flex gap-4">
            <Shield className="h-10 w-10 shrink-0 text-primary" />
            <div>
              <h3 className="font-semibold">Vetted supply</h3>
              <p className="mt-1 text-sm text-muted-foreground">Document checks and admin review before workers earn verified status.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <BadgeCheck className="h-10 w-10 shrink-0 text-primary" />
            <div>
              <h3 className="font-semibold">Clear scope</h3>
              <p className="mt-1 text-sm text-muted-foreground">Each sub-service explains what is included so expectations match delivery.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Sparkles className="h-10 w-10 shrink-0 text-primary" />
            <div>
              <h3 className="font-semibold">One platform</h3>
              <p className="mt-1 text-sm text-muted-foreground">Book, pay, chat, and review without switching apps or chasing receipts.</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-8">
          <SectionHeader eyebrow="FAQ" title="Common questions about our services" align="center" />
          <div className="mx-auto grid max-w-4xl gap-4">
            {SERVICE_FAQ.map((item) => (
              <Card key={item.q} className="border-border/70">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{item.q}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-muted-foreground">{item.a}</CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            More answers on our <Link to="/faq" className="font-medium text-primary hover:underline">FAQ page</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
