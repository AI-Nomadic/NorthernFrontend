import React from 'react';
import { Sparkles, PanelLeftClose, Compass, Utensils, Bed, Music, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@utils';
import { SidebarDraggableItem } from './SidebarDraggableItem';
import { SuggestionCard } from './SuggestionCard';
import { DiscoveryShimmer } from './DiscoveryShimmer';
import { SidebarFooter } from './SidebarFooter';
import { FilterBar } from './FilterBar';

interface DiscoverySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    activeTab: 'culinary' | 'exploration' | 'stay' | 'events';
    setActiveTab: (tab: 'culinary' | 'exploration' | 'stay' | 'events') => void;
    discoveryItems: any[];
    isLoading: boolean;
    // New Filter Props
    availableFilters?: string[];
    activeFilters?: string[];
    isSearchMode?: boolean;
    onToggleFilter?: (filter: string) => void;
    onRefresh?: () => void;
}

export const DiscoverySidebar: React.FC<DiscoverySidebarProps> = ({
    isOpen,
    onClose,
    activeTab,
    setActiveTab,
    discoveryItems,
    isLoading,
    availableFilters = [],
    activeFilters = [],
    isSearchMode = true,
    onToggleFilter = () => { },
    onRefresh = () => { }
}) => {
    const tabs = [
        { id: 'exploration', label: 'Activities', icon: Compass },
        { id: 'culinary', label: 'Food', icon: Utensils },
        { id: 'stay', label: 'Stays', icon: Bed },
        { id: 'events', label: 'Events', icon: Music }
    ] as const;

    return (
        <div className={cn(
            "h-full bg-white dark:bg-surface-a0 border-r border-slate-200 dark:border-surface-a10 flex flex-col relative shadow-2xl w-[340px]",
            "transition-all duration-500 ease-in-out",
            isOpen ? "opacity-100" : "opacity-0"
        )}>
            <div className="px-6 py-6 border-b border-slate-100 dark:border-surface-a10 bg-slate-50/50 dark:bg-surface-a0">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-slate-900 dark:text-white hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center text-white">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="font-bold tracking-tight">Discovery</span>
                    </Link>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-surface-a10 rounded-full text-slate-400 dark:text-slate-500">
                        <PanelLeftClose className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* -- Tabs Navigation -- */}
            <div className="flex p-2 bg-slate-50 dark:bg-transparent gap-1 border-b border-slate-100 dark:border-surface-a10">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex-1 flex flex-col items-center gap-1 py-3 rounded-lg transition-all text-[10px] font-bold uppercase tracking-wide",
                            activeTab === tab.id ? "bg-white dark:bg-surface-a10 shadow-sm text-primary-a10 dark:text-primary-a30 border border-transparent dark:border-surface-a20" : "text-slate-400 dark:text-slate-500 hover:bg-white/50 dark:hover:bg-surface-a10/50 hover:text-slate-600 dark:hover:text-slate-300"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />{tab.label}
                    </button>
                ))}
            </div>

            {/* -- Smart Filters -- */}
            <FilterBar
                filters={availableFilters}
                activeFilters={activeFilters}
                isSearchMode={isSearchMode}
                onToggleFilter={onToggleFilter}
                onRefresh={onRefresh}
            />

            {/* -- Draggable Items List -- */}
            {/* Renders a list of items that can be dragged onto the canvas */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-transparent custom-scrollbar">
                {isLoading ? (
                    <DiscoveryShimmer />
                ) : discoveryItems.length > 0 ? (
                    discoveryItems.map((item, idx) => (
                        item.isSkeleton ? (
                            <SuggestionCard key={item.id || idx} suggestion={item} type={activeTab === 'stay' ? 'accommodation' : 'activity'} />
                        ) : (
                            <SidebarDraggableItem key={idx} item={item} type={activeTab === 'stay' ? 'accommodation' : 'activity'} />
                        )
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 gap-4 opacity-60">
                        <Compass className="w-12 h-12 stroke-[1.5px]" />
                        <span className="text-sm font-medium">No results found for these vibes.</span>
                        <button 
                            onClick={onRefresh}
                            className="text-xs font-bold text-indigo-500 hover:text-indigo-400 transition-colors uppercase tracking-widest"
                        >
                            Try Shuffling
                        </button>
                    </div>
                )}
            </div>

            {/* -- Footer -- */}
            <SidebarFooter />
        </div>
    );
};
