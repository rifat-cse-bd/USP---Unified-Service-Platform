import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function CustomerCartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = React.useState({ items: [], subtotal: 0 });
  const load = () => api.get('/cart').then(({ data }) => setCart({ items: data.items || [], subtotal: data.subtotal || 0 }));
  React.useEffect(() => {
    load();
  }, []);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Cart</h1>
      <Card>
        <CardContent className="space-y-3 py-4">
          {cart.items.map((i) => (
            <div key={i.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 py-2 text-sm last:border-0">
              <div>
                <div className="font-medium">{i.title}</div>
                <div className="text-xs text-muted-foreground">Qty {i.quantity}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => api.delete(`/cart/items/${i.id}`).then(load)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
          {!cart.items.length && <p className="text-sm text-muted-foreground">Your cart is empty.</p>}
          <div className="flex items-center justify-between pt-2 text-sm font-semibold">
            <span>Subtotal</span>
            <span>৳{Number(cart.subtotal).toFixed(0)}</span>
          </div>
          <Button disabled={!cart.items.length} onClick={() => navigate('/customer/checkout')}>
            Go to checkout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
