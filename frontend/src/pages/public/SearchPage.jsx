import * as React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { VerifiedBadge } from '@/components/VerifiedBadge';

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [workers, setWorkers] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [suggestions, setSuggestions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const q = params.get('q') || '';
  const city = params.get('city') || '';
  const minRating = params.get('minRating') || '';
  const category = params.get('category') || '';
  const verified = params.get('verified') || '';

  React.useEffect(() => {
    api.get('/services/categories').then(({ data }) => setCategories(data.categories || []));
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
        },
      })
      .then(({ data }) => setWorkers(data.data || []))
      .finally(() => setLoading(false));
  }, [q, city, minRating, category, verified]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-6xl space-y-8 px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Find workers</h1>
      <Card className="glass">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div>
            <Label>Keyword</Label>
            <Input value={q} onChange={(e) => update('q', e.target.value)} placeholder="Name or skill" className="mt-1" />
            {suggestions.length > 0 && (
              <ul className="mt-1 rounded-lg border border-border/60 bg-card p-2 text-xs">
                {suggestions.map((s, i) => (
                  <li key={i} className="cursor-pointer py-1 hover:text-primary" onClick={() => update('q', s.title)}>
                    {s.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <Label>Service</Label>
            <select
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={category}
              onChange={(e) => update('category', e.target.value)}
            >
              <option value="">All services</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>City</Label>
            <Input value={city} onChange={(e) => update('city', e.target.value)} placeholder="Dhaka" className="mt-1" />
          </div>
          <div className="flex items-end gap-2">
            <Button variant={verified ? 'default' : 'outline'} onClick={() => update('verified', verified ? '' : '1')}>
              Verified
            </Button>
            <Button variant="ghost" onClick={() => setParams(new URLSearchParams())}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {workers.map((w) => (
            <Link key={w.id} to={`/workers/${w.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <div className="font-medium">{w.full_name}</div>
                    <div className="text-xs text-muted-foreground">{w.headline}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div>{w.rating_avg}★</div>
                    {w.is_verified ? <VerifiedBadge /> : null}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {!workers.length && <p className="col-span-2 text-sm text-muted-foreground">No workers match. Try another service on the Services page.</p>}
        </div>
      )}
    </motion.div>
  );
}
