import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ArrowRight } from 'lucide-react';
import { cn } from '@utils';
import { ActivitySkeleton } from '@types';
import { DRAG_TYPES } from '../utils';

interface SuggestionCardProps {
    suggestion: ActivitySkeleton;
    type?: 'activity' | 'accommodation';
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, type = 'activity' }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `suggestion-${suggestion.id}`,
        data: {
            type: type === 'accommodation' ? DRAG_TYPES.SIDEBAR_ACCOMMODATION : DRAG_TYPES.SIDEBAR_ACTIVITY,
            item: suggestion,
            isSkeleton: true
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

                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {suggestion.title}
                </h4>



                <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-slate-50 dark:bg-surface-a15 text-[10px] font-bold text-slate-500 dark:text-slate-300 rounded-full border border-slate-100 dark:border-surface-a20 uppercase tracking-wider">
                        {suggestion.category}
                    </span>
                    
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all">
                        DRAG TO ADD <ArrowRight className="w-3 h-3" />
                    </div>
                </div>
            </div>
        </div>
    );
};
