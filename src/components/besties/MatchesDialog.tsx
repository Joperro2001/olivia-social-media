
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MatchesList from "./MatchesList";
import { MatchedProfile } from "@/data/matchesMockData";

interface MatchesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profiles: MatchedProfile[];
}

const MatchesDialog: React.FC<MatchesDialogProps> = ({ open, onOpenChange, profiles }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Your Matches</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-auto pr-1">
          <MatchesList profiles={profiles} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchesDialog;
