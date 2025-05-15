
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { saveCityMatch } from "@/services/cityMatchService";
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const CityMatchQuestionnaire = () => {
  const [open, setOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [reason, setReason] = useState<boolean>(false);  // Changed to boolean for CheckedState
  const [reasonBehindMove, setReasonBehindMove] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await saveCityMatch({
        userId: user?.id,
        city: selectedCity,
        reason: reason ? "I agree to the terms" : reasonBehindMove // Convert boolean to string
      });
      
      if (result) {
        setSubmitted(true);
        setShowConfetti(true);
        toast({
          title: "City match saved!",
          description: `You're all set to move to ${selectedCity}!`,
        });
        setTimeout(() => {
          setShowConfetti(false);
          navigate("/besties");
        }, 3000);
      } else {
        toast({
          title: "Error",
          description: "Failed to save city match. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving city match:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Where are you moving?
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Moving Plans</DialogTitle>
          <DialogDescription>
            Let us know where you're moving so we can find you the right
            connections.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="city" className="text-right">
              City
            </Label>
            <Input
              type="text"
              id="city"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right">
              Reason
            </Label>
            <Input
              type="text"
              id="reason"
              value={reasonBehindMove}
              onChange={(e) => setReasonBehindMove(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="terms" className="text-right">
              <Checkbox
                id="terms"
                checked={reason}
                onCheckedChange={(checked) => setReason(!!checked)} // Convert to boolean
              />
            </Label>
            <div className="col-span-3">
              <p className="text-sm text-muted-foreground">
                By submitting this form, you agree to our{" "}
                <a
                  href="#"
                  className="underline underline-offset-2"
                  onClick={(e) => e.preventDefault()}
                >
                  terms of service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="underline underline-offset-2"
                  onClick={(e) => e.preventDefault()}
                >
                  privacy policy
                </a>.
              </p>
            </div>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit"}
        </Button>
        {showConfetti && (
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={600}
            gravity={0.9}
            initialVelocityY={30}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CityMatchQuestionnaire;
