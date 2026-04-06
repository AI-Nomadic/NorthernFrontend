import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ArrowRight, Star } from 'lucide-react';
import { cn } from '@utils';
import { DRAG_TYPES } from '../utils';

interface SuggestionCardProps {
    suggestion: any; // Allow hydrated accommodation data
    type?: 'activity' | 'accommodation';
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, type = 'activity' }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `suggestion-${suggestion.id}`,
        data: {
            type: type === 'accommodation' ? DRAG_TYPES.SIDEBAR_ACCOMMODATION : DRAG_TYPES.SIDEBAR_ACTIVITY,
            item: suggestion,
            isSkeleton: suggestion.isSkeleton !== undefined ? suggestion.isSkeleton : true
        }
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={cn(
                "group relative bg-white dark:bg-surface-a5 p-4 rounded-3xl border border-slate-100 dark:border-surface-a20 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-500/30 dark:hover:border-indigo-400/30 transition-all duration-300 cursor-grab active:cursor-grabbing overflow-hidden",
                isDragging && "opacity-40 scale-95 ring-2 ring-indigo-500/50"
            )}
            style={{ touchAction: 'none' }}
        >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />

            <div className="relative z-10">

                <div className="flex gap-3">
                    {suggestion.imageUrl && (
                        <div className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 dark:border-surface-a20 shadow-sm group-hover:scale-105 transition-transform">
                            <img src={suggestion.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {suggestion.hotelName || suggestion.title}
                    </h4>
                </div>

                {suggestion.isEvent && suggestion.start_date && (
                    <div className="flex items-center gap-1.5 mb-3 px-2 py-1 bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100/50 dark:border-indigo-500/20 rounded-lg w-fit">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">
                            {new Date(suggestion.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                )}



                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-slate-50 dark:bg-surface-a15 text-[10px] font-bold text-slate-500 dark:text-slate-300 rounded-full border border-slate-100 dark:border-surface-a20 uppercase tracking-wider">
                            {suggestion.category}
                        </span>
                        {(type === 'accommodation' && suggestion.pricePerNight) && (
                            <span className="px-2 py-1 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-800/30">
                                ${suggestion.pricePerNight}
                                <span className="flex items-center gap-0.5 ml-1 text-amber-500">
                                    <Star className="w-3 h-3 fill-current" /> {suggestion.rating}
                                </span>
                            </span>
                        )}
                        {suggestion.price_note && (
                             <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-[10px] font-bold text-indigo-500 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-800/30 uppercase tracking-wider">
                                {suggestion.price_note}
                             </span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all">
                        DRAG TO ADD <ArrowRight className="w-3 h-3" />
                    </div>
                </div>
            </div>
        </div>
    );
};
