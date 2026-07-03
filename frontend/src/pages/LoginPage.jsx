import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../services/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function fillDemo(role) {
    if (role === 'manager') {
      setEmail('manager@company.com');
      setPassword('Password123!');
    } else {
      setEmail('alice@company.com');
      setPassword('Password123!');
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-ink-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl bg-brand-600 font-display text-xl font-semibold text-white">
            L
          </span>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Leave Desk</h1>
          <p className="mt-1 text-sm text-ink-500">Sign in to manage time off.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-panel">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-4 rounded-2xl border border-dashed border-ink-200 bg-white/60 p-4 text-center text-xs text-ink-400">
          <p className="mb-2 font-medium text-ink-500">Demo credentials</p>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => fillDemo('employee')}
              className="rounded-md border border-ink-200 px-2.5 py-1 hover:bg-ink-50"
            >
              Use employee login
            </button>
            <button
              type="button"
              onClick={() => fillDemo('manager')}
              className="rounded-md border border-ink-200 px-2.5 py-1 hover:bg-ink-50"
            >
              Use manager login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
