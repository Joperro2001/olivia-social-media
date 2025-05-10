
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { List, Search } from "lucide-react";
import ServiceCarousel from "./ServiceCarousel";

const categories = [
  { id: "housing", label: "Housing" },
  { id: "utilities", label: "Utilities" },
  { id: "transport", label: "Transport" },
  { id: "banking", label: "Banking" },
  { id: "shopping", label: "Shopping" },
  { id: "food", label: "Food" }
];

const BrandDiscoverySection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("housing");
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <Card className="w-full">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center gap-2">
          <List className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Local Services</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Discover curated brands and services for your new location
        </CardDescription>
        
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            className="pl-8 h-9"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 px-3 pb-3">
        <Tabs 
          defaultValue="housing" 
          className="w-full" 
          value={activeCategory}
          onValueChange={setActiveCategory}
        >
          <TabsList className="flex flex-nowrap overflow-x-auto pb-1 mb-2 w-full justify-start h-8">
            {categories.map(category => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="flex-shrink-0 text-xs h-7 px-2"
              >
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map(category => (
            <TabsContent key={category.id} value={category.id} className="mt-0">
              <ServiceCarousel 
                category={category.id} 
                searchQuery={searchQuery}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BrandDiscoverySection;
