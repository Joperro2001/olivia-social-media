
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Json } from "@/integrations/supabase/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to safely parse JSON data from Supabase
export function parseJsonSafely<T>(jsonData: Json): T {
  if (typeof jsonData === 'string') {
    try {
      return JSON.parse(jsonData) as T;
    } catch (e) {
      console.error('Error parsing JSON:', e);
      return {} as T;
    }
  }
  return jsonData as T;
}
