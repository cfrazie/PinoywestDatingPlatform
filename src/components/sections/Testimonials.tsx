import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, Heart, MapPin } from 'lucide-react';
import OptimizedImage from '../ui/OptimizedImage';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { curatedImages, imageDimensions } from '../../utils/imageOptimization';

const Testimonials: React.FC = () => {
  const { elementRef, isIntersecting } = useIntersectionObserver();

  const testimonials = [
    {
      id: 1,
      name: 'Maria Santos',
      location: 'Manila, Philippines',
      avatar: curatedImages.testimonials[0],
      rating: 5,
      content: 'I never thought I\'d find someone who truly understands both my Filipino heritage and my dreams for the future. PinoyWest made it possible to connect with John, and now we\'re planning our wedding!',
      verified: true,
      relationship: 'Married to John (USA)',
    },
    {
      id: 2,
      name: 'David Chen',
      location: 'Los Angeles, USA',
      avatar: curatedImages.testimonials[1],
      rating: 5,
      content: 'The cultural exchange features helped me learn so much about Filipino culture before meeting Isabella. It made our connection deeper and more meaningful from day one.',
      verified: true,
      relationship: 'Dating Isabella (Philippines)',
    },
    {
      id: 3,
      name: 'Sarah Johnson',
      location: 'Toronto, Canada',
      avatar: curatedImages.testimonials[2],
      rating: 5,
      content: 'The verification process gave me confidence that everyone here is serious about finding real love. I met my soulmate Miguel within 3 months of joining!',
      verified: true,
      relationship: 'Engaged to Miguel (Philippines)',
    },
    {
      id: 4,
      name: 'Carlos Rodriguez',
      location: 'Madrid, Spain',
      avatar: curatedImages.testimonials[3],
      rating: 5,
      content: 'The translation feature broke down language barriers and allowed me to communicate with Ana effortlessly. We\'re now learning each other\'s languages together!',
      verified: true,
      relationship: 'In relationship with Ana (Philippines)',
    },
    {
      id: 5,
      name: 'Jennifer Kim',
      location: 'Sydney, Australia',
      avatar: curatedImages.testimonials[4],
      rating: 5,
      content: 'I love how the platform celebrates both cultures equally. It\'s not just about dating - it\'s about building bridges between communities and creating lasting bonds.',
      verified: true,
      relationship: 'Married to Rico (Philippines)',
    },
    {
      id: 6,
      name: 'Michael Thompson',
      location: 'London, UK',
      avatar: curatedImages.testimonials[5],
      rating: 5,
      content: 'The video chat quality is amazing - it felt like Lucia was right there with me despite being thousands of miles away. Distance became irrelevant.',
      verified: true,
      relationship: 'Engaged to Lucia (Philippines)',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section id="testimonials" ref={elementRef} className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Love Stories That Inspire
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real couples, real stories. See how PinoyWest has helped thousands 
            find their perfect cross-cultural match.
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isIntersecting ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={itemVariants}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Quote icon */}
              <div className="flex justify-between items-start mb-4">
                <Quote className="w-8 h-8 text-blue-200" />
                {testimonial.verified && (
                  <div className="flex items-center text-green-600 text-sm">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    Verified
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author info */}
              <div className="flex items-center space-x-3">
                <OptimizedImage
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full"
                  width={imageDimensions.testimonial.width}
                  height={imageDimensions.testimonial.height}
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    {testimonial.location}
                  </div>
                  <div className="flex items-center text-sm text-pink-600 mt-1">
                    <Heart className="w-3 h-3 mr-1" />
                    {testimonial.relationship}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 bg-gradient-to-r from-blue-600 to-pink-600 rounded-2xl p-8 md:p-12 text-white"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Join Our Growing Community
            </h3>
            <p className="text-blue-100 text-lg">
              Thousands of success stories and counting...
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">50,000+</div>
              <div className="text-blue-100">Active Members</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">12,500+</div>
              <div className="text-blue-100">Success Stories</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-100">Match Success Rate</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">4.9/5</div>
              <div className="text-blue-100">Average Rating</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;