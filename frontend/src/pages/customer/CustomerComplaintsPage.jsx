import * as React from 'react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';

export function CustomerComplaintsPage() {
  const toast = useToast();
  const [rows, setRows] = React.useState([]);
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');

  const load = () => api.get('/complaints/mine').then(({ data }) => setRows(data.complaints || []));

  React.useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/complaints', { subject, message });
      toast({ title: 'Report submitted' });
      setSubject('');
      setMessage('');
      load();
    } catch (err) {
      toast({ title: 'Failed', description: err.response?.data?.message || err.message });
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reports & disputes</h1>
      <Card>
        <CardHeader>
          <CardTitle>File a complaint</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label>Subject</Label>
              <Input className="mt-1" value={subject} onChange={(e) => setSubject(e.target.value)} required />
            </div>
            <div>
              <Label>Details</Label>
              <Input className="mt-1" value={message} onChange={(e) => setMessage(e.target.value)} required />
            </div>
            <Button type="submit">Submit report</Button>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {rows.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex items-center justify-between py-3 text-sm">
              <div>
                <div className="font-medium">{c.subject}</div>
                <div className="text-xs text-muted-foreground">{c.message}</div>
              </div>
              <Badge>{c.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
