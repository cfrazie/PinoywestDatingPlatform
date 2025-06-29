import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Phone, Calendar, Clock } from 'lucide-react';
import Button from '../ui/Button';
import VideoCallInterface from './VideoCallInterface';
import ScheduleCallModal from './ScheduleCallModal';
import { ChatUser } from '../../types/messaging';
import { useVideoCall } from '../../hooks/useVideoCall';

interface VideoCallButtonProps {
  currentUser: ChatUser;
  otherUser: ChatUser;
  variant?: 'video' | 'audio';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const VideoCallButton: React.FC<VideoCallButtonProps> = ({
  currentUser,
  otherUser,
  variant = 'video',
  size = 'md',
  className = ''
}) => {
  const [showCallInterface, setShowCallInterface] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);

  const { initiateCall, isCallInProgress } = useVideoCall('', currentUser.id);

  const handleStartCall = async () => {
    try {
      const newCallId = await initiateCall(otherUser.id, variant);
      setCallId(newCallId);
      setShowCallInterface(true);
    } catch (error) {
      console.error('Failed to start call:', error);
    }
  };

  const handleEndCall = () => {
    setShowCallInterface(false);
    setCallId(null);
  };

  const handleScheduleCall = () => {
    setShowScheduleModal(true);
  };

  const getButtonIcon = () => {
    return variant === 'video' ? Video : Phone;
  };

  const getButtonText = () => {
    return variant === 'video' ? 'Video Call' : 'Voice Call';
  };

  const ButtonIcon = getButtonIcon();

  return (
    <>
      <div className="flex items-center space-x-2">
        {/* Main Call Button */}
        <Button
          variant="primary"
          size={size}
          onClick={handleStartCall}
          disabled={isCallInProgress}
          className={`flex items-center space-x-2 ${className}`}
        >
          <ButtonIcon className="w-4 h-4" />
          <span>{getButtonText()}</span>
        </Button>

        {/* Schedule Call Button */}
        <Button
          variant="outline"
          size={size}
          onClick={handleScheduleCall}
          className="flex items-center space-x-2"
        >
          <Calendar className="w-4 h-4" />
          <span>Schedule</span>
        </Button>
      </div>

      {/* Video Call Interface */}
      {showCallInterface && callId && (
        <VideoCallInterface
          callId={callId}
          currentUser={currentUser}
          otherUser={otherUser}
          onEndCall={handleEndCall}
        />
      )}

      {/* Schedule Call Modal */}
      {showScheduleModal && (
        <ScheduleCallModal
          currentUser={currentUser}
          otherUser={otherUser}
          onClose={() => setShowScheduleModal(false)}
          onSchedule={(scheduledTime) => {
            console.log('Call scheduled for:', scheduledTime);
            setShowScheduleModal(false);
          }}
        />
      )}
    </>
  );
};

export default VideoCallButton;