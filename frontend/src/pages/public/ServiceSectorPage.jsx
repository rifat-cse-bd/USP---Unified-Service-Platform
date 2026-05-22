import * as React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Shield,
  Star,
} from 'lucide-react';
import api from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { SectionHeader } from '@/components/marketing/SectionHeader';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { getMajorMeta, getSubfeatureMeta, imageSrc } from '@/lib/serviceCatalog';
import { SECTOR_COPY } from '@/lib/sectorCopy';

const BOOKING_STEPS = [
  'Select your city and preferred date',
  'Review worker profiles, rates, and reviews',
  'Confirm scope in booking notes',
  'Pay securely and track status in your dashboard',
];

export function ServiceSectorPage() {
  const { majorSlug, subSlug } = useParams();
  const [params, setParams] = useSearchParams();
  const [major, setMajor] = React.useState(null);
  const [subfeatures, setSubfeatures] = React.useState([]);
  const [workers, setWorkers] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const q = params.get('q') || '';
  const city = params.get('city') || '';
  const minRating = params.get('minRating') || '';
  const verified = params.get('verified') || '';

  const fallbackMajor = getMajorMeta(majorSlug);
  const fallbackSub = subSlug ? getSubfeatureMeta(majorSlug, subSlug) : null;
  const sectorCopy = SECTOR_COPY[majorSlug] || {};
  const activeSub = subSlug ? subfeatures.find((s) => s.slug === subSlug) || fallbackSub?.sub : null;
  const categoryFilter = subSlug || majorSlug;

  React.useEffect(() => {
    const applyFallback = () => {
      const fb = getMajorMeta(majorSlug);
      if (!fb) return;
      setMajor({
        name: fb.name,
        slug: fb.slug,
        icon: fb.icon,
        description: fb.description,
        image_url: fb.image_url,
      });
      setSubfeatures(fb.subfeatures || []);
    };

    api
      .get('/services/categories')
      .then(({ data }) => {
        const majors = data.majors || [];
        const found = majors.find((m) => m.slug === majorSlug);
        if (found) {
          setMajor(found);
          setSubfeatures(found.subfeatures || []);
        } else {
          applyFallback();
        }
      })
      .catch(applyFallback);
  }, [majorSlug]);

  React.useEffect(() => {
    if (!subSlug) {
      setWorkers([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get('/workers/public', {
        params: {
          category: categoryFilter,
          q: q || undefined,
          city: city || undefined,
          minRating: minRating || undefined,
          verified: verified || undefined,
          limit: 50,
          page: 1,
        },
      })
      .then(({ data }) => {
        setWorkers(data.data || []);
        setTotal(data.pagination?.total ?? data.data?.length ?? 0);
      })
      .finally(() => setLoading(false));
  }, [subSlug, categoryFilter, q, city, minRating, verified]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const Icon = major ? getCategoryIcon(major.icon) : null;
  const heroImage = activeSub
    ? imageSrc(activeSub.image_url || activeSub.image)
    : imageSrc(major?.image_url) || imageSrc(fallbackMajor?.image_url);
  const displayTitle = activeSub?.name || major?.name || majorSlug;
  const displayDesc = activeSub?.description || sectorCopy.intro || major?.description || fallbackMajor?.description;
  const subs = subfeatures.length ? subfeatures : fallbackMajor?.subfeatures || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-20">
      {/* Breadcrumb */}
      <div className="border-b border-border/50 bg-muted/20">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
          <Link to="/services" className="hover:text-foreground">
            Services
          </Link>
          <span>/</span>
          <Link to={`/services/${majorSlug}`} className={subSlug ? 'hover:text-foreground' : 'font-medium text-foreground'}>
            {major?.name || majorSlug}
          </Link>
          {subSlug && activeSub ? (
            <>
              <span>/</span>
              <span className="font-medium text-foreground">{activeSub.name}</span>
            </>
          ) : null}
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {heroImage ? (
          <div className="relative h-[280px] sm:h-[340px]">
            <img src={heroImage} alt="" className="h-full w-full object-cover" />
            <div className="hero-image-overlay absolute inset-0" />
          </div>
        ) : (
          <div className="gradient-hero h-48" />
        )}
        <div className={`mx-auto max-w-7xl px-4 ${heroImage ? '-mt-32 relative sm:-mt-36' : 'pt-12'} pb-8`}>
          <Button asChild variant="ghost" size="sm" className="mb-4 gap-2 pl-0 text-muted-foreground hover:text-foreground">
            <Link to={subSlug ? `/services/${majorSlug}` : '/services'}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </Button>

          <div className="glass max-w-4xl rounded-3xl p-6 sm:p-8">
            <div className="flex flex-wrap items-start gap-4">
              {Icon ? (
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                  <Icon className="h-7 w-7" />
                </span>
              ) : null}
              <div className="min-w-0 flex-1 space-y-2">
                {sectorCopy.tagline && !subSlug ? (
                  <p className="text-sm font-semibold uppercase tracking-wide text-primary">{sectorCopy.tagline}</p>
                ) : null}
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{displayTitle}</h1>
                <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">{displayDesc}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {subSlug ? (
                    <Badge variant="secondary" className="gap-1">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      {total} professionals available
                    </Badge>
                  ) : (
                    <Badge variant="secondary">{subs.length} specialized sub-services</Badge>
                  )}
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="h-3.5 w-3.5" /> Bangladesh-wide
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4">
        {/* Major: intro + sub grid */}
        {!subSlug && (
          <>
            {sectorCopy.highlights?.length ? (
              <section className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-4">
                  <SectionHeader
                    eyebrow="Overview"
                    title={`Why book ${major?.name || 'this sector'} on WorkSure?`}
                    description={sectorCopy.intro || major?.description}
                  />
                  {sectorCopy.idealFor?.length ? (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Perfect for:</span> {sectorCopy.idealFor.join(' · ')}
                    </p>
                  ) : null}
                </div>
                <Card className="border-border/70">
                  <CardHeader>
                    <CardTitle className="text-lg">What you can expect</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {sectorCopy.highlights.map((h) => (
                      <div key={h} className="flex gap-3 text-sm">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{h}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            ) : null}

            <section className="space-y-8">
              <SectionHeader
                eyebrow="Choose a service"
                title="Select the exact job you need"
                description="Each card opens a curated list of verified professionals for that specific scope — with filters for city, rating, and verification status."
              />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {subs.map((sub, i) => (
                  <motion.div key={sub.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <Link to={`/services/${majorSlug}/${sub.slug}`} className="group block h-full">
                      <Card className="card-lift h-full overflow-hidden border-border/70">
                        {imageSrc(sub.image_url || sub.image) ? (
                          <div className="relative overflow-hidden">
                            <img
                              src={imageSrc(sub.image_url || sub.image)}
                              alt={sub.name}
                              className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                        ) : null}
                        <CardHeader>
                          <CardTitle className="text-lg group-hover:text-primary">{sub.name}</CardTitle>
                          <CardDescription className="line-clamp-3 leading-relaxed">{sub.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                            View professionals <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="section-muted rounded-3xl px-6 py-10 sm:px-10">
              <SectionHeader
                eyebrow="How booking works"
                title="Simple process, professional results"
                description="Once you pick a sub-service, filter workers, send a booking request, and track everything from your customer dashboard."
                align="center"
              />
              <ol className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
                {BOOKING_STEPS.map((step, i) => (
                  <li key={step} className="flex gap-3 rounded-xl border border-border/60 bg-card p-4 text-sm">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          </>
        )}

        {/* Sub: workers */}
        {subSlug && (
          <>
            <section className="grid gap-6 lg:grid-cols-3">
              <Card className="border-border/70 lg:col-span-2">
                <CardHeader>
                  <CardTitle>About this service</CardTitle>
                  <CardDescription className="text-base leading-relaxed">{activeSub?.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" /> Verified workers available
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" /> Flexible scheduling
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" /> Rated after every job
                  </span>
                </CardContent>
              </Card>
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">Need help choosing?</CardTitle>
                  <CardDescription>Compare rates, cities, and verification badges below — or search all workers.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full rounded-xl">
                    <Link to={`/search?category=${subSlug}`}>Open advanced search</Link>
                  </Button>
                </CardContent>
              </Card>
            </section>

            <Card className="glass border-border/70">
              <CardHeader>
                <CardTitle>Find the right professional</CardTitle>
                <CardDescription>Refine results by keyword, city, minimum rating, or verified status only.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-4">
                <div>
                  <Label>Search</Label>
                  <Input className="mt-1" value={q} onChange={(e) => update('q', e.target.value)} placeholder="Name or skill" />
                </div>
                <div>
                  <Label>City</Label>
                  <Input className="mt-1" value={city} onChange={(e) => update('city', e.target.value)} placeholder="Dhaka" />
                </div>
                <div>
                  <Label>Min rating</Label>
                  <Input className="mt-1" value={minRating} onChange={(e) => update('minRating', e.target.value)} placeholder="4" />
                </div>
                <div className="flex items-end gap-2">
                  <Button variant={verified ? 'default' : 'outline'} className="w-full" onClick={() => update('verified', verified ? '' : '1')}>
                    Verified only
                  </Button>
                </div>
              </CardContent>
            </Card>

            <section className="space-y-6">
              <div className="flex items-end justify-between gap-4">
                <h2 className="text-2xl font-bold tracking-tight">Available professionals</h2>
                {!loading && <p className="text-sm text-muted-foreground">{total} match{total === 1 ? '' : 'es'}</p>}
              </div>

              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-2xl" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {workers.map((w, i) => (
                    <motion.div key={w.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                      <Link to={`/workers/${w.id}`}>
                        <Card className="card-lift h-full border-border/70">
                          <CardContent className="flex gap-4 py-6">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">
                              {w.full_name?.charAt(0) || '?'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-lg font-semibold">{w.full_name}</span>
                                {w.is_verified ? <VerifiedBadge /> : null}
                              </div>
                              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{w.headline}</p>
                              <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" /> {w.city || 'Bangladesh'}
                                </span>
                                <span>৳{Number(w.hourly_rate).toFixed(0)}/hr</span>
                                <span className="inline-flex items-center gap-1">
                                  <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                                  {w.rating_avg} ({w.rating_count})
                                </span>
                              </div>
                            </div>
                            <ArrowRight className="h-5 w-5 shrink-0 self-center text-muted-foreground" />
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {!loading && !workers.length && (
                <Card className="border-dashed">
                  <CardContent className="py-16 text-center">
                    <p className="text-lg font-medium">No professionals listed yet</p>
                    <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                      Run <code className="rounded bg-muted px-1.5 py-0.5">cd backend && npm run seed</code> to load demo workers, or try another city or sub-service.
                    </p>
                    <Button asChild className="mt-6 rounded-xl" variant="outline">
                      <Link to={`/services/${majorSlug}`}>Browse other {major?.name} services</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </section>
          </>
        )}
      </div>
    </motion.div>
  );
}
