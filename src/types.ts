export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
}

export type ListingCategory = 'hotel' | 'restaurant' | 'attraction' | 'rental';

export interface Listing {
  id: string;
  name: string;
  category: ListingCategory;
  rating: number;
  reviewCount: number;
  price: number; // local currency per night or average meal cost, etc.
  image: string;
  location: string;
  cityId: string; // e.g. 'paris'
  description: string;
  features: string[]; // e.g. ["Free Wi-Fi", "Pool", "Michelin Star", "Ocean View"]
  phone?: string;
  website?: string;
}

export interface Review {
  id: string;
  listingId: string;
  title: string;
  rating: number; // 1-5
  text: string;
  authorName: string;
  authorLocation?: string;
  date: string;
  userAvatar?: string;
  image?: string;
}

export interface TripItem {
  id: string;
  listingId: string;
  title: string;
  category: ListingCategory;
  price: number;
  dayIndex: number;
  timeSlot: 'morning' | 'afternoon' | 'evening';
  notes?: string;
  image?: string;
}

export interface TripPlan {
  id: string;
  destinationName: string;
  cityId: string;
  startDate: string;
  endDate: string;
  items: TripItem[];
  budget: number;
}
