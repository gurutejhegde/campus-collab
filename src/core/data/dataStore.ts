import { CampusEvent, Profile, RequestStatus, RequestType, Team, TeamRequest } from '../types/domain';

export interface UserRequestsSummary {
  incomingInvites: TeamRequest[];
  outgoingInvites: TeamRequest[];
  incomingJoinRequests: TeamRequest[];
  outgoingJoinRequests: TeamRequest[];
}

export interface UpsertProfileInput {
  id: string;
  name: string;
  college: string;
  department: string;
  year: Profile['year'];
  bio: string;
  skills: Profile['skills'];
  learning_goals: string[];
  preferred_domains: string[];
  weekly_availability: number;
  open_to_learning: boolean;
  github_username?: string | null;
  github_overview?: Profile['github_overview'];
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  onboarding_completed: boolean;
}

export interface CreateTeamInput {
  event_id?: string | null;
  name: string;
  description: string;
  creator_id: string;
  project_domain: string;
  required_skills: string[];
  open_roles: string[];
  visibility: Team['visibility'];
  learner_friendly: boolean;
  max_members?: number;
}

export type UpdateTeamInput = Partial<Omit<CreateTeamInput, 'creator_id'>>;

export interface CreateEventInput {
  title: string;
  description: string;
  organizer: string;
  category: CampusEvent['category'];
  format: CampusEvent['format'];
  location: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  registration_url: string;
  tags: string[];
  created_by: string;
}

export interface DataStore {
  getProfiles(): Promise<Profile[]>;
  getProfile(id: string): Promise<Profile | null>;
  upsertProfile(input: UpsertProfileInput): Promise<Profile>;

  getEvents(): Promise<CampusEvent[]>;
  createEvent(input: CreateEventInput): Promise<CampusEvent>;

  getTeams(eventId?: string): Promise<Team[]>;
  createTeam(input: CreateTeamInput): Promise<Team>;
  updateTeam(teamId: string, updates: UpdateTeamInput): Promise<Team>;
  deleteTeam(teamId: string): Promise<void>;
  leaveTeam(teamId: string, userId: string): Promise<void>;
  removeMember(teamId: string, userId: string): Promise<void>;

  getRequestsForUser(userId: string): Promise<UserRequestsSummary>;
  createRequest(input: {
    type: RequestType;
    team_id: string;
    sender_id: string;
    recipient_id: string;
    proposed_role?: string;
    message?: string;
  }): Promise<TeamRequest>;
  updateRequestStatus(
    requestId: string,
    status: Extract<RequestStatus, 'accepted' | 'rejected' | 'cancelled'>
  ): Promise<TeamRequest>;
}
