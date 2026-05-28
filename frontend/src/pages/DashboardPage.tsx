import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gqlClient } from '@/lib/graphql';
import { apiJson, downloadBlob } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button, Card, MetricCard, PageHeader } from '@/components/ui';

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
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const client = gqlClient(token);
        const data = await client.request<{ dashboardStats: Stats }>(GQL);
        if (!cancelled) setStats(data.dashboardStats);
      } catch {
        try {
          const rest = await apiJson<Stats>('/api/dashboard/stats', token);
          if (!cancelled) setStats(rest);
        } catch (e) {
          if (!cancelled) setErr(e instanceof Error ? e.message : 'Error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard ejecutivo"
        subtitle="Indicadores clave del equipo comercial."
        actions={
          hasPermission('reports.export') && (
            <>
              <Button variant="ghost" onClick={() => token && downloadBlob('/api/reports/dashboard.pdf', token, 'dashboard.pdf')}>
                Exportar PDF
              </Button>
              <Button variant="ghost" onClick={() => token && downloadBlob('/api/reports/dashboard.xlsx', token, 'dashboard.xlsx')}>
                Excel
              </Button>
            </>
          )
        }
      />

      {err && <p className="text-sm text-red-600">{err}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Clientes activos" value={stats?.activeCustomers ?? '—'} deltaLabel="Cuentas con status ACTIVE" positive />
        <MetricCard label="Oportunidades abiertas" value={stats?.openOpportunities ?? '—'} deltaLabel="Prospectos en pipeline" positive />
        <MetricCard label="Ventas cerradas" value={stats?.closedWonDeals ?? '—'} deltaLabel="Estado WON" positive />
        <MetricCard
          label="Ingresos ganados"
          value={stats?.closedWonRevenue != null ? `$${stats.closedWonRevenue.toLocaleString()}` : '—'}
          deltaLabel="Suma oportunidades ganadas"
          positive
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-gradient-to-br from-brand-50/60 to-white">
          <h3 className="font-semibold text-slate-900">Resumen comercial</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Tienes <strong>{stats?.openOpportunities ?? 0}</strong> oportunidades abiertas y{' '}
            <strong>{stats?.activeCustomers ?? 0}</strong> clientes activos. El pipeline generó{' '}
            <strong>${stats?.closedWonRevenue?.toLocaleString() ?? 0}</strong> en ventas cerradas.
          </p>
        </Card>
        <Card>
          <h3 className="font-semibold text-slate-900">Accesos rápidos</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: 'Clientes', href: '/clientes', icon: '👥' },
              { label: 'Pipeline', href: '/pipeline', icon: '📊' },
              { label: 'Campañas', href: '/campanas', icon: '📣' },
              { label: 'Admin', href: '/admin/usuarios', icon: '⚙️' },
            ].map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center gap-2 rounded-xl bg-surface-muted px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
