import * as React from 'react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';

export function WorkerProfilePage() {
  const toast = useToast();
  const [worker, setWorker] = React.useState({ headline: '', bio: '', hourly_rate: 0, service_radius_km: 15 });
  const [user, setUser] = React.useState({ full_name: '', phone: '', city: '' });

  React.useEffect(() => {
    Promise.all([api.get('/workers/me'), api.get('/users/profile')]).then(([w, u]) => {
      setWorker(w.data.worker);
      setUser(u.data.user);
    });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    await api.patch('/users/profile', user);
    await api.patch('/workers/me', worker);
    toast({ title: 'Profile updated' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Worker profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={save}>
          <div>
            <Label>Display name</Label>
            <Input className="mt-1" value={user.full_name} onChange={(e) => setUser({ ...user, full_name: e.target.value })} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input className="mt-1" value={user.phone} onChange={(e) => setUser({ ...user, phone: e.target.value })} />
          </div>
          <div>
            <Label>City</Label>
            <Input className="mt-1" value={user.city} onChange={(e) => setUser({ ...user, city: e.target.value })} />
          </div>
          <div>
            <Label>Headline</Label>
            <Input className="mt-1" value={worker.headline} onChange={(e) => setWorker({ ...worker, headline: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Bio</Label>
            <textarea className="mt-1 min-h-[100px] w-full rounded-xl border border-border bg-background p-3 text-sm" value={worker.bio} onChange={(e) => setWorker({ ...worker, bio: e.target.value })} />
          </div>
          <div>
            <Label>Hourly rate (৳)</Label>
            <Input type="number" className="mt-1" value={worker.hourly_rate} onChange={(e) => setWorker({ ...worker, hourly_rate: e.target.value })} />
          </div>
          <div>
            <Label>Service radius (km)</Label>
            <Input type="number" className="mt-1" value={worker.service_radius_km} onChange={(e) => setWorker({ ...worker, service_radius_km: e.target.value })} />
          </div>
          <Button type="submit">Save</Button>
        </form>
      </CardContent>
    </Card>
  );
}
