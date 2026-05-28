import React, { useEffect, useState } from 'react';
import { apiJson } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import {
  Avatar,
  Button,
  Card,
  DataTable,
  Field,
  Input,
  MetricCard,
  Modal,
  PageHeader,
  StatusBadge,
  TableHead,
} from '@/components/ui';

type Row = { id: number; email: string; fullName: string; enabled: boolean; roles: string[] };
type RoleRow = { id: number; name: string };

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<Row[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', fullName: '', enabled: true, rolesCsv: 'VENDEDOR' });

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
    const roleNames = form.rolesCsv.split(',').map((s) => s.trim()).filter(Boolean);
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
    <div className="space-y-6">
      <PageHeader
        title="Administración"
        subtitle="Usuarios, roles y control de accesos."
        actions={<Button variant="gradient" onClick={() => setShow(true)}>+ Nuevo usuario</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Usuarios" value={users.length} positive />
        <MetricCard label="Activos" value={users.filter((u) => u.enabled).length} positive />
        <MetricCard label="Roles" value={roles.length} deltaLabel={roles.map((r) => r.name).join(', ')} positive />
      </div>

      <DataTable>
        <table className="min-w-full text-left text-sm">
          <TableHead cols={['Usuario', 'Email', 'Roles', 'Estado']} />
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-surface-border/60 hover:bg-surface-muted/50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.fullName} />
                    <span className="font-semibold">{u.fullName}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-600">{u.email}</td>
                <td className="px-5 py-4 text-slate-600">{u.roles.join(', ')}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={u.enabled ? 'ACTIVE' : 'INACTIVE'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>

      <Modal open={show} onClose={() => setShow(false)} title="Crear usuario">
        <form className="space-y-4" onSubmit={create}>
          <Field label="Email">
            <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Nombre completo">
            <Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </Field>
          <Field label="Contraseña inicial">
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          <Field label="Roles (separados por coma)">
            <Input placeholder="VENDEDOR, ANALISTA" value={form.rolesCsv} onChange={(e) => setForm({ ...form, rolesCsv: e.target.value })} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
            Usuario activo
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setShow(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="gradient">
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
