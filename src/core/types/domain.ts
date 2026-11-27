export type UserRole = 'student' | 'admin';

export type AcademicYear = 1 | 2 | 3 | 4 | 5;

export type EventCategory = 'hackathon' | 'competition' | 'workshop' | 'conference' | 'other';
export type EventFormat = 'online' | 'offline' | 'hybrid';

export type TeamVisibility = 'open' | 'invite_only';
export type RequestType = 'invitation' | 'join_request';
export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface Skill {
  name: string;
  level: 1 | 2 | 3 | 4 | 5;
}

export interface GitHubOverview {
  username: string;
  public_repos: number;
  followers: number;
  top_languages: string[];
  recent_repos: Array<{
    name: string;
    description: string | null;
    language: string | null;
    stars: number;
    updated_at: string;
    html_url: string;
  }>;
  summary: string;
  fetched_at: string;
}

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  avatar_url?: string | null;
  college: string;
  department: string;
  year: AcademicYear;
  bio: string;
  skills: Skill[];
  learning_goals: string[];
  preferred_domains: string[];
  weekly_availability: number;
  open_to_learning: boolean;
  github_username?: string | null;
  github_overview?: GitHubOverview | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  organizer: string;
  category: EventCategory;
  format: EventFormat;
  location: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  registration_url: string;
  tags: string[];
  created_by: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: Profile;
}

export interface Team {
  id: string;
  event_id?: string | null; // null = standalone idea team; set = event-scoped team
  name: string;
  description: string;
  creator_id: string;
  project_domain: string;
  required_skills: string[];
  open_roles: string[];
  visibility: TeamVisibility;
  learner_friendly: boolean;
  max_members: number;
  created_at: string;
  event?: CampusEvent | null;
  members?: TeamMember[];
}

export interface TeamRequest {
  id: string;
  type: RequestType;
  team_id: string;
  sender_id: string;
  recipient_id: string;
  proposed_role?: string | null;
  message?: string | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  team?: Team;
  sender_profile?: Profile;
  recipient_profile?: Profile;
}

export interface MatchResult {
  score: number; // 0..100
  badgeType: 'skill_match' | 'committed_learner' | 'general_fit';
  reasons: string[];
}

export interface IdeaBlueprint {
  summary: string;
  domain: string;
  workflow_steps: string[];
  recommended_tools: string[];
  suggested_roles: Array<{
    title: string;
    required_skills: string[];
    learner_friendly: boolean;
    reason: string;
  }>;
}
