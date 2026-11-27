import React from 'react';
import { Calendar, Globe, Lock, Sparkles } from 'lucide-react';
import { getTeamSeatStats } from '../../core/engine/teamSeats';
import { Team } from '../../core/types/domain';
import { Card } from '../../ui/Card';
import { Pill } from '../../ui/Pill';
import { TeamRosterSection } from './TeamRosterSection';

interface TeamInspectorProps {
  team: Team | null;
  currentUserId: string;
  hasPendingJoinRequest: boolean;
  onEdit: (team: Team) => void;
  onRequestDelete: (team: Team) => void;
  onLeave: (teamId: string) => void;
  onRemoveMember: (teamId: string, userId: string, name: string) => void;
  onRequestJoin: (team: Team, preferredRole?: string) => void;
}

export const TeamInspector: React.FC<TeamInspectorProps> = ({
  team,
  currentUserId,
  hasPendingJoinRequest,
  onEdit,
  onRequestDelete,
  onLeave,
  onRemoveMember,
  onRequestJoin,
}) => {
  if (!team) {
    return (
      <Card className="p-6 text-xs text-text-muted">
        Select a team on the left to inspect squad seats, open roles, and stack — or create a new team.
      </Card>
    );
  }

  const members = team.members || [];
  const {
    memberCount,
    maxMembers,
    openSeats: openSeatCount,
    fillPct,
  } = getTeamSeatStats(team);

  const isCreator = team.creator_id === currentUserId;
  const isMember = isCreator || members.some((m) => m.user_id === currentUserId);

  const monogram = team.name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="overflow-hidden">
      {/* Top Dossier Header Banner */}
      <div className="p-5 bg-well border-b border-border space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-11 h-11 rounded-[10px] bg-accent-soft border border-accent-border text-accent-text font-bold text-sm grid place-items-center shrink-0">
              {monogram || 'TM'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[17px] font-semibold text-text truncate">{team.name}</h2>
                {isCreator && <Pill variant="burgundy">You lead</Pill>}
                {isMember && !isCreator && <Pill variant="ok">Member</Pill>}
              </div>
              <p className="text-xs text-text-muted mt-0.5">{team.project_domain}</p>
            </div>
          </div>

          <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-surface border border-border-strong text-text shrink-0">
            {memberCount}/{maxMembers} seats
          </span>
        </div>

        {/* Seat Capacity Meter */}
        <div className="space-y-1">
          <div className="h-1.5 w-full rounded-full bg-surface border border-border overflow-hidden">
            <div className="h-full bg-accent transition-all duration-300" style={{ width: `${fillPct}%` }} />
          </div>
          <div className="flex items-center justify-between text-[11px] text-text-dim">
            <span>
              {openSeatCount > 0 ? `${openSeatCount} open seat${openSeatCount === 1 ? '' : 's'} left` : 'Squad full'}
            </span>
            <span>{fillPct}% assembled</span>
          </div>
        </div>

        {/* Scope & Attributes */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {team.event ? (
            <Pill variant="burgundy">
              <Calendar className="w-3 h-3" />
              <span>{team.event.title}</span>
            </Pill>
          ) : (
            <Pill variant="strong">Standalone Idea</Pill>
          )}
          <Pill>
            {team.visibility === 'open' ? (
              <>
                <Globe className="w-3 h-3 text-ok" /> Open
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" /> Invite-only
              </>
            )}
          </Pill>
          {team.learner_friendly && (
            <Pill variant="burgundy">
              <Sparkles className="w-3 h-3" /> Learner Friendly
            </Pill>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-[13px] text-text-muted leading-relaxed">{team.description}</p>

        {/* Tech Stack */}
        {team.required_skills && team.required_skills.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-border">
            <div className="text-[11px] font-semibold text-text-dim uppercase tracking-wider">
              Stack & Tools
            </div>
            <div className="flex flex-wrap gap-1.5">
              {team.required_skills.map((s) => (
                <Pill key={s} variant="strong">
                  {s}
                </Pill>
              ))}
            </div>
          </div>
        )}

        <TeamRosterSection
          team={team}
          currentUserId={currentUserId}
          hasPendingJoinRequest={hasPendingJoinRequest}
          onEdit={onEdit}
          onRequestDelete={onRequestDelete}
          onLeave={onLeave}
          onRemoveMember={onRemoveMember}
          onRequestJoin={onRequestJoin}
        />
      </div>
    </Card>
  );
};
