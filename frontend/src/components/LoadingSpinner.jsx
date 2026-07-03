export default function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-ink-400">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink-200 border-t-brand-500" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
