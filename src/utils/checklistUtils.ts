
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useCallback } from "react";

// Define interfaces for our checklist data
export interface ChecklistItem {
  id: string;
  checklist_id: string;
  category: string;
  item_text: string;
  is_checked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Checklist {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  purpose: string | null;
  duration: string | null;
  created_at: string;
  updated_at: string;
  items?: ChecklistItem[];
}

// Fetch a user's checklists
export async function fetchUserChecklists() {
  try {
    const { data, error } = await supabase
      .from("packing_checklists")
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

// Fetch a single checklist with its items
export async function fetchChecklistWithItems(checklistId: string) {
  try {
    // Fetch the checklist
    const { data: checklist, error: checklistError } = await supabase
      .from("packing_checklists")
      .select("*")
      .eq("id", checklistId)
      .single();

    if (checklistError) {
      console.error("Error fetching checklist:", checklistError);
      return null;
    }

    // Fetch the checklist items
    const { data: items, error: itemsError } = await supabase
      .from("checklist_items")
      .select("*")
      .eq("checklist_id", checklistId)
      .order("category", { ascending: true });

    if (itemsError) {
      console.error("Error fetching checklist items:", itemsError);
      return checklist;
    }

    return { ...checklist, items: items || [] };
  } catch (err) {
    console.error("Error in fetchChecklistWithItems:", err);
    return null;
  }
}

// Create a new checklist
export async function createChecklist(checklist: Omit<Checklist, "id" | "created_at" | "updated_at">) {
  try {
    const { data, error } = await supabase
      .from("packing_checklists")
      .insert(checklist)
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

// Add items to a checklist
export async function addChecklistItems(items: Omit<ChecklistItem, "id" | "created_at" | "updated_at">[]) {
  try {
    const { data, error } = await supabase
      .from("checklist_items")
      .insert(items)
      .select();

    if (error) {
      console.error("Error adding checklist items:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Error in addChecklistItems:", err);
    return null;
  }
}

// Update a checklist item
export async function updateChecklistItem(itemId: string, updates: Partial<ChecklistItem>) {
  try {
    const { data, error } = await supabase
      .from("checklist_items")
      .update(updates)
      .eq("id", itemId)
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
    // Delete all items first (cascade delete should handle this, but just to be sure)
    await supabase
      .from("checklist_items")
      .delete()
      .eq("checklist_id", checklistId);
      
    // Then delete the checklist
    const { error } = await supabase
      .from("packing_checklists")
      .delete()
      .eq("id", checklistId);

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
      // Create the checklist
      const checklist = await createChecklist({
        title: localChecklist.title || "My Moving Checklist",
        destination: localChecklist.destination || "New City",
        purpose: localChecklist.purpose || null,
        duration: localChecklist.duration || null,
        user_id: user.id // Add user_id to fix the TypeScript error
      });
      
      if (!checklist) return null;
      
      // Add the items
      if (localChecklist.items && localChecklist.items.length > 0) {
        const formattedItems = localChecklist.items.map((item: any) => ({
          checklist_id: checklist.id,
          category: item.category || "General",
          item_text: item.text,
          is_checked: item.checked || false
        }));
        
        await addChecklistItems(formattedItems);
      }
      
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
    fetchChecklistWithItems,
    createChecklist,
    addChecklistItems,
    updateChecklistItem,
    deleteChecklist,
    syncLocalChecklistToDatabase
  };
}
