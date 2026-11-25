import React, { useEffect, useState, useMemo } from 'react';
import {
  Compass,
  Search,
  Filter,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDataStore } from '../context/DataStoreContext';
import { useToast } from '../components/common/Toast';
import { Profile, Team } from '../shared/types';
import { ProfileCard } from '../components/profile/ProfileCard';
import { ProfileDetailModal } from '../components/profile/ProfileDetailModal';
import { TeamCard } from '../components/teams/TeamCard';
import { TeamDetailModal } from '../components/teams/TeamDetailModal';
import { InviteStudentModal } from '../components/teams/InviteStudentModal';
import { RequestJoinModal } from '../components/teams/RequestJoinModal';
import { CreateTeamModal } from '../components/teams/CreateTeamModal';
import { Button } from '../components/common/Button';

export const ExploreView: React.FC = () => {
  const { profile } = useAuth();
  const { dataStore } = useDataStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'students' | 'teams'>('students');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [openRolesOnly, setOpenRolesOnly] = useState(false);

  // Modal states
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [inviteTarget, setInviteTarget] = useState<Profile | null>(null);
  const [joinTargetTeam, setJoinTargetTeam] = useState<Team | null>(null);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);

  // User's own teams (for invite dropdown)
  const [userTeams, setUserTeams] = useState<Team[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allProfs, allTeams] = await Promise.all([
        dataStore.getProfiles(),
        dataStore.getTeams(),
      ]);
      setProfiles(allProfs);
      setTeams(allTeams);

      if (profile) {
        const myLedTeams = allTeams.filter(
          (t) => t.creator_id === profile.id || (t.members && t.members.some((m) => m.user_id === profile.id))
        );
        setUserTeams(myLedTeams);
      }
    } catch (err) {
      console.error('Failed to load explore data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile?.id, dataStore]);

  // Extract unique departments and skills for filter dropdowns
  const departments = useMemo(() => {
    const set = new Set<string>();
    for (const p of profiles) {
      if (p.department) set.add(p.department);
    }
    return Array.from(set).sort();
  }, [profiles]);

  const allSkills = useMemo(() => {
    const set = new Set<string>();
    for (const p of profiles) {
      for (const s of p.skills || []) {
        set.add(s.name);
      }
    }
    for (const t of teams) {
      for (const s of t.required_skills || []) {
        set.add(s);
      }
    }
    return Array.from(set).sort();
  }, [profiles, teams]);

  const domains = useMemo(() => {
    const set = new Set<string>();
    for (const t of teams) {
      if (t.project_domain) set.add(t.project_domain);
    }
    return Array.from(set).sort();
  }, [teams]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return profiles.filter((p) => {
      // Exclude current user from explore peer list
      if (profile && p.id === profile.id) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchCollege = p.college.toLowerCase().includes(q);
        const matchDept = p.department.toLowerCase().includes(q);
        const matchBio = p.bio.toLowerCase().includes(q);
        const matchSkill = p.skills.some((s) => s.name.toLowerCase().includes(q));
        const matchDomain = (p.preferred_domains || []).some((d) => d.toLowerCase().includes(q));
        if (!matchName && !matchCollege && !matchDept && !matchBio && !matchSkill && !matchDomain) {
          return false;
        }
      }

      // Department filter
      if (selectedDepartment !== 'all' && p.department !== selectedDepartment) {
        return false;
      }

      // Year filter
      if (selectedYear !== 'all' && p.year !== Number(selectedYear)) {
        return false;
      }

      // Skill filter
      if (selectedSkill && !p.skills.some((s) => s.name.toLowerCase() === selectedSkill.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [profiles, searchQuery, selectedDepartment, selectedYear, selectedSkill, profile]);

  // Filtered Teams
  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = t.name.toLowerCase().includes(q);
        const matchDesc = t.description.toLowerCase().includes(q);
        const matchDomain = t.project_domain.toLowerCase().includes(q);
        const matchSkill = (t.required_skills || []).some((s) => s.toLowerCase().includes(q));
        const matchRole = (t.open_roles || []).some((r) => r.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchDomain && !matchSkill && !matchRole) {
          return false;
        }
      }

      // Domain filter
      if (selectedDomain !== 'all' && t.project_domain !== selectedDomain) {
        return false;
      }

      // Skill filter
      if (
        selectedSkill &&
        !t.required_skills.some((s) => s.toLowerCase() === selectedSkill.toLowerCase())
      ) {
        return false;
      }

      // Open roles only
      if (openRolesOnly && (!t.open_roles || t.open_roles.length === 0)) {
        return false;
      }

      return true;
    });
  }, [teams, searchQuery, selectedDomain, selectedSkill, openRolesOnly]);

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
  };

  const handleCreateTeam = async (teamData: any) => {
    const created = await dataStore.createTeam(teamData);
    showToast(`Team "${created.name}" created!`, 'success');
    loadData();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-6 h-6 text-accent" />
            <h1 className="text-2xl sm:text-3xl font-serif font-medium text-text">
              Explore Campus Talent & Teams
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-text-muted max-w-xl leading-relaxed">
            Discover fellow student engineers by technical stack, academic year, and domain,
            or browse active teams looking for contributors.
          </p>
        </div>

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

      {/* Segmented Sub-Tab Switcher */}
      <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-surface-subtle rounded-pill border border-border">
          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`px-4 py-1.5 rounded-pill text-xs font-sans font-medium transition-colors ${
              activeTab === 'students'
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Students ({filteredStudents.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-1.5 rounded-pill text-xs font-sans font-medium transition-colors ${
              activeTab === 'teams'
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Teams ({filteredTeams.length})
          </button>
        </div>

        <span className="text-xs text-text-muted hidden sm:inline">
          {activeTab === 'students'
            ? 'Connect with peers looking to collaborate'
            : 'Find open project teams and submit join requests'}
        </span>
      </div>

      {/* Universal Search & Faceted Filter Bar */}
      <div className="p-4 rounded-card bg-surface border border-border space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'students'
                ? 'Search students by name, college, skill (e.g. React, PyTorch), domain...'
                : 'Search teams by project name, description, required stack, open roles...'
            }
            className="w-full pl-9 pr-4 py-2 rounded-pill bg-surface-subtle border border-border text-xs sm:text-sm text-text placeholder:text-text-muted/60 outline-none focus:border-accent"
          />
        </div>

        {/* Faceted Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
          <div className="flex items-center gap-1 text-text-muted text-[11px] uppercase tracking-wider font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Department Filter (Students only) */}
          {activeTab === 'students' && (
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-1.5 rounded-pill bg-surface-subtle border border-border text-text text-xs outline-none focus:border-accent cursor-pointer"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          )}

          {/* Academic Year Filter (Students only) */}
          {activeTab === 'students' && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 rounded-pill bg-surface-subtle border border-border text-text text-xs outline-none focus:border-accent cursor-pointer"
            >
              <option value="all">All Years</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </select>
          )}

          {/* Project Domain Filter (Teams only) */}
          {activeTab === 'teams' && (
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="px-3 py-1.5 rounded-pill bg-surface-subtle border border-border text-text text-xs outline-none focus:border-accent cursor-pointer"
            >
              <option value="all">All Project Domains</option>
              {domains.map((dom) => (
                <option key={dom} value={dom}>
                  {dom}
                </option>
              ))}
            </select>
          )}

          {/* Technical Skill Filter (Both) */}
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="px-3 py-1.5 rounded-pill bg-surface-subtle border border-border text-text text-xs outline-none focus:border-accent cursor-pointer"
          >
            <option value="">All Skills</option>
            {allSkills.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Open Roles Only Toggle (Teams only) */}
          {activeTab === 'teams' && (
            <label className="flex items-center gap-2 cursor-pointer bg-surface-subtle px-3 py-1.5 rounded-pill border border-border text-text">
              <input
                type="checkbox"
                checked={openRolesOnly}
                onChange={(e) => setOpenRolesOnly(e.target.checked)}
                className="accent-accent"
              />
              <span className="text-xs">Looking for members only</span>
            </label>
          )}

          {/* Reset Filters button */}
          {(searchQuery ||
            selectedDepartment !== 'all' ||
            selectedYear !== 'all' ||
            selectedSkill ||
            selectedDomain !== 'all' ||
            openRolesOnly) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedDepartment('all');
                setSelectedYear('all');
                setSelectedSkill('');
                setSelectedDomain('all');
                setOpenRolesOnly(false);
              }}
              className="text-xs text-accent hover:underline ml-auto"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'students' ? (
        filteredStudents.length === 0 ? (
          <div className="py-16 text-center text-text-muted space-y-2 bg-surface rounded-card border border-border">
            <h4 className="font-serif text-lg text-text">No students found matching your criteria</h4>
            <p className="text-xs max-w-sm mx-auto">
              Try adjusting your search terms, changing the department filter, or clearing selected skills.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((st) => (
              <ProfileCard
                key={st.id}
                profile={st}
                onViewDetails={(p) => setSelectedProfile(p)}
                onInvite={(p) => setInviteTarget(p)}
              />
            ))}
          </div>
        )
      ) : filteredTeams.length === 0 ? (
        <div className="py-16 text-center text-text-muted space-y-2 bg-surface rounded-card border border-border">
          <h4 className="font-serif text-lg text-text">No teams found</h4>
          <p className="text-xs max-w-sm mx-auto">
            Try broadening your search query or creating your own team to start recruiting collaborators.
          </p>
          <div className="pt-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateTeamOpen(true)}
            >
              Create Team
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => {
            const isMember =
              team.creator_id === profile?.id ||
              (team.members && team.members.some((m) => m.user_id === profile?.id));
            const isLead = team.creator_id === profile?.id;

            return (
              <TeamCard
                key={team.id}
                team={team}
                currentUserId={profile?.id || ''}
                isMember={isMember}
                isLead={isLead}
                onViewDetails={(t) => setSelectedTeam(t)}
                onRequestJoin={(t) => setJoinTargetTeam(t)}
              />
            );
          })}
        </div>
      )}

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
        isMember={
          selectedTeam?.creator_id === profile?.id ||
          selectedTeam?.members?.some((m) => m.user_id === profile?.id)
        }
        isLead={selectedTeam?.creator_id === profile?.id}
        onInviteMember={() => {
          setSelectedTeam(null);
        }}
        onRequestJoin={(t) => setJoinTargetTeam(t)}
        onViewMemberProfile={(p) => setSelectedProfile(p)}
      />

      <InviteStudentModal
        isOpen={Boolean(inviteTarget)}
        onClose={() => setInviteTarget(null)}
        targetStudent={inviteTarget}
        userTeams={userTeams}
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
