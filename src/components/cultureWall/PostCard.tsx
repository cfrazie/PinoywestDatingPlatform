import React, { useState, useEffect } from 'react';
import { cultureWallService } from '../../services/cultureWallService';
import type { CultureWallPost, CultureWallComment } from '../../types/cultureWall';
import { Heart, MessageCircle, Share2, Bookmark, Flag, MoreVertical, Eye } from 'lucide-react';
import { CommentSection } from './CommentSection';

interface PostCardProps {
  post: CultureWallPost;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [localPost, setLocalPost] = useState(post);

  useEffect(() => {
    setLocalPost(post);
  }, [post]);

  const handleLike = async () => {
    try {
      if (liked) {
        // Remove like (would need reaction ID)
        setLiked(false);
        setLocalPost(prev => ({ ...prev, likes_count: prev.likes_count - 1 }));
      } else {
        await cultureWallService.addReaction({
          post_id: post.id,
          reaction_type: 'like',
        });
        setLiked(true);
        setLocalPost(prev => ({ ...prev, likes_count: prev.likes_count + 1 }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (saved) {
        await cultureWallService.unsavePost(post.id);
        setSaved(false);
        setLocalPost(prev => ({ ...prev, saves_count: prev.saves_count - 1 }));
      } else {
        await cultureWallService.savePost(post.id);
        setSaved(true);
        setLocalPost(prev => ({ ...prev, saves_count: prev.saves_count + 1 }));
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const handleShare = async () => {
    try {
      await cultureWallService.sharePost(post.id, 'feed');
      setLocalPost(prev => ({ ...prev, shares_count: prev.shares_count + 1 }));
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleReport = async () => {
    if (confirm('Report this post for inappropriate content?')) {
      try {
        await cultureWallService.reportContent({
          post_id: post.id,
          reason: 'inappropriate_content',
        });
        alert('Post reported successfully');
      } catch (error) {
        console.error('Error reporting:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (hours < 168) return `${Math.floor(hours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white font-semibold">
            U
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">User Name</h3>
            <p className="text-sm text-gray-500">{formatDate(localPost.created_at)}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Category Badge */}
      {localPost.category && (
        <div className="px-4 pb-2">
          <span className="inline-block px-3 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">
            {localPost.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="px-4 pb-4">
        <p className="text-gray-800 whitespace-pre-wrap">{localPost.content}</p>
        
        {/* Hashtags */}
        {localPost.hashtags && localPost.hashtags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {localPost.hashtags.map(tag => (
              <a
                key={tag}
                href={`#${tag}`}
                className="text-pink-600 hover:text-pink-700 text-sm font-medium"
              >
                #{tag}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Media (if any) */}
      {localPost.media_urls && localPost.media_urls.length > 0 && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {localPost.media_urls.slice(0, 4).map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Post media ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            {localPost.likes_count}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            {localPost.comments_count}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {localPost.views_count}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>{localPost.shares_count} shares</span>
          <span>{localPost.saves_count} saves</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            liked
              ? 'text-pink-600 bg-pink-50'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          <span className="font-medium">Like</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">Comment</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition"
        >
          <Share2 className="w-5 h-5" />
          <span className="font-medium">Share</span>
        </button>

        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            saved
              ? 'text-pink-600 bg-pink-50'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
          <span className="font-medium">Save</span>
        </button>

        <button
          onClick={handleReport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition"
        >
          <Flag className="w-5 h-5" />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && <CommentSection postId={localPost.id} />}
    </div>
  );
};
