
import React from 'react';
import { motion } from 'framer-motion';
import { Plane } from 'lucide-react';

const Navbar: React.FC = () => {
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
          <a href="#" className="hover:text-primary dark:hover:text-primary transition-colors">Features</a>
          <a href="#" className="hover:text-primary dark:hover:text-primary transition-colors">Destinations</a>
          <a href="#" className="hover:text-primary dark:hover:text-primary transition-colors">Pricing</a>
          <a href="#" className="hover:text-primary dark:hover:text-primary transition-colors">About</a>
        </div>

        <button
          onClick={() => document.getElementById('plan-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-slate-900 dark:bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-800 dark:hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-200 dark:shadow-none"
        >
          Get Started
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
