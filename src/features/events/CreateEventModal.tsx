import React, { useState } from 'react';
import { CampusEvent } from '../../core/types/domain';
import { CreateEventInput } from '../../core/data/dataStore';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  onCreate: (input: CreateEventInput) => Promise<void>;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  creatorId,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [category, setCategory] = useState<CampusEvent['category']>('hackathon');
  const [format, setFormat] = useState<CampusEvent['format']>('offline');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [tagsRaw, setTagsRaw] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !organizer.trim() || !description.trim() || !startDate || !deadline) {
      setError('Title, organizer, description, start date, and deadline are required.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const tags = tagsRaw
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onCreate({
        title: title.trim(),
        organizer: organizer.trim(),
        description: description.trim(),
        category,
        format,
        location: location.trim() || (format === 'online' ? 'Online' : 'Campus Venue'),
        start_date: new Date(startDate).toISOString(),
        end_date: endDate ? new Date(endDate).toISOString() : new Date(startDate).toISOString(),
        registration_deadline: new Date(deadline).toISOString(),
        registration_url: registrationUrl.trim(),
        tags,
        created_by: creatorId,
      });

      setTitle('');
      setOrganizer('');
      setLocation('');
      setDescription('');
      setRegistrationUrl('');
      setTagsRaw('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create event.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Post Campus Event"
      subtitle="Admin-only: students can discover this event and form teams inside it."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-control bg-danger/10 border border-danger/30 text-xs text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Event Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Smart India Hackathon Internal Round 2026"
              className="w-full px-3 py-2 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Organizer *</label>
            <input
              type="text"
              required
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              placeholder="ACM Student Chapter"
              className="w-full px-3 py-2 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CampusEvent['category'])}
              className="w-full px-3 py-2 text-[13px] bg-well border border-border rounded-control text-text"
            >
              <option value="hackathon">Hackathon</option>
              <option value="competition">Competition</option>
              <option value="workshop">Workshop</option>
              <option value="conference">Conference</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as CampusEvent['format'])}
              className="w-full px-3 py-2 text-[13px] bg-well border border-border rounded-control text-text"
            >
              <option value="offline">Offline</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Main Auditorium / Zoom"
              className="w-full px-3 py-2 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Start Date *</label>
            <input
              type="datetime-local"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-well border border-border rounded-control text-text"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">End Date</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-well border border-border rounded-control text-text"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Registration Deadline *</label>
            <input
              type="datetime-local"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-well border border-border rounded-control text-text"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Registration URL (Optional)</label>
            <input
              type="url"
              value={registrationUrl}
              onChange={(e) => setRegistrationUrl(e.target.value)}
              placeholder="https://unstop.com/..."
              className="w-full px-3 py-2 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={tagsRaw}
              onChange={(e) => setTagsRaw(e.target.value)}
              placeholder="AI, IoT, Web"
              className="w-full px-3 py-2 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Description *</label>
          <textarea
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Team size rules, problem themes, prizes..."
            className="w-full px-3 py-2 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={submitting}>
            {submitting ? 'Publishing...' : 'Publish Event'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
