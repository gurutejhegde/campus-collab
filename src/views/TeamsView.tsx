import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Users,
  Plus,
  Lock,
  Globe,
  Sparkles,
  Settings,
  LogOut,
  Trash2,
  UserPlus,
  Inbox,
  Target,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDataStore } from '../context/DataStoreContext';
import { useToast } from '../components/common/Toast';
import { Profile, Team, TeamRequest } from '../shared/types';
import { PillTag } from '../components/common/PillTag';
import { Button } from '../components/common/Button';
import { CreateTeamModal } from '../components/teams/CreateTeamModal';
import { InviteStudentModal } from '../components/teams/InviteStudentModal';
import { ProfileDetailModal } from '../components/profile/ProfileDetailModal';
import { Modal } from '../components/common/Modal';
import { SimpleTagInput } from '../components/profile/SimpleTagInput';
import { TeamWorkspace } from '../components/teams/TeamWorkspace';

export const TeamsView: React.FC = () => {
  const { teamId } = useParams<{ teamId?: string }>();
  const { profile, allProfiles } = useAuth();
  const { dataStore } = useDataStore();
  const { showToast } = useToast();

  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [teamRequests, setTeamRequests] = useState<TeamRequest[]>([]);
  const [teamTab, setTeamTab] = useState<'overview' | 'workspace'>('overview');
  const [, setLoading] = useState(true);

  // Modals
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteTargetStudent, setInviteTargetStudent] = useState<Profile | null>(null);
  const [selectedMemberProfile, setSelectedMemberProfile] = useState<Profile | null>(null);

  // Edit Team state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLogo, setEditLogo] = useState('');
  const [editDomain, setEditDomain] = useState('');
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [editVisibility, setEditVisibility] = useState<'open' | 'invite_only'>('open');

  const loadTeamsData = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const teams = await dataStore.getTeams();
      setAllTeams(teams);

      // Requests for user
      const reqs = await dataStore.getRequestsForUser(profile.id);
      setTeamRequests(reqs.incomingJoinRequests.filter((r) => r.status === 'pending'));

      // Determine active team ID
      if (teamId) {
        setSelectedTeamId(teamId);
      } else if (!selectedTeamId && teams.length > 0) {
        // Find team user created or belongs to, else first team
        const myTeam = teams.find(
          (t) =>
            t.creator_id === profile.id ||
            (t.members && t.members.some((m) => m.user_id === profile.id))
        );
        setSelectedTeamId(myTeam ? myTeam.id : teams[0].id);
      }
    } catch (err) {
      console.error('Failed to load teams data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamsData();
  }, [profile?.id, teamId, dataStore]);

  // Current active team
  const activeTeam = useMemo(() => {
    return allTeams.find((t) => t.id === selectedTeamId) || allTeams[0] || null;
  }, [allTeams, selectedTeamId]);

  const isLead = activeTeam?.creator_id === profile?.id;
  const isMember =
    activeTeam?.creator_id === profile?.id ||
    Boolean(activeTeam?.members && activeTeam.members.some((m) => m.user_id === profile?.id));

  // Pending join requests specifically for active team
  const activeTeamPendingRequests = useMemo(() => {
    if (!activeTeam) return [];
    return teamRequests.filter((r) => r.team_id === activeTeam.id);
  }, [teamRequests, activeTeam]);

  // Teams where user is member or lead
  const userTeams = useMemo(() => {
    if (!profile) return [];
    return allTeams.filter(
      (t) =>
        t.creator_id === profile.id ||
        (t.members && t.members.some((m) => m.user_id === profile.id))
    );
  }, [allTeams, profile]);

  const handleCreateTeam = async (teamData: any) => {
    const created = await dataStore.createTeam(teamData);
    showToast(`Team "${created.name}" created!`, 'success');
    await loadTeamsData();
    setSelectedTeamId(created.id);
  };

  const handleOpenEdit = () => {
    if (!activeTeam) return;
    setEditName(activeTeam.name);
    setEditDesc(activeTeam.description);
    setEditLogo(activeTeam.logo_url || '');
    setEditDomain(activeTeam.project_domain);
    setEditSkills(activeTeam.required_skills || []);
    setEditRoles(activeTeam.open_roles || []);
    setEditVisibility(activeTeam.visibility);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeam) return;

    try {
      await dataStore.updateTeam(activeTeam.id, {
        name: editName.trim(),
        description: editDesc.trim(),
        logo_url: editLogo.trim() || undefined,
        project_domain: editDomain,
        required_skills: editSkills,
        open_roles: editRoles,
        visibility: editVisibility,
      });

      showToast('Team settings updated successfully!', 'success');
      setIsEditModalOpen(false);
      loadTeamsData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update team', 'error');
    }
  };

  const handleLeaveTeam = async () => {
    if (!activeTeam || !profile) return;
    if (confirm(`Are you sure you want to leave ${activeTeam.name}?`)) {
      try {
        await dataStore.leaveTeam(activeTeam.id, profile.id);
        showToast(`You have left ${activeTeam.name}.`, 'info');
        loadTeamsData();
      } catch (err: any) {
        showToast(err.message || 'Failed to leave team', 'error');
      }
    }
  };

  const handleDeleteTeam = async () => {
    if (!activeTeam) return;
    if (confirm(`Are you sure you want to delete ${activeTeam.name}? This cannot be undone.`)) {
      try {
        await dataStore.deleteTeam(activeTeam.id);
        showToast(`Team "${activeTeam.name}" deleted.`, 'info');
        setSelectedTeamId(null);
        loadTeamsData();
      } catch (err: any) {
        showToast(err.message || 'Failed to delete team', 'error');
      }
    }
  };

  const handleRemoveMember = async (userId: string, memberName: string) => {
    if (!activeTeam) return;
    if (confirm(`Remove ${memberName} from ${activeTeam.name}?`)) {
      try {
        await dataStore.removeMember(activeTeam.id, userId);
        showToast(`${memberName} removed from team.`, 'info');
        loadTeamsData();
      } catch (err: any) {
        showToast(err.message || 'Failed to remove member', 'error');
      }
    }
  };

  const handleAcceptRequest = async (reqId: string) => {
    try {
      await dataStore.updateRequestStatus(reqId, 'accepted');
      showToast('Student accepted and added to team roster!', 'success');
      loadTeamsData();
    } catch (err: any) {
      showToast(err.message || 'Failed to accept request', 'error');
    }
  };

  const handleRejectRequest = async (reqId: string) => {
    try {
      await dataStore.updateRequestStatus(reqId, 'rejected');
      showToast('Join request declined.', 'info');
      loadTeamsData();
    } catch (err: any) {
      showToast(err.message || 'Failed to decline request', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-6 h-6 text-accent" />
            <h1 className="text-2xl sm:text-3xl font-serif font-medium text-text">
              Team Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-text-muted">
            Manage your project rosters, invite talented collaborators, and respond to join requests.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateTeamOpen(true)}
        >
          Create New Team
        </Button>
      </div>

      {allTeams.length === 0 ? (
        <div className="py-20 text-center text-text-muted space-y-3 bg-surface rounded-card border border-border">
          <Users className="w-10 h-10 text-accent/60 mx-auto" />
          <h3 className="font-serif text-xl text-text">No Teams Created Yet</h3>
          <p className="text-xs max-w-sm mx-auto">
            Create your first team for a hackathon, final-year project, or research build.
          </p>
          <div className="pt-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateTeamOpen(true)}
            >
              Create Team
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Team Selector List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center justify-between px-1">
              <span>All Active Teams ({allTeams.length})</span>
            </div>

            <div className="space-y-2">
              {allTeams.map((team) => {
                const isSelected = team.id === selectedTeamId;
                const isUserLead = team.creator_id === profile?.id;
                const isUserMem =
                  isUserLead ||
                  Boolean(team.members && team.members.some((m) => m.user_id === profile?.id));

                return (
                  <div
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`p-3.5 rounded-card border cursor-pointer transition-all duration-smooth ${
                      isSelected
                        ? 'bg-surface border-accent shadow-sm'
                        : 'bg-surface border-border hover:border-text-muted/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-card bg-accent/10 border border-accent/25 text-accent font-semibold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                          {team.logo_url ? (
                            <img
                              src={team.logo_url}
                              alt={team.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            team.name.slice(0, 2).toUpperCase()
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-serif font-medium text-sm text-text">
                              {team.name}
                            </h4>
                            {isUserLead && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-sans font-semibold bg-accent/15 text-accent uppercase">
                                Lead
                              </span>
                            )}
                            {isUserMem && !isUserLead && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-sans font-medium bg-surface-subtle text-text">
                                Member
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-text-muted truncate max-w-[180px]">
                            {team.project_domain}
                          </p>
                        </div>
                      </div>

                      <span className="text-[11px] text-text-muted px-2 py-0.5 rounded-full bg-surface-subtle border border-border shrink-0">
                        {team.members_count || 1} members
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Team Detail & Management (8 cols) */}
          {activeTeam && (
            <div className="lg:col-span-8 space-y-6">
              {/* Team View Mode Switcher */}
              <div className="flex items-center gap-2 p-1 rounded-lg bg-surface border border-border w-fit">
                <button
                  type="button"
                  onClick={() => setTeamTab('overview')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    teamTab === 'overview'
                      ? 'bg-accent/15 text-accent border border-accent/30 font-semibold shadow-glow'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-accent" />
                  <span>Overview & Roster</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTeamTab('workspace')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    teamTab === 'workspace'
                      ? 'bg-accent/15 text-accent border border-accent/30 font-semibold shadow-glow'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  <Target className="w-3.5 h-3.5 text-accent" />
                  <span>Collaborative Workspace & Milestones</span>
                </button>
              </div>

              {teamTab === 'workspace' ? (
                <TeamWorkspace
                  teamId={activeTeam.id}
                  teamName={activeTeam.name}
                  isMember={isMember}
                />
              ) : (
                <>
                  {/* Team Master Card */}
                  <div className="bg-surface border border-border rounded-card p-6 space-y-5 shadow-sm">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-card bg-accent/10 border border-accent/25 text-accent font-semibold text-xl flex items-center justify-center shrink-0 overflow-hidden">
                      {activeTeam.logo_url ? (
                        <img
                          src={activeTeam.logo_url}
                          alt={activeTeam.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        activeTeam.name.slice(0, 2).toUpperCase()
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif font-medium text-2xl text-text">
                          {activeTeam.name}
                        </h2>
                        <span
                          className={`px-2.5 py-0.5 rounded-pill text-[10px] font-sans font-medium flex items-center gap-1 border ${
                            activeTeam.visibility === 'open'
                              ? 'bg-success/10 text-success border-success/30'
                              : 'bg-surface-subtle text-text-muted border-border'
                          }`}
                        >
                          {activeTeam.visibility === 'open' ? (
                            <Globe className="w-3 h-3" />
                          ) : (
                            <Lock className="w-3 h-3" />
                          )}
                          <span>
                            {activeTeam.visibility === 'open' ? 'Open' : 'Invite-Only'}
                          </span>
                        </span>
                      </div>

                      <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-accent" />
                        <span>Domain: {activeTeam.project_domain}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions for Team */}
                  <div className="flex flex-wrap items-center gap-2">
                    {isLead && (
                      <>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          icon={<Settings className="w-3.5 h-3.5" />}
                          onClick={handleOpenEdit}
                        >
                          Edit
                        </Button>

                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          icon={<UserPlus className="w-3.5 h-3.5" />}
                          onClick={() => {
                            // Pick candidate to invite
                            const candidate = allProfiles.find((p) => p.id !== profile?.id);
                            setInviteTargetStudent(candidate || null);
                            setIsInviteOpen(true);
                          }}
                        >
                          Invite
                        </Button>

                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                          onClick={handleDeleteTeam}
                        >
                          Delete Team
                        </Button>
                      </>
                    )}

                    {isMember && !isLead && (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        icon={<LogOut className="w-3.5 h-3.5" />}
                        onClick={handleLeaveTeam}
                      >
                        Leave Team
                      </Button>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
                    Project Overview
                  </h4>
                  <p className="text-sm text-text leading-relaxed font-sans">
                    {activeTeam.description}
                  </p>
                </div>

                {/* Tech Stack & Open Roles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="p-3.5 rounded-card bg-surface-subtle/60 border border-border space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted block">
                      Required Tech Stack
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeTeam.required_skills && activeTeam.required_skills.length > 0 ? (
                        activeTeam.required_skills.map((s) => <PillTag key={s} label={s} />)
                      ) : (
                        <span className="text-xs text-text-muted italic">None listed</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-card bg-surface-subtle/60 border border-border space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-accent block">
                      Open Positions Looking For
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeTeam.open_roles && activeTeam.open_roles.length > 0 ? (
                        activeTeam.open_roles.map((r) => (
                          <span
                            key={r}
                            className="px-2.5 py-0.5 rounded-pill text-xs font-medium bg-accent/10 text-accent border border-accent/20"
                          >
                            {r}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-text-muted italic">
                          All roles currently filled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Incoming Join Requests for this Team (Lead only) */}
              {isLead && activeTeamPendingRequests.length > 0 && (
                <div className="p-5 rounded-card bg-surface border border-accent/30 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-accent" />
                    <h3 className="font-serif font-medium text-base text-text">
                      Pending Join Requests for this Team ({activeTeamPendingRequests.length})
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {activeTeamPendingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3.5 rounded-card bg-surface-subtle border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-text text-sm">
                              {req.sender_profile?.name || 'A Student'}
                            </span>
                            <span className="text-xs text-text-muted">
                              ({req.sender_profile?.department})
                            </span>
                          </div>
                          <p className="text-xs text-text-muted mt-0.5">
                            Applied for: <span className="font-medium text-text">{req.role || 'Member'}</span>
                          </p>
                          {req.message && (
                            <p className="text-xs text-text-muted italic mt-0.5">"{req.message}"</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {req.sender_profile && (
                            <Button
                              type="button"
                              variant="subtle"
                              size="sm"
                              onClick={() => setSelectedMemberProfile(req.sender_profile!)}
                            >
                              View Profile
                            </Button>
                          )}
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
                            Accept to Team
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Team Members Roster */}
              <div className="bg-surface border border-border rounded-card p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h3 className="font-serif font-medium text-lg text-text flex items-center gap-2">
                    <Users className="w-5 h-5 text-accent" />
                    <span>Team Roster ({activeTeam.members?.length || 1} members)</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {(activeTeam.members || []).map((member) => {
                    const prof = member.profile;
                    const isMemberLead = member.user_id === activeTeam.creator_id;
                    const isSelf = member.user_id === profile?.id;

                    return (
                      <div
                        key={member.id}
                        className="p-3.5 rounded-card bg-surface-subtle border border-border flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-accent/15 border border-accent/30 text-accent font-semibold text-sm flex items-center justify-center shrink-0 overflow-hidden">
                            {prof?.avatar_url ? (
                              <img
                                src={prof.avatar_url}
                                alt={prof.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (prof?.name || 'User').slice(0, 2).toUpperCase()
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-sans font-medium text-xs text-text truncate">
                                {prof?.name || 'Member'}
                              </span>
                              {isMemberLead && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-accent/15 text-accent border border-accent/25 uppercase font-semibold">
                                  Lead
                                </span>
                              )}
                              {isSelf && (
                                <span className="text-[10px] text-accent font-medium">(You)</span>
                              )}
                            </div>
                            <p className="text-[11px] text-text-muted truncate">
                              {member.role || 'Member'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {prof && (
                            <Button
                              type="button"
                              variant="subtle"
                              size="sm"
                              className="text-xs px-2.5 py-1"
                              onClick={() => setSelectedMemberProfile(prof)}
                            >
                              Profile
                            </Button>
                          )}

                          {isLead && !isMemberLead && (
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveMember(member.user_id, prof?.name || 'member')
                              }
                              className="p-1.5 rounded text-text-muted hover:text-danger transition-colors"
                              title="Remove member from team"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateTeamModal
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
        creatorId={profile?.id || 'user-ananya'}
        onCreateTeam={handleCreateTeam}
      />

      <InviteStudentModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        targetStudent={inviteTargetStudent}
        userTeams={userTeams}
        onSendInvitation={async (tId, role, msg) => {
          if (!profile || !inviteTargetStudent) return;
          await dataStore.createRequest({
            type: 'invitation',
            team_id: tId,
            sender_id: profile.id,
            recipient_id: inviteTargetStudent.id,
            role,
            message: msg,
          });
          showToast(`Invitation sent to ${inviteTargetStudent.name}!`, 'success');
        }}
      />

      <ProfileDetailModal
        profile={selectedMemberProfile}
        isOpen={Boolean(selectedMemberProfile)}
        onClose={() => setSelectedMemberProfile(null)}
      />

      {/* Edit Team Settings Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Team Settings"
          subtitle={activeTeam?.name}
          maxWidth="md"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text mb-1">Team Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-pill bg-surface border border-border text-sm text-text outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text mb-1">Description</label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2 rounded-card bg-surface border border-border text-sm text-text outline-none focus:border-accent resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text mb-1">Logo URL</label>
              <input
                type="url"
                value={editLogo}
                onChange={(e) => setEditLogo(e.target.value)}
                className="w-full px-3.5 py-2 rounded-pill bg-surface border border-border text-sm text-text outline-none focus:border-accent"
              />
            </div>

            <SimpleTagInput
              tags={editSkills}
              onChange={setEditSkills}
              label="Required Skills"
              placeholder="e.g. React, Python..."
            />

            <SimpleTagInput
              tags={editRoles}
              onChange={setEditRoles}
              label="Open Roles Looking For"
              placeholder="e.g. ML Engineer..."
              variant="accent"
            />

            <div className="pt-2 border-t border-border">
              <label className="block text-xs font-medium text-text mb-1.5">Visibility</label>
              <div className="flex gap-4 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="edit_vis"
                    checked={editVisibility === 'open'}
                    onChange={() => setEditVisibility('open')}
                    className="accent-accent"
                  />
                  <span>Open (anyone can submit join request)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="edit_vis"
                    checked={editVisibility === 'invite_only'}
                    onChange={() => setEditVisibility('invite_only')}
                    className="accent-accent"
                  />
                  <span>Invite-Only</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button type="button" variant="subtle" size="sm" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
