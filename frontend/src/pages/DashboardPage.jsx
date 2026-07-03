import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DashboardPage() {
  const { user, isManager } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get('/dashboard')
      .then(({ data }) => active && setData(data))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Loading your dashboard…" />;

  const counts = data?.leaveCounts || { total: 0, PENDING: 0, APPROVED: 0, REJECTED: 0 };
  const recent = data?.recentActivity || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">
          Welcome back, {user?.name?.split(' ')[0]}.
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {isManager
            ? 'Here is what needs your attention across the team.'
            : "Here's a quick look at your time-off activity."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {isManager && <StatCard label="Total Employees" value={data?.totalEmployees ?? '—'} accent="ink" />}
        <StatCard label={isManager ? 'Pending Approvals' : 'Pending Requests'} value={counts.PENDING} accent="clay" />
        <StatCard label="Approved" value={counts.APPROVED} accent="brand" />
        <StatCard label="Rejected" value={counts.REJECTED} accent="rose" />
        {!isManager && <StatCard label="Total Requests" value={counts.total} accent="ink" />}
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white shadow-panel">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-ink-900">Recent activity</h2>
          <Link to={isManager ? '/approvals' : '/history'} className="text-sm font-medium text-brand-600 hover:underline">
            {isManager ? 'View pending approvals →' : 'View full history →'}
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink-400">No leave activity yet.</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {recent.map((leave) => (
              <li key={leave.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-800">
                    {isManager ? `${leave.employee_name} — ${leave.leave_type}` : leave.leave_type}
                  </p>
                  <p className="text-xs text-ink-400">
                    {leave.start_date} → {leave.end_date}
                  </p>
                </div>
                <StatusBadge status={leave.status} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {!isManager && (
        <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 p-5">
          <p className="text-sm font-medium text-brand-800">Need time off?</p>
          <p className="mt-1 text-sm text-brand-700">Submit a new request in under a minute.</p>
          <Link
            to="/apply"
            className="mt-3 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Apply for leave
          </Link>
        </div>
      )}
    </div>
  );
}
