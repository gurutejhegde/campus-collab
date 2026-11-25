import React, { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { Team } from '../../shared/types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface RequestJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTeam: Team | null;
  onSendJoinRequest: (teamId: string, role: string, message: string) => Promise<void>;
}

export const RequestJoinModal: React.FC<RequestJoinModalProps> = ({
  isOpen,
  onClose,
  targetTeam,
  onSendJoinRequest,
}) => {
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  if (!targetTeam) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setSending(true);
    try {
      await onSendJoinRequest(
        targetTeam.id,
        role.trim() || 'Contributor',
        message.trim() || `Hi! I would love to collaborate on ${targetTeam.name}.`
      );
      setRole('');
      setMessage('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit join request');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Request to Join ${targetTeam.name}`}
      subtitle={`Project Domain: ${targetTeam.project_domain}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-card bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Team Preview Card */}
        <div className="p-3.5 rounded-card bg-surface-subtle border border-border space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-card bg-accent/10 border border-accent/25 text-accent font-semibold text-sm flex items-center justify-center shrink-0 overflow-hidden">
              {targetTeam.logo_url ? (
                <img
                  src={targetTeam.logo_url}
                  alt={targetTeam.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                targetTeam.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <h5 className="font-serif font-medium text-sm text-text">{targetTeam.name}</h5>
              <p className="text-[11px] text-text-muted">{targetTeam.description}</p>
            </div>
          </div>

          {targetTeam.open_roles && targetTeam.open_roles.length > 0 && (
            <div className="pt-1.5 border-t border-border/60">
              <span className="text-[10px] uppercase font-semibold text-text-muted tracking-wider block mb-1">
                Open Positions Available:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {targetTeam.open_roles.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className="px-2.5 py-0.5 rounded-pill text-[11px] font-sans bg-accent/10 hover:bg-accent/20 text-accent border border-accent/25 transition-colors"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-text mb-1">
            Role You Want to Fill
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Frontend Developer, ML Engineer, Hardware Lead"
            className="w-full px-3.5 py-2 rounded-pill bg-surface border border-border text-xs text-text outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text mb-1">
            Intro Note to Team Lead
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Introduce your relevant skills, past projects, or why you're interested in this challenge..."
            className="w-full px-3.5 py-2 rounded-card bg-surface border border-border text-xs text-text outline-none focus:border-accent resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button type="button" variant="subtle" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={<Send className="w-3.5 h-3.5" />}
            disabled={sending}
          >
            {sending ? 'Submitting...' : 'Send Join Request'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
