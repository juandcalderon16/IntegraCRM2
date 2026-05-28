import React, { useEffect, useMemo, useState } from 'react';
import { apiJson } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import {
  Button,
  Card,
  Field,
  Input,
  MetricCard,
  Modal,
  PageHeader,
  Select,
  StatusBadge,
} from '@/components/ui';

const STAGES = ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'] as const;

type Prospect = Record<string, unknown>;

export default function PipelinePage() {
  const { token, hasPermission } = useAuth();
  const [rows, setRows] = useState<Prospect[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ title: '', stage: 'LEAD', amount: '', currency: 'USD', customerId: '' });

  async function refresh() {
    setRows(await apiJson<Prospect[]>('/api/prospects', token));
  }

  useEffect(() => {
    refresh();
  }, [token]);

  const byStage = useMemo(() => {
    const m = new Map<string, Prospect[]>();
    for (const s of STAGES) m.set(s, []);
    for (const p of rows) {
      const st = String(p.stage);
      if (!m.has(st)) m.set(st, []);
      m.get(st)!.push(p);
    }
    return m;
  }, [rows]);

  const pipelineValue = rows
    .filter((p) => !['WON', 'LOST'].includes(String(p.stage)))
    .reduce((s, p) => s + Number(p.amount ?? 0), 0);

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
    if (!current) return;
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
    <div className="space-y-6">
      <PageHeader
        title="Pipeline comercial"
        subtitle="Seguimiento por etapas de venta."
        actions={hasPermission('prospects.write') && <Button variant="gradient" onClick={() => setShow(true)}>+ Nueva oportunidad</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Oportunidades abiertas" value={rows.filter((p) => !['WON', 'LOST'].includes(String(p.stage))).length} positive />
        <MetricCard label="Valor pipeline" value={`$${pipelineValue.toLocaleString()}`} deltaLabel="Suma etapas activas" positive />
        <MetricCard label="Ganadas" value={byStage.get('WON')?.length ?? 0} deltaLabel={`${byStage.get('LOST')?.length ?? 0} perdidas`} positive />
      </div>

      <div className="grid gap-4 overflow-x-auto pb-2 lg:grid-cols-3 xl:grid-cols-6">
        {STAGES.map((stage) => (
          <Card key={stage} className="min-w-[200px] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">{stage}</h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {(byStage.get(stage) ?? []).length}
              </span>
            </div>
            <div className="space-y-2">
              {(byStage.get(stage) ?? []).map((p) => (
                <div key={String(p.id)} className="rounded-xl bg-surface-muted p-3 ring-1 ring-surface-border/60">
                  <p className="text-sm font-semibold text-slate-900">{String(p.title)}</p>
                  <p className="mt-1 text-xs font-medium text-brand-600">
                    {p.amount != null ? `$${Number(p.amount).toLocaleString()}` : '—'}
                  </p>
                  <StatusBadge status={stage} />
                  {hasPermission('prospects.write') && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {STAGES.filter((s) => s !== stage)
                        .slice(0, 3)
                        .map((s) => (
                          <button
                            key={s}
                            type="button"
                            className="rounded-lg bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500 ring-1 ring-surface-border hover:text-brand-600"
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

      <Modal open={show} onClose={() => setShow(false)} title="Nueva oportunidad">
        <form className="space-y-4" onSubmit={create}>
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
          <Field label="Monto (USD)">
            <Input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} type="number" step="0.01" />
          </Field>
          <Field label="ID cliente (opcional)">
            <Input value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setShow(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="gradient">
              Crear
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
