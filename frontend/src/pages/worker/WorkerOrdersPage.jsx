import * as React from 'react';
import { ChatLinkButton } from '@/components/dashboard/dashboardUi';
import api from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';

function statusLabel(status) {
  return String(status || '').replace(/_/g, ' ');
}

function statusVariant(status) {
  if (status === 'completed') return 'success';
  if (status === 'rejected' || status === 'cancelled') return 'destructive';
  if (status === 'in_progress') return 'default';
  return 'secondary';
}

export function WorkerOrdersPage() {
  const toast = useToast();
  const [rows, setRows] = React.useState([]);
  const load = () => api.get('/bookings').then(({ data }) => setRows(data.bookings || []));

  React.useEffect(() => {
    load();
  }, []);

  const update = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      toast({
        title: 'Order updated',
        description: `Status is now ${statusLabel(status)}`,
      });
      load();
    } catch (e) {
      toast({
        title: 'Update failed',
        description: e.response?.data?.message || e.message,
      });
    }
  };

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Incoming orders</h1>
      {rows.map((b) => (
        <Card key={b.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
            <div>
              <div className="font-medium">{b.service_title}</div>
              <Badge variant={statusVariant(b.status)} className="mt-1 capitalize">
                {statusLabel(b.status)}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {b.status === 'pending' && (
                <>
                  <Button type="button" size="sm" variant="outline" onClick={() => update(b.id, 'accepted')}>
                    Accept
                  </Button>
                  <Button type="button" size="sm" variant="destructive" onClick={() => update(b.id, 'rejected')}>
                    Reject
                  </Button>
                </>
              )}
              {b.status === 'accepted' && (
                <Button type="button" size="sm" variant="outline" onClick={() => update(b.id, 'in_progress')}>
                  Start job
                </Button>
              )}
              {b.status === 'in_progress' && (
                <Button type="button" size="sm" onClick={() => update(b.id, 'completed')}>
                  Mark complete
                </Button>
              )}
              {!['pending', 'accepted', 'in_progress'].includes(b.status) && (
                <span className="self-center text-xs text-muted-foreground">No actions available</span>
              )}
              {b.status !== 'rejected' && b.status !== 'cancelled' && (
                <ChatLinkButton to={`/bookings/${b.id}/chat`} />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {!rows.length && <p className="text-sm text-muted-foreground">No bookings yet.</p>}
    </div>
  );
}
