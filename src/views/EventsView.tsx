import React, { useEffect, useState, useMemo } from 'react';
import {
  Calendar,
  Search,
  Plus,
  Shield,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useDataStore } from '../context/DataStoreContext';
import { useAuth } from '../context/AuthContext';
import { CampusEvent } from '../shared/types';
import { EventCard } from '../components/events/EventCard';
import { EventDetailModal } from '../components/events/EventDetailModal';
import { CreateEventModal } from '../components/events/CreateEventModal';
import { Button } from '../components/common/Button';

export const EventsView: React.FC = () => {
  const { dataStore } = useDataStore();
  const { profile, role, setRole } = useAuth();

  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedDeadlineRange, setSelectedDeadlineRange] = useState<string>('all');

  // Modal
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);

  const isAuthorizedToCreate = role === 'leader' || role === 'admin';

  const loadEvents = async () => {
    setLoading(true);
    try {
      const list = await dataStore.getEvents();
      setEvents(list);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [dataStore]);

  const handleCreateEvent = async (eventData: Omit<CampusEvent, 'id' | 'created_at'>) => {
    const created = await dataStore.createEvent(eventData);
    setEvents((prev) => [created, ...prev]);
    showToast(`Event "${created.title}" successfully hosted on CampusCollab!`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All Opportunities' },
    { id: 'hackathon', label: 'Hackathons' },
    { id: 'competition', label: 'Coding Competitions' },
    { id: 'workshop', label: 'Workshops' },
    { id: 'conference', label: 'Conferences' },
    { id: 'exhibition', label: 'Project Expos' },
  ];

  const filteredEvents = useMemo(() => {
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;

    return events.filter((ev) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ev.title.toLowerCase().includes(q);
        const matchDesc = ev.description.toLowerCase().includes(q);
        const matchOrg = ev.organizer.toLowerCase().includes(q);
        const matchLoc = ev.location.toLowerCase().includes(q);
        const matchTag = ev.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchOrg && !matchLoc && !matchTag) return false;
      }

      // Category
      if (selectedCategory !== 'all' && ev.category !== selectedCategory) {
        return false;
      }

      // Format
      if (selectedFormat !== 'all' && ev.format !== selectedFormat) {
        return false;
      }

      // Deadline
      if (selectedDeadlineRange !== 'all') {
        const dueMs = new Date(ev.registration_deadline).getTime();
        const diffDays = Math.ceil((dueMs - now) / ONE_DAY);

        if (selectedDeadlineRange === 'closing_soon' && (diffDays > 7 || diffDays < 0)) {
          return false;
        }
        if (selectedDeadlineRange === 'this_month' && (diffDays > 30 || diffDays < 0)) {
          return false;
        }
      }

      return true;
    });
  }, [events, searchQuery, selectedCategory, selectedFormat, selectedDeadlineRange]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg bg-surface-elevated text-text border border-accent/40 shadow-glow animate-slideUp text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-pill bg-accent/10 border border-accent/20 text-accent text-xs font-mono mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Opportunities & Hackathons</span>
          </div>
          <h1 className="text-2xl font-bold text-text tracking-tight">Campus Events Hub</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Discover upcoming hackathons, coding contests, and workshops across college ecosystems.
          </p>
        </div>

        {/* Action Button: Role-Gated */}
        {isAuthorizedToCreate ? (
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateOpen(true)}
            className="shadow-glow"
          >
            Host Campus Event
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted hidden md:inline">
              Need to publish an event?
            </span>
            <Button
              variant="secondary"
              size="sm"
              icon={<Shield className="w-3.5 h-3.5 text-accent" />}
              onClick={() => setRole('leader')}
            >
              Switch to Leader Role
            </Button>
          </div>
        )}
      </div>

      {/* Role Authorization Notice Banner if student */}
      {!isAuthorizedToCreate && (
        <div className="p-3.5 rounded-card bg-surface-subtle/80 border border-border flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-accent shrink-0" />
            <div>
              <span className="font-semibold text-text">Event Creation Authorization Gate</span>
              <p className="text-text-muted text-[11px] mt-0.5">
                Hosting campus events requires <strong>Club Leader</strong> or <strong>Campus Admin</strong> privileges.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRole('leader')}
            className="shrink-0 text-accent hover:underline font-mono text-[11px] flex items-center gap-1"
          >
            Switch to Leader to Post <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events, organizers, skills..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-border rounded-lg text-text focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Format Select */}
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-surface border border-border rounded-lg text-text focus:outline-none focus:border-accent font-sans"
          >
            <option value="all">All Formats</option>
            <option value="offline">Offline / On-Campus</option>
            <option value="online">Online / Virtual</option>
            <option value="hybrid">Hybrid</option>
          </select>

          {/* Deadline Select */}
          <select
            value={selectedDeadlineRange}
            onChange={(e) => setSelectedDeadlineRange(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-surface border border-border rounded-lg text-text focus:outline-none focus:border-accent font-sans"
          >
            <option value="all">All Deadlines</option>
            <option value="closing_soon">Closing in 7 Days</option>
            <option value="this_month">Within 30 Days</option>
          </select>
        </div>
      </div>

      {/* Categories Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-colors shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-accent text-white shadow-glow'
                : 'bg-surface text-text-muted hover:text-text border border-border'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-64 rounded-card bg-surface/50 border border-border animate-pulse p-5"
            />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center rounded-card bg-surface border border-border/80">
          <Calendar className="w-10 h-10 text-text-muted/60 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-text mb-1">No events match your criteria</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto mb-4">
            Try adjusting your category or deadline filter to discover more upcoming hackathons and workshops.
          </p>
          {isAuthorizedToCreate && (
            <Button size="sm" variant="primary" onClick={() => setIsCreateOpen(true)}>
              Host First Event
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onViewDetails={(ev) => setSelectedEvent(ev)}
            />
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {profile && (
        <CreateEventModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateEvent}
          creatorId={profile.id}
          creatorRole={role}
        />
      )}

      {/* Event Details Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
};
