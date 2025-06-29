import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X } from 'lucide-react';
import ProfileVerificationForm from './ProfileVerificationForm';
import ProfileVerificationReport from './ProfileVerificationReport';
import { useProfileVerification } from '../../hooks/useProfileVerification';

interface ProfileVerificationModalProps {
  userId: string;
  targetUserId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ProfileVerificationModal: React.FC<ProfileVerificationModalProps> = ({
  userId,
  targetUserId,
  isOpen,
  onClose
}) => {
  const [step, setStep] = useState<'form' | 'report'>('form');
  const [reportId, setReportId] = useState<string | null>(null);
  
  const { reports } = useProfileVerification(userId);
  
  // Check if there's an existing report
  React.useEffect(() => {
    const existingReport = reports.find(r => 
      r.targetUserId === targetUserId && 
      (r.status === 'completed' || r.status === 'in_progress')
    );
    
    if (existingReport) {
      setReportId(existingReport.id);
      setStep('report');
    }
  }, [reports, targetUserId]);
  
  const handleFormComplete = (newReportId: string) => {
    setReportId(newReportId);
    setStep('report');
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          {step === 'form' && (
            <ProfileVerificationForm
              userId={userId}
              targetUserId={targetUserId}
              onComplete={handleFormComplete}
              onCancel={onClose}
            />
          )}
          
          {step === 'report' && reportId && (
            <ProfileVerificationReport
              reportId={reportId}
              onClose={onClose}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileVerificationModal;