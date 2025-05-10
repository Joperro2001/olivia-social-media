
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
}) => {
  return (
    <div
      className={`flex items-end gap-2 mb-4 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <Avatar className="w-8 h-8">
          <img
            src={avatar || "https://api.dicebear.com/7.x/thumbs/svg?seed=olivia"}
            alt="Olivia"
            className="w-full h-full object-cover"
          />
        </Avatar>
      )}
      <div
        className={`${
          isUser ? "chat-bubble-user" : "chat-bubble-assistant"
        }`}
      >
        <p className="text-sm">{message}</p>
        
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
          <div className={`text-[10px] mt-1 ${isUser ? "text-white/70" : "text-gray-500"}`}>
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
