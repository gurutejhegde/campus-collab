import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, Check, Eye, Globe, Inbox, Lock, Sparkles, Users, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRequestsSummary } from '../../core/data/dataStore';
import { getTeamSeatStats } from '../../core/engine/teamSeats';
import { Team, TeamRequest } from '../../core/types/domain';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Modal } from '../../ui/Modal';
import { Pill } from '../../ui/Pill';
import { useToast } from '../../ui/Toast';

type RequestTab = 'incoming_join' | 'incoming_invites' | 'outgoing_join' | 'outgoing_invites';

export const RequestsPage: React.FC = () => {
  const { profile, dataStore } = useApp();
  const { showToast } = useToast();

  const [tab, setTab] = useState<RequestTab>('incoming_join');
  const [summary, setSummary] = useState<UserRequestsSummary>({
    incomingInvites: [],
    outgoingInvites: [],
    incomingJoinRequests: [],
    outgoingJoinRequests: [],
  });
  const [loading, setLoading] = useState(true);
  const [inspectingRequest, setInspectingRequest] = useState<TeamRequest | null>(null);

  const loadRequests = useCallback(async () => {
    if (!dataStore || !profile) return;
    setLoading(true);
    try {
      const data = await dataStore.getRequestsForUser(profile.id);
      setSummary(data);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to load requests', 'error');
    } finally {
      setLoading(false);
    }
  }, [dataStore, profile, showToast]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleAction = async (
    requestId: string,
    status: 'accepted' | 'rejected' | 'cancelled'
  ) => {
    if (!dataStore) return;
    try {
      await dataStore.updateRequestStatus(requestId, status);
      showToast(
        status === 'accepted'
          ? 'Accepted — member added to team'
          : status === 'rejected'
          ? 'Request declined'
          : 'Request cancelled'
      );
      setInspectingRequest(null);
      await loadRequests();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Action failed', 'error');
    }
  };

  const tabMap: Record<RequestTab, { label: string; items: TeamRequest[] }> = {
    incoming_join: { label: 'Join Requests (Lead)', items: summary.incomingJoinRequests },
    incoming_invites: { label: 'Team Invites', items: summary.incomingInvites },
    outgoing_join: { label: 'Sent Join Requests', items: summary.outgoingJoinRequests },
    outgoing_invites: { label: 'Sent Invites', items: summary.outgoingInvites },
  };

  const currentItems = tabMap[tab].items;
  const inspectedTeam: Team | undefined = inspectingRequest?.team;
  const inspectedStats = inspectedTeam ? getTeamSeatStats(inspectedTeam) : null;

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Invitations & Join Requests</h1>
        <p className="text-xs text-text-muted mt-1">
          Accepting a pending request automatically adds the student to the team roster in Postgres.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(tabMap) as RequestTab[]).map((key) => {
          const entry = tabMap[key];
          const pending = entry.items.filter((i) => i.status === 'pending').length;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors inline-flex items-center gap-1.5 ${
                tab === key
                  ? 'bg-surface-elevated text-text border-border-strong'
                  : 'text-text-muted border-border hover:text-text'
              }`}
            >
              <span>{entry.label}</span>
              {pending > 0 && (
                <span className="font-mono text-[10px] px-1.5 rounded-full bg-accent text-white">
                  {pending}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="h-32 rounded-card bg-surface border border-border animate-pulse" />
      ) : currentItems.length === 0 ? (
        <Card className="p-10 text-center space-y-2">
          <Inbox className="w-7 h-7 text-text-dim mx-auto" />
          <div className="text-sm font-medium text-text">Nothing here yet</div>
          <p className="text-xs text-text-muted">
            Requests and team invitations for this category will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {currentItems.map((req) => {
            const isPending = req.status === 'pending';
            const isIncoming = tab === 'incoming_join' || tab === 'incoming_invites';
            const peerName = isIncoming
              ? req.sender_profile?.name || 'Student'
              : req.recipient_profile?.name || 'Team Lead';

            return (
              <Card key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-text">
                      {req.team?.name || 'Team'}
                    </span>
                    {req.team?.visibility === 'invite_only' && (
                      <Pill>
                        <Lock className="w-2.5 h-2.5" /> Invite-only
                      </Pill>
                    )}
                    <Pill
                      variant={
                        req.status === 'accepted'
                          ? 'ok'
                          : req.status === 'pending'
                          ? 'burgundy'
                          : 'default'
                      }
                      className="capitalize"
                    >
                      {req.status}
                    </Pill>
                  </div>
                  <div className="text-xs text-text-muted">
                    {isIncoming ? `From ${peerName}` : `To ${peerName}`} · Role:{' '}
                    <span className="text-text">{req.proposed_role || 'Member'}</span>
                  </div>
                  {req.message && (
                    <p className="text-xs text-text-dim italic">"{req.message}"</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {req.team && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Eye className="w-3.5 h-3.5" />}
                      onClick={() => setInspectingRequest(req)}
                    >
                      Team Details
                    </Button>
                  )}

                  {isPending && (
                    isIncoming ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<X className="w-3.5 h-3.5" />}
                          onClick={() => handleAction(req.id, 'rejected')}
                        >
                          Decline
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Check className="w-3.5 h-3.5" />}
                          onClick={() => handleAction(req.id, 'accepted')}
                        >
                          Accept
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction(req.id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    )
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Team Details Modal (including private invite-only teams visible to invitees) */}
      <Modal
        isOpen={Boolean(inspectingRequest && inspectedTeam)}
        onClose={() => setInspectingRequest(null)}
        title={inspectedTeam?.name || 'Team Details'}
        subtitle={inspectedTeam?.project_domain}
        maxWidth="md"
      >
        {inspectedTeam && inspectedStats && inspectingRequest && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {inspectedTeam.event ? (
                <Pill variant="burgundy">
                  <Calendar className="w-3 h-3" /> {inspectedTeam.event.title}
                </Pill>
              ) : (
                <Pill variant="strong">Standalone Idea</Pill>
              )}
              <Pill>
                {inspectedTeam.visibility === 'open' ? (
                  <>
                    <Globe className="w-3 h-3 text-ok" /> Open
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3" /> Invite-only
                  </>
                )}
              </Pill>
              {inspectedTeam.learner_friendly && (
                <Pill variant="burgundy">
                  <Sparkles className="w-3 h-3" /> Learner Friendly
                </Pill>
              )}
              <Pill variant="strong" className="font-mono">
                <Users className="w-3 h-3" /> {inspectedStats.memberCount}/{inspectedStats.maxMembers} seats
              </Pill>
            </div>

            <p className="text-[13px] text-text-muted leading-relaxed">
              {inspectedTeam.description}
            </p>

            {inspectedTeam.required_skills.length > 0 && (
              <div className="pt-3 border-t border-border space-y-2">
                <div className="text-[11px] font-semibold text-text-dim uppercase tracking-wider">
                  Stack & Skills
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {inspectedTeam.required_skills.map((s) => (
                    <Pill key={s} variant="strong">
                      {s}
                    </Pill>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-border space-y-2">
              <div className="text-[11px] font-semibold text-text-dim uppercase tracking-wider">
                Current Members ({inspectedStats.memberCount})
              </div>
              <div className="space-y-1.5">
                {(inspectedTeam.members || []).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2.5 rounded-control bg-well border border-border text-xs"
                  >
                    <span className="font-medium text-text">{m.profile?.name || 'Member'}</span>
                    <span className="text-text-muted">{m.role}</span>
                  </div>
                ))}
              </div>
            </div>

            {inspectingRequest.status === 'pending' &&
              inspectingRequest.recipient_id === profile?.id && (
                <div className="pt-3 border-t border-border flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<X className="w-3.5 h-3.5" />}
                    onClick={() => handleAction(inspectingRequest.id, 'rejected')}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Check className="w-3.5 h-3.5" />}
                    onClick={() => handleAction(inspectingRequest.id, 'accepted')}
                  >
                    Accept & Join Team
                  </Button>
                </div>
              )}
          </div>
        )}
      </Modal>
    </div>
  );
};
