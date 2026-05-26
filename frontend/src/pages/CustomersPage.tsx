import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiJson } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import RequirePerm from '@/components/RequirePerm';
import { Button, Card, Field, Input, TextArea } from '@/components/ui';

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
      const data = await apiJson<Customer[]>('/api/customers', token);
      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [token]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await apiJson('/api/customers', token, {
      method: 'POST',
      body: JSON.stringify({ ...form }),
    });
    setShow(false);
    setForm({ name: '', email: '', phone: '', company: '', status: 'ACTIVE', notes: '' });
    await refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-slate-600">Historial de contactos y cuentas.</p>
        </div>
        {hasPermission('customers.write') && (
          <Button onClick={() => setShow(true)}>Nuevo cliente</Button>
        )}
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={5}>
                  Cargando…
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr key={String(c.id)} className="border-b border-slate-50 hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium">{String(c.name)}</td>
                  <td className="px-4 py-3">{String(c.company ?? '')}</td>
                  <td className="px-4 py-3">{String(c.email ?? '')}</td>
                  <td className="px-4 py-3">{String(c.status)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link className="text-brand-700 hover:underline" to={`/clientes/${String(c.id)}`}>
                      Ver
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="max-h-[90vh] w-full max-w-lg overflow-y-auto">
            <h2 className="mb-3 text-lg font-semibold">Registrar cliente</h2>
            <form className="space-y-3" onSubmit={create}>
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
              <Field label="Estado">
                <Input value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
              </Field>
              <Field label="Notas">
                <TextArea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </Field>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShow(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <RequirePerm perm="interactions.read">
        <p className="text-xs text-slate-500">
          Como asesor, abre un cliente para revisar el historial de interacciones.
        </p>
      </RequirePerm>
    </div>
  );
}
