import * as React from 'react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';

const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export function WorkerAvailabilityPage() {
  const toast = useToast();
  const [avail, setAvail] = React.useState({});

  React.useEffect(() => {
    api.get('/workers/me').then(({ data }) => {
      try {
        setAvail(typeof data.worker.availability === 'string' ? JSON.parse(data.worker.availability) : data.worker.availability || {});
      } catch {
        setAvail({});
      }
    });
  }, []);

  const save = async () => {
    await api.patch('/workers/me', { availability: avail });
    toast({ title: 'Availability saved' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly availability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {days.map((d) => (
          <div key={d} className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2">
            <span className="capitalize">{d}</span>
            <Switch checked={!!avail[d]} onCheckedChange={(v) => setAvail({ ...avail, [d]: v })} />
          </div>
        ))}
        <Button onClick={save}>Save</Button>
      </CardContent>
    </Card>
  );
}
