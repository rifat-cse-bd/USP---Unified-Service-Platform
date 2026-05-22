import * as React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { getCategoryIcon } from '@/lib/categoryIcons';

export function CategoryPage() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const [category, setCategory] = React.useState(null);
  const [workers, setWorkers] = React.useState([]);
  const [services, setServices] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);

  const q = params.get('q') || '';
  const city = params.get('city') || '';
  const minRating = params.get('minRating') || '';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const verified = params.get('verified') || '';

  React.useEffect(() => {
    api.get('/services/categories').then(({ data }) => {
      const flat = data.categories || [];
      const cat =
        flat.find((c) => c.slug === slug) ||
        (data.majors || []).find((m) => m.slug === slug) ||
        (data.majors || []).flatMap((m) => m.subfeatures || []).find((s) => s.slug === slug);
      setCategory(cat || { name: slug, slug, description: '' });
    });
  }, [slug]);

  React.useEffect(() => {
    setLoading(true);
    const workerParams = {
      category: slug,
      q: q || undefined,
      city: city || undefined,
      minRating: minRating || undefined,
      maxPrice: maxPrice || undefined,
      verified: verified || undefined,
      page,
      limit: 12,
    };
    const serviceParams = {
      category: slug,
      q: q || undefined,
      city: city || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      minRating: minRating || undefined,
      verified: verified || undefined,
      page,
      limit: 12,
    };
    Promise.all([
      api.get('/workers/public', { params: workerParams }),
      api.get('/services', { params: serviceParams }),
    ])
      .then(([w, s]) => {
        setWorkers(w.data.data || []);
        setServices(s.data.data || []);
      })
      .finally(() => setLoading(false));
  }, [slug, q, city, minRating, minPrice, maxPrice, verified, page]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
    setPage(1);
  };

  const Icon = category ? getCategoryIcon(category.icon) : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl space-y-8 px-4 py-12">
      <div className="flex flex-wrap items-center gap-4">
        {Icon ? (
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-7 w-7" />
          </span>
        ) : null}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight">{category?.name || slug}</h1>
          <p className="text-muted-foreground">{category?.description}</p>
        </motion.div>
        <Button asChild variant="outline" className="ml-auto">
          <Link to="/categories">All categories</Link>
        </Button>
      </div>

      <Card className="glass">
        <CardContent className="grid gap-4 pt-6 md:grid-cols-3 lg:grid-cols-6">
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
          <div>
            <Label>Min price (৳)</Label>
            <Input className="mt-1" value={minPrice} onChange={(e) => update('minPrice', e.target.value)} />
          </div>
          <div>
            <Label>Max price (৳)</Label>
            <Input className="mt-1" value={maxPrice} onChange={(e) => update('maxPrice', e.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <Button variant={verified ? 'default' : 'outline'} onClick={() => update('verified', verified ? '' : '1')}>
              Verified only
            </Button>
            <Button variant="ghost" onClick={() => setParams(new URLSearchParams())}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-2">
          <section>
            <h2 className="mb-4 text-xl font-semibold">Workers in {category?.name}</h2>
            <div className="space-y-3">
              {workers.map((w, i) => (
                <motion.div key={w.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                  <Link to={`/workers/${w.id}`}>
                    <Card className="transition-shadow hover:shadow-md">
                      <CardContent className="flex items-center justify-between py-4">
                        <div>
                          <div className="font-medium">{w.full_name}</div>
                          <div className="text-xs text-muted-foreground">{w.headline}</div>
                          <div className="text-xs text-muted-foreground">
                            {w.city} · ৳{w.hourly_rate}/hr
                          </div>
                        </div>
                        <motion.div className="text-right text-sm" whileHover={{ scale: 1.02 }}>
                          <div>
                            {w.rating_avg}★ ({w.rating_count})
                          </div>
                          {w.is_verified ? <VerifiedBadge /> : null}
                        </motion.div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
              {!workers.length && <p className="text-sm text-muted-foreground">No workers in this category yet.</p>}
            </div>
          </section>
          <section>
            <h2 className="mb-4 text-xl font-semibold">Services</h2>
            <div className="space-y-3">
              {services.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                  <Link to={`/services/${s.id}`}>
                    <Card className="transition-shadow hover:shadow-md">
                      <CardContent className="py-4">
                        <div className="font-medium">{s.title}</div>
                        <div className="text-xs text-muted-foreground">{s.worker_name}</div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-sm font-semibold">৳{Number(s.base_price).toFixed(0)}</span>
                          {s.is_verified ? <VerifiedBadge /> : null}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
              {!services.length && <p className="text-sm text-muted-foreground">No services listed.</p>}
            </div>
          </section>
        </div>
      )}
    </motion.div>
  );
}
