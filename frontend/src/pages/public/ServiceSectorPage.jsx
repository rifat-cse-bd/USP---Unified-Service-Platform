import * as React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import api from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { SERVICE_SECTORS } from '@/lib/serviceSectors';

export function ServiceSectorPage() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const [sector, setSector] = React.useState(null);
  const [workers, setWorkers] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const q = params.get('q') || '';
  const city = params.get('city') || '';
  const minRating = params.get('minRating') || '';
  const verified = params.get('verified') || '';

  React.useEffect(() => {
    api.get('/services/categories').then(({ data }) => {
      const s = (data.categories || []).find((c) => c.slug === slug);
      setSector(s || { name: slug, slug, description: '' });
    });
  }, [slug]);

  React.useEffect(() => {
    setLoading(true);
    api
      .get('/workers/public', {
        params: {
          category: slug,
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
  }, [slug, q, city, minRating, verified]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const Icon = sector ? getCategoryIcon(sector.icon) : null;
  const meta = SERVICE_SECTORS[slug] || {};

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-6xl space-y-8 px-4 py-12">
      <Button asChild variant="ghost" className="gap-2 pl-0">
        <Link to="/services">
          <ArrowLeft className="h-4 w-4" /> All services
        </Link>
      </Button>

      <div className="overflow-hidden rounded-2xl border border-border/70">
        {meta.image ? (
          <img src={meta.image} alt="" className="h-40 w-full object-cover md:h-52" />
        ) : null}
        <div className="flex items-start gap-4 bg-card p-6">
          {Icon ? (
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </span>
          ) : null}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{sector?.name}</h1>
            <p className="mt-1 text-muted-foreground">{meta.blurb || sector?.description}</p>
            <p className="mt-2 text-sm font-medium text-primary">{total} available workers</p>
          </div>
        </div>
      </div>

      <Card className="glass">
        <CardContent className="grid gap-4 pt-6 md:grid-cols-4">
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
            <Button variant={verified ? 'default' : 'outline'} onClick={() => update('verified', verified ? '' : '1')}>
              Verified only
            </Button>
          </div>
        </CardContent>
      </Card>


      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {workers.map((w, i) => (
            <motion.div key={w.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <Link to={`/workers/${w.id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="flex gap-4 py-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                      {w.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{w.full_name}</span>
                        {w.is_verified ? <VerifiedBadge /> : null}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{w.headline}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {w.city || 'Bangladesh'} · ৳{Number(w.hourly_rate).toFixed(0)}/hr · {w.rating_avg}★ ({w.rating_count})
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}


      {!loading && !workers.length && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No workers in this sector yet.</p>
            <p className="mt-2 text-sm">
              Run <code className="rounded bg-muted px-1">cd backend && npm run seed</code> to load 50 demo workers.
            </p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
