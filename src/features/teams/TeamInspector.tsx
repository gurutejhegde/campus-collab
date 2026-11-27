import React from 'react';
import { Calendar, Edit3, Globe, Lock, LogOut, Plus, Sparkles, Trash2, UserMinus } from 'lucide-react';
import { getTeamSeatStats } from '../../core/engine/teamSeats';
import { Team } from '../../core/types/domain';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Pill } from '../../ui/Pill';

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
    isFull,
    fillPct,
    availableOpenRoles,
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

        {/* Interactive Squad Roster (Filled + Open Seat Tickets) */}
        <div className="space-y-2.5 pt-3 border-t border-border">
          <div className="text-[11px] font-semibold text-text-dim uppercase tracking-wider">
            Squad Seats ({memberCount}/{maxMembers} filled
            {isFull
              ? ' · Squad Full'
              : availableOpenRoles.length > 0
              ? ` · ${availableOpenRoles.length} open role${availableOpenRoles.length === 1 ? '' : 's'}`
              : ''}
            )
          </div>

          <div className="space-y-2">
            {/* Filled Member Seats */}
            {members.map((m) => {
              const memberName = m.profile?.name || 'Student';
              const isLead = m.user_id === team.creator_id;
              const initials = memberName
                .split(' ')
                .map((p) => p[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-2.5 p-2.5 rounded-control bg-well border border-border"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-surface-elevated border border-border-strong grid place-items-center text-[10px] font-semibold shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-text truncate">
                        {memberName}
                        {m.user_id === currentUserId && (
                          <span className="text-text-dim font-normal ml-1">(you)</span>
                        )}
                      </div>
                      <div className="text-[11px] text-text-muted truncate">
                        {m.role}
                        {m.profile?.college ? ` · ${m.profile.college}` : ''}
                      </div>
                    </div>
                  </div>

                  {isCreator && !isLead && (
                    <button
                      type="button"
                      onClick={() => onRemoveMember(team.id, m.user_id, memberName)}
                      title="Remove member"
                      className="p-1 text-text-dim hover:text-danger transition-colors"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Open Role Tickets (only shown while open seats remain) */}
            {!isFull &&
              availableOpenRoles.map((role) => (
              <div
                key={role}
                className="flex items-center justify-between gap-2.5 p-2.5 rounded-control bg-well/50 border border-dashed border-accent-border"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-md bg-accent-soft border border-dashed border-accent-border grid place-items-center text-accent-text shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-accent-text truncate">
                      Open Seat: {role}
                    </div>
                    <div className="text-[11px] text-text-dim">Recruiting contributor</div>
                  </div>
                </div>

                {!isMember && team.visibility === 'open' && !isFull && !hasPendingJoinRequest && (
                  <button
                    type="button"
                    onClick={() => onRequestJoin(team, role)}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-control bg-accent text-white hover:bg-accent-hover transition-colors shrink-0"
                  >
                    Apply
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="pt-3 border-t border-border flex items-center gap-2 flex-wrap">
          {isCreator ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                icon={<Edit3 className="w-3.5 h-3.5" />}
                onClick={() => onEdit(team)}
              >
                Edit Team
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={() => onRequestDelete(team)}
              >
                Delete
              </Button>
            </>
          ) : isMember ? (
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              icon={<LogOut className="w-3.5 h-3.5" />}
              onClick={() => onLeave(team.id)}
            >
              Leave Team
            </Button>
          ) : team.visibility === 'open' ? (
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              disabled={hasPendingJoinRequest || isFull}
              onClick={() => onRequestJoin(team)}
            >
              {isFull
                ? 'Team Full'
                : hasPendingJoinRequest
                ? 'Join Request Pending'
                : 'Request to Join'}
            </Button>
          ) : (
            <div className="w-full text-center text-xs text-text-dim py-1">
              Invite-only team — contact team lead for an invite.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
