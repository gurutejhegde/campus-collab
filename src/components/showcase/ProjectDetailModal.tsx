import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ProjectPost } from '../../shared/types';
import {
  ExternalLink,
  Github,
  MessageSquare,
  Send,
  Sparkles,
  ThumbsUp,
  UserPlus,
} from 'lucide-react';

interface ProjectDetailModalProps {
  post: ProjectPost | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  currentUserName?: string;
  onUpvote: (postId: string) => void;
  onPitchToJoin?: (post: ProjectPost, note: string) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  post,
  isOpen,
  onClose,
  currentUserId,
  currentUserName,
  onUpvote,
  onPitchToJoin,
}) => {
  const [pitchMode, setPitchMode] = useState(false);
  const [pitchNote, setPitchNote] = useState('');
  const [comments, setComments] = useState<Array<{ id: string; author: string; text: string; time: string }>>([
    {
      id: 'c1',
      author: 'Kavya Nair',
      text: 'Great work on this architecture! How did you handle quantization loss during deployment?',
      time: '1h ago',
    },
    {
      id: 'c2',
      author: 'Aditya Rao',
      text: 'Super clean benchmark numbers. We could definitely integrate this with our team telemetry pipeline.',
      time: '3h ago',
    },
  ]);
  const [newComment, setNewComment] = useState('');

  if (!post) return null;

  const isUpvoted = currentUserId ? post.upvotes.includes(currentUserId) : false;
  const isAuthor = currentUserId === post.author_id;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([
      ...comments,
      {
        id: `c-${Date.now()}`,
        author: currentUserName || 'Student Peer',
        text: newComment.trim(),
        time: 'Just now',
      },
    ]);
    setNewComment('');
  };

  const handleSendPitch = () => {
    if (onPitchToJoin && post) {
      onPitchToJoin(post, pitchNote);
      setPitchMode(false);
      setPitchNote('');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={post.title}
      subtitle={post.tagline}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Author metadata & Links */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-surface-subtle border border-border">
          <div className="flex items-center gap-3">
            <img
              src={
                post.author_avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
              }
              alt={post.author_name}
              className="w-11 h-11 rounded-full object-cover border border-border"
            />
            <div>
              <div className="text-sm font-semibold text-text">{post.author_name}</div>
              <div className="text-xs text-text-muted">
                {post.author_college} {post.author_department ? `• ${post.author_department}` : ''}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {post.github_url && (
              <a
                href={post.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-surface border border-border text-text hover:text-accent transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
            )}
            {post.demo_url && (
              <a
                href={post.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-accent text-white hover:bg-accent-hover transition-colors shadow-glow"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Live Demo</span>
              </a>
            )}
          </div>
        </div>

        {/* Media Preview */}
        {post.media_url && (
          <div className="rounded-lg overflow-hidden border border-border bg-black/20">
            <img
              src={post.media_url}
              alt={post.title}
              className="w-full max-h-72 object-cover"
            />
          </div>
        )}

        {/* Description */}
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-text-muted mb-2">
            Project Overview & Architecture
          </h4>
          <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">
            {post.description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-mono px-2.5 py-1 rounded-md bg-surface-subtle text-text border border-border"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Seeking Teammates pitch section */}
        {post.seeking_teammates && (
          <div className="p-4 rounded-lg bg-accent/10 border border-accent/25 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-semibold text-accent flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Looking for Team Collaborators
                </div>
                {post.desired_skills && post.desired_skills.length > 0 && (
                  <p className="text-xs text-text-muted mt-1">
                    Seeking skills in: <strong className="text-text">{post.desired_skills.join(', ')}</strong>
                  </p>
                )}
              </div>

              {!isAuthor && (
                <Button
                  size="sm"
                  variant="primary"
                  icon={<UserPlus className="w-3.5 h-3.5" />}
                  onClick={() => setPitchMode(!pitchMode)}
                >
                  {pitchMode ? 'Cancel Pitch' : 'Pitch to Join'}
                </Button>
              )}
            </div>

            {pitchMode && !isAuthor && (
              <div className="pt-3 border-t border-accent/20 space-y-2">
                <textarea
                  rows={2}
                  value={pitchNote}
                  onChange={(e) => setPitchNote(e.target.value)}
                  placeholder="Introduce yourself and mention how your skills can help this project..."
                  className="w-full px-3 py-2 text-xs bg-surface border border-accent/40 rounded-lg text-text focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="primary" onClick={handleSendPitch}>
                    Send Pitch Request
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upvote & Peer Engagement Bar */}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          <button
            type="button"
            onClick={() => onUpvote(post.id)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-pill text-xs font-mono font-medium transition-all ${
              isUpvoted
                ? 'bg-accent text-white shadow-glow'
                : 'bg-surface-subtle text-text-muted hover:text-text hover:bg-surface-elevated border border-border'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${isUpvoted ? 'fill-current' : ''}`} />
            <span>{post.upvotes.length} Upvotes</span>
          </button>

          <span className="text-xs font-mono text-text-muted">
            {comments.length} Discussion Notes
          </span>
        </div>

        {/* Comments Section */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            Peer Discussions & Feedback
          </h4>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {comments.map((c) => (
              <div
                key={c.id}
                className="p-2.5 rounded-lg bg-surface-subtle/70 border border-border/80 text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-text">{c.author}</span>
                  <span className="text-[10px] font-mono text-text-muted">{c.time}</span>
                </div>
                <p className="text-text-muted leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ask a technical question or leave peer feedback..."
              className="flex-1 px-3 py-1.5 text-xs bg-surface-subtle border border-border rounded-lg text-text focus:outline-none focus:border-accent"
            />
            <Button type="submit" size="sm" variant="secondary" icon={<Send className="w-3 h-3" />}>
              Post
            </Button>
          </form>
        </div>
      </div>
    </Modal>
  );
};
