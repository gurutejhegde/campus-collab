import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ExternalLink, MapPin, Plus, Shield, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CampusEvent, Team, TeamRequest } from '../../core/types/domain';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Pill } from '../../ui/Pill';
import { useToast } from '../../ui/Toast';
import { RequestJoinModal } from '../teams/RequestJoinModal';
import { TeamCard } from '../teams/TeamCard';
import { CreateEventModal } from './CreateEventModal';

export const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, dataStore } = useApp();
  const { showToast } = useToast();

  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [outgoingJoinReqs, setOutgoingJoinReqs] = useState<TeamRequest[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [joinTargetTeam, setJoinTargetTeam] = useState<Team | null>(null);

  const loadData = useCallback(async () => {
    if (!dataStore || !profile) return;
    setLoading(true);
    try {
      const [evRows, teamRows, reqSummary] = await Promise.all([
        dataStore.getEvents(),
        dataStore.getTeams(),
        dataStore.getRequestsForUser(profile.id),
      ]);
      setEvents(evRows);
      setTeams(teamRows);
      setOutgoingJoinReqs(reqSummary.outgoingJoinRequests);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  }, [dataStore, profile, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const visibleTeams = useMemo(() => {
    if (!profile) return [];
    return teams.filter((t) => {
      if (t.visibility === 'open') return true;
      return (
        t.creator_id === profile.id ||
        Boolean(t.members?.some((m) => m.user_id === profile.id))
      );
    });
  }, [teams, profile]);

  const activeEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) || events[0] || null,
    [events, selectedEventId]
  );

  const eventTeams = useMemo(() => {
    if (!activeEvent) return [];
    return visibleTeams.filter((t) => t.event_id === activeEvent.id);
  }, [visibleTeams, activeEvent]);

  const standaloneTeamsCount = useMemo(
    () => visibleTeams.filter((t) => !t.event_id && t.visibility === 'open').length,
    [visibleTeams]
  );

  const pendingTeamIds = useMemo(
    () => new Set(outgoingJoinReqs.filter((r) => r.status === 'pending').map((r) => r.team_id)),
    [outgoingJoinReqs]
  );

  if (!profile || !dataStore) return null;

  const isAdmin = profile.role === 'admin';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Events & Forming Teams</h1>
          <p className="text-xs text-text-muted mt-1">
            Select an event to inspect squads forming inside it, or create your own event team. ({standaloneTeamsCount} standalone idea teams active in Teams tab)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Button
              variant="primary"
              size="md"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsCreateEventOpen(true)}
            >
              Post Event
            </Button>
          ) : (
            <Pill className="text-text-dim">
              <Shield className="w-3 h-3" /> Admins post official events
            </Pill>
          )}
        </div>
      </div>

      {loading ? (
        <div className="h-48 rounded-card bg-surface border border-border animate-pulse" />
      ) : events.length === 0 ? (
        <Card className="p-10 text-center space-y-3">
          <Calendar className="w-8 h-8 text-text-dim mx-auto" />
          <div className="text-sm font-medium text-text">No events posted yet</div>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            {isAdmin
              ? 'Post your first hackathon, workshop, or competition so students can form event teams.'
              : 'No events have been published by an admin yet. Meanwhile, you can still create standalone idea teams from the Find tab.'}
          </p>
          {isAdmin && (
            <div className="pt-1">
              <Button variant="primary" size="sm" onClick={() => setIsCreateEventOpen(true)}>
                Post First Event
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Events List */}
          <div className="lg:col-span-5 space-y-2.5">
            {events.map((ev) => {
              const count = visibleTeams.filter((t) => t.event_id === ev.id).length;
              const isSelected = activeEvent?.id === ev.id;
              return (
                <Card
                  key={ev.id}
                  interactive
                  selected={isSelected}
                  onClick={() => setSelectedEventId(ev.id)}
                  className="p-4 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Pill variant="strong" className="capitalize">
                      {ev.category}
                    </Pill>
                    <span className="font-mono text-[11px] text-text-dim">
                      {count} {count === 1 ? 'team' : 'teams'}
                    </span>
                  </div>
                  <div className="font-semibold text-[14.5px] text-text">{ev.title}</div>
                  <div className="text-xs text-text-muted flex items-center gap-2 flex-wrap">
                    <span>{ev.organizer}</span>
                    <span>·</span>
                    <span className="capitalize">{ev.format}</span>
                    <span>·</span>
                    <span>
                      Due {new Date(ev.registration_deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Selected Event + Teams inside that Event */}
          <div className="lg:col-span-7 space-y-4">
            {activeEvent && (
              <>
                <Card className="p-5 space-y-3.5">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Pill variant="burgundy" className="capitalize">
                          {activeEvent.category}
                        </Pill>
                        <Pill className="capitalize">{activeEvent.format}</Pill>
                      </div>
                      <h2 className="text-lg font-semibold text-text">{activeEvent.title}</h2>
                      <p className="text-xs text-text-muted mt-0.5">{activeEvent.organizer}</p>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Plus className="w-3.5 h-3.5" />}
                      onClick={() => navigate(`/teams/new?eventId=${activeEvent.id}`)}
                    >
                      Create Team for Event
                    </Button>
                  </div>

                  <p className="text-[13px] text-text-muted leading-relaxed">
                    {activeEvent.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted pt-1">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-text-dim" />
                      {activeEvent.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-text-dim" />
                      {new Date(activeEvent.start_date).toLocaleDateString()} –{' '}
                      {new Date(activeEvent.end_date).toLocaleDateString()}
                    </span>
                    {activeEvent.registration_url && (
                      <a
                        href={activeEvent.registration_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent-text hover:underline inline-flex items-center gap-1"
                      >
                        Official Registration <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {activeEvent.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {activeEvent.tags.map((tag) => (
                        <Pill key={tag}>{tag}</Pill>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Teams inside this Event */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-0.5">
                    <h3 className="text-xs font-semibold text-text-dim uppercase tracking-wider">
                      Teams Forming Inside This Event ({eventTeams.length})
                    </h3>
                  </div>

                  {eventTeams.length === 0 ? (
                    <Card className="p-6 text-center space-y-2.5">
                      <Users className="w-6 h-6 text-text-dim mx-auto" />
                      <div className="text-xs font-medium text-text">No teams formed for this event yet</div>
                      <p className="text-xs text-text-muted">
                        Start the first squad for {activeEvent.title} and recruit open roles.
                      </p>
                      <div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/teams/new?eventId=${activeEvent.id}`)}
                        >
                          Create Team for Event
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    eventTeams.map((team) => (
                      <TeamCard
                        key={team.id}
                        team={team}
                        currentUserId={profile.id}
                        hasPendingJoinRequest={pendingTeamIds.has(team.id)}
                        onQuickJoin={(t) => setJoinTargetTeam(t)}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateEventModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        creatorId={profile.id}
        onCreate={async (input) => {
          const created = await dataStore.createEvent(input);
          showToast(`Event "${created.title}" published`);
          setSelectedEventId(created.id);
          await loadData();
        }}
      />

      <RequestJoinModal
        isOpen={Boolean(joinTargetTeam)}
        onClose={() => setJoinTargetTeam(null)}
        team={joinTargetTeam}
        onSubmit={async (teamId, proposedRole, message) => {
          if (!joinTargetTeam) return;
          await dataStore.createRequest({
            type: 'join_request',
            team_id: teamId,
            sender_id: profile.id,
            recipient_id: joinTargetTeam.creator_id,
            proposed_role: proposedRole,
            message,
          });
          showToast(`Join request sent to ${joinTargetTeam.name}`);
          await loadData();
        }}
      />
    </div>
  );
};
