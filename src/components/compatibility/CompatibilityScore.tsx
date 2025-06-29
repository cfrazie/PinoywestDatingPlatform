import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, ArrowUp, ArrowDown, Info } from 'lucide-react';

interface CompatibilityScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const CompatibilityScore: React.FC<CompatibilityScoreProps> = ({
  score,
  size = 'md',
  showLabel = true,
  className = ''
}) => {
  // Determine color based on score
  const getColor = () => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  // Determine size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-lg px-4 py-2';
      default:
        return 'text-sm px-3 py-1.5';
    }
  };

  // Get label text
  const getLabel = () => {
    if (score >= 90) return 'Exceptional Match';
    if (score >= 80) return 'Great Match';
    if (score >= 70) return 'Good Match';
    if (score >= 60) return 'Fair Match';
    return 'Basic Match';
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center rounded-full font-medium ${getColor()} ${getSizeClasses()} ${className}`}
    >
      <Heart className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} mr-1`} />
      <span>{Math.round(score)}%</span>
      {showLabel && <span className="ml-1 hidden sm:inline">{getLabel()}</span>}
    </motion.div>
  );
};

export default CompatibilityScore;