import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, GitMerge, Globe, Loader2, MapPin } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../state';
import { fetchPublicTrips, cloneTrip, resetForkStatus } from '../state/slices/publicTripsSlice';

import { fetchItinerary } from '../state/slices/dashboardSlice';

export const ExplorePage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { trips, loading, error, forkStatus, forkedTripId } = useAppSelector(state => state.publicTrips);

    useEffect(() => {
        dispatch(fetchPublicTrips());
    }, [dispatch]);

    useEffect(() => {
        if (forkStatus === 'success' && forkedTripId) {
            // Reset status and redirect to newly forked trip
            dispatch(resetForkStatus());
            dispatch(fetchItinerary(forkedTripId)).then(() => {
                navigate('/dashboard');
            });
        }
    }, [forkStatus, forkedTripId, navigate, dispatch]);

    const handleFork = (tripId: string) => {
        dispatch(cloneTrip(tripId));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#050505] pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-surface-a20 pb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                            <Globe className="h-8 w-8 text-purple-600" />
                            Explore Public Trips
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                            Discover itineraries created by the community and fork them to plan your own.
                        </p>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                        <Loader2 className="h-10 w-10 animate-spin mb-4 text-purple-500" />
                        <p>Loading public trips...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800">
                        Failed to load trips: {error}
                    </div>
                ) : trips.length === 0 ? (
                    <div className="text-center py-24 bg-white dark:bg-surface-a10 rounded-2xl border border-slate-100 dark:border-surface-a20 shadow-sm">
                        <Globe className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No public trips yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Be the first to publish an amazing itinerary!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trips.map(trip => (
                            <div key={trip.id} className="group bg-white dark:bg-surface-a10 rounded-2xl border border-slate-200 dark:border-surface-a20 overflow-hidden hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 flex flex-col">

                                {/* Card Body */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white line-clamp-2">
                                            {trip.trip_title}
                                        </h3>
                                        <span className="shrink-0 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                                            {trip.total_days} Days
                                        </span>
                                    </div>

                                    <div className="space-y-3 mt-auto">
                                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                            <MapPin className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{trip.location || 'Multiple Locations'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                            <Activity className="h-4 w-4 shrink-0" />
                                            <span>
                                                {trip.itinerary?.reduce((acc, day) => acc + (day.activities?.length || 0), 0) || 0} activities
                                            </span>
                                        </div>
                                        {trip.ownerEmail && (
                                            <div className="text-xs text-slate-400 mt-2">
                                                By: <span className="font-medium text-slate-600 dark:text-slate-300">{trip.ownerEmail}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Fork Button */}
                                <div className="p-4 border-t border-slate-100 dark:border-surface-a20 bg-slate-50 dark:bg-surface-a0">
                                    <button
                                        onClick={() => handleFork(trip.id)}
                                        disabled={forkStatus === 'loading'}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl font-bold transition-colors shadow-sm shadow-purple-500/20"
                                    >
                                        {forkStatus === 'loading' ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <GitMerge className="h-4 w-4" />
                                        )}
                                        Fork & Edit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExplorePage;
