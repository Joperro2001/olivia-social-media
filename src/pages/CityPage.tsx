
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
  const [activeTab, setActiveTab] = useState("city-match");

  return <div className="flex flex-col h-screen bg-[#FDF5EF]">
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold">City</h1>
        <div className="flex items-center gap-2">
          {/* Placeholder for consistent spacing */}
        </div>
      </div>
      
      <div className="px-4 flex-1 overflow-auto pb-28"> {/* Added padding bottom for better scrolling */}
        <Tabs defaultValue="city-match" className="w-full h-full flex flex-col" value={activeTab} onValueChange={setActiveTab}>
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
      </div>
    </div>;
};

export default CityPage;
