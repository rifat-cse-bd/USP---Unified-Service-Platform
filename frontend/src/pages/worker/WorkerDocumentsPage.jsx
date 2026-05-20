import * as React from 'react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';

export function WorkerDocumentsPage() {
  const toast = useToast();
  const [docs, setDocs] = React.useState([]);
  const load = () => api.get('/workers/me/documents').then(({ data }) => setDocs(data.documents || []));

  React.useEffect(() => {
    load();
  }, []);

  const upload = async (e) => {
    e.preventDefault();
    const form = e.target;
    const fileInput = form.elements.namedItem('file');
    const typeInput = form.elements.namedItem('doc_type');
    const file = fileInput?.files?.[0];
    if (!file) {
      toast({ title: 'Choose a file', description: 'Select an image (JPG, PNG) or PDF.' });
      return;
    }
    const fd = new FormData();
    fd.append('file', file);
    fd.append('doc_type', typeInput?.value || 'nid');
    try {
      await api.post('/workers/me/documents', fd);
      toast({ title: 'Uploaded', description: 'Document sent for admin review.' });
      form.reset();
      load();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        'Upload failed';
      toast({ title: 'Upload failed', description: msg });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload verification document</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={upload}>
            <input
              type="file"
              name="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf,image/*,application/pdf"
              required
            />
            <p className="text-xs text-muted-foreground">JPG, PNG, WEBP, or PDF — max 8 MB</p>
            <select name="doc_type" className="w-full rounded-xl border border-border bg-background p-2 text-sm">
              <option value="nid">NID</option>
              <option value="passport">Passport</option>
              <option value="license">License</option>
            </select>
            <Button type="submit">Submit</Button>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-2 text-sm">
        {docs.map((d) => (
          <Card key={d.id}>
            <CardContent className="py-3">
              <div className="flex justify-between">
                <span>{d.doc_type}</span>
                <span>{d.status}</span>
              </div>
              <a className="text-xs text-primary underline" href={d.file_url} target="_blank" rel="noreferrer">
                View file
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
