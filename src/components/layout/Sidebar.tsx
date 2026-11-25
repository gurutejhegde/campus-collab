import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sparkles,
  Compass,
  Users,
  Calendar,
  Inbox,
  User,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { useDataStore } from '../../context/DataStoreContext';

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onMobileClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { profile, role } = useAuth();
  const { dataStore } = useDataStore();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    async function checkPending() {
      if (!profile) return;
      try {
        const reqs = await dataStore.getRequestsForUser(profile.id);
        const count =
          reqs.incomingInvites.filter((r) => r.status === 'pending').length +
          reqs.incomingJoinRequests.filter((r) => r.status === 'pending').length;
        setPendingCount(count);
      } catch (err) {
        console.error('Failed to load pending count in sidebar:', err);
      }
    }
    checkPending();
  }, [profile?.id, dataStore]);

  const navItems = [
    { to: '/', label: 'Project Showcase', icon: Sparkles, exact: true },
    { to: '/explore', label: 'Explore Students', icon: Compass },
    { to: '/teams', label: 'Teams & Workspace', icon: Users },
    { to: '/events', label: 'Events Hub', icon: Calendar },
    {
      to: '/requests',
      label: 'Requests & Invites',
      icon: Inbox,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={clsx(
          'fixed md:static inset-y-0 left-0 z-50 flex flex-col bg-surface border-r border-border transition-all duration-smooth',
          collapsed ? 'w-16' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center shrink-0 shadow-glow">
                <Layers className="w-4 h-4 text-accent" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm tracking-tight text-text leading-tight flex items-center gap-1.5">
                  CampusCollab
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-subtle text-accent border border-border">
                    v2
                  </span>
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-text-muted">
                  Student Tech Platform
                </span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center shadow-glow">
              <Layers className="w-4 h-4 text-accent" />
            </div>
          )}

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-subtle transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={onMobileClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group select-none relative',
                  isActive
                    ? 'bg-accent/15 text-accent border border-accent/30 font-semibold shadow-glow'
                    : 'text-text-muted hover:text-text hover:bg-surface-subtle border border-transparent'
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
              {!collapsed && (
                <span className="truncate flex-1 tracking-tight">{item.label}</span>
              )}
              {item.badge !== undefined && !collapsed && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-accent text-white shadow-glow">
                  {item.badge}
                </span>
              )}
              {item.badge !== undefined && collapsed && (
                <span className="w-2 h-2 rounded-full bg-accent absolute top-2 right-2 shadow-glow" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* Active Role Indicator */}
        {!collapsed && (
          <div className="p-3 mx-3 mb-3 rounded-lg bg-surface-subtle/80 border border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-accent" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono tracking-wider text-text-muted">
                  Active Role
                </span>
                <span className="text-xs font-semibold capitalize text-text">{role}</span>
              </div>
            </div>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase ${
                role === 'admin'
                  ? 'bg-danger/15 text-danger border border-danger/30'
                  : role === 'leader'
                  ? 'bg-accent/15 text-accent border border-accent/30'
                  : 'bg-surface text-text-muted border border-border'
              }`}
            >
              {role}
            </span>
          </div>
        )}
      </aside>
    </>
  );
};
