import { useState, useEffect } from 'react';
import { curatedImages } from '../utils/imageOptimization';

interface UseImagePreloaderProps {
  images: string[];
  priority?: boolean;
}

export const useImagePreloader = ({ images, priority = false }: UseImagePreloaderProps) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (images.length === 0) {
      setIsLoading(false);
      return;
    }

    const imagePromises = images.map((src) => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, src]));
          resolve(src);
        };
        
        img.onerror = () => {
          console.warn(`Failed to preload image: ${src}`);
          resolve(src); // Resolve anyway to not block other images
        };

        // Add priority hint for critical images
        if (priority && 'fetchPriority' in img) {
          (img as any).fetchPriority = 'high';
        }
        
        img.src = src;
      });
    });

    // Track progress
    let completed = 0;
    imagePromises.forEach(promise => {
      promise.then(() => {
        completed++;
        setProgress((completed / images.length) * 100);
      });
    });

    Promise.allSettled(imagePromises).then(() => {
      setIsLoading(false);
    });
  }, [images, priority]);

  return {
    loadedImages,
    isLoading,
    progress,
    isImageLoaded: (src: string) => loadedImages.has(src),
  };
};

// Hook for critical image preloading
export const useCriticalImages = (images: string[]) => {
  useEffect(() => {
    // Preload critical images immediately
    images.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });

    return () => {
      // Cleanup preload links
      images.forEach(src => {
        const link = document.querySelector(`link[href="${src}"]`);
        if (link) {
          document.head.removeChild(link);
        }
      });
    };
  }, [images]);
};

// Preload all critical images for the site
export const usePreloadCriticalImages = () => {
  const criticalImages = [
    curatedImages.hero.main,
    ...curatedImages.hero.avatars,
    curatedImages.features.main,
    ...curatedImages.testimonials.slice(0, 3), // First 3 testimonials
  ];

  useCriticalImages(criticalImages);
};