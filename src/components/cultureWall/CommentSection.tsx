import React, { useState, useEffect } from 'react';
import { cultureWallService } from '../../services/cultureWallService';
import type { CultureWallComment } from '../../types/cultureWall';
import { Send, Heart } from 'lucide-react';

interface CommentSectionProps {
  postId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [comments, setComments] = useState<CultureWallComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();

    // Subscribe to real-time comment updates
    const subscription = cultureWallService.subscribeToCommentUpdates(postId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setComments(prev => [...prev, payload.new as CultureWallComment]);
      } else if (payload.eventType === 'UPDATE') {
        setComments(prev =>
          prev.map(comment =>
            comment.id === payload.new.id ? payload.new as CultureWallComment : comment
          )
        );
      } else if (payload.eventType === 'DELETE') {
        setComments(prev => prev.filter(comment => comment.id !== payload.old.id));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [postId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await cultureWallService.getComments(postId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const comment = await cultureWallService.createComment({
        post_id: postId,
        content: newComment.trim(),
      });
      setComments(prev => [...prev, comment]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await cultureWallService.addReaction({
        comment_id: commentId,
        reaction_type: 'like',
      });
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? { ...comment, likes_count: comment.likes_count + 1 }
            : comment
        )
      );
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="border-t border-gray-200 bg-gray-50">
      <div className="p-4 space-y-4">
        {/* Comments List */}
        {loading ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600"></div>
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  U
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm text-gray-900">User Name</h4>
                      <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-1 px-3">
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-pink-600 transition"
                    >
                      <Heart className="w-3 h-3" />
                      {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
                    </button>
                    <button className="text-xs text-gray-600 hover:text-pink-600 transition">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-sm py-4">No comments yet. Be the first to comment!</p>
        )}

        {/* Add Comment Form */}
        <form onSubmit={handleSubmitComment} className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            U
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-full focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="px-4 py-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
