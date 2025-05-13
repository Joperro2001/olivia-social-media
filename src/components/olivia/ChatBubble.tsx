
import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ChatBubbleProps {
  message: string;
  isUser?: boolean;
  timestamp?: string;
  avatar?: string;
  showGroupPreview?: boolean;
  groupName?: string;
  memberCount?: number;
  onGroupAction?: () => void;
  isFirstMessage?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isUser = false,
  timestamp,
  avatar,
  showGroupPreview = false,
  groupName,
  memberCount,
  onGroupAction,
  isFirstMessage = false,
}) => {
  return (
    <div
      className={`flex items-end gap-2 mb-4 ${
        isUser ? "justify-end" : "justify-start"
      } ${isFirstMessage ? "mt-4" : ""}`}
    >
      {!isUser && (
        <Avatar className="w-8 h-8">
          <img
            src={avatar || "/lovable-uploads/eec42500-64ac-429a-b4d6-e87431861420.png"}
            alt="Olivia"
            className="w-full h-full object-cover"
          />
        </Avatar>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser 
            ? "bg-primary text-white" 
            : "bg-[#3D2748] text-white"
        }`}
      >
        <p className="text-sm break-words">{message}</p>
        
        {showGroupPreview && (
          <div className="mt-2 p-3 bg-white/80 rounded-md shadow-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full">Group Match</Badge>
              <span className="text-xs text-gray-500">• {memberCount} members</span>
            </div>
            <h4 className="font-medium text-sm mt-1">{groupName}</h4>
            <Button 
              variant="outline"
              size="sm"
              className="mt-2 text-xs"
              onClick={onGroupAction}
            >
              View Group
            </Button>
          </div>
        )}
        
        {timestamp && (
          <div className={`text-xs mt-1 ${isUser ? "text-white/70" : "text-white/70"}`}>
            {timestamp}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-2" />
      )}
    </div>
  );
};

export default ChatBubble;
