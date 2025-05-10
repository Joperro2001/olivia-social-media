
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Star } from "lucide-react";

interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    description: string;
    rating: number;
    image: string;
    category: string;
  };
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const { toast } = useToast();
  
  const handleLearnMore = () => {
    toast({
      title: service.name,
      description: "This feature will be available in the full version!",
    });
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-[16/9] relative">
        <img 
          src={service.image} 
          alt={service.name} 
          className="object-cover w-full h-full"
        />
        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground px-2 py-1 rounded-md flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium">{service.rating}</span>
        </div>
      </div>
      
      <CardContent className="pt-4 flex-grow">
        <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {service.description}
        </p>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          variant="outline" 
          className="w-full gap-2"
          onClick={handleLearnMore}
        >
          <ExternalLink className="h-4 w-4" />
          Learn More
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
