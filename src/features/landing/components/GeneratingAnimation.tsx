import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Navigation, Calendar, Brain, Zap } from 'lucide-react';

interface GeneratingAnimationProps {
    isVisible: boolean;
    destination: string;
    numDays?: number; // Duration formula: numDays * 2s (2→4s, 3→6s, 4→8s, 5→10s ...)
}

const STEPS = [
    { icon: Brain,      label: 'Analyzing destination data',        color: 'text-violet-400',  bg: 'bg-violet-500/10'  },
    { icon: MapPin,     label: 'Mapping local hotspots',             color: 'text-pink-400',    bg: 'bg-pink-500/10'    },
    { icon: Calendar,   label: 'Optimizing day-by-day schedule',     color: 'text-cyan-400',    bg: 'bg-cyan-500/10'    },
    { icon: Navigation, label: 'Plotting efficient routes',           color: 'text-amber-400',   bg: 'bg-amber-500/10'   },
    { icon: Zap,        label: 'Finalizing your perfect itinerary',  color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
];

const MIN_DURATION_MS = 4000; // 2 days → 4 s (floor)

export const GeneratingAnimation: React.FC<GeneratingAnimationProps> = ({
    isVisible,
    destination,
    numDays = 3,
}) => {
    const [currentStep,    setCurrentStep]    = useState(0);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [progress,       setProgress]       = useState(0);
    const stepRef     = useRef<ReturnType<typeof setInterval> | null>(null);
    const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (!isVisible) {
            setCurrentStep(0);
            setCompletedSteps([]);
            setProgress(0);
            return;
        }

        // Dynamic timing: numDays × 2 000 ms, min 4 000 ms
        const totalMs      = Math.max(MIN_DURATION_MS, numDays * 2000);
        const stepMs       = totalMs / STEPS.length;
        const TICK_MS      = 50;
        // How much % to add per tick so we reach 90% exactly at totalMs
        const progressStep = 90 / (totalMs / TICK_MS);

        let activeStep = 0;

        stepRef.current = setInterval(() => {
            // Mark the current step as done before advancing
            setCompletedSteps(prev => {
                const next = [...prev, activeStep];
                return next;
            });
            activeStep = (activeStep + 1) % STEPS.length;

            // Loop: clear checkmarks and restart
            if (activeStep === 0) {
                setTimeout(() => setCompletedSteps([]), 280);
            }

            setCurrentStep(activeStep);
        }, stepMs);

        progressRef.current = setInterval(() => {
            setProgress(prev => (prev >= 90 ? prev : Math.min(90, prev + progressStep)));
        }, TICK_MS);

        return () => {
            if (stepRef.current)     clearInterval(stepRef.current);
            if (progressRef.current) clearInterval(progressRef.current);
        };
    }, [isVisible, numDays]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    key="generating-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeOut' } }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-[#07020f]/90 backdrop-blur-2xl" />

                    {/* Ambient orbs */}
                    <motion.div
                        animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                        className="absolute w-[700px] h-[700px] rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(218,9,222,0.15) 0%, transparent 70%)' }}
                    />
                    <motion.div
                        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1.2 }}
                        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }}
                    />

                    {/* Card */}
                    <motion.div
                        initial={{ scale: 0.88, opacity: 0, y: 28 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.92, opacity: 0, y: -20 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                        className="relative z-10 w-full max-w-sm mx-4 rounded-3xl border border-white/[0.08] p-8"
                        style={{
                            background: 'rgba(12, 8, 20, 0.95)',
                            boxShadow: '0 40px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.06)'
                        }}
                    >
                        {/* Rotating conic ring */}
                        <div className="flex justify-center mb-6">
                            <div className="relative w-20 h-20">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 2.8, ease: 'linear' }}
                                    className="absolute inset-0 rounded-full"
                                    style={{
                                        background: 'conic-gradient(from 0deg, #da09de 0%, #8b5cf6 35%, #06b6d4 65%, #da09de 100%)',
                                        padding: '2.5px',
                                        WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2.5px), white calc(100% - 2.5px))',
                                        mask:       'radial-gradient(farthest-side, transparent calc(100% - 2.5px), white calc(100% - 2.5px))'
                                    }}
                                />
                                <div
                                    className="absolute inset-[3px] rounded-full flex items-center justify-center"
                                    style={{ background: 'rgba(12, 8, 20, 0.95)' }}
                                >
                                    <motion.div
                                        animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.12, 1] }}
                                        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                                    >
                                        <Sparkles className="w-7 h-7" style={{ color: '#da09de' }} />
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-extrabold text-white tracking-tight mb-1.5">
                                Crafting Your Journey
                            </h2>
                            <p className="text-sm font-semibold tracking-wide" style={{ color: '#da09de' }}>
                                {destination || 'Your Destination'}
                            </p>
                        </div>

                        {/* Step list */}
                        <div className="space-y-2.5 mb-7">
                            {STEPS.map((step, i) => {
                                const Icon      = step.icon;
                                const isActive  = i === currentStep;
                                const isDone    = completedSteps.includes(i);
                                const isPending = !isActive && !isDone;

                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: isPending ? 0.28 : 1, x: 0 }}
                                        transition={{ delay: i * 0.06, duration: 0.25 }}
                                        className="flex items-center gap-3"
                                    >
                                        {/* Icon bubble */}
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300
                                            ${isActive ? step.bg : isDone ? 'bg-emerald-500/15' : 'bg-white/5'}`}
                                        >
                                            {isDone ? (
                                                <motion.svg
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: 'spring', stiffness: 300 }}
                                                    className="w-4 h-4 text-emerald-400"
                                                    viewBox="0 0 24 24" fill="none"
                                                    stroke="currentColor" strokeWidth="2.5"
                                                >
                                                    <polyline points="20 6 9 17 4 12" />
                                                </motion.svg>
                                            ) : (
                                                <Icon className={`w-4 h-4 transition-colors duration-300
                                                    ${isActive ? step.color : 'text-white/25'}`} />
                                            )}
                                        </div>

                                        {/* Label */}
                                        <span className={`text-sm font-medium transition-colors duration-300
                                            ${isDone ? 'text-emerald-400' : isActive ? 'text-white' : 'text-white/30'}`}>
                                            {step.label}
                                        </span>

                                        {/* Active pulse dot */}
                                        {isActive && (
                                            <motion.span
                                                className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                                                animate={{ opacity: [1, 0.15, 1] }}
                                                transition={{ repeat: Infinity, duration: 0.75 }}
                                                style={{ backgroundColor: '#da09de' }}
                                            />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest"
                                style={{ color: 'rgba(255,255,255,0.25)' }}>
                                <span>AI Processing</span>
                                <span style={{ color: '#da09de' }}>{Math.floor(progress)}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full overflow-hidden"
                                style={{ background: 'rgba(255,255,255,0.07)' }}>
                                <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                        width: `${progress}%`,
                                        background: 'linear-gradient(90deg, #da09de, #8b5cf6, #06b6d4)',
                                        boxShadow: '0 0 10px rgba(218,9,222,0.55)'
                                    }}
                                />
                            </div>
                        </div>

                        <p className="text-center text-[10px] mt-4 font-medium tracking-wider uppercase"
                            style={{ color: 'rgba(255,255,255,0.2)' }}>
                            Powered by Northern AI
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
