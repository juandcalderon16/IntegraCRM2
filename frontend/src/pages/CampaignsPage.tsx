import React, { useEffect, useMemo, useState } from 'react';
import { apiJson } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import CampaignDotChart from '@/components/CampaignDotChart';
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
  Select,
  StatusBadge,
  TabFilter,
  TableHead,
} from '@/components/ui';

type Campaign = {
  id: number;
  name: string;
  channel?: string;
  status: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
  description?: string;
};

type Effectiveness = {
  campaignId: number;
  campaignName: string;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  ctrPercent: number;
  conversionRatePercent: number;
  attributedRevenue: number;
};

type MetricRow = {
  id: number;
  campaignId: number;
  impressions: number;
  clicks: number;
  conversions: number;
  leadsGenerated: number;
  revenueAttributed: number;
  recordedAt: string;
};

type TabId = 'ALL' | 'ACTIVE' | 'DRAFT';

export default function CampaignsPage() {
  const { token, hasPermission } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [effectivenessMap, setEffectivenessMap] = useState<Record<number, Effectiveness>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<MetricRow[]>([]);
  const [tab, setTab] = useState<TabId>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const data = await apiJson<Campaign[]>('/api/campaigns', token);
      setCampaigns(data);
      const effEntries = await Promise.all(
        data.map(async (c) => {
          try {
            const e = await apiJson<Effectiveness>(`/api/campaigns/${c.id}/effectiveness`, token);
            return [c.id, e] as const;
          } catch {
            return [c.id, null] as const;
          }
        })
      );
      const map: Record<number, Effectiveness> = {};
      for (const [id, e] of effEntries) {
        if (e) map[id] = e;
      }
      setEffectivenessMap(map);
      if (data.length && !selectedId) {
        setSelectedId(data[0].id);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [token]);

  useEffect(() => {
    if (!selectedId || !token) return;
    apiJson<MetricRow[]>(`/api/campaigns/${selectedId}/metrics`, token)
      .then(setMetrics)
      .catch(() => setMetrics([]));
  }, [selectedId, token]);

  const filtered = useMemo(() => {
    if (tab === 'ALL') return campaigns;
    return campaigns.filter((c) => c.status === tab);
  }, [campaigns, tab]);

  const totals = useMemo(() => {
    const effs = Object.values(effectivenessMap);
    const active = campaigns.filter((c) => c.status === 'ACTIVE').length;
    const impressions = effs.reduce((s, e) => s + e.totalImpressions, 0);
    const revenue = effs.reduce((s, e) => s + Number(e.attributedRevenue ?? 0), 0);
    const avgCtr = effs.length ? effs.reduce((s, e) => s + Number(e.ctrPercent), 0) / effs.length : 0;
    const leads = effs.reduce((s, e) => s + e.totalConversions, 0);
    return { active, impressions, revenue, avgCtr, leads };
  }, [campaigns, effectivenessMap]);

  const selected = campaigns.find((c) => c.id === selectedId);
  const selectedEff = selectedId ? effectivenessMap[selectedId] : undefined;

  const chartPoints = useMemo(() => {
    return [...metrics]
      .reverse()
      .slice(-7)
      .map((m) => ({
        label: new Date(m.recordedAt).toLocaleDateString('es', { day: 'numeric', month: 'short' }),
        value: Number(m.revenueAttributed ?? m.clicks ?? 0),
      }));
  }, [metrics]);

  const topCampaigns = useMemo(() => {
    return [...campaigns]
      .map((c) => ({ c, eff: effectivenessMap[c.id] }))
      .filter((x) => x.eff)
      .sort((a, b) => Number(b.eff!.attributedRevenue) - Number(a.eff!.attributedRevenue))
      .slice(0, 4);
  }, [campaigns, effectivenessMap]);

  const tabCounts = {
    ALL: campaigns.length,
    ACTIVE: campaigns.filter((c) => c.status === 'ACTIVE').length,
    DRAFT: campaigns.filter((c) => c.status === 'DRAFT').length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campañas de marketing"
        subtitle="Mide alcance, CTR, conversiones e ingresos atribuidos desde Supabase."
        actions={
          hasPermission('campaigns.write') && (
            <Button variant="gradient" onClick={() => setShowForm(true)}>
              + Registrar métricas
            </Button>
          )
        }
      />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Campañas activas"
          value={totals.active}
          delta={`${campaigns.length} total`}
          deltaLabel="En base de datos Supabase"
          positive
        />
        <MetricCard
          label="Impresiones totales"
          value={totals.impressions.toLocaleString()}
          delta={`${totals.avgCtr.toFixed(1)}% CTR`}
          deltaLabel="Promedio entre campañas"
          positive={totals.avgCtr > 0}
        />
        <MetricCard
          label="Conversiones"
          value={totals.leads.toLocaleString()}
          deltaLabel="Suma de conversiones registradas"
        />
        <MetricCard
          label="Ingresos atribuidos"
          value={`$${totals.revenue.toLocaleString()}`}
          deltaLabel="Revenue acumulado (campaign_metrics)"
          positive
        />
      </div>

      {/* Analytics + sidebar */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Analítica de campaña</h2>
              <p className="text-sm text-slate-500">
                {selected?.name ?? 'Selecciona una campaña'} — ingresos / clicks por registro
              </p>
            </div>
            <Select
              className="w-auto min-w-[180px]"
              value={selectedId ?? ''}
              onChange={(e) => setSelectedId(Number(e.target.value))}
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <CampaignDotChart
            points={chartPoints}
            highlightIndex={chartPoints.length > 1 ? Math.floor(chartPoints.length / 2) : 0}
            valuePrefix="$"
          />
          {selectedEff && (
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-surface-border pt-4 sm:grid-cols-4">
              <MiniStat label="CTR" value={`${selectedEff.ctrPercent}%`} />
              <MiniStat label="Conv." value={`${selectedEff.conversionRatePercent}%`} />
              <MiniStat label="Clicks" value={String(selectedEff.totalClicks)} />
              <MiniStat label="Ingresos" value={`$${Number(selectedEff.attributedRevenue).toLocaleString()}`} />
            </div>
          )}
          <div className="mt-5">
            <Button
              variant="gradient"
              className="w-full sm:w-auto"
              onClick={() => document.getElementById('campaign-table')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver tabla de campañas
            </Button>
          </div>
        </Card>

        {/* Priority sidebar */}
        <Card className="bg-gradient-to-br from-brand-50/80 to-indigo-50/50">
          <h2 className="mb-1 text-lg font-semibold text-slate-900">Top campañas</h2>
          <p className="mb-4 text-xs text-slate-500">Por ingresos atribuidos</p>
          <ul className="space-y-3">
            {topCampaigns.map(({ c, eff }) => (
              <li
                key={c.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl bg-white/80 p-3 shadow-sm transition hover:bg-white"
                onClick={() => setSelectedId(c.id)}
              >
                <Avatar name={c.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{c.name}</p>
                  <p className="text-xs text-slate-500">
                    {c.channel ?? '—'} · CTR {eff!.ctrPercent}%
                  </p>
                </div>
                <span className="text-sm font-bold text-brand-700">
                  ${Number(eff!.attributedRevenue).toLocaleString()}
                </span>
              </li>
            ))}
            {!topCampaigns.length && (
              <li className="text-sm text-slate-500">Aún no hay métricas registradas.</li>
            )}
          </ul>
        </Card>
      </div>

      {/* Campaign table */}
      <div id="campaign-table">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Gestionar campañas</h2>
        <TabFilter
          tabs={[
            { id: 'ALL' as TabId, label: 'Todas', count: tabCounts.ALL },
            { id: 'ACTIVE' as TabId, label: 'Activas', count: tabCounts.ACTIVE },
            { id: 'DRAFT' as TabId, label: 'Borrador', count: tabCounts.DRAFT },
          ]}
          active={tab}
          onChange={setTab}
        />
        <DataTable>
          <table className="min-w-full text-left text-sm">
            <TableHead cols={['Campaña', 'Canal', 'Estado', 'Presupuesto', 'CTR', 'Ingresos', '']} />
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    Cargando campañas…
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const eff = effectivenessMap[c.id];
                  return (
                    <tr
                      key={c.id}
                      className={`border-b border-surface-border/60 transition hover:bg-surface-muted/50 ${
                        selectedId === c.id ? 'bg-brand-50/40' : ''
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={c.name} />
                          <div>
                            <p className="font-semibold text-slate-900">{c.name}</p>
                            <p className="text-xs text-slate-400">{c.description?.slice(0, 40) ?? `ID ${c.id}`}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{c.channel ?? '—'}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-5 py-4 font-medium">
                        {c.budget != null ? `$${Number(c.budget).toLocaleString()}` : '—'}
                      </td>
                      <td className="px-5 py-4">{eff ? `${eff.ctrPercent}%` : '—'}</td>
                      <td className="px-5 py-4 font-semibold text-brand-700">
                        {eff ? `$${Number(eff.attributedRevenue).toLocaleString()}` : '—'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-brand-600"
                          onClick={() => setSelectedId(c.id)}
                        >
                          ⋮
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
              {!loading && !filtered.length && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No hay campañas en esta categoría.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataTable>
      </div>

      {hasPermission('campaigns.write') && (
        <MetricFormModal
          open={showForm}
          onClose={() => setShowForm(false)}
          campaigns={campaigns}
          token={token}
          onDone={() => {
            setShowForm(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-muted px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function MetricFormModal({
  open,
  onClose,
  campaigns,
  token,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  token: string | null;
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
    if (!campaignId) return;
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
    <Modal open={open} onClose={onClose} title="Registrar métricas de campaña" wide>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <Field label="Campaña">
          <Select value={campaignId} onChange={(e) => setCampaignId(e.target.value)} required>
            <option value="">Selecciona…</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
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
        <Field label="Leads generados">
          <Input value={leads} onChange={(e) => setLeads(e.target.value)} type="number" />
        </Field>
        <Field label="Ingresos atribuidos ($)">
          <Input value={revenue} onChange={(e) => setRevenue(e.target.value)} type="number" step="0.01" />
        </Field>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="gradient">
            Guardar métricas
          </Button>
        </div>
      </form>
    </Modal>
  );
}
