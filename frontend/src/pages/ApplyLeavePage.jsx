import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { extractErrorMessage } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const LEAVE_TYPES = ['SICK', 'CASUAL', 'ANNUAL', 'UNPAID', 'OTHER'];

export default function ApplyLeavePage() {
  const { id } = useParams(); // present when editing an existing pending request
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({ leaveType: 'CASUAL', startDate: '', endDate: '', reason: '' });
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/leaves/${id}`)
      .then(({ data }) => {
        const l = data.leave;
        setForm({ leaveType: l.leave_type, startDate: l.start_date, endDate: l.end_date, reason: l.reason });
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/leaves/${id}`, form);
      } else {
        await api.post('/leaves', form);
      }
      navigate('/history');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading request…" />;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-2xl font-semibold text-ink-900">
        {isEdit ? 'Edit leave request' : 'Apply for leave'}
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        {isEdit ? 'You can update the details while this request is still pending.' : 'Fill in the details below — your manager will be notified for review.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl border border-ink-100 bg-white p-6 shadow-panel">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">Leave type</label>
          <select
            value={form.leaveType}
            onChange={(e) => update('leaveType', e.target.value)}
            className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            {LEAVE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Start date</label>
            <input
              type="date"
              required
              value={form.startDate}
              onChange={(e) => update('startDate', e.target.value)}
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">End date</label>
            <input
              type="date"
              required
              value={form.endDate}
              onChange={(e) => update('endDate', e.target.value)}
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">Reason</label>
          <textarea
            required
            minLength={3}
            maxLength={500}
            rows={4}
            value={form.reason}
            onChange={(e) => update('reason', e.target.value)}
            placeholder="Briefly explain the reason for your leave…"
            className="w-full resize-none rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Submit request'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-ink-200 px-5 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
