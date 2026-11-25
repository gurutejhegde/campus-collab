import React from 'react';
import {
  Github,
  Linkedin,
  Globe,
  ExternalLink,
  GraduationCap,
  Sparkles,
  BookOpen,
  UserPlus,
} from 'lucide-react';
import { Profile } from '../../shared/types';
import { PillTag } from '../common/PillTag';
import { Button } from '../common/Button';

interface ProfileCardProps {
  profile: Profile;
  isCurrentUser?: boolean;
  onInvite?: (profile: Profile) => void;
  onViewDetails?: (profile: Profile) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  isCurrentUser = false,
  onInvite,
  onViewDetails,
}) => {
  return (
    <div className="bg-surface rounded-card p-5 flex flex-col justify-between hover:bg-surface-subtle/50 transition-all duration-smooth space-y-4">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-full bg-accent/15 text-accent font-semibold text-base flex items-center justify-center shrink-0 overflow-hidden">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              profile.name.slice(0, 2).toUpperCase()
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3
                className="font-serif font-medium text-lg text-text hover:text-accent cursor-pointer transition-colors"
                onClick={() => onViewDetails?.(profile)}
              >
                {profile.name}
              </h3>
              {isCurrentUser && (
                <span className="text-[11px] font-sans font-medium text-accent">
                  (you)
                </span>
              )}
            </div>

            <p className="text-sm text-text-muted mt-0.5">
              Yr {profile.year} • {profile.department}
            </p>
            <p className="text-xs text-text-muted/80 flex items-center gap-1 mt-0.5">
              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[240px]">{profile.college}</span>
            </p>
          </div>
        </div>

        {/* Weekly Availability */}
        <div className="text-xs text-text-muted shrink-0">
          {profile.weekly_availability}h/wk
        </div>
      </div>

      {/* Short Bio */}
      {profile.bio && (
        <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
          {profile.bio}
        </p>
      )}

      {/* Technical Skills Preview */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-text-muted">
          Skills
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.skills.slice(0, 4).map((skill) => (
            <PillTag
              key={skill.name}
              label={skill.name}
              level={skill.level}
              className="text-xs py-0.5 px-2"
            />
          ))}
          {profile.skills.length > 4 && (
            <span className="text-xs text-text-muted">
              +{profile.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Preferred Domains */}
      {profile.preferred_domains && profile.preferred_domains.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-text-muted flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-accent" />
            <span>Interests</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.preferred_domains.slice(0, 3).map((domain) => (
              <span
                key={domain}
                className="text-xs text-accent"
              >
                {domain}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Currently Learning */}
      {profile.learning_goals && profile.learning_goals.length > 0 && (
        <div className="text-xs text-text-muted flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            Learning: <span className="text-text font-medium">{profile.learning_goals.join(', ')}</span>
          </span>
        </div>
      )}

      {/* Footer: Social Links & Actions */}
      <div className="flex items-center justify-between pt-3">
        <div className="flex items-center gap-2 text-text-muted">
          {profile.github_url && (
            <a
              href={profile.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:text-text hover:bg-surface-subtle transition-colors"
              title="GitHub Profile"
              aria-label={`${profile.name}'s GitHub`}
            >
              <Github className="w-4 h-4" />
            </a>
          )}
          {profile.linkedin_url && (
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:text-text hover:bg-surface-subtle transition-colors"
              title="LinkedIn Profile"
              aria-label={`${profile.name}'s LinkedIn`}
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {profile.portfolio_url && (
            <a
              href={profile.portfolio_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:text-text hover:bg-surface-subtle transition-colors"
              title="Personal Portfolio"
              aria-label={`${profile.name}'s Portfolio`}
            >
              <Globe className="w-4 h-4" />
            </a>
          )}
          {profile.other_url && (
            <a
              href={profile.other_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:text-text hover:bg-surface-subtle transition-colors"
              title="External Link"
              aria-label={`${profile.name}'s External Link`}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onViewDetails && (
            <Button
              type="button"
              variant="subtle"
              size="sm"
              onClick={() => onViewDetails(profile)}
            >
              View Profile
            </Button>
          )}

          {!isCurrentUser && onInvite && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<UserPlus className="w-3.5 h-3.5" />}
              onClick={() => onInvite(profile)}
            >
              Invite
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
