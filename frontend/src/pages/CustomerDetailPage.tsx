import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiJson } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, Button, Card, Field, PageHeader, Select, StatusBadge, TextArea } from '@/components/ui';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const { token, hasPermission } = useAuth();
  const [customer, setCustomer] = useState<Record<string, unknown> | null>(null);
  const [interactions, setInteractions] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState({ type: 'CALL', summary: '' });

  async function load() {
    if (!id) return;
    const c = await apiJson<Record<string, unknown>>(`/api/customers/${id}`, token);
    setCustomer(c);
    if (hasPermission('interactions.read')) {
      setInteractions(await apiJson<Record<string, unknown>[]>(`/api/interactions/customer/${id}`, token));
    }
  }

  useEffect(() => {
    load();
  }, [id, token]);

  async function addInteraction(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    await apiJson('/api/interactions', token, {
      method: 'POST',
      body: JSON.stringify({ customerId: Number(id), type: form.type, summary: form.summary }),
    });
    setForm({ type: 'CALL', summary: '' });
    await load();
  }

  if (!customer) {
    return <p className="text-sm text-slate-500">Cargando cliente…</p>;
  }

  return (
    <div className="space-y-6">
      <Link to="/clientes" className="text-sm font-medium text-brand-600 hover:text-brand-700">
        ← Volver a clientes
      </Link>

      <PageHeader
        title={String(customer.name)}
        subtitle={`${String(customer.company ?? '')} · ${String(customer.email ?? '')}`}
        actions={<StatusBadge status={String(customer.status)} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <Avatar name={String(customer.name)} className="h-12 w-12 text-base" />
            <div>
              <p className="font-semibold text-slate-900">{String(customer.phone ?? 'Sin teléfono')}</p>
              <p className="text-sm text-slate-500">{String(customer.notes ?? 'Sin notas')}</p>
            </div>
          </div>

          <h2 className="mb-3 font-semibold text-slate-900">Historial de interacciones</h2>
          <ul className="space-y-3">
            {interactions.map((it) => (
              <li key={String(it.id)} className="rounded-xl bg-surface-muted px-4 py-3">
                <div className="flex items-center gap-2">
                  <StatusBadge status={String(it.type)} />
                  <span className="text-sm text-slate-700">{String(it.summary)}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{String(it.occurredAt)}</p>
              </li>
            ))}
            {!interactions.length && <li className="text-sm text-slate-400">Sin interacciones registradas.</li>}
          </ul>

          {hasPermission('interactions.write') && (
            <form className="mt-6 space-y-3 border-t border-surface-border pt-4" onSubmit={addInteraction}>
              <Field label="Tipo">
                <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="CALL">Llamada</option>
                  <option value="EMAIL">Email</option>
                  <option value="MEETING">Reunión</option>
                  <option value="NOTE">Nota</option>
                </Select>
              </Field>
              <Field label="Resumen">
                <TextArea required rows={3} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
              </Field>
              <Button type="submit" variant="gradient">
                Registrar interacción
              </Button>
            </form>
          )}
        </Card>

        <Card className="bg-gradient-to-br from-brand-50/60 to-white">
          <h3 className="font-semibold text-slate-900">Resumen</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Empresa</dt>
              <dd className="font-medium">{String(customer.company ?? '—')}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium">{String(customer.email ?? '—')}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Interacciones</dt>
              <dd className="font-medium">{interactions.length}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
