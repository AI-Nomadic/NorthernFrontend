import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { getSuggestions, fetchSidebarSuggestions, fetchEventsSuggestions } from '@services/api';
import { ActivitySkeleton } from '@types';
import { RootState } from '../store';

export type DiscoveryTab = 'culinary' | 'exploration' | 'stay' | 'events';

// -- Mock data mapping --
const TAB_CATEGORY_MAP: Record<string, string[]> = {
    culinary: ['Food', 'Drink'],
    exploration: ['Adventure', 'Sightseeing', 'Relaxation'],
    stay: ['Accommodation', 'Hotel'],
    events: ['Event', 'Festival', 'Concert', 'Performance', 'Conference', 'Expo', 'Sports']
};

export const FILTERS_BY_TAB: Record<string, string[]> = {
    culinary: ['Local Favorites', 'Fine Dining', 'Budget', 'Romantic', 'Spicy', 'Casual'],
    exploration: ['Nature', 'History', 'Free', 'Shopping', 'Architecture', 'Walkable'],
    stay: ['Luxury', 'Boutique', 'Central', 'Trendy', 'Spa'],
    events: ['Music', 'Sports', 'Arts & Theatre', 'Film', 'Miscellaneous']
};

interface DiscoveryState {
    activeTab: DiscoveryTab;
    allItems: any[]; // Store ALL fetched suggestions here
    activitySkeletons: ActivitySkeleton[]; 
    culinarySkeletons: ActivitySkeleton[]; 
    lodgingSkeletons: ActivitySkeleton[]; 
    eventSkeletons: ActivitySkeleton[];
    activeFilters: string[];
    loading: boolean;
    error: string | null;
}

const initialState: DiscoveryState = {
    activeTab: 'exploration',
    allItems: [],
    activitySkeletons: [],
    culinarySkeletons: [],
    lodgingSkeletons: [],
    eventSkeletons: [],
    activeFilters: [],
    loading: false,
    error: null,
};

// Fetches ALL suggestions from the backend (or mock)
// Should be called on initial load or "Search/Shuffle"
export const fetchDiscoveryItems = createAsyncThunk(
    'discovery/fetchItems',
    async () => {
        // Fetch all suggestions from the mock DB via the centralized service
        return await getSuggestions({}) as any[];
    }
);

export const fetchAISuggestions = createAsyncThunk(
    'discovery/fetchAISuggestions',
    async ({ destination, tags, type = 'exploration', excludeNames = [] }: { destination: string, tags: string[], type?: 'exploration'|'culinary'|'stay', excludeNames?: string[] }) => {
        const suggestions = await fetchSidebarSuggestions(destination, tags, type, 6, excludeNames);
        return { type, suggestions };
    }
);

export const fetchReplacementSuggestion = createAsyncThunk(
    'discovery/fetchReplacementSuggestion',
    async ({ destination, tags, type = 'exploration', excludeNames = [] }: { destination: string, tags: string[], type?: 'exploration'|'culinary'|'stay', excludeNames?: string[] }) => {
        const suggestions = await fetchSidebarSuggestions(destination, tags, type, 1, excludeNames);
        return { type, suggestions };
    }
);

export const fetchEvents = createAsyncThunk(
    'discovery/fetchEvents',
    async ({ destination, tags, startDate, endDate }: { destination: string, tags: string[], startDate?: string, endDate?: string }) => {
        const suggestions = await fetchEventsSuggestions(destination, tags, startDate, endDate);
        return suggestions;
    }
);

const discoverySlice = createSlice({
    name: 'discovery',
    initialState,
    reducers: {
        setActiveTab: (state, action: PayloadAction<DiscoveryTab>) => {
            state.activeTab = action.payload;
            state.activeFilters = []; // Reset filters on tab change
        },
        toggleFilter: (state, action: PayloadAction<string>) => {
            const filter = action.payload;
            if (state.activeFilters.includes(filter)) {
                state.activeFilters = state.activeFilters.filter(f => f !== filter);
            } else {
                state.activeFilters.push(filter);
            }
        },
        clearFilters: (state) => {
            state.activeFilters = [];
        },
        removeSuggestion: (state, action: PayloadAction<{ id: string, type: 'exploration' | 'culinary' | 'stay' }>) => {
            if (action.payload.type === 'exploration') {
                state.activitySkeletons = state.activitySkeletons.filter(s => s.id !== action.payload.id);
            } else if (action.payload.type === 'culinary') {
                state.culinarySkeletons = state.culinarySkeletons.filter(s => s.id !== action.payload.id);
            } else {
                state.lodgingSkeletons = state.lodgingSkeletons.filter(s => s.id !== action.payload.id);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDiscoveryItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDiscoveryItems.fulfilled, (state, action) => {
                state.loading = false;
                state.allItems = action.payload;
            })
            .addCase(fetchDiscoveryItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch discovery items';
            })
            // AI Suggestions
            .addCase(fetchAISuggestions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAISuggestions.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.type === 'exploration') {
                    state.activitySkeletons = action.payload.suggestions;
                } else if (action.payload.type === 'culinary') {
                    state.culinarySkeletons = action.payload.suggestions;
                } else if (action.payload.type === 'stay') {
                    state.lodgingSkeletons = action.payload.suggestions;
                }
            })
            .addCase(fetchAISuggestions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch AI suggestions';
            })
            // Replacement AI Suggestion
            .addCase(fetchReplacementSuggestion.fulfilled, (state, action) => {
                // Append the newly fetched suggestion(s) to the appropriate list
                if (action.payload.type === 'exploration') {
                    state.activitySkeletons = [...state.activitySkeletons, ...action.payload.suggestions];
                } else if (action.payload.type === 'culinary') {
                    state.culinarySkeletons = [...state.culinarySkeletons, ...action.payload.suggestions];
                } else if (action.payload.type === 'stay') {
                    state.lodgingSkeletons = [...state.lodgingSkeletons, ...action.payload.suggestions];
                }
            })
            // PredictHQ Events
            .addCase(fetchEvents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEvents.fulfilled, (state, action) => {
                state.loading = false;
                state.eventSkeletons = action.payload;
            })
            .addCase(fetchEvents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch events';
            });
    },
});

export const { setActiveTab, toggleFilter, clearFilters, removeSuggestion } = discoverySlice.actions;

// -- Selectors --

export const selectDiscoveryTab = (state: RootState) => state.discovery.activeTab;
export const selectDiscoveryFilters = (state: RootState) => state.discovery.activeFilters;
export const selectDiscoveryLoading = (state: RootState) => state.discovery.loading;

// Client-side filtering selector
export const selectDiscoveryItems = createSelector(
    [
        (state: RootState) => state.discovery.allItems, 
        (state: RootState) => state.discovery.activitySkeletons,
        (state: RootState) => state.discovery.culinarySkeletons,
        (state: RootState) => state.discovery.lodgingSkeletons,
        (state: RootState) => state.discovery.eventSkeletons,
        (state: RootState) => state.discovery.activeTab, 
        (state: RootState) => state.discovery.activeFilters
    ],
    (allItems, activeSkeletons, culinarySkeletons, lodgingSkeletons, eventSkeletons, tab, filters) => {
        // If we have AI skeletons and we are on an AI tab, prioritize them
        if (tab === 'exploration' && activeSkeletons.length > 0) {
            return activeSkeletons;
        }
        if (tab === 'culinary' && culinarySkeletons.length > 0) {
            return culinarySkeletons;
        }
        if (tab === 'stay' && lodgingSkeletons.length > 0) {
            return lodgingSkeletons;
        }
        if (tab === 'events' && eventSkeletons.length > 0) {
            return eventSkeletons;
        }

        const allowedCategories = TAB_CATEGORY_MAP[tab] || [];

        return allItems.filter(item => {
            // 1. Category Filter
            let matchesCategory = false;
            if (tab === 'stay' && item.hotelName) matchesCategory = true;
            else if (tab !== 'stay' && item.hotelName) matchesCategory = false;
            else matchesCategory = allowedCategories.includes(item.category);

            if (!matchesCategory) return false;

            // 2. Tag Filter
            if (filters.length === 0) return true;
            if (!item.tags) return false;
            return filters.some(filter => item.tags.includes(filter));
        });
    }
);

export default discoverySlice.reducer;
