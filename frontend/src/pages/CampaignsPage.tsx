import React, { useEffect, useState } from 'react';
import { apiJson } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button, Card, Field, Input } from '@/components/ui';

type Campaign = Record<string, unknown>;

export default function CampaignsPage() {
  const { token, hasPermission } = useAuth();
  const [rows, setRows] = useState<Campaign[]>([]);
  const [effectiveness, setEffectiveness] = useState<Record<string, unknown> | null>(null);

  async function refresh() {
    const data = await apiJson<Campaign[]>('/api/campaigns', token);
    setRows(data);
  }

  useEffect(() => {
    refresh();
  }, [token]);

  async function loadEffectiveness(id: string | number) {
    const e = await apiJson<Record<string, unknown>>(`/api/campaigns/${id}/effectiveness`, token);
    setEffectiveness(e);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Campañas</h1>
        <p className="text-sm text-slate-600">Mide CTR, conversión e ingresos atribuidos.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((c) => (
          <Card key={String(c.id)}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{String(c.name)}</h3>
                <p className="text-xs text-slate-500">
                  {String(c.channel ?? '')} · {String(c.status)}
                </p>
              </div>
              <Button variant="ghost" onClick={() => loadEffectiveness(String(c.id))}>
                Efectividad
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {effectiveness && (
        <Card>
          <h3 className="mb-2 font-semibold">{String(effectiveness.campaignName)}</h3>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <Metric label="Impresiones" v={effectiveness.totalImpressions} />
            <Metric label="Clicks" v={effectiveness.totalClicks} />
            <Metric label="Conversiones" v={effectiveness.totalConversions} />
            <Metric label="CTR %" v={effectiveness.ctrPercent} />
            <Metric label="Tasa conv. %" v={effectiveness.conversionRatePercent} />
            <Metric label="Ingresos atrib." v={effectiveness.attributedRevenue} />
          </div>
        </Card>
      )}

      {hasPermission('campaigns.write') && (
        <CampaignMetricForm
          token={token}
          campaigns={rows}
          onDone={() => {
            refresh();
          }}
        />
      )}
    </div>
  );
}

function Metric({ label, v }: { label: string; v: unknown }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <div className="text-xs uppercase text-slate-500">{label}</div>
      <div className="font-semibold">{v != null ? String(v) : '—'}</div>
    </div>
  );
}

function CampaignMetricForm({
  token,
  campaigns,
  onDone,
}: {
  token: string | null;
  campaigns: Campaign[];
  onDone: () => void;
}) {
  const [campaignId, setCampaignId] = useState('');
  const [impressions, setImpressions] = useState('0');
  const [clicks, setClicks] = useState('0');
  const [conversions, setConversions] = useState('0');
  const [leads, setLeads] = useState('0');
  const [revenue, setRevenue] = useState('0');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!campaignId) {
      return;
    }
    await apiJson(`/api/campaigns/${campaignId}/metrics`, token, {
      method: 'POST',
      body: JSON.stringify({
        impressions: Number(impressions),
        clicks: Number(clicks),
        conversions: Number(conversions),
        leadsGenerated: Number(leads),
        revenueAttributed: Number(revenue),
      }),
    });
    onDone();
  }

  return (
    <Card>
      <h3 className="mb-2 font-semibold">Registrar métricas (analista)</h3>
      <form className="grid gap-3 md:grid-cols-2" onSubmit={submit}>
        <Field label="Campaña">
          <select
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            required
          >
            <option value="">Selecciona…</option>
            {campaigns.map((c) => (
              <option key={String(c.id)} value={String(c.id)}>
                {String(c.name)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Impresiones">
          <Input value={impressions} onChange={(e) => setImpressions(e.target.value)} type="number" />
        </Field>
        <Field label="Clicks">
          <Input value={clicks} onChange={(e) => setClicks(e.target.value)} type="number" />
        </Field>
        <Field label="Conversiones">
          <Input value={conversions} onChange={(e) => setConversions(e.target.value)} type="number" />
        </Field>
        <Field label="Leads">
          <Input value={leads} onChange={(e) => setLeads(e.target.value)} type="number" />
        </Field>
        <Field label="Ingresos atribuidos">
          <Input value={revenue} onChange={(e) => setRevenue(e.target.value)} type="number" step="0.01" />
        </Field>
        <div className="md:col-span-2">
          <Button type="submit">Guardar métricas</Button>
        </div>
      </form>
    </Card>
  );
}
