
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Globe } from 'lucide-react';

interface HeroProps {
  onCtaClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onCtaClick }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 20 } }
  };

  return (
    <section className="relative pt-40 pb-20 px-6 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Background blobs */}
      <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-primary/10 dark:bg-primary/5 rounded-full blur-[100px] opacity-40 dark:opacity-20 -z-10" />
      <div className="absolute bottom-10 left-[-10%] w-[400px] h-[400px] bg-purple-100 dark:bg-purple-900/20 rounded-full blur-[100px] opacity-40 dark:opacity-20 -z-10" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center"
      >
        <div className="text-center lg:text-left">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Now supporting all 10 provinces & 3 territories
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white leading-[1.1] mb-6"
          >
            Plan Your Next Adventure, <br />
            Minus the <span className="text-gradient-chaos">Chaos</span>.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-lg mx-auto lg:mx-0"
          >
            Smart, AI-enabled itineraries designed for travelers, not tourists. Logistically sound, locally inspired.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <button
              onClick={onCtaClick}
              className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-primary/20 dark:shadow-none flex items-center justify-center gap-2 group"
            >
              Start Planning <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
              Watch Demo
            </button>
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="relative flex justify-center lg:justify-end"
        >
          <div className="relative w-full max-w-[500px] aspect-square">
            {/* Abstract Floating UI Elements */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-10 right-0 w-64 h-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 z-20"
            >
              <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 overflow-hidden">
                <img src="https://picsum.photos/seed/banff/400/200" alt="Banff" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="space-y-3">
                <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-full" />
                <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
                <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800 rounded-full" />
                <div className="pt-4 flex justify-between items-center">
                  <div className="h-8 w-24 bg-primary/10 dark:bg-primary/20 rounded-lg" />
                  <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-full" />
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-0 left-0 w-56 h-48 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 z-30"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Globe className="text-purple-600 dark:text-purple-400 w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
                  <div className="h-2 w-10 bg-slate-50 dark:bg-slate-800 rounded-full" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
                <div className="h-2 w-2/3 bg-slate-100 dark:bg-slate-800 rounded-full" />
              </div>
            </motion.div>

            {/* Decorative circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-primary/10 to-purple-50 dark:from-primary/20 dark:to-purple-900/20 rounded-full -z-10" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
