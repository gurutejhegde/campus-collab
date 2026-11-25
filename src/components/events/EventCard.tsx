import React from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  Building,
} from 'lucide-react';
import { CampusEvent } from '../../shared/types';
import { Button } from '../common/Button';

interface EventCardProps {
  event: CampusEvent;
  onViewDetails?: (event: CampusEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onViewDetails }) => {
  // Calculate days until deadline
  const now = Date.now();
  const deadlineMs = new Date(event.registration_deadline).getTime();
  const diffDays = Math.ceil((deadlineMs - now) / (1000 * 60 * 60 * 24));

  let deadlineLabel = '';
  let isClosingSoon = false;

  if (diffDays < 0) {
    deadlineLabel = 'Registration Closed';
  } else if (diffDays === 0) {
    deadlineLabel = 'Closes Today!';
    isClosingSoon = true;
  } else if (diffDays <= 5) {
    deadlineLabel = `Closes in ${diffDays}d!`;
    isClosingSoon = true;
  } else {
    deadlineLabel = `Deadline: ${new Date(event.registration_deadline).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    })}`;
  }

  const categoryLabels = {
    hackathon: 'Hackathon',
    competition: 'Competition',
    workshop: 'Workshop',
    conference: 'Conference',
    exhibition: 'Project Expo',
    other: 'Event',
  };

  return (
    <div className="bg-surface rounded-card p-5 flex flex-col justify-between hover:bg-surface-subtle/50 transition-all duration-smooth space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-accent">
              {categoryLabels[event.category]}
            </span>
            <span className="text-xs text-text-muted">
              {event.format}
            </span>
          </div>

          <span
            className={`text-xs flex items-center gap-1 ${
              isClosingSoon ? 'text-warning font-medium' : 'text-text-muted'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>{deadlineLabel}</span>
          </span>
        </div>

        <h3
          className="font-serif font-medium text-lg text-text hover:text-accent cursor-pointer transition-colors leading-snug"
          onClick={() => onViewDetails?.(event)}
        >
          {event.title}
        </h3>

        <p className="text-sm text-text-muted flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{event.organizer}</span>
        </p>
      </div>

      {/* Description */}
      <p className="text-sm text-text-muted leading-relaxed line-clamp-2">
        {event.description}
      </p>

      {/* Key Dates & Location */}
      <div className="space-y-2 text-sm text-text-muted">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-accent shrink-0" />
          <span>
            {new Date(event.start_date).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            })}{' '}
            –{' '}
            {new Date(event.end_date).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
      </div>

      {/* Tags */}
      {event.tags && event.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {event.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs text-text-muted"
            >
              #{tag}
            </span>
          ))}
          {event.tags.length > 4 && (
            <span className="text-xs text-text-muted">
              +{event.tags.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2">
        {onViewDetails && (
          <Button
            type="button"
            variant="subtle"
            size="sm"
            onClick={() => onViewDetails(event)}
          >
            Details
          </Button>
        )}

        <a
          href={event.registration_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill text-sm font-medium bg-accent hover:bg-accent-hover text-white transition-colors"
        >
          <span>Register</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
