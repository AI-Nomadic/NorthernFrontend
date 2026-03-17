import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, LogOut, Image, User } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../state/store';
import { logout } from '../../../state/slices/userSlice';
import { useNavigate } from 'react-router-dom';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { cn } from '@utils';

const Navbar: React.FC = () => {
  const { isAuthenticated, email } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsDropdownOpen(false));

  const handleLogout = () => {
    setIsDropdownOpen(false);
    dispatch(logout());
    navigate('/login');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glassmorphism h-20 px-6 flex items-center justify-center"
    >
      <div className="max-w-7xl w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 dark:shadow-primary/10">
            <Plane className="text-white w-6 h-6 rotate-45" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Northern Path <span className="text-primary">AI</span></span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
          <button onClick={() => document.getElementById('collections-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-primary dark:hover:text-primary transition-colors">Curated Collections</button>
          <button onClick={() => document.getElementById('discover-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-primary dark:hover:text-primary transition-colors">Discover Regions</button>
          <button onClick={() => document.getElementById('footer-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-primary dark:hover:text-primary transition-colors">About Us</button>
        </div>

        <div className="flex items-center gap-3">
          {!isAuthenticated && (
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors px-4 py-2"
            >
              Login
            </button>
          )}

          <button
            onClick={() => document.getElementById('plan-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-slate-900 dark:bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-800 dark:hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-200 dark:shadow-none"
          >
            Get Started
          </button>

          {isAuthenticated && (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold hover:opacity-90 transition-transform hover:scale-105 focus:outline-none border-2 border-transparent focus:border-purple-300 ml-1 shadow-sm"
              >
                {email ? email[0].toUpperCase() : <User className="w-5 h-5" />}
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-a0 rounded-xl shadow-xl border border-slate-100 dark:border-surface-a10 overflow-hidden z-50 py-1"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-surface-a10 mb-1">
                       <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{email || 'User'}</p>
                    </div>
                    <button
                      onClick={() => { setIsDropdownOpen(false); navigate('/gallery'); }}
                      className="w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-surface-a10 transition-colors"
                    >
                      <Image className="w-4 h-4 text-slate-400" />
                      Gallery
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
