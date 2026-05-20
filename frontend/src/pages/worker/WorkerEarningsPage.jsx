import * as React from 'react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export function WorkerEarningsPage() {
  const [data, setData] = React.useState({ total: 0, monthly: [] });
  React.useEffect(() => {
    api.get('/workers/me/earnings').then(({ data: d }) => setData({ total: d.total, monthly: d.monthly || [] }));
  }, []);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Earnings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Total paid out (mock)</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">৳{Number(data.total).toFixed(0)}</CardContent>
      </Card>
      <Card className="h-80">
        <CardHeader>
          <CardTitle>Monthly</CardTitle>
        </CardHeader>
        <CardContent className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthly}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
