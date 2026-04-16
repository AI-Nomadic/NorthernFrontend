import React from 'react';
import { Sparkles, PanelLeftClose, SortAsc, BarChart2, Globe } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '@utils';
import { SidebarFooter } from './SidebarFooter';

interface GallerySidebarProps {
    isOpen: boolean;
    onClose: () => void;

    // Sort State
    sortBy: 'recent' | 'alphabetical' | 'destination';
    onSortChange: (sort: 'recent' | 'alphabetical' | 'destination') => void;

    // Stats
    totalTrips: number;
}

export const GallerySidebar: React.FC<GallerySidebarProps> = ({
    isOpen,
    onClose,
    sortBy,
    onSortChange,
    totalTrips
}) => {
    const navigate = useNavigate();

    return (
        <div className={cn(
            "h-full bg-white dark:bg-surface-a0 border-r border-slate-200 dark:border-surface-a10 flex flex-col relative shadow-2xl w-[340px]",
            "transition-all duration-500 ease-in-out",
            isOpen ? "opacity-100" : "opacity-0"
        )}>
            {/* Header */}
            <div className="px-6 py-6 border-b border-slate-100 dark:border-surface-a10 bg-slate-50/50 dark:bg-surface-a0">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-slate-900 dark:text-white hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center text-white">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="font-bold tracking-tight">My Trips</span>
                    </Link>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-surface-a10 rounded-full text-slate-400 dark:text-slate-500">
                        <PanelLeftClose className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Stats Widget */}
            <div className="p-4 m-4 bg-slate-50 dark:bg-surface-a10 rounded-xl border border-slate-100 dark:border-surface-a20 border-l-2 border-l-primary/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                        <BarChart2 className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Saved</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{totalTrips} Trips</p>
                    </div>
                </div>
            </div>

            {/* Explore Button */}
            <div className="px-4 mt-2">
                <button
                    onClick={() => navigate('/explore')}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-primary to-purple-600 hover:from-primary hover:to-indigo-600 text-white rounded-xl font-bold shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30"
                >
                    <Globe className="w-5 h-5" />
                    Explore Public Trips
                </button>
            </div>

            {/* Controls */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8">

                {/* Sort */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <SortAsc className="w-3 h-3" /> Sort By
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                        {[
                            { id: 'recent', label: 'Most Recent' },
                            { id: 'alphabetical', label: 'Alphabetical' },
                            { id: 'destination', label: 'Destination' }
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => onSortChange(opt.id as any)}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium rounded-lg text-left transition-all border-l-2",
                                    sortBy === opt.id
                                        ? "bg-primary/8 text-primary dark:text-primary-a30 border-l-primary"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-surface-a10 border-l-transparent"
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

            </div>

            {/* Footer */}
            <SidebarFooter />
        </div>
    );
};
