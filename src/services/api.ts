import { Trip, TripGenerationRequest, Suggestion, TravelFormData, ItineraryResponse, ActivitySkeleton, Activity, Accommodation } from '../types';


const MOCK_API_BASE = 'http://localhost:3001';
const REAL_API_BASE = 'http://localhost:8090/api'; // Trip Service gateway entry
const PLANNER_API_BASE = import.meta.env.VITE_PLANNER_API_URL || 'http://localhost:8888/api/planner';


/**
 * Cache of known saved trips to prevent 404 errors during Upsert operations
 */
const knownSavedTrips = new Set<string>();

/**
 * Returns the Authorization header with the stored JWT.
 * Falls back gracefully if no token exists (public routes).
 */
const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('northern_auth_token');
    return token
        ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' };
};

/**
 * Fetch the current trip (or a specific trip by ID).
 */
export const getTrip = async (tripId: string = 'trp_current'): Promise<Trip | null> => {
    try {
        const isMock = tripId === 'trp_current' || tripId === 'current';
        const url = isMock
            ? `${MOCK_API_BASE}/trips`
            : `${REAL_API_BASE}/trips/${tripId}`;

        const response = await fetch(url, { headers: isMock ? {} : getAuthHeaders() });
        if (!response.ok) throw new Error(`Failed to fetch trip: ${response.statusText}`);

        const result = await response.json();

        if (isMock) {
            const trips: Trip[] = result;
            const trip = trips.find(t => t.id === tripId || t.id === 'trp_' + tripId) || trips[0];
            return trip || null;
        }

        if (result && result.id && !isMock) {
            knownSavedTrips.add(result.id);
        }

        return result;
    } catch (error) {
        console.error('Error fetching trip:', error);
        return null;
    }
};

/**
 * Fetch all saved trips for the authenticated user.
 */
export const getAllTrips = async (): Promise<Trip[]> => {
    try {
        const response = await fetch(`${REAL_API_BASE}/trips`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to fetch trips');
        const trips = await response.json();
        trips.forEach((t: Trip) => knownSavedTrips.add(t.id));
        return trips;
    } catch (error) {
        console.error('Error fetching all trips:', error);
        return [];
    }
};

/**
 * Sanitize trip payload before sending to the backend.
 * Strips frontend-only fields and fixes type mismatches.
 */
const sanitizeTripPayload = (trip: Trip): any => {
    const sanitized = {
        id: trip.id,
        trip_title: trip.trip_title,
        featuredImage: trip.featuredImage || null,
        total_days: trip.total_days,
        currency: trip.currency,
        visibility: trip.visibility || 'PRIVATE',
        sourceId: trip.sourceId || null,
        location: trip.location || {},
        taxonomy: trip.taxonomy || {},
        metrics: {
            ...(trip.metrics || {}),
            targetBudget: typeof trip.metrics?.targetBudget === 'number' ? trip.metrics.targetBudget : 
                         (typeof trip.metrics?.targetBudget === 'string' && !isNaN(Number(trip.metrics.targetBudget)) ? Number(trip.metrics.targetBudget) : null),
        },
        summaryStats: {
            ...(trip.summaryStats || {}),
            totalCost: (trip.itinerary || []).reduce((sum, day) => {
                const activitiesTotal = (day.activities || []).reduce((daySum, act) => daySum + (Number(act.cost_estimate) || 0), 0);
                const accommodationTotal = day.accommodation?.pricePerNight ? Number(day.accommodation.pricePerNight) : 0;
                return sum + activitiesTotal + accommodationTotal;
            }, 0)
        },
        tags: trip.tags || [],
        itinerary: (trip.itinerary || []).map((day: any) => ({
            id: day.id,
            dayNumber: day.dayNumber,
            date: day.date || null,
            theme: day.theme || null,
            stats: day.stats || null,
            accommodation: day.accommodation ? {
                id: day.accommodation.id,
                type: day.accommodation.type || null,
                hotelName: day.accommodation.hotelName || null,
                address: day.accommodation.address || null,
                pricePerNight: day.accommodation.pricePerNight != null ? Number(day.accommodation.pricePerNight) : null,
                rating: day.accommodation.rating != null ? Number(day.accommodation.rating) : null,
                checkInTime: day.accommodation.checkInTime || null,
                checkOutTime: day.accommodation.checkOutTime || null,
                bookingStatus: day.accommodation.bookingStatus || null,
                contactNumber: day.accommodation.contactNumber || null,
                bookingUrl: day.accommodation.bookingUrl || null,
                mapLink: day.accommodation.mapLink || null,
                coordinates: day.accommodation.coordinates || null,
                placeId: day.accommodation.placeId || null,
                user_ratings_total: day.accommodation.user_ratings_total || null,
                website: day.accommodation.website || null,
                openingHours: day.accommodation.openingHours || [],
                description: day.accommodation.description || null,
                imageGallery: day.accommodation.imageGallery || [],
                amenities: day.accommodation.amenities || [],
            } : null,
            activities: (day.activities || []).map((act: any) => ({
                id: act.id,
                type: act.type || null,
                title: act.title,
                location: act.location || null,
                description: act.description || null,
                cost_estimate: act.cost_estimate != null ? Number(act.cost_estimate) : null,
                category: act.category || null,
                durationMinutes: act.durationMinutes || null,
                time: act.time || null,
                timeSlot: act.timeSlot || null,
                coordinates: act.coordinates || null,
                travelDistance: act.travelDistance || null,
                travelTimeFromPrev: act.travelTimeFromPrev || null,
                status: act.status || 'planned',
                imageGallery: act.imageGallery || [],
                rating: act.rating != null ? Number(act.rating) || null : null,
                user_ratings_total: act.user_ratings_total || null,
                contactNumber: act.contactNumber || null,
                website: act.website || null,
                openingHours: act.openingHours || [],
                placeId: act.placeId || null,
                metadata: act.metadata || { isLocked: false, source: 'ai_generated' },
                imageUrl: act.imageUrl || null,
                isEvent: act.isEvent || null,
                bookingUrl: act.bookingUrl || null,
                price_note: act.price_note || null,
                eventDate: act.eventDate || null,
            })),
        })),
    };
    return sanitized;
};

/**
 * Create a new trip on the backend.
 */
export const createTrip = async (trip: Trip): Promise<Trip | null> => {
    try {
        const payload = sanitizeTripPayload(trip);
        console.log('📤 POST /trips FULL payload:', JSON.parse(JSON.stringify(payload)));
        const response = await fetch(`${REAL_API_BASE}/trips`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`❌ POST /trips failed [${response.status}]:`, errorBody);
            throw new Error(`Failed to create trip: ${response.statusText}`);
        }
        const created = await response.json();
        if (created && created.id) {
            knownSavedTrips.add(created.id);
        }
        return created;
    } catch (error) {
        console.error('Error creating trip:', error);
        return null;
    }
};

/**
 * Initial save — always POST, called once right after hydration completes.
 * This guarantees the trip exists in the DB before any PUT updates.
 */
export const initialSaveTrip = async (trip: Trip): Promise<Trip | null> => {
    // If we've already saved this trip in this session, skip the POST and do a PUT if needed.
    if (knownSavedTrips.has(trip.id)) {
        console.log(`ℹ️ Trip ${trip.id} already exists in local cache. Using persistTrip (PUT) instead.`);
        return persistTrip(trip);
    }
    
    console.log(`🚀 Attempting initial POST for new trip: ${trip.id}`);
    const result = await createTrip(trip);
    
    if (result) {
        console.log('✨ Initial POST successful!');
        knownSavedTrips.add(trip.id);
        return result;
    } 
    
    // Fallback: If POST failed, it might be a collision or desync. Try PUT.
    console.warn(`⚠️ Initial POST failed for ${trip.id}. Falling back to PUT...`);
    return updateTrip(trip);
};

export const persistTrip = async (trip: Trip): Promise<Trip | null> => {
    const payload = sanitizeTripPayload(trip);
    
    // Decide whether to POST or PUT
    if (knownSavedTrips.has(trip.id)) {
        console.log(`🔄 Persisting changes via PUT for trip: ${trip.id}`);
        return updateTrip(trip);
    }

    console.log(`🆕 Persisting brand new trip via POST: ${trip.id}`);
    const created = await createTrip(trip);
    
    if (created) {
        return created;
    }

    // Safety fallback
    console.warn(`⚠️ POST failed for ${trip.id}. Attempting final fallback via PUT...`);
    return updateTrip(trip);
};

/**
 * Mock returning suggestions.
 */
export const getSuggestions = async (context: any): Promise<Suggestion[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const trip = await getTrip('trp_current');
    return trip?.sidebar_suggestions || [];
};

/**
 * Update a trip on the backend.
 */
export const updateTrip = async (trip: Trip): Promise<Trip | null> => {
    try {
        const payload = sanitizeTripPayload(trip);
        const response = await fetch(`${REAL_API_BASE}/trips/${trip.id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`❌ PUT /trips/${trip.id} failed [${response.status}]:`, errorBody);
            throw new Error(`Failed to update trip: ${response.statusText}`);
        }
        const updated = await response.json();
        if (updated && updated.id) {
            knownSavedTrips.add(updated.id);
        }
        return updated;
    } catch (error) {
        console.error('Error updating trip:', error);
        return null;
    }
};

/**
 * Delete a trip from the backend.
 */
export const deleteTrip = async (tripId: string): Promise<boolean> => {
    try {
        const response = await fetch(`${REAL_API_BASE}/trips/${tripId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error(`Failed to delete trip: ${response.statusText}`);
        return true;
    } catch (error) {
        console.error('Error deleting trip:', error);
        return false;
    }
};

/**
 * Invite a user to a trip.
 */
export const inviteUserToTrip = async (tripId: string, invitedEmail: string): Promise<boolean> => {
    try {
        const response = await fetch(`${REAL_API_BASE}/trips/${tripId}/invite`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ invitedEmail }),
        });
        if (!response.ok) throw new Error(`Failed to invite user: ${response.statusText}`);
        return true;
    } catch (error) {
        console.error('Error inviting user:', error);
        return false;
    }
};

/**
 * Remove a collaborator from a trip.
 */
export const removeCollaborator = async (tripId: string, collaboratorEmail: string): Promise<boolean> => {
    try {
        const response = await fetch(`${REAL_API_BASE}/trips/${tripId}/remove?email=${collaboratorEmail}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error(`Failed to remove collaborator: ${response.statusText}`);
        return true;
    } catch (error) {
        console.error('Error removing collaborator:', error);
        return false;
    }
};

/**
 * Revoke a trip invitation.
 */
export const revokeInvitation = async (tripId: string, inviteeEmail: string): Promise<boolean> => {
    try {
        const response = await fetch(`${REAL_API_BASE}/trips/${tripId}/revoke?email=${inviteeEmail}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error(`Failed to revoke invitation: ${response.statusText}`);
        return true;
    } catch (error) {
        console.error('Error revoking invitation:', error);
        return false;
    }
};

/**
 * Fetch trip invitations for the authenticated user.
 */
export const getTripInvitations = async (): Promise<any[]> => {
    try {
        const response = await fetch(`${REAL_API_BASE}/trips/invitations`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error(`Failed to fetch invitations: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching invitations:', error);
        return [];
    }
};

/**
 * Respond to a trip invitation (ACCEPT or DECLINE).
 */
export const respondToInvitation = async (
    tripId: string,
    action: 'ACCEPT' | 'DECLINE'
): Promise<boolean> => {
    try {
        const response = await fetch(`${REAL_API_BASE}/trips/${tripId}/respond?action=${action}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error(`Failed to respond to invitation: ${response.statusText}`);
        return true;
    } catch (error) {
        console.error('Error responding to invitation:', error);
        return false;
    }
};

/**
 * Toggle Publish status for a trip.
 */
export const togglePublishTrip = async (tripId: string): Promise<Trip | null> => {
    try {
        const response = await fetch(`${REAL_API_BASE}/trips/${tripId}/publish`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error(`Failed to toggle publish status: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error('Error toggling publish:', error);
        return null;
    }
};

/**
 * Fetch all public trips.
 */
export const getPublicTrips = async (): Promise<Trip[]> => {
    try {
        const response = await fetch(`${REAL_API_BASE}/trips/public`, {
            // Include headers if logged in, otherwise just Content-Type
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error(`Failed to fetch public trips: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching public trips:', error);
        return [];
    }
};

/**
 * Fork a public trip.
 */
export const forkTrip = async (tripId: string): Promise<Trip | null> => {
    try {
        const response = await fetch(`${REAL_API_BASE}/trips/${tripId}/fork`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error(`Failed to fork trip: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error('Error forking trip:', error);
        return null;
    }
};

/**
 * Call the AI-Planner Node.js service for the initial "Creative Phase".
 */
export const generateItinerary = async (data: TravelFormData): Promise<ItineraryResponse> => {
    const response = await fetch(`${PLANNER_API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ AI-Planner /generate failed [${response.status}]:`, errorText);
        throw new Error(errorText || 'Failed to generate');
    }

    return await response.json() as ItineraryResponse;
};
/**
 * Audit a trip using the Travel Data Architect logic in the AI-Planner.
 */
export const auditTrip = async (trip: Trip): Promise<Trip> => {
    const response = await fetch(`${PLANNER_API_BASE}/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trip),
    });

    if (!response.ok) {
        throw new Error('Failed to audit trip');
    }

    const auditedResult = await response.json() as Trip;
    console.log("--- [API] AUDIT RESPONSE RECEIVED ---", auditedResult);
    return auditedResult;
};

/**
 * Fetch discovery suggestions (skeletons) from the AI-Planner.
 */
export const fetchSidebarSuggestions = async (destination: string, tags: string[], type: string, count: number = 6, excludeNames: string[] = []): Promise<ActivitySkeleton[]> => {
    console.log(`📡 [API] Fetching ${count} ${type} Sidebar Suggestions for ${destination} with tags: ${tags.join(', ')}`);
    const response = await fetch(`${PLANNER_API_BASE}/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, tags, type, count, excludeNames }),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch sidebar suggestions');
    }

    return await response.json() as ActivitySkeleton[];
};

/**
 * Fetch real-world events from Ticketmaster via the AI-Planner.
 */
export const fetchEventsSuggestions = async (destination: string, tags: string[], startDate?: string, endDate?: string): Promise<ActivitySkeleton[]> => {
    console.log(`📡 [API] Fetching Ticketmaster Events for ${destination}`);
    const response = await fetch(`${PLANNER_API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, tags, startDate, endDate }),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch event suggestions');
    }

    return await response.json() as ActivitySkeleton[];
};

/**
 * Hydrate a single activity skeleton with full details.
 */
export const hydrateActivity = async (activity: ActivitySkeleton, destination: string, prevCoords?: { lat: number; lng: number }, startTime?: string): Promise<Activity> => {
    console.log(`💧 [API] Hydrating Activity: ${activity.title} in ${destination}`);
    const response = await fetch(`${PLANNER_API_BASE}/hydrate-activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity, destination, prevCoords, startTime }),
    });

    if (!response.ok) {
        throw new Error('Failed to hydrate activity');
    }

    return await response.json() as Activity;
};

/**
 * Hydrate a single lodging skeleton with full accommodation details.
 */
export const hydrateAccommodation = async (accommodation: ActivitySkeleton, destination: string): Promise<Accommodation> => {
    console.log(`💧 [API] Hydrating Accommodation: ${accommodation.title} in ${destination}`);
    const response = await fetch(`${PLANNER_API_BASE}/hydrate-accommodation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accommodation, destination }),
    });

    if (!response.ok) {
        throw new Error('Failed to hydrate accommodation');
    }

    return await response.json() as Accommodation;
};
