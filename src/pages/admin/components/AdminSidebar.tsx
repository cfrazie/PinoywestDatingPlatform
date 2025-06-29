import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Shield, Clock, Activity, Settings, 
  Home, Database, Bell, Lock, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: Home, href: '/admin/dashboard' },
    { key: 'users', label: 'Admin Users', icon: Users, href: '#' },
    { key: 'activity', label: 'Activity Logs', icon: Activity, href: '#' },
    { key: 'sessions', label: 'Active Sessions', icon: Clock, href: '#' },
    { key: 'security', label: 'Security', icon: Lock, href: '/admin/security' },
    { key: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
  ];
  
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:bg-white md:border-r md:border-gray-200">
      <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex-1 px-3 space-y-1 divide-y divide-gray-200">
          <div className="space-y-1 pb-4">
            {navItems.slice(0, 4).map((item) => (
              <button
                key={item.key}
                onClick={() => item.href === '#' ? onTabChange(item.key) : null}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                  activeTab === item.key
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-6 w-6 ${
                    activeTab === item.key
                      ? 'text-blue-600'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.label}
              </button>
            ))}
          </div>
          
          <div className="pt-4 space-y-1">
            {navItems.slice(4).map((item) => (
              <Link
                key={item.key}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === item.key
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-6 w-6 ${
                    activeTab === item.key
                      ? 'text-blue-600'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">Admin System</p>
            <p className="text-xs text-gray-500">v1.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;