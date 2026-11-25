import React from 'react';
import {
  Github,
  Linkedin,
  Globe,
  ExternalLink,
  Clock,
  GraduationCap,
  Sparkles,
  BookOpen,
  UserPlus,
  Heart,
} from 'lucide-react';
import { Profile } from '../../shared/types';
import { Modal } from '../common/Modal';
import { PillTag } from '../common/PillTag';
import { Button } from '../common/Button';

interface ProfileDetailModalProps {
  profile: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  onInvite?: (profile: Profile) => void;
  isCurrentUser?: boolean;
}

export const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({
  profile,
  isOpen,
  onClose,
  onInvite,
  isCurrentUser = false,
}) => {
  if (!profile) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={profile.name}
      subtitle={`Student Profile • Year ${profile.year} ${profile.department}`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-card bg-surface-subtle border border-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent/15 border border-accent/30 text-accent font-semibold text-xl flex items-center justify-center shrink-0 overflow-hidden">
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
                <h4 className="font-serif text-xl font-medium text-text">{profile.name}</h4>
                {isCurrentUser && (
                  <span className="px-2 py-0.5 rounded-pill text-[10px] font-sans font-medium bg-accent text-white">
                    You
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted mt-0.5">{profile.department}</p>
              <p className="text-xs text-text-muted/90 flex items-center gap-1 mt-0.5">
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                <span>{profile.college}</span>
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
            <span className="px-3 py-1 rounded-pill text-xs font-sans font-medium bg-surface text-text border border-border flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>{profile.weekly_availability} hrs/week</span>
            </span>

            {!isCurrentUser && onInvite && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                icon={<UserPlus className="w-3.5 h-3.5" />}
                onClick={() => {
                  onClose();
                  onInvite(profile);
                }}
              >
                Invite to Team
              </Button>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="space-y-1.5">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              About & Background
            </h5>
            <p className="text-sm text-text leading-relaxed font-sans">{profile.bio}</p>
          </div>
        )}

        {/* Skills Grid */}
        <div className="space-y-2">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Technical Skills & Proficiency (Level 1–5)
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {profile.skills.map((s) => (
              <div
                key={s.name}
                className="p-2.5 rounded-card bg-surface border border-border flex items-center justify-between"
              >
                <span className="text-xs font-medium text-text">{s.name}</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`w-2 h-2 rounded-full ${
                        level <= s.level ? 'bg-accent' : 'bg-border'
                      }`}
                    />
                  ))}
                  <span className="text-[10px] font-mono text-text-muted ml-1">L{s.level}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Areas of Interest & Currently Learning */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profile.interests && profile.interests.length > 0 && (
            <div className="space-y-1.5 p-3.5 rounded-card bg-surface-subtle/60 border border-border">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-accent" />
                <span>Areas of Interest</span>
              </h5>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {profile.interests.map((item) => (
                  <PillTag key={item} label={item} />
                ))}
              </div>
            </div>
          )}

          {profile.learning_goals && profile.learning_goals.length > 0 && (
            <div className="space-y-1.5 p-3.5 rounded-card bg-surface-subtle/60 border border-border">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-accent" />
                <span>Currently Learning</span>
              </h5>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {profile.learning_goals.map((goal) => (
                  <PillTag key={goal} label={goal} variant="accent" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preferred Project Domains */}
        {profile.preferred_domains && profile.preferred_domains.length > 0 && (
          <div className="space-y-1.5">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Preferred Project Domains</span>
            </h5>
            <div className="flex flex-wrap gap-2">
              {profile.preferred_domains.map((domain) => (
                <span
                  key={domain}
                  className="px-3 py-1 rounded-pill text-xs font-medium bg-accent/10 text-accent border border-accent/25"
                >
                  {domain}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Links & Portfolio */}
        <div className="space-y-2 pt-2 border-t border-border">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Online Profiles & Links
          </h5>
          <div className="flex flex-wrap gap-2.5">
            {profile.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-pill bg-surface border border-border hover:border-accent text-xs font-sans text-text flex items-center gap-1.5 transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 text-text-muted" />
              </a>
            )}
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-pill bg-surface border border-border hover:border-accent text-xs font-sans text-text flex items-center gap-1.5 transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 text-text-muted" />
              </a>
            )}
            {profile.portfolio_url && (
              <a
                href={profile.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-pill bg-surface border border-border hover:border-accent text-xs font-sans text-text flex items-center gap-1.5 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Portfolio Website</span>
                <ExternalLink className="w-3 h-3 text-text-muted" />
              </a>
            )}
            {profile.other_url && (
              <a
                href={profile.other_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-pill bg-surface border border-border hover:border-accent text-xs font-sans text-text flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Other Link</span>
              </a>
            )}
            {!profile.github_url && !profile.linkedin_url && !profile.portfolio_url && !profile.other_url && (
              <span className="text-xs text-text-muted italic">No external links provided.</span>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
