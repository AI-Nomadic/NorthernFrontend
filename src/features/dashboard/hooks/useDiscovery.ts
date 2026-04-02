import React, { useEffect } from 'react';
import { TripState } from '@types';
import { useAppDispatch, useAppSelector, selectDiscoveryTab, selectDiscoveryItems, selectDiscoveryLoading, selectDiscoveryFilters } from '@state';
import { setActiveTab, fetchDiscoveryItems, fetchAISuggestions, toggleFilter, clearFilters, FILTERS_BY_TAB } from '@state/slices/discoverySlice';
import type { DiscoveryTab } from '@state/slices/discoverySlice';

export const useDiscovery = (tripState: TripState) => {
    const dispatch = useAppDispatch();
    const activeTab = useAppSelector(selectDiscoveryTab);
    const discoveryItems = useAppSelector(selectDiscoveryItems);
    const discoveryLoading = useAppSelector(selectDiscoveryLoading);
    const activeFilters = useAppSelector(selectDiscoveryFilters);
    const itinerary = useAppSelector(state => state.dashboard.itinerary);
    const activitySkeletons = useAppSelector(state => state.discovery.activitySkeletons);
    const culinarySkeletons = useAppSelector(state => state.discovery.culinarySkeletons);
    const lodgingSkeletons = useAppSelector(state => state.discovery.lodgingSkeletons);

    // -- State Sync Logic --
    // "currentlyActiveParams" serves as the source of truth for what is currently displayed on the canvas.
    // If activeFilters (UI state) != currentlyActiveParams (Canvas state), we are in "Search" mode.
    // Otherwise, we are in "Shuffle" mode (refreshing the same parameters).
    const [currentlyActiveParams, setCurrentlyActiveParams] = React.useState<string[]>([]);

    // Derived State: Comparison for Sync Logic
    const isSearchMode = React.useMemo(() => {
        // 1. Length Check: Quick fail if counts differ
        if (activeFilters.length !== currentlyActiveParams.length) return true;

        // 2. Content Check: Ensure every active filter exists in currentlyActiveParams.
        // Since lengths are equal, if A is subset of B, then A == B.
        return !activeFilters.every(f => currentlyActiveParams.includes(f));
    }, [activeFilters, currentlyActiveParams]);

    // -- Discovery Logic --
    // For the AI tabs: always fetch AI suggestions (they are session-specific to this trip).
    // For all other tabs: fetch once from the mock discovery pool if it's empty.
    useEffect(() => {
        if ((activeTab === 'exploration' || activeTab === 'culinary' || activeTab === 'stay') && !discoveryLoading) {
            let currentTabSkeletons = activitySkeletons;
            if (activeTab === 'culinary') currentTabSkeletons = culinarySkeletons;
            if (activeTab === 'stay') currentTabSkeletons = lodgingSkeletons;

            // Prevent initial refetching if we already have items loaded for THIS tab
            if (currentTabSkeletons.length > 0) return;

            const excludeNames = [
                ...currentTabSkeletons.map(s => s.title),
                ...(itinerary?.itinerary.flatMap(day => day.activities.map(a => a.title)) || []),
                ...(itinerary?.itinerary.map(day => day.accommodation?.hotelName).filter(Boolean) as string[] || [])
            ];
            dispatch(fetchAISuggestions({ destination: tripState.destination, tags: activeFilters, type: activeTab, excludeNames }));
        }
    }, [activeTab, tripState.destination]); // Intentionally omit activeFilters — user must click Refresh to re-fetch with filters

    useEffect(() => {
        if (activeTab !== 'exploration' && activeTab !== 'culinary' && activeTab !== 'stay' && discoveryItems.length === 0 && !discoveryLoading) {
            dispatch(fetchDiscoveryItems());
        }
    }, [activeTab]);


    const handleTabChange = (tab: DiscoveryTab) => {
        dispatch(setActiveTab(tab));
        // No fetch needed - selector handles filtering
    };

    const handleToggleFilter = (filter: string) => {
        dispatch(toggleFilter(filter));
    };

    const handleRefresh = () => {
        if (activeTab === 'exploration' || activeTab === 'culinary' || activeTab === 'stay') {
            let currentTabSkeletons = activitySkeletons;
            if (activeTab === 'culinary') currentTabSkeletons = culinarySkeletons;
            if (activeTab === 'stay') currentTabSkeletons = lodgingSkeletons;

            const excludeNames = [
                ...currentTabSkeletons.map(s => s.title),
                ...(itinerary?.itinerary.flatMap(day => day.activities.map(a => a.title)) || []),
                ...(itinerary?.itinerary.map(day => day.accommodation?.hotelName).filter(Boolean) as string[] || [])
            ];
            dispatch(fetchAISuggestions({ destination: tripState.destination, tags: activeFilters, type: activeTab, excludeNames }));
            setCurrentlyActiveParams([...activeFilters]); // After successful action, criteria are synced
        } else {
            dispatch(fetchDiscoveryItems());
        }
    };

    // available filters for current tab
    const availableFilters = FILTERS_BY_TAB[activeTab] || [];

    return {
        activeTab,
        discoveryItems,
        discoveryLoading,
        activeFilters,
        availableFilters,
        isSearchMode, // Expose intent
        handleTabChange,
        handleToggleFilter,
        handleRefresh,
    };
};
