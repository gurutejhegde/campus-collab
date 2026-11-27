import React from 'react';
import { LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { useToast } from '../../ui/Toast';
import { ProfileForm } from './ProfileForm';

export const OnboardingPage: React.FC = () => {
  const { session, profile, dataStore, setProfile, signOut } = useApp();
  const { showToast } = useToast();

  if (!session?.user || !dataStore) return null;

  const metaName =
    (session.user.user_metadata?.full_name as string | undefined) ||
    (session.user.user_metadata?.user_name as string | undefined) ||
    '';

  return (
    <div className="min-h-screen bg-bg text-text py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-[6px] bg-accent text-white font-bold text-sm grid place-items-center">
                C
              </div>
              <span className="font-semibold text-sm">CampusCollab</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Complete your builder profile</h1>
            <p className="text-xs text-text-muted">
              Signed in as <span className="text-text">{session.user.email}</span>. Add your skills and what you want to learn so teammates can find you.
            </p>
          </div>

          <Button variant="ghost" size="sm" icon={<LogOut className="w-3.5 h-3.5" />} onClick={signOut}>
            Sign Out
          </Button>
        </div>

        <Card className="p-6">
          <ProfileForm
            userId={session.user.id}
            defaultName={metaName}
            initialProfile={profile}
            submitLabel="Finish Setup & Enter App"
            onSave={async (input) => {
              const saved = await dataStore.upsertProfile(input);
              setProfile(saved);
              showToast('Profile saved to Supabase');
            }}
          />
        </Card>
      </div>
    </div>
  );
};
