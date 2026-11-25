import React from 'react';
import {
  Users,
  Lock,
  Globe,
  Sparkles,
  UserPlus,
  LogOut,
} from 'lucide-react';
import { Profile, Team } from '../../shared/types';
import { Modal } from '../common/Modal';
import { PillTag } from '../common/PillTag';
import { Button } from '../common/Button';

interface TeamDetailModalProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  isMember?: boolean;
  isLead?: boolean;
  hasPendingJoinRequest?: boolean;
  onRequestJoin?: (team: Team) => void;
  onInviteMember?: (team: Team) => void;
  onLeaveTeam?: (teamId: string) => void;
  onViewMemberProfile?: (profile: Profile) => void;
}

export const TeamDetailModal: React.FC<TeamDetailModalProps> = ({
  team,
  isOpen,
  onClose,
  currentUserId,
  isMember = false,
  isLead = false,
  hasPendingJoinRequest = false,
  onRequestJoin,
  onInviteMember,
  onLeaveTeam,
  onViewMemberProfile,
}) => {
  if (!team) return null;

  const members = team.members || [];
  const isOpenVisibility = team.visibility === 'open';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={team.name}
      subtitle={`Project Team • ${team.project_domain}`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-card bg-surface-subtle border border-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-card bg-accent/10 border border-accent/25 text-accent font-semibold text-xl flex items-center justify-center shrink-0 overflow-hidden">
              {team.logo_url ? (
                <img
                  src={team.logo_url}
                  alt={team.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                team.name.slice(0, 2).toUpperCase()
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-serif text-xl font-medium text-text">{team.name}</h4>
                <span
                  className={`px-2.5 py-0.5 rounded-pill text-[10px] font-sans font-medium flex items-center gap-1 border ${
                    isOpenVisibility
                      ? 'bg-success/10 text-success border-success/30'
                      : 'bg-surface text-text-muted border-border'
                  }`}
                >
                  {isOpenVisibility ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  <span>{isOpenVisibility ? 'Open Team' : 'Invite-only'}</span>
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Domain: {team.project_domain}</span>
              </p>
            </div>
          </div>

          {/* Action Button Area */}
          <div className="flex items-center gap-2 shrink-0">
            {isLead && onInviteMember && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                icon={<UserPlus className="w-3.5 h-3.5" />}
                onClick={() => {
                  onClose();
                  onInviteMember(team);
                }}
              >
                Invite Student
              </Button>
            )}

            {!isMember && isOpenVisibility && onRequestJoin && (
              <Button
                type="button"
                variant={hasPendingJoinRequest ? 'secondary' : 'primary'}
                size="sm"
                disabled={hasPendingJoinRequest}
                onClick={() => {
                  onClose();
                  onRequestJoin(team);
                }}
              >
                {hasPendingJoinRequest ? 'Request Pending' : 'Request to Join'}
              </Button>
            )}

            {isMember && !isLead && onLeaveTeam && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                icon={<LogOut className="w-3.5 h-3.5" />}
                onClick={() => {
                  onClose();
                  onLeaveTeam(team.id);
                }}
              >
                Leave Team
              </Button>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Project Overview & Goals
          </h5>
          <p className="text-sm text-text leading-relaxed font-sans">{team.description}</p>
        </div>

        {/* Required Skills & Open Positions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 p-3.5 rounded-card bg-surface border border-border">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Required Technical Skills
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {team.required_skills && team.required_skills.length > 0 ? (
                team.required_skills.map((skill) => (
                  <PillTag key={skill} label={skill} />
                ))
              ) : (
                <span className="text-xs text-text-muted italic">No specific skills listed.</span>
              )}
            </div>
          </div>

          <div className="space-y-2 p-3.5 rounded-card bg-surface border border-border">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-accent">
              Open Positions / Roles Looking For
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {team.open_roles && team.open_roles.length > 0 ? (
                team.open_roles.map((role) => (
                  <span
                    key={role}
                    className="px-2.5 py-1 rounded-pill text-xs font-medium bg-accent/10 text-accent border border-accent/20"
                  >
                    {role}
                  </span>
                ))
              ) : (
                <span className="text-xs text-text-muted italic">All positions currently filled.</span>
              )}
            </div>
          </div>
        </div>

        {/* Team Members Roster */}
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-accent" />
              <span>Team Roster ({members.length} members)</span>
            </h5>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {members.map((member) => {
              const prof = member.profile;
              const isMemberLead = member.user_id === team.creator_id;
              const isCurrentUser = member.user_id === currentUserId;

              return (
                <div
                  key={member.id}
                  className="p-3 rounded-card bg-surface-subtle/70 border border-border flex items-center justify-between gap-3 hover:border-text-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-accent/15 border border-accent/30 text-accent font-semibold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                      {prof?.avatar_url ? (
                        <img
                          src={prof.avatar_url}
                          alt={prof.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (prof?.name || 'User').slice(0, 2).toUpperCase()
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-sans font-medium text-xs text-text truncate">
                          {prof?.name || 'Team Member'}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[10px] text-accent font-medium">(You)</span>
                        )}
                        {isMemberLead && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-accent/15 text-accent border border-accent/25 uppercase font-semibold">
                            Lead
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-muted truncate">
                        {member.role || 'Member'}
                      </p>
                    </div>
                  </div>

                  {prof && onViewMemberProfile && (
                    <Button
                      type="button"
                      variant="subtle"
                      size="sm"
                      className="text-xs py-1 px-2.5 shrink-0"
                      onClick={() => {
                        onClose();
                        onViewMemberProfile(prof);
                      }}
                    >
                      Profile
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
