// Live Streams Browse Page - Lists active streams and allows creation
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Plus, Users, Eye, Clock } from 'lucide-react';
import { CreateStreamModal } from '../components/LiveStream/CreateStreamModal';
import { liveStreamService } from '../services/liveStream.service';
import { LiveStream } from '../types/liveStream.types';

// Mock user data - in real app, this would come from auth context
const CURRENT_USER = {
  id: 'user_' + Math.random().toString(36).substr(2, 9),
  username: 'Demo User',
  avatarUrl: undefined,
};

const LiveStreamBrowsePage: React.FC = () => {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load active streams
  useEffect(() => {
    loadStreams();
  }, []);

  const loadStreams = async () => {
    setIsLoading(false);
    // In a real app, you would fetch from Supabase
    // For now, we'll show an empty state
    setStreams([]);
  };

  const handleCreateStream = async (title: string, maxParticipants: number) => {
    const stream = await liveStreamService.createStream(
      CURRENT_USER.id,
      title,
      maxParticipants
    );

    if (stream) {
      // Navigate to the stream page
      navigate(`/live/${stream.id}`);
    } else {
      alert('Failed to create stream. Please check your Supabase configuration.');
    }
  };

  const handleJoinStream = (streamId: string) => {
    navigate(`/live/${streamId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg">
                <Video className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Live Streams</h1>
                <p className="text-gray-400 mt-1">Connect with people in real-time</p>
              </div>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-pink-500/25"
            >
              <Plus className="w-5 h-5" />
              Start Stream
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        ) : streams.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="inline-block p-6 bg-gray-800 rounded-full mb-6">
              <Video className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No Active Streams</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Be the first to go live! Start a stream and connect with others in real-time.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-pink-500/25 text-lg"
            >
              <Plus className="w-6 h-6" />
              Start Your First Stream
            </button>
          </div>
        ) : (
          // Streams Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {streams.map((stream) => (
              <div
                key={stream.id}
                className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-pink-500 transition-all cursor-pointer group"
                onClick={() => handleJoinStream(stream.id)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                  <Video className="w-16 h-16 text-white opacity-50" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      LIVE
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">{stream.viewer_count}</span>
                  </div>
                </div>

                {/* Stream Info */}
                <div className="p-4">
                  <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-pink-400 transition-colors">
                    {stream.title}
                  </h3>
                  <div className="flex items-center gap-4 text-gray-400 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{stream.max_participants} max</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(stream.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4">
              <Video className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">
              Multi-Participant Streaming
            </h3>
            <p className="text-gray-400 text-sm">
              Host streams with up to 9 participants simultaneously with dynamic grid layouts.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">
              Host Controls
            </h3>
            <p className="text-gray-400 text-sm">
              Spotlight participants, change layouts, and manage who appears on screen.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">
              Real-Time Experience
            </h3>
            <p className="text-gray-400 text-sm">
              Low-latency WebRTC streaming with live chat and instant updates for all viewers.
            </p>
          </div>
        </div>
      </main>

      {/* Create Stream Modal */}
      <CreateStreamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateStream={handleCreateStream}
      />
    </div>
  );
};

export default LiveStreamBrowsePage;
