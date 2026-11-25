import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CampusEvent, EventCategory, EventFormat } from '../../shared/types';
import { Calendar, Shield } from 'lucide-react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: Omit<CampusEvent, 'id' | 'created_at'>) => Promise<void>;
  creatorId: string;
  creatorRole: string;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  creatorId,
  creatorRole,
}) => {
  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [category, setCategory] = useState<EventCategory>('hackathon');
  const [format, setFormat] = useState<EventFormat>('offline');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Hackathon', 'Coding']);
  const [description, setDescription] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !organizer.trim() || !description.trim() || !registrationUrl.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    if (!startDate || !deadline) {
      setError('Please specify start date and registration deadline');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        title: title.trim(),
        organizer: organizer.trim(),
        description: description.trim(),
        category,
        format,
        location: location.trim() || (format === 'online' ? 'Online / Virtual' : 'Campus Auditorium'),
        start_date: new Date(startDate).toISOString(),
        end_date: endDate ? new Date(endDate).toISOString() : new Date(startDate).toISOString(),
        registration_deadline: new Date(deadline).toISOString(),
        eligibility: eligibility.trim() || 'Open to all undergraduate college students with valid student ID.',
        registration_url: registrationUrl.trim(),
        tags,
        is_demo_sample: false,
        created_by_id: creatorId,
        created_by_role: creatorRole as any,
      });

      // Reset
      setTitle('');
      setOrganizer('');
      setLocation('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setDeadline('');
      setEligibility('');
      setRegistrationUrl('');
      setTags(['Hackathon', 'Coding']);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Host a Campus Event"
      subtitle="Publish hackathons, coding contests, or technical workshops for the student community."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs rounded-lg bg-danger/10 text-danger border border-danger/20">
            {error}
          </div>
        )}

        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-accent/10 border border-accent/20 text-xs text-accent">
          <Shield className="w-4 h-4 shrink-0" />
          <span>
            Publishing as authorized <strong>{creatorRole.toUpperCase()}</strong>. Events appear immediately in the campus events directory.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Event Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bangalore Inter-College Hackathon 2026"
              className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border rounded-lg text-text focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Host / Organizing Club <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              placeholder="e.g. ACM Student Chapter & Tech Council"
              className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border rounded-lg text-text focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-text mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as EventCategory)}
              className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border rounded-lg text-text focus:outline-none focus:border-accent"
            >
              <option value="hackathon">Hackathon</option>
              <option value="competition">Coding Contest</option>
              <option value="workshop">Technical Workshop</option>
              <option value="conference">Conference</option>
              <option value="exhibition">Project Expo</option>
              <option value="other">General Event</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as EventFormat)}
              className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border rounded-lg text-text focus:outline-none focus:border-accent"
            >
              <option value="offline">Offline / On Campus</option>
              <option value="online">Online / Virtual</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">Venue / Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Main Auditorium / Zoom"
              className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border rounded-lg text-text focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Start Date & Time <span className="text-danger">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border rounded-lg text-text focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">End Date (Optional)</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border rounded-lg text-text focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Registration Deadline <span className="text-danger">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border rounded-lg text-text focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Official Registration URL <span className="text-danger">*</span>
            </label>
            <input
              type="url"
              required
              value={registrationUrl}
              onChange={(e) => setRegistrationUrl(e.target.value)}
              placeholder="https://unstop.com/... or Google Form"
              className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border rounded-lg text-text focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">Eligibility Criteria</label>
            <input
              type="text"
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
              placeholder="e.g. All engineering undergraduates"
              className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border rounded-lg text-text focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text mb-1">
            Event Description <span className="text-danger">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe schedule, prize pool, problem statements, and rules..."
            className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border rounded-lg text-text focus:outline-none focus:border-accent resize-none"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-medium text-text mb-1">Tags & Domains</label>
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
              placeholder="Type tag (e.g. AI, Web3, IoT) and press Enter"
              className="flex-1 px-3 py-1.5 text-xs bg-surface-subtle border border-border rounded-lg text-text focus:outline-none focus:border-accent"
            />
            <Button type="button" variant="secondary" size="sm" onClick={handleAddTag}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono bg-surface-elevated text-text border border-border"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="text-text-muted hover:text-danger ml-1"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-border flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={submitting}
            icon={<Calendar className="w-3.5 h-3.5" />}
          >
            {submitting ? 'Publishing...' : 'Publish Event'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
