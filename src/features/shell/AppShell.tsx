import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Calendar, Compass, Inbox, Lightbulb, User } from 'lucide-react';
import { clsx } from 'clsx';
import { useApp } from '../../context/AppContext';
import { Pill } from '../../ui/Pill';

const NAV_ITEMS = [
  { to: '/', label: 'Find', fullLabel: 'Find People & Teams', icon: Compass, exact: true },
  { to: '/events', label: 'Events', fullLabel: 'Events & Teams', icon: Calendar },
  { to: '/blueprint', label: 'Blueprint', fullLabel: 'Idea Blueprint', icon: Lightbulb },
  { to: '/requests', label: 'Requests', fullLabel: 'Requests', icon: Inbox },
];

export const AppShell: React.FC = () => {
  const { profile, dataStore } = useApp();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let active = true;
    async function loadCount() {
      if (!profile || !dataStore) return;
      try {
        const res = await dataStore.getRequestsForUser(profile.id);
        if (!active) return;
        const count =
          res.incomingInvites.filter((r) => r.status === 'pending').length +
          res.incomingJoinRequests.filter((r) => r.status === 'pending').length;
        setPendingCount(count);
      } catch {
        // Non-blocking badge fetch
      }
    }
    loadCount();
    return () => {
      active = false;
    };
  }, [profile, dataStore, location.pathname]);

  const initials = (profile?.name || 'ST')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      {/* Desktop & Mobile Top Bar */}
      <header className="sticky top-0 z-40 h-14 bg-bg/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-shell mx-auto h-full px-4 md:px-6 flex items-center justify-between gap-4">
          <NavLink to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-6 h-6 rounded-[6px] bg-accent text-white font-bold text-xs grid place-items-center">
              C
            </div>
            <span className="font-semibold text-[15px] tracking-tight">CampusCollab</span>
          </NavLink>

          {/* Desktop Top Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-well p-1 rounded-[9px] border border-border">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  clsx(
                    'px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors inline-flex items-center gap-1.5',
                    isActive
                      ? 'bg-surface-elevated text-text shadow-tactile'
                      : 'text-text-muted hover:text-text'
                  )
                }
              >
                <span>{item.fullLabel}</span>
                {item.to === '/requests' && pendingCount > 0 && (
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-accent text-white">
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Header Area */}
          <div className="flex items-center gap-2.5">
            {profile?.role === 'admin' && <Pill variant="burgundy">Admin</Pill>}
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-accent-soft border-accent-border text-text'
                    : 'bg-surface border-border hover:border-border-strong text-text-muted hover:text-text'
                )
              }
            >
              <span className="w-6 h-6 rounded-full bg-surface-elevated border border-border-strong grid place-items-center text-[10px] font-semibold text-text">
                {initials}
              </span>
              <span className="hidden sm:inline max-w-[110px] truncate">
                {profile?.name.split(' ')[0] || 'Profile'}
              </span>
            </NavLink>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-shell w-full mx-auto px-4 md:px-6 pt-7 pb-24 md:pb-12">
        <Outlet />
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-border px-2 py-1.5 flex items-center justify-around">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              clsx(
                'relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-control text-[11px] font-medium transition-colors',
                isActive ? 'text-accent-text bg-accent-soft' : 'text-text-muted'
              )
            }
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
            {item.to === '/requests' && pendingCount > 0 && (
              <span className="absolute top-0.5 right-2 w-2 h-2 rounded-full bg-accent" />
            )}
          </NavLink>
        ))}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center gap-0.5 px-3 py-1 rounded-control text-[11px] font-medium transition-colors',
              isActive ? 'text-accent-text bg-accent-soft' : 'text-text-muted'
            )
          }
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </NavLink>
      </nav>
    </div>
  );
};
