import React, { useEffect, useMemo, useState } from 'react';
import { apiJson } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button, Card, Field, Input, Select } from '@/components/ui';

const STAGES = ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'] as const;

type Prospect = Record<string, unknown>;

export default function PipelinePage() {
  const { token, hasPermission } = useAuth();
  const [rows, setRows] = useState<Prospect[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    title: '',
    stage: 'LEAD',
    amount: '',
    currency: 'USD',
    customerId: '',
  });

  async function refresh() {
    const data = await apiJson<Prospect[]>('/api/prospects', token);
    setRows(data);
  }

  useEffect(() => {
    refresh();
  }, [token]);

  const byStage = useMemo(() => {
    const m = new Map<string, Prospect[]>();
    for (const s of STAGES) {
      m.set(s, []);
    }
    for (const p of rows) {
      const st = String(p.stage);
      if (!m.has(st)) {
        m.set(st, []);
      }
      m.get(st)!.push(p);
    }
    return m;
  }, [rows]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await apiJson('/api/prospects', token, {
      method: 'POST',
      body: JSON.stringify({
        title: form.title,
        stage: form.stage,
        amount: form.amount ? Number(form.amount) : null,
        currency: form.currency,
        customerId: form.customerId ? Number(form.customerId) : null,
      }),
    });
    setShow(false);
    await refresh();
  }

  async function move(id: string | number, stage: string) {
    const current = rows.find((r) => String(r.id) === String(id));
    if (!current) {
      return;
    }
    await apiJson(`/api/prospects/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify({
        title: current.title,
        customerId: current.customerId ?? null,
        stage,
        amount: current.amount ?? null,
        currency: current.currency ?? 'USD',
        ownerUserId: current.ownerUserId ?? null,
        expectedCloseDate: current.expectedCloseDate ?? null,
      }),
    });
    await refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pipeline comercial</h1>
          <p className="text-sm text-slate-600">Etapas de venta y seguimiento de prospectos.</p>
        </div>
        {hasPermission('prospects.write') && <Button onClick={() => setShow(true)}>Nueva oportunidad</Button>}
      </div>

      <div className="grid gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {STAGES.map((stage) => (
          <Card key={stage} className="p-3">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{stage}</h3>
            <div className="space-y-2">
              {(byStage.get(stage) ?? []).map((p) => (
                <div key={String(p.id)} className="rounded-lg bg-slate-50 p-2 text-sm ring-1 ring-slate-100">
                  <div className="font-semibold">{String(p.title)}</div>
                  <div className="text-xs text-slate-600">{p.amount != null ? `$${String(p.amount)}` : '—'}</div>
                  {hasPermission('prospects.write') && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {STAGES.filter((s) => s !== stage).map((s) => (
                        <button
                          key={s}
                          type="button"
                          className="rounded bg-white px-2 py-0.5 text-[10px] ring-1 ring-slate-200 hover:bg-slate-100"
                          onClick={() => move(String(p.id), s)}
                        >
                          → {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md">
            <h2 className="mb-3 text-lg font-semibold">Nueva oportunidad</h2>
            <form className="space-y-3" onSubmit={create}>
              <Field label="Título">
                <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </Field>
              <Field label="Etapa">
                <Select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Monto">
                <Input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} type="number" step="0.01" />
              </Field>
              <Field label="ID cliente (opcional)">
                <Input value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} />
              </Field>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShow(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Crear</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
