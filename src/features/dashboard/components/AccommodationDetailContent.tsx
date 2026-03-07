import React, { useState, useEffect } from 'react';
import { MapPin, Star, Link as LinkIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Accommodation } from '@types';
import { motion, AnimatePresence } from 'framer-motion';

interface AccommodationDetailContentProps {
    accommodation: Accommodation;
    onRemove: () => void;
}

export const AccommodationDetailContent: React.FC<AccommodationDetailContentProps> = ({ accommodation, onRemove }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const [direction, setDirection] = useState(0);

    // Use provided gallery or fallback to a default image
    const images = accommodation.imageGallery?.length ? accommodation.imageGallery : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000'];

    // -- Auto-Play Carousel --
    useEffect(() => {
        if (images.length <= 1 || isHovering) return;

        const timer = setInterval(() => {
            setDirection(1);
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 5000); // 5 seconds per slide

        return () => clearInterval(timer);
    }, [images.length, isHovering]);

    // -- Carousel Navigation --
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

    return (
        <div className="space-y-6">
            {/* -- Carousel Header -- */}
            <div
                className="aspect-video w-full rounded-2xl bg-slate-100 overflow-hidden relative group shadow-xl"
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
                        alt={`${accommodation.hotelName} ${currentImageIndex + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </AnimatePresence>

                {/* Glassy Rating Badge */}
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 z-20 border border-white/20">
                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                    <span className="font-bold text-slate-800 dark:text-white text-sm">{accommodation.rating}</span>
                </div>

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
                <div className="flex justify-between items-start gap-4">
                    <h4 className="text-3xl font-black text-slate-800 dark:text-white leading-tight tracking-tight">
                        {accommodation.hotelName}
                    </h4>
                    <div className="flex flex-col items-end shrink-0">
                        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-4 py-2 rounded-2xl shadow-sm">
                            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">${accommodation.pricePerNight}</span>
                            <span className="text-[10px] font-bold text-emerald-500 uppercase ml-1 block text-right mt-1">/ Night</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold text-base">
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        <MapPin className="w-4 h-4" />
                    </div>
                    {accommodation.address}
                </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                {accommodation.description}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
                {accommodation.amenities?.map((a: string) => (
                    <span key={a} className="bg-slate-100 dark:bg-surface-a20 px-4 py-1.5 rounded-full text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-surface-a30">
                        {a}
                    </span>
                ))}
            </div>

            <div className="flex flex-col gap-3 pt-6 border-t border-slate-100 dark:border-surface-a20">
                <div className="grid grid-cols-4 gap-3">
                    <a
                        href={accommodation.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="col-span-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-2xl text-center shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg"
                    >
                        <LinkIcon className="w-5 h-5" /> Book Your Stay
                    </a>
                    {accommodation.mapLink && (
                        <a
                            href={accommodation.mapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-slate-100 dark:bg-surface-a20 hover:bg-slate-200 dark:hover:bg-surface-a30 text-slate-700 dark:text-slate-300 font-bold rounded-2xl flex items-center justify-center active:scale-[0.98] transition-all border border-slate-200 dark:border-surface-a30"
                            title="View on Maps"
                        >
                            <MapPin className="w-6 h-6" />
                        </a>
                    )}
                </div>

                <button
                    onClick={onRemove}
                    className="w-full mt-2 font-bold text-red-500 dark:text-red-400/70 hover:text-red-600 transition-colors py-2 text-sm"
                >
                    Remove From Itinerary
                </button>
            </div>
        </div>
    );
};
