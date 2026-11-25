import React from 'react';
import { Lock, Globe, Sparkles } from 'lucide-react';
import { Team } from '../../shared/types';
import { PillTag } from '../common/PillTag';
import { Button } from '../common/Button';

interface TeamCardProps {
  team: Team;
  currentUserId?: string;
  isMember?: boolean;
  isLead?: boolean;
  hasPendingJoinRequest?: boolean;
  onRequestJoin?: (team: Team) => void;
  onViewDetails?: (team: Team) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  isMember = false,
  isLead = false,
  hasPendingJoinRequest = false,
  onRequestJoin,
  onViewDetails,
}) => {
  const memberCount = team.members_count || (team.members ? team.members.length : 1);
  const isOpen = team.visibility === 'open';

  return (
    <div className="bg-surface rounded-card p-5 flex flex-col justify-between hover:bg-surface-subtle/50 transition-all duration-smooth space-y-4">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-card bg-accent/10 text-accent font-semibold text-lg flex items-center justify-center shrink-0 overflow-hidden">
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
              <h3
                className="font-serif font-medium text-lg text-text hover:text-accent cursor-pointer transition-colors"
                onClick={() => onViewDetails?.(team)}
              >
                {team.name}
              </h3>
              {isLead && (
                <span className="text-xs font-medium text-accent">
                  (lead)
                </span>
              )}
              {isMember && !isLead && (
                <span className="text-xs text-text-muted">
                  (member)
                </span>
              )}
            </div>

            <p className="text-sm text-text-muted flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-3 h-3 text-accent" />
              <span>{team.project_domain}</span>
            </p>
          </div>
        </div>

        {/* Visibility */}
        <div className="text-xs text-text-muted shrink-0 flex items-center gap-1">
          {isOpen ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
          <span>{isOpen ? 'Open' : 'Invite-only'}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-text-muted leading-relaxed line-clamp-2">
        {team.description}
      </p>

      {/* Required Skills */}
      {team.required_skills && team.required_skills.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-text-muted">
            Tech Stack
          </div>
          <div className="flex flex-wrap gap-2">
            {team.required_skills.slice(0, 4).map((skill) => (
              <PillTag
                key={skill}
                label={skill}
                className="text-xs py-0.5 px-2"
              />
            ))}
            {team.required_skills.length > 4 && (
              <span className="text-xs text-text-muted">
                +{team.required_skills.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Open Positions */}
      {team.open_roles && team.open_roles.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-accent">
            Looking For
          </div>
          <div className="flex flex-wrap gap-2">
            {team.open_roles.map((role) => (
              <span
                key={role}
                className="text-xs text-accent"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer: Members & Actions */}
      <div className="flex items-center justify-between pt-3">
        <div className="text-sm text-text-muted">
          {memberCount} {memberCount === 1 ? 'member' : 'members'}
        </div>

        <div className="flex items-center gap-2">
          {onViewDetails && (
            <Button
              type="button"
              variant="subtle"
              size="sm"
              onClick={() => onViewDetails(team)}
            >
              View Team
            </Button>
          )}

          {!isMember && isOpen && onRequestJoin && (
            <Button
              type="button"
              variant={hasPendingJoinRequest ? 'secondary' : 'primary'}
              size="sm"
              disabled={hasPendingJoinRequest}
              onClick={() => onRequestJoin(team)}
            >
              {hasPendingJoinRequest ? 'Pending' : 'Join'}
            </Button>
          )}

          {!isMember && !isOpen && (
            <span className="text-xs text-text-muted">Invite-only</span>
          )}
        </div>
      </div>
    </div>
  );
};
