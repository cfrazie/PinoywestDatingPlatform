// CreateStreamModal Component - Stream creation interface
import React, { useState } from 'react';
import { X, Video, Users } from 'lucide-react';

interface CreateStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateStream: (title: string, maxParticipants: number) => void;
}

export const CreateStreamModal: React.FC<CreateStreamModalProps> = ({
  isOpen,
  onClose,
  onCreateStream,
}) => {
  const [title, setTitle] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(9);
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsCreating(true);
    try {
      await onCreateStream(title, maxParticipants);
      setTitle('');
      setMaxParticipants(9);
      onClose();
    } catch (error) {
      console.error('Failed to create stream:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-600 rounded-lg">
              <Video className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Start Live Stream</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            disabled={isCreating}
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Stream Title */}
          <div className="mb-6">
            <label htmlFor="stream-title" className="block text-gray-300 font-medium mb-2">
              Stream Title
            </label>
            <input
              id="stream-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a catchy title for your stream..."
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all"
              required
              maxLength={100}
              disabled={isCreating}
            />
            <p className="text-gray-400 text-sm mt-1">
              {title.length}/100 characters
            </p>
          </div>

          {/* Max Participants */}
          <div className="mb-6">
            <label htmlFor="max-participants" className="block text-gray-300 font-medium mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Maximum Participants
              </div>
            </label>
            <select
              id="max-participants"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Number(e.target.value))}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none transition-all"
              disabled={isCreating}
            >
              <option value={2}>2 participants</option>
              <option value={4}>4 participants</option>
              <option value={6}>6 participants</option>
              <option value={9}>9 participants</option>
            </select>
            <p className="text-gray-400 text-sm mt-1">
              Choose how many people can join your stream
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <h3 className="text-blue-400 font-semibold mb-2">Before you start:</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Make sure your camera and microphone are working</li>
              <li>• Find a quiet, well-lit location</li>
              <li>• Check your internet connection</li>
              <li>• As host, you can control the layout and manage participants</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-pink-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!title.trim() || isCreating}
            >
              {isCreating ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Starting...</span>
                </div>
              ) : (
                'Start Stream'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
