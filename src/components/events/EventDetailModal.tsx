import React from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { CampusEvent } from '../../shared/types';
import { Modal } from '../common/Modal';

interface EventDetailModalProps {
  event: CampusEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  if (!event) return null;

  const categoryLabels = {
    hackathon: 'Hackathon',
    competition: 'Coding Competition',
    workshop: 'Technical Workshop',
    conference: 'Student Conference',
    exhibition: 'Project Exhibition / Expo',
    other: 'Campus Event',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={event.title}
      subtitle={`Organized by ${event.organizer} • ${categoryLabels[event.category]}`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Banner with Format & Deadline */}
        <div className="p-4 rounded-card bg-surface-subtle border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-pill text-[10px] font-sans font-semibold uppercase tracking-wider bg-accent/15 text-accent border border-accent/25">
                {event.format} Format
              </span>
              {event.is_demo_sample && (
                <span className="text-[10px] text-text-muted font-mono px-2 py-0.5 rounded bg-surface border border-border">
                  Demo Sample Event
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
              <span>{event.location}</span>
            </p>
          </div>

          <a
            href={event.registration_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-pill font-sans font-medium text-xs bg-accent hover:bg-accent-hover text-white transition-colors shrink-0 shadow-none"
          >
            <span>Visit Registration Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Schedule & Deadlines Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-card bg-surface border border-border space-y-1">
            <span className="text-text-muted flex items-center gap-1.5 uppercase font-semibold text-[10px] tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-accent" />
              <span>Event Timeline</span>
            </span>
            <p className="font-medium text-text text-sm">
              {new Date(event.start_date).toLocaleDateString([], {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}{' '}
              –{' '}
              {new Date(event.end_date).toLocaleDateString([], {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="p-3.5 rounded-card bg-surface border border-border space-y-1">
            <span className="text-text-muted flex items-center gap-1.5 uppercase font-semibold text-[10px] tracking-wider">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>Registration Deadline</span>
            </span>
            <p className="font-medium text-text text-sm">
              {new Date(event.registration_deadline).toLocaleDateString([], {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Event Overview & Challenge Scope
          </h5>
          <p className="text-sm text-text leading-relaxed font-sans">{event.description}</p>
        </div>

        {/* Eligibility Criteria */}
        {event.eligibility && (
          <div className="p-3.5 rounded-card bg-surface border border-border space-y-1.5">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-success" />
              <span>Eligibility & Team Requirements</span>
            </h5>
            <p className="text-xs text-text leading-relaxed font-sans">{event.eligibility}</p>
          </div>
        )}

        {/* Tags / Domains */}
        {event.tags && event.tags.length > 0 && (
          <div className="space-y-1.5">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-accent" />
              <span>Relevant Skills & Project Domains</span>
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {event.tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-pill text-xs font-sans bg-accent/10 text-accent border border-accent/20"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
