
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, Edit } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

interface RelocationCardProps {
  moveInCity: string;
}

const RelocationInterests = [
  "Accommodation tips",
  "Local guides",
  "Social events",
  "Networking",
  "Language exchange"
];

const RelocationCard: React.FC<RelocationCardProps> = ({ moveInCity }) => {
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Form state
  const [status, setStatus] = useState<string>(profile?.relocation_status || "active");
  const [timeframe, setTimeframe] = useState<string>(profile?.relocation_timeframe || "Next 3 months");
  const [interests, setInterests] = useState<string[]>(profile?.relocation_interests || ["Accommodation tips", "Local guides", "Social events"]);
  
  const city = moveInCity || "Your city";
  
  const handleInterestToggle = (interest: string) => {
    setInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((item) => item !== interest);
      } else {
        return [...prev, interest];
      }
    });
  };
  
  const handleUpdateRelocation = async () => {
    setIsUpdating(true);
    try {
      await updateProfile({
        relocation_status: status as any,
        relocation_timeframe: timeframe,
        relocation_interests: interests
      });
      
      toast({
        title: "Relocation status updated",
        description: "Your relocation information has been updated successfully."
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to update relocation status:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your relocation information.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const statusVariants = {
    active: "bg-blue-50 text-blue-600 border-blue-200",
    planning: "bg-purple-50 text-purple-600 border-purple-200",
    paused: "bg-amber-50 text-amber-600 border-amber-200",
    completed: "bg-green-50 text-green-600 border-green-200",
  };
  
  const statusLabel = {
    active: "Active",
    planning: "Planning",
    paused: "Paused",
    completed: "Completed"
  };
  
  const currentStatus = profile?.relocation_status || "active";
  const currentTimeframe = profile?.relocation_timeframe || "Next 3 months";
  const currentInterests = profile?.relocation_interests || ["Accommodation tips", "Local guides", "Social events"];
  
  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 border"
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg">Relocation Status</h3>
          <Badge 
            variant="outline" 
            className={statusVariants[currentStatus as keyof typeof statusVariants]}
          >
            {statusLabel[currentStatus as keyof typeof statusLabel]}
          </Badge>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Moving to</p>
              <p className="font-medium">{city}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Timeframe</p>
              <p className="font-medium">{currentTimeframe}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Looking for</p>
              <div className="flex gap-2 mt-1 flex-wrap">
                {currentInterests.map(interest => (
                  <Badge 
                    key={interest}
                    variant="secondary" 
                    className="bg-lavender-light text-primary-dark"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-5">
          <Button 
            className="w-full flex items-center justify-center gap-2"
            onClick={() => {
              setStatus(currentStatus);
              setTimeframe(currentTimeframe);
              setInterests(currentInterests);
              setIsDialogOpen(true);
            }}
          >
            <Edit className="w-4 h-4" /> Update Relocation Status
          </Button>
        </div>
      </motion.div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Relocation Status</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={status} 
                onValueChange={setStatus}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeframe">Timeframe</Label>
              <Select 
                value={timeframe} 
                onValueChange={setTimeframe}
              >
                <SelectTrigger id="timeframe">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="May">May</SelectItem>
                  <SelectItem value="June">June</SelectItem>
                  <SelectItem value="July">July</SelectItem>
                  <SelectItem value="August">August</SelectItem>
                  <SelectItem value="September">September</SelectItem>
                  <SelectItem value="October">October</SelectItem>
                  <SelectItem value="November">November</SelectItem>
                  <SelectItem value="December">December</SelectItem>
                  <SelectItem value="Next year">Next year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Interests</Label>
              <div className="grid grid-cols-1 gap-2">
                {RelocationInterests.map((interest) => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`interest-${interest}`} 
                      checked={interests.includes(interest)}
                      onCheckedChange={() => handleInterestToggle(interest)}
                    />
                    <Label htmlFor={`interest-${interest}`} className="text-sm cursor-pointer">
                      {interest}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateRelocation}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                  Saving...
                </>
              ) : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RelocationCard;
