'use client';

export default function LineChart({ data, height = 180 }: { data: { label: string; value: number }[]; height?: number }) {
  if (!data.length) return <p className="py-10 text-center text-sm text-zinc-500">Sin datos todavía.</p>;
  const w = 600, h = height, pad = 8;
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = (w - pad * 2) / Math.max(1, data.length - 1);
  const pts = data.map((d, i) => [pad + i * step, h - pad - (d.value / max) * (h - pad * 2)] as const);
  const line = pts.map((p) => p.join(',')).join(' ');
  const area = `${pad},${h - pad} ${line} ${pad + (data.length - 1) * step},${h - pad}`;

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Gráfica de visitas">
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4F8CFF" stopOpacity="0.35" />
            <stop offset="1" stopColor="#4F8CFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={pad} x2={w - pad} y1={pad + f * (h - pad * 2)} y2={pad + f * (h - pad * 2)} stroke="rgba(255,255,255,0.06)" />
        ))}
        <polygon points={area} fill="url(#chartFill)" />
        <polyline points={line} fill="none" stroke="#4F8CFF" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.5" fill="#4F8CFF" opacity={i === pts.length - 1 ? 1 : 0} />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-zinc-600">
        <span>{data[0]?.label}</span>
        <span>{data[Math.floor(data.length / 2)]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}
