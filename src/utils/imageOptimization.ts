// Enhanced image optimization utilities with better Pexels integration

export interface ImageConfig {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  fit?: 'crop' | 'contain' | 'cover';
}

// Optimized image URLs for different providers
export const optimizeImageUrl = (url: string, config: ImageConfig = {}): string => {
  const { width, height, quality = 85, format, fit = 'crop' } = config;

  // Pexels optimization with better parameters
  if (url.includes('pexels.com')) {
    const baseUrl = url.split('?')[0];
    const params = new URLSearchParams();
    
    params.set('auto', 'compress');
    params.set('cs', 'tinysrgb');
    
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    if (width && height) params.set('fit', fit);
    if (quality !== 85) params.set('q', quality.toString());
    
    // Add dpr for high-density displays
    if (typeof window !== 'undefined' && window.devicePixelRatio > 1) {
      params.set('dpr', Math.min(window.devicePixelRatio, 2).toString());
    }
    
    return `${baseUrl}?${params.toString()}`;
  }

  // Unsplash optimization
  if (url.includes('unsplash.com')) {
    const baseUrl = url.split('?')[0];
    const params = new URLSearchParams();
    
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    if (quality !== 85) params.set('q', quality.toString());
    if (format) params.set('fm', format);
    if (fit) params.set('fit', fit);
    
    return `${baseUrl}?${params.toString()}`;
  }

  return url;
};

// Generate responsive image srcSet with better breakpoints
export const generateSrcSet = (url: string, sizes: number[] = [320, 480, 640, 800, 1024, 1280, 1600]): string => {
  return sizes
    .map(size => `${optimizeImageUrl(url, { width: size })} ${size}w`)
    .join(', ');
};

// Generate sizes attribute for responsive images
export const generateSizes = (breakpoints: { [key: string]: string } = {}): string => {
  const defaultBreakpoints = {
    '(max-width: 320px)': '100vw',
    '(max-width: 640px)': '100vw',
    '(max-width: 1024px)': '50vw',
    '(max-width: 1280px)': '33vw',
    default: '25vw'
  };

  const merged = { ...defaultBreakpoints, ...breakpoints };
  
  return Object.entries(merged)
    .filter(([key]) => key !== 'default')
    .map(([query, size]) => `${query} ${size}`)
    .concat(merged.default)
    .join(', ');
};

// Image format detection and optimization
export const getBestImageFormat = (): 'webp' | 'jpeg' => {
  if (typeof window === 'undefined') return 'jpeg';
  
  // Check WebP support
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  try {
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0 ? 'webp' : 'jpeg';
  } catch {
    return 'jpeg';
  }
};

// Lazy loading intersection observer options
export const lazyLoadOptions: IntersectionObserverInit = {
  threshold: 0.1,
  rootMargin: '50px 0px',
};

// Critical image dimensions for different sections
export const imageDimensions = {
  hero: { width: 1280, height: 720 },
  heroAvatar: { width: 80, height: 80 },
  testimonial: { width: 150, height: 150 },
  feature: { width: 600, height: 400 },
  gallery: { width: 400, height: 300 },
  thumbnail: { width: 200, height: 200 },
  avatar: { width: 80, height: 80 },
} as const;

// Preload critical images
export const preloadImage = (src: string, priority: boolean = false): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    if (priority && 'fetchPriority' in img) {
      (img as any).fetchPriority = 'high';
    }
    
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Batch preload images
export const preloadImages = async (urls: string[], priority: boolean = false): Promise<void> => {
  const promises = urls.map(url => preloadImage(url, priority));
  await Promise.allSettled(promises);
};

// Curated high-quality Pexels images for the dating platform
export const curatedImages = {
  hero: {
    main: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
    avatars: [
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
    ]
  },
  features: {
    main: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg',
    secondary: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg'
  },
  testimonials: [
    'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg',
    'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg',
    'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg'
  ],
  couples: [
    'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg',
    'https://images.pexels.com/photos/1024994/pexels-photo-1024994.jpeg',
    'https://images.pexels.com/photos/1024995/pexels-photo-1024995.jpeg'
  ]
};