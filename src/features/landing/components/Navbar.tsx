import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, LogOut, Image, User, LayoutGrid } from 'lucide-react';
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
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30"
            style={{ background: 'linear-gradient(135deg, #da09de 0%, #8b5cf6 100%)' }}>
            <Plane className="text-white w-5 h-5 rotate-45" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            Northern Path <span className="text-primary">AI</span>
          </span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
          <button
            onClick={() => document.getElementById('collections-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="nav-link hover:text-primary dark:hover:text-primary transition-colors pb-1"
          >
            Curated Collections
          </button>
          <button
            onClick={() => document.getElementById('discover-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="nav-link hover:text-primary dark:hover:text-primary transition-colors pb-1"
          >
            Discover Regions
          </button>
          <button
            onClick={() => document.getElementById('footer-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="nav-link hover:text-primary dark:hover:text-primary transition-colors pb-1"
          >
            About Us
          </button>
        </div>

        {/* Right Actions */}
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
            className="relative overflow-hidden px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 group"
            style={{ background: 'linear-gradient(135deg, #da09de 0%, #8b5cf6 100%)' }}
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>

          {isAuthenticated && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={cn(
                  "w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold transition-all hover:scale-105 focus:outline-none ml-1 shadow-lg shadow-primary/20",
                  isDropdownOpen ? "ring-2 ring-primary/40 ring-offset-2 ring-offset-white dark:ring-offset-slate-950" : "hover:ring-2 hover:ring-primary/30 hover:ring-offset-2 hover:ring-offset-white dark:hover:ring-offset-slate-950"
                )}
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
                    className="absolute right-0 mt-2 w-52 bg-white dark:bg-surface-a0 rounded-2xl shadow-2xl border border-slate-100 dark:border-surface-a10 overflow-hidden z-50 py-1"
                    style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)' }}
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
                      onClick={() => { setIsDropdownOpen(false); navigate('/dashboard'); }}
                      className="w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-surface-a10 transition-colors"
                    >
                      <LayoutGrid className="w-4 h-4 text-slate-400" />
                      Dashboard
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
