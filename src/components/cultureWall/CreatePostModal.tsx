import React, { useState } from 'react';
import { cultureWallService } from '../../services/cultureWallService';
import type { CultureWallPost, CreatePostRequest } from '../../types/cultureWall';
import { X, Image as ImageIcon, Video, Link as LinkIcon, Hash, MapPin, Globe } from 'lucide-react';

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated: (post: CultureWallPost) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'text' | 'photo' | 'video' | 'link'>('text');
  const [category, setCategory] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'couples_only' | 'friends_only' | 'private'>('public');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleAddHashtag = () => {
    if (hashtagInput.trim() && !hashtags.includes(hashtagInput.trim())) {
      setHashtags([...hashtags, hashtagInput.trim().replace(/^#/, '')]);
      setHashtagInput('');
    }
  };

  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const postData: CreatePostRequest = {
        content: content.trim(),
        post_type: postType,
        media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
        category: (category || undefined) as any,
        hashtags: hashtags.length > 0 ? hashtags : undefined,
        visibility,
      };

      const newPost = await cultureWallService.createPost(postData);
      onPostCreated(newPost);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's on your mind?
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              placeholder="Share your thoughts, experiences, or cultural insights..."
            />
          </div>

          {/* Post Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPostType('text')}
                className={`flex-1 py-2 px-4 rounded-lg border ${
                  postType === 'text'
                    ? 'bg-pink-50 border-pink-600 text-pink-600'
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                Text
              </button>
              <button
                type="button"
                onClick={() => setPostType('photo')}
                className={`flex-1 py-2 px-4 rounded-lg border flex items-center justify-center gap-2 ${
                  postType === 'photo'
                    ? 'bg-pink-50 border-pink-600 text-pink-600'
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Photo
              </button>
              <button
                type="button"
                onClick={() => setPostType('video')}
                className={`flex-1 py-2 px-4 rounded-lg border flex items-center justify-center gap-2 ${
                  postType === 'video'
                    ? 'bg-pink-50 border-pink-600 text-pink-600'
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                <Video className="w-4 h-4" />
                Video
              </button>
              <button
                type="button"
                onClick={() => setPostType('link')}
                className={`flex-1 py-2 px-4 rounded-lg border flex items-center justify-center gap-2 ${
                  postType === 'link'
                    ? 'bg-pink-50 border-pink-600 text-pink-600'
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                Link
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category (Optional)
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="w-4 h-4 inline mr-1" />
              Hashtags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddHashtag();
                  }
                }}
                placeholder="Add hashtag..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddHashtag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Add
              </button>
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {hashtags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveHashtag(tag)}
                      className="text-pink-600 hover:text-pink-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              Who can see this?
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="public">Public - Everyone can see</option>
              <option value="couples_only">Couples Only</option>
              <option value="friends_only">Friends Only</option>
              <option value="private">Private - Only me</option>
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
