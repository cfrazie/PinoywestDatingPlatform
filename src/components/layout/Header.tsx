import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Menu, X, User, LogIn, ChevronDown, Phone, Mail } from 'lucide-react';
import Button from '../ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

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
    { 
      name: 'Platform', 
      href: '#features',
      dropdown: [
        { name: 'Features Overview', href: '#features', description: 'Core platform capabilities' },
        { name: 'Messaging & Video', href: '#messaging', description: 'Real-time communication tools' },
        { name: 'Advanced Search', href: '#search', description: 'Find your perfect match' },
        { name: 'Cultural Learning', href: '#cultural', description: 'Bridge cultural differences' }
      ]
    },
    { 
      name: 'Success Stories', 
      href: '#testimonials',
      dropdown: [
        { name: 'Member Testimonials', href: '#testimonials', description: 'Real couple stories' },
        { name: 'Cultural Profiles', href: '#cultural-profiles', description: 'Cross-cultural connections' },
        { name: 'Success Statistics', href: '#stats', description: 'Platform achievements' }
      ]
    },
    { name: 'Pricing', href: '#pricing' },
    { 
      name: 'Support', 
      href: '#contact',
      dropdown: [
        { name: 'Contact Us', href: '#contact', description: 'Get in touch with our team' },
        { name: 'Help Center', href: '#help', description: 'FAQs and guides' },
        { name: 'Safety Tips', href: '#safety', description: 'Dating safety guidelines' }
      ]
    }
  ];

  const handleDropdownToggle = (itemName: string) => {
    setActiveDropdown(activeDropdown === itemName ? null : itemName);
  };

  const handleDropdownClose = () => {
    setActiveDropdown(null);
  };

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  const handleGetStarted = () => {
    navigate('/sign-in');
    setIsMobileMenuOpen(false);
  };

  const handleJoinNow = () => {
    navigate('/sign-up');
    setIsMobileMenuOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };

    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeDropdown]);

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
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.dropdown && setActiveDropdown(item.name)}
                  onMouseLeave={() => item.dropdown && setActiveDropdown(null)}
                >
                  <button
                    onClick={() => item.dropdown ? handleDropdownToggle(item.name) : scrollToSection(item.href)}
                    className={`flex items-center font-medium transition-colors hover:text-blue-600 ${
                      isScrolled ? 'text-gray-700' : 'text-gray-900 hover:text-blue-600'
                    }`}
                  >
                    {item.name}
                    {item.dropdown && (
                      <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${
                        activeDropdown === item.name ? 'rotate-180' : ''
                      }`} />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {item.dropdown && activeDropdown === item.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                    >
                      {item.dropdown.map((dropdownItem) => (
                        <button
                          key={dropdownItem.name}
                          onClick={() => scrollToSection(dropdownItem.href)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium text-gray-900">{dropdownItem.name}</div>
                          <div className="text-sm text-gray-500 mt-1">{dropdownItem.description}</div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
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
                    onClick={handleJoinNow}
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
            className="md:hidden overflow-hidden bg-white/95 backdrop-blur-md rounded-lg mt-2 shadow-lg"
          >
            <nav className="py-4">
              {navItems.map((item) => (
                <div
                  key={item.name}
                >
                  <button
                    onClick={() => item.dropdown ? handleDropdownToggle(item.name) : scrollToSection(item.href)}
                    className="flex items-center justify-between w-full px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium">{item.name}</span>
                    {item.dropdown && (
                      <ChevronDown className={`w-4 h-4 transition-transform ${
                        activeDropdown === item.name ? 'rotate-180' : ''
                      }`} />
                    )}
                  </button>

                  {/* Mobile Dropdown */}
                  {item.dropdown && activeDropdown === item.name && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gray-50 border-t border-gray-200"
                    >
                      {item.dropdown.map((dropdownItem) => (
                        <button
                          key={dropdownItem.name}
                          onClick={() => scrollToSection(dropdownItem.href)}
                          className="block w-full text-left px-8 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <div className="font-medium">{dropdownItem.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{dropdownItem.description}</div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
              
              {/* Mobile CTA Section */}
              <div className="px-4 pt-4 border-t border-gray-200 space-y-3">
                {/* Quick Contact */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <a href="tel:+15551234567" className="flex items-center hover:text-blue-600">
                    <Phone className="w-4 h-4 mr-2" />
                    (555) 123-4567
                  </a>
                  <a href="mailto:support@pinoywest.com" className="flex items-center hover:text-blue-600">
                    <Mail className="w-4 h-4 mr-2" />
                    Support
                  </a>
                </div>
                
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
                  onClick={handleJoinNow}
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