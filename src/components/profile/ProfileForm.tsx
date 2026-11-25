import React, { useState, useEffect } from 'react';
import {
  Save,
  Check,
  Github,
  Linkedin,
  Globe,
  Clock,
} from 'lucide-react';
import { AcademicYear, Profile, Skill } from '../../shared/types';
import { SkillTagInput } from './SkillTagInput';
import { SimpleTagInput } from './SimpleTagInput';
import { Button } from '../common/Button';

interface ProfileFormProps {
  initialProfile: Profile;
  onSave: (updated: Partial<Profile>) => Promise<void>;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ initialProfile, onSave }) => {
  const [name, setName] = useState(initialProfile.name || '');
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url || '');
  const [college, setCollege] = useState(initialProfile.college || '');
  const [department, setDepartment] = useState(initialProfile.department || '');
  const [year, setYear] = useState<AcademicYear>(initialProfile.year || 2);
  const [bio, setBio] = useState(initialProfile.bio || '');
  const [skills, setSkills] = useState<Skill[]>(initialProfile.skills || []);
  const [interests, setInterests] = useState<string[]>(initialProfile.interests || []);
  const [learningGoals, setLearningGoals] = useState<string[]>(initialProfile.learning_goals || []);
  const [preferredDomains, setPreferredDomains] = useState<string[]>(
    initialProfile.preferred_domains || []
  );
  const [weeklyAvailability, setWeeklyAvailability] = useState<number>(
    initialProfile.weekly_availability || 12
  );
  const [githubUrl, setGithubUrl] = useState(initialProfile.github_url || '');
  const [linkedinUrl, setLinkedinUrl] = useState(initialProfile.linkedin_url || '');
  const [portfolioUrl, setPortfolioUrl] = useState(initialProfile.portfolio_url || '');
  const [otherUrl, setOtherUrl] = useState(initialProfile.other_url || '');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setName(initialProfile.name || '');
    setAvatarUrl(initialProfile.avatar_url || '');
    setCollege(initialProfile.college || '');
    setDepartment(initialProfile.department || '');
    setYear(initialProfile.year || 2);
    setBio(initialProfile.bio || '');
    setSkills(initialProfile.skills || []);
    setInterests(initialProfile.interests || []);
    setLearningGoals(initialProfile.learning_goals || []);
    setPreferredDomains(initialProfile.preferred_domains || []);
    setWeeklyAvailability(initialProfile.weekly_availability || 12);
    setGithubUrl(initialProfile.github_url || '');
    setLinkedinUrl(initialProfile.linkedin_url || '');
    setPortfolioUrl(initialProfile.portfolio_url || '');
    setOtherUrl(initialProfile.other_url || '');
  }, [initialProfile]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!college.trim()) errs.college = 'College or University is required';
    if (!department.trim()) errs.department = 'Department is required';
    if (skills.length === 0) errs.skills = 'Please add at least one technical skill';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || saving) return;

    setSaving(true);
    setSavedSuccess(false);

    try {
      await onSave({
        name: name.trim(),
        avatar_url: avatarUrl.trim() || undefined,
        college: college.trim(),
        department: department.trim(),
        year,
        bio: bio.trim(),
        skills,
        interests,
        learning_goals: learningGoals,
        preferred_domains: preferredDomains,
        weekly_availability: weeklyAvailability,
        github_url: githubUrl.trim() || undefined,
        linkedin_url: linkedinUrl.trim() || undefined,
        portfolio_url: portfolioUrl.trim() || undefined,
        other_url: otherUrl.trim() || undefined,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* 1. Basic Info Section */}
      <div className="bg-surface border border-border rounded-card p-6 space-y-4">
        <h4 className="font-display font-medium text-lg text-text border-b border-border pb-2.5">
          Basic Student Information
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Full Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ananya Sharma"
              className={`w-full px-3.5 py-2 rounded-pill bg-surface border text-sm text-text outline-none focus:border-accent ${
                errors.name ? 'border-danger' : 'border-border'
              }`}
            />
            {errors.name && <p className="text-[11px] text-danger mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Profile Picture URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2 rounded-pill bg-surface border border-border text-sm text-text outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-text mb-1">
              College / University <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. BMS College of Engineering, Bengaluru"
              className={`w-full px-3.5 py-2 rounded-pill bg-surface border text-sm text-text outline-none focus:border-accent ${
                errors.college ? 'border-danger' : 'border-border'
              }`}
            />
            {errors.college && <p className="text-[11px] text-danger mt-1">{errors.college}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">Academic Year</label>
            <div className="grid grid-cols-4 gap-1.5">
              {([1, 2, 3, 4] as AcademicYear[]).map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYear(y)}
                  className={`py-2 text-xs font-sans rounded-pill border transition-colors ${
                    year === y
                      ? 'bg-accent text-white border-accent font-semibold'
                      : 'bg-surface-subtle text-text border-border hover:border-text-muted/40'
                  }`}
                >
                  Yr {y}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text mb-1">
            Department / Major <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g. Computer Science & Engineering"
            className={`w-full px-3.5 py-2 rounded-pill bg-surface border text-sm text-text outline-none focus:border-accent ${
              errors.department ? 'border-danger' : 'border-border'
            }`}
          />
          {errors.department && (
            <p className="text-[11px] text-danger mt-1">{errors.department}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-text mb-1">Short Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Describe your technical background, hackathon goals, and what projects excite you..."
            className="w-full px-3.5 py-2 rounded-card bg-surface border border-border text-sm text-text outline-none focus:border-accent resize-none"
          />
        </div>
      </div>

      {/* 2. Technical Skills Section */}
      <div className="bg-surface border border-border rounded-card p-6 space-y-4">
        <h4 className="font-display font-medium text-lg text-text border-b border-border pb-2.5">
          Skills & Technical Expertise
        </h4>

        <SkillTagInput
          skills={skills}
          onChange={setSkills}
          label="Technical Skills with Proficiency Level (1 to 5)"
          placeholder="e.g. React, Python, C++, Docker, ROS2..."
        />
        {errors.skills && <p className="text-[11px] text-danger">{errors.skills}</p>}

        <div className="pt-2">
          <SimpleTagInput
            tags={learningGoals}
            onChange={setLearningGoals}
            label="Currently Learning / Growth Targets"
            sublabel="Skills you want to pick up on your next project"
            placeholder="e.g. Kubernetes, WebSockets, Rust..."
            variant="accent"
          />
        </div>
      </div>

      {/* 3. Interests & Project Domains */}
      <div className="bg-surface border border-border rounded-card p-6 space-y-4">
        <h4 className="font-display font-medium text-lg text-text border-b border-border pb-2.5">
          Interests, Domains & Availability
        </h4>

        <SimpleTagInput
          tags={preferredDomains}
          onChange={setPreferredDomains}
          label="Preferred Project Domains"
          sublabel="Helps other students invite you to relevant builds"
          placeholder="e.g. FinTech, Artificial Intelligence, Robotics, HealthTech..."
          variant="stretch"
        />

        <div className="pt-2">
          <SimpleTagInput
            tags={interests}
            onChange={setInterests}
            label="Areas of Interest & Hobbies"
            placeholder="e.g. Open Source, Autonomous Vehicles, Competitive Coding..."
          />
        </div>

        {/* Weekly Availability Slider */}
        <div className="pt-3 border-t border-border/80">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-text flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-accent" />
              <span>Weekly Availability for Collaborative Projects:</span>
            </label>
            <span className="text-sm font-semibold text-accent font-mono">
              {weeklyAvailability} hours/week
            </span>
          </div>
          <input
            type="range"
            min={4}
            max={40}
            step={2}
            value={weeklyAvailability}
            onChange={(e) => setWeeklyAvailability(Number(e.target.value))}
            className="w-full accent-accent cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-text-muted mt-1">
            <span>4 hrs (Casual)</span>
            <span>15 hrs (Active sprint)</span>
            <span>40 hrs (Full hackathon mode)</span>
          </div>
        </div>
      </div>

      {/* 4. Social & External Links */}
      <div className="bg-surface border border-border rounded-card p-6 space-y-4">
        <h4 className="font-display font-medium text-lg text-text border-b border-border pb-2.5">
          External Links & Showcase
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text mb-1 flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5 text-text-muted" />
              <span>GitHub URL</span>
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/your-username"
              className="w-full px-3.5 py-2 rounded-pill bg-surface border border-border text-sm text-text outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1 flex items-center gap-1.5">
              <Linkedin className="w-3.5 h-3.5 text-text-muted" />
              <span>LinkedIn URL</span>
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/your-profile"
              className="w-full px-3.5 py-2 rounded-pill bg-surface border border-border text-sm text-text outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-text-muted" />
              <span>Portfolio / Personal Website</span>
            </label>
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://yourwebsite.dev"
              className="w-full px-3.5 py-2 rounded-pill bg-surface border border-border text-sm text-text outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Other Link (Blog, Twitter, Substack)
            </label>
            <input
              type="url"
              value={otherUrl}
              onChange={(e) => setOtherUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2 rounded-pill bg-surface border border-border text-sm text-text outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-2">
        <div>
          {savedSuccess && (
            <span className="inline-flex items-center gap-1.5 text-xs text-success font-medium animate-fadeIn">
              <Check className="w-4 h-4" /> Profile saved and persisted successfully!
            </span>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          icon={<Save className="w-4 h-4" />}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
};
