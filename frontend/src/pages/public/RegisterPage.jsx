import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = React.useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
  });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const user = await register(form);
      toast({ title: 'Account created', description: user.full_name });
      if (user.role === 'worker') navigate('/worker/profile');
      else navigate('/customer/dashboard');
    } catch (err) {
      toast({ title: 'Registration failed', description: err.response?.data?.message || 'Try another email' });
    }
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-16">
      <Card className="glass">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Customers book services; workers receive orders after verification.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div>
              <Label>Full name</Label>
              <Input className="mt-1" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
            </div>
            <div>
              <Label>Email</Label>
              <Input className="mt-1" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <Label>Phone</Label>
              <Input className="mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label>Password (min 8)</Label>
              <Input className="mt-1" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div>
              <Label>I am a</Label>
              <select
                className="mt-1 flex h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="customer">Customer</option>
                <option value="worker">Worker</option>
              </select>
            </div>
            <Button type="submit" className="w-full">
              Sign up
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link className="text-primary underline" to="/login">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
