import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Check, Globe, Lightbulb, Lock, Minus, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { useApp } from '../../context/AppContext';
import {
  getRecommendedSkillsForRoles,
  PROJECT_DOMAINS,
  ROLE_PRESETS,
  SKILL_PRESETS,
} from '../../core/data/presets';
import { CampusEvent, Team } from '../../core/types/domain';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { TagSelector } from '../../ui/TagSelector';
import { useToast } from '../../ui/Toast';
import { TeamCard } from './TeamCard';

const OTHER_DOMAIN_VALUE = '__other__';

export const TeamFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { teamId } = useParams<{ teamId?: string }>();
  const [searchParams] = useSearchParams();
  const preselectedEventId = searchParams.get('eventId') || '';

  const { profile, dataStore } = useApp();
  const { showToast } = useToast();

  const isEdit = Boolean(teamId);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [existingTeam, setExistingTeam] = useState<Team | null>(null);

  // Step 1: Basics
  const [name, setName] = useState('');
  const [scopeMode, setScopeMode] = useState<'standalone' | 'event'>(
    preselectedEventId ? 'event' : 'standalone'
  );
  const [eventId, setEventId] = useState(preselectedEventId);
  const [selectedDomain, setSelectedDomain] = useState<string>(PROJECT_DOMAINS[0]);
  const [customDomain, setCustomDomain] = useState('');
  const [description, setDescription] = useState('');

  // Step 2: Roles & Stack
  const [openRoles, setOpenRoles] = useState<string[]>([]);
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);

  // Step 3: Squad Settings
  const [maxMembers, setMaxMembers] = useState(4);
  const [visibility, setVisibility] = useState<'open' | 'invite_only'>('open');
  const [learnerFriendly, setLearnerFriendly] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!dataStore) return;
      setLoading(true);
      try {
        const [evRows, teamRows] = await Promise.all([
          dataStore.getEvents(),
          teamId ? dataStore.getTeams() : Promise.resolve([]),
        ]);
        if (!active) return;
        setEvents(evRows);

        if (teamId) {
          const found = teamRows.find((t) => t.id === teamId) || null;
          if (!found) {
            setError('Team not found or you do not have access.');
          } else {
            setExistingTeam(found);
            setName(found.name);
            setScopeMode(found.event_id ? 'event' : 'standalone');
            setEventId(found.event_id || '');
            const isPreset = (PROJECT_DOMAINS as readonly string[]).includes(found.project_domain);
            if (isPreset) {
              setSelectedDomain(found.project_domain);
              setCustomDomain('');
            } else {
              setSelectedDomain(OTHER_DOMAIN_VALUE);
              setCustomDomain(found.project_domain);
            }
            setDescription(found.description);
            setOpenRoles(found.open_roles || []);
            setRequiredSkills(found.required_skills || []);
            setMaxMembers(found.max_members || 4);
            setVisibility(found.visibility);
            setLearnerFriendly(found.learner_friendly);
          }
        } else if (preselectedEventId && evRows.some((e) => e.id === preselectedEventId)) {
          setScopeMode('event');
          setEventId(preselectedEventId);
        }
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load form data.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [dataStore, teamId, preselectedEventId]);

  const recommendedSkills = useMemo(
    () => getRecommendedSkillsForRoles(openRoles),
    [openRoles]
  );

  const resolvedDomain =
    selectedDomain === OTHER_DOMAIN_VALUE ? customDomain.trim() : selectedDomain;
  const resolvedEventId = scopeMode === 'event' ? eventId || null : null;

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(preselectedEventId ? '/events' : '/');
    }
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!name.trim()) {
        setError('Give your team a name first.');
        return;
      }
      if (!resolvedDomain) {
        setError('Select or enter a project domain.');
        return;
      }
      if (scopeMode === 'event' && !eventId) {
        setError('Select an event or switch to Standalone Idea.');
        return;
      }
      if (!description.trim()) {
        setError('Add a short 1–2 line summary of what you are building.');
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 3) {
      handleNext();
      return;
    }
    if (!dataStore || !profile) return;

    setSubmitting(true);
    setError(null);
    try {
      if (isEdit && existingTeam) {
        await dataStore.updateTeam(existingTeam.id, {
          name: name.trim(),
          project_domain: resolvedDomain,
          description: description.trim(),
          event_id: resolvedEventId,
          visibility,
          learner_friendly: learnerFriendly,
          max_members: maxMembers,
          required_skills: requiredSkills,
          open_roles: openRoles,
        });
        showToast(`Updated "${name.trim()}"`);
      } else {
        await dataStore.createTeam({
          name: name.trim(),
          project_domain: resolvedDomain,
          description: description.trim(),
          creator_id: profile.id,
          event_id: resolvedEventId,
          visibility,
          learner_friendly: learnerFriendly,
          max_members: maxMembers,
          required_skills: requiredSkills,
          open_roles: openRoles,
        });
        showToast(`Created team "${name.trim()}"`);
      }
      navigate(resolvedEventId && preselectedEventId ? '/events' : '/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save team.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!profile) return null;

  const previewTeam: Team = {
    id: existingTeam?.id || 'preview',
    event_id: resolvedEventId,
    event: events.find((ev) => ev.id === resolvedEventId) || null,
    name: name.trim() || 'Your Team Name',
    description: description.trim() || 'Your project pitch appears here...',
    creator_id: profile.id,
    project_domain: resolvedDomain || 'Domain',
    required_skills: requiredSkills,
    open_roles: openRoles,
    visibility,
    learner_friendly: learnerFriendly,
    max_members: maxMembers,
    created_at: new Date().toISOString(),
    members: existingTeam?.members || [
      {
        id: 'lead-preview',
        team_id: 'preview',
        user_id: profile.id,
        role: 'Team Lead',
        joined_at: '',
        profile,
      },
    ],
  };

  const steps = [
    { num: 1 as const, label: 'Idea & Scope' },
    { num: 2 as const, label: 'Roles & Stack' },
    { num: 3 as const, label: 'Seats & Review' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Persistent Top Back Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text px-2.5 py-1.5 -ml-2.5 rounded-control hover:bg-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-xs font-mono text-text-dim">Step {step} of 3</span>
      </div>

      {/* Title + Step Progress Pills */}
      <div className="space-y-3">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
          {isEdit ? `Edit ${existingTeam?.name || 'Team'}` : 'Create a Team'}
        </h1>

        <div className="grid grid-cols-3 gap-2">
          {steps.map((s) => {
            const active = step === s.num;
            const done = step > s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (s.num < step || (s.num === 2 && name.trim() && description.trim())) {
                    setError(null);
                    setStep(s.num);
                  }
                }}
                className={clsx(
                  'text-left p-2.5 rounded-control border transition-colors',
                  active
                    ? 'bg-surface border-accent-border'
                    : done
                    ? 'bg-surface/60 border-border-strong'
                    : 'bg-well border-border opacity-70'
                )}
              >
                <div className="h-[2px] w-full rounded-full mb-2 bg-well overflow-hidden">
                  <div
                    className={clsx(
                      'h-full transition-all',
                      active || done ? 'bg-accent w-full' : 'w-0'
                    )}
                  />
                </div>
                <div className="text-[11px] font-medium text-text flex items-center gap-1.5">
                  {done && <Check className="w-3 h-3 text-accent-text" />}
                  <span>
                    {s.num}. {s.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <Card className="p-8 h-64 animate-pulse" />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-control bg-danger/10 border border-danger/30 text-xs text-red-300">
              {error}
            </div>
          )}

          {/* STEP 1: BASICS */}
          {step === 1 && (
            <Card className="p-5 sm:p-6 space-y-5">
              <div>
                <label className="block text-xs font-medium text-text mb-1.5">Team Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AgroSense Edge"
                  autoFocus
                  className="w-full px-3.5 py-2.5 text-sm bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong"
                />
              </div>

              {/* Scope Cards */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-text">Where are you building?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setScopeMode('standalone');
                      setEventId('');
                    }}
                    className={clsx(
                      'p-3.5 rounded-control border text-left transition-colors flex items-start gap-3',
                      scopeMode === 'standalone'
                        ? 'bg-accent-soft border-accent-border'
                        : 'bg-well border-border hover:border-border-strong'
                    )}
                  >
                    <Lightbulb
                      className={clsx(
                        'w-4 h-4 mt-0.5 shrink-0',
                        scopeMode === 'standalone' ? 'text-accent-text' : 'text-text-dim'
                      )}
                    />
                    <div>
                      <div className="text-xs font-semibold text-text">Standalone Idea</div>
                      <div className="text-[11px] text-text-muted mt-0.5">
                        Independent project outside any event
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setScopeMode('event');
                      if (!eventId && events[0]) setEventId(events[0].id);
                    }}
                    className={clsx(
                      'p-3.5 rounded-control border text-left transition-colors flex items-start gap-3',
                      scopeMode === 'event'
                        ? 'bg-accent-soft border-accent-border'
                        : 'bg-well border-border hover:border-border-strong'
                    )}
                  >
                    <Calendar
                      className={clsx(
                        'w-4 h-4 mt-0.5 shrink-0',
                        scopeMode === 'event' ? 'text-accent-text' : 'text-text-dim'
                      )}
                    />
                    <div>
                      <div className="text-xs font-semibold text-text">For a Campus Event</div>
                      <div className="text-[11px] text-text-muted mt-0.5">
                        Recruit teammates inside a hackathon or expo
                      </div>
                    </div>
                  </button>
                </div>

                {scopeMode === 'event' && (
                  <div className="pt-1">
                    {events.length === 0 ? (
                      <div className="p-3 rounded-control bg-well border border-border text-xs text-text-muted">
                        No events published yet. Switch to Standalone Idea or ask an admin to post an event.
                      </div>
                    ) : (
                      <select
                        value={eventId}
                        onChange={(e) => setEventId(e.target.value)}
                        className="w-full px-3 py-2 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong"
                      >
                        <option value="">Choose an event...</option>
                        {events.map((ev) => (
                          <option key={ev.id} value={ev.id}>
                            {ev.title}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-text mb-1.5">
                  Project Domain *
                </label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full px-3 py-2.5 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong"
                >
                  {PROJECT_DOMAINS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                  <option value={OTHER_DOMAIN_VALUE}>Other (enter custom)</option>
                </select>
                {selectedDomain === OTHER_DOMAIN_VALUE && (
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="Enter custom domain..."
                    className="mt-2 w-full px-3 py-2 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-text mb-1.5">
                  Short Pitch *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="In 1–2 sentences, what are you building and why join?"
                  className="w-full px-3.5 py-2.5 text-[13px] bg-well border border-border rounded-control text-text focus:outline-none focus:border-border-strong resize-none"
                />
              </div>
            </Card>
          )}

          {/* STEP 2: ROLES & STACK */}
          {step === 2 && (
            <Card className="p-5 sm:p-6 space-y-6">
              <TagSelector
                label="Which open roles are you looking for?"
                placeholder="Type to filter or add a custom role..."
                options={ROLE_PRESETS}
                selected={openRoles}
                onChange={setOpenRoles}
                accentSelected
                prefixSelected="Need: "
              />

              <div className="pt-4 border-t border-border">
                <TagSelector
                  label="Tech stack & skills"
                  placeholder="Search skills or type custom (e.g. Prisma, Three.js)..."
                  options={SKILL_PRESETS}
                  selected={requiredSkills}
                  onChange={setRequiredSkills}
                  recommended={recommendedSkills}
                  collapseCatalog
                />
              </div>
            </Card>
          )}

          {/* STEP 3: SEATS, VISIBILITY & PREVIEW */}
          {step === 3 && (
            <div className="space-y-4">
              <Card className="p-5 sm:p-6 space-y-5">
                {/* Tactile Max Members Stepper */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-medium text-text">Total Squad Size</div>
                    <div className="text-[11px] text-text-muted">Including yourself (2 to 12)</div>
                  </div>
                  <div className="flex items-center gap-2 bg-well border border-border rounded-control p-1">
                    <button
                      type="button"
                      onClick={() => setMaxMembers((m) => Math.max(2, m - 1))}
                      disabled={maxMembers <= 2}
                      className="p-1.5 rounded text-text-muted hover:text-text disabled:opacity-35"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-mono text-sm font-semibold text-text">
                      {maxMembers}
                    </span>
                    <button
                      type="button"
                      onClick={() => setMaxMembers((m) => Math.min(12, m + 1))}
                      disabled={maxMembers >= 12}
                      className="p-1.5 rounded text-text-muted hover:text-text disabled:opacity-35"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Visibility */}
                <div className="space-y-2 pt-3 border-t border-border">
                  <label className="block text-xs font-medium text-text">Visibility</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setVisibility('open')}
                      className={clsx(
                        'p-3.5 rounded-control border text-left transition-colors flex items-start gap-3',
                        visibility === 'open'
                          ? 'bg-accent-soft border-accent-border'
                          : 'bg-well border-border hover:border-border-strong'
                      )}
                    >
                      <Globe className="w-4 h-4 mt-0.5 shrink-0 text-ok" />
                      <div>
                        <div className="text-xs font-semibold text-text">Open Squad</div>
                        <div className="text-[11px] text-text-muted mt-0.5">
                          Visible in Team Finder; anyone can request to join
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisibility('invite_only')}
                      className={clsx(
                        'p-3.5 rounded-control border text-left transition-colors flex items-start gap-3',
                        visibility === 'invite_only'
                          ? 'bg-accent-soft border-accent-border'
                          : 'bg-well border-border hover:border-border-strong'
                      )}
                    >
                      <Lock className="w-4 h-4 mt-0.5 shrink-0 text-text-muted" />
                      <div>
                        <div className="text-xs font-semibold text-text">Invite-Only</div>
                        <div className="text-[11px] text-text-muted mt-0.5">
                          Hidden from Team Finder; only invitees see details
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Committed Learners */}
                <label className="flex items-center gap-3 p-3 rounded-control bg-well border border-border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={learnerFriendly}
                    onChange={(e) => setLearnerFriendly(e.target.checked)}
                    className="accent-[var(--accent)]"
                  />
                  <div>
                    <div className="text-xs font-medium text-text">Open to committed learners</div>
                    <div className="text-[11px] text-text-dim">
                      Welcome motivated beginners eager to learn your stack
                    </div>
                  </div>
                </label>
              </Card>

              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-text-dim uppercase tracking-wider px-0.5">
                  Card Preview
                </div>
                <TeamCard team={previewTeam} currentUserId={profile.id} />
              </div>
            </div>
          )}

          {/* Bottom Step Navigation Bar */}
          <div className="flex items-center justify-between gap-3 pt-2">
            {step > 1 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setError(null);
                  setStep((step - 1) as 1 | 2);
                }}
              >
                Previous
              </Button>
            ) : (
              <Button type="button" variant="ghost" onClick={goBack}>
                Cancel
              </Button>
            )}

            {step < 3 ? (
              <Button key="btn-next" type="button" variant="primary" onClick={handleNext}>
                Continue
              </Button>
            ) : (
              <Button key="btn-submit" type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Team'}
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};
