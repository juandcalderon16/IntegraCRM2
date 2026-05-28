import React from 'react';

type Point = { label: string; value: number };

/** Gráfico estilo LoopAI: columnas de puntos por valor */
export default function CampaignDotChart({
  points,
  highlightIndex,
  valuePrefix = '',
}: {
  points: Point[];
  highlightIndex?: number;
  valuePrefix?: string;
}) {
  if (!points.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        Sin datos de métricas para graficar
      </div>
    );
  }

  const max = Math.max(...points.map((p) => p.value), 1);

  return (
    <div className="flex h-52 items-end justify-between gap-2 px-2 pt-4">
      {points.map((p, i) => {
        const rows = Math.max(1, Math.round((p.value / max) * 8));
        const highlighted = i === highlightIndex;
        return (
          <div key={p.label} className="relative flex flex-1 flex-col items-center gap-1">
            {highlighted && (
              <div className="absolute -top-8 z-10 rounded-lg bg-brand-600 px-2 py-1 text-xs font-semibold text-white shadow-soft">
                {valuePrefix}
                {p.value.toLocaleString()}
              </div>
            )}
            {highlighted && <div className="absolute bottom-8 top-0 w-px bg-brand-300" />}
            <div className="flex flex-col-reverse gap-0.5">
              {Array.from({ length: rows }).map((_, r) => (
                <span
                  key={r}
                  className={`h-2.5 w-2.5 rounded-full ${
                    highlighted ? 'bg-brand-500' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="mt-2 text-[10px] font-medium text-slate-400">{p.label}</span>
          </div>
        );
      })}
    </div>
  );
}
