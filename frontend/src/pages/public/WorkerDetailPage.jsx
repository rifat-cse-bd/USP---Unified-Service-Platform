import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function WorkerDetailPage() {
  const { id } = useParams();
  const [payload, setPayload] = React.useState(null);

  React.useEffect(() => {
    api
      .get(`/workers/public/${id}`)
      .then(({ data }) => setPayload(data))
      .catch(() => setPayload(null));
  }, [id]);

  if (!payload) return <div className="p-8 text-center text-muted-foreground">Loading…</div>;
  const { worker, services, reviews } = payload;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{worker.full_name}</h1>
            {worker.is_verified ? <Badge variant="success">Verified</Badge> : <Badge variant="outline">Pending verification</Badge>}
          </div>
          <p className="text-muted-foreground">{worker.headline}</p>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{worker.bio}</p>
          <div className="mt-3 text-sm">
            <span className="font-medium text-foreground">{worker.rating_avg}</span> / 5 · {worker.rating_count} reviews · ৳
            {Number(worker.hourly_rate).toFixed(0)} / hr · {worker.city}
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xl font-semibold">Services</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {services?.map((s) => (
            <Link key={s.id} to={`/offer/${s.id}`}>
              <Card className="h-full hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">{s.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">৳{Number(s.base_price).toFixed(0)}</CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xl font-semibold">Reviews</h2>
        <div className="space-y-3">
          {reviews?.length ? (
            reviews.map((r) => (
              <Card key={r.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{r.reviewer_name}</span>
                    <span>{r.rating}★</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
