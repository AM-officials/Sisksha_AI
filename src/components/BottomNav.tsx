import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Trophy, User, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useAuth();
  
  const navItems = [
    {
      name: 'Home',
      icon: <Home />,
      path: '/home',
      showForGuest: false
    },
    {
      name: 'Study',
      icon: <BookOpen />,
      path: '/study',
      showForGuest: true
    },
    {
      name: 'Leaderboard',
      icon: <Trophy />,
      path: '/leaderboard',
      showForGuest: false
    },
    {
      name: 'Profile',
      icon: <User />,
      path: '/profile',
      showForGuest: false
    },
    {
      name: 'Settings',
      icon: <Settings />,
      path: '/settings',
      showForGuest: true
    }
  ];
  
  return (
    <div className="bottomnav fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `flex flex-col items-center py-2 px-3 ${
              isActive
                ? 'text-siksha-purple'
                : 'text-gray-500'
            }`}
          >
            <div className={`w-6 h-6 mb-1 ${
              currentPath === item.path
                ? 'text-siksha-purple'
                : 'text-gray-500'
            }`}>
              {item.icon}
            </div>
            <span className="text-xs">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
