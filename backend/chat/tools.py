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
def read_user_checklist(user_id: str) -> Dict[str, Any] | None:
    """Reads a user's personalized moving checklist from Supabase.
    Fetches the most recently updated checklist if multiple were to exist for the same user.
    Args:
        user_id: Identifier for the user.
    Returns:
        The checklist data as a dictionary (JSONB) if found, otherwise None. 
        Returns a dictionary with an 'error' key if an error occurs.
    """
    print(f"[ChecklistTool] Attempting to read checklist for user_id: {user_id}")
    try:
        response = (
            supabase_client.table("user_checklists")
            .select("checklist_data, updated_at")  # Select updated_at for ordering
            .eq("user_id", user_id)
            .order("updated_at", desc=True)  # Order by most recent
            .limit(1)
            .execute()
        )
        print(f"[ChecklistTool] Raw response from Supabase: {type(response)}")

        if response is None:
            print("[ChecklistTool] Supabase client returned a None response object.")
            return {"error": "Error reading checklist: Supabase client returned an unexpected None response."}

        if hasattr(response, 'error') and response.error:
            print(f"[ChecklistTool] Supabase response error: {response.error}")
            return {"error": f"Error reading checklist for user {user_id}: {response.error.message if hasattr(response.error, 'message') else response.error}"}
        
        if hasattr(response, 'data'):
            if response.data is None: # Should not happen if hasattr is true, but defensive
                print("[ChecklistTool] Response has 'data' attribute but it is None.")
                return None # No record found
            if isinstance(response.data, list) and len(response.data) > 0:
                # Log the entire record found, including its updated_at timestamp
                print(f"[ChecklistTool] Checklist record found: {response.data[0]}") 
                return response.data[0].get("checklist_data") 
            elif isinstance(response.data, list) and len(response.data) == 0:
                print("[ChecklistTool] No checklist found for user (empty data list).")
                return None # No record found
            else:
                # This case handles if response.data is not a list or is an unexpected structure
                print(f"[ChecklistTool] Unexpected data format in response: {response.data}")
                return {"error": f"Error reading checklist: Unexpected data format from Supabase: {type(response.data)}"}
        else:
            print("[ChecklistTool] Supabase response object missing 'data' attribute despite no error.")
            return {"error": "Error reading checklist: Supabase response object missing 'data' attribute despite no error."}

    except Exception as e:
        print(f"[ChecklistTool] Exception during read_user_checklist: {e}")
        return {"error": f"An unexpected error occurred in read_user_checklist: {e}"}

@tool("write_user_checklist", args_schema=WriteChecklistInput)
def write_user_checklist(user_id: str, checklist_data: Dict[str, Any]) -> str:
    """Writes or overwrites a user's personalized moving checklist in Supabase.
    Args:
        user_id: Identifier for the user.
        checklist_data: The checklist data in JSON format. Should include a 'title' field.
    Returns:
        A string indicating success or an error message.
    """
    print(f"[ChecklistTool] Attempting to write checklist for user_id: {user_id} with data: {checklist_data}")
    try:
        # Extract title from checklist_data. Agent prompt now instructs to include it here.
        # Provide a default title if not found, or make it strictly required.
        title = checklist_data.pop("title", None)
        if title is None:
            # Fallback title, or could return an error if title is absolutely mandatory from LLM
            title = f"Checklist for {user_id}"
            print(f"[ChecklistTool] Warning: 'title' not found in checklist_data. Using default: '{title}'")

        # Optional: Extract description if you plan to use it
        # description = checklist_data.pop("description", None)

        # The remaining items in checklist_data are for the JSONB field.
        # Ensure checklist_data is not None if all known keys were popped and it was otherwise empty.
        actual_checklist_json_data = checklist_data if checklist_data else {}

        upsert_payload = {
            "user_id": user_id,
            "title": title,
            # "description": description, # Add if you implement description
            "checklist_data": actual_checklist_json_data
        }
        
        # Remove keys with None values if their DB columns are NOT nullable and don't have defaults
        # For example, if description was optional:
        # if description is None:
        #     upsert_payload.pop("description", None)

        print(f"[ChecklistTool] Upserting payload to Supabase: {upsert_payload}")

        response = (
            supabase_client.table("user_checklists")
            .upsert(upsert_payload, on_conflict="user_id")
            .execute()
        )

        if hasattr(response, 'error') and response.error:
            error_message = response.error.message if hasattr(response.error, 'message') else str(response.error)
            print(f"[ChecklistTool] Supabase error writing checklist: {error_message} (Code: {response.error.code if hasattr(response.error, 'code') else 'N/A'})")
            return f"Error writing checklist for user {user_id}: {error_message}"
        elif hasattr(response, 'data') and response.data and len(response.data) > 0:
            print(f"[ChecklistTool] Checklist successfully written for user {user_id}. Response data: {response.data}")
            return f"Checklist successfully written for user {user_id}."
        elif not (hasattr(response, 'error') and response.error):
            print(f"[ChecklistTool] Checklist write operation completed for user {user_id} (no error, no data returned by upsert).")
            return f"Checklist write operation completed for user {user_id} (data may or may not be returned by upsert)."
        else:
            print(f"[ChecklistTool] Failed to write checklist for user {user_id} due to an unknown Supabase response issue.")
            return f"Failed to write checklist for user {user_id} due to an unknown issue with Supabase response."

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