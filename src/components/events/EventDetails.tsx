
import React from "react";
import EventHeader from "./EventHeader";
import EventImage from "./EventImage";
import EventInfo from "./EventInfo";
import EventActions from "./EventActions";

interface EventDetailsProps {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  description?: string;
  tags: string[];
  attendees: number;
  isPremium?: boolean;
  isPremiumUser: boolean;
}

const EventDetails: React.FC<EventDetailsProps> = ({
  title,
  date,
  location,
  image,
  description,
  tags,
  attendees,
  isPremium,
  isPremiumUser
}) => {
  return (
    <div className="flex flex-col min-h-[100vh] bg-[#FDF5EF] pb-24">
      <EventHeader title="Event Details" />
      <EventImage 
        image={image} 
        title={title} 
        isPremium={isPremium} 
      />
      <EventInfo
        title={title}
        date={date}
        location={location}
        attendees={attendees}
        tags={tags}
        description={description}
        isPremiumUser={isPremiumUser}
      />
      <EventActions eventTitle={title} />
    </div>
  );
};

export default EventDetails;
