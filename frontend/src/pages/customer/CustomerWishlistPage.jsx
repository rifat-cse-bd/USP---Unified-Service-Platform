import * as React from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function CustomerWishlistPage() {
  const [items, setItems] = React.useState([]);
  const load = () => api.get('/wishlist').then(({ data }) => setItems(data.items || []));
  React.useEffect(() => {
    load();
  }, []);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Wishlist</h1>
      <div className="space-y-3">
        {items.map((s) => (
          <Card key={s.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <Link className="font-medium text-primary" to={`/offer/${s.id}`}>
                  {s.title}
                </Link>
                <div className="text-xs text-muted-foreground">{s.worker_name}</div>
              </div>
              <Button variant="outline" size="sm" onClick={() => api.delete(`/wishlist/${s.id}`).then(load)}>
                Remove
              </Button>
            </CardContent>
          </Card>
        ))}
        {!items.length && <p className="text-sm text-muted-foreground">Save services from detail pages (heart button can be added).</p>}
      </div>
    </div>
  );
}
