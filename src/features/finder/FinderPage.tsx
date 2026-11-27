import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isTeamVisibleInTab } from '../../core/engine/teamSeats';
import { Profile, Team, TeamRequest } from '../../core/types/domain';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { ConfirmModal } from '../../ui/ConfirmModal';
import { useToast } from '../../ui/Toast';
import { InviteStudentModal } from '../teams/InviteStudentModal';
import { RequestJoinModal } from '../teams/RequestJoinModal';
import { TeamCard } from '../teams/TeamCard';
import { TeamInspector } from '../teams/TeamInspector';
import { StudentCard } from './StudentCard';
import { StudentInspector } from './StudentInspector';

type TeamFilter = 'all' | 'mine' | 'standalone' | 'event' | 'learner';

export const FinderPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, dataStore } = useApp();
  const { showToast } = useToast();
  const searchRef = useRef<HTMLInputElement>(null);

  const [mobileExpandedTeamId, setMobileExpandedTeamId] = useState<string | null>(null);
  const [mobileExpandedStudentId, setMobileExpandedStudentId] = useState<string | null>(null);

  const [mode, setMode] = useState<'teams' | 'students'>('teams');
  const [teamFilter, setTeamFilter] = useState<TeamFilter>('all');
  const [learnerOnlyStudents, setLearnerOnlyStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [teams, setTeams] = useState<Team[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [outgoingJoinReqs, setOutgoingJoinReqs] = useState<TeamRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [deleteTargetTeam, setDeleteTargetTeam] = useState<Team | null>(null);
  const [joinTargetTeam, setJoinTargetTeam] = useState<Team | null>(null);
  const [joinDefaultRole, setJoinDefaultRole] = useState<string | undefined>(undefined);
  const [inviteTargetStudent, setInviteTargetStudent] = useState<Profile | null>(null);

  const loadAll = useCallback(async () => {
    if (!dataStore || !profile) return;
    setLoading(true);
    try {
      const [teamRows, profRows, reqSummary] = await Promise.all([
        dataStore.getTeams(),
        dataStore.getProfiles(),
        dataStore.getRequestsForUser(profile.id),
      ]);
      setTeams(teamRows);
      setProfiles(profRows.filter((p) => p.id !== profile.id));
      setOutgoingJoinReqs(reqSummary.outgoingJoinRequests);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [dataStore, profile, showToast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const ledTeams = useMemo(
    () => teams.filter((t) => t.creator_id === profile?.id),
    [teams, profile?.id]
  );

  const filteredTeams = useMemo(() => {
    if (!profile) return [];
    const q = searchQuery.trim().toLowerCase();
    return teams.filter((team) => {
      if (!isTeamVisibleInTab(team, profile.id, teamFilter)) {
        return false;
      }

      if (!q) return true;
      return (
        team.name.toLowerCase().includes(q) ||
        team.project_domain.toLowerCase().includes(q) ||
        team.description.toLowerCase().includes(q) ||
        (team.event?.title || '').toLowerCase().includes(q) ||
        team.required_skills.some((s) => s.toLowerCase().includes(q)) ||
        team.open_roles.some((r) => r.toLowerCase().includes(q))
      );
    });
  }, [teams, teamFilter, searchQuery, profile]);

  const finderTeamCount = useMemo(
    () => (profile ? teams.filter((t) => isTeamVisibleInTab(t, profile.id, 'all')).length : 0),
    [teams, profile]
  );

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return profiles.filter((p) => {
      if (learnerOnlyStudents && !p.open_to_learning) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.college.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        p.bio.toLowerCase().includes(q) ||
        p.skills.some((s) => s.name.toLowerCase().includes(q)) ||
        p.learning_goals.some((l) => l.toLowerCase().includes(q))
      );
    });
  }, [profiles, learnerOnlyStudents, searchQuery]);

  const activeTeam = useMemo(
    () => filteredTeams.find((t) => t.id === selectedTeamId) || filteredTeams[0] || null,
    [filteredTeams, selectedTeamId]
  );

  const activeStudent = useMemo(
    () => filteredStudents.find((p) => p.id === selectedStudentId) || filteredStudents[0] || null,
    [filteredStudents, selectedStudentId]
  );

  const pendingTeamIds = useMemo(() => {
    return new Set(
      outgoingJoinReqs.filter((r) => r.status === 'pending').map((r) => r.team_id)
    );
  }, [outgoingJoinReqs]);

  if (!profile || !dataStore) return null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === 'teams' ? 'Teams & Idea Squads' : 'Discover Student Builders'}
          </h1>
          <p className="text-xs text-text-muted mt-1">
            {mode === 'teams'
              ? 'Create a standalone idea team, form a hackathon squad, or request to join open teams.'
              : 'Browse verified student profiles and invite teammates to your teams.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-well p-1 rounded-[9px] border border-border">
            <button
              type="button"
              onClick={() => setMode('teams')}
              className={`px-3 py-1 rounded-[6px] text-xs font-medium transition-colors ${
                mode === 'teams' ? 'bg-surface-elevated text-text' : 'text-text-muted hover:text-text'
              }`}
            >
              Teams ({finderTeamCount})
            </button>
            <button
              type="button"
              onClick={() => setMode('students')}
              className={`px-3 py-1 rounded-[6px] text-xs font-medium transition-colors ${
                mode === 'students' ? 'bg-surface-elevated text-text' : 'text-text-muted hover:text-text'
              }`}
            >
              Students ({profiles.length})
            </button>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => navigate('/teams/new')}
          >
            New Team
          </Button>
        </div>
      </div>

      {/* Command Search Bar */}
      <div className="bg-surface border border-border rounded-card px-3.5 py-2.5 flex items-center gap-3 shadow-tactile focus-within:border-border-strong">
        <Search className="w-4 h-4 text-text-dim shrink-0" />
        <input
          ref={searchRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            mode === 'teams'
              ? 'Search team name, domain, open role, skill, or event...'
              : 'Search student name, college, skill, or learning goal...'
          }
          className="flex-1 bg-transparent text-[13px] text-text focus:outline-none"
        />
        <kbd className="hidden sm:inline font-mono text-[11px] text-text-dim bg-well border border-border px-1.5 py-0.5 rounded">
          ⌘K
        </kbd>
      </div>

      {/* Filter Pills */}
      {mode === 'teams' ? (
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: 'all', label: 'All Teams' },
              { id: 'mine', label: 'My Teams' },
              { id: 'standalone', label: 'Standalone Ideas' },
              { id: 'event', label: 'Event Teams' },
              { id: 'learner', label: 'Learner Friendly' },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setTeamFilter(f.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                teamFilter === f.id
                  ? 'bg-surface-elevated text-text border-border-strong'
                  : 'text-text-muted border-border hover:text-text'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setLearnerOnlyStudents(false)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              !learnerOnlyStudents
                ? 'bg-surface-elevated text-text border-border-strong'
                : 'text-text-muted border-border hover:text-text'
            }`}
          >
            All Students
          </button>
          <button
            type="button"
            onClick={() => setLearnerOnlyStudents(true)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              learnerOnlyStudents
                ? 'bg-surface-elevated text-text border-border-strong'
                : 'text-text-muted border-border hover:text-text'
            }`}
          >
            Committed Learners
          </button>
        </div>
      )}

      {/* Split Master-Detail Content */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 space-y-2.5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 rounded-card bg-surface border border-border animate-pulse" />
            ))}
          </div>
          <div className="lg:col-span-5 h-64 rounded-card bg-surface border border-border animate-pulse" />
        </div>
      ) : mode === 'teams' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 space-y-2.5">
            {filteredTeams.length === 0 ? (
              <Card className="p-8 text-center space-y-3">
                <Users className="w-7 h-7 text-text-dim mx-auto" />
                <div className="text-sm font-medium text-text">No teams match your filter</div>
                <p className="text-xs text-text-muted">
                  Be the first to create a standalone idea team or attach one to an event.
                </p>
                <div className="pt-1">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => navigate('/teams/new')}
                  >
                    Create Team
                  </Button>
                </div>
              </Card>
            ) : (
              filteredTeams.map((team) => {
                const isExpandedOnMobile = mobileExpandedTeamId === team.id;

                return (
                  <TeamCard
                    key={team.id}
                    team={team}
                    currentUserId={profile.id}
                    selected={activeTeam?.id === team.id || isExpandedOnMobile}
                    mobileExpanded={isExpandedOnMobile}
                    hasPendingJoinRequest={pendingTeamIds.has(team.id)}
                    onSelect={(t) => {
                      setSelectedTeamId(t.id);
                      setMobileExpandedTeamId((prev) => (prev === t.id ? null : t.id));
                    }}
                    onQuickJoin={(t) => {
                      setJoinDefaultRole(undefined);
                      setJoinTargetTeam(t);
                    }}
                    onEdit={(t) => navigate(`/teams/${t.id}/edit`)}
                    onRequestDelete={(t) => setDeleteTargetTeam(t)}
                    onLeave={async (teamId) => {
                      await dataStore.leaveTeam(teamId, profile.id);
                      showToast('Left team');
                      loadAll();
                    }}
                    onRemoveMember={async (teamId, userId, name) => {
                      await dataStore.removeMember(teamId, userId);
                      showToast(`Removed ${name} from team`);
                      loadAll();
                    }}
                    onRequestJoin={(t, preferredRole) => {
                      setJoinDefaultRole(preferredRole);
                      setJoinTargetTeam(t);
                    }}
                  />
                );
              })
            )}
          </div>

          <div className="hidden lg:block lg:col-span-5 lg:self-start lg:sticky lg:top-[76px]">
            <TeamInspector
              team={activeTeam}
              currentUserId={profile.id}
              hasPendingJoinRequest={Boolean(activeTeam && pendingTeamIds.has(activeTeam.id))}
              onEdit={(team) => navigate(`/teams/${team.id}/edit`)}
              onRequestDelete={(team) => setDeleteTargetTeam(team)}
              onLeave={async (teamId) => {
                await dataStore.leaveTeam(teamId, profile.id);
                showToast('Left team');
                loadAll();
              }}
              onRemoveMember={async (teamId, userId, name) => {
                await dataStore.removeMember(teamId, userId);
                showToast(`Removed ${name} from team`);
                loadAll();
              }}
              onRequestJoin={(team, preferredRole) => {
                setJoinDefaultRole(preferredRole);
                setJoinTargetTeam(team);
              }}
            />
          </div>
        </div>
      ) : (
        /* Students List + Inspector */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 space-y-2.5">
            {filteredStudents.length === 0 ? (
              <Card className="p-8 text-center space-y-2">
                <div className="text-sm font-medium text-text">No other students found yet</div>
                <p className="text-xs text-text-muted">
                  Once another student signs up and finishes onboarding, they will appear here for invites.
                </p>
              </Card>
            ) : (
              filteredStudents.map((student) => {
                const isSelected = activeStudent?.id === student.id;
                const isExpandedOnMobile = mobileExpandedStudentId === student.id;
                return (
                  <StudentCard
                    key={student.id}
                    student={student}
                    selected={isSelected || isExpandedOnMobile}
                    mobileExpanded={isExpandedOnMobile}
                    onSelect={(s) => {
                      setSelectedStudentId(s.id);
                      setMobileExpandedStudentId((prev) => (prev === s.id ? null : s.id));
                    }}
                    onInvite={(s) => setInviteTargetStudent(s)}
                  />
                );
              })
            )}
          </div>

          <div className="hidden lg:block lg:col-span-5 lg:self-start lg:sticky lg:top-[76px]">
            <StudentInspector
              student={activeStudent}
              onInvite={(s) => setInviteTargetStudent(s)}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <RequestJoinModal
        isOpen={Boolean(joinTargetTeam)}
        onClose={() => {
          setJoinTargetTeam(null);
          setJoinDefaultRole(undefined);
        }}
        team={joinTargetTeam}
        defaultRole={joinDefaultRole}
        onSubmit={async (teamId, proposedRole, message) => {
          if (!joinTargetTeam) return;
          await dataStore.createRequest({
            type: 'join_request',
            team_id: teamId,
            sender_id: profile.id,
            recipient_id: joinTargetTeam.creator_id,
            proposed_role: proposedRole,
            message,
          });
          showToast(`Join request sent to ${joinTargetTeam.name}`);
          await loadAll();
        }}
      />

      <ConfirmModal
        isOpen={Boolean(deleteTargetTeam)}
        onClose={() => setDeleteTargetTeam(null)}
        title={`Delete "${deleteTargetTeam?.name || 'Team'}"?`}
        description="This permanently disbands the team and removes all members and pending invitations/join requests. This action cannot be undone."
        confirmLabel="Delete Team"
        onConfirm={async () => {
          if (!deleteTargetTeam) return;
          await dataStore.deleteTeam(deleteTargetTeam.id);
          showToast(`Deleted "${deleteTargetTeam.name}"`);
          if (selectedTeamId === deleteTargetTeam.id) setSelectedTeamId(null);
          await loadAll();
        }}
      />

      <InviteStudentModal
        isOpen={Boolean(inviteTargetStudent)}
        onClose={() => setInviteTargetStudent(null)}
        targetStudent={inviteTargetStudent}
        ledTeams={ledTeams}
        onInvite={async (teamId, proposedRole, message) => {
          if (!inviteTargetStudent) return;
          await dataStore.createRequest({
            type: 'invitation',
            team_id: teamId,
            sender_id: profile.id,
            recipient_id: inviteTargetStudent.id,
            proposed_role: proposedRole,
            message,
          });
          showToast(`Invitation sent to ${inviteTargetStudent.name}`);
          await loadAll();
        }}
      />
    </div>
  );
};
