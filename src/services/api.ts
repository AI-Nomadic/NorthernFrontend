import { Trip, TripGenerationRequest, Suggestion } from '../types';

const MOCK_API_BASE = 'http://localhost:3001';
const REAL_API_BASE = 'http://localhost:8090/api'; // ← All traffic through API Gateway

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
        return await response.json();
    } catch (error) {
        console.error('Error fetching all trips:', error);
        return [];
    }
};

/**
 * Mock creating a trip (returns stub from db.json).
 */
export const createTrip = async (request: TripGenerationRequest): Promise<Trip> => {
    console.log('Mocking Trip Generation for:', request);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const trip = await getTrip('trp_current');
    if (!trip) throw new Error('Failed to generate trip (mock data missing)');
    return trip;
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
        const response = await fetch(`${REAL_API_BASE}/trips/${trip.id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(trip),
        });
        if (!response.ok) throw new Error(`Failed to update trip: ${response.statusText}`);
        return await response.json();
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
