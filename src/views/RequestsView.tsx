import React, { useEffect, useState, useMemo } from 'react';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Ban,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDataStore } from '../context/DataStoreContext';
import { useToast } from '../components/common/Toast';
import { Profile, TeamRequest } from '../shared/types';
import { Button } from '../components/common/Button';
import { ProfileDetailModal } from '../components/profile/ProfileDetailModal';

type SubTab =
  | 'incoming_invites'
  | 'incoming_join'
  | 'outgoing_invites'
  | 'outgoing_join';

export const RequestsView: React.FC = () => {
  const { profile } = useAuth();
  const { dataStore } = useDataStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<SubTab>('incoming_invites');
  const [requests, setRequests] = useState<{
    incomingInvites: TeamRequest[];
    outgoingInvites: TeamRequest[];
    incomingJoinRequests: TeamRequest[];
    outgoingJoinRequests: TeamRequest[];
  }>({
    incomingInvites: [],
    outgoingInvites: [],
    incomingJoinRequests: [],
    outgoingJoinRequests: [],
  });
  const [, setLoading] = useState(true);

  // Status Filter: all vs pending vs resolved
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  // Profile modal
  const [inspectedProfile, setInspectedProfile] = useState<Profile | null>(null);

  const loadRequests = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const summary = await dataStore.getRequestsForUser(profile.id);
      setRequests(summary);
    } catch (err) {
      console.error('Failed to load user requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [profile?.id, dataStore]);

  // Handle Accept
  const handleAccept = async (reqId: string) => {
    try {
      await dataStore.updateRequestStatus(reqId, 'accepted');
      showToast('Request accepted! Member added to team roster.', 'success');
      loadRequests();
    } catch (err: any) {
      showToast(err.message || 'Failed to accept request', 'error');
    }
  };

  // Handle Reject
  const handleReject = async (reqId: string) => {
    try {
      await dataStore.updateRequestStatus(reqId, 'rejected');
      showToast('Request declined.', 'info');
      loadRequests();
    } catch (err: any) {
      showToast(err.message || 'Failed to decline request', 'error');
    }
  };

  // Handle Cancel
  const handleCancel = async (reqId: string) => {
    try {
      await dataStore.updateRequestStatus(reqId, 'cancelled');
      showToast('Request cancelled.', 'info');
      loadRequests();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel request', 'error');
    }
  };

  // Active list based on tab & filter
  const currentList = useMemo(() => {
    let list: TeamRequest[] = [];
    if (activeTab === 'incoming_invites') list = requests.incomingInvites;
    if (activeTab === 'incoming_join') list = requests.incomingJoinRequests;
    if (activeTab === 'outgoing_invites') list = requests.outgoingInvites;
    if (activeTab === 'outgoing_join') list = requests.outgoingJoinRequests;

    if (statusFilter === 'pending') {
      return list.filter((r) => r.status === 'pending');
    }
    if (statusFilter === 'resolved') {
      return list.filter((r) => r.status !== 'pending');
    }
    return list;
  }, [activeTab, requests, statusFilter]);

  const statusBadge = (status: TeamRequest['status']) => {
    const config = {
      pending: {
        label: 'Pending',
        style: 'bg-warning/10 text-warning border-warning/30',
        icon: <Clock className="w-3 h-3" />,
      },
      accepted: {
        label: 'Accepted',
        style: 'bg-success/10 text-success border-success/30 font-semibold',
        icon: <CheckCircle2 className="w-3 h-3" />,
      },
      rejected: {
        label: 'Declined',
        style: 'bg-danger/10 text-danger border-danger/30',
        icon: <XCircle className="w-3 h-3" />,
      },
      cancelled: {
        label: 'Cancelled',
        style: 'bg-surface-subtle text-text-muted border-border',
        icon: <Ban className="w-3 h-3" />,
      },
    };

    const c = config[status];
    return (
      <span
        className={`px-2.5 py-0.5 rounded-pill text-[11px] font-sans font-medium border inline-flex items-center gap-1 ${c.style}`}
      >
        {c.icon}
        <span>{c.label}</span>
      </span>
    );
  };

  const pendingIncomingCount =
    requests.incomingInvites.filter((r) => r.status === 'pending').length +
    requests.incomingJoinRequests.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Inbox className="w-6 h-6 text-accent" />
            <h1 className="text-2xl sm:text-3xl font-serif font-medium text-text">
              Requests & Invitations
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-text-muted max-w-xl leading-relaxed">
            Manage your project collaboration pipeline. Review invitations from teams, respond to
            students seeking to join your projects, and track outgoing invitations.
          </p>
        </div>

        {pendingIncomingCount > 0 && (
          <span className="px-3 py-1 rounded-pill text-xs font-semibold bg-accent/15 text-accent border border-accent/30 self-start sm:self-auto">
            {pendingIncomingCount} Action(s) Pending
          </span>
        )}
      </div>

      {/* Primary Sub-Navigation Tabs (4 tabs) */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('incoming_invites')}
          className={`px-4 py-2 rounded-pill text-xs font-sans font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'incoming_invites'
              ? 'bg-accent text-white shadow-sm'
              : 'bg-surface text-text-muted hover:text-text border border-border'
          }`}
        >
          <span>Incoming Invitations</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'incoming_invites'
                ? 'bg-white/20 text-white'
                : 'bg-surface-subtle text-text-muted'
            }`}
          >
            {requests.incomingInvites.filter((r) => r.status === 'pending').length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('incoming_join')}
          className={`px-4 py-2 rounded-pill text-xs font-sans font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'incoming_join'
              ? 'bg-accent text-white shadow-sm'
              : 'bg-surface text-text-muted hover:text-text border border-border'
          }`}
        >
          <span>Incoming Join Requests</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'incoming_join'
                ? 'bg-white/20 text-white'
                : 'bg-surface-subtle text-text-muted'
            }`}
          >
            {requests.incomingJoinRequests.filter((r) => r.status === 'pending').length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('outgoing_invites')}
          className={`px-4 py-2 rounded-pill text-xs font-sans font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'outgoing_invites'
              ? 'bg-accent text-white shadow-sm'
              : 'bg-surface text-text-muted hover:text-text border border-border'
          }`}
        >
          <span>Outgoing Invitations</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'outgoing_invites'
                ? 'bg-white/20 text-white'
                : 'bg-surface-subtle text-text-muted'
            }`}
          >
            {requests.outgoingInvites.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('outgoing_join')}
          className={`px-4 py-2 rounded-pill text-xs font-sans font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'outgoing_join'
              ? 'bg-accent text-white shadow-sm'
              : 'bg-surface text-text-muted hover:text-text border border-border'
          }`}
        >
          <span>Outgoing Join Requests</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'outgoing_join'
                ? 'bg-white/20 text-white'
                : 'bg-surface-subtle text-text-muted'
            }`}
          >
            {requests.outgoingJoinRequests.length}
          </span>
        </button>
      </div>

      {/* Filter by Status Pills */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-text-muted uppercase font-semibold text-[10px] tracking-wider">
          Filter Status:
        </span>
        {(['all', 'pending', 'resolved'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-pill border capitalize transition-colors ${
              statusFilter === s
                ? 'bg-surface-subtle text-text border-text font-medium'
                : 'bg-surface text-text-muted border-border hover:border-text-muted/40'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Request Cards Feed */}
      {currentList.length === 0 ? (
        <div className="py-20 text-center text-text-muted space-y-2 bg-surface rounded-card border border-border">
          <Inbox className="w-8 h-8 text-accent/60 mx-auto" />
          <h4 className="font-serif text-lg text-text">No requests in this category</h4>
          <p className="text-xs max-w-sm mx-auto">
            {activeTab === 'incoming_invites' &&
              "When teams invite you to collaborate, their invitations will appear here."}
            {activeTab === 'incoming_join' &&
              "Students requesting to join your created teams will appear here for your approval."}
            {activeTab === 'outgoing_invites' &&
              "Invitations you have dispatched to prospective teammates will be tracked here."}
            {activeTab === 'outgoing_join' &&
              "Teams you have asked to join will be listed here with their response status."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((req) => {
            const isPending = req.status === 'pending';

            return (
              <div
                key={req.id}
                className="bg-surface border border-border rounded-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-text-muted/40 transition-colors shadow-sm"
              >
                {/* Information Segment */}
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    {statusBadge(req.status)}
                    <span className="text-xs text-text-muted">
                      {new Date(req.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Context Title based on Tab */}
                  <div>
                    {activeTab === 'incoming_invites' && (
                      <h4 className="font-serif font-medium text-lg text-text">
                        Invited to join <span className="text-accent">{req.team?.name}</span>
                      </h4>
                    )}
                    {activeTab === 'incoming_join' && (
                      <h4 className="font-serif font-medium text-lg text-text">
                        <span
                          className="hover:underline cursor-pointer text-accent"
                          onClick={() => req.sender_profile && setInspectedProfile(req.sender_profile)}
                        >
                          {req.sender_profile?.name || 'A Student'}
                        </span>{' '}
                        wants to join <span className="text-text">{req.team?.name}</span>
                      </h4>
                    )}
                    {activeTab === 'outgoing_invites' && (
                      <h4 className="font-serif font-medium text-lg text-text">
                        Invited{' '}
                        <span
                          className="hover:underline cursor-pointer text-accent"
                          onClick={() =>
                            req.recipient_profile && setInspectedProfile(req.recipient_profile)
                          }
                        >
                          {req.recipient_profile?.name || 'A Student'}
                        </span>{' '}
                        to join {req.team?.name}
                      </h4>
                    )}
                    {activeTab === 'outgoing_join' && (
                      <h4 className="font-serif font-medium text-lg text-text">
                        You requested to join <span className="text-accent">{req.team?.name}</span>
                      </h4>
                    )}

                    <div className="text-xs text-text-muted mt-1 space-x-2">
                      <span>
                        Role: <strong className="text-text font-medium">{req.role || 'Member'}</strong>
                      </span>
                      <span>•</span>
                      <span>Domain: {req.team?.project_domain}</span>
                    </div>
                  </div>

                  {/* Intro Note / Message */}
                  {req.message && (
                    <div className="p-3 rounded-card bg-surface-subtle text-xs text-text-muted leading-relaxed font-sans italic border border-border/60">
                      "{req.message}"
                    </div>
                  )}
                </div>

                {/* Action Segment */}
                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border">
                  {/* View Profile Action */}
                  {(activeTab === 'incoming_join' || activeTab === 'outgoing_invites') && (
                    <Button
                      type="button"
                      variant="subtle"
                      size="sm"
                      onClick={() => {
                        const target =
                          activeTab === 'incoming_join'
                            ? req.sender_profile
                            : req.recipient_profile;
                        if (target) setInspectedProfile(target);
                      }}
                    >
                      View Student Profile
                    </Button>
                  )}

                  {/* Actions for Incoming Items (Accept / Reject) */}
                  {(activeTab === 'incoming_invites' || activeTab === 'incoming_join') && isPending && (
                    <>
                      <Button
                        type="button"
                        variant="subtle"
                        size="sm"
                        onClick={() => handleReject(req.id)}
                      >
                        Decline
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        onClick={() => handleAccept(req.id)}
                      >
                        Accept
                      </Button>
                    </>
                  )}

                  {/* Actions for Outgoing Items (Cancel) */}
                  {(activeTab === 'outgoing_invites' || activeTab === 'outgoing_join') && isPending && (
                    <Button
                      type="button"
                      variant="subtle"
                      size="sm"
                      icon={<Ban className="w-3.5 h-3.5" />}
                      onClick={() => handleCancel(req.id)}
                    >
                      Cancel Request
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Profile Detail Modal */}
      <ProfileDetailModal
        profile={inspectedProfile}
        isOpen={Boolean(inspectedProfile)}
        onClose={() => setInspectedProfile(null)}
      />
    </div>
  );
};
