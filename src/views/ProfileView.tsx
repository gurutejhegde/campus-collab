import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Edit3,
  Eye,
  Users,
  Github,
  Linkedin,
  Globe,
  Clock,
  GraduationCap,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDataStore } from '../context/DataStoreContext';
import { useToast } from '../components/common/Toast';
import { Profile, Team } from '../shared/types';
import { ProfileForm } from '../components/profile/ProfileForm';
import { PillTag } from '../components/common/PillTag';
import { Button } from '../components/common/Button';

export const ProfileView: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const { profile: currentAuthProfile, updateCurrentProfile } = useAuth();
  const { dataStore } = useDataStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view');
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const isSelf = !userId || userId === currentAuthProfile?.id;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const targetId = userId || currentAuthProfile?.id || 'user-ananya';
        const p = await dataStore.getProfile(targetId);
        setProfileData(p);

        const allTeams = await dataStore.getTeams();
        const memberOf = allTeams.filter(
          (t) =>
            t.creator_id === targetId ||
            (t.members && t.members.some((m) => m.user_id === targetId))
        );
        setUserTeams(memberOf);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId, currentAuthProfile?.id, dataStore]);

  if (loading || !profileData) {
    return (
      <div className="py-20 text-center text-text-muted">
        <p className="font-serif text-lg">Loading student profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <User className="w-6 h-6 text-accent" />
            <h1 className="text-2xl sm:text-3xl font-serif font-medium text-text">
              {isSelf ? 'My Student Profile' : `${profileData.name}'s Profile`}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-text-muted">
            {isSelf
              ? 'Keep your technical skills, portfolio links, and collaboration availability current.'
              : 'Public student profile and portfolio.'}
          </p>
        </div>

        {isSelf && (
          <div className="flex items-center gap-1.5 p-1 bg-surface-subtle rounded-pill border border-border">
            <button
              type="button"
              onClick={() => setActiveTab('view')}
              className={`px-3.5 py-1.5 rounded-pill text-xs font-sans font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'view'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`px-3.5 py-1.5 rounded-pill text-xs font-sans font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'edit'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>
        )}
      </div>

      {isSelf && activeTab === 'edit' ? (
        <ProfileForm
          initialProfile={profileData}
          onSave={async (updates) => {
            const updated = await updateCurrentProfile(updates);
            setProfileData(updated);
            showToast('Profile updated successfully!', 'success');
            setActiveTab('view');
          }}
        />
      ) : (
        /* Visual Profile Presentation View */
        <div className="space-y-6">
          {/* Header Card */}
          <div className="p-6 rounded-card bg-surface border border-border space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-full bg-accent/15 border border-accent/30 text-accent font-semibold text-2xl flex items-center justify-center shrink-0 overflow-hidden">
                  {profileData.avatar_url ? (
                    <img
                      src={profileData.avatar_url}
                      alt={profileData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    profileData.name.slice(0, 2).toUpperCase()
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-serif font-medium text-text">
                      {profileData.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-pill text-xs font-semibold bg-accent/15 text-accent border border-accent/25">
                      Year {profileData.year}
                    </span>
                  </div>

                  <p className="text-sm text-text-muted">{profileData.department}</p>
                  <p className="text-xs text-text-muted/80 flex items-center gap-1">
                    <GraduationCap className="w-4 h-4 text-accent shrink-0" />
                    <span>{profileData.college}</span>
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                <span className="px-3 py-1.5 rounded-pill text-xs font-sans font-medium bg-surface-subtle text-text border border-border flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  <span>{profileData.weekly_availability} hrs/week availability</span>
                </span>

                {isSelf && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={<Edit3 className="w-3.5 h-3.5" />}
                    onClick={() => setActiveTab('edit')}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>

            {/* Bio */}
            {profileData.bio && (
              <div className="pt-3 border-t border-border/80">
                <p className="text-sm text-text leading-relaxed font-sans">{profileData.bio}</p>
              </div>
            )}

            {/* Social & External Links */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border/80 text-xs text-text-muted">
              {profileData.github_url && (
                <a
                  href={profileData.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-pill bg-surface-subtle border border-border hover:border-accent text-text flex items-center gap-1.5 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
              )}
              {profileData.linkedin_url && (
                <a
                  href={profileData.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-pill bg-surface-subtle border border-border hover:border-accent text-text flex items-center gap-1.5 transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </a>
              )}
              {profileData.portfolio_url && (
                <a
                  href={profileData.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-pill bg-surface-subtle border border-border hover:border-accent text-text flex items-center gap-1.5 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Portfolio</span>
                </a>
              )}
              {profileData.other_url && (
                <a
                  href={profileData.other_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-pill bg-surface-subtle border border-border hover:border-accent text-text flex items-center gap-1.5 transition-colors"
                >
                  <span>Link</span>
                </a>
              )}
            </div>
          </div>

          {/* Technical Skills Showcase */}
          <div className="p-6 rounded-card bg-surface border border-border space-y-4 shadow-sm">
            <h3 className="font-serif font-medium text-lg text-text">
              Technical Skills & Proficiencies
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {profileData.skills.map((s) => (
                <div
                  key={s.name}
                  className="p-3 rounded-card bg-surface-subtle border border-border flex items-center justify-between"
                >
                  <span className="text-xs font-medium text-text">{s.name}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={`w-2 h-2 rounded-full ${
                          lvl <= s.level ? 'bg-accent' : 'bg-border'
                        }`}
                      />
                    ))}
                    <span className="text-[10px] font-mono text-text-muted ml-1">L{s.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Domains, Interests & Currently Learning */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profileData.preferred_domains && profileData.preferred_domains.length > 0 && (
              <div className="p-5 rounded-card bg-surface border border-border space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>Preferred Project Domains</span>
                </h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profileData.preferred_domains.map((dom) => (
                    <span
                      key={dom}
                      className="px-3 py-1 rounded-pill text-xs font-medium bg-accent/10 text-accent border border-accent/25"
                    >
                      {dom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profileData.learning_goals && profileData.learning_goals.length > 0 && (
              <div className="p-5 rounded-card bg-surface border border-border space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-accent" />
                  <span>Currently Learning</span>
                </h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profileData.learning_goals.map((g) => (
                    <PillTag key={g} label={g} variant="accent" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* My Teams Showcase */}
          <div className="p-6 rounded-card bg-surface border border-border space-y-4 shadow-sm">
            <h3 className="font-serif font-medium text-lg text-text flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              <span>Project Teams ({userTeams.length})</span>
            </h3>

            {userTeams.length === 0 ? (
              <p className="text-xs text-text-muted italic">Not currently part of any team.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {userTeams.map((team) => (
                  <div
                    key={team.id}
                    onClick={() => navigate(`/teams`)}
                    className="p-3.5 rounded-card bg-surface-subtle border border-border hover:border-accent/40 cursor-pointer transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-serif font-medium text-sm text-text">{team.name}</h5>
                      <span className="text-[10px] px-2 py-0.5 rounded-pill bg-surface text-text-muted border border-border">
                        {team.project_domain}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted line-clamp-1">{team.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
