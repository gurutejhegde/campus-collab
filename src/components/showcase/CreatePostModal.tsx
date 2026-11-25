import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ProjectPost } from '../../shared/types';
import { Sparkles } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ProjectPost, 'id' | 'upvotes' | 'comments_count' | 'created_at'>) => Promise<void>;
  currentProfile: {
    id: string;
    name: string;
    avatar_url?: string;
    college: string;
    department?: string;
  };
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentProfile,
}) => {
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['React', 'TypeScript']);
  const [seekingTeammates, setSeekingTeammates] = useState(false);
  const [desiredSkillsInput, setDesiredSkillsInput] = useState('');
  const [desiredSkills, setDesiredSkills] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddDesiredSkill = () => {
    const trimmed = desiredSkillsInput.trim();
    if (trimmed && !desiredSkills.includes(trimmed)) {
      setDesiredSkills([...desiredSkills, trimmed]);
      setDesiredSkillsInput('');
    }
  };

  const handleRemoveDesiredSkill = (skillToRemove: string) => {
    setDesiredSkills(desiredSkills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Project title is required');
      return;
    }
    if (!tagline.trim()) {
      setError('A short tagline is required');
      return;
    }
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    if (tags.length === 0) {
      setError('Add at least one technology tag');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        author_id: currentProfile.id,
        author_name: currentProfile.name,
        author_avatar: currentProfile.avatar_url,
        author_college: currentProfile.college,
        author_department: currentProfile.department,
        title: title.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        media_url: mediaUrl.trim() || undefined,
        demo_url: demoUrl.trim() || undefined,
        github_url: githubUrl.trim() || undefined,
        tags,
        seeking_teammates: seekingTeammates,
        desired_skills: seekingTeammates && desiredSkills.length > 0 ? desiredSkills : undefined,
      });

      // Reset
      setTitle('');
      setTagline('');
      setDescription('');
      setMediaUrl('');
      setDemoUrl('');
      setGithubUrl('');
      setTags(['React', 'TypeScript']);
      setSeekingTeammates(false);
      setDesiredSkills([]);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to publish project showcase');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Showcase Your Project"
      subtitle="Share your build with student engineers, receive peer upvotes, and discover collaborators."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs rounded-lg bg-danger/10 text-danger border border-danger/20">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-text mb-1">
            Project Title <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. AeroTelemetry Ground Control"
            className="w-full px-3 py-2 text-sm bg-surface-subtle border border-border rounded-lg text-text focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text mb-1">
            One-line Pitch / Tagline <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            required
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g. Sub-millisecond UDP telemetry broadcaster and 3D visualizer for multi-rotor swarms."
            className="w-full px-3 py-2 text-sm bg-surface-subtle border border-border rounded-lg text-text focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text mb-1">
            Description & Build Details <span className="text-danger">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain the problem you solved, architecture, and current status..."
            className="w-full px-3 py-2 text-sm bg-surface-subtle border border-border rounded-lg text-text focus:outline-none focus:border-accent resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Live Demo URL
            </label>
            <input
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://myproject.dev"
              className="w-full px-3 py-2 text-sm bg-surface-subtle border border-border rounded-lg text-text focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              GitHub Repository URL
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/org/repo"
              className="w-full px-3 py-2 text-sm bg-surface-subtle border border-border rounded-lg text-text focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text mb-1">
            Cover Image / Media URL (Optional)
          </label>
          <input
            type="url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://images.unsplash.com/... or direct image link"
            className="w-full px-3 py-2 text-sm bg-surface-subtle border border-border rounded-lg text-text focus:outline-none focus:border-accent"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-medium text-text mb-1">
            Tech Tags <span className="text-danger">*</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Type tag (e.g. Next.js, Rust, OpenCV) and hit Enter"
              className="flex-1 px-3 py-1.5 text-sm bg-surface-subtle border border-border rounded-lg text-text focus:outline-none focus:border-accent"
            />
            <Button type="button" variant="secondary" size="sm" onClick={handleAddTag}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono bg-surface-elevated text-text border border-border"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-text-muted hover:text-danger ml-1"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Seeking Teammates Section */}
        <div className="p-3.5 rounded-lg border border-border bg-surface-subtle/50 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={seekingTeammates}
              onChange={(e) => setSeekingTeammates(e.target.checked)}
              className="rounded border-border text-accent focus:ring-accent"
            />
            <span className="text-xs font-medium text-text flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              I am actively seeking teammates or collaborators for this project
            </span>
          </label>

          {seekingTeammates && (
            <div className="pt-2 border-t border-border/60">
              <label className="block text-xs text-text-muted mb-1">
                Desired Skills / Roles needed:
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={desiredSkillsInput}
                  onChange={(e) => setDesiredSkillsInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddDesiredSkill();
                    }
                  }}
                  placeholder="e.g. ROS2, FastAPI, UI Designer"
                  className="flex-1 px-3 py-1.5 text-sm bg-surface border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleAddDesiredSkill}>
                  Add Skill
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {desiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-accent/15 text-accent border border-accent/25"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveDesiredSkill(skill)}
                      className="text-accent hover:text-danger ml-0.5"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-border flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={submitting}>
            {submitting ? 'Publishing...' : 'Publish Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
