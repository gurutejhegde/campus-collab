import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Calendar,
  Send,
  Sparkles,
  Target,
  MessageSquare,
} from 'lucide-react';
import { TeamMilestone, TeamUpdate } from '../../shared/types';
import { useDataStore } from '../../context/DataStoreContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

interface TeamWorkspaceProps {
  teamId: string;
  teamName: string;
  isMember: boolean;
}

export const TeamWorkspace: React.FC<TeamWorkspaceProps> = ({
  teamId,
  teamName,
  isMember,
}) => {
  const { dataStore } = useDataStore();
  const { profile } = useAuth();

  const [milestones, setMilestones] = useState<TeamMilestone[]>([]);
  const [updates, setUpdates] = useState<TeamUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  // New milestone form
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);

  // New update form
  const [newUpdateContent, setNewUpdateContent] = useState('');
  const [postingUpdate, setPostingUpdate] = useState(false);

  const loadWorkspaceData = async () => {
    try {
      setLoading(true);
      const [mList, uList] = await Promise.all([
        dataStore.getMilestones(teamId),
        dataStore.getTeamUpdates(teamId),
      ]);
      setMilestones(mList);
      setUpdates(uList);
    } catch (err) {
      console.error('Failed to load team workspace data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  }, [teamId, dataStore]);

  const handleToggleMilestone = async (milestoneId: string) => {
    if (!isMember) return;
    try {
      // Optimistic update
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        )
      );
      const updated = await dataStore.toggleMilestone(milestoneId);
      setMilestones((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
    } catch (err) {
      console.error('Error toggling milestone:', err);
      loadWorkspaceData();
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !isMember) return;

    try {
      const added = await dataStore.addMilestone({
        team_id: teamId,
        title: newTitle.trim(),
        due_date: newDueDate || undefined,
        assigned_to: profile?.name,
      });
      setMilestones((prev) => [...prev, added]);
      setNewTitle('');
      setNewDueDate('');
      setIsAddingMilestone(false);
    } catch (err) {
      console.error('Failed to add milestone:', err);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!isMember) return;
    try {
      setMilestones((prev) => prev.filter((m) => m.id !== milestoneId));
      await dataStore.deleteMilestone(milestoneId);
    } catch (err) {
      console.error('Failed to delete milestone:', err);
      loadWorkspaceData();
    }
  };

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdateContent.trim() || !profile || !isMember) return;

    setPostingUpdate(true);
    try {
      const added = await dataStore.createTeamUpdate({
        team_id: teamId,
        author_id: profile.id,
        author_name: profile.name,
        author_avatar: profile.avatar_url,
        content: newUpdateContent.trim(),
      });
      setUpdates((prev) => [added, ...prev]);
      setNewUpdateContent('');
    } catch (err) {
      console.error('Failed to post team update:', err);
    } finally {
      setPostingUpdate(false);
    }
  };

  const completedCount = milestones.filter((m) => m.completed).length;
  const progressPercent =
    milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Progress Card */}
      <div className="p-5 rounded-card bg-surface border border-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-accent" />
            <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
              Sprint Milestone Progress
            </span>
          </div>
          <span className="text-xs font-mono font-semibold text-accent">
            {completedCount} of {milestones.length} Completed ({progressPercent}%)
          </span>
        </div>

        {/* Real-time Progress Bar */}
        <div className="w-full h-2 rounded-full bg-surface-subtle overflow-hidden border border-border/80">
          <div
            className="h-full bg-accent transition-all duration-300 shadow-glow"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Milestones Checklist */}
        <div className="p-5 rounded-card bg-surface border border-border flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                Team Milestones
              </h3>

              {isMember && !isAddingMilestone && (
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setIsAddingMilestone(true)}
                >
                  Add Milestone
                </Button>
              )}
            </div>

            {/* Add Milestone Form */}
            {isAddingMilestone && (
              <form onSubmit={handleAddMilestone} className="p-3 rounded-lg bg-surface-subtle border border-border space-y-2">
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Set up WebSocket backend sync"
                  className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text focus:outline-none focus:border-accent"
                  />
                  <Button type="button" size="sm" variant="subtle" onClick={() => setIsAddingMilestone(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" variant="primary">
                    Save
                  </Button>
                </div>
              </form>
            )}

            {/* Milestones List */}
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-10 rounded bg-surface-subtle animate-pulse" />
                ))}
              </div>
            ) : milestones.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-muted">
                No milestones defined yet. Add key deliverables for {teamName}!
              </div>
            ) : (
              <div className="space-y-2">
                {milestones.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleToggleMilestone(m.id)}
                    className={`flex items-start justify-between gap-3 p-3 rounded-lg border transition-all ${
                      m.completed
                        ? 'bg-surface-subtle/50 border-border/60 text-text-muted'
                        : 'bg-surface border-border hover:border-accent/40 text-text cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      {m.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span
                          className={`text-xs block leading-tight font-medium ${
                            m.completed ? 'line-through opacity-70' : ''
                          }`}
                        >
                          {m.title}
                        </span>
                        {m.due_date && (
                          <span className="text-[10px] font-mono text-text-muted flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" /> Due {m.due_date}
                          </span>
                        )}
                      </div>
                    </div>

                    {isMember && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMilestone(m.id);
                        }}
                        className="p-1 rounded text-text-muted hover:text-danger hover:bg-surface-subtle transition-colors shrink-0"
                        title="Delete milestone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Internal Team Feed / Standup Log */}
        <div className="p-5 rounded-card bg-surface border border-border flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="pb-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-accent" />
                Team Sprint Updates
              </h3>
              <span className="text-[11px] font-mono text-text-muted">
                {updates.length} Updates
              </span>
            </div>

            {/* Post update composer (members only) */}
            {isMember ? (
              <form onSubmit={handlePostUpdate} className="space-y-2">
                <textarea
                  rows={2}
                  value={newUpdateContent}
                  onChange={(e) => setNewUpdateContent(e.target.value)}
                  placeholder="Share a quick build update (e.g. 'Merged PR for auth flow, ready for testing')..."
                  className="w-full px-3 py-2 text-xs bg-surface-subtle border border-border rounded-lg text-text focus:outline-none focus:border-accent resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                    disabled={postingUpdate || !newUpdateContent.trim()}
                    icon={<Send className="w-3 h-3" />}
                  >
                    {postingUpdate ? 'Posting...' : 'Post Update'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-3 rounded-lg bg-surface-subtle text-xs text-text-muted flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Join this team to post sprint updates and check off milestones.</span>
              </div>
            )}

            {/* Updates list */}
            {updates.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-muted">
                No sprint updates posted yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {updates.map((upd) => (
                  <div
                    key={upd.id}
                    className="p-3 rounded-lg bg-surface-subtle/60 border border-border/80 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            upd.author_avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                          }
                          alt={upd.author_name}
                          className="w-5 h-5 rounded-full object-cover border border-border"
                        />
                        <span className="font-semibold text-text">{upd.author_name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-text-muted">
                        {new Date(upd.created_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-text leading-relaxed pl-7">{upd.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
