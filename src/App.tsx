import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthPage } from './features/auth/AuthPage';
import { SetupEnvView } from './features/auth/SetupEnvView';
import { EventsPage } from './features/events/EventsPage';
import { FinderPage } from './features/finder/FinderPage';
import { OnboardingPage } from './features/profile/OnboardingPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { RequestsPage } from './features/requests/RequestsPage';
import { AppShell } from './features/shell/AppShell';
import { StepPlaceholder } from './features/shell/StepPlaceholder';
import { TeamFormPage } from './features/teams/TeamFormPage';
import { ToastProvider } from './ui/Toast';

const AppGate: React.FC = () => {
  const { isConfigured, session, profile, loading } = useApp();

  if (!isConfigured) {
    return <SetupEnvView />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-text-muted flex items-center justify-center text-xs font-mono">
        Connecting to Supabase...
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  if (!profile || !profile.onboarding_completed) {
    return <OnboardingPage />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<FinderPage />} />
          <Route path="teams/new" element={<TeamFormPage />} />
          <Route path="teams/:teamId/edit" element={<TeamFormPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route
            path="blueprint"
            element={
              <StepPlaceholder
                step="Next Step: AI Layer"
                title="Idea Blueprint & Smart AI Matching"
                description="Paste an idea to map tools/roles, score learners + experts, and summarize GitHub work."
              />
            }
          />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <AppGate />
      </AppProvider>
    </ToastProvider>
  );
}
