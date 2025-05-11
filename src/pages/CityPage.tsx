import React from "react";
import { ArrowsUpFromLine, Package, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CityMatchSection from "@/components/moving/CityMatchSection";

const CityPage: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-[#FDF5EF]">
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold">City</h1>
        <div className="flex items-center gap-2">
          {/* Placeholder for consistent spacing */}
        </div>
      </div>
      
      <div className="px-4 flex-1 overflow-auto pb-28"> 
        <div className="space-y-5">
          <CityMatchSection />
          
          <Card className="border-primary/10 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <CardTitle>City Packer</CardTitle>
              </div>
              <CardDescription className="text-base italic">
                "I know where I'm going. Now what do I need?"
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Olivia will build your personalized moving checklist: visa requirements, SIM cards, health insurance, local apps, housing tips, and exactly what to pack.
              </p>
              <Button className="w-full" variant="outline">
                Create My Checklist
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-primary/10 hover:shadow-md transition-shadow mb-4">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Map className="h-5 w-5 text-primary" />
                <CardTitle>City Explorer</CardTitle>
              </div>
              <CardDescription className="text-base italic">
                "I've just arrived. Help me settle in!"
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Get Olivia's curated local guides, event suggestions, friend-finder features, must-know tips, and city-specific hacks to feel at home fast.
              </p>
              <Button className="w-full" variant="secondary">
                Explore My City
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CityPage;
