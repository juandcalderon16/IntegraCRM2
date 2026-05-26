import React, { useEffect, useState } from 'react';
import { gqlClient } from '@/lib/graphql';
import { apiJson, downloadBlob } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button, Card } from '@/components/ui';

type Stats = {
  activeCustomers: number;
  openOpportunities: number;
  closedWonDeals: number;
  closedWonRevenue: number;
};

const GQL = /* GraphQL */ `
  query Dash {
    dashboardStats {
      activeCustomers
      openOpportunities
      closedWonDeals
      closedWonRevenue
    }
  }
`;

export default function DashboardPage() {
  const { token, hasPermission } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [gqlNote, setGqlNote] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const client = gqlClient(token);
        const data = await client.request<{ dashboardStats: Stats }>(GQL);
        if (!cancelled) {
          setStats(data.dashboardStats);
          setGqlNote('Datos vía GraphQL (consulta avanzada)');
        }
      } catch {
        try {
          const rest = await apiJson<Stats>('/api/dashboard/stats', token);
          if (!cancelled) {
            setStats(rest);
            setGqlNote('GraphQL no disponible; mostrando REST.');
          }
        } catch (e) {
          if (!cancelled) {
            setErr(e instanceof Error ? e.message : 'Error');
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-600">Indicadores clave del equipo.</p>
        </div>
        {hasPermission('reports.export') && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              onClick={() => token && downloadBlob('/api/reports/dashboard.pdf', token, 'dashboard.pdf')}
            >
              PDF
            </Button>
            <Button
              variant="ghost"
              onClick={() => token && downloadBlob('/api/reports/dashboard.xlsx', token, 'dashboard.xlsx')}
            >
              Excel dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={() => token && downloadBlob('/api/reports/customers.xlsx', token, 'clientes.xlsx')}
            >
              Excel clientes
            </Button>
          </div>
        )}
      </div>
      {gqlNote && <p className="text-xs text-slate-500">{gqlNote}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric title="Clientes activos" value={stats?.activeCustomers} />
        <Metric title="Oportunidades abiertas" value={stats?.openOpportunities} />
        <Metric title="Ventas cerradas (ganadas)" value={stats?.closedWonDeals} />
        <Metric title="Ingresos (ganadas)" value={stats?.closedWonRevenue != null ? `$${stats.closedWonRevenue.toLocaleString()}` : undefined} />
      </div>
    </div>
  );
}

function Metric({ title, value }: { title: string; value?: number | string }) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value ?? '—'}</p>
    </Card>
  );
}
