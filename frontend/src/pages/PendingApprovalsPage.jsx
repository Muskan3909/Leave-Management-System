import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { extractErrorMessage } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PendingApprovalsPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    api
      .get('/leaves/pending')
      .then(({ data }) => setLeaves(data.leaves))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Pending approvals</h1>
        <p className="mt-1 text-sm text-ink-500">Requests waiting on your decision, oldest first is at the bottom.</p>
      </div>

      {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      {loading ? (
        <LoadingSpinner label="Loading approvals…" />
      ) : leaves.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center text-sm text-ink-400">
          You're all caught up — no pending requests.
        </div>
      ) : (
        <ul className="space-y-3">
          {leaves.map((leave) => (
            <li
              key={leave.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-panel"
            >
              <div>
                <p className="font-medium text-ink-800">
                  {leave.employee_name} <span className="text-ink-400">· {leave.employee_department}</span>
                </p>
                <p className="mt-0.5 text-sm text-ink-500">
                  {leave.leave_type} · {leave.start_date} → {leave.end_date}
                </p>
                <p className="mt-1 max-w-md truncate text-sm text-ink-400">{leave.reason}</p>
              </div>
              <Link
                to={`/leaves/${leave.id}`}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Review
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
