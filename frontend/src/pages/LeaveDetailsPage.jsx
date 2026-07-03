import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { extractErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function LeaveDetailsPage() {
  const { id } = useParams();
  const { isManager } = useAuth();
  const navigate = useNavigate();

  const [leave, setLeave] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  function load() {
    setLoading(true);
    api
      .get(`/leaves/${id}`)
      .then(({ data }) => {
        setLeave(data.leave);
        setAuditLog(data.auditLog || []);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleDecision(decision) {
    setError('');
    if (decision === 'reject' && comments.trim().length < 3) {
      setError('Please add a short comment explaining the rejection.');
      return;
    }
    setActionLoading(true);
    try {
      await api.put(`/leaves/${id}/${decision}`, { comments: comments.trim() || undefined });
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading request…" />;
  if (!leave) return <p className="text-sm text-ink-500">Request not found.</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button onClick={() => navigate(-1)} className="text-sm font-medium text-ink-500 hover:text-ink-800">
        ← Back
      </button>

      <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-panel">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-xl font-semibold text-ink-900">{leave.leave_type} leave</h1>
            {isManager && leave.employee_name && (
              <p className="mt-0.5 text-sm text-ink-500">Requested by {leave.employee_name}</p>
            )}
          </div>
          <StatusBadge status={leave.status} />
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-ink-400">Start date</dt>
            <dd className="mt-0.5 font-medium text-ink-800">{leave.start_date}</dd>
          </div>
          <div>
            <dt className="text-ink-400">End date</dt>
            <dd className="mt-0.5 font-medium text-ink-800">{leave.end_date}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-ink-400">Reason</dt>
            <dd className="mt-0.5 font-medium text-ink-800">{leave.reason}</dd>
          </div>
          <div>
            <dt className="text-ink-400">Submitted</dt>
            <dd className="mt-0.5 text-ink-600">{leave.created_at}</dd>
          </div>
          <div>
            <dt className="text-ink-400">Last updated</dt>
            <dd className="mt-0.5 text-ink-600">{leave.updated_at}</dd>
          </div>
        </dl>

        {leave.manager_comments && (
          <div className="mt-6 rounded-lg bg-ink-50 p-4 text-sm">
            <p className="font-medium text-ink-700">Manager comments</p>
            <p className="mt-1 text-ink-600">{leave.manager_comments}</p>
          </div>
        )}

        {!isManager && leave.status === 'PENDING' && (
          <div className="mt-6 flex gap-3">
            <Link
              to={`/apply/${leave.id}`}
              className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
            >
              Edit request
            </Link>
          </div>
        )}

        {isManager && leave.status === 'PENDING' && (
          <div className="mt-6 border-t border-ink-100 pt-5">
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Comments (required to reject)</label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add context for the employee…"
              className="w-full resize-none rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            {error && <p role="alert" className="mt-2 text-sm text-rose-600">{error}</p>}
            <div className="mt-3 flex gap-3">
              <button
                onClick={() => handleDecision('approve')}
                disabled={actionLoading}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                Approve
              </button>
              <button
                onClick={() => handleDecision('reject')}
                disabled={actionLoading}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </div>

      {auditLog.length > 0 && (
        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-panel">
          <h2 className="font-display text-lg font-semibold text-ink-900">Activity log</h2>
          <ol className="mt-4 space-y-4 border-l border-ink-100 pl-4">
            {auditLog.map((entry) => (
              <li key={entry.id} className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-brand-500" />
                <p className="text-sm font-medium text-ink-800">
                  {entry.action.charAt(0) + entry.action.slice(1).toLowerCase()}
                  {entry.actor_name && <span className="font-normal text-ink-500"> by {entry.actor_name}</span>}
                </p>
                {entry.details && <p className="mt-0.5 text-sm text-ink-500">"{entry.details}"</p>}
                <p className="mt-0.5 text-xs text-ink-400">{entry.created_at}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
