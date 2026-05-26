import React, { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-brand-50 text-brand-800 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`;

export default function Shell() {
  const { user, logout, hasPermission } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen md:flex">
      <aside className="w-full shrink-0 border-b border-slate-200 bg-white md:w-60 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-2 p-4">
          <Link to="/" className="text-lg font-bold text-brand-900">
            CRM Modular
          </Link>
          <Button variant="ghost" className="md:hidden" type="button" onClick={() => setMenuOpen((o) => !o)}>
            Menú
          </Button>
        </div>
        <nav className={`flex-col gap-1 px-3 pb-4 md:flex ${menuOpen ? 'flex' : 'hidden md:flex'}`}>
          {hasPermission('dashboard.view') && (
            <NavLink to="/" end className={linkClass} onClick={() => setMenuOpen(false)}>
              Dashboard
            </NavLink>
          )}
          {hasPermission('customers.read') && (
            <NavLink to="/clientes" className={linkClass} onClick={() => setMenuOpen(false)}>
              Clientes
            </NavLink>
          )}
          {hasPermission('prospects.read') && (
            <NavLink to="/pipeline" className={linkClass} onClick={() => setMenuOpen(false)}>
              Pipeline
            </NavLink>
          )}
          {hasPermission('campaigns.read') && (
            <NavLink to="/campanas" className={linkClass} onClick={() => setMenuOpen(false)}>
              Campañas
            </NavLink>
          )}
          {hasPermission('users.manage') && (
            <NavLink to="/admin/usuarios" className={linkClass} onClick={() => setMenuOpen(false)}>
              Administración
            </NavLink>
          )}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{user?.fullName}</span>
            <span className="mx-2 text-slate-300">·</span>
            <span>{user?.roles?.join(', ')}</span>
          </div>
          <Button variant="ghost" type="button" onClick={logout}>
            Salir
          </Button>
        </header>
        <main className="mx-auto max-w-6xl p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
