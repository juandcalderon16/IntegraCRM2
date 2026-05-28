import React, { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, Button } from './ui';

const navLink =
  'rounded-xl px-4 py-2 text-sm font-medium transition whitespace-nowrap';

function navClass({ isActive }: { isActive: boolean }) {
  return isActive
    ? `${navLink} bg-brand-50 text-brand-700`
    : `${navLink} text-slate-600 hover:bg-white hover:text-slate-900`;
}

export default function Shell() {
  const { user, logout, hasPermission } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Top bar — estilo LoopAI */}
      <header className="sticky top-0 z-40 border-b border-surface-border bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-indigo-500 text-sm font-bold text-white">
              L
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">LoopCRM</span>
          </Link>

          <button
            type="button"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
          >
            Menú
          </button>

          <nav
            className={`${mobileOpen ? 'flex' : 'hidden'} absolute left-0 right-0 top-full flex-col gap-1 border-b border-surface-border bg-white p-3 shadow-lg md:static md:flex md:flex-row md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
          >
            {hasPermission('dashboard.view') && (
              <NavLink to="/" end className={navClass} onClick={() => setMobileOpen(false)}>
                Dashboard
              </NavLink>
            )}
            {hasPermission('customers.read') && (
              <NavLink to="/clientes" className={navClass} onClick={() => setMobileOpen(false)}>
                Clientes
              </NavLink>
            )}
            {hasPermission('prospects.read') && (
              <NavLink to="/pipeline" className={navClass} onClick={() => setMobileOpen(false)}>
                Pipeline
              </NavLink>
            )}
            {hasPermission('campaigns.read') && (
              <NavLink to="/campanas" className={navClass} onClick={() => setMobileOpen(false)}>
                Campañas
              </NavLink>
            )}
            {hasPermission('users.manage') && (
              <NavLink to="/admin/usuarios" className={navClass} onClick={() => setMobileOpen(false)}>
                Admin
              </NavLink>
            )}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-2 text-right">
              <div>
                <p className="text-sm font-semibold text-slate-900">{user?.fullName}</p>
                <p className="text-xs text-slate-400">{user?.roles?.[0]}</p>
              </div>
              <Avatar name={user?.fullName ?? 'U'} />
            </div>
            <Button variant="ghost" type="button" onClick={logout}>
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-6 md:px-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}
