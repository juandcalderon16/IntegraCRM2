import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button, Card, Field, Input } from '@/components/ui';

export default function LoginPage() {
  const { token, login } = useAuth();
  const loc = useLocation() as { state?: { from?: Location } };
  const [email, setEmail] = useState('admin@crm.local');
  const [password, setPassword] = useState('password');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (token) {
    const to = (loc.state as { from?: { pathname?: string } })?.from?.pathname || '/';
    return <Navigate to={to} replace />;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      setErr('No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md">
        <h1 className="mb-1 text-xl font-bold text-slate-900">CRM Modular</h1>
        <p className="mb-4 text-sm text-slate-600">Ingresa con tu cuenta corporativa.</p>
        <form onSubmit={onSubmit} className="space-y-3">
          <Field label="Correo">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="username" required />
          </Field>
          <Field label="Contraseña">
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </Field>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
        <p className="mt-4 text-xs text-slate-500">
          Demo local: <code>admin@crm.local</code> / <code>password</code>
        </p>
      </Card>
    </div>
  );
}
