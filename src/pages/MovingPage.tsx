
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Luggage, List, MapPin } from "lucide-react";
import CityMatchSection from "@/components/moving/CityMatchSection";
import PackingSection from "@/components/moving/PackingSection";
import BrandDiscoverySection from "@/components/moving/BrandDiscoverySection";

const MovingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("city-match");

  return (
    <div className="flex flex-col h-[100vh] bg-[#FDF5EF] pb-16">
      <div className="flex items-center justify-center py-4">
        <h1 className="text-2xl font-bold">Moving</h1>
      </div>
      
      <div className="px-4 flex flex-col h-full">
        <Tabs 
          defaultValue="city-match" 
          className="w-full" 
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-3 mb-6 w-full">
            <TabsTrigger value="city-match" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">City Match</span>
            </TabsTrigger>
            <TabsTrigger value="packing" className="flex items-center gap-2">
              <Luggage className="w-4 h-4" />
              <span className="hidden sm:inline">Packing</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Services</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="city-match" className="mt-0">
            <CityMatchSection />
          </TabsContent>
          
          <TabsContent value="packing" className="mt-0">
            <PackingSection />
          </TabsContent>
          
          <TabsContent value="services" className="mt-0">
            <BrandDiscoverySection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MovingPage;
