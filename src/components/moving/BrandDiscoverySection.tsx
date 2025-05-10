
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
  { id: "food", label: "Food & Groceries" }
];

const BrandDiscoverySection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("housing");
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <Card className="w-full mb-20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <List className="h-5 w-5 text-primary" />
          <CardTitle>Local Services & Products</CardTitle>
        </div>
        <CardDescription>
          Discover curated brands and services for your new location
        </CardDescription>
        
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs 
          defaultValue="housing" 
          className="w-full" 
          value={activeCategory}
          onValueChange={setActiveCategory}
        >
          <TabsList className="flex flex-nowrap overflow-x-auto pb-1 mb-6 w-full justify-start">
            {categories.map(category => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="flex-shrink-0"
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
