import React, { useState } from 'react';
import { Menu, Moon, Sun, UserCheck, ChevronDown, Check, Shield } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../shared/types';

interface TopbarProps {
  onMobileMenuOpen: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMobileMenuOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const { profile, allProfiles, switchPersona, role, setRole } = useAuth();
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const roles: Array<{ id: UserRole; label: string; desc: string }> = [
    { id: 'student', label: 'Student', desc: 'Browse builds, join teams & RSVP to events' },
    { id: 'leader', label: 'Club / Team Lead', desc: 'Create & publish campus events, manage teams' },
    { id: 'admin', label: 'Campus Admin', desc: 'Full authority to host events & curate community' },
  ];

  return (
    <header className="h-16 bg-surface border-b border-border px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuOpen}
          className="md:hidden p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-subtle"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Compact Student Persona Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsPersonaMenuOpen(!isPersonaMenuOpen);
              setIsRoleMenuOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-elevated text-xs font-mono text-text border border-border transition-colors select-none"
            title="Switch student persona to test collaboration"
          >
            <UserCheck className="w-3.5 h-3.5 text-accent" />
            <span className="text-text-muted hidden sm:inline font-sans">Persona:</span>
            <span className="font-semibold text-text max-w-[120px] truncate">
              {profile?.name.split(' ')[0] || 'Student'}
            </span>
            <ChevronDown className="w-3 h-3 text-text-muted" />
          </button>

          {isPersonaMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsPersonaMenuOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-72 bg-surface border border-border rounded-lg shadow-popover p-2 z-50 animate-slideUp">
                <div className="px-2.5 py-1.5 border-b border-border text-[11px] font-mono uppercase tracking-wider text-text-muted">
                  Switch Active Persona
                </div>
                <div className="max-h-64 overflow-y-auto py-1 space-y-0.5">
                  {allProfiles.map((p) => {
                    const isSelected = p.id === profile?.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          switchPersona(p.id);
                          setIsPersonaMenuOpen(false);
                        }}
                        className={`w-full px-2.5 py-2 rounded-lg text-left text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-accent/15 text-accent font-medium'
                            : 'hover:bg-surface-subtle text-text'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={
                              p.avatar_url ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                            }
                            alt={p.name}
                            className="w-6 h-6 rounded-full object-cover border border-border"
                          />
                          <div className="min-w-0">
                            <span className="truncate block font-medium">{p.name}</span>
                            <span className="text-[10px] text-text-muted block truncate">
                              Yr {p.year} • {p.department.split('&')[0]}
                            </span>
                          </div>
                        </div>

                        {isSelected && <Check className="w-3.5 h-3.5 text-accent shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Role Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsRoleMenuOpen(!isRoleMenuOpen);
              setIsPersonaMenuOpen(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-elevated text-xs font-mono text-text border border-border transition-colors select-none"
            title="Switch authorization role (Student vs Leader vs Admin)"
          >
            <Shield className="w-3.5 h-3.5 text-accent" />
            <span className="text-text-muted hidden sm:inline font-sans">Role:</span>
            <span className="font-semibold text-accent capitalize">{role}</span>
            <ChevronDown className="w-3 h-3 text-text-muted" />
          </button>

          {isRoleMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsRoleMenuOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-72 bg-surface border border-border rounded-lg shadow-popover p-2 z-50 animate-slideUp">
                <div className="px-2.5 py-1.5 border-b border-border text-[11px] font-mono uppercase tracking-wider text-text-muted">
                  Role Authorization Gate
                </div>
                <div className="py-1 space-y-1">
                  {roles.map((r) => {
                    const isSelected = r.id === role;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setRole(r.id);
                          setIsRoleMenuOpen(false);
                        }}
                        className={`w-full px-2.5 py-2 rounded-lg text-left text-xs transition-colors ${
                          isSelected
                            ? 'bg-accent/15 text-accent font-medium'
                            : 'hover:bg-surface-subtle text-text'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-semibold capitalize">{r.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-accent shrink-0" />}
                        </div>
                        <p className="text-[10px] text-text-muted leading-tight">{r.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-subtle transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
          aria-label="Toggle color theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Profile Link Header Avatar */}
        {profile && (
          <div className="flex items-center gap-2 pl-3 border-l border-border">
            <img
              src={
                profile.avatar_url ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
              }
              alt={profile.name}
              className="w-8 h-8 rounded-full object-cover border border-border"
            />
          </div>
        )}
      </div>
    </header>
  );
};
