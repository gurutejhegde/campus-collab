import React, { useEffect, useState } from 'react';
import { Profile, Team } from '../../core/types/domain';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';

interface InviteStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetStudent: Profile | null;
  ledTeams: Team[];
  onInvite: (teamId: string, proposedRole: string, message: string) => Promise<void>;
}

export const InviteStudentModal: React.FC<InviteStudentModalProps> = ({
  isOpen,
  onClose,
  targetStudent,
  ledTeams,
  onInvite,
}) => {
  const [teamId, setTeamId] = useState('');
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const first = ledTeams[0];
    setTeamId(first?.id || '');
    setRole(first?.open_roles?.[0] || 'Core Teammate');
    setMessage('');
    setError(null);
  }, [isOpen, ledTeams]);

  if (!targetStudent) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) {
      setError('Create a team first before inviting teammates.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onInvite(teamId, role.trim() || 'Teammate', message.trim());
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invite ${targetStudent.name}`}
      subtitle={`${targetStudent.college} · ${targetStudent.weekly_availability} hrs/wk`}
      maxWidth="sm"
    >
      {ledTeams.length === 0 ? (
        <div className="space-y-4">
          <p className="text-xs text-text-muted leading-relaxed">
            You do not lead any teams yet. Create a standalone idea team or an event team first, then invite teammates.
          </p>
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-control bg-danger/10 border border-danger/30 text-xs text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Select Team</label>
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full px-3 py-2 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong"
            >
              {ledTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.members?.length || 1}/{t.max_members})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Proposed Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Frontend Lead"
              className="w-full px-3 py-2 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Message (Optional)</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell them why their skills or learning goals fit your team..."
              className="w-full px-3 py-2 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Invite'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
