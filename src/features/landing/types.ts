
export interface Activity {
  id: string;
  time: string;
  title: string;
  location: string;
  description: string;
  cost_estimate: number;
  category: 'Food' | 'Sightseeing' | 'Adventure' | 'Transport' | 'Lodging' | 'Relaxation' | 'Nightlife';
  imageGallery: string[];
}

export interface DayPlan {
  dayNumber: number;
  theme: string;
  activities: Activity[];
}

export interface SidebarSuggestion {
  title: string;
  reason: string;
}

export interface ItineraryResponse {
  id?: string;
  trip_title: string;
  featuredImage?: string;
  total_days: number;
  currency: string;
  location?: {
    province?: string;
    region?: string;
    slug?: string;
  };
  taxonomy?: {
    theme?: string;
    themeLabel?: string;
  };
  itinerary: DayPlan[];
  sidebar_suggestions: SidebarSuggestion[];
}

export interface TravelFormData {
  destination: string;
  days: number;
  budget: 'Budget' | 'Standard' | 'Luxury';
  interests: string;
}
