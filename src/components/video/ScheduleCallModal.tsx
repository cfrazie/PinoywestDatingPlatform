import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, Phone, X, Globe } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import OptimizedImage from '../ui/OptimizedImage';
import { ChatUser } from '../../types/messaging';

interface ScheduleCallModalProps {
  currentUser: ChatUser;
  otherUser: ChatUser;
  onClose: () => void;
  onSchedule: (scheduledTime: Date, callType: 'video' | 'audio', timezone: string) => void;
}

const ScheduleCallModal: React.FC<ScheduleCallModalProps> = ({
  currentUser,
  otherUser,
  onClose,
  onSchedule
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [callType, setCallType] = useState<'video' | 'audio'>('video');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [message, setMessage] = useState('');

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime) return;

    const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}`);
    onSchedule(scheduledDateTime, callType, timezone);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMinTime = () => {
    const now = new Date();
    const today = new Date().toISOString().split('T')[0];
    
    if (selectedDate === today) {
      // If today is selected, minimum time is current time + 30 minutes
      const minTime = new Date(now.getTime() + 30 * 60000);
      return minTime.toTimeString().slice(0, 5);
    }
    return '00:00';
  };

  const formatTimezone = (tz: string) => {
    return tz.replace('_', ' ').replace('/', ' / ');
  };

  const commonTimezones = [
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Manila',
    'Australia/Sydney',
    'America/Toronto'
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Schedule Call</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <OptimizedImage
              src={otherUser.avatar}
              alt={otherUser.name}
              className="w-12 h-12 rounded-full"
              width={48}
              height={48}
            />
            <div>
              <h3 className="font-semibold text-gray-900">{otherUser.name}</h3>
              <p className="text-sm text-gray-500">{otherUser.location}</p>
            </div>
          </div>

          {/* Call Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Call Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCallType('video')}
                className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                  callType === 'video'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Video className="w-5 h-5" />
                <span>Video Call</span>
              </button>
              <button
                onClick={() => setCallType('audio')}
                className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                  callType === 'audio'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Phone className="w-5 h-5" />
                <span>Voice Call</span>
              </button>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <Input
              label="Date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getMinDate()}
              icon={<Calendar className="w-4 h-4 text-gray-400" />}
              required
            />
          </div>

          {/* Time Selection */}
          <div>
            <Input
              label="Time"
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              min={getMinTime()}
              icon={<Clock className="w-4 h-4 text-gray-400" />}
              required
            />
          </div>

          {/* Timezone Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                {formatTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)} (Your timezone)
              </option>
              {commonTimezones
                .filter(tz => tz !== Intl.DateTimeFormat().resolvedOptions().timeZone)
                .map(tz => (
                  <option key={tz} value={tz}>
                    {formatTimezone(tz)}
                  </option>
                ))}
            </select>
          </div>

          {/* Optional Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a note about the call..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/200 characters
            </p>
          </div>

          {/* Preview */}
          {selectedDate && selectedTime && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Call Summary</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div>
                  <strong>Type:</strong> {callType === 'video' ? 'Video Call' : 'Voice Call'}
                </div>
                <div>
                  <strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>Time:</strong> {selectedTime} ({formatTimezone(timezone)})
                </div>
                <div>
                  <strong>With:</strong> {otherUser.name}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSchedule}
            disabled={!selectedDate || !selectedTime}
          >
            Schedule Call
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ScheduleCallModal;