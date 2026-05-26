import React, { useEffect, useState } from 'react';
import { apiJson } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button, Card, Field, Input } from '@/components/ui';

type Row = { id: number; email: string; fullName: string; enabled: boolean; roles: string[] };
type RoleRow = { id: number; name: string };

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<Row[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    enabled: true,
    rolesCsv: 'VENDEDOR',
  });

  async function refresh() {
    const [u, r] = await Promise.all([
      apiJson<Row[]>('/api/admin/users', token),
      apiJson<RoleRow[]>('/api/admin/roles', token),
    ]);
    setUsers(u);
    setRoles(r);
  }

  useEffect(() => {
    refresh();
  }, [token]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const roleNames = form.rolesCsv
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    await apiJson('/api/admin/users', token, {
      method: 'POST',
      body: JSON.stringify({
        email: form.email,
        password: form.password || undefined,
        fullName: form.fullName,
        enabled: form.enabled,
        roleNames,
      }),
    });
    setShow(false);
    setForm({ email: '', password: '', fullName: '', enabled: true, rolesCsv: 'VENDEDOR' });
    await refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Usuarios y roles</h1>
          <p className="text-sm text-slate-600">Control de accesos del CRM.</p>
        </div>
        <Button onClick={() => setShow(true)}>Nuevo usuario</Button>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Roles</th>
              <th className="px-4 py-3">Activo</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-50">
                <td className="px-4 py-3 font-medium">{u.fullName}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.roles.join(', ')}</td>
                <td className="px-4 py-3">{u.enabled ? 'Sí' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <h3 className="mb-2 font-semibold">Roles disponibles</h3>
        <p className="text-sm text-slate-600">{roles.map((r) => r.name).join(', ')}</p>
      </Card>

      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-lg">
            <h2 className="mb-3 text-lg font-semibold">Crear usuario</h2>
            <form className="space-y-3" onSubmit={create}>
              <Field label="Email">
                <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Nombre completo">
                <Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </Field>
              <Field label="Contraseña inicial">
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </Field>
              <Field label="Roles (coma)">
                <Input
                  placeholder="VENDEDOR, ANALISTA"
                  value={form.rolesCsv}
                  onChange={(e) => setForm({ ...form, rolesCsv: e.target.value })}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                />
                Activo
              </label>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShow(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
