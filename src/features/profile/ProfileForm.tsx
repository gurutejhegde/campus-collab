import React, { useState } from 'react';
import { AcademicYear, Profile, Skill } from '../../core/types/domain';
import { UpsertProfileInput } from '../../core/data/dataStore';
import { Button } from '../../ui/Button';
import { Pill } from '../../ui/Pill';
import { Plus, X } from 'lucide-react';

interface ProfileFormProps {
  userId: string;
  defaultName?: string;
  initialProfile?: Profile | null;
  submitLabel?: string;
  onSave: (input: UpsertProfileInput) => Promise<void>;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  userId,
  defaultName = '',
  initialProfile,
  submitLabel = 'Save Profile',
  onSave,
}) => {
  const [name, setName] = useState(initialProfile?.name || defaultName);
  const [college, setCollege] = useState(initialProfile?.college || '');
  const [department, setDepartment] = useState(initialProfile?.department || '');
  const [year, setYear] = useState<AcademicYear>(initialProfile?.year || 2);
  const [bio, setBio] = useState(initialProfile?.bio || '');
  const [weeklyAvailability, setWeeklyAvailability] = useState<number>(
    initialProfile?.weekly_availability || 12
  );
  const [openToLearning, setOpenToLearning] = useState<boolean>(
    initialProfile?.open_to_learning ?? true
  );

  const [skills, setSkills] = useState<Skill[]>(initialProfile?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [skillLevel, setSkillLevel] = useState<Skill['level']>(3);

  const [learningGoals, setLearningGoals] = useState<string[]>(
    initialProfile?.learning_goals || []
  );
  const [learningInput, setLearningInput] = useState('');

  const [preferredDomains, setPreferredDomains] = useState<string[]>(
    initialProfile?.preferred_domains || []
  );
  const [domainInput, setDomainInput] = useState('');

  const [githubUsername, setGithubUsername] = useState(initialProfile?.github_username || '');
  const [linkedinUrl, setLinkedinUrl] = useState(initialProfile?.linkedin_url || '');
  const [portfolioUrl, setPortfolioUrl] = useState(initialProfile?.portfolio_url || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setSkillInput('');
      return;
    }
    setSkills([...skills, { name: trimmed, level: skillLevel }]);
    setSkillInput('');
  };

  const addTag = (value: string, list: string[], setList: (next: string[]) => void, clear: () => void) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (!list.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      setList([...list, trimmed]);
    }
    clear();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !college.trim() || !department.trim()) {
      setError('Name, college, and department are required.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave({
        id: userId,
        name: name.trim(),
        college: college.trim(),
        department: department.trim(),
        year,
        bio: bio.trim(),
        skills,
        learning_goals: learningGoals,
        preferred_domains: preferredDomains,
        weekly_availability: weeklyAvailability,
        open_to_learning: openToLearning,
        github_username: githubUsername.trim().replace(/^@/, '') || null,
        github_overview: initialProfile?.github_overview || null,
        linkedin_url: linkedinUrl.trim() || null,
        portfolio_url: portfolioUrl.trim() || null,
        onboarding_completed: true,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 rounded-control bg-danger/10 border border-danger/30 text-xs text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Full Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ananya Sharma"
            className="w-full px-3 py-2 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">College / University *</label>
          <input
            type="text"
            required
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            placeholder="BMS College of Engineering"
            className="w-full px-3 py-2 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Department / Branch *</label>
          <input
            type="text"
            required
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Computer Science & Engineering"
            className="w-full px-3 py-2 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value) as AcademicYear)}
              className="w-full px-3 py-2 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong"
            >
              <option value={1}>Year 1</option>
              <option value={2}>Year 2</option>
              <option value={3}>Year 3</option>
              <option value={4}>Year 4</option>
              <option value={5}>Masters / Year 5</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Hours / Week</label>
            <input
              type="number"
              min={1}
              max={80}
              value={weeklyAvailability}
              onChange={(e) => setWeeklyAvailability(Number(e.target.value) || 10)}
              className="w-full px-3 py-2 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">Short Bio & What You Want to Build</label>
        <textarea
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="What projects excite you, what roles you want, or what you're eager to learn..."
          className="w-full px-3 py-2 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong resize-none"
        />
      </div>

      {/* Skills with Proficiency */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-text-muted">Technical Skills & Proficiency (1–5)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="e.g. TypeScript, PyTorch, Figma"
            className="flex-1 px-3 py-1.5 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong"
          />
          <select
            value={skillLevel}
            onChange={(e) => setSkillLevel(Number(e.target.value) as Skill['level'])}
            className="px-2.5 py-1.5 text-xs bg-well border border-border rounded-control text-text"
          >
            <option value={1}>L1 Basics</option>
            <option value={2}>L2 Learning</option>
            <option value={3}>L3 Solid</option>
            <option value={4}>L4 Strong</option>
            <option value={5}>L5 Deep</option>
          </select>
          <Button type="button" variant="ghost" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={addSkill}>
            Add
          </Button>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {skills.map((s) => (
              <Pill key={s.name} variant="strong">
                <span>{s.name}</span>
                <span className="font-mono text-[10px] text-text-dim">L{s.level}</span>
                <button
                  type="button"
                  onClick={() => setSkills(skills.filter((item) => item.name !== s.name))}
                  className="text-text-dim hover:text-danger"
                >
                  <X className="w-3 h-3" />
                </button>
              </Pill>
            ))}
          </div>
        )}
      </div>

      {/* Learning Goals */}
      <div className="space-y-2 p-3.5 rounded-card bg-well border border-border">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-medium text-text">Currently Learning / Want to Build With</label>
          <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={openToLearning}
              onChange={(e) => setOpenToLearning(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            <span>Highlight me as a committed learner</span>
          </label>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={learningInput}
            onChange={(e) => setLearningInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(learningInput, learningGoals, setLearningGoals, () => setLearningInput(''));
              }
            }}
            placeholder="e.g. React Native, Rust, Supabase"
            className="flex-1 px-3 py-1.5 text-[13px] bg-surface border border-border rounded-control text-text focus:outline-none focus:border-border-strong"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => addTag(learningInput, learningGoals, setLearningGoals, () => setLearningInput(''))}
          >
            Add
          </Button>
        </div>
        {learningGoals.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {learningGoals.map((goal) => (
              <Pill key={goal} variant="burgundy">
                <span>{goal}</span>
                <button
                  type="button"
                  onClick={() => setLearningGoals(learningGoals.filter((g) => g !== goal))}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </Pill>
            ))}
          </div>
        )}
      </div>

      {/* Preferred Domains */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-text-muted">Preferred Project Domains</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(domainInput, preferredDomains, setPreferredDomains, () => setDomainInput(''));
              }
            }}
            placeholder="e.g. AI/ML, AgriTech, FinTech, Robotics"
            className="flex-1 px-3 py-1.5 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => addTag(domainInput, preferredDomains, setPreferredDomains, () => setDomainInput(''))}
          >
            Add
          </Button>
        </div>
        {preferredDomains.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {preferredDomains.map((d) => (
              <Pill key={d}>
                <span>{d}</span>
                <button
                  type="button"
                  onClick={() => setPreferredDomains(preferredDomains.filter((item) => item !== d))}
                  className="text-text-dim hover:text-danger"
                >
                  <X className="w-3 h-3" />
                </button>
              </Pill>
            ))}
          </div>
        )}
      </div>

      {/* Links & GitHub handle */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">GitHub Username</label>
          <input
            type="text"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            placeholder="octocat"
            className="w-full px-3 py-2 text-[13px] bg-well border border-border rounded-control text-text font-mono focus:outline-none focus:border-border-strong"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">LinkedIn URL</label>
          <input
            type="url"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/..."
            className="w-full px-3 py-2 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Portfolio URL</label>
          <input
            type="url"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            placeholder="https://yoursite.dev"
            className="w-full px-3 py-2 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Saving to Supabase...' : submitLabel}
        </Button>
      </div>
    </form>
  );
};
