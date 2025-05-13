
import { supabase } from "@/integrations/supabase/client";
import { UserChecklist, ChecklistItemData } from '@/types/Chat';
import { useAuth } from "@/context/AuthContext";
import { useCallback } from "react";

// Define interfaces for our checklist data based on the new schema
export interface ChecklistWithItems extends UserChecklist {}

// Fetch a user's checklists
export async function fetchUserChecklists() {
  try {
    const { data, error } = await supabase
      .from("user_checklists")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching checklists:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error in fetchUserChecklists:", err);
    return [];
  }
}

// Fetch a single checklist
export async function fetchChecklist(checklistId: string): Promise<UserChecklist | null> {
  try {
    const { data, error } = await supabase
      .from("user_checklists")
      .select("*")
      .eq("checklist_id", checklistId)
      .single();

    if (error) {
      console.error("Error fetching checklist:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Error in fetchChecklist:", err);
    return null;
  }
}

// Create a new checklist
export async function createChecklist(checklist: {
  title: string;
  description?: string;
  items: ChecklistItemData[];
  user_id: string;
}) {
  try {
    const { data, error } = await supabase
      .from("user_checklists")
      .insert({
        user_id: checklist.user_id,
        title: checklist.title,
        description: checklist.description || null,
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

    return data;
  } catch (err) {
    console.error("Error in createChecklist:", err);
    return null;
  }
}

// Update an existing checklist
export async function updateChecklist(checklistId: string, updates: {
  title?: string;
  description?: string;
  items?: ChecklistItemData[];
}) {
  try {
    // First get the current checklist to merge with updates
    const { data: currentChecklist } = await supabase
      .from("user_checklists")
      .select("checklist_data, title, description")
      .eq("checklist_id", checklistId)
      .single();
    
    if (!currentChecklist) {
      throw new Error("Checklist not found");
    }
    
    // Prepare updates
    const updatedData: any = {};
    
    if (updates.title) updatedData.title = updates.title;
    if (updates.description !== undefined) updatedData.description = updates.description;
    
    // If items are provided, update the checklist_data
    if (updates.items) {
      const typedChecklistData = currentChecklist.checklist_data as {
        items: ChecklistItemData[];
        original_id?: string;
        original_conversation_id?: string;
        created_at?: string;
      };
      
      updatedData.checklist_data = {
        ...typedChecklistData,
        items: updates.items
      };
    }
    
    // Apply the updates
    const { data, error } = await supabase
      .from("user_checklists")
      .update(updatedData)
      .eq("checklist_id", checklistId)
      .select()
      .single();

    if (error) {
      console.error("Error updating checklist:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Error in updateChecklist:", err);
    return null;
  }
}

// Update a checklist item
export async function updateChecklistItem(
  checklistId: string, 
  itemId: string, 
  isChecked: boolean
) {
  try {
    // Get current checklist
    const { data: checklist } = await supabase
      .from("user_checklists")
      .select("checklist_data")
      .eq("checklist_id", checklistId)
      .single();
    
    if (!checklist) {
      throw new Error("Checklist not found");
    }
    
    // Find and update the specific item
    const typedChecklistData = checklist.checklist_data as {
      items: ChecklistItemData[];
    };
    
    const items = typedChecklistData.items;
    const updatedItems = items.map(item => {
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
          ...typedChecklistData, 
          items: updatedItems 
        }
      })
      .eq("checklist_id", checklistId)
      .select()
      .single();

    if (error) {
      console.error("Error updating checklist item:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Error in updateChecklistItem:", err);
    return null;
  }
}

// Delete a checklist
export async function deleteChecklist(checklistId: string) {
  try {
    const { error } = await supabase
      .from("user_checklists")
      .delete()
      .eq("checklist_id", checklistId);

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

// Helper function to fetch checklist with items (for compatibility with old code)
export async function fetchChecklistWithItems(checklistId: string): Promise<UserChecklist | null> {
  return fetchChecklist(checklistId);
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })) || [];
      
      // Create the checklist
      const checklist = await createChecklist({
        title: localChecklist.title || "My Moving Checklist",
        description: `Destination: ${localChecklist.destination || "New Location"}${
          localChecklist.purpose ? `, Purpose: ${localChecklist.purpose}` : ""
        }${
          localChecklist.duration ? `, Duration: ${localChecklist.duration}` : ""
        }`,
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
