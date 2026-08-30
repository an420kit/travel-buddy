export interface Destination {
  id: string;
  name: string;
  description: string;
  smartAdvice: string;
}

export interface Hotel {
  id: string;
  name: string;
  distance: string;
  rating: number;
  tags: string[];
  price: number;
  originalPrice?: number;
  image: string;
  category: "Best Value" | "Luxury Stays";
  description: string;
}

export interface Activity {
  id: string;
  name: string;
  type: "landmark" | "gem";
  category: "Visit" | "Lunch" | "Leisure" | "Historic";
  timeNeeded: string;
  description: string;
  image?: string;
  easyWalking?: boolean;
  localFavorite?: boolean;
}

export interface ItineraryItem {
  time: string;
  title: string;
  type: "Start" | "Visit" | "Lunch" | "Leisure" | "End";
  description: string;
  durationText?: string;
  image?: string;
  transitBefore?: {
    type: "drive" | "walk";
    duration: string;
    detail: string;
  };
}

export interface SavedItinerary {
  id: string;
  destination: string;
  date: string;
  durationDays: number;
  hotel: Hotel;
  activities: Activity[];
  timeline: ItineraryItem[];
  created_at: string;
  weather?: {
    temp: string;
    condition: string;
    icon: string;
    packingAdvice: string;
    forecast: { day: string; temp: string; cond: string }[];
  };
}

export interface AdminSettings {
  liveMapEnabled: boolean;
  crowdForecastEnabled: boolean;
  maintenanceModeEnabled: boolean;
}

export interface BroadcastMessage {
  id: string;
  type: "Weather Alert" | "System Maintenance" | "Travel Tip";
  content: string;
  active: boolean;
  timestamp: string;
}

export interface PendingHiddenGem {
  id: string;
  name: string;
  location: string;
  submittedBy: string;
  description: string;
  image: string;
}

export interface AdCampaign {
  id: string;
  title: string;
  campaignType: string;
  placement: "Top Banner" | "Bottom Banner" | "Inline Feed";
  affiliateLink: string;
  imageDescription: string;
  active: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "expert";
  text: string;
  timestamp: string;
}
