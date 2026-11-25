import React from 'react';
import { Lock, Globe, Sparkles, Users, UserPlus } from 'lucide-react';
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
    <div className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/40 transition-all duration-300 space-y-4 group">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 font-bold text-lg flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
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

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className="font-display font-bold text-lg text-white hover:text-purple-300 cursor-pointer transition-colors truncate"
                onClick={() => onViewDetails?.(team)}
              >
                {team.name}
              </h3>
              {isLead && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                  Lead
                </span>
              )}
              {isMember && !isLead && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/15 shrink-0">
                  Member
                </span>
              )}
            </div>

            <p className="text-xs text-text-muted flex items-center gap-1.5 mt-0.5 font-sans truncate">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>{team.project_domain}</span>
            </p>
          </div>
        </div>

        {/* Visibility */}
        <div className="text-[11px] font-mono text-text-muted shrink-0 flex items-center gap-1 glass-pill px-2.5 py-0.5 rounded-full border border-white/[0.08]">
          {isOpen ? <Globe className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3" />}
          <span>{isOpen ? 'Open' : 'Invite-only'}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-text-muted leading-relaxed line-clamp-2 font-sans">
        {team.description}
      </p>

      {/* Required Skills */}
      {team.required_skills && team.required_skills.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
            Tech Stack
          </div>
          <div className="flex flex-wrap gap-1.5">
            {team.required_skills.slice(0, 4).map((skill) => (
              <PillTag
                key={skill}
                label={skill}
                variant="default"
              />
            ))}
            {team.required_skills.length > 4 && (
              <span className="text-[10px] font-mono text-text-muted px-2 py-0.5 rounded glass-pill">
                +{team.required_skills.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Open Roles Looking For */}
      {team.open_roles && team.open_roles.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Open Roles Needed</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {team.open_roles.map((role) => (
              <span
                key={role}
                className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer & Actions */}
      <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
        <span className="text-xs font-mono text-text-muted flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-purple-400" />
          <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
        </span>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onViewDetails?.(team)}
          >
            Details
          </Button>

          {!isMember && isOpen && onRequestJoin && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={hasPendingJoinRequest}
              icon={<UserPlus className="w-3 h-3" />}
              onClick={() => onRequestJoin(team)}
            >
              {hasPendingJoinRequest ? 'Requested' : 'Join'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
