import * as React from 'react';
import api from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function CustomerNotificationsPage() {
  const [rows, setRows] = React.useState([]);
  const load = () => api.get('/notifications').then(({ data }) => setRows(data.notifications || []));
  React.useEffect(() => {
    load();
  }, []);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button variant="outline" size="sm" onClick={() => api.post('/notifications/read-all').then(load)}>
          Mark all read
        </Button>
      </div>
      <div className="space-y-2">
        {rows.map((n) => (
          <Card key={n.id}>
            <CardContent className="flex items-start justify-between gap-3 py-4">
              <div>
                <div className="font-medium">{n.title}</div>
                <div className="text-sm text-muted-foreground">{n.body}</div>
              </div>
              {!n.is_read ? (
                <Button size="sm" variant="secondary" onClick={() => api.patch(`/notifications/${n.id}/read`).then(load)}>
                  Mark read
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
