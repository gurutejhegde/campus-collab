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
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl glass-card text-white border border-purple-500/40 shadow-glow animate-slideUp text-xs flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Showcase Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-card p-6 md:p-10 border border-white/[0.08] shadow-2xl">
        {/* Glow orb in banner */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill border border-purple-500/30 text-purple-300 text-xs font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              <span>Live Campus Build Stream</span>
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Where Student Engineers <br />
              <span className="text-gradient-brand">Showcase & Build Teams</span>
            </h1>

            <p className="text-sm text-text-muted leading-relaxed font-sans max-w-xl">
              Explore peer projects across universities, upvote breakthrough engineering, and connect with passionate student collaborators.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="lg"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateOpen(true)}
              className="shadow-glow"
            >
              Showcase Build
            </Button>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Category Filter Pills */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, technologies, colleges..."
            className="w-full pl-10 pr-4 py-2.5 text-xs glass-pill border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-text-muted"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-glow'
                : 'glass-pill text-text-muted hover:text-white border border-white/[0.08]'
            }`}
          >
            All Builds
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seeking')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'seeking'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black shadow-glow-emerald'
                : 'glass-pill text-text-muted hover:text-white border border-white/[0.08]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Seeking Teammates
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trending')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'trending'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-glow-pink'
                : 'glass-pill text-text-muted hover:text-white border border-white/[0.08]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Top Upvoted
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-glow'
                : 'glass-pill text-text-muted hover:text-white border border-white/[0.08]'
            }`}
          >
            AI & Deep Learning
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('web')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'web'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-glow'
                : 'glass-pill text-text-muted hover:text-white border border-white/[0.08]'
            }`}
          >
            Web & Systems
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hardware')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'hardware'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-glow'
                : 'glass-pill text-text-muted hover:text-white border border-white/[0.08]'
            }`}
          >
            Robotics & IoT
          </button>
        </div>
      </div>

      {/* Grid of Posts */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-80 rounded-2xl glass-card animate-pulse p-5"
            />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="p-16 text-center rounded-3xl glass-card border border-white/[0.08]">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <Code2 className="w-7 h-7 text-purple-400" />
          </div>
          <h3 className="font-display text-lg font-bold text-white mb-1">No projects found</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto mb-5">
            Adjust your filters or be the first to publish a project showcase for your college!
          </p>
          <Button size="sm" variant="primary" onClick={() => setIsCreateOpen(true)}>
            Showcase First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
