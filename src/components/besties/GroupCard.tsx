
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GroupCardProps {
  group: {
    id: string;
    name: string;
    memberCount: number;
    location: string;
    description: string;
    image?: string;
    tags: string[];
    matchPercentage: number;
  };
  onJoinRequest: (id: string) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, onJoinRequest }) => {
  return (
    <Card className="overflow-hidden border border-gray-100">
      <div className="relative">
        <div className="h-32 overflow-hidden">
          <img
            src={group.image || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000"}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div 
          className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-semibold shadow"
          style={{ background: "linear-gradient(to right, #f472b6, #8b5cf6)" }}
        >
          <span className="text-white">{group.matchPercentage}% Match</span>
        </div>
      </div>

      <CardContent className="pt-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{group.name}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <Users className="h-3 w-3" /> {group.memberCount} members • {group.location}
            </p>
          </div>
        </div>
        
        <p className="text-sm mt-3 line-clamp-2">{group.description}</p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {group.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="rounded-full">
              {tag}
            </Badge>
          ))}
          {group.tags.length > 3 && (
            <Badge variant="outline" className="rounded-full">
              +{group.tags.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex justify-between">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full mr-2">
              Learn More
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{group.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-1 pt-1">
                <Users className="h-3 w-3" /> {group.memberCount} members • {group.location}
              </DialogDescription>
            </DialogHeader>
            
            <div>
              {group.image && (
                <img
                  src={group.image}
                  alt={group.name}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
              )}
              
              <p className="text-sm mb-4">{group.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {group.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="rounded-full">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <h4 className="text-sm font-medium mb-2">How this works:</h4>
              <ol className="text-sm text-gray-500 space-y-1 list-decimal pl-4 mb-4">
                <li>Request to join this group</li>
                <li>Current members will review your request</li>
                <li>Once approved, you'll be added to the group chat</li>
                <li>Start connecting with your new group!</li>
              </ol>
            </div>
            
            <DialogFooter>
              <Button 
                className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"
                onClick={() => {
                  onJoinRequest(group.id);
                  document.querySelector('[data-state="open"]')?.dispatchEvent(
                    new KeyboardEvent("keydown", {
                      key: "Escape",
                      bubbles: true
                    })
                  );
                }}
              >
                Request to Join
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Button 
          variant="default"
          size="sm"
          className="w-full"
          onClick={() => onJoinRequest(group.id)}
        >
          Request to Join
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GroupCard;
