
export type Profile = {
  about_me: string;
  age: number;
  created_at: string;
  current_city: string;
  full_name: string;
  id: string;
  move_in_city: string;
  nationality: string;
  university: string;
  updated_at: string;
  avatar_url?: string;
  relocation_status?: "active" | "planning" | "paused" | "completed" | null;
  relocation_timeframe?: string | null;
  relocation_interests?: string[] | null;
  checklist_data?: {
    items: ChecklistItem[];
  };
  interests?: string[]; // Added the interests property
}; 

export type ChecklistItem = {
  id: string;
  description: string;
  is_checked: boolean;
  category?: string;
};
