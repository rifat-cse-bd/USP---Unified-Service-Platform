import * as React from 'react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';

export function WorkerServicesPage() {
  const toast = useToast();
  const [categories, setCategories] = React.useState([]);
  const [services, setServices] = React.useState([]);
  const [form, setForm] = React.useState({ category_id: '', title: '', description: '', base_price: '' });

  const load = async () => {
    const [{ data: cats }, { data: me }, { data: svc }] = await Promise.all([
      api.get('/services/categories'),
      api.get('/workers/me'),
      api.get('/services', { params: { limit: 100 } }),
    ]);
    const all = cats.categories || [];
    setCategories(all.filter((c) => c.parent_id));
    const wid = me.worker?.id;
    setServices((svc.data || []).filter((s) => s.worker_table_id === wid));
  };

  React.useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post('/services', { ...form, category_id: Number(form.category_id), base_price: Number(form.base_price) });
    toast({ title: 'Service created' });
    setForm({ category_id: '', title: '', description: '', base_price: '' });
    load();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create service</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={create}>
            <div>
              <Label>Category</Label>
              <select className="mt-1 w-full rounded-xl border border-border bg-background p-2 text-sm" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required>
                <option value="">Select</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Title</Label>
              <Input className="mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <textarea className="mt-1 min-h-[80px] w-full rounded-xl border border-border bg-background p-3 text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div>
              <Label>Base price</Label>
              <Input className="mt-1" type="number" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} required />
            </div>
            <div className="flex items-end">
              <Button type="submit">Publish</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-2 text-sm">
        {services.map((s) => (
          <Card key={s.id}>
            <CardContent className="py-3">{s.title}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
