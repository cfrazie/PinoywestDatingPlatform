import React, { useEffect, useState, useCallback } from 'react';
import { cultureWallService } from '../../services/cultureWallService';
import type { CultureWallPost } from '../../types/cultureWall';
import { PostCard } from './PostCard';
import { CreatePostModal } from './CreatePostModal';
import { Hash, TrendingUp, Filter, Plus } from 'lucide-react';

interface CultureWallFeedProps {
  feedType?: 'discover' | 'following' | 'trending' | 'local' | 'topics';
  userId?: string;
  category?: string;
}

export const CultureWallFeed: React.FC<CultureWallFeedProps> = ({
  feedType = 'discover',
  userId,
  category,
}) => {
  const [posts, setPosts] = useState<CultureWallPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(category || '');

  const loadPosts = useCallback(async (append = false) => {
    try {
      setLoading(true);
      const newPosts = await cultureWallService.getPosts({
        limit: 20,
        offset: append ? offset : 0,
        category: selectedCategory || undefined,
        userId,
      });

      if (append) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      setHasMore(newPosts.length === 20);
      setOffset(append ? offset + 20 : 20);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [offset, selectedCategory, userId]);

  useEffect(() => {
    loadPosts(false);
  }, [selectedCategory]);

  useEffect(() => {
    // Subscribe to real-time updates
    const subscription = cultureWallService.subscribeToPostUpdates((payload) => {
      if (payload.eventType === 'INSERT' && !selectedCategory) {
        setPosts(prev => [payload.new as CultureWallPost, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setPosts(prev =>
          prev.map(post => (post.id === payload.new.id ? payload.new as CultureWallPost : post))
        );
      } else if (payload.eventType === 'DELETE') {
        setPosts(prev => prev.filter(post => post.id !== payload.old.id));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedCategory]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 100
    ) {
      if (hasMore && !loading) {
        loadPosts(true);
      }
    }
  }, [hasMore, loading, loadPosts]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handlePostCreated = (newPost: CultureWallPost) => {
    setPosts(prev => [newPost, ...prev]);
    setShowCreateModal(false);
  };

  const categories = [
    'food',
    'traditions',
    'travel',
    'dating_tips',
    'language',
    'festivals',
    'success_story',
    'question',
    'advice',
    'cultural_challenge',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Culture Wall</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
          >
            <Plus className="w-5 h-5" />
            Create Post
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        {/* Feed Type Tabs */}
        <div className="flex gap-4 border-b border-gray-200">
          <button className="pb-2 px-4 border-b-2 border-pink-600 text-pink-600 font-medium">
            <Hash className="w-4 h-4 inline mr-1" />
            Discover
          </button>
          <button className="pb-2 px-4 text-gray-600 hover:text-gray-900">
            <TrendingUp className="w-4 h-4 inline mr-1" />
            Trending
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            <p className="mt-2 text-gray-600">Loading posts...</p>
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600 text-lg">No posts yet. Be the first to share!</p>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
};
