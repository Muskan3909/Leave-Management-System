import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink-50 px-4 text-center">
      <div>
        <p className="font-display text-6xl font-semibold text-ink-200">404</p>
        <h1 className="mt-2 font-display text-xl font-semibold text-ink-900">Page not found</h1>
        <p className="mt-1 text-sm text-ink-500">The page you're looking for doesn't exist or has moved.</p>
        <Link
          to="/"
          className="mt-5 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
