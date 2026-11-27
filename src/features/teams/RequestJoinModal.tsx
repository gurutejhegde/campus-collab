import React, { useEffect, useState } from 'react';
import { Team } from '../../core/types/domain';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';

interface RequestJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  defaultRole?: string;
  onSubmit: (teamId: string, proposedRole: string, message: string) => Promise<void>;
}

export const RequestJoinModal: React.FC<RequestJoinModalProps> = ({
  isOpen,
  onClose,
  team,
  defaultRole,
  onSubmit,
}) => {
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !team) return;
    setRole(defaultRole || team.open_roles?.[0] || 'Contributor');
    setMessage('');
    setError(null);
  }, [isOpen, team, defaultRole]);

  if (!team) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(team.id, role.trim() || 'Member', message.trim());
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Request to join ${team.name}`}
      subtitle={`${team.project_domain}${team.event ? ` · ${team.event.title}` : ' · Standalone Idea'}`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-control bg-danger/10 border border-danger/30 text-xs text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Role you want to take</label>
          {team.open_roles && team.open_roles.length > 0 ? (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong"
            >
              {team.open_roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
              <option value="General Contributor">General Contributor</option>
            </select>
          ) : (
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Frontend Developer"
              className="w-full px-3 py-2 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong"
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">
            Short note to the team lead
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your relevant experience, weekly hours, or what you're eager to contribute..."
            className="w-full px-3 py-2 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send Join Request'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
