// RelationshipStatusModal Component
// Modal for managing relationship status - change status, send requests, end relationships

import React, { useState } from 'react';
import { X, Heart, Users, UserPlus, Calendar } from 'lucide-react';
import { useRelationshipStatus } from '../../hooks/useRelationshipStatus';
import type { RelationshipStatus } from '../../types/relationship.types';

interface RelationshipStatusModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RelationshipStatusModal({ userId, isOpen, onClose }: RelationshipStatusModalProps) {
  const {
    status,
    loading,
    sendRequest,
    endCurrentRelationship,
  } = useRelationshipStatus(userId);

  const [step, setStep] = useState<'main' | 'send_request' | 'end_relationship'>('main');
  const [selectedStatus, setSelectedStatus] = useState<RelationshipStatus>('talking');
  const [partnerSearch, setPartnerSearch] = useState('');
  const [message, setMessage] = useState('');
  const [breakupDate, setBreakupDate] = useState('');
  const [endReason, setEndReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSendRequest = async () => {
    if (!partnerSearch.trim()) return;

    setIsSubmitting(true);
    try {
      // In a real implementation, you would search for the user first
      // For now, this is a placeholder
      await sendRequest(partnerSearch, selectedStatus, message);
      alert('Relationship request sent!');
      onClose();
    } catch (error) {
      alert('Failed to send request: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndRelationship = async () => {
    if (!breakupDate) {
      alert('Please select a breakup date');
      return;
    }

    setIsSubmitting(true);
    try {
      await endCurrentRelationship({
        breakup_date: breakupDate,
        end_reason: endReason,
      });
      alert('Relationship ended. Status updated to Recently Single.');
      onClose();
    } catch (error) {
      alert('Failed to end relationship: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Relationship Status
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {step === 'main' && (
              <div className="space-y-4">
                {/* Current Status */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Current Status</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {status?.status.replace('_', ' ') || 'Single'}
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={() => setStep('send_request')}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors"
                  >
                    <UserPlus className="w-5 h-5 text-pink-600" />
                    <span className="font-medium text-pink-700">
                      Start a New Relationship
                    </span>
                  </button>

                  {status?.status && status.status !== 'single' && status.status !== 'recently_single' && (
                    <button
                      onClick={() => setStep('end_relationship')}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Calendar className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-700">
                        End Current Relationship
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {step === 'send_request' && (
              <div className="space-y-4">
                <button
                  onClick={() => setStep('main')}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  ← Back
                </button>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship Type
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as RelationshipStatus)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="talking">Talking to Someone</option>
                    <option value="in_relationship">In a Relationship</option>
                    <option value="engaged">Engaged</option>
                    <option value="married">Married</option>
                    <option value="friends_only">Friends Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partner Username or Email
                  </label>
                  <input
                    type="text"
                    value={partnerSearch}
                    onChange={(e) => setPartnerSearch(e.target.value)}
                    placeholder="Enter username or email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a personal message..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleSendRequest}
                  disabled={isSubmitting || !partnerSearch.trim()}
                  className="w-full px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            )}

            {step === 'end_relationship' && (
              <div className="space-y-4">
                <button
                  onClick={() => setStep('main')}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  ← Back
                </button>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ This will publicly show "Recently Single since [date]" for 2 weeks
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Breakup Date *
                  </label>
                  <input
                    type="date"
                    value={breakupDate}
                    onChange={(e) => setBreakupDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason (Optional, Private)
                  </label>
                  <textarea
                    value={endReason}
                    onChange={(e) => setEndReason(e.target.value)}
                    placeholder="This is private and only for your records..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleEndRelationship}
                  disabled={isSubmitting || !breakupDate}
                  className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Processing...' : 'End Relationship'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
