import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Compass,
  Inbox,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDataStore } from '../context/DataStoreContext';
import { useToast } from '../components/common/Toast';
import { CampusEvent, Profile, Team, TeamRequest } from '../shared/types';
import { ProfileCard } from '../components/profile/ProfileCard';
import { ProfileDetailModal } from '../components/profile/ProfileDetailModal';
import { TeamDetailModal } from '../components/teams/TeamDetailModal';
import { EventCard } from '../components/events/EventCard';
import { EventDetailModal } from '../components/events/EventDetailModal';
import { InviteStudentModal } from '../components/teams/InviteStudentModal';
import { RequestJoinModal } from '../components/teams/RequestJoinModal';
import { CreateTeamModal } from '../components/teams/CreateTeamModal';
import { Button } from '../components/common/Button';

export const HomeView: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { dataStore } = useDataStore();
  const { showToast } = useToast();

  const [teams, setTeams] = useState<Team[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [incomingInvites, setIncomingInvites] = useState<TeamRequest[]>([]);
  const [incomingJoinRequests, setIncomingJoinRequests] = useState<TeamRequest[]>([]);
  const [, setLoading] = useState(true);

  // Modals state
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);
  const [inviteTarget, setInviteTarget] = useState<Profile | null>(null);
  const [joinTargetTeam, setJoinTargetTeam] = useState<Team | null>(null);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);

  const loadDashboardData = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const [allTeams, allEvents, allProfs, reqs] = await Promise.all([
        dataStore.getTeams(),
        dataStore.getEvents(),
        dataStore.getProfiles(),
        dataStore.getRequestsForUser(profile.id),
      ]);

      setTeams(allTeams);
      setEvents(allEvents);
      setProfiles(allProfs);
      setIncomingInvites(reqs.incomingInvites.filter((r) => r.status === 'pending'));
      setIncomingJoinRequests(reqs.incomingJoinRequests.filter((r) => r.status === 'pending'));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [profile?.id, dataStore]);

  // Profile completion calculation
  const profileCompletion = useMemo(() => {
    if (!profile) return { score: 0, missing: [] as string[] };
    const items = [
      { label: 'Full Name', done: Boolean(profile.name) },
      { label: 'Profile Bio', done: Boolean(profile.bio && profile.bio.length >= 20) },
      { label: 'Technical Skills (3+)', done: profile.skills && profile.skills.length >= 3 },
      { label: 'GitHub Link', done: Boolean(profile.github_url) },
      { label: 'LinkedIn Link', done: Boolean(profile.linkedin_url) },
      { label: 'Preferred Project Domains', done: profile.preferred_domains && profile.preferred_domains.length > 0 },
    ];

    const doneCount = items.filter((i) => i.done).length;
    const score = Math.round((doneCount / items.length) * 100);
    const missing = items.filter((i) => !i.done).map((i) => i.label);

    return { score, missing };
  }, [profile]);

  // Teams the current student is part of
  const myTeams = useMemo(() => {
    if (!profile) return [];
    return teams.filter(
      (t) =>
        t.creator_id === profile.id ||
        (t.members && t.members.some((m) => m.user_id === profile.id))
    );
  }, [teams, profile]);

  // Suggested peers (complementary or shared domains, excluding self)
  const suggestedPeers = useMemo(() => {
    if (!profile) return [];
    return profiles
      .filter((p) => p.id !== profile.id)
      .slice(0, 3);
  }, [profiles, profile]);

  // Handle request actions
  const handleAcceptRequest = async (reqId: string) => {
    try {
      await dataStore.updateRequestStatus(reqId, 'accepted');
      showToast('Request accepted! Member added to team roster.', 'success');
      loadDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Failed to accept request', 'error');
    }
  };

  const handleRejectRequest = async (reqId: string) => {
    try {
      await dataStore.updateRequestStatus(reqId, 'rejected');
      showToast('Request declined.', 'info');
      loadDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Failed to decline request', 'error');
    }
  };

  const handleSendInvite = async (teamId: string, role: string, message: string) => {
    if (!profile || !inviteTarget) return;
    await dataStore.createRequest({
      type: 'invitation',
      team_id: teamId,
      sender_id: profile.id,
      recipient_id: inviteTarget.id,
      role,
      message,
    });
    showToast(`Invitation sent to ${inviteTarget.name}!`, 'success');
    loadDashboardData();
  };

  const handleSendJoinRequest = async (teamId: string, role: string, message: string) => {
    if (!profile || !joinTargetTeam) return;
    await dataStore.createRequest({
      type: 'join_request',
      team_id: teamId,
      sender_id: profile.id,
      recipient_id: joinTargetTeam.creator_id,
      role,
      message,
    });
    showToast(`Join request submitted to ${joinTargetTeam.name}!`, 'success');
    loadDashboardData();
  };

  const handleCreateTeam = async (teamData: any) => {
    const created = await dataStore.createTeam(teamData);
    showToast(`Team "${created.name}" created successfully!`, 'success');
    loadDashboardData();
  };

  const totalPending = incomingInvites.length + incomingJoinRequests.length;

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* 1. Welcome Banner */}
      <div className="pt-2">
        <p className="text-sm text-text-muted mb-2">{profile?.college}</p>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
          Welcome back, {profile?.name?.split(' ')[0] || 'Student'}
        </h1>
        <p className="text-base text-text-muted mt-3 max-w-2xl leading-relaxed">
          Connect with peers, assemble hackathon teams, and discover campus events.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <Button
            type="button"
            variant="secondary"
            size="md"
            icon={<Compass className="w-4 h-4" />}
            onClick={() => navigate('/explore')}
          >
            Explore Students
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateTeamOpen(true)}
          >
            Create a Team
          </Button>
        </div>
      </div>

      {/* 2. Key Metrics Snapshot */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: My Teams */}
        <div
          onClick={() => navigate('/teams')}
          className="p-5 rounded-card bg-surface hover:bg-surface-subtle/50 cursor-pointer transition-all duration-smooth group"
        >
          <Users className="w-5 h-5 text-accent/70 group-hover:text-accent transition-colors" />
          <div className="mt-3 text-3xl font-display font-bold text-white">{myTeams.length}</div>
          <p className="text-sm text-text-muted mt-1">My Teams</p>
        </div>

        {/* Metric 2: Pending Requests */}
        <div
          onClick={() => navigate('/requests')}
          className="p-5 rounded-card bg-surface hover:bg-surface-subtle/50 cursor-pointer transition-all duration-smooth group"
        >
          <Inbox className="w-5 h-5 text-accent/70 group-hover:text-accent transition-colors" />
          <div className="mt-3 text-3xl font-display font-bold text-white">{totalPending}</div>
          <p className="text-sm text-text-muted mt-1">Pending Requests</p>
        </div>

        {/* Metric 3: Upcoming Events */}
        <div
          onClick={() => navigate('/events')}
          className="p-5 rounded-card bg-surface hover:bg-surface-subtle/50 cursor-pointer transition-all duration-smooth group"
        >
          <Calendar className="w-5 h-5 text-accent/70 group-hover:text-accent transition-colors" />
          <div className="mt-3 text-3xl font-display font-bold text-white">{events.length}</div>
          <p className="text-sm text-text-muted mt-1">Events</p>
        </div>

        {/* Metric 4: Profile Strength */}
        <div
          onClick={() => navigate('/profile')}
          className="p-5 rounded-card bg-surface hover:bg-surface-subtle/50 cursor-pointer transition-all duration-smooth group"
        >
          <CheckCircle2 className={`w-5 h-5 transition-colors ${profileCompletion.score === 100 ? 'text-success' : 'text-accent/70 group-hover:text-accent'}`} />
          <div className="mt-3 text-3xl font-display font-bold text-white">{profileCompletion.score}%</div>
          <p className="text-sm text-text-muted mt-1">Profile Complete</p>
        </div>
      </div>

      {/* 3. Pending Actions */}
      {totalPending > 0 && (
        <div className="p-6 rounded-card bg-accent/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-display font-bold text-white">
              {totalPending} Pending {totalPending === 1 ? 'Action' : 'Actions'}
            </h3>
            <button
              onClick={() => navigate('/requests')}
              className="text-sm font-medium text-accent hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Incoming Invites */}
            {incomingInvites.slice(0, 2).map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-card bg-surface flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-accent">Team Invitation</span>
                    <span className="text-xs text-text-muted">
                      {new Date(req.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <h5 className="font-display font-bold text-white">
                    {req.team?.name || 'A Project Team'}
                  </h5>
                  <p className="text-sm text-text-muted">
                    Role: <span className="text-text">{req.role || 'Contributor'}</span>
                  </p>
                  {req.message && (
                    <p className="text-xs text-text-muted italic line-clamp-1">
                      "{req.message}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="subtle"
                    size="sm"
                    onClick={() => handleRejectRequest(req.id)}
                  >
                    Decline
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => handleAcceptRequest(req.id)}
                  >
                    Accept
                  </Button>
                </div>
              </div>
            ))}

            {/* Join Requests */}
            {incomingJoinRequests.slice(0, 2).map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-card bg-surface flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-success">Join Request</span>
                    <span className="text-xs text-text-muted">
                      {new Date(req.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <h5 className="font-display font-bold text-white">
                    {req.sender_profile?.name || 'A Student'} → {req.team?.name}
                  </h5>
                  <p className="text-sm text-text-muted">
                    Role: <span className="text-text">{req.role || 'Member'}</span>
                  </p>
                  {req.message && (
                    <p className="text-xs text-text-muted italic line-clamp-1">
                      "{req.message}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="subtle"
                    size="sm"
                    onClick={() => handleRejectRequest(req.id)}
                  >
                    Decline
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => handleAcceptRequest(req.id)}
                  >
                    Accept
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Suggested Teammates */}
      <div className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">
              Discover Teammates
            </h2>
            <p className="text-sm text-text-muted mt-1">
              Students across engineering disciplines looking to collaborate
            </p>
          </div>

          <Button
            type="button"
            variant="subtle"
            size="sm"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => navigate('/explore')}
          >
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {suggestedPeers.map((peer) => (
            <ProfileCard
              key={peer.id}
              profile={peer}
              onViewDetails={(p) => setSelectedProfile(p)}
              onInvite={(p) => setInviteTarget(p)}
            />
          ))}
        </div>
      </div>

      {/* 5. Featured Events */}
      <div className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">
              Featured Events
            </h2>
            <p className="text-sm text-text-muted mt-1">
              Hackathons, competitions, and workshops
            </p>
          </div>

          <Button
            type="button"
            variant="subtle"
            size="sm"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => navigate('/events')}
          >
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {events.slice(0, 2).map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onViewDetails={(e) => setSelectedEvent(e)}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <ProfileDetailModal
        profile={selectedProfile}
        isOpen={Boolean(selectedProfile)}
        onClose={() => setSelectedProfile(null)}
        onInvite={(p) => setInviteTarget(p)}
      />

      <TeamDetailModal
        team={selectedTeam}
        isOpen={Boolean(selectedTeam)}
        onClose={() => setSelectedTeam(null)}
        currentUserId={profile?.id || ''}
        isMember={selectedTeam?.creator_id === profile?.id || selectedTeam?.members?.some((m) => m.user_id === profile?.id)}
        isLead={selectedTeam?.creator_id === profile?.id}
        onInviteMember={() => setInviteTarget(suggestedPeers[0] || null)}
      />

      <EventDetailModal
        event={selectedEvent}
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
      />

      <InviteStudentModal
        isOpen={Boolean(inviteTarget)}
        onClose={() => setInviteTarget(null)}
        targetStudent={inviteTarget}
        userTeams={myTeams}
        onSendInvitation={handleSendInvite}
      />

      <RequestJoinModal
        isOpen={Boolean(joinTargetTeam)}
        onClose={() => setJoinTargetTeam(null)}
        targetTeam={joinTargetTeam}
        onSendJoinRequest={handleSendJoinRequest}
      />

      <CreateTeamModal
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
        creatorId={profile?.id || 'user-ananya'}
        onCreateTeam={handleCreateTeam}
      />
    </div>
  );
};
