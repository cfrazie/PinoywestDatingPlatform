import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ImageIcon, Loader2 } from 'lucide-react';
import { optimizeImageUrl, generateSrcSet, generateSizes } from '../../utils/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  lazy?: boolean;
  placeholder?: 'blur' | 'empty';
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  priority?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  quality = 85,
  lazy = true,
  placeholder = 'blur',
  fallback,
  onLoad,
  onError,
  sizes,
  priority = false,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView || priority) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [lazy, isInView, priority]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  const optimizedSrc = optimizeImageUrl(src, { width, height, quality });
  const srcSet = src.includes('pexels.com') ? generateSrcSet(src) : '';
  const imageSizes = sizes || generateSizes();

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {(isLoading || !isInView) && placeholder === 'blur' && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            {isLoading && isInView ? (
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-400" />
            )}
          </div>
        </div>
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          {fallback ? (
            <img
              src={fallback}
              alt={alt}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center text-gray-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Image failed to load</p>
            </div>
          )}
        </div>
      )}

      {/* Main image */}
      {isInView && !hasError && (
        <motion.img
          ref={imgRef}
          src={optimizedSrc}
          srcSet={srcSet}
          sizes={imageSizes}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy && !priority ? 'lazy' : 'eager'}
          fetchPriority={priority ? 'high' : 'auto'}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  );
};

export default OptimizedImage;