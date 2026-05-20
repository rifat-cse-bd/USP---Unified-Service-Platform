import * as React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoogleMapPlaceholder } from '@/components/GoogleMapPlaceholder';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';

export function ServiceDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [service, setService] = React.useState(null);
  const [scheduled, setScheduled] = React.useState('');
  const [address, setAddress] = React.useState('');

  React.useEffect(() => {
    (async () => {
      const { data } = await api.get(`/services/${id}`);
      setService(data.service);
    })().catch(() => setService(null));
  }, [id]);

  const book = async () => {
    if (!user) return navigate('/login');
    if (user.role !== 'customer') {
      toast({ title: 'Switch to customer', description: 'Bookings are for customer accounts.' });
      return;
    }
    try {
      const scheduled_at = scheduled ? new Date(scheduled).toISOString() : new Date(Date.now() + 86400000).toISOString();
      await api.post('/bookings', {
        service_id: Number(id),
        scheduled_at,
        address: address || 'Dhaka (update later)',
      });
      toast({ title: 'Booking created', description: 'Check your customer dashboard.' });
      navigate('/customer/orders');
    } catch (e) {
      toast({ title: 'Could not book', description: e.response?.data?.message || 'Error' });
    }
  };

  const addWishlist = async () => {
    if (!user) return navigate('/login');
    try {
      await api.post('/wishlist', { service_id: Number(id) });
      toast({ title: 'Saved to wishlist' });
    } catch (e) {
      toast({ title: 'Wishlist error', description: e.response?.data?.message || 'Error' });
    }
  };

  const addCart = async () => {
    if (!user) return navigate('/login');
    try {
      await api.post('/cart/items', { service_id: Number(id), quantity: 1, scheduled_at: scheduled || null });
      toast({ title: 'Added to cart' });
    } catch (e) {
      toast({ title: 'Cart error', description: e.response?.data?.message || 'Error' });
    }
  };

  if (!service) return <div className="p-8 text-center text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Badge variant="secondary">{service.category_name}</Badge>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{service.title}</h1>
          <p className="mt-2 text-muted-foreground">{service.description}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>
              Worker:{' '}
              <Link className="font-medium text-primary" to={`/workers/${service.worker_id}`}>
                {service.worker_name}
              </Link>
            </span>
            {service.is_verified ? <Badge variant="success">Verified worker</Badge> : null}
          </div>
        </div>
        <Card className="glass w-full md:w-96">
          <CardHeader>
            <CardTitle>৳{Number(service.base_price).toFixed(0)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Preferred schedule</Label>
              <Input type="datetime-local" value={scheduled} onChange={(e) => setScheduled(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Service address</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Area, road, flat" className="mt-1" />
            </div>
            <Button className="w-full" onClick={book}>
              Book now
            </Button>
            <Button variant="outline" className="w-full" onClick={addCart}>
              Add to cart
            </Button>
            <Button variant="ghost" className="w-full" onClick={addWishlist}>
              Save to wishlist
            </Button>
          </CardContent>
        </Card>
      </div>
      <GoogleMapPlaceholder title="Coverage map (placeholder)" />
    </div>
  );
}
