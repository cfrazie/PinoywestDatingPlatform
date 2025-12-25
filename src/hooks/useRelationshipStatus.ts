// useRelationshipStatus Hook
// Custom hook for managing relationship status

import { useState, useEffect, useCallback } from 'react';
import {
  getRelationshipStatus,
  getRelationshipStatusWithPartner,
  updateRelationshipStatus,
  sendRelationshipRequest,
  getPendingRequests,
  getSentRequests,
  acceptRelationshipRequest,
  declineRelationshipRequest,
  cancelRelationshipRequest,
  endRelationship,
  getRelationshipHistory,
  areUsersConnected,
  calculateRelationshipDuration,
  subscribeToRelationshipStatus,
} from '../services/relationshipService';
import type {
  RelationshipStatusRecord,
  RelationshipRequest,
  RelationshipHistory,
  RelationshipStatusUpdate,
  EndRelationshipData,
  RelationshipStatus,
} from '../types/relationship.types';

export function useRelationshipStatus(userId: string | undefined) {
  const [status, setStatus] = useState<RelationshipStatusRecord | null>(null);
  const [statusWithPartner, setStatusWithPartner] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<RelationshipRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<RelationshipRequest[]>([]);
  const [history, setHistory] = useState<RelationshipHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch relationship status
  const fetchStatus = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const data = await getRelationshipStatus(userId);
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch relationship status');
      console.error('Error fetching relationship status:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch relationship status with partner info
  const fetchStatusWithPartner = useCallback(async () => {
    if (!userId) return;

    try {
      const data = await getRelationshipStatusWithPartner(userId);
      setStatusWithPartner(data);
    } catch (err) {
      console.error('Error fetching status with partner:', err);
    }
  }, [userId]);

  // Fetch pending requests
  const fetchPendingRequests = useCallback(async () => {
    if (!userId) return;

    try {
      const data = await getPendingRequests(userId);
      setPendingRequests(data);
    } catch (err) {
      console.error('Error fetching pending requests:', err);
    }
  }, [userId]);

  // Fetch sent requests
  const fetchSentRequests = useCallback(async () => {
    if (!userId) return;

    try {
      const data = await getSentRequests(userId);
      setSentRequests(data);
    } catch (err) {
      console.error('Error fetching sent requests:', err);
    }
  }, [userId]);

  // Fetch relationship history
  const fetchHistory = useCallback(async () => {
    if (!userId) return;

    try {
      const data = await getRelationshipHistory(userId);
      setHistory(data);
    } catch (err) {
      console.error('Error fetching relationship history:', err);
    }
  }, [userId]);

  // Update relationship status
  const updateStatus = useCallback(async (update: RelationshipStatusUpdate) => {
    if (!userId) return;

    try {
      setLoading(true);
      const data = await updateRelationshipStatus(userId, update);
      setStatus(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update relationship status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Send relationship request
  const sendRequest = useCallback(async (
    toUserId: string,
    requestedStatus: RelationshipStatus,
    message?: string
  ) => {
    if (!userId) return;

    try {
      setLoading(true);
      const data = await sendRelationshipRequest(userId, toUserId, requestedStatus, message);
      await fetchSentRequests();
      setError(null);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send relationship request');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, fetchSentRequests]);

  // Accept request
  const acceptRequest = useCallback(async (requestId: string) => {
    try {
      setLoading(true);
      await acceptRelationshipRequest(requestId);
      await Promise.all([
        fetchStatus(),
        fetchPendingRequests(),
        fetchStatusWithPartner(),
      ]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept request');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchStatus, fetchPendingRequests, fetchStatusWithPartner]);

  // Decline request
  const declineRequest = useCallback(async (requestId: string) => {
    try {
      setLoading(true);
      await declineRelationshipRequest(requestId);
      await fetchPendingRequests();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decline request');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPendingRequests]);

  // Cancel request
  const cancelRequest = useCallback(async (requestId: string) => {
    try {
      setLoading(true);
      await cancelRelationshipRequest(requestId);
      await fetchSentRequests();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel request');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSentRequests]);

  // End relationship
  const endCurrentRelationship = useCallback(async (endData: EndRelationshipData) => {
    if (!userId) return;

    try {
      setLoading(true);
      await endRelationship(userId, endData);
      await Promise.all([
        fetchStatus(),
        fetchHistory(),
        fetchStatusWithPartner(),
      ]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end relationship');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, fetchStatus, fetchHistory, fetchStatusWithPartner]);

  // Check if connected to another user
  const checkConnection = useCallback(async (otherUserId: string): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      return await areUsersConnected(userId, otherUserId);
    } catch (err) {
      console.error('Error checking connection:', err);
      return false;
    }
  }, [userId]);

  // Get relationship duration string
  const getDuration = useCallback((): string | null => {
    if (!status?.started_at) return null;
    return calculateRelationshipDuration(status.started_at);
  }, [status]);

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchStatus();
      fetchStatusWithPartner();
      fetchPendingRequests();
      fetchSentRequests();
      fetchHistory();
    }
  }, [userId, fetchStatus, fetchStatusWithPartner, fetchPendingRequests, fetchSentRequests, fetchHistory]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!userId) return;

    const subscription = subscribeToRelationshipStatus(userId, (newStatus) => {
      setStatus(newStatus);
      fetchStatusWithPartner();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, fetchStatusWithPartner]);

  return {
    status,
    statusWithPartner,
    pendingRequests,
    sentRequests,
    history,
    loading,
    error,
    updateStatus,
    sendRequest,
    acceptRequest,
    declineRequest,
    cancelRequest,
    endCurrentRelationship,
    checkConnection,
    getDuration,
    refreshStatus: fetchStatus,
    refreshPendingRequests: fetchPendingRequests,
    refreshSentRequests: fetchSentRequests,
    refreshHistory: fetchHistory,
  };
}
