
import React from "react";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import ServiceCard from "./ServiceCard";

interface ServiceCarouselProps {
  category: string;
  searchQuery: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  rating: number;
  image: string;
  category: string;
}

// Mock data for services
const services: Service[] = [
  {
    id: "housing-1",
    name: "HomeFinder",
    description: "Easily find apartments and houses for rent with virtual tours and instant booking.",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&w=600&h=400&q=80",
    category: "housing"
  },
  {
    id: "housing-2",
    name: "RentRight",
    description: "Furnished apartments with flexible lease terms perfect for newcomers.",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=600&h=400&q=80",
    category: "housing"
  },
  {
    id: "housing-3",
    name: "CityPads",
    description: "Budget-friendly housing options in the heart of the city.",
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&h=400&q=80",
    category: "housing"
  },
  {
    id: "utilities-1",
    name: "PowerConnect",
    description: "Quick electricity setup with no long-term contracts.",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&h=400&q=80",
    category: "utilities"
  },
  {
    id: "utilities-2",
    name: "WaterWorks",
    description: "Water service setup with online account management.",
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1482881497185-d4a9ddbe4151?auto=format&fit=crop&w=600&h=400&q=80",
    category: "utilities"
  },
  {
    id: "transport-1",
    name: "CityRide",
    description: "Monthly transit passes with mobile ticketing.",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=600&h=400&q=80",
    category: "transport"
  },
  {
    id: "transport-2",
    name: "BikeShare",
    description: "Affordable bike rentals with stations throughout the city.",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&h=400&q=80",
    category: "transport"
  },
  {
    id: "banking-1",
    name: "GlobalBank",
    description: "International banking services with no foreign transaction fees.",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1482881497185-d4a9ddbe4151?auto=format&fit=crop&w=600&h=400&q=80",
    category: "banking"
  },
  {
    id: "shopping-1",
    name: "LocalMarket",
    description: "Fresh produce and local goods delivered to your door.",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=600&h=400&q=80",
    category: "shopping"
  },
  {
    id: "food-1",
    name: "MealBox",
    description: "Weekly meal prep delivery with local cuisine options.",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=600&h=400&q=80",
    category: "food"
  }
];

const ServiceCarousel: React.FC<ServiceCarouselProps> = ({ category, searchQuery }) => {
  // Filter services by category and search query
  const filteredServices = services.filter(service => {
    const matchesCategory = service.category === category;
    const matchesSearch = searchQuery === "" || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
  
  if (filteredServices.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No services found. Try a different search term.
      </div>
    );
  }

  return (
    <div className="relative">
      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {filteredServices.map((service) => (
            <CarouselItem key={service.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/3">
              <ServiceCard service={service} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex justify-center mt-2">
          <CarouselPrevious className="relative inset-auto mr-2 translate-y-0" />
          <CarouselNext className="relative inset-auto ml-2 translate-y-0" />
        </div>
      </Carousel>
    </div>
  );
};

export default ServiceCarousel;
