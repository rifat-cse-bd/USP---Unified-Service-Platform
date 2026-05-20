import * as React from 'react';
import api from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';

export function WorkerReviewsPage() {
  const [rows, setRows] = React.useState([]);
  React.useEffect(() => {
    api.get('/reviews/worker').then(({ data }) => setRows(data.reviews || []));
  }, []);
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Ratings & reviews</h1>
      {rows.map((r) => (
        <Card key={r.id}>
          <CardContent className="py-3 text-sm">
            <div className="font-medium">{r.reviewer_name}</div>
            <div>{r.rating}★</div>
            <p className="text-muted-foreground">{r.comment}</p>
          </CardContent>
        </Card>
      ))}
      {!rows.length && <p className="text-sm text-muted-foreground">No reviews yet.</p>}
    </div>
  );
}
