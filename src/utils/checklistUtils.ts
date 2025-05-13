
import { supabase } from "@/integrations/supabase/client";
import { ChecklistItemData, UserChecklist } from '@/types/Chat';
import { useAuth } from "@/context/AuthContext";
import { useCallback } from "react";
import { parseJsonSafely } from "@/lib/utils";

// Helper function to convert database response to our app type
function convertDbResponseToUserChecklist(data: any): UserChecklist {
  return {
    user_id: data.user_id,
    checklist_data: {
      items: data.checklist_data?.items || []
    }
  };
}

// Fetch a user's checklists
export async function fetchUserChecklists(): Promise<UserChecklist[]> {
  try {
    const { data, error } = await supabase
      .from("user_checklists")
      .select("*");

    if (error) {
      console.error("Error fetching checklists:", error);
      return [];
    }

    // Convert the database response to our app type
    return (data || []).map(item => convertDbResponseToUserChecklist(item));
  } catch (err) {
    console.error("Error in fetchUserChecklists:", err);
    return [];
  }
}

// Fetch a single checklist for a user
export async function fetchChecklist(userId: string): Promise<UserChecklist | null> {
  try {
    const { data, error } = await supabase
      .from("user_checklists")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching checklist:", error);
      return null;
    }

    return convertDbResponseToUserChecklist(data);
  } catch (err) {
    console.error("Error in fetchChecklist:", err);
    return null;
  }
}

// Create a new checklist
export async function createChecklist(checklist: {
  items: ChecklistItemData[];
  user_id: string;
}): Promise<UserChecklist | null> {
  try {
    const { data, error } = await supabase
      .from("user_checklists")
      .insert({
        user_id: checklist.user_id,
        title: "Relocation Checklist", // Add required title field
        checklist_data: {
          items: checklist.items
        }
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating checklist:", error);
      return null;
    }

    return convertDbResponseToUserChecklist(data);
  } catch (err) {
    console.error("Error in createChecklist:", err);
    return null;
  }
}

// Update an existing checklist
export async function updateChecklist(userId: string, items: ChecklistItemData[]): Promise<UserChecklist | null> {
  try {
    const { data, error } = await supabase
      .from("user_checklists")
      .update({
        checklist_data: { 
          items: items 
        }
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating checklist:", error);
      return null;
    }

    return convertDbResponseToUserChecklist(data);
  } catch (err) {
    console.error("Error in updateChecklist:", err);
    return null;
  }
}

// Update a checklist item
export async function updateChecklistItem(
  userId: string, 
  itemId: string, 
  isChecked: boolean
): Promise<UserChecklist | null> {
  try {
    // Get current checklist
    const { data: checklist } = await supabase
      .from("user_checklists")
      .select("checklist_data")
      .eq("user_id", userId)
      .single();
    
    if (!checklist) {
      throw new Error("Checklist not found");
    }
    
    // Parse the checklist data safely, ensuring we have the expected structure
    const checklistData = parseJsonSafely<{items: ChecklistItemData[]}>(checklist.checklist_data);
    const items = checklistData.items || [];
    
    // Find and update the specific item
    const updatedItems = items.map((item: ChecklistItemData) => {
      if (item.id === itemId) {
        return { ...item, is_checked: isChecked };
      }
      return item;
    });
    
    // Update the checklist with the modified items
    const { data, error } = await supabase
      .from("user_checklists")
      .update({
        checklist_data: { 
          items: updatedItems 
        }
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating checklist item:", error);
      return null;
    }

    return convertDbResponseToUserChecklist(data);
  } catch (err) {
    console.error("Error in updateChecklistItem:", err);
    return null;
  }
}

// Delete a checklist
export async function deleteChecklist(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("user_checklists")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting checklist:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in deleteChecklist:", err);
    return false;
  }
}

// Save checklist to local storage (for when user is not logged in yet)
export function saveChecklistToLocalStorage(checklist: any) {
  localStorage.setItem("cityPackerData", JSON.stringify(checklist));
}

// Get checklist from local storage
export function getChecklistFromLocalStorage() {
  const data = localStorage.getItem("cityPackerData");
  return data ? JSON.parse(data) : null;
}

// Remove checklist from local storage
export function removeChecklistFromLocalStorage() {
  localStorage.removeItem("cityPackerData");
}

// Custom hook for working with checklists
export function useChecklist() {
  const { user } = useAuth();
  
  const syncLocalChecklistToDatabase = useCallback(async () => {
    if (!user) return null;
    
    const localChecklist = getChecklistFromLocalStorage();
    if (!localChecklist) return null;
    
    try {
      // Format the checklist items
      const items = localChecklist.items?.map((item: any) => ({
        id: crypto.randomUUID(),
        description: item.text,
        is_checked: item.checked || false,
        auto_checked: item.auto_checked || false,
        category: item.category || "General", 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })) || [];
      
      // Create the checklist
      const checklist = await createChecklist({
        items: items,
        user_id: user.id
      });
      
      if (!checklist) return null;
      
      // Clear local storage after successful sync
      removeChecklistFromLocalStorage();
      
      return checklist;
    } catch (err) {
      console.error("Error syncing local checklist to database:", err);
      return null;
    }
  }, [user]);
  
  return {
    fetchUserChecklists,
    fetchChecklist,
    createChecklist,
    updateChecklist,
    updateChecklistItem,
    deleteChecklist,
    syncLocalChecklistToDatabase
  };
}
