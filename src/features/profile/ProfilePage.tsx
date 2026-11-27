import React, { useState } from 'react';
import { Edit3, ExternalLink, Github, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Pill } from '../../ui/Pill';
import { useToast } from '../../ui/Toast';
import { ProfileForm } from './ProfileForm';

export const ProfilePage: React.FC = () => {
  const { session, profile, dataStore, setProfile, signOut } = useApp();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);

  if (!profile || !session?.user || !dataStore) return null;

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{profile.name}</h1>
          <p className="text-xs text-text-muted mt-0.5">
            {profile.college} · {profile.department} · Year {profile.year}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Pill variant={profile.role === 'admin' ? 'burgundy' : 'default'}>
            {profile.role === 'admin' ? 'Admin' : 'Student'}
          </Pill>
          <Button
            variant="ghost"
            size="sm"
            icon={<Edit3 className="w-3.5 h-3.5" />}
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </Button>
          <Button
            variant="subtle"
            size="sm"
            icon={<LogOut className="w-3.5 h-3.5" />}
            onClick={signOut}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {editing ? (
        <Card className="p-6">
          <ProfileForm
            userId={session.user.id}
            initialProfile={profile}
            submitLabel="Update Profile"
            onSave={async (input) => {
              const saved = await dataStore.upsertProfile(input);
              setProfile(saved);
              setEditing(false);
              showToast('Profile updated in Supabase');
            }}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-medium text-text-dim">About</span>
              <div className="flex items-center gap-2">
                <Pill variant="strong" className="font-mono">
                  {profile.weekly_availability} hrs/wk
                </Pill>
                {profile.open_to_learning && (
                  <Pill variant="burgundy">Committed Learner</Pill>
                )}
              </div>
            </div>
            <p className="text-[13.5px] text-text-muted leading-relaxed">
              {profile.bio || 'No bio added yet.'}
            </p>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 space-y-3">
              <div className="text-xs font-medium text-text-dim">Technical Skills</div>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.length > 0 ? (
                  profile.skills.map((s) => (
                    <Pill key={s.name} variant="strong">
                      <span>{s.name}</span>
                      <span className="font-mono text-[10px] text-text-dim">L{s.level}</span>
                    </Pill>
                  ))
                ) : (
                  <span className="text-xs text-text-dim">None added yet</span>
                )}
              </div>
            </Card>

            <Card className="p-5 space-y-3">
              <div className="text-xs font-medium text-text-dim">Currently Learning</div>
              <div className="flex flex-wrap gap-1.5">
                {profile.learning_goals.length > 0 ? (
                  profile.learning_goals.map((g) => (
                    <Pill key={g} variant="burgundy">
                      {g}
                    </Pill>
                  ))
                ) : (
                  <span className="text-xs text-text-dim">None listed</span>
                )}
              </div>
            </Card>
          </div>

          <Card className="p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Github className="w-4 h-4 text-text-muted" />
              <span className="text-xs font-mono text-text">
                {profile.github_username ? `@${profile.github_username}` : 'No GitHub username linked'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-text-muted hover:text-text inline-flex items-center gap-1"
                >
                  LinkedIn <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {profile.portfolio_url && (
                <a
                  href={profile.portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-text-muted hover:text-text inline-flex items-center gap-1"
                >
                  Portfolio <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
