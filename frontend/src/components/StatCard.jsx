export default function StatCard({ label, value, accent = 'ink', hint }) {
  const accents = {
    ink: 'text-ink-800',
    brand: 'text-brand-600',
    clay: 'text-clay-600',
    rose: 'text-rose-600',
  };
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-panel">
      <p className="text-xs font-medium uppercase tracking-wider text-ink-400">{label}</p>
      <p className={`mt-2 font-display text-3xl font-semibold ${accents[accent]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}
