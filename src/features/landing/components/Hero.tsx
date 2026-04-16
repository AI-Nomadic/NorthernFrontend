
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
      <div className="absolute top-20 right-[-10%] w-[520px] h-[520px] rounded-full blur-[120px] opacity-30 dark:opacity-15 -z-10"
        style={{ background: 'radial-gradient(circle, rgba(218,9,222,0.35) 0%, rgba(139,92,246,0.2) 60%, transparent 100%)' }} />
      <div className="absolute bottom-10 left-[-10%] w-[420px] h-[420px] rounded-full blur-[100px] opacity-30 dark:opacity-15 -z-10"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, rgba(218,9,222,0.15) 60%, transparent 100%)' }} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center"
      >
        <div className="text-center lg:text-left">
          {/* Live badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Now supporting all 10 provinces &amp; 3 territories
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white leading-[1.05] tracking-tight mb-6"
          >
            Plan Your Next Adventure, <br />
            Minus the <span className="text-gradient-chaos">Chaos</span>.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed"
          >
            Smart, AI-enabled itineraries designed for travelers, not tourists. Logistically sound, locally inspired.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <button
              onClick={onCtaClick}
              className="relative overflow-hidden w-full sm:w-auto px-8 py-4 text-white rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-primary/25 dark:shadow-primary/10 flex items-center justify-center gap-2 group"
              style={{ background: 'linear-gradient(135deg, #da09de 0%, #8b5cf6 100%)' }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Planning <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>

          </motion.div>
        </div>

        {/* Right — floating UI cards */}
        <motion.div variants={itemVariants} className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[500px] aspect-square">
            {/* Main floating card */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
              className="absolute top-10 right-0 w-64 h-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100/80 dark:border-slate-800 p-6 z-20"
              style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)' }}
            >
              <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 overflow-hidden">
                <img
                  src="https://picsum.photos/seed/banff/400/200"
                  alt="Banff"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Banff, Alberta</h3>
                  <div className="flex items-center gap-0.5">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">4.9</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  7 days · Mountains, Lakes & Wildlife
                </p>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">AI Curated</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span className="text-[9px] font-bold text-emerald-500">9 stops planned</span>
                </div>
                <div className="pt-2 flex justify-between items-center">
                  <span
                    className="text-xs font-black text-white px-3 py-1.5 rounded-lg"
                    style={{ background: 'linear-gradient(135deg, #da09de 0%, #8b5cf6 100%)' }}
                  >
                    $2,400 CAD
                  </span>
                  <button className="w-8 h-8 bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 dark:hover:bg-primary/10 rounded-full flex items-center justify-center transition-colors">
                    <span className="text-slate-400 dark:text-slate-500 text-sm">♡</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Secondary floating card */}
            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut', delay: 0.5 }}
              className="absolute bottom-0 left-0 w-56 h-48 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100/80 dark:border-slate-800 p-6 z-30"
              style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(218,9,222,0.15) 0%, rgba(139,92,246,0.15) 100%)' }}
                >
                  <Globe className="text-purple-500 dark:text-purple-400 w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">AI Suggestion</p>
                  <p className="text-[10px] text-primary font-semibold">Northern AI ✦</p>
                </div>
              </div>
              <div className="space-y-2 mb-3">
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Quebec City Winter Loop</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md">5 Days</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-md">14 Activities</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-md">Budget-friendly</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                  <span>Planning progress</span>
                  <span className="text-primary">72%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-[72%] rounded-full" style={{ background: 'linear-gradient(90deg, #da09de, #8b5cf6)' }} />
                </div>
              </div>
            </motion.div>

            {/* Decorative rotating circle */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full -z-10"
              style={{
                background: 'conic-gradient(from 0deg, rgba(218,9,222,0.08), rgba(139,92,246,0.12), rgba(218,9,222,0.04), rgba(139,92,246,0.08), rgba(218,9,222,0.08))'
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
