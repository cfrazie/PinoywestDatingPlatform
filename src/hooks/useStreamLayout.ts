// useStreamLayout Hook - Manages dynamic grid layout calculations
import { useMemo, useCallback } from 'react';
import { GridLayoutConfig, LayoutType } from '../types/liveStream.types';

export const useStreamLayout = (
  participantCount: number,
  layoutType: LayoutType,
  spotlightUserId?: string
) => {
  // Calculate grid dimensions based on participant count
  const gridConfig = useMemo((): GridLayoutConfig => {
    if (participantCount === 0) {
      return { columns: 0, rows: 0, maxParticipants: 0 };
    } else if (participantCount === 1) {
      return { columns: 1, rows: 1, maxParticipants: 1 };
    } else if (participantCount === 2) {
      return { columns: 2, rows: 1, maxParticipants: 2 };
    } else if (participantCount <= 4) {
      return { columns: 2, rows: 2, maxParticipants: 4 };
    } else if (participantCount <= 6) {
      return { columns: 3, rows: 2, maxParticipants: 6 };
    } else {
      return { columns: 3, rows: 3, maxParticipants: 9 };
    }
  }, [participantCount]);

  // Calculate individual tile size for grid layout
  const getTileSize = useCallback((index: number, isSpotlight: boolean = false) => {
    if (layoutType === 'spotlight') {
      if (isSpotlight) {
        // Main spotlight video takes 70-80% of screen
        return {
          width: '100%',
          height: '100%',
          aspectRatio: '16/9',
          gridColumn: 'span 1',
          gridRow: 'span 1',
        };
      } else {
        // Thumbnail videos
        return {
          width: '100%',
          height: '100%',
          aspectRatio: '16/9',
          gridColumn: 'span 1',
          gridRow: 'span 1',
        };
      }
    } else {
      // Grid layout - all equal size
      return {
        width: '100%',
        height: '100%',
        aspectRatio: '16/9',
        gridColumn: 'span 1',
        gridRow: 'span 1',
      };
    }
  }, [layoutType]);

  // Get container class based on layout type
  const getContainerClass = useCallback(() => {
    if (layoutType === 'spotlight') {
      return 'spotlight-layout';
    } else {
      return `grid-layout grid-cols-${gridConfig.columns}`;
    }
  }, [layoutType, gridConfig.columns]);

  // Get grid template for CSS
  const getGridTemplate = useCallback(() => {
    if (layoutType === 'grid') {
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${gridConfig.columns}, 1fr)`,
        gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
        gap: '0.5rem',
      };
    } else {
      // Spotlight layout
      return {
        display: 'flex',
        flexDirection: 'row' as const,
        gap: '0.5rem',
      };
    }
  }, [layoutType, gridConfig]);

  // Get spotlight layout structure
  const getSpotlightLayout = useCallback(() => {
    return {
      main: {
        width: '75%',
        height: '100%',
      },
      thumbnails: {
        width: '25%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '0.5rem',
        overflowY: 'auto' as const,
      },
    };
  }, []);

  // Calculate if we need scrolling for thumbnails
  const needsScroll = useMemo(() => {
    if (layoutType === 'spotlight' && participantCount > 5) {
      return true;
    }
    return false;
  }, [layoutType, participantCount]);

  // Get responsive breakpoints
  const getResponsiveLayout = useCallback((screenWidth: number) => {
    if (screenWidth < 640) {
      // Mobile
      if (layoutType === 'spotlight') {
        return {
          main: { width: '100%', height: '70%' },
          thumbnails: { width: '100%', height: '30%', flexDirection: 'row' as const },
        };
      } else {
        // Force fewer columns on mobile
        const mobileColumns = Math.min(gridConfig.columns, 2);
        return {
          gridTemplateColumns: `repeat(${mobileColumns}, 1fr)`,
        };
      }
    } else if (screenWidth < 1024) {
      // Tablet
      if (layoutType === 'spotlight') {
        return {
          main: { width: '70%', height: '100%' },
          thumbnails: { width: '30%', height: '100%', flexDirection: 'column' as const },
        };
      }
    }
    // Desktop - use default layout
    return null;
  }, [layoutType, gridConfig.columns]);

  // Animation transition classes
  const getTransitionClass = useCallback(() => {
    return 'transition-all duration-300 ease-in-out';
  }, []);

  return {
    gridConfig,
    getTileSize,
    getContainerClass,
    getGridTemplate,
    getSpotlightLayout,
    needsScroll,
    getResponsiveLayout,
    getTransitionClass,
  };
};
