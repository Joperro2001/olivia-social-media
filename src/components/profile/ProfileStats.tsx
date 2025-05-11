
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Heart, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ProfileStatsProps {
  rsvpEventsCount: number;
  matchesCount: number;
  groupsCount: number;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({
  rsvpEventsCount,
  matchesCount,
  groupsCount,
}) => {
  const { toast } = useToast();

  return (
    <div className="grid grid-cols-3 gap-2 mt-2 mb-4">
      <Link to="/attended-events" className="flex-1">
        <Card className="bg-white h-full">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <Calendar className="h-6 w-6 text-primary mb-2" />
            <span className="text-lg font-semibold">{rsvpEventsCount}</span>
            <span className="text-xs text-gray-500">Events</span>
          </CardContent>
        </Card>
      </Link>

      <Link to="/matches" className="flex-1">
        <Card className="bg-white h-full">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <Heart className="h-6 w-6 text-rose-500 mb-2" />
            <span className="text-lg font-semibold">{matchesCount}</span>
            <span className="text-xs text-gray-500">Matches</span>
          </CardContent>
        </Card>
      </Link>

      <Link to="/my-groups" className="flex-1">
        <Card className="bg-white h-full">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <Users className="h-6 w-6 text-blue-500 mb-2" />
            <span className="text-lg font-semibold">{groupsCount}</span>
            <span className="text-xs text-gray-500">Groups</span>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};

export default ProfileStats;
