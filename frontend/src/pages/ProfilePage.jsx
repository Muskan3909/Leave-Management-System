import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  const fields = [
    { label: 'Full name', value: user?.name },
    { label: 'Email', value: user?.email },
    { label: 'Department', value: user?.department },
    { label: 'Role', value: user?.role },
    { label: 'Member since', value: user?.created_at },
  ];

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-2xl font-semibold text-ink-900">Your profile</h1>
      <p className="mt-1 text-sm text-ink-500">Account details on file for your organization.</p>

      <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-panel">
        <div className="mb-5 flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-100 font-display text-xl font-semibold text-brand-700">
            {user?.name?.charAt(0)}
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-ink-900">{user?.name}</p>
            <p className="text-sm text-ink-500">{user?.email}</p>
          </div>
        </div>
        <dl className="divide-y divide-ink-100">
          {fields.map((f) => (
            <div key={f.label} className="flex items-center justify-between py-3 text-sm">
              <dt className="text-ink-400">{f.label}</dt>
              <dd className="font-medium text-ink-800">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
