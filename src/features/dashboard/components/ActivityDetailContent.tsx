import React, { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { Activity } from '@types';
import { motion, AnimatePresence } from 'framer-motion';

interface ActivityDetailContentProps {
    activity: Activity;
    onRemove: () => void;
}

export const ActivityDetailContent: React.FC<ActivityDetailContentProps> = ({ activity, onRemove }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const [direction, setDirection] = useState(0);

    // Use provided gallery or fallback to featured image or default
    const images = activity.imageGallery?.length
        ? activity.imageGallery
        : activity.imageUrl
            ? [activity.imageUrl]
            : ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1000'];

    // -- Auto-Play Carousel --
    useEffect(() => {
        if (images.length <= 1 || isHovering) return;

        const timer = setInterval(() => {
            setDirection(1);
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [images.length, isHovering]);

    const paginate = (newDirection: number) => {
        setDirection(newDirection);
        setCurrentImageIndex((prev) => (prev + newDirection + images.length) % images.length);
    };

    const variants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (dir: number) => ({
            zIndex: 0,
            x: dir < 0 ? 1000 : -1000,
            opacity: 0
        })
    };

    const searchQuery = activity.title && activity.location 
        ? `${activity.title}, ${activity.location}`
        : activity.location || activity.title || '';
    
    let mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
    if (activity.placeId) {
        mapLink += `&query_place_id=${activity.placeId}`;
    }

    return (
        <div className="space-y-6">
            {/* -- Carousel Section -- */}
            <div
                className="aspect-video w-full rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative group shadow-xl"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                <AnimatePresence initial={false} custom={direction}>
                    <motion.img
                        key={currentImageIndex}
                        src={images[currentImageIndex]}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        alt={`${activity.title} ${currentImageIndex + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </AnimatePresence>

                {/* Carousel Controls */}
                {images.length > 1 && (
                    <>
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 z-20 pointer-events-none">
                            <button
                                onClick={() => paginate(-1)}
                                className="pointer-events-auto w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => paginate(1)}
                                className="pointer-events-auto w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Pagination Dots */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 p-1.5 rounded-full bg-black/10 backdrop-blur-xs">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setDirection(idx > currentImageIndex ? 1 : -1);
                                        setCurrentImageIndex(idx);
                                    }}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentImageIndex
                                            ? 'bg-white scale-125 shadow-sm'
                                            : 'bg-white/40 hover:bg-white/60'
                                        }`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* -- Info Section -- */}
            <div className="space-y-3">
                <h4 className="text-3xl font-black text-slate-800 dark:text-white leading-tight tracking-tight">
                    {activity.title}
                </h4>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold text-base">
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        <MapPin className="w-4 h-4" />
                    </div>
                    {activity.location}
                </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg italic">
                "{activity.description}"
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-surface-a10 p-4 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-surface-a20 transition-colors">
                    <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                        <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {activity.isEvent ? 'Event Time' : 'Duration'}
                        </span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                            {activity.isEvent && activity.time 
                                ? activity.time
                                : `${activity.durationMinutes} mins`}
                        </span>
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-surface-a10 p-4 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-surface-a20 transition-colors">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                        <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. Cost</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                            {activity.price_note || `$${activity.cost_estimate || 0} CAD`}
                        </span>
                    </div>
                </div>
            </div>

            {activity.isEvent && activity.eventDate && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl flex items-center gap-3 border border-indigo-100 dark:border-indigo-800/30">
                    <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
                        <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <span className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Event Date</span>
                        <span className="font-bold text-indigo-700 dark:text-indigo-300">
                            {new Date(activity.eventDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3 pt-6 border-t border-slate-100 dark:border-surface-a20">
                {activity.bookingUrl && (
                    <a
                        href={activity.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                        <ChevronRight className="w-5 h-5" /> Book on Ticketmaster
                    </a>
                )}

                <a
                    href={mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-100 dark:bg-surface-a20 hover:bg-slate-200 dark:hover:bg-surface-a30 text-slate-700 dark:text-slate-300 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all border border-slate-200 dark:border-surface-a30"
                >
                    <MapPin className="w-5 h-5" /> Open in Google Maps
                </a>

                <button
                    onClick={onRemove}
                    className="w-full mt-2 font-bold text-red-500 dark:text-red-400/70 hover:text-red-600 transition-colors py-2 text-sm"
                >
                    Remove Activity
                </button>
            </div>
        </div>
    );
};
