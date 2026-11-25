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

export interface UserRequestsSummary {
  incomingInvites: TeamRequest[];
  outgoingInvites: TeamRequest[];
  incomingJoinRequests: TeamRequest[];
  outgoingJoinRequests: TeamRequest[];
}

export interface DataStore {
  readonly isDemo: boolean;

  // Profiles
  getProfiles(): Promise<Profile[]>;
  getProfile(id: string): Promise<Profile | null>;
  updateProfile(profile: Partial<Profile> & { id: string }): Promise<Profile>;

  // Teams & Members
  getTeams(): Promise<Team[]>;
  getTeam(id: string): Promise<Team | null>;
  createTeam(teamData: {
    name: string;
    description: string;
    logo_url?: string;
    creator_id: string;
    project_domain: string;
    required_skills: string[];
    open_roles: string[];
    visibility: 'open' | 'invite_only';
    initial_member_role?: string;
  }): Promise<Team>;
  updateTeam(id: string, updates: Partial<Team>): Promise<Team>;
  deleteTeam(id: string): Promise<void>;
  leaveTeam(teamId: string, userId: string): Promise<void>;
  removeMember(teamId: string, userId: string): Promise<void>;
  getTeamMembers(teamId: string): Promise<TeamMember[]>;

  // Invitations & Join Requests
  getRequests(): Promise<TeamRequest[]>;
  getRequestsForUser(userId: string): Promise<UserRequestsSummary>;
  createRequest(request: {
    type: 'invitation' | 'join_request';
    team_id: string;
    sender_id: string;
    recipient_id: string;
    role?: string;
    message?: string;
  }): Promise<TeamRequest>;
  updateRequestStatus(
    requestId: string,
    status: 'accepted' | 'rejected' | 'cancelled'
  ): Promise<TeamRequest>;
  hasPendingRequest(
    teamId: string,
    senderId: string,
    recipientId: string,
    type: 'invitation' | 'join_request'
  ): Promise<boolean>;

  // Events
  getEvents(): Promise<CampusEvent[]>;
  getEvent(id: string): Promise<CampusEvent | null>;
  createEvent(event: Omit<CampusEvent, 'id' | 'created_at'>): Promise<CampusEvent>;

  // Project Showcase Feed
  getPosts(): Promise<ProjectPost[]>;
  getPost(id: string): Promise<ProjectPost | null>;
  createPost(post: Omit<ProjectPost, 'id' | 'upvotes' | 'comments_count' | 'created_at'>): Promise<ProjectPost>;
  toggleUpvote(postId: string, userId: string): Promise<ProjectPost>;

  // Team Workspace (Milestones & Updates)
  getMilestones(teamId: string): Promise<TeamMilestone[]>;
  addMilestone(milestone: Omit<TeamMilestone, 'id' | 'completed' | 'completed_at'>): Promise<TeamMilestone>;
  toggleMilestone(milestoneId: string): Promise<TeamMilestone>;
  deleteMilestone(milestoneId: string): Promise<void>;

  getTeamUpdates(teamId: string): Promise<TeamUpdate[]>;
  createTeamUpdate(update: Omit<TeamUpdate, 'id' | 'created_at'>): Promise<TeamUpdate>;

  // Management
  resetData?(): void;
}
