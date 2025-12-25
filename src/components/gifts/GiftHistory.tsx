// GiftHistory Component
// Display sent and received gift history

import React, { useState } from 'react';
import { useGiftStore } from '../../hooks/useGiftStore';
import { Gift, Send, Inbox, Package, Clock, CheckCircle, XCircle } from 'lucide-react';

interface GiftHistoryProps {
  userId: string;
}

export function GiftHistory({ userId }: GiftHistoryProps) {
  const { sentGifts, receivedGifts, loading } = useGiftStore(userId);
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('received');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'shipped':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const gifts = activeTab === 'sent' ? sentGifts : receivedGifts;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Gift className="w-8 h-8 text-pink-500" />
          Gift History
        </h1>
        <p className="text-gray-600">
          View your sent and received gifts
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'received'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Inbox className="inline-block w-5 h-5 mr-2" />
            Received ({receivedGifts.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'sent'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Send className="inline-block w-5 h-5 mr-2" />
            Sent ({sentGifts.length})
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          <p className="mt-4 text-gray-600">Loading gifts...</p>
        </div>
      )}

      {/* Gift List */}
      {!loading && (
        <div className="space-y-4">
          {gifts.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No gifts {activeTab === 'sent' ? 'sent' : 'received'} yet
              </h3>
              <p className="text-gray-500">
                {activeTab === 'sent'
                  ? 'Start sending gifts to your loved ones!'
                  : 'Gifts you receive will appear here'}
              </p>
            </div>
          ) : (
            gifts.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Gift Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl">
                      {transaction.gift_type === 'virtual' ? '✨' : '🎁'}
                    </span>
                  </div>

                  {/* Gift Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {/* Gift name would come from joined gift data */}
                          Gift Transaction
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {activeTab === 'sent' ? 'Sent to' : 'Received from'}{' '}
                          <span className="font-medium">User</span>
                        </p>
                        {transaction.message && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            "{transaction.message}"
                          </p>
                        )}
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-pink-600">
                          ${transaction.amount_usd.toFixed(2)}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {getStatusIcon(transaction.status)}
                          <span className="text-sm text-gray-600">
                            {getStatusLabel(transaction.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Transaction Info */}
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </span>
                      {transaction.gift_type === 'physical' && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            Physical Delivery
                          </span>
                        </>
                      )}
                      {transaction.delivery_tracking_number && (
                        <>
                          <span>•</span>
                          <span>
                            Tracking: {transaction.delivery_tracking_number}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Delivery Date */}
                    {transaction.delivered_at && (
                      <div className="mt-2 text-sm text-green-600">
                        ✓ Delivered on {new Date(transaction.delivered_at).toLocaleDateString()}
                      </div>
                    )}
                    {transaction.shipped_at && !transaction.delivered_at && (
                      <div className="mt-2 text-sm text-blue-600">
                        📦 Shipped on {new Date(transaction.shipped_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
