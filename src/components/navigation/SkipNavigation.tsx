import React from 'react';

interface SkipNavigationProps {
  links?: Array<{
    href: string;
    label: string;
  }>;
}

const SkipNavigation: React.FC<SkipNavigationProps> = ({
  links = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#navigation', label: 'Skip to navigation' },
    { href: '#footer', label: 'Skip to footer' }
  ]
}) => {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-blue-600 text-white p-4">
        <div className="flex space-x-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="bg-blue-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkipNavigation;