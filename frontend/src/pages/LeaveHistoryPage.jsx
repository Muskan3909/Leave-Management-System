import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { extractErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
const TYPES = ['SICK', 'CASUAL', 'ANNUAL', 'UNPAID', 'OTHER'];

export default function LeaveHistoryPage() {
  const { isManager } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', status: '', leaveType: '' });
  const [cancellingId, setCancellingId] = useState(null);

  const fetchLeaves = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.leaveType) params.leaveType = filters.leaveType;

    api
      .get('/leaves', { params })
      .then(({ data }) => setLeaves(data.leaves))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(fetchLeaves, 250); // light debounce for the search box
    return () => clearTimeout(timer);
  }, [fetchLeaves]);

  async function handleCancel(id) {
    setCancellingId(id);
    try {
      await api.delete(`/leaves/${id}`);
      setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status: 'CANCELLED' } : l)));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">
          {isManager ? 'All leave requests' : 'Your leave history'}
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {isManager ? 'Search and filter requests across the team.' : 'Track, edit, or cancel your submitted requests.'}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-panel">
        <input
          type="text"
          placeholder={isManager ? 'Search by employee or reason…' : 'Search by reason…'}
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          className="min-w-[200px] flex-1 rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={filters.leaveType}
          onChange={(e) => setFilters((f) => ({ ...f, leaveType: e.target.value }))}
          className="rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      {loading ? (
        <LoadingSpinner label="Loading leave requests…" />
      ) : leaves.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center text-sm text-ink-400">
          No leave requests match these filters.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-panel">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wider text-ink-400">
              <tr>
                {isManager && <th className="px-5 py-3 font-medium">Employee</th>}
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Dates</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {leaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-ink-50/40">
                  {isManager && <td className="px-5 py-3 font-medium text-ink-800">{leave.employee_name}</td>}
                  <td className="px-5 py-3 text-ink-600">{leave.leave_type}</td>
                  <td className="px-5 py-3 text-ink-600">
                    {leave.start_date} → {leave.end_date}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={leave.status} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-3">
                      <Link to={`/leaves/${leave.id}`} className="font-medium text-brand-600 hover:underline">
                        View
                      </Link>
                      {!isManager && leave.status === 'PENDING' && (
                        <>
                          <Link to={`/apply/${leave.id}`} className="font-medium text-ink-500 hover:underline">
                            Edit
                          </Link>
                          <button
                            onClick={() => handleCancel(leave.id)}
                            disabled={cancellingId === leave.id}
                            className="font-medium text-rose-600 hover:underline disabled:opacity-50"
                          >
                            {cancellingId === leave.id ? 'Cancelling…' : 'Cancel'}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
