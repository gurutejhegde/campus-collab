import { describe, expect, it, vi } from 'vitest';
import { getRecommendedSkillsForRoles } from '../core/data/presets';
import { SupabaseDataStore } from '../core/data/supabaseDataStore';
import { getTeamSeatStats, isTeamVisibleInTab } from '../core/engine/teamSeats';
import { Team } from '../core/types/domain';

describe('Team Creation, Presets & Request Contracts', () => {
  it('recommends deduplicated skills based on selected roles', () => {
    const recs = getRecommendedSkillsForRoles(['Frontend Developer', 'ML / AI Engineer']);
    expect(recs).toContain('React');
    expect(recs).toContain('TypeScript');
    expect(recs).toContain('PyTorch');
    expect(recs).toContain('Python');
    expect(new Set(recs).size).toBe(recs.length);
  });

  it('falls back to keyword matching for custom role titles', () => {
    const recs = getRecommendedSkillsForRoles(['Flutter Mobile Lead']);
    expect(recs).toContain('Flutter');
    expect(recs).toContain('React Native');
  });

  it('supports standalone and event-scoped team creation via SupabaseDataStore', async () => {
    const insertedPayloads: unknown[] = [];
    const fakeTeam = {
      id: 'team-1',
      event_id: null,
      name: 'GridPulse',
      description: 'Campus energy telemetry',
      creator_id: 'user-1',
      project_domain: 'CleanTech & Sustainability',
      required_skills: ['TypeScript', 'Rust'],
      open_roles: ['Frontend Developer'],
      visibility: 'open',
      learner_friendly: true,
      max_members: 4,
      created_at: '2026-11-27T00:00:00Z',
      members: [],
    };

    const fakeClient = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn((payload: unknown) => {
          insertedPayloads.push(payload);
          return {
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: fakeTeam, error: null }),
            }),
          };
        }),
      }),
    } as unknown as ConstructorParameters<typeof SupabaseDataStore>[0];

    const store = new SupabaseDataStore(fakeClient);
    const created = await store.createTeam({
      name: 'GridPulse',
      description: 'Campus energy telemetry',
      creator_id: 'user-1',
      project_domain: 'CleanTech & Sustainability',
      required_skills: ['TypeScript', 'Rust'],
      open_roles: ['Frontend Developer'],
      visibility: 'open',
      learner_friendly: true,
      event_id: null,
      max_members: 4,
    });

    expect(created.id).toBe('team-1');
    expect(insertedPayloads[0]).toMatchObject({
      name: 'GridPulse',
      event_id: null,
      max_members: 4,
      learner_friendly: true,
    });
  });

  it('translates Postgres unique violation 23505 into friendly duplicate request error', async () => {
    const fakeClient = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: '23505', message: 'duplicate key value violates unique constraint' },
            }),
          }),
        }),
      }),
    } as unknown as ConstructorParameters<typeof SupabaseDataStore>[0];

    const store = new SupabaseDataStore(fakeClient);

    await expect(
      store.createRequest({
        type: 'join_request',
        team_id: 'team-1',
        sender_id: 'user-2',
        recipient_id: 'user-1',
      })
    ).rejects.toThrow('A pending request already exists for this team.');
  });

  it('hides all open roles once 4/4 seats are filled', () => {
    const baseTeam: Team = {
      id: 'team-agro',
      event_id: 'ev-1',
      name: 'AgroSense Edge',
      description: 'Crop scanner',
      creator_id: 'u1',
      project_domain: 'AgriTech',
      required_skills: ['Python', 'React Native'],
      open_roles: ['Mobile Engineer', 'UI/UX Designer'],
      visibility: 'open',
      learner_friendly: true,
      max_members: 4,
      created_at: '2026-11-27T00:00:00Z',
      members: [
        { id: 'm1', team_id: 'team-agro', user_id: 'u1', role: 'Team Lead', joined_at: '' },
        { id: 'm2', team_id: 'team-agro', user_id: 'u2', role: 'Edge Advisor', joined_at: '' },
        { id: 'm3', team_id: 'team-agro', user_id: 'u3', role: 'Mobile Engineer', joined_at: '' },
      ],
    };

    const threeOfFour = getTeamSeatStats(baseTeam);
    expect(threeOfFour.isFull).toBe(false);
    expect(threeOfFour.openSeats).toBe(1);
    expect(threeOfFour.availableOpenRoles).toEqual(['UI/UX Designer']);

    const fullTeam: Team = {
      ...baseTeam,
      members: [
        ...(baseTeam.members || []),
        { id: 'm4', team_id: 'team-agro', user_id: 'u4', role: 'Contributor', joined_at: '' },
      ],
    };

    const fourOfFour = getTeamSeatStats(fullTeam);
    expect(fourOfFour.isFull).toBe(true);
    expect(fourOfFour.openSeats).toBe(0);
    expect(fourOfFour.availableOpenRoles).toEqual([]);
  });

  it('hides invite-only teams from Team Finder tabs and only shows them to members under mine', () => {
    const privateTeam: Team = {
      id: 'team-priv',
      event_id: null,
      name: 'DevTrace CLI',
      description: 'Private build',
      creator_id: 'u-lead',
      project_domain: 'Developer Tools',
      required_skills: ['TypeScript'],
      open_roles: ['Security Engineer'],
      visibility: 'invite_only',
      learner_friendly: true,
      max_members: 3,
      created_at: '2026-11-27T00:00:00Z',
      members: [{ id: 'm1', team_id: 'team-priv', user_id: 'u-lead', role: 'Team Lead', joined_at: '' }],
    };

    expect(isTeamVisibleInTab(privateTeam, 'u-outsider', 'all')).toBe(false);
    expect(isTeamVisibleInTab(privateTeam, 'u-outsider', 'standalone')).toBe(false);
    expect(isTeamVisibleInTab(privateTeam, 'u-outsider', 'learner')).toBe(false);
    expect(isTeamVisibleInTab(privateTeam, 'u-outsider', 'mine')).toBe(false);

    // Even the lead doesn't see invite_only cluttering public finder tabs; only under My Teams
    expect(isTeamVisibleInTab(privateTeam, 'u-lead', 'all')).toBe(false);
    expect(isTeamVisibleInTab(privateTeam, 'u-lead', 'mine')).toBe(true);
  });
});
