from typing import Dict, Any
from langchain_core.tools import tool
import supabase
import os
from dotenv import load_dotenv

# Import Pydantic models from schemas.py
from .schemas import (
    WriteMessageInput, WriteSummaryInput, ReadHistoryInput,
    ReadChecklistInput, WriteChecklistInput, DeleteChecklistInput
)

# Load environment variables from .env file
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase URL and Key must be set in environment variables.")

supabase_client = supabase.create_client(SUPABASE_URL, SUPABASE_KEY)

# --- History Tool Functions ---

@tool("write_conversation_message", args_schema=WriteMessageInput)
def write_conversation_message(user_id: str, session_id: str, message_type: str, content: str) -> str:
    """Writes a new message (human or AI) to the conversation history in Supabase.
    Args:
        user_id: Identifier for the user.
        session_id: Identifier for the specific conversation session.
        message_type: Indicates if the message is from 'human' or 'ai'.
        content: The actual content of the message.
    Returns:
        A string indicating success with message ID or an error message.
    """
    try:
        insert_data = {
            "user_id": user_id,
            "session_id": session_id,
            "message_type": message_type,
            "content": content,
        }
        response = supabase_client.table("user_conversations").insert(insert_data).execute()

        if hasattr(response, 'error') and response.error:
            return f"Error writing message to Supabase: {response.error.message if hasattr(response.error, 'message') else response.error}"
        elif hasattr(response, 'data') and response.data and len(response.data) > 0:
            return f"Message written successfully. Message ID: {response.data[0]['message_id']}"
        elif not (hasattr(response, 'error') and response.error): # No error, but no data from insert
             return "Message write operation completed, but no data returned (may indicate success or no actual write)."
        else: # Should be caught by the first condition, but as a fallback
            return "Failed to write message due to an unknown issue with Supabase response."
    except Exception as e:
        return f"An unexpected error occurred in write_conversation_message: {e}"

@tool("write_conversation_summary", args_schema=WriteSummaryInput)
def write_conversation_summary(user_id: str, summary_content: str) -> str:
    """Writes/updates a conversation summary for a user in Supabase.
    The summary is stored as a special message type.
    Args:
        user_id: Identifier for the user.
        summary_content: The content of the summary to be written.
    Returns:
        A string indicating success or an error message.
    """
    try:
        insert_data = {
            "user_id": user_id,
            "session_id": f"summary_for_{user_id}",
            "message_type": "ai_summary",
            "content": summary_content,
            "summary_flag": True
        }
        response = supabase_client.table("user_conversations").insert(insert_data).execute()

        if hasattr(response, 'error') and response.error:
            return f"Error writing summary to Supabase: {response.error.message if hasattr(response.error, 'message') else response.error}"
        elif hasattr(response, 'data') and response.data and len(response.data) > 0:
            return f"Summary written successfully for user {user_id}."
        elif not (hasattr(response, 'error') and response.error): # No error, but no data from insert
            return "Summary write operation completed, but no data returned (may indicate success or no actual write)."
        else:
            return "Failed to write summary due to an unknown issue with Supabase response."
    except Exception as e:
        return f"An unexpected error occurred in write_conversation_summary: {e}"

@tool("read_conversation_history", args_schema=ReadHistoryInput)
def read_conversation_history(user_id: str, max_messages: int = 30) -> Dict[str, Any]:
    """Fetches the latest summary and up to 'max_messages' raw messages that are newer than that summary for a user.
    If no summary exists, fetches the 'max_messages' most recent raw messages.
    Args:
        user_id: Identifier for the user.
        max_messages: Maximum number of raw messages to retrieve (those newer than the summary, or most recent if no summary).
    Returns:
        A dictionary containing:
            - "summary" (str|None): The content of the latest summary, or None if not found.
            - "messages" (list): A list of raw message dictionaries.
            - "summary_timestamp" (str|None): The ISO timestamp of the latest summary, or None.
    """
    response_data: Dict[str, Any] = {"messages": [], "summary": None, "summary_timestamp": None}
    latest_summary_obj = None

    try:
        # 1. Fetch the latest summary object (content and timestamp)
        summary_query_response = (
            supabase_client.table("user_conversations")
            .select("content, timestamp")
            .eq("user_id", user_id)
            .eq("message_type", "ai_summary")
            .order("timestamp", desc=True)
            .limit(1)
            .execute()
        )

        if hasattr(summary_query_response, 'error') and summary_query_response.error:
            # Log a warning but don't make it a fatal error for fetching history
            print(f"[HistoryTool] Warning: Error fetching summary for user {user_id}: {summary_query_response.error.message if hasattr(summary_query_response.error, 'message') else summary_query_response.error}")
        elif not hasattr(summary_query_response, 'data'):
            print(f"[HistoryTool] Warning: Summary query response for user {user_id} missing 'data' attribute.")
        elif summary_query_response.data and len(summary_query_response.data) > 0:
            latest_summary_obj = summary_query_response.data[0]
            response_data["summary"] = latest_summary_obj['content']
            response_data["summary_timestamp"] = latest_summary_obj['timestamp']

        # 2. Fetch raw messages
        query = (
            supabase_client.table("user_conversations")
            .select("*")
            .eq("user_id", user_id)
            .neq("message_type", "ai_summary")
        )

        if latest_summary_obj and latest_summary_obj.get('timestamp'):
            query = query.gt("timestamp", latest_summary_obj['timestamp']) # Messages newer than the summary
        
        # Fetch potentially a bit more to sort then limit, ensuring we get the most recent ones correctly after filtering by timestamp
        # The limit should be applied *after* ordering if we want the most recent ones post-summary_timestamp.
        # Supabase order().limit() applies limit before order sometimes, so careful handling:
        # Fetch all post-summary messages, sort in Python, then take the last `max_messages`.
        # However, to avoid fetching too much, we can rely on a reasonable limit first.
        
        raw_messages_response = query.order("timestamp", desc=True).limit(max_messages).execute()

        if hasattr(raw_messages_response, 'error') and raw_messages_response.error:
            return {"error": f"Error reading raw messages: {raw_messages_response.error.message if hasattr(raw_messages_response.error, 'message') else raw_messages_response.error}"}
        elif not hasattr(raw_messages_response, 'data'):
            return {"error": "Error reading raw messages: Response object missing 'data'."}

        if raw_messages_response.data:
            # Data is fetched desc, so reverse to get chronological for the agent, then take the tail if needed (already limited)
            response_data["messages"] = sorted(raw_messages_response.data, key=lambda x: x['timestamp'])
        
        return response_data

    except Exception as e:
        return {"error": f"An unexpected error occurred in read_conversation_history: {e}"}


# --- Checklist Tool Functions ---

@tool("read_user_checklist", args_schema=ReadChecklistInput)
def read_user_checklist(user_id: str) -> Dict[str, Any]:
    """Reads a user's personalized moving checklist from Supabase.
    The checklist data is expected to be a JSON object like {"items": [...]}.
    Args:
        user_id: Identifier for the user.
    Returns:
        A dictionary containing checklist items (e.g., {"items": [...]}) if found.
        Returns {"items": []} if no checklist is found or if data is malformed.
        Returns a dictionary with an 'error' key if a Supabase error occurs.
    """
    print(f"[ChecklistTool] Attempting to read checklist for user_id: {user_id} (expecting {{'items': [...]}} format)")
    try:
        response = (
            supabase_client.table("user_checklists")
            .select("checklist_data, updated_at")
            .eq("user_id", user_id)
            .order("updated_at", desc=True)
            .limit(1)
            .execute()
        )
        # print(f"[ChecklistTool] Raw response from Supabase: {response}")

        if response is None: # Should not happen with supabase-py v1+
            print("[ChecklistTool] Supabase client returned a None response object unexpectedly.")
            return {"error": "Error reading checklist: Supabase client returned an unexpected None response."}

        if hasattr(response, 'error') and response.error:
            print(f"[ChecklistTool] Supabase response error: {response.error}")
            return {"error": f"Error reading checklist for user {user_id}: {response.error.message if hasattr(response.error, 'message') else response.error}"}
        
        if hasattr(response, 'data'):
            if response.data is None or (isinstance(response.data, list) and len(response.data) == 0):
                print("[ChecklistTool] No checklist found for user (empty data list or None). Returning {{'items': []}}.")
                return {"items": []} # No record found
            
            if isinstance(response.data, list) and len(response.data) > 0:
                db_record = response.data[0]
                checklist_data_from_db = db_record.get("checklist_data")
                print(f"[ChecklistTool] Checklist record found. Raw checklist_data from DB: {checklist_data_from_db}")
                
                if isinstance(checklist_data_from_db, dict) and "items" in checklist_data_from_db and isinstance(checklist_data_from_db["items"], list):
                    # Valid format found
                    return checklist_data_from_db
                elif checklist_data_from_db is None: # checklist_data field is NULL in DB
                    print("[ChecklistTool] checklist_data in DB is NULL. Returning {{'items': []}}.")
                    return {"items": []}
                else:
                    # Malformed checklist_data
                    print(f"[ChecklistTool] Warning: checklist_data from DB is malformed or not in {{'items': [...]}} format. Data: {checklist_data_from_db}. Returning {{'items': []}}.")
                    return {"items": []}
            else: # Should be caught by earlier checks, but as a safeguard
                print(f"[ChecklistTool] Unexpected response.data structure: {response.data}. Returning {{'items': []}}.")
                return {"items": []}
        else:
            # This case implies no error attribute, but also no data attribute.
            print("[ChecklistTool] Supabase response object missing 'data' attribute despite no error. Returning {{'error': ...}}.")
            return {"error": "Error reading checklist: Supabase response object missing 'data' attribute."}

    except Exception as e:
        print(f"[ChecklistTool] Exception during read_user_checklist: {e}")
        return {"error": f"An unexpected error occurred in read_user_checklist: {e}"}

@tool("write_user_checklist", args_schema=WriteChecklistInput)
def write_user_checklist(user_id: str, checklist_data: Dict[str, Any]) -> str:
    """Writes or overwrites a user's personalized moving checklist in Supabase.
    The checklist_data MUST be a dictionary of the format {"items": [list_of_item_objects]}.
    Each item_object in the list should contain its own 'category' field.
    Args:
        user_id: Identifier for the user.
        checklist_data: The checklist data in {"items": [...]} format.
    Returns:
        A string indicating success or an error message.
    """
    print(f"[ChecklistTool] Attempting to write checklist for user_id: {user_id} with data: {str(checklist_data)[:200]}...")
    
    if not isinstance(checklist_data, dict) or "items" not in checklist_data or not isinstance(checklist_data["items"], list):
        error_msg = f"Error: checklist_data must be a dictionary with an 'items' key containing a list. Received: {str(checklist_data)[:200]}"
        print(f"[ChecklistTool] {error_msg}")
        return error_msg

    # Validate items structure (basic check, LLM is primarily responsible for correct item fields)
    for item in checklist_data["items"]:
        if not isinstance(item, dict) or "description" not in item or "category" not in item:
            error_msg = f"Error: Each item in checklist_data['items'] must be a dictionary with at least 'description' and 'category'. Found: {str(item)[:100]}"
            print(f"[ChecklistTool] {error_msg}")
            return error_msg
            
    default_title = f"Relocation Checklist for {user_id}"
    # print(f"[ChecklistTool] Using default title: '{default_title}'") # Title is less prominent now

    try:
        upsert_payload = {
            "user_id": user_id,
            "title": default_title, 
            "checklist_data": checklist_data # Directly use the provided {"items": [...]} structure
        }
        
        print(f"[ChecklistTool] Upserting payload to Supabase: {str(upsert_payload)[:300]}...")

        response = (
            supabase_client.table("user_checklists")
            .upsert(upsert_payload, on_conflict="user_id")
            .execute()
        )

        if hasattr(response, 'error') and response.error:
            error_message = response.error.message if hasattr(response.error, 'message') else str(response.error)
            print(f"[ChecklistTool] Supabase error writing checklist: {error_message} (Code: {response.error.code if hasattr(response.error, 'code') else 'N/A'})")
            return f"Error writing checklist for user {user_id}: {error_message}"
        # Upsert in supabase-py v1+ returns a ModelResponse with data attribute that is a list of dicts
        elif hasattr(response, 'data') and isinstance(response.data, list): # Can be empty list if nothing was upserted but no error.
            # if len(response.data) > 0:
            #     print(f"[ChecklistTool] Checklist successfully written for user {user_id}. Response data: {response.data}")
            # else:
            #     print(f"[ChecklistTool] Checklist write operation completed for user {user_id} (no error, upsert may not have changed data or returned it).")
            return f"Checklist successfully written/updated for user {user_id}."
        else: # Should not happen if no error and data is not a list
            print(f"[ChecklistTool] Failed to write checklist for user {user_id} due to an unexpected Supabase response structure: {response}")
            return f"Failed to write checklist for user {user_id} due to an unknown issue with Supabase response structure."

    except Exception as e:
        print(f"[ChecklistTool] An unexpected error occurred in write_user_checklist: {e}")
        return f"An unexpected error occurred in write_user_checklist: {e}"

@tool("delete_user_checklist", args_schema=DeleteChecklistInput)
def delete_user_checklist(user_id: str) -> str:
    """Deletes a user's personalized moving checklist from Supabase.
    Args:
        user_id: Identifier for the user.
    Returns:
        A string indicating success or an error message.
    """
    try:
        response = (
            supabase_client.table("user_checklists")
            .delete()
            .eq("user_id", user_id)
            .execute()
        )
        
        if hasattr(response, 'error') and response.error:
            return f"Error deleting checklist for user {user_id}: {response.error.message if hasattr(response.error, 'message') else response.error}"

        # Check if any data was returned (delete often returns the deleted rows or count)
        # For supabase-python, successful delete of existing row returns data
        # If row doesn't exist, data might be empty but no error. 
        if hasattr(response, 'data') and response.data and len(response.data) > 0:
            return f"Checklist successfully deleted for user {user_id}."
        elif not (hasattr(response, 'error') and response.error): # No error, but no data means the checklist likely didn't exist
             return f"Checklist for user {user_id} not found or already deleted (operation successful)."
        else:
            return f"Failed to delete checklist for user {user_id} due to an unknown issue with Supabase response."
            
    except Exception as e:
        return f"An unexpected error occurred in delete_user_checklist: {e}"


# Example usage (for testing purposes)
if __name__ == '__main__':
    print("Testing history tools...")
    
    # Test write_conversation_message
    print("\nTesting write_conversation_message...")
    # result_msg = write_conversation_message.invoke({
    #     "user_id":"tool_test_user_01", 
    #     "session_id":"tool_test_session_01", 
    #     "message_type":"human", 
    #     "content":"Hello from tools.py!"
    # })
    # print(result_msg)
    # result_ai_msg = write_conversation_message.invoke({
    #     "user_id":"tool_test_user_01", 
    #     "session_id":"tool_test_session_01", 
    #     "message_type":"ai", 
    #     "content":"AI response from tools.py!"
    # })
    # print(result_ai_msg)

    # Test write_conversation_summary
    # print("\nTesting write_conversation_summary...")
    # summary_res = write_conversation_summary.invoke({
    #     "user_id":"tool_test_user_01", 
    #     "summary_content":"Tested message writing and AI response from tools.py."
    # })
    # print(summary_res)

    # Test read_conversation_history
    print("\nTesting read_conversation_history...")
    history = read_conversation_history.invoke({
        "user_id":"tool_test_user_01", 
        "max_messages":5, 
    })
    print("Retrieved history:")
    if history.get("error"):
        print(f"Error: {history.get('error')}")
    else:
        for msg in history.get("messages", []):
            print(f"  [{msg.get('timestamp', 'N/A')}] {msg.get('message_type', 'N/A')}: {msg.get('content', 'N/A')}")
        if history.get("summary"):
            print(f"  Latest Summary: {history.get('summary')}")
        elif True: # Assuming include_summary was true for the test
            print("  No summary found or an error occurred fetching it.")

    # print(f"Tool: {write_conversation_message.name}, ArgsSchema: {write_conversation_message.args_schema}, Description: {write_conversation_message.description}")
    # print(f"Tool: {write_conversation_summary.name}, ArgsSchema: {write_conversation_summary.args_schema}, Description: {write_conversation_summary.description}")
    # print(f"Tool: {read_conversation_history.name}, ArgsSchema: {read_conversation_history.args_schema}, Description: {read_conversation_history.description}")

    print("\nTesting checklist tools...")
    # Test write_user_checklist
    # print("\nTesting write_user_checklist...")
    # checklist_content = {"task1": "Book flights", "task2": "Find accommodation", "status": "pending"}
    # write_res = write_user_checklist.invoke({"user_id": "checklist_user_01", "checklist_data": checklist_content})
    # print(write_res)

    # # Test read_user_checklist
    # print("\nTesting read_user_checklist...")
    # read_res = read_user_checklist.invoke({"user_id": "checklist_user_01"})
    # if isinstance(read_res, dict) and read_res.get("error"):
    #     print(f"Error reading checklist: {read_res.get('error')}")
    # elif read_res is None:
    #     print("Checklist not found.")
    # else:
    #     print(f"Read checklist: {read_res}")

    # # Test read_user_checklist for non-existent user
    # print("\nTesting read_user_checklist for non-existent user...")
    # read_res_non = read_user_checklist.invoke({"user_id": "non_existent_user_99"})
    # if isinstance(read_res_non, dict) and read_res_non.get("error"):
    #     print(f"Error reading checklist: {read_res_non.get('error')}")
    # elif read_res_non is None:
    #     print("Checklist not found (as expected).")
    # else:
    #     print(f"Read checklist: {read_res_non}")

    # # Test delete_user_checklist
    # print("\nTesting delete_user_checklist...")
    # delete_res = delete_user_checklist.invoke({"user_id": "checklist_user_01"})
    # print(delete_res)

    # # Test delete_user_checklist for non-existent user
    # print("\nTesting delete_user_checklist for non-existent user...")
    # delete_res_non = delete_user_checklist.invoke({"user_id": "checklist_user_01_already_deleted"})
    # print(delete_res_non)

    pass 