export type AcademicYear = 1 | 2 | 3 | 4;

export type TeamVisibility = 'open' | 'invite_only';

export type RequestType = 'invitation' | 'join_request';

export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export type UserRole = 'student' | 'leader' | 'admin';

export type EventCategory =
  | 'hackathon'
  | 'competition'
  | 'workshop'
  | 'conference'
  | 'exhibition'
  | 'other';

export type EventFormat = 'online' | 'offline' | 'hybrid';

export interface Skill {
  name: string;
  level: number; // 1 to 5
}

export interface Profile {
  id: string;
  name: string;
  avatar_url?: string;
  college: string;
  department: string;
  year: AcademicYear;
  bio: string;
  skills: Skill[];
  interests: string[];
  learning_goals: string[]; // Currently learning
  preferred_domains: string[]; // e.g. "AI/ML", "Web3", "HealthTech", "Robotics"
  weekly_availability: number; // in hours per week
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  other_url?: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string; // e.g. "Team Lead", "Frontend Engineer", "ML Researcher"
  joined_at: string;
  profile?: Profile;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  creator_id: string; // User ID of the team lead
  project_domain: string; // e.g. "Artificial Intelligence", "EdTech", "FinTech"
  required_skills: string[]; // e.g. ["Python", "PyTorch", "React"]
  open_roles: string[]; // e.g. ["ML Engineer", "UI Designer"]
  visibility: TeamVisibility;
  created_at: string;
  members_count?: number;
  members?: TeamMember[];
}

export interface TeamRequest {
  id: string;
  type: RequestType;
  team_id: string;
  sender_id: string; // User who initiated the invite or join request
  recipient_id: string; // User who receives it (student for invite, lead for join request)
  role?: string; // Proposed role or position applied for
  message?: string; // Note or intro message
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  team?: Team;
  sender_profile?: Profile;
  recipient_profile?: Profile;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  organizer: string;
  category: EventCategory;
  location: string;
  format: EventFormat;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  eligibility: string;
  registration_url: string;
  tags: string[]; // relevant skills or domains
  is_demo_sample: boolean;
  created_by_id?: string;
  created_by_role?: UserRole;
  created_at: string;
}

export interface ProjectPost {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_college: string;
  author_department?: string;
  title: string;
  tagline: string;
  description: string;
  media_url?: string;
  demo_url?: string;
  github_url?: string;
  tags: string[];
  seeking_teammates: boolean;
  desired_skills?: string[];
  upvotes: string[]; // user IDs who upvoted
  comments_count: number;
  created_at: string;
}

export interface TeamMilestone {
  id: string;
  team_id: string;
  title: string;
  due_date?: string;
  completed: boolean;
  completed_at?: string;
  assigned_to?: string;
}

export interface TeamUpdate {
  id: string;
  team_id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  content: string;
  created_at: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  active_user_id: string;
  active_role: UserRole;
}
