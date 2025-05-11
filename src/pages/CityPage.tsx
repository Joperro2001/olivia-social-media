import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Luggage, List, MapPin, Package, ArrowsUpFromLine, Map } from "lucide-react";
import CityMatchSection from "@/components/moving/CityMatchSection";
import PackingSection from "@/components/moving/PackingSection";
import BrandDiscoverySection from "@/components/moving/BrandDiscoverySection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
const CityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("");
  const [showLanding, setShowLanding] = useState(true);
  const handleOptionSelect = (option: string) => {
    setActiveTab(option);
    setShowLanding(false);
    // Scroll to top when changing tabs
    window.scrollTo(0, 0);
  };
  const handleBackToOptions = () => {
    setActiveTab("");
    setShowLanding(true);
    // Scroll to top when returning to landing page
    window.scrollTo(0, 0);
  };
  return <div className="flex flex-col h-screen bg-[#FDF5EF]">
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold">City</h1>
        <div className="flex items-center gap-2">
          {/* Placeholder for consistent spacing */}
        </div>
      </div>
      
      <div className="px-4 flex-1 overflow-auto pb-28"> {/* Added padding bottom for better scrolling */}
        {showLanding ? <div className="space-y-5">
            <div className="bg-white/80 p-4 rounded-lg shadow-sm">
              <p className="text-center text-lg">
                Whether you're planning, preparing, or already exploring your new exchange city, Olivia is here to help. Choose your journey:
              </p>
            </div>
            
            <Card className="border-primary/10 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ArrowsUpFromLine className="h-5 w-5 text-primary" />
                  <CardTitle>City Matcher</CardTitle>
                </div>
                <CardDescription className="text-base italic">
                  "I'm choosing my next exchange destination."
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Tell Olivia what matters to you — lifestyle, budget, weather, language, vibes — and she'll help you find your perfect match.
                </p>
                <Button className="w-full" onClick={() => handleOptionSelect("city-match")}>
                  Find My Match
                </Button>
              </CardContent>
            </Card>
            
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
                <Button className="w-full" variant="outline" onClick={() => handleOptionSelect("packing")}>
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
                <Button className="w-full" variant="secondary" onClick={() => handleOptionSelect("services")}>
                  Explore My City
                </Button>
              </CardContent>
            </Card>
          </div> : <>
            <Tabs defaultValue={activeTab} className="w-full h-full flex flex-col" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-2 w-full sticky top-0 z-10 bg-[#FDF5EF]">
                <TabsTrigger value="city-match" className="flex items-center gap-2 justify-start">
                  <ArrowsUpFromLine className="w-4 h-4" />
                  <span className="hidden sm:inline">City Match</span>
                </TabsTrigger>
                <TabsTrigger value="packing" className="flex items-center gap-2 justify-start">
                  <Package className="w-4 h-4" />
                  <span className="hidden sm:inline">Packing</span>
                </TabsTrigger>
                <TabsTrigger value="services" className="flex items-center gap-2 justify-start">
                  <Map className="w-4 h-4" />
                  <span className="hidden sm:inline">Explorer</span>
                </TabsTrigger>
              </TabsList>
              
              <ScrollArea className="flex-1 pb-0"> {/* Using ScrollArea component for better scrolling */}
                <TabsContent value="city-match" className="mt-0 pb-0\n">
                  <CityMatchSection />
                </TabsContent>
                
                <TabsContent value="packing" className="mt-0 pb-28">
                  <PackingSection />
                </TabsContent>
                
                <TabsContent value="services" className="mt-0 pb-0">
                  <BrandDiscoverySection />
                </TabsContent>
              </ScrollArea>
            </Tabs>
            
            <div className="fixed bottom-24 right-4">
              <Button variant="outline" size="sm" className="rounded-full shadow-md" onClick={handleBackToOptions}>
                Back to options
              </Button>
            </div>
          </>}
      </div>
    </div>;
};
export default CityPage;