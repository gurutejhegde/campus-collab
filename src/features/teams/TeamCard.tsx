import React from 'react';
import { Calendar, Globe, Lock, Plus, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { getTeamSeatStats } from '../../core/engine/teamSeats';
import { Team } from '../../core/types/domain';
import { Button } from '../../ui/Button';
import { Pill } from '../../ui/Pill';

interface TeamCardProps {
  team: Team;
  currentUserId: string;
  selected?: boolean;
  hasPendingJoinRequest?: boolean;
  onSelect?: (team: Team) => void;
  onQuickJoin?: (team: Team) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  currentUserId,
  selected = false,
  hasPendingJoinRequest = false,
  onSelect,
  onQuickJoin,
}) => {
  const members = team.members || [];
  const { memberCount, maxMembers, openSeats, isFull, fillPct, availableOpenRoles } =
    getTeamSeatStats(team);

  const isCreator = team.creator_id === currentUserId;
  const isMember = isCreator || members.some((m) => m.user_id === currentUserId);

  const monogram = team.name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      onClick={() => onSelect?.(team)}
      className={clsx(
        'relative rounded-card bg-surface border shadow-tactile transition-all duration-fast overflow-hidden',
        onSelect && 'cursor-pointer',
        selected
          ? 'border-accent-border bg-[#1a1719]'
          : 'border-border hover:border-border-strong hover:bg-[#19191d]'
      )}
    >
      {/* Top 2px capacity progress bar */}
      <div className="h-[2px] w-full bg-well">
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${fillPct}%` }}
        />
      </div>

      <div className="p-4 space-y-3.5">
        {/* Top Row: Monogram + Title + Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={clsx(
                'w-10 h-10 rounded-[10px] grid place-items-center text-xs font-bold tracking-wide shrink-0 border',
                isCreator || selected
                  ? 'bg-accent-soft border-accent-border text-accent-text'
                  : 'bg-surface-elevated border-border-strong text-text'
              )}
            >
              {monogram || 'TM'}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-[15px] text-text truncate">{team.name}</h3>
                {isCreator && <Pill variant="burgundy">Lead</Pill>}
                {isMember && !isCreator && <Pill variant="ok">Joined</Pill>}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-text-muted mt-0.5 flex-wrap">
                <span className="text-text/90 font-medium">{team.project_domain}</span>
                <span className="text-text-dim">·</span>
                {team.event ? (
                  <span className="inline-flex items-center gap-1 text-accent-text">
                    <Calendar className="w-3 h-3" />
                    {team.event.title}
                  </span>
                ) : (
                  <span className="text-text-dim">Standalone Idea</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {team.learner_friendly && (
              <span
                title="Open to committed learners"
                className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-accent-soft text-accent-text border border-accent-border"
              >
                <Sparkles className="w-2.5 h-2.5" /> Learner Friendly
              </span>
            )}
            <span
              title={team.visibility === 'open' ? 'Open to join requests' : 'Invite only'}
              className="p-1 rounded-md bg-well border border-border text-text-dim"
            >
              {team.visibility === 'open' ? (
                <Globe className="w-3 h-3 text-ok" />
              ) : (
                <Lock className="w-3 h-3" />
              )}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">{team.description}</p>

        {/* Visual Squad Seat Map */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {members.map((m) => {
              const initials = (m.profile?.name || 'M')
                .split(' ')
                .map((p) => p[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();
              return (
                <div
                  key={m.id}
                  title={`${m.profile?.name || 'Member'} · ${m.role}`}
                  className="w-6 h-6 rounded-md bg-surface-elevated border border-border-strong grid place-items-center text-[10px] font-semibold text-text"
                >
                  {initials}
                </div>
              );
            })}
            {Array.from({ length: Math.min(openSeats, 6) }).map((_, idx) => (
              <div
                key={`open-${idx}`}
                title="Open seat available"
                className="w-6 h-6 rounded-md bg-well border border-dashed border-accent-border grid place-items-center text-accent-text"
              >
                <Plus className="w-3 h-3" />
              </div>
            ))}
            <span className="text-[11px] font-mono text-text-dim ml-1">
              {memberCount}/{maxMembers} filled
            </span>
          </div>

          {onQuickJoin && !isMember && team.visibility === 'open' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isFull || hasPendingJoinRequest}
              onClick={(e) => {
                e.stopPropagation();
                onQuickJoin(team);
              }}
            >
              {isFull ? 'Full' : hasPendingJoinRequest ? 'Requested' : 'Join'}
            </Button>
          )}
        </div>

        {/* Open Role Tickets & Stack */}
        {(availableOpenRoles.length > 0 || team.required_skills.length > 0 || isFull) && (
          <div className="flex flex-wrap gap-1.5 pt-2.5 border-t border-border">
            {isFull ? (
              <Pill variant="ok">Squad Full</Pill>
            ) : (
              availableOpenRoles.slice(0, 3).map((r) => (
                <span
                  key={r}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-accent-soft text-accent-text border border-dashed border-accent-border"
                >
                  <Plus className="w-2.5 h-2.5" />
                  {r}
                </span>
              ))
            )}
            {team.required_skills.slice(0, 4).map((s) => (
              <Pill key={s}>{s}</Pill>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
