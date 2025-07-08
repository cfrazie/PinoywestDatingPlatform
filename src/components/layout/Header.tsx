import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Menu, X, User, LogIn } from 'lucide-react';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    
    checkAuth();
  }, []);

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleGetStarted = () => {
    // First scroll to pricing, then show signup intent
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
      
      // After scrolling, show a message about getting started
      setTimeout(() => {
        const confirmed = confirm(
          'Welcome to PinoyWest! 🌟\n\n' +
          'You can choose a plan below, or would you like to start with our free Basic plan?\n\n' +
          'Click OK to begin with the free plan, or Cancel to choose a different plan.'
        );
        
        if (confirmed) {
          console.log('User selected free Basic plan');
          alert('🎉 Great choice! You\'re starting with our free Basic plan. In a real app, this would create your account!');
        }
      }, 1000);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="p-2 bg-gradient-to-r from-blue-600 to-pink-600 rounded-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className={`text-xl md:text-2xl font-bold transition-colors ${
                isScrolled ? 'text-gray-900' : 'text-gray-900'
              }`}>
                PinoyWest
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className={`font-medium transition-colors hover:text-blue-600 ${
                    isScrolled ? 'text-gray-700' : 'text-gray-900 hover:text-blue-600'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <Button
                  variant="ghost"
                  component={Link}
                  to="/dashboard"
                  className={`${
                    isScrolled 
                      ? 'text-gray-700 hover:text-gray-900' 
                      : 'text-gray-900 hover:text-gray-700 bg-white/10 backdrop-blur-sm'
                  }`}
                >
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={handleGetStarted}
                    className={`${
                      isScrolled 
                        ? 'text-gray-700 hover:text-gray-900' 
                        : 'text-gray-900 hover:text-gray-700 bg-white/10 backdrop-blur-sm'
                    }`}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                  <Button 
                    variant="primary"
                    onClick={handleGetStarted}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Join Now
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                isScrolled 
                  ? 'text-gray-700 hover:bg-gray-100' 
                  : 'text-gray-900 hover:bg-white/20 bg-white/10 backdrop-blur-sm'
              }`}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          <motion.div
            initial={false}
            animate={{
              height: isMobileMenuOpen ? 'auto' : 0,
              opacity: isMobileMenuOpen ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-white/95 backdrop-blur-md rounded-lg mt-2"
          >
            <nav className="py-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {item.name}
                </button>
              ))}
              <div className="px-4 pt-4 border-t border-gray-200 space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={handleGetStarted}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
                <Button 
                  variant="primary" 
                  className="w-full"
                  onClick={handleGetStarted}
                >
                  <User className="w-4 h-4 mr-2" />
                  Join Now
                </Button>
              </div>
            </nav>
          </motion.div>
        </div>
      </motion.header>
    </>
  );
};

export default Header;