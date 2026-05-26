import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from './ui';

export default function RequirePerm({ perm, children }: { perm: string; children: React.ReactNode }) {
  const { hasPermission } = useAuth();
  if (!hasPermission(perm)) {
    return (
      <Card>
        <p className="text-sm text-slate-600">No tienes permiso para ver esta sección ({perm}).</p>
      </Card>
    );
  }
  return <>{children}</>;
}
