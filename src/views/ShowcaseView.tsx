import React, { useEffect, useMemo, useState } from 'react';
import {
  Code2,
  Flame,
  Plus,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import { ProjectPost } from '../shared/types';
import { useDataStore } from '../context/DataStoreContext';
import { useAuth } from '../context/AuthContext';
import { PostCard } from '../components/showcase/PostCard';
import { CreatePostModal } from '../components/showcase/CreatePostModal';
import { ProjectDetailModal } from '../components/showcase/ProjectDetailModal';
import { Button } from '../components/common/Button';

type FilterTab = 'all' | 'seeking' | 'trending' | 'ai' | 'web' | 'hardware';

export const ShowcaseView: React.FC = () => {
  const { dataStore } = useDataStore();
  const { profile } = useAuth();

  const [posts, setPosts] = useState<ProjectPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ProjectPost | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await dataStore.getPosts();
      setPosts(data);
    } catch (err) {
      console.error('Failed to load project showcase posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [dataStore]);

  const handleUpvote = async (postId: string) => {
    if (!profile) return;
    try {
      // Optimistic update
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            const hasUpvoted = p.upvotes.includes(profile.id);
            const nextUpvotes = hasUpvoted
              ? p.upvotes.filter((uid) => uid !== profile.id)
              : [...p.upvotes, profile.id];
            return { ...p, upvotes: nextUpvotes };
          }
          return p;
        })
      );

      // Persist in store
      const updated = await dataStore.toggleUpvote(postId, profile.id);
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (selectedPost && selectedPost.id === updated.id) {
        setSelectedPost(updated);
      }
    } catch (err) {
      console.error('Error toggling upvote:', err);
      fetchPosts();
    }
  };

  const handleCreatePost = async (
    data: Omit<ProjectPost, 'id' | 'upvotes' | 'comments_count' | 'created_at'>
  ) => {
    const created = await dataStore.createPost(data);
    setPosts((prev) => [created, ...prev]);
    showToast('Your project showcase was published to the campus feed!');
  };

  const handlePitchToJoin = (post: ProjectPost, note?: string) => {
    const detail = note ? ` with note: "${note.slice(0, 30)}..."` : '';
    showToast(`Pitch sent to ${post.author_name} for "${post.title}"${detail}`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered and searched posts
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.author_name.toLowerCase().includes(q) ||
          p.author_college.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Tabs
    switch (activeTab) {
      case 'seeking':
        result = result.filter((p) => p.seeking_teammates);
        break;
      case 'trending':
        result.sort((a, b) => b.upvotes.length - a.upvotes.length);
        break;
      case 'ai':
        result = result.filter((p) =>
          p.tags.some((t) =>
            ['ai', 'ml', 'pytorch', 'deeplearning', 'computervision', 'edgeai'].includes(
              t.toLowerCase()
            )
          )
        );
        break;
      case 'web':
        result = result.filter((p) =>
          p.tags.some((t) =>
            ['react', 'typescript', 'nextjs', 'css', 'designsystem', 'web'].includes(
              t.toLowerCase()
            )
          )
        );
        break;
      case 'hardware':
        result = result.filter((p) =>
          p.tags.some((t) =>
            ['hardware', 'robotics', 'iot', 'rust', 'ros2', 'embedded', 'drones'].includes(
              t.toLowerCase()
            )
          )
        );
        break;
      case 'all':
      default:
        break;
    }

    return result;
  }, [posts, searchQuery, activeTab]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg bg-surface-elevated text-text border border-accent/40 shadow-glow animate-slideUp text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-pill bg-accent/10 border border-accent/20 text-accent text-xs font-mono mb-2">
            <Flame className="w-3.5 h-3.5" />
            <span>Campus Build Stream</span>
          </div>
          <h1 className="text-2xl font-bold text-text tracking-tight">Project Showcase & Feed</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Discover peer projects, upvote engineering breakthroughs, and join exciting builds across colleges.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateOpen(true)}
          className="shadow-glow"
        >
          Showcase Project
        </Button>
      </div>

      {/* Controls Bar: Search & Category Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, technologies, colleges..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-surface border border-border rounded-lg text-text focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-colors shrink-0 ${
              activeTab === 'all'
                ? 'bg-accent text-white shadow-glow'
                : 'bg-surface text-text-muted hover:text-text border border-border'
            }`}
          >
            All Builds
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seeking')}
            className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'seeking'
                ? 'bg-accent text-white shadow-glow'
                : 'bg-surface text-text-muted hover:text-text border border-border'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Seeking Teammates
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trending')}
            className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'trending'
                ? 'bg-accent text-white shadow-glow'
                : 'bg-surface text-text-muted hover:text-text border border-border'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Most Upvoted
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-colors shrink-0 ${
              activeTab === 'ai'
                ? 'bg-accent text-white shadow-glow'
                : 'bg-surface text-text-muted hover:text-text border border-border'
            }`}
          >
            AI / ML
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('web')}
            className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-colors shrink-0 ${
              activeTab === 'web'
                ? 'bg-accent text-white shadow-glow'
                : 'bg-surface text-text-muted hover:text-text border border-border'
            }`}
          >
            Web & Systems
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hardware')}
            className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-colors shrink-0 ${
              activeTab === 'hardware'
                ? 'bg-accent text-white shadow-glow'
                : 'bg-surface text-text-muted hover:text-text border border-border'
            }`}
          >
            Robotics & IoT
          </button>
        </div>
      </div>

      {/* Grid of Posts */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-72 rounded-card bg-surface/50 border border-border animate-pulse p-5"
            />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="p-12 text-center rounded-card bg-surface border border-border/80">
          <Code2 className="w-10 h-10 text-text-muted/60 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-text mb-1">No project showcases match your filter</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto mb-4">
            Try resetting your search query or be the first to showcase a new build to your fellow students!
          </p>
          <Button size="sm" variant="primary" onClick={() => setIsCreateOpen(true)}>
            Showcase First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={profile?.id}
              onUpvote={handleUpvote}
              onOpenDetails={(p) => setSelectedPost(p)}
              onPitchToJoin={(p) => handlePitchToJoin(p)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {profile && (
        <CreatePostModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreatePost}
          currentProfile={{
            id: profile.id,
            name: profile.name,
            avatar_url: profile.avatar_url,
            college: profile.college,
            department: profile.department,
          }}
        />
      )}

      <ProjectDetailModal
        post={selectedPost}
        isOpen={Boolean(selectedPost)}
        onClose={() => setSelectedPost(null)}
        currentUserId={profile?.id}
        currentUserName={profile?.name}
        onUpvote={handleUpvote}
        onPitchToJoin={(p, note) => handlePitchToJoin(p, note)}
      />
    </div>
  );
};
