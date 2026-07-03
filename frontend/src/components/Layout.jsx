import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const employeeLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/apply', label: 'Apply for Leave' },
  { to: '/history', label: 'Leave History' },
  { to: '/profile', label: 'Profile' },
];

const managerLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/approvals', label: 'Pending Approvals' },
  { to: '/history', label: 'All Leave Requests' },
  { to: '/profile', label: 'Profile' },
];

export default function Layout() {
  const { user, isManager, logout } = useAuth();
  const navigate = useNavigate();
  const links = isManager ? managerLinks : employeeLinks;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 font-display text-lg font-semibold text-white">
              L
            </span>
            <div>
              <p className="font-display text-lg font-semibold leading-tight text-ink-900">Leave Desk</p>
              <p className="text-[11px] uppercase tracking-wider text-ink-400">
                {isManager ? 'Manager workspace' : 'Employee workspace'}
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-ink-800">{user?.name}</p>
              <p className="text-xs text-ink-400">{user?.department}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-600 transition hover:border-ink-300 hover:bg-ink-50"
            >
              Log out
            </button>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-ink-100 px-4 py-2 md:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-500'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
