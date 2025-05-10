
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Group {
  id: string;
  name: string;
  memberCount: number;
  location: string;
  description: string;
  image: string;
  tags: string[];
  joinDate: string;
}

interface GroupMatchListProps {
  groups: Group[];
}

const GroupMatchList: React.FC<GroupMatchListProps> = ({ groups }) => {
  const { toast } = useToast();
  
  const handleViewGroup = (name: string) => {
    toast({
      title: `Viewing ${name}`,
      description: "Group chat and details will be available in the full version.",
      className: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-none",
    });
  };

  if (groups.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium mb-2">No group matches yet</h3>
        <p className="text-gray-500">
          Join some groups to see them here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <Card key={group.id} className="overflow-hidden">
          <div className="flex">
            <div className="w-1/3">
              <img 
                src={group.image} 
                alt={group.name}
                className="h-full w-full object-cover"
              />
            </div>
            <CardContent className="w-2/3 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{group.name}</h3>
                  <p className="text-xs text-gray-500 mb-1">{group.location}</p>
                </div>
                <span className="text-xs flex items-center text-gray-400">
                  <Users className="h-3 w-3 mr-1" /> {group.memberCount}
                </span>
              </div>
              
              <p className="text-sm mb-3 line-clamp-2">{group.description}</p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {group.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  Joined {new Date(group.joinDate).toLocaleDateString()}
                </span>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => handleViewGroup(group.name)}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  View Group
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default GroupMatchList;
