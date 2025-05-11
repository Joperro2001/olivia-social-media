
// Types for matched profiles, groups and events
export interface MatchedProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  image: string;
  bio: string;
  matchDate: string;
  tags: string[];
  isPending?: boolean;
  hasInitialMessage?: boolean;
  messages?: string[]; // Added messages property
}

export interface MatchedGroup {
  id: string;
  name: string;
  memberCount: number;
  image: string;
  description: string;
  joinDate: string;
  tags: string[];
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  tags: string[];
  attendees: number;
  status: "Attended" | "RSVP'd";
}

// Mock data for matched profiles
export const matchedProfiles: MatchedProfile[] = [
  {
    id: "profile1",
    name: "Emma",
    age: 26,
    location: "Berlin, Germany",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000",
    bio: "Tech professional new to Berlin! Looking for friends to explore the city with.",
    matchDate: "2 days ago",
    tags: ["Tech", "Coffee lover", "Pride ally 🌈"],
    messages: ["Hey! I saw we both love coffee. Any favorite cafes in Berlin?"]
  },
  {
    id: "profile2",
    name: "Miguel",
    age: 28,
    location: "Barcelona, Spain",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000",
    bio: "Digital nomad working in graphic design. Currently looking for cool co-working buddies!",
    matchDate: "1 week ago",
    tags: ["Digital Nomad", "Design", "Nature lover 🌿"],
    messages: ["Hi! I'm looking for good co-working spaces, any recommendations?", "I usually work at cafes but would love a more dedicated space."]
  },
  {
    id: "profile3",
    name: "Sophie",
    age: 25,
    location: "Amsterdam, Netherlands",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1000",
    bio: "Student looking to meet fellow art enthusiasts. I love visiting museums and going to exhibitions.",
    matchDate: "Just now",
    tags: ["Art", "Museums", "Photography"],
    isPending: true
  },
  {
    id: "profile4",
    name: "Liam",
    age: 31,
    location: "London, UK",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000",
    bio: "Software engineer who recently moved to London. Looking for hiking buddies and tech meetups.",
    matchDate: "Yesterday",
    tags: ["Tech", "Hiking", "Craft beer"],
    isPending: true
  }
];

// Mock data for matched groups
export const matchedGroups: MatchedGroup[] = [
  {
    id: "group1",
    name: "Berlin Tech Enthusiasts",
    memberCount: 7,
    image: "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?q=80&w=1000",
    description: "A group for tech professionals in Berlin looking to network and explore the city's tech scene.",
    joinDate: "3 days ago",
    tags: ["Tech", "Networking", "Berlin"],
  },
  {
    id: "group2",
    name: "Rotterdam Housing Hunters",
    memberCount: 5,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000",
    description: "Students and young professionals looking for affordable housing options in Rotterdam.",
    joinDate: "2 weeks ago",
    tags: ["Housing", "Students", "Rotterdam"],
  },
];

// Mock data for RSVP'd events
export const rsvpEvents: Event[] = [
  {
    id: "event1",
    title: "Expat Mixer @ Café Berlin",
    date: "Tomorrow, 7:00 PM",
    location: "Café Berlin, Mitte",
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1000",
    tags: ["Social", "Networking"],
    attendees: 24,
    status: "RSVP'd",
  },
  {
    id: "event2",
    title: "Weekend Hiking Trip",
    date: "Sat, 9:00 AM",
    location: "Grunewald Forest",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1000",
    tags: ["Outdoor", "Nature"],
    attendees: 12,
    status: "Attended",
  },
];
