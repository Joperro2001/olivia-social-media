
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Heart, Star } from "lucide-react";

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

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Liked!",
      description: `You liked ${service.name}`,
    });
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col border-0 shadow-sm hover:shadow-md transition-all">
      <div className="aspect-[16/9] relative">
        <img 
          src={service.image} 
          alt={service.name} 
          className="object-cover w-full h-full"
        />
        <div className="absolute top-1 right-1 bg-background/80 backdrop-blur-sm text-foreground px-1.5 py-0.5 rounded-md flex items-center gap-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium">{service.rating}</span>
        </div>
        <div 
          onClick={handleLike}
          className="absolute bottom-1 right-1 bg-background/80 backdrop-blur-sm text-foreground p-1 rounded-full cursor-pointer hover:bg-primary/20 transition-colors"
        >
          <Heart className="h-3.5 w-3.5 text-accent" />
        </div>
      </div>
      
      <CardContent className="pt-2 pb-0 px-3 flex-grow">
        <h3 className="font-semibold text-sm mb-0.5 font-mono">{service.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 font-sans">
          {service.description}
        </p>
      </CardContent>
      
      <CardFooter className="pt-1 pb-2 px-3">
        <Button 
          variant="outline" 
          size="sm"
          className="w-full gap-1 text-xs h-7 font-medium rounded-xl border-primary/30 hover:bg-primary/10 hover:text-primary font-sans"
          onClick={handleLearnMore}
        >
          <ExternalLink className="h-3 w-3" />
          Learn More
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
