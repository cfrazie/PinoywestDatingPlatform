// RelationshipBadge Component
// Displays relationship status badge on profiles, video calls, and live streams

import React from 'react';
import { RELATIONSHIP_STATUS_ICONS, RELATIONSHIP_STATUS_COLORS } from '../../types/gift.types';
import type { RelationshipBadgeData } from '../../types/relationship.types';

interface RelationshipBadgeProps {
  badge: RelationshipBadgeData;
  onClick?: () => void;
  compact?: boolean;
  className?: string;
}

export function RelationshipBadge({ 
  badge, 
  onClick, 
  compact = false,
  className = '' 
}: RelationshipBadgeProps) {
  const icon = RELATIONSHIP_STATUS_ICONS[badge.status] || '';
  const colorClass = RELATIONSHIP_STATUS_COLORS[badge.status] || 'text-gray-400';

  // Don't show badge for single status
  if (badge.status === 'single') {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  return (
    <div 
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-sm border border-gray-200 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Status Icon */}
      <span className={`text-lg ${colorClass}`} aria-hidden="true">
        {icon}
      </span>

      {/* Status Text and Partner Info */}
      <div className="flex items-center gap-2">
        {compact ? (
          // Compact view - just status name
          <span className={`text-sm font-medium ${colorClass}`}>
            {badge.statusDisplayName || badge.status.replace('_', ' ')}
          </span>
        ) : (
          // Full view - with partner info
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${colorClass}`}>
              {badge.statusDisplayName || badge.status.replace('_', ' ')}
            </span>
            
            {badge.status === 'recently_single' && badge.breakupDate && (
              <span className="text-xs text-gray-500">
                since {new Date(badge.breakupDate).toLocaleDateString()}
              </span>
            )}
            
            {badge.partnerName && badge.isConfirmed && (
              <span className="text-xs text-gray-600">
                with {badge.partnerName}
              </span>
            )}
            
            {badge.duration && badge.status !== 'recently_single' && (
              <span className="text-xs text-gray-500">
                {badge.duration}
              </span>
            )}
          </div>
        )}

        {/* Partner Avatar (if available) */}
        {badge.partnerAvatar && badge.isConfirmed && !compact && (
          <img
            src={badge.partnerAvatar}
            alt={badge.partnerName || 'Partner'}
            className="w-6 h-6 rounded-full border border-gray-200"
          />
        )}
      </div>
    </div>
  );
}

// Compact version for video tiles and live stream participant lists
export function RelationshipBadgeCompact({ badge, onClick }: Omit<RelationshipBadgeProps, 'compact'>) {
  return <RelationshipBadge badge={badge} onClick={onClick} compact={true} />;
}

// Badge for profile headers (larger, more prominent)
export function RelationshipBadgeProfile({ badge, onClick }: Omit<RelationshipBadgeProps, 'compact'>) {
  const icon = RELATIONSHIP_STATUS_ICONS[badge.status] || '';
  const colorClass = RELATIONSHIP_STATUS_COLORS[badge.status] || 'text-gray-400';

  if (badge.status === 'single') {
    return null;
  }

  return (
    <div 
      className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-white shadow-md border border-gray-200 ${onClick ? 'cursor-pointer hover:shadow-lg transition-all' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <span className={`text-2xl ${colorClass}`} aria-hidden="true">
        {icon}
      </span>

      <div className="flex flex-col">
        <span className={`text-base font-semibold ${colorClass}`}>
          {badge.statusDisplayName || badge.status.replace('_', ' ')}
        </span>
        
        {badge.status === 'recently_single' && badge.breakupDate && (
          <span className="text-sm text-gray-500">
            Single since {new Date(badge.breakupDate).toLocaleDateString()}
          </span>
        )}
        
        {badge.partnerName && badge.isConfirmed && (
          <div className="flex items-center gap-2 mt-1">
            {badge.partnerAvatar && (
              <img
                src={badge.partnerAvatar}
                alt={badge.partnerName}
                className="w-8 h-8 rounded-full border-2 border-gray-200"
              />
            )}
            <div className="flex flex-col">
              <span className="text-sm text-gray-700 font-medium">
                {badge.partnerName}
              </span>
              {badge.duration && (
                <span className="text-xs text-gray-500">
                  {badge.duration}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
