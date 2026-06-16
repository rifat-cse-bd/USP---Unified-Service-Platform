import * as React from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { ChatLinkButton } from '@/components/dashboard/dashboardUi';
import { StatusBadge } from '@/components/admin/adminUi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';

export function CustomerBookingsPage() {
  const toast = useToast();
  const [rows, setRows] = React.useState([]);
  const [reviewFor, setReviewFor] = React.useState(null);
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState('');

  const load = () => api.get('/bookings').then(({ data }) => setRows(data.bookings || []));

  React.useEffect(() => {
    load();
  }, []);

  const submitReview = async () => {
    if (!reviewFor) return;
    try {
      await api.post('/reviews', {
        booking_id: reviewFor.id,
        rating: Number(rating),
        comment,
      });
      toast({ title: 'Review submitted' });
      setReviewFor(null);
      setComment('');
      load();
    } catch (e) {
      toast({ title: 'Review failed', description: e.response?.data?.message || e.message });
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Booking history</h1>
      <div className="space-y-3">
        {rows.map((b) => (
          <Card key={b.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-medium">{b.service_title}</p>
                <p className="text-xs text-muted-foreground">
                  #{b.id} · {new Date(b.scheduled_at).toLocaleString()}
                </p>
              </div>
              <StatusBadge status={b.status} />
              <div className="flex flex-wrap gap-2">
                <ChatLinkButton to={`/bookings/${b.id}/chat`} />
                {b.status === 'completed' && (
                  <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setReviewFor(b)}>
                    Leave review
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {!rows.length && <p className="text-sm text-muted-foreground">No bookings yet.</p>}
      </div>

      {reviewFor ? (
        <Card className="glass border-primary/30">
          <CardContent className="space-y-3 pt-6">
            <h3 className="font-semibold">Review {reviewFor.service_title}</h3>
            <div>
              <Label>Rating (1–5)</Label>
              <Input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(e.target.value)} className="mt-1 w-24" />
            </div>
            <div>
              <Label>Comment</Label>
              <Input value={comment} onChange={(e) => setComment(e.target.value)} className="mt-1" placeholder="Share your experience" />
            </div>
            <div className="flex gap-2">
              <Button onClick={submitReview}>Submit</Button>
              <Button variant="ghost" onClick={() => setReviewFor(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
