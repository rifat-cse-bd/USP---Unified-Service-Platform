import * as React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import api from '@/services/api';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const from = location.state?.from;

  const submit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      toast({ title: 'Welcome back', description: user.full_name });
      if (from) navigate(from);
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'worker') navigate('/worker/dashboard');
      else navigate('/customer/dashboard');
    } catch (err) {
      toast({ title: 'Login failed', description: err.response?.data?.message || 'Check credentials' });
    }
  };

  const forgot = async () => {
    if (!email) return toast({ title: 'Enter email first' });
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      toast({ title: 'Reset link', description: data.devResetLink || data.message });
    } catch {
      toast({ title: 'Request failed' });
    }
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-16">
      <Card className="glass">
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>Access your WorkSure dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1" />
            </div>
            <Button type="submit" className="w-full">
              Continue
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={forgot}>
              Forgot password
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            New here?{' '}
            <Link className="text-primary underline" to="/register">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
