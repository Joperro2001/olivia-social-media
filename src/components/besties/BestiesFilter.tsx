
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const BestiesFilter: React.FC = () => {
  const [filters, setFilters] = useState({
    countries: ["Germany", "Spain", "UK", "USA"],
    cities: ["Berlin", "Barcelona", "London", "New York"],
    interests: ["Tech", "Art", "Music", "Food", "Travel", "Sports", "LGBTQ+"],
    moveInMonths: ["May", "June", "July", "August"],
    isGroupMode: false
  });
  
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 mb-4 animate-fade-in">
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-2">Location</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {filters.countries.map(country => (
            <Badge
              key={country}
              variant={selectedCountry === country ? "default" : "outline"}
              className="cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setSelectedCountry(selectedCountry === country ? null : country)}
            >
              {country}
            </Badge>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {filters.cities.map(city => (
            <Badge
              key={city}
              variant={selectedCity === city ? "default" : "outline"}
              className="cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setSelectedCity(selectedCity === city ? null : city)}
            >
              {city}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-2">Interests</h3>
        <div className="flex flex-wrap gap-2">
          {filters.interests.map(interest => (
            <Badge
              key={interest}
              variant={selectedInterests.includes(interest) ? "default" : "outline"}
              className="cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => toggleInterest(interest)}
            >
              {interest}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-2">Move-in Month</h3>
        <div className="flex flex-wrap gap-2">
          {filters.moveInMonths.map(month => (
            <Badge
              key={month}
              variant={selectedMonth === month ? "default" : "outline"}
              className="cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setSelectedMonth(selectedMonth === month ? null : month)}
            >
              {month}
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="flex items-center space-x-2 mb-4">
        <Switch 
          id="group-mode" 
          checked={filters.isGroupMode}
          onCheckedChange={(checked) => setFilters({...filters, isGroupMode: checked})}
        />
        <Label htmlFor="group-mode">Group Discovery Mode</Label>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={() => {
          setSelectedCountry(null);
          setSelectedCity(null);
          setSelectedInterests([]);
          setSelectedMonth(null);
          setFilters({...filters, isGroupMode: false});
        }}>
          Reset
        </Button>
        <Button size="sm" className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default BestiesFilter;
