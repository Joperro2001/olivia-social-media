# This file will contain the LangChain agent logic.
# Tools are defined in tools.py
import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI # For summarization LLM
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import AgentExecutor, create_openai_tools_agent
import json

# Import tools from tools.py
from .tools import (
    read_conversation_history,
    write_conversation_summary,
    write_conversation_message, # Now active for the test loop
    read_user_checklist,
    write_user_checklist,
    delete_user_checklist # Added for test setup
)

# Load environment variables from .env file (for OPENAI_API_KEY)
load_dotenv()

# --- Configuration for Summarization & Agent Context ---
# Max raw messages the MAIN AGENT sees in its direct context (newer than the latest summary)
MAIN_AGENT_MAX_RAW_MESSAGES = 30
# Number of oldest raw messages (from the post-summary pool) to fold into the summary during maintenance
SUMMARIZE_BATCH_SIZE = 10 
SUMMARIZATION_LLM_MODEL = "gpt-4o-mini"

# Initialize the LLM for summarization
# Ensure OPENAI_API_KEY is set in your environment or .env file
summarizer_llm = ChatOpenAI(
    model=SUMMARIZATION_LLM_MODEL,
    temperature=0.3, # Low temperature for more factual and concise summaries
)

# --- Configuration for Main Agent ---
MAIN_LLM_MODEL = "gpt-4o"
INITIAL_SYSTEM_PROMPT = """You are Olivia, a friendly and helpful AI assistant. Your primary goal is to assist users with questions and tasks related to relocating for an exchange semester or moving to a new city.

The user you are currently assisting has the ID: {user_id}
When you use any tool that requires a user_id, you MUST use this exact ID.

The user's current checklist (if one exists) is provided below in the conversation context. Review it to understand what tasks are already noted.

You have access to the following tools:
- `write_user_checklist`: Use this tool to create a new checklist or update an existing checklist for the user. The `user_id` parameter for this tool MUST be {user_id}.
- `delete_user_checklist`: Use this tool to completely delete a user's checklist. The `user_id` parameter for this tool MUST be {user_id}. It's a good idea to confirm with the user before deleting their entire checklist.

When a user asks you to add, remove, or update items on a checklist, you should use the `write_user_checklist` tool.
If a user explicitly asks you to delete their entire checklist, you should use the `delete_user_checklist` tool after confirming with them.
If you need to ask clarifying questions before writing to a checklist, do so.
When writing a checklist, ensure you have gathered all necessary information (e.g., for a new item, what the item is; for updating, what the old and new states are).
The `write_user_checklist` tool expects the entire checklist data as a JSON object. If you are adding to an existing checklist, use the provided current checklist data, update its JSON structure, and then write the entire new JSON. If no checklist currently exists, create a new JSON structure.
Ensure the `checklist_data` includes a 'title' field for the checklist (e.g., {{'title': 'Berlin Move Checklist', 'tasks': ['task1']}}) and other relevant fields for the checklist items themselves within the `checklist_data` JSON object.
"""

# Initialize the main LLM for Olivia's responses
main_llm = ChatOpenAI(
    model=MAIN_LLM_MODEL,
    temperature=0.6 # Standard temperature for creative and helpful responses
)

def format_messages_for_prompt(messages: list) -> str:
    """Helper function to format a list of message dicts into a string for the prompt."""
    if not messages:
        return "No messages to format."
    return "\n".join([f"{msg.get('message_type', 'unknown').capitalize()}: {msg.get('content', '')}" for msg in messages])

def maintain_conversation_summary(user_id: str):
    """
    Maintains a rolling summary of the conversation based on the new logic.
    If the number of raw messages newer than the current summary exceeds MAIN_AGENT_MAX_RAW_MESSAGES,
    the oldest SUMMARIZE_BATCH_SIZE of these messages are folded into the summary.
    """
    print(f"[SummaryManager] Checking summary for user_id: {user_id}")

    # 1. Get the current state of history (latest summary and post-summary raw messages)
    #    We use a slightly larger limit here to ensure we see all messages that might need to be summarized.
    #    The read_conversation_history tool itself will cap at its internal default if we ask for too many for the agent view.
    #    This call is specifically to assess summarization needs.
    history_for_summarizer = read_conversation_history.invoke({
        "user_id": user_id,
        "max_messages": MAIN_AGENT_MAX_RAW_MESSAGES + SUMMARIZE_BATCH_SIZE + 5 # e.g., 30 + 10 + 5 = 45
    })

    if history_for_summarizer.get("error"):
        print(f"[SummaryManager] Error fetching history for summarization: {history_for_summarizer.get('error')}")
        return

    current_summary_content = history_for_summarizer.get("summary") # This can be None if no summary exists
    # These are messages newer than the current_summary_content (or all if no summary)
    post_summary_raw_messages = history_for_summarizer.get("messages", [])
    
    print(f"[SummaryManager] Fetched {len(post_summary_raw_messages)} post-summary raw messages for check.")
    if current_summary_content:
        print(f"[SummaryManager] Current summary (first 100 chars): '{current_summary_content[:100]}...'")
    else:
        print("[SummaryManager] No current summary found.")

    # 2. Check if summarization is needed
    # If the number of raw messages that are newer than the current summary 
    # is greater than what the main agent is allowed to see directly.
    if len(post_summary_raw_messages) > MAIN_AGENT_MAX_RAW_MESSAGES:
        print(f"[SummaryManager] Summarization needed for {user_id}. ({len(post_summary_raw_messages)} post-summary messages > {MAIN_AGENT_MAX_RAW_MESSAGES} limit)")
        
        # 3. Determine messages to fold into the summary
        # These are the oldest messages from the post_summary_raw_messages list
        messages_to_fold_in = post_summary_raw_messages[:SUMMARIZE_BATCH_SIZE]
        
        if not messages_to_fold_in:
            print("[SummaryManager] No messages to process for folding, though condition met. Skipping.")
            return

        formatted_msgs_to_fold = format_messages_for_prompt(messages_to_fold_in)
        
        # Effective current summary for the prompt (handles if it's the very first summary)
        summary_for_prompt = current_summary_content if current_summary_content else "This is the beginning of the conversation."

        prompt_text = f"""
Your task is to update an existing conversation summary by integrating new messages. 
Focus on extracting key information, decisions, and important topics discussed in the new messages and seamlessly incorporate them into the existing summary. 
If the existing summary is 'This is the beginning of the conversation.', create a new concise summary based on the new messages. 
Maintain a coherent and concise narrative. Output only the updated summary content.

Existing Summary:
---
{summary_for_prompt}
---

New Message(s) to Integrate:
---
{formatted_msgs_to_fold}
---

Updated Summary:
"""
        try:
            print(f"[SummaryManager] Invoking LLM ({SUMMARIZATION_LLM_MODEL}) for summarization with {len(messages_to_fold_in)} messages...")
            llm_response = summarizer_llm.invoke(prompt_text)
            new_updated_summary = llm_response.content
            print(f"[SummaryManager] LLM generated new summary (length: {len(new_updated_summary)}).")
            
            write_summary_result = write_conversation_summary.invoke({
                "user_id": user_id,
                "summary_content": new_updated_summary
            })
            # The write_conversation_summary tool returns a string
            if "Error" in write_summary_result or "Failed" in write_summary_result:
                 print(f"[SummaryManager] Error writing new summary for {user_id}: {write_summary_result}")
            else:
                print(f"[SummaryManager] Successfully wrote new summary for {user_id}.")

        except Exception as e:
            print(f"[SummaryManager] Error during LLM summarization or writing summary: {e}")
    else:
        print(f"[SummaryManager] No summarization needed for {user_id}. ({len(post_summary_raw_messages)} post-summary messages <= {MAIN_AGENT_MAX_RAW_MESSAGES} limit)")

def invoke_agent_turn(user_id: str, session_id: str, user_message_content: str) -> str:
    """
    Orchestrates a single turn of the conversation with Olivia.
    1. Saves the user message.
    2. Retrieves history (summary + recent messages).
    3. Retrieves current checklist for the user.
    4. Initializes an agent with the 'write_user_checklist' tool.
    5. Invokes the agent to get Olivia's response (which might involve tool use).
    6. Saves Olivia's response to history.
    7. Triggers summary maintenance.
    Returns Olivia's response content as a string.
    """
    print(f"\n--- Invoking Agent Turn for user: {user_id}, session: {session_id} ---")
    print(f"User Message: {user_message_content}")

    # 1. Save user message to history BEFORE calling LLM
    write_user_msg_result = write_conversation_message.invoke({
        "user_id": user_id, "session_id": session_id,
        "message_type": "human", "content": user_message_content
    })
    print(f"[DB Write] User message saved: {write_user_msg_result}")
    if isinstance(write_user_msg_result, str) and (write_user_msg_result.startswith("Error") or write_user_msg_result.startswith("Failed") or write_user_msg_result.startswith("An unexpected error")):
        return f"Error saving user message: {write_user_msg_result}"

    # 2. Read conversation history (summary + recent messages for prompt)
    history_data = read_conversation_history.invoke({
        "user_id": user_id,
        "max_messages": MAIN_AGENT_MAX_RAW_MESSAGES
    })

    if history_data.get("error"):
        return f"Error fetching conversation history: {history_data.get('error')}"

    summary_content = history_data.get("summary", "No summary available yet.")
    recent_messages_dicts = history_data.get("messages", [])
    formatted_recent_messages_str = format_messages_for_prompt(recent_messages_dicts)

    # 3. Read user's current checklist
    print(f"[Checklist] Reading checklist for user_id: {user_id}")
    checklist_data_result = read_user_checklist.invoke({"user_id": user_id})
    
    current_checklist_content = "No checklist found for the user." # Default
    raw_checklist_for_prompt = None # Store the raw dict for prompt if needed

    if isinstance(checklist_data_result, dict) and checklist_data_result.get("error"):
        print(f"[Checklist] Error reading checklist: {checklist_data_result.get('error')}")
        # current_checklist_content remains default
    elif checklist_data_result is None:
        print(f"[Checklist] No checklist found for user {user_id} (tool returned None).")
        # current_checklist_content remains default
    elif isinstance(checklist_data_result, dict): # Checklist data is directly the dict from JSONB
        raw_checklist_for_prompt = checklist_data_result
        try:
            current_checklist_content = json.dumps(raw_checklist_for_prompt, indent=2)
            print(f"[Checklist] Successfully read checklist. Content (first 100 chars): {current_checklist_content[:100]}...")
        except TypeError as e:
            print(f"[Checklist] Error serializing checklist data to JSON: {e}. Data: {raw_checklist_for_prompt}")
            current_checklist_content = f"Error: Could not display checklist data due to formatting issue. Raw: {str(raw_checklist_for_prompt)[:200]}"
    else: # Should not happen if tool adheres to its return types (dict for data/error, or None)
        print(f"[Checklist] Unexpected data type from read_user_checklist: {type(checklist_data_result)}. Data: {checklist_data_result}")
        current_checklist_content = "Error: Received unexpected checklist data format from tool."

    # 4. Define tools and create the agent
    tools_for_agent = [write_user_checklist, delete_user_checklist] # Agent can write or delete

    agent_prompt = ChatPromptTemplate.from_messages([
        ("system", INITIAL_SYSTEM_PROMPT + 
         "\n\nConversation Summary:\n{summary_content}" +
         "\n\nRecent Messages (excluding current user input):\n{recent_messages_formatted}" +
         "\n\nUser's Current Checklist:\n{current_checklist_formatted}"),
        MessagesPlaceholder(variable_name="chat_history", optional=True),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])
    
    agent = create_openai_tools_agent(main_llm, tools_for_agent, agent_prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools_for_agent, verbose=True, handle_parsing_errors=True) # Added handle_parsing_errors

    print(f"[Agent Call] Invoking agent with tool '{tools_for_agent[0].name}' ({MAIN_LLM_MODEL})...")
    try:
        response = agent_executor.invoke({
            "input": user_message_content,
            "summary_content": summary_content,
            "recent_messages_formatted": formatted_recent_messages_str,
            "current_checklist_formatted": current_checklist_content,
            "user_id": user_id,  # Pass user_id here so it can be used in the formatted prompt
            "chat_history": [] 
        })
        ai_response_content = response.get("output")
        if ai_response_content is None:
            ai_response_content = "I'm sorry, I wasn't able to generate a response. (Agent output was None)"
            print("[Agent Call] Agent returned None for 'output'.")
        print(f"[Agent Call] Received response from agent: {str(ai_response_content)[:100]}...")
    except Exception as e:
        error_message = f"Sorry, I encountered an error trying to generate a response: {e}"
        print(f"[Agent Call] Error invoking agent: {e}")
        # Check if the error is a parsing error that handle_parsing_errors might have tried to address
        if "Could not parse LLM output" in str(e) or "ActionParser" in str(e):
            ai_response_content = "I had a little trouble processing that request. Could you try rephrasing it?"
        else:
            ai_response_content = error_message
        # Still return the ai_response_content which is now an error message

    # 5. Save AI response to history
    write_ai_msg_result = write_conversation_message.invoke({
        "user_id": user_id, "session_id": session_id,
        "message_type": "ai", "content": str(ai_response_content) # Ensure content is string
    })
    print(f"[DB Write] AI message saved: {write_ai_msg_result}")
    if isinstance(write_ai_msg_result, str) and (write_ai_msg_result.startswith("Error") or write_ai_msg_result.startswith("Failed") or write_ai_msg_result.startswith("An unexpected error")):
        print(f"Warning: Error saving AI message: {write_ai_msg_result}")

    # 6. Trigger summary maintenance
    maintain_conversation_summary(user_id)
    
    print(f"--- Agent Turn Ended for user: {user_id} ---")
    return str(ai_response_content) # Ensure return is string

def run_test_conversation_flow(user_id: str, session_id: str, turns: list):
    """Simulates a conversation, writes messages to DB, and calls summary maintenance."""
    print(f"\n--- Starting Test Conversation Flow for user: {user_id}, session: {session_id} ---")
    for i, user_turn_content in enumerate(turns):
        print(f"\n[Turn {i+1}] User: {user_turn_content}")
        
        # 1. Save user message
        write_msg_result = write_conversation_message.invoke({
            "user_id": user_id, "session_id": session_id,
            "message_type": "human", "content": user_turn_content
        })
        print(f"[DB Write] Human message saved: {write_msg_result}")

        # 2. Simulate AI response
        # For a real agent, this would involve an LLM call with history.
        ai_response_content = f"Olivia's simulated response to: '{user_turn_content[:50]}...'"
        print(f"[Turn {i+1}] Olivia: {ai_response_content}")

        # 3. Save AI message
        write_msg_result = write_conversation_message.invoke({
            "user_id": user_id, "session_id": session_id,
            "message_type": "ai", "content": ai_response_content
        })
        print(f"[DB Write] AI message saved: {write_msg_result}")
        
        # 4. Maintain summary after each AI response (i.e., after a full turn)
        maintain_conversation_summary(user_id)
    
    print(f"\n--- Test Conversation Flow Ended for user: {user_id} ---")

if __name__ == '__main__':
    print("Agent.py - Main test execution block")
    
    # ----- Test Phase 1: Summarization Logic (using existing user) -----
    # This part remains to ensure summarization continues to work with the agent structure.
    print("\n===== Phase 1: Testing Summarization with Agent Turns =====")
    test_summary_user_id = "summary_agent_test_user_001"
    test_summary_session_id = "session_summary_agent_001"

    initial_turns_for_summary = [
        "Hello Olivia, I'm starting to plan an exchange.",
        "I need to decide on a city first.",
        "My main options are European capitals.",
        "I'm looking for a vibrant student life.",
        "Good public transport is also important.",
        "Cost of living is a factor, but not the primary one.",
        "I study computer science.",
        "Any recommendations for tech hubs in Europe?",
        "What about visa processes for a non-EU citizen?",
        "How early should I start applying for accommodation?", 
        "Tell me about popular neighborhoods in Berlin.",
        "What's the student discount like for public transport there?",
        "Are there many international students in Amsterdam?",
        "Is it easy to find part-time jobs for students in Paris?",
        "What are some cultural etiquette tips for Germany?",
        "This is the sixteenth message. This should trigger summarization based on config."
    ]

    print(f"[Setup Phase 1] Will use user_id: {test_summary_user_id}")
    # For consistent testing, you might clear this user's history in Supabase manually if needed.

    for i, content in enumerate(initial_turns_for_summary):
        print(f"\n[Phase 1 - Turn {i+1}/{len(initial_turns_for_summary)}] User: {content}")
        ai_response = invoke_agent_turn(test_summary_user_id, test_summary_session_id, content)
        print(f"[Phase 1 - Turn {i+1}] Olivia: {ai_response[:150].replace('\n', ' ')}...")
        if "Error" in ai_response or "Failed" in ai_response:
            print(f"Stopping Phase 1 due to error: {ai_response}")
            exit()
    print("\n--- Phase 1 (Summarization Test) Ended ---")

    # ----- Test Phase 2: Checklist and Relocation Knowledge Testing ----- 
    print("\n\n===== Phase 2: Testing Checklist Functionality and Relocation Knowledge =====")
    test_agent_user_id = "agent_checklist_test_user_003" # New user ID for fresh test
    test_agent_session_id = "session_checklist_003"

    print(f"[Setup Phase 2] Using user_id: {test_agent_user_id}. Ensuring no pre-existing checklist.")
    # Clear any pre-existing checklist for this user to ensure a clean test slate
    delete_result = delete_user_checklist.invoke({"user_id": test_agent_user_id})
    print(f"[Setup Phase 2] Delete checklist result for {test_agent_user_id}: {delete_result}")

    checklist_test_queries = [
        # 1. Create a new checklist with initial items
        {"id": "CHK_CREATE_1", "type": "Checklist Creation", "query": "Hey Olivia, I'm planning a trip to Tokyo. Can you help me start a checklist? Add 'Book flights' and 'Reserve hotel' to it."},
        # 2. Read the checklist to verify creation
        {"id": "CHK_READ_1", "type": "Checklist Read", "query": "What's on my Tokyo trip checklist right now?"},
        # 3. Add more items to the existing checklist
        {"id": "CHK_UPDATE_1", "type": "Checklist Update - Add", "query": "Okay, please add 'Plan daily itinerary' and 'Buy travel insurance' to my Tokyo checklist."},
        # 4. Read again to verify additions
        {"id": "CHK_READ_2", "type": "Checklist Read", "query": "Show me the updated Tokyo checklist."},
        # 5. Ask a question that implies using checklist context (no direct modification)
        {"id": "CHK_CONTEXT_USE_1", "type": "Checklist Context Use", "query": "Regarding my Tokyo trip, what's the most urgent item I haven't done yet, assuming I've booked flights but not the hotel?"},
        # 6. Add another item
        {"id": "CHK_UPDATE_2", "type": "Checklist Update - Add", "query": "Add 'Learn basic Japanese phrases' to the list."},
        # 7. Read one last time
        {"id": "CHK_READ_3", "type": "Checklist Read", "query": "What does the final Tokyo checklist look like?"},

        # New tests for deletion by agent
        {"id": "CHK_DELETE_REQUEST_1", "type": "Checklist Deletion Request", "query": "Actually, I don't need the Tokyo checklist anymore. Can you please delete it for me?"},
        # Olivia should ask for confirmation here.
        
        {"id": "CHK_DELETE_CONFIRM_1", "type": "Checklist Deletion Confirmation", "query": "Yes, please go ahead and delete it."},
        # Olivia should now call delete_user_checklist and respond.

        {"id": "CHK_READ_AFTER_AGENT_DELETE_1", "type": "Checklist Read (After Agent Delete)", "query": "Just to be sure, is my Tokyo checklist gone now?"},

        # Existing test where WE programmatically delete, re-labeling for clarity
        {"id": "CHK_PROGRAMMATIC_DELETE_THEN_READ", "type": "Checklist Read (After Programmatic Delete)", "query": "What was on my Tokyo checklist again?"}, # This query will be preceded by a programmatic delete
        {"id": "CHK_CREATE_AFTER_PROGRAMMATIC_DELETE", "type": "Checklist Creation (After Programmatic Delete)", "query": "Actually, let's start a new checklist for a weekend trip to the mountains. Add 'Pack hiking boots'."}
    ]

    for i, test_case in enumerate(checklist_test_queries):
        print(f"\n[Phase 2 - Test {test_case['id']} ({test_case['type']}) - Turn {i+1}/{len(checklist_test_queries)}]")
        print(f"User: {test_case['query']}")
        
        # Special handling for simulating programmatic deletion between tests
        if test_case['id'] == "CHK_PROGRAMMATIC_DELETE_THEN_READ":
            print(f"\n[Phase 2 - INTERMEDIATE STEP] Programmatically deleting checklist for {test_agent_user_id} before next query...")
            delete_result = delete_user_checklist.invoke({"user_id": test_agent_user_id})
            print(f"[Phase 2 - INTERMEDIATE STEP] Delete checklist result: {delete_result}")
            # Brief pause to ensure DB operation completes if needed, though usually fast
            # import time
            # time.sleep(0.5) 
            print("\n")


        ai_response = invoke_agent_turn(test_agent_user_id, test_agent_session_id, test_case['query'])
        print(f"Olivia: {ai_response.replace('\n', ' ')[:500]}...")
        if "Error saving" in ai_response or "Error fetching" in ai_response or (isinstance(ai_response, str) and ai_response.startswith("Sorry, I encountered an error")):
            print(f"Test {test_case['id']} encountered an error, stopping Phase 2: {ai_response}")
            # exit() # Decide if to exit or continue

    print("\n--- Phase 2 (Checklist Functionality Test) Ended ---")

    # ----- Relocation Knowledge/General Conversation Test (Simplified) -----
    print("\n\n===== Phase 2b: Relocation Knowledge & General Conversation =====")
    # Using a different user ID to not interfere with checklist state from above if tests are re-run partially
    knowledge_user_id = "agent_knowledge_test_001"
    knowledge_session_id = "session_knowledge_001"
    
    print(f"[Setup Phase 2b] Using user_id: {knowledge_user_id}. Ensuring no pre-existing checklist.")
    delete_result = delete_user_checklist.invoke({"user_id": knowledge_user_id})
    print(f"[Setup Phase 2b] Delete checklist result for {knowledge_user_id}: {delete_result}")

    knowledge_queries = [
        {"id": "KNW_RELOC_1", "type": "Relocation Bureaucracy", "query": "I'm an international student planning to move to Berlin. What are the top 3 most important bureaucratic steps I need to take after arriving?"},
        {"id": "KNW_ADVICE_1", "type": "Relocation Advice", "query": "What's the best way to find student accommodation in a competitive city like Amsterdam?"},
        {"id": "GEN_CONVO_1", "type": "General Question", "query": "Hi Olivia, can you tell me a fun fact about Germany?"}
    ]

    for i, test_case in enumerate(knowledge_queries):
        print(f"\n[Phase 2b - Test {test_case['id']} ({test_case['type']}) - Turn {i+1}/{len(knowledge_queries)}]")
        print(f"User: {test_case['query']}")
        ai_response = invoke_agent_turn(knowledge_user_id, knowledge_session_id, test_case['query'])
        print(f"Olivia: {ai_response.replace('\n', ' ')[:500]}...")
        if "Error saving" in ai_response or "Error fetching" in ai_response or (isinstance(ai_response, str) and ai_response.startswith("Sorry, I encountered an error")):
            print(f"Test {test_case['id']} encountered an error, stopping Phase 2b: {ai_response}")
            # exit()

    print("\n--- Phase 2b (Knowledge & General Convo Test) Ended ---")

    # ----- Final History Check (Optional) -----
    # You can add a final read_conversation_history call here for test_agent_user_id 
    # to see the full conversation including tool use, if desired.
    print(f"\n[Final Check] Fetching agent context for {test_agent_user_id} after Phase 2 tests...")
    final_history_for_agent = read_conversation_history.invoke({
       "user_id": test_agent_user_id,
       "max_messages": MAIN_AGENT_MAX_RAW_MESSAGES, 
    })
    final_agent_summary = final_history_for_agent.get("summary")
    final_agent_raw_messages = final_history_for_agent.get("messages", [])
    
    print(f"Final Agent Summary for {test_agent_user_id}: {final_agent_summary}")
    if final_agent_raw_messages:
        print(f"Final Agent Raw Messages ({len(final_agent_raw_messages)} for {test_agent_user_id}):")
        for msg in final_agent_raw_messages:
            print(f"  - [{msg.get('timestamp','N/A')}] {msg.get('message_type')}: {msg.get('content','N/A')[:100].replace('\n',' ')}...")
    else:
        print(f"No raw messages found for {test_agent_user_id} in final check.")

    print("\nAgent.py - Test execution finished.")
    pass
