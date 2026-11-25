import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { DataStoreProvider } from './context/DataStoreContext';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ShowcaseView } from './views/ShowcaseView';
import { ExploreView } from './views/ExploreView';
import { TeamsView } from './views/TeamsView';
import { EventsView } from './views/EventsView';
import { RequestsView } from './views/RequestsView';
import { ProfileView } from './views/ProfileView';

export function App() {
  return (
    <ThemeProvider>
      <DataStoreProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<ShowcaseView />} />
                <Route path="showcase" element={<ShowcaseView />} />
                <Route path="explore" element={<ExploreView />} />
                <Route path="teams" element={<TeamsView />} />
                <Route path="teams/:teamId" element={<TeamsView />} />
                <Route path="events" element={<EventsView />} />
                <Route path="events/:eventId" element={<EventsView />} />
                <Route path="requests" element={<RequestsView />} />
                <Route path="profile" element={<ProfileView />} />
                <Route path="profile/:userId" element={<ProfileView />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </DataStoreProvider>
    </ThemeProvider>
  );
}
