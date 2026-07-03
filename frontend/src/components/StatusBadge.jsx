const STYLES = {
  PENDING: 'bg-clay-400/15 text-clay-600 ring-1 ring-clay-400/30',
  APPROVED: 'bg-brand-500/10 text-brand-700 ring-1 ring-brand-500/25',
  REJECTED: 'bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/25',
  CANCELLED: 'bg-ink-200/60 text-ink-500 ring-1 ring-ink-300/50',
};

export default function StatusBadge({ status }) {
  const cls = STYLES[status] || STYLES.CANCELLED;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${cls}`}>
      {status}
    </span>
  );
}
