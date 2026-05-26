import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiJson } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button, Card, Field, Select, TextArea } from '@/components/ui';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const { token, hasPermission } = useAuth();
  const [customer, setCustomer] = useState<Record<string, unknown> | null>(null);
  const [interactions, setInteractions] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState({ type: 'CALL', summary: '' });

  async function load() {
    if (!id) {
      return;
    }
    const c = await apiJson<Record<string, unknown>>(`/api/customers/${id}`, token);
    setCustomer(c);
    if (hasPermission('interactions.read')) {
      const i = await apiJson<Record<string, unknown>[]>(`/api/interactions/customer/${id}`, token);
      setInteractions(i);
    }
  }

  useEffect(() => {
    load();
  }, [id, token]);

  async function addInteraction(e: React.FormEvent) {
    e.preventDefault();
    if (!id) {
      return;
    }
    await apiJson('/api/interactions', token, {
      method: 'POST',
      body: JSON.stringify({ customerId: Number(id), type: form.type, summary: form.summary }),
    });
    setForm({ type: 'CALL', summary: '' });
    await load();
  }

  if (!customer) {
    return <p className="text-sm text-slate-600">Cargando…</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{String(customer.name)}</h1>
        <p className="text-sm text-slate-600">
          {String(customer.company ?? '')} · {String(customer.email ?? '')}
        </p>
      </div>

      <Card>
        <h2 className="mb-2 font-semibold">Historial de interacciones</h2>
        <ul className="space-y-2 text-sm">
          {interactions.map((it) => (
            <li key={String(it.id)} className="rounded-lg bg-slate-50 px-3 py-2">
              <span className="font-medium">{String(it.type)}</span>
              <span className="mx-2 text-slate-400">·</span>
              <span>{String(it.summary)}</span>
              <div className="text-xs text-slate-500">{String(it.occurredAt)}</div>
            </li>
          ))}
          {!interactions.length && <li className="text-slate-500">Sin interacciones registradas.</li>}
        </ul>

        {hasPermission('interactions.write') && (
          <form className="mt-4 space-y-2 border-t border-slate-100 pt-4" onSubmit={addInteraction}>
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
            <Button type="submit">Registrar interacción</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
