
import React from "react";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

const FloatingVoiceButton: React.FC<{ onActivate: () => void }> = ({
  onActivate,
}) => {
  return (
    <Button
      size="icon"
      className="rounded-full w-14 h-14 fixed bottom-24 right-4 shadow-lg"
      onClick={onActivate}
    >
      <Mic className="h-6 w-6" />
    </Button>
  );
};

export default FloatingVoiceButton;
