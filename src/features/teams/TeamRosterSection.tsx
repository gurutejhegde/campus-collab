import React from 'react';
import { Edit3, LogOut, Plus, Trash2, UserMinus } from 'lucide-react';
import { getTeamSeatStats } from '../../core/engine/teamSeats';
import { Team } from '../../core/types/domain';
import { Button } from '../../ui/Button';

export interface TeamRosterActionProps {
  team: Team;
  currentUserId: string;
  hasPendingJoinRequest: boolean;
  onEdit: (team: Team) => void;
  onRequestDelete: (team: Team) => void;
  onLeave: (teamId: string) => void;
  onRemoveMember: (teamId: string, userId: string, name: string) => void;
  onRequestJoin: (team: Team, preferredRole?: string) => void;
}

/** Shared interactive squad roster (filled seats + open role tickets) and action footer. */
export const TeamRosterSection: React.FC<TeamRosterActionProps> = ({
  team,
  currentUserId,
  hasPendingJoinRequest,
  onEdit,
  onRequestDelete,
  onLeave,
  onRemoveMember,
  onRequestJoin,
}) => {
  const members = team.members || [];
  const { memberCount, maxMembers, isFull, availableOpenRoles } = getTeamSeatStats(team);

  const isCreator = team.creator_id === currentUserId;
  const isMember = isCreator || members.some((m) => m.user_id === currentUserId);

  return (
    <>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveMember(team.id, m.user_id, memberName);
                    }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestJoin(team, role);
                    }}
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
              onClick={(e) => {
                e.stopPropagation();
                onEdit(team);
              }}
            >
              Edit Team
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={(e) => {
                e.stopPropagation();
                onRequestDelete(team);
              }}
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
            onClick={(e) => {
              e.stopPropagation();
              onLeave(team.id);
            }}
          >
            Leave Team
          </Button>
        ) : team.visibility === 'open' ? (
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            disabled={hasPendingJoinRequest || isFull}
            onClick={(e) => {
              e.stopPropagation();
              onRequestJoin(team);
            }}
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
    </>
  );
};
