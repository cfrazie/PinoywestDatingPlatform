import React from 'react';
import { motion } from 'framer-motion';
import { Home, Search, Heart, MessageCircle, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  badge?: number;
}

interface MobileBottomNavigationProps {
  className?: string;
}

const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({
  className = ''
}) => {
  const location = useLocation();
  
  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      href: '/'
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      href: '/search'
    },
    {
      id: 'matches',
      label: 'Matches',
      icon: Heart,
      href: '/matches',
      badge: 3
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      href: '/messages',
      badge: 2
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      href: '/profile'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden ${className}`}
    >
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.id}
              to={item.href}
              className={`flex flex-col items-center py-2 px-3 min-w-0 flex-1 relative ${
                active ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <div className="relative">
                <item.icon className={`w-6 h-6 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                
                {/* Badge */}
                {item.badge && item.badge > 0 && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </div>
                )}
              </div>
              
              <span className={`text-xs mt-1 font-medium ${
                active ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
              
              {/* Active Indicator */}
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default MobileBottomNavigation;