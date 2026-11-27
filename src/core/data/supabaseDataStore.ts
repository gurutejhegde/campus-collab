import { SupabaseClient } from '@supabase/supabase-js';
import { CampusEvent, Profile, RequestStatus, RequestType, Team, TeamRequest } from '../types/domain';
import {
  CreateEventInput,
  CreateTeamInput,
  DataStore,
  UpdateTeamInput,
  UpsertProfileInput,
  UserRequestsSummary,
} from './dataStore';

const TEAM_SELECT = `
  *,
  event:events(*),
  members:team_members(
    *,
    profile:profiles(*)
  )
`;

export class SupabaseDataStore implements DataStore {
  constructor(private readonly client: SupabaseClient) {}

  async getProfiles(): Promise<Profile[]> {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('onboarding_completed', true)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []) as Profile[];
  }

  async getProfile(id: string): Promise<Profile | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return (data as Profile | null) || null;
  }

  async upsertProfile(input: UpsertProfileInput): Promise<Profile> {
    const { data, error } = await this.client
      .from('profiles')
      .upsert(input, { onConflict: 'id' })
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data as Profile;
  }

  async getEvents(): Promise<CampusEvent[]> {
    const { data, error } = await this.client
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []) as CampusEvent[];
  }

  async createEvent(input: CreateEventInput): Promise<CampusEvent> {
    const { data, error } = await this.client
      .from('events')
      .insert(input)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data as CampusEvent;
  }

  async getTeams(eventId?: string): Promise<Team[]> {
    let query = this.client
      .from('teams')
      .select(TEAM_SELECT)
      .order('created_at', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []) as Team[];
  }

  async createTeam(input: CreateTeamInput): Promise<Team> {
    const { data, error } = await this.client
      .from('teams')
      .insert(input)
      .select(TEAM_SELECT)
      .single();

    if (error) throw new Error(error.message);
    return data as Team;
  }

  async updateTeam(teamId: string, updates: UpdateTeamInput): Promise<Team> {
    const { data, error } = await this.client
      .from('teams')
      .update(updates)
      .eq('id', teamId)
      .select(TEAM_SELECT)
      .single();

    if (error) throw new Error(error.message);
    return data as Team;
  }

  async deleteTeam(teamId: string): Promise<void> {
    const { error } = await this.client.from('teams').delete().eq('id', teamId);
    if (error) throw new Error(error.message);
  }

  async leaveTeam(teamId: string, userId: string): Promise<void> {
    const { error } = await this.client
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  }

  async removeMember(teamId: string, userId: string): Promise<void> {
    await this.leaveTeam(teamId, userId);
  }

  async getRequestsForUser(userId: string): Promise<UserRequestsSummary> {
    const { data, error } = await this.client
      .from('team_requests')
      .select(`
        *,
        team:teams(
          *,
          event:events(*),
          members:team_members(
            *,
            profile:profiles(*)
          )
        ),
        sender_profile:profiles!team_requests_sender_id_fkey(*),
        recipient_profile:profiles!team_requests_recipient_id_fkey(*)
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const all = (data || []) as TeamRequest[];
    return {
      incomingInvites: all.filter((r) => r.type === 'invitation' && r.recipient_id === userId),
      outgoingInvites: all.filter((r) => r.type === 'invitation' && r.sender_id === userId),
      incomingJoinRequests: all.filter((r) => r.type === 'join_request' && r.recipient_id === userId),
      outgoingJoinRequests: all.filter((r) => r.type === 'join_request' && r.sender_id === userId),
    };
  }

  async createRequest(input: {
    type: RequestType;
    team_id: string;
    sender_id: string;
    recipient_id: string;
    proposed_role?: string;
    message?: string;
  }): Promise<TeamRequest> {
    const { data, error } = await this.client
      .from('team_requests')
      .insert({
        ...input,
        status: 'pending',
      })
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('A pending request already exists for this team.');
      }
      throw new Error(error.message);
    }
    return data as TeamRequest;
  }

  async updateRequestStatus(
    requestId: string,
    status: Extract<RequestStatus, 'accepted' | 'rejected' | 'cancelled'>
  ): Promise<TeamRequest> {
    const { data, error } = await this.client
      .from('team_requests')
      .update({ status })
      .eq('id', requestId)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return data as TeamRequest;
  }
}
