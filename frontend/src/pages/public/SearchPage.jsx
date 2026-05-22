import * as React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Filter,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
  Users,
} from 'lucide-react';
import api from '@/services/api';
import { SectionHeader } from '@/components/marketing/SectionHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { cn } from '@/lib/utils';

const QUICK_CITIES = ['Dhaka', 'Chittagong', 'Sylhet', 'Gazipur', 'Narayanganj'];

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [workers, setWorkers] = React.useState([]);
  const [majors, setMajors] = React.useState([]);
  const [suggestions, setSuggestions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [total, setTotal] = React.useState(0);

  const q = params.get('q') || '';
  const city = params.get('city') || '';
  const minRating = params.get('minRating') || '';
  const category = params.get('category') || '';
  const verified = params.get('verified') || '';

  const activeFilterCount = [q, city, minRating, category, verified].filter(Boolean).length;

  React.useEffect(() => {
    api.get('/services/categories').then(({ data }) => setMajors(data.majors || []));
  }, []);

  React.useEffect(() => {
    if (q.length >= 2) {
      api.get('/services/search/suggestions', { params: { q } }).then(({ data }) => setSuggestions(data.suggestions || []));
    } else setSuggestions([]);
  }, [q]);

  React.useEffect(() => {
    setLoading(true);
    api
      .get('/workers/public', {
        params: {
          q: q || undefined,
          city: city || undefined,
          minRating: minRating || undefined,
          category: category || undefined,
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
  }, [q, city, minRating, category, verified]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const reset = () => setParams(new URLSearchParams());

  const FiltersPanel = ({ className }) => (
    <Card className={cn('glass border-border/70', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            Refine search
          </CardTitle>
          {activeFilterCount > 0 ? (
            <Badge variant="secondary">{activeFilterCount} active</Badge>
          ) : null}
        </div>
        <CardDescription>Filter by keyword, service type, city, and verification.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <Label htmlFor="search-q">Keyword</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search-q"
              className="pl-9"
              value={q}
              onChange={(e) => update('q', e.target.value)}
              placeholder="Name, skill, or service title"
            />
          </div>
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 overflow-hidden rounded-xl border border-border/70 bg-card shadow-md"
              >
                {suggestions.map((s, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                      onClick={() => update('q', s.title)}
                    >
                      {s.title}
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <div>
          <Label htmlFor="search-cat">Service</Label>
          <select
            id="search-cat"
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
            value={category}
            onChange={(e) => update('category', e.target.value)}
          >
            <option value="">All services & sectors</option>
            {majors.map((major) => (
              <optgroup key={major.slug} label={major.name}>
                {(major.subfeatures || []).map((sub) => (
                  <option key={sub.id || sub.slug} value={sub.slug}>
                    {sub.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="search-city">City</Label>
          <div className="relative mt-1">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search-city"
              className="pl-9"
              value={city}
              onChange={(e) => update('city', e.target.value)}
              placeholder="e.g. Dhaka"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {QUICK_CITIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => update('city', c)}
                className={cn(
                  'rounded-full border px-2.5 py-0.5 text-xs transition-colors',
                  city === c ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="search-rating">Minimum rating</Label>
          <Input
            id="search-rating"
            className="mt-1"
            type="number"
            min="1"
            max="5"
            step="0.1"
            value={minRating}
            onChange={(e) => update('minRating', e.target.value)}
            placeholder="4.0"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant={verified ? 'default' : 'outline'}
            className="w-full justify-start gap-2 rounded-xl"
            onClick={() => update('verified', verified ? '' : '1')}
          >
            <BadgeCheck className="h-4 w-4" />
            Verified professionals only
          </Button>
          <Button type="button" variant="ghost" className="w-full gap-2 rounded-xl" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Reset all filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="gradient-hero border-b border-border/50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:py-18">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-5">
            <Badge variant="secondary" className="gap-1 px-3 py-1">
              <Users className="h-3.5 w-3.5" />
              Professional directory
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Find the right{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">verified professional</span>
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Search across six service sectors and 38+ specialized offerings. Compare ratings, hourly rates, and cities — then
              view full profiles and book in minutes.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <FiltersPanel />
            </div>
          </div>

          <div className="space-y-6">
            <div className="lg:hidden">
              <FiltersPanel />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-primary">
                  {loading ? 'Searching…' : `${total} professional${total === 1 ? '' : 's'} found`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeFilterCount > 0 ? `${activeFilterCount} filter(s) applied` : 'Showing all available workers'}
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-xl gap-2">
                <Link to="/services">
                  <Filter className="h-4 w-4" />
                  Browse by sector
                </Link>
              </Button>
            </div>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-36 rounded-2xl" />
                ))}
              </div>
            ) : workers.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {workers.map((w, i) => (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link to={`/workers/${w.id}`} className="group block h-full">
                      <Card className="card-lift h-full border-border/70">
                        <CardContent className="flex gap-4 p-5">
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-xl font-bold text-primary">
                            {w.full_name?.charAt(0) || '?'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-lg font-semibold group-hover:text-primary">{w.full_name}</span>
                              {w.is_verified ? <VerifiedBadge /> : null}
                            </div>
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{w.headline}</p>
                            <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium">
                              <span className="inline-flex items-center gap-1 text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                {w.city || 'Bangladesh'}
                              </span>
                              <span className="text-foreground">৳{Number(w.hourly_rate).toFixed(0)}/hr</span>
                              <span className="inline-flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                                {w.rating_avg} <span className="text-muted-foreground">({w.rating_count})</span>
                              </span>
                              {w.years_experience ? (
                                <span className="text-muted-foreground">{w.years_experience}+ yrs exp.</span>
                              ) : null}
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 shrink-0 self-center text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <Search className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-4 text-lg font-medium">No professionals match your filters</p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                    Try a different city, lower the minimum rating, or browse services by sector to discover more workers.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Button variant="outline" className="rounded-xl" onClick={reset}>
                      Clear filters
                    </Button>
                    <Button asChild className="rounded-xl">
                      <Link to="/services">Explore services</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <SectionHeader
              eyebrow="Tip"
              title="Not sure what you need?"
              description="Start from the services directory to pick a major sector, then choose a specialized sub-service before comparing workers."
              className="pt-8"
            />
            <Button asChild size="lg" variant="outline" className="rounded-xl">
              <Link to="/services">
                Open services directory <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
