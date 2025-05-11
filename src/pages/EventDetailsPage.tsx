
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import EventDetails from "@/components/events/EventDetails";
import EventNotFound from "@/components/events/EventNotFound";
import { Event } from "@/types/events";

interface EventDetailsPageProps {}

const eventDetails: Record<string, Event> = {
  "event1": {
    id: "event1",
    title: "Expat Mixer @ Café Berlin",
    date: "Tomorrow, 7:00 PM",
    location: "Café Berlin, Mitte",
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1000",
    description: "Join fellow expats for a relaxed evening of conversation and networking. Meet people from around the world who have made Berlin their new home. First drink is on us!",
    tags: ["Social", "Networking"],
    attendees: 24,
    category: "Chill",
    isPremium: true,
  },
  "event2": {
    id: "event2",
    title: "Weekend Hiking Trip",
    date: "Sat, 9:00 AM",
    location: "Grunewald Forest",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1000",
    description: "Explore the beautiful Grunewald Forest with a group of outdoor enthusiasts. The hike is approximately 10km with moderate difficulty. Don't forget to bring water and comfortable shoes!",
    tags: ["Outdoor", "Nature"],
    attendees: 12,
    category: "Explore",
  },
  "event3": {
    id: "event3",
    title: "Techno Tuesday @ Club Matrix",
    date: "Tue, 11:00 PM",
    location: "Club Matrix, Friedrichshain",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000",
    description: "Experience Berlin's legendary nightlife with the best techno DJs in town. Special guest DJ this week: Stef Mendesidis. Entry is free before midnight with the app QR code.",
    tags: ["Nightlife", "Music"],
    attendees: 87,
    category: "Party",
    isPremium: true,
  },
  "event4": {
    id: "event4",
    title: "German Language Exchange",
    date: "Wed, 6:30 PM",
    location: "International Hub, Neukölln",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000",
    description: "Practice your German in a relaxed atmosphere. All levels welcome! This weekly meetup pairs German speakers with learners for conversation practice. Snacks and refreshments provided.",
    tags: ["Education", "Language"],
    attendees: 18,
    category: "Learn",
  },
};

const EventDetailsPage: React.FC<EventDetailsPageProps> = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [isPremiumUser] = useState(false); // Simulating non-premium user by default
  
  const event = eventId && eventDetails[eventId] ? eventDetails[eventId] : null;
  
  if (!event) {
    return <EventNotFound />;
  }
  
  return (
    <EventDetails 
      {...event}
      isPremiumUser={isPremiumUser}
    />
  );
};

export default EventDetailsPage;
