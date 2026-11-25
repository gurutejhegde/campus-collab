import React, { useState } from 'react';
import { Plus, Globe, Lock } from 'lucide-react';
import { TeamVisibility } from '../../shared/types';
import { Modal } from '../common/Modal';
import { SimpleTagInput } from '../profile/SimpleTagInput';
import { Button } from '../common/Button';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  onCreateTeam: (teamData: {
    name: string;
    description: string;
    logo_url?: string;
    creator_id: string;
    project_domain: string;
    required_skills: string[];
    open_roles: string[];
    visibility: TeamVisibility;
    initial_member_role?: string;
  }) => Promise<void>;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  onClose,
  creatorId,
  onCreateTeam,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [projectDomain, setProjectDomain] = useState('Artificial Intelligence & ML');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [openRoles, setOpenRoles] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<TeamVisibility>('open');
  const [initialRole, setInitialRole] = useState('Team Lead & Architect');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const domains = [
    'Artificial Intelligence & ML',
    'Robotics & Autonomous Systems',
    'E-Commerce & FinTech',
    'HealthTech & Bio-Engineering',
    'CleanTech & Mobility',
    'Cybersecurity & Privacy',
    'Web3 & Distributed Systems',
    'Developer Tools & Infrastructure',
    'EdTech & Social Impact',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide a team or project name');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a short description of the project');
      return;
    }

    setSaving(true);
    try {
      await onCreateTeam({
        name: name.trim(),
        description: description.trim(),
        logo_url: logoUrl.trim() || undefined,
        creator_id: creatorId,
        project_domain: projectDomain,
        required_skills: requiredSkills,
        open_roles: openRoles,
        visibility,
        initial_member_role: initialRole.trim() || 'Team Lead',
      });

      // Reset form
      setName('');
      setDescription('');
      setLogoUrl('');
      setRequiredSkills([]);
      setOpenRoles([]);
      setVisibility('open');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create team');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create a New Team"
      subtitle="Assemble collaborators for a hackathon, research build, or campus venture"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-card bg-danger/10 border border-danger/30 text-danger text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-text mb-1">
            Team / Project Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. AeroNav AI, CampusKart"
            className="w-full px-3.5 py-2 rounded-pill bg-surface border border-border text-sm text-text outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text mb-1">
            Project Description & Goals <span className="text-danger">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What problem does this project tackle? What are you planning to build together?"
            className="w-full px-3.5 py-2 rounded-card bg-surface border border-border text-sm text-text outline-none focus:border-accent resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text mb-1">Project Domain</label>
            <select
              value={projectDomain}
              onChange={(e) => setProjectDomain(e.target.value)}
              className="w-full px-3 py-2 rounded-pill bg-surface border border-border text-xs text-text outline-none focus:border-accent cursor-pointer"
            >
              {domains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">Logo / Avatar URL</label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2 rounded-pill bg-surface border border-border text-xs text-text outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Required Skills & Open Positions */}
        <SimpleTagInput
          tags={requiredSkills}
          onChange={setRequiredSkills}
          label="Required Technical Skills"
          sublabel="Technologies your team will use"
          placeholder="e.g. React, Python, C++, ROS2..."
        />

        <SimpleTagInput
          tags={openRoles}
          onChange={setOpenRoles}
          label="Open Positions / Roles Looking For"
          sublabel="Roles open for other students to apply"
          placeholder="e.g. Frontend Developer, ML Researcher, 3D Modeler..."
          variant="accent"
        />

        {/* Visibility Setting */}
        <div className="pt-2 border-t border-border">
          <label className="block text-xs font-medium text-text mb-2">Team Visibility</label>
          <div className="grid grid-cols-2 gap-2.5">
            <label
              className={`p-3 rounded-card border cursor-pointer flex items-start gap-2.5 transition-colors ${
                visibility === 'open'
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-surface hover:border-text-muted/40'
              }`}
            >
              <input
                type="radio"
                name="team_visibility"
                checked={visibility === 'open'}
                onChange={() => setVisibility('open')}
                className="mt-0.5 accent-accent"
              />
              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-text">
                  <Globe className="w-3.5 h-3.5 text-success" />
                  <span>Open Team</span>
                </div>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Listed in Explore. Other students can submit join requests.
                </p>
              </div>
            </label>

            <label
              className={`p-3 rounded-card border cursor-pointer flex items-start gap-2.5 transition-colors ${
                visibility === 'invite_only'
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-surface hover:border-text-muted/40'
              }`}
            >
              <input
                type="radio"
                name="team_visibility"
                checked={visibility === 'invite_only'}
                onChange={() => setVisibility('invite_only')}
                className="mt-0.5 accent-accent"
              />
              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-text">
                  <Lock className="w-3.5 h-3.5 text-text-muted" />
                  <span>Invite-Only</span>
                </div>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Only students invited directly by the team lead can join.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Your Role */}
        <div>
          <label className="block text-xs font-medium text-text mb-1">
            Your Role in this Team
          </label>
          <input
            type="text"
            value={initialRole}
            onChange={(e) => setInitialRole(e.target.value)}
            placeholder="e.g. Team Lead & Full Stack"
            className="w-full px-3.5 py-2 rounded-pill bg-surface border border-border text-sm text-text outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="subtle" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            disabled={saving}
          >
            {saving ? 'Creating...' : 'Create Team'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
