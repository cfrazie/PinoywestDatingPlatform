// useGiftStore Hook
// Custom hook for managing gift store operations

import { useState, useEffect, useCallback } from 'react';
import {
  getGiftCatalog,
  getGiftById,
  validateGiftSending,
  sendGift,
  getSentGifts,
  getReceivedGifts,
  getGiftTransaction,
  subscribeToGiftTransaction,
} from '../services/giftService';
import type {
  Gift,
  GiftTransaction,
  GiftFilters,
  GiftCatalogResponse,
  SendGiftRequest,
  GiftValidationResult,
} from '../types/gift.types';

export function useGiftStore(userId: string | undefined) {
  const [catalog, setCatalog] = useState<GiftCatalogResponse | null>(null);
  const [sentGifts, setSentGifts] = useState<GiftTransaction[]>([]);
  const [receivedGifts, setReceivedGifts] = useState<GiftTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch gift catalog
  const fetchCatalog = useCallback(async (
    filters?: GiftFilters,
    page: number = 1,
    pageSize: number = 20
  ) => {
    try {
      setLoading(true);
      const data = await getGiftCatalog(filters, page, pageSize);
      setCatalog(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gift catalog');
      console.error('Error fetching gift catalog:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single gift
  const fetchGift = useCallback(async (giftId: string): Promise<Gift | null> => {
    try {
      setLoading(true);
      const data = await getGiftById(giftId);
      setError(null);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gift');
      console.error('Error fetching gift:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Validate gift sending
  const validateSending = useCallback(async (
    toUserId: string,
    giftId: string
  ): Promise<GiftValidationResult | null> => {
    if (!userId) return null;

    try {
      const result = await validateGiftSending(userId, toUserId, giftId);
      return result;
    } catch (err) {
      console.error('Error validating gift sending:', err);
      return { allowed: false, reason: 'Validation failed' };
    }
  }, [userId]);

  // Send a gift
  const send = useCallback(async (request: SendGiftRequest) => {
    if (!userId) throw new Error('User not authenticated');

    try {
      setLoading(true);
      const transaction = await sendGift(userId, request);
      
      // Refresh sent gifts
      await fetchSentGifts();
      
      setError(null);
      return transaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send gift');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch sent gifts
  const fetchSentGifts = useCallback(async () => {
    if (!userId) return;

    try {
      const data = await getSentGifts(userId);
      setSentGifts(data);
    } catch (err) {
      console.error('Error fetching sent gifts:', err);
    }
  }, [userId]);

  // Fetch received gifts
  const fetchReceivedGifts = useCallback(async () => {
    if (!userId) return;

    try {
      const data = await getReceivedGifts(userId);
      setReceivedGifts(data);
    } catch (err) {
      console.error('Error fetching received gifts:', err);
    }
  }, [userId]);

  // Fetch a specific transaction
  const fetchTransaction = useCallback(async (
    transactionId: string
  ): Promise<GiftTransaction | null> => {
    try {
      const data = await getGiftTransaction(transactionId);
      return data;
    } catch (err) {
      console.error('Error fetching transaction:', err);
      return null;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  useEffect(() => {
    if (userId) {
      fetchSentGifts();
      fetchReceivedGifts();
    }
  }, [userId, fetchSentGifts, fetchReceivedGifts]);

  return {
    catalog,
    sentGifts,
    receivedGifts,
    loading,
    error,
    fetchCatalog,
    fetchGift,
    validateSending,
    send,
    fetchSentGifts,
    fetchReceivedGifts,
    fetchTransaction,
  };
}

// Hook for tracking a specific gift transaction
export function useGiftTransaction(transactionId: string | undefined) {
  const [transaction, setTransaction] = useState<GiftTransaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch transaction
  const fetchTransaction = useCallback(async () => {
    if (!transactionId) return;

    try {
      setLoading(true);
      const data = await getGiftTransaction(transactionId);
      setTransaction(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction');
      console.error('Error fetching transaction:', err);
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  // Initial fetch
  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!transactionId) return;

    const subscription = subscribeToGiftTransaction(transactionId, (newTransaction) => {
      setTransaction(newTransaction);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [transactionId]);

  return {
    transaction,
    loading,
    error,
    refreshTransaction: fetchTransaction,
  };
}
