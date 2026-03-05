
export interface Activity {
  id: string;
  time: string;
  title: string;
  location: string;
  description: string;
  cost_estimate: number;
  category: 'Food' | 'Sightseeing' | 'Adventure' | 'Transport' | 'Lodging';
}

export interface DayPlan {
  day: number;
  theme: string;
  activities: Activity[];
}

export interface SidebarSuggestion {
  title: string;
  reason: string;
}

export interface ItineraryResponse {
  trip_title: string;
  total_days: number;
  currency: string;
  itinerary: DayPlan[];
  sidebar_suggestions: SidebarSuggestion[];
}

export interface TravelFormData {
  destination: string;
  days: number;
  budget: 'Budget' | 'Standard' | 'Luxury';
  interests: string;
}
