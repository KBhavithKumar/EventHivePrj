import React from 'react';
import { Link } from 'react-router-dom';
import { X, Home, Info, Phone, HelpCircle, FileText, Shield, Eye } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const navigationLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/about', label: 'About Us', icon: Info },
    { to: '/contact', label: 'Contact', icon: Phone },
    { to: '/help', label: 'Help Center', icon: HelpCircle },
    { to: '/disclaimer', label: 'Disclaimer', icon: FileText },
    { to: '/terms', label: 'Terms & Conditions', icon: Shield },
    { to: '/privacy', label: 'Privacy Policy', icon: Eye },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-heading font-bold">EventHive</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navigationLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={onClose}
                    className="flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors group"
                  >
                    <IconComponent size={20} className="text-gray-400 group-hover:text-primary-400" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="text-center text-gray-400 text-sm">
            <p>&copy; 2024 EventHive</p>
            <p>University Event Management</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
