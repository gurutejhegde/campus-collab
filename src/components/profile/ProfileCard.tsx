import React from 'react';
import {
  Github,
  Linkedin,
  Globe,
  GraduationCap,
  Sparkles,
  UserPlus,
  Clock,
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
    <div className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/40 transition-all duration-300 space-y-4 group">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[1.5px] shrink-0 shadow-sm">
            <img
              src={
                profile.avatar_url ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
              }
              alt={profile.name}
              className="w-full h-full rounded-full object-cover"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className="font-display font-bold text-lg text-white hover:text-purple-300 cursor-pointer transition-colors truncate"
                onClick={() => onViewDetails?.(profile)}
              >
                {profile.name}
              </h3>
              {isCurrentUser && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                  You
                </span>
              )}
            </div>

            <p className="text-xs text-text-muted mt-0.5 truncate font-sans">
              Yr {profile.year} • {profile.department}
            </p>
            <p className="text-[11px] text-text-muted/80 flex items-center gap-1 mt-0.5 font-sans truncate">
              <GraduationCap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">{profile.college}</span>
            </p>
          </div>
        </div>

        {/* Weekly Availability Badge */}
        <div className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full glass-pill border border-white/[0.08] text-emerald-400 shrink-0">
          <Clock className="w-3 h-3" />
          <span>{profile.weekly_availability}h/wk</span>
        </div>
      </div>

      {/* Short Bio */}
      {profile.bio && (
        <p className="text-xs text-text-muted line-clamp-2 leading-relaxed font-sans">
          {profile.bio}
        </p>
      )}

      {/* Technical Skills Preview */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
          Top Skills
        </div>
        <div className="flex flex-wrap gap-1.5">
          {profile.skills.slice(0, 4).map((skill) => (
            <PillTag
              key={skill.name}
              label={skill.name}
              level={skill.level}
              variant="default"
            />
          ))}
          {profile.skills.length > 4 && (
            <span className="text-[10px] font-mono text-text-muted px-2 py-0.5 rounded glass-pill">
              +{profile.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Interests & Domains Preview */}
      {profile.preferred_domains && profile.preferred_domains.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Target Domains</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {profile.preferred_domains.slice(0, 2).map((domain) => (
              <span
                key={domain}
                className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20"
              >
                {domain}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer Links & Actions */}
      <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
        {/* Social / External Links */}
        <div className="flex items-center gap-1.5">
          {profile.github_url && (
            <a
              href={profile.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/[0.08] transition-colors"
              title="GitHub Profile"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
          )}
          {profile.linkedin_url && (
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/[0.08] transition-colors"
              title="LinkedIn Profile"
            >
              <Linkedin className="w-3.5 h-3.5" />
            </a>
          )}
          {profile.portfolio_url && (
            <a
              href={profile.portfolio_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-text-muted hover:text-cyan-400 hover:bg-white/[0.08] transition-colors"
              title="Personal Portfolio"
            >
              <Globe className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onViewDetails?.(profile)}
          >
            Profile
          </Button>

          {!isCurrentUser && onInvite && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<UserPlus className="w-3 h-3" />}
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
