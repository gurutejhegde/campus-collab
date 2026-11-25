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
    hackathon: { label: 'Hackathon', class: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
    competition: { label: 'Coding Contest', class: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
    workshop: { label: 'Workshop', class: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
    conference: { label: 'Conference', class: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
    exhibition: { label: 'Project Expo', class: 'bg-pink-500/15 text-pink-300 border-pink-500/30' },
    other: { label: 'Campus Event', class: 'bg-white/10 text-white border-white/20' },
  };

  const cat = categoryLabels[event.category] || categoryLabels.other;

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/40 transition-all duration-300 space-y-4 group">
      {/* Header */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${cat.class}`}>
              {cat.label}
            </span>
            <span className="text-xs text-text-muted capitalize font-sans">
              • {event.format}
            </span>
          </div>

          <span
            className={`text-xs flex items-center gap-1 font-mono ${
              isClosingSoon ? 'text-amber-400 font-semibold shadow-glow' : 'text-text-muted'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{deadlineLabel}</span>
          </span>
        </div>

        <h3
          className="font-display font-bold text-lg text-white hover:text-purple-300 cursor-pointer transition-colors leading-snug"
          onClick={() => onViewDetails?.(event)}
        >
          {event.title}
        </h3>

        <p className="text-xs text-text-muted flex items-center gap-1.5 font-sans">
          <Building className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="truncate">{event.organizer}</span>
        </p>
      </div>

      {/* Description */}
      <p className="text-xs text-text-muted leading-relaxed line-clamp-2 font-sans">
        {event.description}
      </p>

      {/* Key Dates & Location */}
      <div className="space-y-2 text-xs text-text-muted border-t border-white/[0.06] pt-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>
            {new Date(event.start_date).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            })}{' '}
            -{' '}
            {new Date(event.end_date).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {event.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="text-[10px] font-mono px-2 py-0.5 rounded-md glass-pill text-text-muted border border-white/[0.06]"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onViewDetails?.(event)}
        >
          View Details
        </Button>

        <a
          href={event.registration_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-95 shadow-glow transition-all"
        >
          <span>Register</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
