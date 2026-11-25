import React, { useState } from 'react';
import {
  ArrowUpRight,
  ExternalLink,
  Github,
  MessageSquare,
  Share2,
  ThumbsUp,
  UserPlus,
} from 'lucide-react';
import { ProjectPost } from '../../shared/types';

interface PostCardProps {
  post: ProjectPost;
  currentUserId?: string;
  onUpvote: (postId: string) => void;
  onOpenDetails: (post: ProjectPost) => void;
  onPitchToJoin?: (post: ProjectPost) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onUpvote,
  onOpenDetails,
  onPitchToJoin,
}) => {
  const isUpvoted = currentUserId ? post.upvotes.includes(currentUserId) : false;
  const isAuthor = currentUserId === post.author_id;
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(post.demo_url || post.github_url || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <article
      onClick={() => onOpenDetails(post)}
      className="group relative flex flex-col justify-between rounded-2xl glass-card p-5 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Top subtle highlight line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent group-hover:via-purple-500/70 transition-all duration-300" />

      <div>
        {/* Author Header */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 p-[1.5px] shrink-0 shadow-sm">
              <img
                src={
                  post.author_avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                }
                alt={post.author_name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-white leading-tight group-hover:text-purple-300 transition-colors truncate">
                  {post.author_name}
                </span>
                {isAuthor && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Author
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted leading-tight truncate">
                {post.author_college}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-text-muted shrink-0">
            {formatTime(post.created_at)}
          </span>
        </div>

        {/* Project Title & Tagline */}
        <h3 className="font-display text-base font-bold text-white mb-1 group-hover:text-purple-200 transition-colors flex items-center justify-between gap-2">
          <span className="line-clamp-1">{post.title}</span>
          <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
        </h3>
        <p className="text-xs text-purple-300/90 font-medium mb-3 line-clamp-1">
          {post.tagline}
        </p>

        {/* Media Preview (if any) */}
        {post.media_url && (
          <div className="mb-3.5 rounded-xl overflow-hidden border border-white/[0.08] bg-black/40 max-h-48 relative">
            <img
              src={post.media_url}
              alt={post.title}
              className="w-full h-44 object-cover group-hover:scale-[1.02] transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-text-muted line-clamp-2 leading-relaxed mb-3.5 font-sans">
          {post.description}
        </p>

        {/* Seeking Teammates Radiant Pill Banner */}
        {post.seeking_teammates && (
          <div className="mb-3.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent border border-emerald-500/25 flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-emerald-300 truncate">
                Seeking Teammates
                {post.desired_skills && post.desired_skills.length > 0 && (
                  <span className="text-text-muted font-normal ml-1">
                    ({post.desired_skills.slice(0, 2).join(', ')}{post.desired_skills.length > 2 ? '...' : ''})
                  </span>
                )}
              </span>
            </div>
            {!isAuthor && onPitchToJoin && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPitchToJoin(post);
                }}
                className="shrink-0 text-[11px] font-semibold text-emerald-300 hover:text-white bg-emerald-500/20 hover:bg-emerald-500/30 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 transition-colors"
              >
                <UserPlus className="w-3 h-3" />
                Pitch
              </button>
            )}
          </div>
        )}

        {/* Tech Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono px-2 py-0.5 rounded-md glass-pill text-text-muted border border-white/[0.06]"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer / Interaction Toolbar */}
      <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
        {/* Left: Upvotes & Comments */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpvote(post.id);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all duration-200 ${
              isUpvoted
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-glow-pink scale-105'
                : 'glass-pill text-text-muted hover:text-white hover:bg-white/[0.08] border border-white/[0.08]'
            }`}
            title={isUpvoted ? 'Remove upvote' : 'Upvote this project'}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-current' : ''}`} />
            <span>{post.upvotes.length}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(post);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono text-text-muted hover:text-white glass-pill border border-white/[0.08] transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{post.comments_count}</span>
          </button>
        </div>

        {/* Right: Quick Links */}
        <div className="flex items-center gap-1">
          {post.github_url && (
            <a
              href={post.github_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/[0.08] transition-colors"
              title="View on GitHub"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
          )}
          {post.demo_url && (
            <a
              href={post.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
              title="Open Live Demo"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            type="button"
            onClick={handleShare}
            className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/[0.08] transition-colors"
            title={copied ? 'Link copied!' : 'Share project'}
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
