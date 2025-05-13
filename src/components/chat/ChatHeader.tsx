
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, MoreVertical, RefreshCw } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatHeaderProps {
  profile: {
    id: string;
    name: string;
    image?: string;
  };
  onRefresh: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ profile, onRefresh }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/matches")} 
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Avatar className="h-10 w-10 mr-3">
          {profile.image ? (
            <AvatarImage src={profile.image} alt={profile.name} />
          ) : (
            <AvatarFallback>{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          )}
        </Avatar>
        
        <div>
          <h1 className="font-semibold text-base">{profile.name}</h1>
          <p className="text-xs text-gray-500">Online now</p>
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-gray-500">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh chat
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ChatHeader;
