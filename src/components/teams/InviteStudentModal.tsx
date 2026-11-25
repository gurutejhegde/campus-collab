import React, { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { Profile, Team } from '../../shared/types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface InviteStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetStudent: Profile | null;
  userTeams: Team[];
  onSendInvitation: (teamId: string, role: string, message: string) => Promise<void>;
}

export const InviteStudentModal: React.FC<InviteStudentModalProps> = ({
  isOpen,
  onClose,
  targetStudent,
  userTeams,
  onSendInvitation,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    userTeams.length > 0 ? userTeams[0].id : ''
  );
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  // Update selected team if userTeams changes
  React.useEffect(() => {
    if (userTeams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(userTeams[0].id);
    }
  }, [userTeams, selectedTeamId]);

  if (!targetStudent) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedTeamId) {
      setError('Please select a team to invite this student to.');
      return;
    }

    setSending(true);
    try {
      await onSendInvitation(
        selectedTeamId,
        role.trim() || 'Collaborator',
        message.trim() || `Hey ${targetStudent.name.split(' ')[0]}, we would love to have you on our team!`
      );
      setRole('');
      setMessage('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  const selectedTeam = userTeams.find((t) => t.id === selectedTeamId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invite ${targetStudent.name} to Team`}
      subtitle={`Year ${targetStudent.year} • ${targetStudent.department}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-card bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Student Mini Preview */}
        <div className="p-3 rounded-card bg-surface-subtle border border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/15 border border-accent/30 text-accent font-semibold text-xs flex items-center justify-center shrink-0 overflow-hidden">
            {targetStudent.avatar_url ? (
              <img
                src={targetStudent.avatar_url}
                alt={targetStudent.name}
                className="w-full h-full object-cover"
              />
            ) : (
              targetStudent.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <h5 className="font-display font-medium text-sm text-text">{targetStudent.name}</h5>
            <p className="text-[11px] text-text-muted">
              {targetStudent.skills.map((s) => s.name).slice(0, 3).join(', ')}
            </p>
          </div>
        </div>

        {userTeams.length === 0 ? (
          <div className="p-4 rounded-card bg-surface-subtle text-center text-xs text-text-muted space-y-2">
            <p>You haven't created or joined any teams yet.</p>
            <p className="font-medium text-text">Create a team first before sending invitations.</p>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-xs font-medium text-text mb-1">
                Select Your Team <span className="text-danger">*</span>
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-pill bg-surface border border-border text-xs text-text outline-none focus:border-accent cursor-pointer"
              >
                {userTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.project_domain})
                  </option>
                ))}
              </select>
            </div>

            {/* If the team has open roles, offer them as quick select */}
            {selectedTeam && selectedTeam.open_roles && selectedTeam.open_roles.length > 0 && (
              <div>
                <label className="block text-xs text-text-muted mb-1">
                  Team Open Positions (Click to auto-fill):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTeam.open_roles.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className="px-2.5 py-0.5 rounded-pill text-[11px] font-sans bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 transition-colors"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-text mb-1">
                Proposed Role / Position
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Frontend Engineer, ML Specialist"
                className="w-full px-3.5 py-2 rounded-pill bg-surface border border-border text-xs text-text outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text mb-1">
                Invitation Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder={`Tell ${targetStudent.name.split(' ')[0]} what makes them a great fit for your project...`}
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
                {sending ? 'Sending...' : 'Send Team Invitation'}
              </Button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};
