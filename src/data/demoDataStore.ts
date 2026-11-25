import { DataStore, UserRequestsSummary } from './dataStore.interface';
import {
  CampusEvent,
  Profile,
  ProjectPost,
  Team,
  TeamMember,
  TeamMilestone,
  TeamRequest,
  TeamUpdate,
} from '../shared/types';
import {
  SEED_EVENTS,
  SEED_MILESTONES,
  SEED_POSTS,
  SEED_PROFILES,
  SEED_REQUESTS,
  SEED_TEAMS,
  SEED_TEAM_MEMBERS,
  SEED_TEAM_UPDATES,
} from './seedData';

const STORAGE_KEYS = {
  PROFILES: 'cc_profiles_v3',
  TEAMS: 'cc_teams_v3',
  TEAM_MEMBERS: 'cc_team_members_v3',
  REQUESTS: 'cc_requests_v3',
  EVENTS: 'cc_events_v3',
  POSTS: 'cc_posts_v3',
  MILESTONES: 'cc_milestones_v3',
  TEAM_UPDATES: 'cc_team_updates_v3',
};

export class DemoDataStore implements DataStore {
  readonly isDemo = true;
  private memoryStore = new Map<string, string>();

  constructor() {
    this.initIfEmpty();
  }

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        const data = window.localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
      }
      const mem = this.memoryStore.get(key);
      return mem ? JSON.parse(mem) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        window.localStorage.setItem(key, serialized);
      }
      this.memoryStore.set(key, serialized);
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  private initIfEmpty() {
    const hasData =
      typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
        ? Boolean(window.localStorage.getItem(STORAGE_KEYS.PROFILES))
        : this.memoryStore.has(STORAGE_KEYS.PROFILES);

    if (!hasData) {
      this.resetData();
    }
  }

  resetData(): void {
    this.setItem(STORAGE_KEYS.PROFILES, SEED_PROFILES);
    this.setItem(STORAGE_KEYS.TEAMS, SEED_TEAMS);
    this.setItem(STORAGE_KEYS.TEAM_MEMBERS, SEED_TEAM_MEMBERS);
    this.setItem(STORAGE_KEYS.REQUESTS, SEED_REQUESTS);
    this.setItem(STORAGE_KEYS.EVENTS, SEED_EVENTS);
    this.setItem(STORAGE_KEYS.POSTS, SEED_POSTS);
    this.setItem(STORAGE_KEYS.MILESTONES, SEED_MILESTONES);
    this.setItem(STORAGE_KEYS.TEAM_UPDATES, SEED_TEAM_UPDATES);
  }

  // --- Profiles ---
  async getProfiles(): Promise<Profile[]> {
    return this.getItem<Profile[]>(STORAGE_KEYS.PROFILES, SEED_PROFILES);
  }

  async getProfile(id: string): Promise<Profile | null> {
    const profiles = await this.getProfiles();
    return profiles.find((p) => p.id === id) || null;
  }

  async updateProfile(profileUpdates: Partial<Profile> & { id: string }): Promise<Profile> {
    const profiles = await this.getProfiles();
    const index = profiles.findIndex((p) => p.id === profileUpdates.id);

    if (index === -1) {
      const newProfile: Profile = {
        name: 'New Student',
        college: 'Engineering College',
        department: 'Computer Science',
        year: 1,
        bio: '',
        skills: [],
        interests: [],
        learning_goals: [],
        preferred_domains: [],
        weekly_availability: 10,
        created_at: new Date().toISOString(),
        ...profileUpdates,
      };
      profiles.push(newProfile);
      this.setItem(STORAGE_KEYS.PROFILES, profiles);
      return newProfile;
    }

    const updated = {
      ...profiles[index],
      ...profileUpdates,
    };
    profiles[index] = updated;
    this.setItem(STORAGE_KEYS.PROFILES, profiles);
    return updated;
  }

  // --- Teams & Members ---
  async getTeams(): Promise<Team[]> {
    const teams = this.getItem<Team[]>(STORAGE_KEYS.TEAMS, SEED_TEAMS);
    const members = this.getItem<TeamMember[]>(STORAGE_KEYS.TEAM_MEMBERS, SEED_TEAM_MEMBERS);
    const profiles = await this.getProfiles();

    return teams.map((team) => {
      const teamMems = members
        .filter((m) => m.team_id === team.id)
        .map((m) => ({
          ...m,
          profile: profiles.find((p) => p.id === m.user_id),
        }));

      return {
        ...team,
        members_count: teamMems.length,
        members: teamMems,
      };
    });
  }

  async getTeam(id: string): Promise<Team | null> {
    const teams = await this.getTeams();
    return teams.find((t) => t.id === id) || null;
  }

  async createTeam(teamData: {
    name: string;
    description: string;
    logo_url?: string;
    creator_id: string;
    project_domain: string;
    required_skills: string[];
    open_roles: string[];
    visibility: 'open' | 'invite_only';
    initial_member_role?: string;
  }): Promise<Team> {
    const teams = this.getItem<Team[]>(STORAGE_KEYS.TEAMS, SEED_TEAMS);
    const newTeamId = `team-${Date.now()}`;

    const newTeam: Team = {
      id: newTeamId,
      name: teamData.name,
      description: teamData.description,
      logo_url: teamData.logo_url,
      creator_id: teamData.creator_id,
      project_domain: teamData.project_domain,
      required_skills: teamData.required_skills,
      open_roles: teamData.open_roles,
      visibility: teamData.visibility,
      created_at: new Date().toISOString(),
      members_count: 1,
    };

    teams.unshift(newTeam);
    this.setItem(STORAGE_KEYS.TEAMS, teams);

    const members = this.getItem<TeamMember[]>(STORAGE_KEYS.TEAM_MEMBERS, SEED_TEAM_MEMBERS);
    const leadMember: TeamMember = {
      id: `tm-${Date.now()}`,
      team_id: newTeamId,
      user_id: teamData.creator_id,
      role: teamData.initial_member_role || 'Team Lead',
      joined_at: new Date().toISOString(),
    };
    members.push(leadMember);
    this.setItem(STORAGE_KEYS.TEAM_MEMBERS, members);

    return (await this.getTeam(newTeamId)) || newTeam;
  }

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team> {
    const teams = this.getItem<Team[]>(STORAGE_KEYS.TEAMS, SEED_TEAMS);
    const index = teams.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Team with ID ${id} not found`);

    teams[index] = { ...teams[index], ...updates };
    this.setItem(STORAGE_KEYS.TEAMS, teams);
    return (await this.getTeam(id)) || teams[index];
  }

  async deleteTeam(id: string): Promise<void> {
    const teams = this.getItem<Team[]>(STORAGE_KEYS.TEAMS, SEED_TEAMS).filter((t) => t.id !== id);
    this.setItem(STORAGE_KEYS.TEAMS, teams);

    const members = this.getItem<TeamMember[]>(STORAGE_KEYS.TEAM_MEMBERS, SEED_TEAM_MEMBERS).filter(
      (m) => m.team_id !== id
    );
    this.setItem(STORAGE_KEYS.TEAM_MEMBERS, members);
  }

  async leaveTeam(teamId: string, userId: string): Promise<void> {
    const members = this.getItem<TeamMember[]>(STORAGE_KEYS.TEAM_MEMBERS, SEED_TEAM_MEMBERS).filter(
      (m) => !(m.team_id === teamId && m.user_id === userId)
    );
    this.setItem(STORAGE_KEYS.TEAM_MEMBERS, members);
  }

  async removeMember(teamId: string, userId: string): Promise<void> {
    await this.leaveTeam(teamId, userId);
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const members = this.getItem<TeamMember[]>(STORAGE_KEYS.TEAM_MEMBERS, SEED_TEAM_MEMBERS);
    const profiles = await this.getProfiles();

    return members
      .filter((m) => m.team_id === teamId)
      .map((m) => ({
        ...m,
        profile: profiles.find((p) => p.id === m.user_id),
      }));
  }

  // --- Invitations & Join Requests ---
  async getRequests(): Promise<TeamRequest[]> {
    const requests = this.getItem<TeamRequest[]>(STORAGE_KEYS.REQUESTS, SEED_REQUESTS);
    const teams = this.getItem<Team[]>(STORAGE_KEYS.TEAMS, SEED_TEAMS);
    const profiles = await this.getProfiles();

    return requests.map((req) => ({
      ...req,
      team: teams.find((t) => t.id === req.team_id),
      sender_profile: profiles.find((p) => p.id === req.sender_id),
      recipient_profile: profiles.find((p) => p.id === req.recipient_id),
    }));
  }

  async getRequestsForUser(userId: string): Promise<UserRequestsSummary> {
    const all = await this.getRequests();

    const incomingInvites = all.filter(
      (r) => r.type === 'invitation' && r.recipient_id === userId
    );
    const outgoingInvites = all.filter(
      (r) => r.type === 'invitation' && r.sender_id === userId
    );
    const incomingJoinRequests = all.filter(
      (r) => r.type === 'join_request' && r.recipient_id === userId
    );
    const outgoingJoinRequests = all.filter(
      (r) => r.type === 'join_request' && r.sender_id === userId
    );

    return {
      incomingInvites,
      outgoingInvites,
      incomingJoinRequests,
      outgoingJoinRequests,
    };
  }

  async hasPendingRequest(
    teamId: string,
    senderId: string,
    recipientId: string,
    type: 'invitation' | 'join_request'
  ): Promise<boolean> {
    const requests = this.getItem<TeamRequest[]>(STORAGE_KEYS.REQUESTS, SEED_REQUESTS);
    return requests.some(
      (r) =>
        r.team_id === teamId &&
        r.sender_id === senderId &&
        r.recipient_id === recipientId &&
        r.type === type &&
        r.status === 'pending'
    );
  }

  async createRequest(request: {
    type: 'invitation' | 'join_request';
    team_id: string;
    sender_id: string;
    recipient_id: string;
    role?: string;
    message?: string;
  }): Promise<TeamRequest> {
    const requests = this.getItem<TeamRequest[]>(STORAGE_KEYS.REQUESTS, SEED_REQUESTS);

    const alreadyPending = requests.some(
      (r) =>
        r.team_id === request.team_id &&
        r.sender_id === request.sender_id &&
        r.recipient_id === request.recipient_id &&
        r.type === request.type &&
        r.status === 'pending'
    );

    if (alreadyPending) {
      throw new Error(`A pending ${request.type.replace('_', ' ')} already exists for this team.`);
    }

    const newReq: TeamRequest = {
      id: `req-${Date.now()}`,
      type: request.type,
      team_id: request.team_id,
      sender_id: request.sender_id,
      recipient_id: request.recipient_id,
      role: request.role,
      message: request.message,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    requests.unshift(newReq);
    this.setItem(STORAGE_KEYS.REQUESTS, requests);

    const hydrated = (await this.getRequests()).find((r) => r.id === newReq.id);
    return hydrated || newReq;
  }

  async updateRequestStatus(
    requestId: string,
    status: 'accepted' | 'rejected' | 'cancelled'
  ): Promise<TeamRequest> {
    const requests = this.getItem<TeamRequest[]>(STORAGE_KEYS.REQUESTS, SEED_REQUESTS);
    const index = requests.findIndex((r) => r.id === requestId);
    if (index === -1) throw new Error(`Request ${requestId} not found`);

    const req = requests[index];
    const updated: TeamRequest = {
      ...req,
      status,
      updated_at: new Date().toISOString(),
    };
    requests[index] = updated;
    this.setItem(STORAGE_KEYS.REQUESTS, requests);

    if (status === 'accepted') {
      const members = this.getItem<TeamMember[]>(STORAGE_KEYS.TEAM_MEMBERS, SEED_TEAM_MEMBERS);
      const targetUserId = req.type === 'invitation' ? req.recipient_id : req.sender_id;

      const alreadyMember = members.some(
        (m) => m.team_id === req.team_id && m.user_id === targetUserId
      );

      if (!alreadyMember) {
        const newMember: TeamMember = {
          id: `tm-${Date.now()}`,
          team_id: req.team_id,
          user_id: targetUserId,
          role: req.role || 'Teammate',
          joined_at: new Date().toISOString(),
        };
        members.push(newMember);
        this.setItem(STORAGE_KEYS.TEAM_MEMBERS, members);
      }
    }

    const hydrated = (await this.getRequests()).find((r) => r.id === requestId);
    return hydrated || updated;
  }

  // --- Events ---
  async getEvents(): Promise<CampusEvent[]> {
    return this.getItem<CampusEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
  }

  async getEvent(id: string): Promise<CampusEvent | null> {
    const events = await this.getEvents();
    return events.find((e) => e.id === id) || null;
  }

  async createEvent(event: Omit<CampusEvent, 'id' | 'created_at'>): Promise<CampusEvent> {
    const events = this.getItem<CampusEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS);
    const newEvent: CampusEvent = {
      ...event,
      id: `event-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    events.unshift(newEvent);
    this.setItem(STORAGE_KEYS.EVENTS, events);
    return newEvent;
  }

  // --- Project Showcase Feed ---
  async getPosts(): Promise<ProjectPost[]> {
    return this.getItem<ProjectPost[]>(STORAGE_KEYS.POSTS, SEED_POSTS);
  }

  async getPost(id: string): Promise<ProjectPost | null> {
    const posts = await this.getPosts();
    return posts.find((p) => p.id === id) || null;
  }

  async createPost(
    post: Omit<ProjectPost, 'id' | 'upvotes' | 'comments_count' | 'created_at'>
  ): Promise<ProjectPost> {
    const posts = this.getItem<ProjectPost[]>(STORAGE_KEYS.POSTS, SEED_POSTS);
    const newPost: ProjectPost = {
      ...post,
      id: `post-${Date.now()}`,
      upvotes: [],
      comments_count: 0,
      created_at: new Date().toISOString(),
    };
    posts.unshift(newPost);
    this.setItem(STORAGE_KEYS.POSTS, posts);
    return newPost;
  }

  async toggleUpvote(postId: string, userId: string): Promise<ProjectPost> {
    const posts = this.getItem<ProjectPost[]>(STORAGE_KEYS.POSTS, SEED_POSTS);
    const index = posts.findIndex((p) => p.id === postId);
    if (index === -1) throw new Error(`Post ${postId} not found`);

    const post = posts[index];
    const hasUpvoted = post.upvotes.includes(userId);
    const nextUpvotes = hasUpvoted
      ? post.upvotes.filter((uid) => uid !== userId)
      : [...post.upvotes, userId];

    const updated: ProjectPost = {
      ...post,
      upvotes: nextUpvotes,
    };
    posts[index] = updated;
    this.setItem(STORAGE_KEYS.POSTS, posts);
    return updated;
  }

  // --- Team Workspace (Milestones & Updates) ---
  async getMilestones(teamId: string): Promise<TeamMilestone[]> {
    const all = this.getItem<TeamMilestone[]>(STORAGE_KEYS.MILESTONES, SEED_MILESTONES);
    return all.filter((m) => m.team_id === teamId);
  }

  async addMilestone(
    milestone: Omit<TeamMilestone, 'id' | 'completed' | 'completed_at'>
  ): Promise<TeamMilestone> {
    const all = this.getItem<TeamMilestone[]>(STORAGE_KEYS.MILESTONES, SEED_MILESTONES);
    const newMilestone: TeamMilestone = {
      ...milestone,
      id: `m-${Date.now()}`,
      completed: false,
    };
    all.push(newMilestone);
    this.setItem(STORAGE_KEYS.MILESTONES, all);
    return newMilestone;
  }

  async toggleMilestone(milestoneId: string): Promise<TeamMilestone> {
    const all = this.getItem<TeamMilestone[]>(STORAGE_KEYS.MILESTONES, SEED_MILESTONES);
    const index = all.findIndex((m) => m.id === milestoneId);
    if (index === -1) throw new Error(`Milestone ${milestoneId} not found`);

    const current = all[index];
    const completed = !current.completed;
    const updated: TeamMilestone = {
      ...current,
      completed,
      completed_at: completed ? new Date().toISOString() : undefined,
    };
    all[index] = updated;
    this.setItem(STORAGE_KEYS.MILESTONES, all);
    return updated;
  }

  async deleteMilestone(milestoneId: string): Promise<void> {
    const all = this.getItem<TeamMilestone[]>(STORAGE_KEYS.MILESTONES, SEED_MILESTONES);
    this.setItem(
      STORAGE_KEYS.MILESTONES,
      all.filter((m) => m.id !== milestoneId)
    );
  }

  async getTeamUpdates(teamId: string): Promise<TeamUpdate[]> {
    const all = this.getItem<TeamUpdate[]>(STORAGE_KEYS.TEAM_UPDATES, SEED_TEAM_UPDATES);
    return all.filter((u) => u.team_id === teamId);
  }

  async createTeamUpdate(
    update: Omit<TeamUpdate, 'id' | 'created_at'>
  ): Promise<TeamUpdate> {
    const all = this.getItem<TeamUpdate[]>(STORAGE_KEYS.TEAM_UPDATES, SEED_TEAM_UPDATES);
    const newUpdate: TeamUpdate = {
      ...update,
      id: `upd-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    all.unshift(newUpdate);
    this.setItem(STORAGE_KEYS.TEAM_UPDATES, all);
    return newUpdate;
  }
}
