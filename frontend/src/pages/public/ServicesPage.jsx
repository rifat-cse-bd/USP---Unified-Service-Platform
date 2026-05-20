import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertCircle, LayoutGrid } from 'lucide-react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { FALLBACK_SECTORS, SERVICE_SECTORS } from '@/lib/serviceSectors';

export function ServicesPage() {
  const [sectors, setSectors] = React.useState([]);
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
        const list = data.categories || [];
        setSectors(list.length ? list : FALLBACK_SECTORS);
      })
      .catch((err) => {
        if (cancelled) return;
        setApiError(err.message || 'Cannot reach API');
        setSectors(FALLBACK_SECTORS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const list = sectors.length ? sectors : FALLBACK_SECTORS;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-12">
      <div className="flex items-center gap-2 text-primary">
        <LayoutGrid className="h-5 w-5" />
        <span className="text-sm font-semibold uppercase tracking-wide">Marketplace core sectors</span>
      </div>

      {apiError && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-medium text-foreground">Backend not connected</p>
            <p className="mt-1 text-muted-foreground">
              Start the API: <code className="rounded bg-muted px-1">cd backend</code> then{' '}
              <code className="rounded bg-muted px-1">npm run dev</code> (port 5000). Worker lists need the API running.
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {list.map((sector) => {
            const meta = SERVICE_SECTORS[sector.slug] || {};
            const Icon = getCategoryIcon(sector.icon);
            return (
              <article
                key={sector.id || sector.slug}
                className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="relative h-48 w-full shrink-0 md:h-auto md:w-72">
                    <img
                      src={meta.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80'}
                      alt={sector.name}
                      className="h-full min-h-[12rem] w-full object-cover md:min-h-[10rem]"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </span>
                        <h2 className="text-xl font-bold tracking-tight">{sector.name}</h2>
                      </div>
                      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        {meta.blurb || sector.description}
                      </p>
                    </div>
                    <Button asChild size="lg" className="shrink-0 gap-2 rounded-xl">
                      <Link to={`/services/${sector.slug}`}>
                        Explore More <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
