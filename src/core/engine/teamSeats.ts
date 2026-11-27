import { Team } from '../types/domain';

export interface TeamSeatStats {
  memberCount: number;
  maxMembers: number;
  openSeats: number;
  isFull: boolean;
  fillPct: number;
  availableOpenRoles: string[];
}

/**
 * Computes consistent seat occupancy and remaining open roles for a team.
 * Hides open roles once the squad reaches max_members and excludes roles
 * already filled by current members.
 */
export function getTeamSeatStats(team: Team): TeamSeatStats {
  const members = team.members || [];
  const memberCount = members.length || 1;
  const maxMembers = team.max_members || 4;
  const openSeats = Math.max(0, maxMembers - memberCount);
  const isFull = openSeats === 0;
  const fillPct = Math.min(100, Math.round((memberCount / maxMembers) * 100));

  if (isFull) {
    return {
      memberCount,
      maxMembers,
      openSeats: 0,
      isFull: true,
      fillPct: 100,
      availableOpenRoles: [],
    };
  }

  const filledRoleCounts = new Map<string, number>();
  for (const m of members) {
    const key = m.role.trim().toLowerCase();
    filledRoleCounts.set(key, (filledRoleCounts.get(key) || 0) + 1);
  }

  const remaining: string[] = [];
  for (const role of team.open_roles || []) {
    const key = role.trim().toLowerCase();
    const used = filledRoleCounts.get(key) || 0;
    if (used > 0) {
      filledRoleCounts.set(key, used - 1);
    } else {
      remaining.push(role);
    }
  }

  return {
    memberCount,
    maxMembers,
    openSeats,
    isFull: false,
    fillPct,
    availableOpenRoles: remaining,
  };
}

export type FinderTeamTab = 'all' | 'mine' | 'standalone' | 'event' | 'learner';

/**
 * Controls team visibility in the Team Finder tabs:
 * - Invite-only teams are hidden from public finder tabs ('all', 'standalone', 'event', 'learner')
 *   and are only shown to their members/creator under 'mine'.
 */
export function isTeamVisibleInTab(team: Team, userId: string, tab: FinderTeamTab): boolean {
  const isMember =
    team.creator_id === userId ||
    Boolean(team.members?.some((m) => m.user_id === userId));

  if (tab === 'mine') {
    return isMember;
  }

  if (team.visibility === 'invite_only') {
    return false;
  }

  if (tab === 'standalone') return !team.event_id;
  if (tab === 'event') return Boolean(team.event_id);
  if (tab === 'learner') return team.learner_friendly;

  return true;
}

