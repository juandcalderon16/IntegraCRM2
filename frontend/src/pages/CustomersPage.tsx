import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiJson } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import {
  Avatar,
  Button,
  DataTable,
  Field,
  Input,
  MetricCard,
  Modal,
  PageHeader,
  StatusBadge,
  TableHead,
  TextArea,
} from '@/components/ui';

type Customer = Record<string, unknown>;

export default function CustomersPage() {
  const { token, hasPermission } = useAuth();
  const [rows, setRows] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', status: 'ACTIVE', notes: '' });

  async function refresh() {
    setLoading(true);
    try {
      setRows(await apiJson<Customer[]>('/api/customers', token));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [token]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await apiJson('/api/customers', token, { method: 'POST', body: JSON.stringify({ ...form }) });
    setShow(false);
    setForm({ name: '', email: '', phone: '', company: '', status: 'ACTIVE', notes: '' });
    await refresh();
  }

  const activeCount = rows.filter((c) => c.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        subtitle="Historial de contactos y cuentas comerciales."
        actions={hasPermission('customers.write') && <Button variant="gradient" onClick={() => setShow(true)}>+ Nuevo cliente</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Total clientes" value={rows.length} deltaLabel="Registrados en Supabase" positive />
        <MetricCard label="Activos" value={activeCount} delta={`${rows.length - activeCount} inactivos`} positive />
        <MetricCard label="Empresas" value={new Set(rows.map((r) => r.company).filter(Boolean)).size} deltaLabel="Cuentas con empresa" positive />
      </div>

      <DataTable>
        <table className="min-w-full text-left text-sm">
          <TableHead cols={['Cliente', 'Empresa', 'Contacto', 'Estado', '']} />
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                  Cargando…
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr key={String(c.id)} className="border-b border-surface-border/60 hover:bg-surface-muted/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={String(c.name)} />
                      <span className="font-semibold text-slate-900">{String(c.name)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{String(c.company ?? '—')}</td>
                  <td className="px-5 py-4 text-slate-500">{String(c.email ?? c.phone ?? '—')}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={String(c.status)} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link to={`/clientes/${String(c.id)}`} className="font-medium text-brand-600 hover:text-brand-700">
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </DataTable>

      <Modal open={show} onClose={() => setShow(false)} title="Registrar cliente">
        <form className="space-y-4" onSubmit={create}>
          <Field label="Nombre">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Teléfono">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Empresa">
            <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </Field>
          <Field label="Notas">
            <TextArea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
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
