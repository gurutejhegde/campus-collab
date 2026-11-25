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
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-md"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={clsx(
          'fixed md:static inset-y-0 left-0 z-50 flex flex-col glass-card border-r border-white/[0.08] transition-all duration-smooth',
          collapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.08]">
          {!collapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[1px] shadow-glow shrink-0">
                <div className="w-full h-full bg-surface-elevated rounded-[11px] flex items-center justify-center">
                  <Layers className="w-4 h-4 text-purple-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-base tracking-tight text-white leading-tight flex items-center gap-1.5">
                  CampusCollab
                </span>
                <span className="text-[10px] font-mono tracking-wider text-text-muted">
                  Student Tech Platform
                </span>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 mx-auto rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[1px] shadow-glow">
              <div className="w-full h-full bg-surface-elevated rounded-[11px] flex items-center justify-center">
                <Layers className="w-4 h-4 text-purple-300" />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/[0.06] transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={onMobileClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group select-none relative',
                  isActive
                    ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/10 text-white border border-purple-500/30 shadow-glow font-semibold'
                    : 'text-text-muted hover:text-white hover:bg-white/[0.04] border border-transparent'
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              {!collapsed && (
                <span className="truncate flex-1 tracking-tight">{item.label}</span>
              )}
              {item.badge !== undefined && !collapsed && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-glow">
                  {item.badge}
                </span>
              )}
              {item.badge !== undefined && collapsed && (
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 absolute top-2 right-2 shadow-glow" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* Active Role Indicator */}
        {!collapsed && (
          <div className="p-3 mx-3 mb-3 rounded-xl glass-pill flex items-center justify-between border border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-purple-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-mono tracking-wider text-text-muted">
                  Active Role
                </span>
                <span className="text-xs font-semibold capitalize text-white">{role}</span>
              </div>
            </div>
            <span
              className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase border ${
                role === 'admin'
                  ? 'bg-pink-500/15 text-pink-300 border-pink-500/30 shadow-glow-pink'
                  : role === 'leader'
                  ? 'bg-purple-500/15 text-purple-300 border-purple-500/30 shadow-glow'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-glow-emerald'
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
