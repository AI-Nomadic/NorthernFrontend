import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, DollarSign, GripHorizontal } from 'lucide-react';
import { Activity } from '@types';
import { DRAG_TYPES } from '../utils';
import { useAppDispatch } from '@state';
import { autosaveItinerary } from '@state/slices/dashboardSlice';

interface SortableActivityItemProps {
    activity: Activity;
    dayId: string;
    onClick: () => void;
    onUpdate?: (dayId: string, activityId: string, updates: Partial<Activity>) => void;
    onRemove?: (dayId: string, activityId: string) => void;
}

export const SortableActivityItem: React.FC<SortableActivityItemProps> = ({ activity, dayId, onClick, onUpdate, onRemove }) => {
    // -- Sortable Logic --
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: activity.id, data: { type: DRAG_TYPES.ACTIVITY, activity } });

    const dispatch = useAppDispatch();
    const [draftTitle, setDraftTitle] = React.useState(activity.title);

    const handleSaveDraft = () => {
        if (!draftTitle.trim()) {
            if (activity.title === '' && onRemove) {
                onRemove(dayId, activity.id);
            }
            return;
        }

        if (onUpdate) {
            onUpdate(dayId, activity.id, {
                title: draftTitle,
                isDraft: false
            });
        }
    };

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
    };

    // -- Hydrating Mode View --
    if (activity.isHydrating) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-white dark:bg-surface-a0 p-4 rounded-xl border border-slate-100 dark:border-surface-a20 shadow-sm mb-2 relative overflow-hidden animate-pulse"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                <div className="flex gap-3 relative z-10">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-surface-a20 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-100 dark:bg-surface-a20 rounded w-3/4" />
                        <div className="h-3 bg-slate-50 dark:bg-surface-a10 rounded w-1/2" />
                    </div>
                </div>
                <div className="mt-3 flex gap-2">
                   <div className="px-5 py-1 bg-indigo-50/50 dark:bg-indigo-900/20 text-[8px] font-black uppercase text-indigo-500 rounded-full">Hydrating AI Details...</div>
                </div>
            </div>
        );
    }

    // -- Draft Mode View --
    if (activity.isDraft) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-white dark:bg-surface-a10 p-3 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-500 shadow-sm mb-2"
            >
                <div className="flex items-center gap-2">
                    <input
                        autoFocus
                        type="text"
                        value={draftTitle}
                        onChange={(e) => setDraftTitle(e.target.value)}
                        placeholder="Enter activity name..."
                        className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-slate-800 dark:text-white placeholder:text-slate-400"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSaveDraft();
                            }
                        }}
                        onBlur={handleSaveDraft}
                    />
                </div>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="group relative bg-white dark:bg-surface-a10 p-3 rounded-xl border border-slate-100 dark:border-surface-a20 shadow-sm mb-2 hover:border-primary-a30 dark:hover:border-primary-a30 transition-all cursor-pointer border-l-2 border-l-transparent hover:border-l-primary/40"
        >
            <div
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1"
                {...attributes} {...listeners}
                onClick={(e) => e.stopPropagation()}
            >
                <GripHorizontal className="w-4 h-4 text-slate-300 hover:text-primary-a10 dark:text-slate-500 dark:hover:text-primary-a30" />
            </div>
            <div className="flex gap-3">
                <div className="flex flex-col items-center pt-1 min-w-[3rem]">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{activity.time}</span>
                    <div className="h-full w-0.5 my-1 relative" style={{ background: 'linear-gradient(to bottom, rgba(218,9,222,0.3), transparent)' }}>
                        {activity.travelTimeFromPrev ? (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-surface-a30 border border-slate-300 dark:border-slate-500 text-[9px] px-1 rounded-full whitespace-nowrap text-slate-500 dark:text-slate-200 font-medium z-10">
                                +{activity.travelTimeFromPrev}m
                            </div>
                        ) : null}
                    </div>
                </div>
                <div className="flex-1 pr-6">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-white leading-tight">{activity.title}</h4>
                        {activity.isEvent && (
                            <span className="px-1.5 py-0.5 bg-primary/10 dark:bg-primary/10 text-[8px] font-black uppercase text-primary dark:text-primary-a30 rounded-md border border-primary/20 dark:border-primary/15">
                                Event
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-200 line-clamp-2 mb-2">{activity.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-300 uppercase font-bold tracking-wider">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 
                            {activity.isEvent ? 'Fixed Time' : `${activity.durationMinutes}m`}
                        </span>
                        <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md ${activity.price_note ? 'text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'}`}>
                            <DollarSign className="w-3 h-3" /> 
                            {activity.price_note || `${activity.cost_estimate} CAD`}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
