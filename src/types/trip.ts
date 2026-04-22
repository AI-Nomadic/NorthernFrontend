import { DayPlan, Suggestion } from './itinerary';

export enum TripVibe {
    ADVENTURE = 'Adventure',
    RELAX = 'Relax',
    FAMILY = 'Family',
    LUXURY = 'Luxury',
    BUDGET = 'Budget'
}

export interface LocationData {
    lat: number;
    lng: number;
    name?: string;
}

export interface TripState {
    destination: string;
    startDate: string;
    endDate: string;
    vibe: TripVibe;
    budget: number;
    travelers: number;
}

export interface Collaborator {
    email: string;
    id: string;
    role: 'EDITOR' | 'VIEWER';
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
}

export interface Trip {
    id: string; // e.g., 'trp_...'
    trip_title: string;
    featuredImage?: string; // Parent thumbnail
    total_days: number;
    currency: string;
    visibility: 'PRIVATE' | 'PUBLIC';
    sourceId?: string;
    ownerEmail?: string;

    location: {
        province?: string;
        region?: string;
        slug?: string;
    };

    taxonomy: {
        theme?: string;
        themeLabel?: string;
        travelType?: string;
        travelTypeLabel?: string;
        season?: string[];
    };

    metrics: {
        budgetRange?: string;
        difficulty?: string;
        activityLevel?: string;
        targetBudget?: number;
    };

    summaryStats: {
        totalActivities?: number;
        avgCostPerDay?: number;
        totalCost?: number;
    };

    tags: string[];
    itinerary: DayPlan[];
    collaborators?: Collaborator[];
    sidebar_suggestions?: Suggestion[];
    image_url?: string; // Legacy support
    last_edited?: string;
}

// API Request/Response Types
export interface TripGenerationRequest {
    userId?: string;
    destination: {
        city: string;
        country?: string;
        coordinates?: LocationData;
    };
    dates: {
        startDate: string;
        endDate: string;
        isFlexible?: boolean;
    };
    travelers: {
        count: number;
        type: 'couple' | 'family' | 'solo' | 'friends';
    };
    budget: {
        amount: number;
        currency: string;
        level: 'budget' | 'moderate' | 'luxury';
    };
    preferences: {
        theme: string;
        interests: string[];
    };
}

export interface TravelFormData {
    destination: string;
    lat?: number;
    lng?: number;
    formattedAddress?: string;
    startDate: string;
    endDate: string;
    budget: 'Budget' | 'Standard' | 'Luxury';
    interests: string;
    numDays?: number;
    month?: string;
}

export interface ItineraryResponse {
    id?: string;
    trip_title: string;
    featuredImage?: string;
    total_days: number;
    currency: string;
    location: {
        province: string;
        region: string;
        slug?: string;
    };
    taxonomy: {
        theme: string;
        themeLabel: string;
        travelType: string;
        travelTypeLabel: string;
    };
    metrics: {
        budgetRange: string;
        difficulty: string;
        activityLevel: string;
    };
    summaryStats: {
        totalActivities: number;
        avgCostPerDay: number;
        totalCost: number;
    };
    tags: string[];
    itinerary: DayPlan[];
    sidebar_suggestions: Suggestion[];
}
