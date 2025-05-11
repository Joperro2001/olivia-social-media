
export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  tags: string[];
  attendees: number;
  category: string;
  description?: string;
  isPremium?: boolean;
}

export interface SavedEvent extends Event {
  savedAt: string;
}

export interface AttendedEvent extends Event {
  attendedAt: string;
  rating?: number;
}
