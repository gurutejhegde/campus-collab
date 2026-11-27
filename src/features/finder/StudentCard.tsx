import React from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Github, UserPlus } from 'lucide-react';
import { clsx } from 'clsx';
import { Profile } from '../../core/types/domain';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Pill } from '../../ui/Pill';

interface StudentCardProps {
  student: Profile;
  selected?: boolean;
  mobileExpanded?: boolean;
  onSelect: (student: Profile) => void;
  onInvite: (student: Profile) => void;
}

/** Student discovery card that extends in-place on mobile instead of rendering a duplicate panel. */
export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  selected = false,
  mobileExpanded = false,
  onSelect,
  onInvite,
}) => {
  const initials = student.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card
      interactive
      selected={selected}
      onClick={() => onSelect(student)}
      className="p-4 space-y-3"
    >
      {/* Header: Avatar + Identity + Learner / Availability / Mobile Chevron */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-[9px] bg-surface-elevated border border-border-strong grid place-items-center text-xs font-semibold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-[14.5px] text-text truncate">{student.name}</div>
            <div className="text-xs text-text-muted truncate">
              {student.college} · Yr {student.year} · {student.department}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {mobileExpanded && (
            <Pill variant="strong" className="lg:hidden font-mono">
              {student.weekly_availability}h/wk
            </Pill>
          )}
          {student.open_to_learning && (
            <Pill variant="burgundy" className="shrink-0">
              Learner
            </Pill>
          )}
          <span className="lg:hidden p-1 text-text-dim" aria-hidden="true">
            {mobileExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </span>
        </div>
      </div>

      {/* Bio (clamped when collapsed; expands cleanly on mobile) */}
      {(student.bio || mobileExpanded) && (
        <p
          className={clsx(
            'text-xs text-text-muted leading-relaxed',
            mobileExpanded ? 'lg:line-clamp-2' : 'line-clamp-2',
            mobileExpanded && !student.bio && 'lg:hidden'
          )}
        >
          {student.bio || 'No bio shared yet.'}
        </p>
      )}

      {/* Compact preview pills (always on desktop; hidden on mobile once expanded in-place) */}
      <div className={clsx('flex flex-wrap gap-1.5', mobileExpanded && 'hidden lg:flex')}>
        {student.skills.slice(0, 4).map((s) => (
          <Pill key={s.name} variant="strong">
            {s.name}
          </Pill>
        ))}
        {student.learning_goals.slice(0, 2).map((l) => (
          <Pill key={l}>Learning: {l}</Pill>
        ))}
      </div>

      {/* Extended in-place mobile details */}
      {mobileExpanded && (
        <div
          className="lg:hidden space-y-3.5"
          onClick={(e) => e.stopPropagation()}
        >
          {student.skills.length > 0 && (
            <div className="pt-3 border-t border-border space-y-2">
              <div className="text-[11px] font-semibold text-text-dim uppercase tracking-wider">
                Skills
              </div>
              <div className="flex flex-wrap gap-1.5">
                {student.skills.map((s) => (
                  <Pill key={s.name} variant="strong">
                    {s.name} <span className="font-mono text-[10px] text-text-dim">L{s.level}</span>
                  </Pill>
                ))}
              </div>
            </div>
          )}

          {student.learning_goals.length > 0 && (
            <div className="pt-3 border-t border-border space-y-2">
              <div className="text-[11px] font-semibold text-text-dim uppercase tracking-wider">
                Currently Learning
              </div>
              <div className="flex flex-wrap gap-1.5">
                {student.learning_goals.map((g) => (
                  <Pill key={g} variant="burgundy">
                    {g}
                  </Pill>
                ))}
              </div>
            </div>
          )}

          {(student.github_username || student.portfolio_url) && (
            <div className="pt-3 border-t border-border flex flex-wrap gap-3 text-xs text-text-muted">
              {student.github_username && (
                <a
                  href={`https://github.com/${student.github_username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-text font-mono"
                >
                  <Github className="w-3.5 h-3.5" /> @{student.github_username}
                </a>
              )}
              {student.portfolio_url && (
                <a
                  href={student.portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-text"
                >
                  Portfolio <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          <div className="pt-3 border-t border-border">
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              icon={<UserPlus className="w-3.5 h-3.5" />}
              onClick={() => onInvite(student)}
            >
              Invite to Team
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
