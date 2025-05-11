
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [eventDate, setEventDate] = useState<Date>();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("Chill");
  
  const categories = ["Chill", "Explore", "Party", "Learn"];

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== "") {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get('title') as string;
    const location = formData.get('location') as string;
    
    if (!title || !location || !eventDate) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Event Created!",
      description: `Your event "${title}" has been created successfully.`,
    });
    
    navigate('/social');
  };

  return (
    <div className="flex flex-col h-[100vh] bg-[#FDF5EF] pb-16">
      <div className="flex items-center justify-between py-4 px-4 border-b">
        <h1 className="text-2xl font-bold">Create Event</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/social')}
          className="rounded-full"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="overflow-y-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Event Title *
            </label>
            <Input 
              id="title" 
              name="title" 
              placeholder="Give your event a catchy title" 
              required 
            />
          </div>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1">
              Event Date & Time *
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left",
                    !eventDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {eventDate ? format(eventDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={eventDate}
                  onSelect={setEventDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-1">
              Location *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                id="location" 
                name="location" 
                placeholder="Where will your event take place?" 
                className="pl-10" 
                required 
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="image" className="block text-sm font-medium mb-1">
              Image URL
            </label>
            <Input 
              id="image" 
              name="image" 
              placeholder="Add an image URL for your event" 
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
            {image && (
              <div className="mt-2 relative h-40 rounded-md overflow-hidden">
                <img 
                  src={image} 
                  alt="Event preview" 
                  className="w-full h-full object-cover"
                  onError={() => {
                    toast({
                      title: "Invalid image URL",
                      description: "Please provide a valid image URL",
                      variant: "destructive",
                    });
                    setImage("");
                  }}
                />
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="Describe your event" 
              className="min-h-[100px]" 
            />
          </div>
          
          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <div 
                  key={tag} 
                  className="bg-primary/20 text-primary px-3 py-1 rounded-full flex items-center text-sm"
                >
                  {tag}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveTag(tag)} 
                    className="ml-2"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <Input 
              id="tags"
              placeholder="Add tags (press Enter)" 
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  type="button"
                  variant={category === cat ? "default" : "outline"}
                  onClick={() => setCategory(cat)}
                  className="rounded-full"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
          
          <Button type="submit" className="mt-4">
            Create Event
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;
