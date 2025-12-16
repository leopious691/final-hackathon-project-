import React from 'react';
import { UserRole } from '../types';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
  role: UserRole;
}

const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate, role }) => {
  const navItems = [
    { label: 'Home', path: '/dashboard', icon: '🏠' },
    { label: 'Find Center', path: '/find-center', icon: '🏥' },
    { label: 'Requests', path: '/requests', icon: '🩸' },
    { label: 'History', path: '/history', icon: '📜' },
    { label: 'AI Helper', path: '/assistant', icon: '🤖' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:relative md:border-t-0 md:shadow-none md:bg-white md:border-r md:h-screen md:w-24 lg:w-64 z-50 transition-all duration-300">
      <div className="flex flex-row justify-around items-center h-16 md:flex-col md:justify-start md:h-full md:pt-8 md:space-y-4 px-2">
        {/* Desktop Logo Area */}
        <div className="hidden md:flex flex-col items-center mb-6 text-center w-full">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-red-200">
            🩸
          </div>
          <span className="mt-2 font-bold text-gray-800 text-sm lg:block hidden">Blood Connect</span>
        </div>

        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col lg:flex-row items-center lg:justify-start justify-center p-2 rounded-xl transition-all duration-200 w-full md:py-3 lg:px-5 group
              ${currentPath === item.path 
                ? 'text-red-600 bg-red-50' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
          >
            <span className={`text-2xl mb-1 lg:mb-0 lg:mr-3 group-hover:scale-110 transition-transform ${currentPath === item.path ? 'scale-110' : ''}`}>
              {item.icon}
            </span>
            <span className="text-[10px] md:text-[11px] lg:text-sm font-medium whitespace-nowrap">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;