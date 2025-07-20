import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Play, Star, Users } from 'lucide-react';
import Button from '../ui/Button';
import OptimizedImage from '../ui/OptimizedImage';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { curatedImages, imageDimensions } from '../../utils/imageOptimization';
import { trackEventSecure } from '../../services/secureApi';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAnalytics } from '../analytics/AnalyticsProvider';

const Hero: React.FC = () => {
  const { elementRef, isIntersecting } = useIntersectionObserver();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { trackEvent, trackUserInteraction } = useAnalytics();

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    
    checkAuth();
  }, []);

  const handleGetStarted = () => {
    trackEventSecure('hero_cta_clicked', { button: 'get_started' });
    trackUserInteraction('click', 'hero_get_started_button');
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleWatchDemo = () => {
    trackEventSecure('hero_cta_clicked', { button: 'watch_demo' });
    trackUserInteraction('click', 'hero_watch_demo_button');
    
    // Simulate opening a demo video
    const confirmed = confirm('Would you like to watch our platform demo video? (This would open a video modal in production)');
    if (confirmed) {
      console.log('Demo video would start playing...');
      trackEvent('demo_video_started', { source: 'hero_section' });
      // In production, this would open a video modal or redirect to a demo page
      alert('🎥 Demo video starting! This would show you how our platform works.');
    }
  };

  return (
    <section 
      ref={elementRef}
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-pink-50 overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isIntersecting ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6"
            >
              <Star className="w-4 h-4 mr-2" />
              #1 Filipino-Western Dating Platform
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Find Your Perfect
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-600">
                {' '}Cross-Cultural
              </span>
              <br />
              Connection
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-xl text-gray-600 mb-8 max-w-2xl"
            >
              Bridge cultures, build lasting relationships. Connect with Filipino and Western singles who share your values and dreams for a multicultural future.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="flex flex-wrap justify-center lg:justify-start gap-8 mb-8"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">50K+</div>
                <div className="text-sm text-gray-600">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">12K+</div>
                <div className="text-sm text-gray-600">Success Stories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">95%</div>
                <div className="text-sm text-gray-600">Match Success Rate</div>
              </div>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              {isLoggedIn ? (
                <Button
                  size="lg"
                  component={Link}
                  to="/dashboard"
                  className="group"
                >
                  <User className="w-5 h-5 mr-2" />
                  Go to Dashboard
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="group"
                >
                  <Heart className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                  Start Your Journey
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                onClick={handleWatchDemo}
                className="group"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isIntersecting ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500"
            >
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                Verified Profiles
              </div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div>SSL Secured</div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div>24/7 Support</div>
            </motion.div>
          </motion.div>

          {/* Right content - Hero image/illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isIntersecting ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative z-10">
              {/* Main hero image */}
              <div className="relative bg-gradient-to-br from-blue-400 to-pink-400 rounded-3xl p-8 shadow-2xl">
                <OptimizedImage
                  src={curatedImages.hero.main}
                  alt="Happy multicultural couple"
                  className="w-full h-80 rounded-2xl"
                  width={imageDimensions.hero.width}
                  height={imageDimensions.hero.height}
                  priority={true}
                  placeholder="blur"
                />
                
                {/* Floating elements */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-4 -left-4 bg-white p-3 rounded-full shadow-lg"
                >
                  <Heart className="w-6 h-6 text-red-500" />
                </motion.div>
                
                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -bottom-4 -right-4 bg-white p-3 rounded-full shadow-lg"
                >
                  <Star className="w-6 h-6 text-yellow-500" />
                </motion.div>
              </div>

              {/* Success notification */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isIntersecting ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 1.6 }}
                className="absolute -bottom-6 left-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    <OptimizedImage
                      src={curatedImages.hero.avatars[0]}
                      alt="User 1"
                      className="w-8 h-8 rounded-full border-2 border-white"
                      width={imageDimensions.heroAvatar.width}
                      height={imageDimensions.heroAvatar.height}
                      priority={true}
                    />
                    <OptimizedImage
                      src={curatedImages.hero.avatars[1]}
                      alt="User 2"
                      className="w-8 h-8 rounded-full border-2 border-white"
                      width={imageDimensions.heroAvatar.width}
                      height={imageDimensions.heroAvatar.height}
                      priority={true}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Maria & John</p>
                    <p className="text-xs text-gray-500">Just got engaged! 💍</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;