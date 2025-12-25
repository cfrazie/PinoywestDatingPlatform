// RelationshipAndGifts Demo Page
// Demonstrates the relationship status and gift store features

import React, { useState } from 'react';
import { Heart, Gift, Users, ArrowLeft } from 'lucide-react';
import { RelationshipBadge, RelationshipStatusModal } from '../components/relationships';
import { GiftStore, GiftSendModal, GiftHistory } from '../components/gifts';
import { useRelationshipStatus } from '../hooks/useRelationshipStatus';
import { calculateRelationshipDuration } from '../services/relationshipService';
import type { RelationshipBadgeData } from '../types/relationship.types';

export function RelationshipAndGiftsDemo() {
  // Mock user ID - in production this would come from auth
  const mockUserId = 'demo-user-123';
  const [activeSection, setActiveSection] = useState<'overview' | 'gifts' | 'history'>('overview');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);

  // Example relationship badge data
  const exampleBadges: RelationshipBadgeData[] = [
    {
      status: 'talking',
      statusDisplayName: 'Talking',
      partnerName: 'Sarah Chen',
      partnerAvatar: 'https://i.pravatar.cc/150?img=5',
      partnerId: 'partner-1',
      duration: '2 weeks',
      isConfirmed: true,
    },
    {
      status: 'in_relationship',
      statusDisplayName: 'In a Relationship',
      partnerName: 'Michael Torres',
      partnerAvatar: 'https://i.pravatar.cc/150?img=12',
      partnerId: 'partner-2',
      duration: '3 months',
      isConfirmed: true,
    },
    {
      status: 'engaged',
      statusDisplayName: 'Engaged',
      partnerName: 'Emma Rodriguez',
      partnerAvatar: 'https://i.pravatar.cc/150?img=9',
      partnerId: 'partner-3',
      duration: '1 year, 2 months',
      isConfirmed: true,
    },
    {
      status: 'married',
      statusDisplayName: 'Married',
      partnerName: 'James Wilson',
      partnerAvatar: 'https://i.pravatar.cc/150?img=13',
      partnerId: 'partner-4',
      duration: '5 years',
      isConfirmed: true,
    },
    {
      status: 'friends_only',
      statusDisplayName: 'Friends',
      partnerName: 'Alex Kim',
      partnerAvatar: 'https://i.pravatar.cc/150?img=8',
      partnerId: 'partner-5',
      duration: '6 months',
      isConfirmed: true,
    },
    {
      status: 'recently_single',
      statusDisplayName: 'Recently Single',
      breakupDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      isConfirmed: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Heart className="w-8 h-8 text-pink-500" />
                Relationship & Gift System Demo
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive relationship status tracking and gift store
              </p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveSection('overview')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeSection === 'overview'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="inline-block w-5 h-5 mr-2" />
              Relationship Status
            </button>
            <button
              onClick={() => setActiveSection('gifts')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeSection === 'gifts'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Gift className="inline-block w-5 h-5 mr-2" />
              Gift Store
            </button>
            <button
              onClick={() => setActiveSection('history')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeSection === 'history'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Gift History
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {activeSection === 'overview' && (
          <div className="space-y-8">
            {/* Feature Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Relationship Status System
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-4">
                  The comprehensive relationship status system provides transparency and accountability
                  in the dating platform. Users can publicly display their relationship status, send
                  requests to partners, and manage their connections.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>7 different relationship statuses with public visibility</li>
                  <li>"Recently Single" status displays publicly for exactly 2 weeks</li>
                  <li>Automatic status transition after 2-week period</li>
                  <li>Mutual confirmation required for all relationship statuses</li>
                  <li>Gift sending restricted to connected users only</li>
                  <li>Real-time status updates across the platform</li>
                </ul>
              </div>
            </div>

            {/* Badge Examples */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Relationship Badge Examples
                </h2>
                <button
                  onClick={() => setIsStatusModalOpen(true)}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Edit Status
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {exampleBadges.map((badge, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2 font-medium">
                      {badge.status.replace('_', ' ').toUpperCase()}
                    </p>
                    <RelationshipBadge
                      badge={badge}
                      onClick={() => alert(`Clicked ${badge.statusDisplayName} badge`)}
                    />
                    {badge.status === 'recently_single' && badge.breakupDate && (
                      <p className="text-xs text-gray-500 mt-2">
                        Will auto-convert to "Single" on{' '}
                        {new Date(
                          new Date(badge.breakupDate).getTime() + 14 * 24 * 60 * 60 * 1000
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Public Accountability
                </h3>
                <p className="text-gray-600 text-sm">
                  All relationship statuses are public by default, promoting transparency
                  and preventing catfishing.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Mutual Confirmation
                </h3>
                <p className="text-gray-600 text-sm">
                  Both users must confirm the relationship status to prevent fake
                  relationship claims.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Gift className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Gift Restrictions
                </h3>
                <p className="text-gray-600 text-sm">
                  Users can only send gifts to people they're connected with, ensuring
                  meaningful interactions.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'gifts' && (
          <GiftStore
            userId={mockUserId}
            onSelectGift={(giftId) => {
              setIsGiftModalOpen(true);
              console.log('Selected gift:', giftId);
            }}
          />
        )}

        {activeSection === 'history' && (
          <GiftHistory userId={mockUserId} />
        )}
      </main>

      {/* Modals */}
      <RelationshipStatusModal
        userId={mockUserId}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
      />

      <GiftSendModal
        userId={mockUserId}
        recipientId="demo-recipient"
        recipientName="Demo User"
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
      />
    </div>
  );
}
