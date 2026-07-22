// GiftSendModal Component
// Modal for sending gifts with validation and payment

import React, { useState, useEffect } from 'react';
import { X, Gift as GiftIcon, Send, AlertCircle } from 'lucide-react';
import { useGiftStore } from '../../hooks/useGiftStore';
import type { Gift } from '../../types/gift.types';

interface GiftSendModalProps {
  userId: string;
  recipientId: string;
  recipientName: string;
  giftId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function GiftSendModal({
  userId,
  recipientId,
  recipientName,
  giftId,
  isOpen,
  onClose,
  onSuccess,
}: GiftSendModalProps) {
  const { fetchGift, validateSending, send, loading } = useGiftStore(userId);
  const [gift, setGift] = useState<Gift | null>(null);
  const [message, setMessage] = useState('');
  const [validation, setValidation] = useState<{ allowed: boolean; reason: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && giftId) {
      loadGift();
      checkValidation();
    }
  }, [isOpen, giftId]);

  const loadGift = async () => {
    if (!giftId) return;
    const giftData = await fetchGift(giftId);
    setGift(giftData);
  };

  const checkValidation = async () => {
    if (!giftId) return;
    const result = await validateSending(recipientId, giftId);
    setValidation(result);
  };

  const handleSend = async () => {
    if (!gift || !validation?.allowed) return;

    setIsSubmitting(true);
    try {
      await send({
        gift_id: gift.id,
        to_user_id: recipientId,
        message: message.trim() || undefined,
      });

      alert('Gift sent successfully!');
      onSuccess?.();
      onClose();
    } catch (error) {
      alert('Failed to send gift: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
                <GiftIcon className="w-5 h-5" />
                Send Gift to {recipientName}
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
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            )}

            {!loading && gift && (
              <div className="space-y-4">
                {/* Gift Preview */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg flex items-center justify-center">
                    <span className="text-4xl">
                      {gift.type === 'virtual' ? '✨' : '🎁'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{gift.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{gift.description}</p>
                    <div className="mt-2">
                      <span className="text-lg font-bold text-pink-600">
                        ${gift.price_usd.toFixed(2)}
                      </span>
                      {gift.price_php && (
                        <span className="text-sm text-gray-500 ml-2">
                          ₱{gift.price_php.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Validation Warning */}
                {validation && !validation.allowed && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Cannot Send Gift</p>
                      <p className="text-sm text-red-700 mt-1">{validation.reason}</p>
                    </div>
                  </div>
                )}

                {/* Message Input */}
                {validation?.allowed && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add a Personal Message (Optional)
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write a sweet message to accompany your gift..."
                        rows={4}
                        maxLength={500}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {message.length}/500 characters
                      </p>
                    </div>

                    {/* Physical Gift Notice */}
                    {gift.type === 'physical' && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          📦 This is a physical gift. The recipient will need to provide a shipping address.
                        </p>
                        {gift.delivery_time_days && (
                          <p className="text-sm text-blue-700 mt-1">
                            Estimated delivery: {gift.delivery_time_days} days
                          </p>
                        )}
                      </div>
                    )}

                    {/* Send Button */}
                    <button
                      onClick={handleSend}
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Gift - ${gift.price_usd.toFixed(2)}
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
