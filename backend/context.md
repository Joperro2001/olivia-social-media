# Product Requirements Document: Olivia - Your Relocation Assistant

## 1. Introduction

Olivia is an AI-powered relocation assistant designed to help users navigate the complexities of choosing a new city for an exchange semester, moving to a new city, and settling in upon arrival. Olivia aims to provide personalized guidance, streamline the relocation process, and offer relevant information through a conversational interface.

## 2. Goals

*   Provide personalized recommendations for cities based on user preferences for exchange semesters.
*   Assist users with the practical aspects of moving to a new city (e.g., visas, housing, essential services).
*   Help users explore and integrate into their new city.
*   Maintain conversation history for seamless interaction across multiple sessions.
*   Offer a summarized view of past interactions.

## 3. Architecture & Technology Stack

*   **Core Framework:** LangChain (Python) - To build the conversational agent, manage prompts, chains, and tools.
*   **Language Model:** GPT-4o (for now) - For natural language understanding and generation.
*   **Database:** Supabase - To store user conversation history and personalized checklists.
*   **Deployment:** (To be decided - e.g. AWS, GCP for backend; Vercel/Lovable frontend for the existing UI). The backend will serve API endpoints for the UI.
*   **Backend API:** FastAPI - To wrap the LangChain agent and provide a stable API endpoint for the existing frontend under development.
*   **Development Practice:** Adhere to current LangChain versions and best practices, such as using the `@tool` decorator for creating tools and leveraging LangGraph for agent construction where appropriate.
*   **Code Structure (backend/chat/):**
    *   `agent.py`: Main LangChain agent logic.
    *   `tools.py`: Contains all LangChain tools (e.g., for Supabase interaction), using the `@tool` decorator. Supabase client is initialized here.
    *   `schemas.py`: Defines Pydantic models for tool input arguments.

**Architectural Decisions:**

*   **Modular Design:** LangChain facilitates a modular approach. Separate chains/agents can handle different aspects (city selection, moving logistics, exploration).
*   **Tool-Based Functionality:** Specific tasks like checklist management and history retrieval will be implemented as LangChain Tools, interacting with the Supabase database. These are created using the `@tool` decorator for individual functions.
*   **History Management:** Conversation history will be stored per user ID in a Supabase table. A mechanism will be implemented to retrieve and inject relevant history into the prompt context.
*   **Summarization:** A custom implementation in `agent.py` handles conversation summarization. It is triggered based on message count thresholds to condense the conversation history stored in Supabase. This summarized history is used in subsequent interactions to manage context window limitations.
*   **Database Schema:**
    *   `user_conversations`:
        *   `message_id` (UUID, primary key) - Unique identifier for each message.
        *   `user_id` (TEXT) - Identifier for the user. Should be indexed.
        *   `session_id` (TEXT) - Identifier for a specific conversation session. (Consider adding if distinct sessions per user need to be tracked independently of just timestamp ordering).
        *   `timestamp` (TIMESTAMPTZ) - Timestamp of when the message was created. (Note: Using TIMESTAMPTZ is recommended over TEXT for proper date/time handling and querying).
        *   `message_type` (TEXT) - Indicates if the message is from 'human' or 'ai'.
        *   `content` (TEXT) - The actual content of the message.
        *   `summary_flag` (BOOLEAN, default FALSE) - Indicates if this message or a block it belongs to has been summarized.
    *   `user_checklists`:
        *   `user_id` (TEXT, primary key) - Unique identifier for the user.
        *   `checklist_data` (JSONB) - Stores the user's personalized checklist data.

## 4. Core Features & Tools

### 4.1. Conversational Agent

The primary interface for users. It will leverage LangChain's agents or chains to handle user queries related to:
*   City selection for exchange (factors: cost of living, university reputation, visa ease, lifestyle).
*   Moving logistics.
*   City exploration (local tips, events, navigation).

### 4.2. Conversation History & Summarization

*   **History Storage:** All interactions (human messages, AI responses) will be logged in the `user_conversations` table in Supabase, linked by `user_id` and `session_id`.
*   **History Retrieval:** Before processing a new user message, the agent will retrieve the relevant recent history (and potentially the latest summary) from Supabase.
*   **Summarization Logic:**
    *   Implement a mechanism (e.g., using `LLMSummarizationChecker` or a custom chain) that monitors the token count of the stored history for a user/session.
    *   When a threshold is exceeded, the chain generates a concise summary of the older messages.
    *   The original messages might be flagged (`summary_flag`) or replaced/archived, and the summary stored.
*   **History Tool (`SupabaseHistoryTool` functions):**
    *   **Purpose:** Read and write conversation history from/to the `user_conversations` Supabase table.
    *   **Functionality (implemented as individual functions in `tools.py` using `@tool`):**
        *   `read_conversation_history(user_id, max_messages=20, include_summary=True)`: Fetches the most recent raw messages (up to `KEEP_RAW_RECENT_COUNT`) and the latest summary if available.
        *   `write_conversation_message(user_id, session_id, message_type, content)`: Writes a new message to the history. Robust error handling is implemented.
        *   `write_conversation_summary(user_id, summary_content)`: Writes/updates the summary for a user (as an `ai_summary` type message). Robust error handling is implemented.

### 4.3. Personalized Moving Checklist

*   **Checklist Generation:** Guide users through creating a personalized checklist for their specific move (destination city, nationality, purpose of move).
*   **Checklist Content:** Cover key areas:
    *   Visa/Immigration Requirements
    *   SIM Card & Mobile Plans
    *   Health Insurance Options
    *   Essential Local Apps (transport, food, banking)
    *   Housing Search Tips & Resources
    *   Packing Suggestions (based on climate, duration)
    *   Opening a Bank Account
    *   Registering with Local Authorities
*   **Personalization:** The agent will ask clarifying questions to tailor the checklist items.
*   **Persistence:** The checklist will be stored and retrieved from the `user_checklists` table in Supabase.
*   **Checklist Tool (`SupabaseChecklistTool` functions):**
    *   **Purpose:** Create, read, update, and delete personalized moving checklists stored in the `user_checklists` Supabase table.
    *   **Interaction Flow:**
        1.  User expresses need for moving help or checklist.
        2.  Agent confirms destination, nationality, etc.
        3.  Agent calls `read_checklist(user_id)` to see if one exists.
        4.  Agent engages in conversation to refine/build the checklist points.
        5.  Agent calls `write_checklist(user_id, checklist_data)` to save/update the checklist (represented as JSON).
    *   **Functionality (implemented as individual functions in `tools.py` using `@tool`):**
        *   `read_user_checklist(user_id)`: Retrieves the checklist JSON for the user. Returns `None` if not found. Robust error handling is implemented.
        *   `write_user_checklist(user_id, checklist_data)`: Creates or overwrites the checklist JSON for the user. Robust error handling is implemented.
        *   `delete_user_checklist(user_id)`: Removes the checklist for the user. Robust error handling is implemented.

## 5. Implementation Plan Checklist

1.  **[ ] Setup Project:** Initialize Python project, set up virtual environment, install LangChain, Supabase client, and other dependencies (`requirements.txt`).
2.  **[X] Setup Supabase:** Create Supabase project, define `user_conversations` and `user_checklists` tables with the specified schemas. Obtain API keys. (User confirmed done)
    *   A check constraint `user_conversations_message_type_check` was modified to allow `'ai_summary'` as a `message_type`.
3.  **[X] Implement `SupabaseHistoryTool` functions:** Create the LangChain tools to interact with the `user_conversations` table.
    *   Implemented as function-based tools (`write_conversation_message`, `write_conversation_summary`, `read_conversation_history`) in `backend/chat/tools.py` using LangChain's `@tool` decorator.
    *   Uses the `supabase-python` library for database interactions; client initialized in `tools.py`.
    *   Pydantic (v1) models for input argument schemas (e.g., `WriteMessageInput`) are defined in `backend/chat/schemas.py` and imported into `tools.py`.
    *   Connects to Supabase using URL and service key from environment variables loaded in `tools.py`.
    *   Robust error handling (checking for `error` attribute in Supabase responses) implemented for all tool functions.
4.  **[X] Implement `SupabaseChecklistTool` functions:** Create the LangChain tools to interact with the `user_checklists` table.
    *   Implemented as function-based tools (`read_user_checklist`, `write_user_checklist`, `delete_user_checklist`) in `backend/chat/tools.py` using LangChain's `@tool` decorator.
    *   These tools interact with the `user_checklists` table in Supabase (using `select`, `upsert`, `delete`).
    *   Pydantic (v1) models for input argument schemas (`ReadChecklistInput`, `WriteChecklistInput`, `DeleteChecklistInput`) are defined in `backend/chat/schemas.py`.
    *   Robust error handling implemented.
5.  **[X] Develop History Summarization Logic:** Implement the chain/mechanism for summarizing conversation history.
    *   Implemented in `backend/chat/agent.py` within the `maintain_conversation_summary(user_id)` function.
    *   Uses `langchain_openai.ChatOpenAI` with the model specified by `SUMMARIZATION_LLM_MODEL` ("gpt-4o-mini") to generate summaries.
    *   **Trigger:** Summarization occurs if the total count of raw (non-summary) messages for a user exceeds `KEEP_RAW_RECENT_COUNT` (currently 20).
    *   **Process:** When triggered, it takes the oldest `MESSAGES_TO_FOLD_INTO_SUMMARY_BATCH` (currently 1) raw message(s), combines them with the latest existing summary (if any), and prompts the LLM to create an updated, concise summary.
    *   **Storage:** The new summary is saved using the `write_conversation_summary` tool (which creates an `ai_summary` type message in `user_conversations`).
    *   **Context for Agent:** The main agent uses `read_conversation_history` to fetch the latest summary and the `KEEP_RAW_RECENT_COUNT` most recent raw messages.
    *   Tested successfully, including dynamic population of messages to trigger summarization.
6.  **[ ] Build Core Agent Logic:**
    *   **[X] 6.1. Agent Initialization & Basic Conversation Loop:**
        *   Goal: Get Olivia to respond to a user, incorporating conversation history, and save the exchange.
        *   Tasks: Main LLM (`gpt-4o`) initialized. Basic agent turn implemented in `invoke_agent_turn` function in `agent.py`.
        *   Flow: Saves user message (using `write_conversation_message`), retrieves history (summary and recent messages using `read_conversation_history`), formats prompt (including `INITIAL_SYSTEM_PROMPT`, latest summary, and recent raw messages), calls LLM via an LCEL chain (`ChatPromptTemplate | main_llm | StrOutputParser`), saves AI response (using `write_conversation_message`), and calls `maintain_conversation_summary`.
        *   Tested successfully, demonstrating message saving, LLM invocation, AI response generation, and summary maintenance calls.
    *   **[X] 6.2. Integrating Checklist Tools - Reading and Basic Writing:**
        *   Goal: Enable Olivia to read an existing checklist and add/overwrite a checklist based on user instruction.
        *   Tasks: Make `read_user_checklist` and `write_user_checklist` tools available to the agent, develop simple prompts/logic for their use.
    *   **[X] 6.3. Integrating Checklist Tools - Deletion:**
        *   Goal: Enable Olivia to delete a user's checklist.
        *   Tasks: Make `delete_user_checklist` tool available, develop prompts/logic for its use. Agent confirms with user before deleting.
    *   **[ ] 6.4. Initial Prompt Engineering for Persona & Task Guidance:** (Deferred to prioritize backend API and frontend integration)
        *   Goal: Give Olivia a basic persona and ability to understand her designed tasks.
        *   Tasks: Develop Olivia's main system prompt, refine prompts for recognizing conversation topics (city selection, moving, exploration).
        *   Refinement: Encourage Olivia to be more proactive in suggesting additions to the user's checklist during conversation.
    *   **[ ] 6.5. Basic Error Handling & Fallbacks for Agent:** (Deferred to prioritize backend API and frontend integration)
        *   Goal: Ensure Olivia responds gracefully if she can't understand or fulfill a request.
        *   Tasks: Implement simple fallback responses. (Initial error checking for tool string outputs started in `invoke_agent_turn`)
7.  **[~] Testing:** Unit and integration tests for tools and agent logic have been conducted during development, particularly for `SupabaseHistoryTool` functions, `SupabaseChecklistTool` functions, `maintain_conversation_summary`, and `invoke_agent_turn`. End-to-end conversational testing is ongoing as features are added. (Updated from "Deferred")
8.  **[X] Implement Backend API:** Wrap the LangChain agent in a FastAPI application to serve the frontend. (FastAPI app created with a `/chat/` endpoint and `/health` endpoint. User has confirmed frontend and backend are connected).
9.  **[X] Integrate Backend with Frontend:** Connect the FastAPI endpoints to the existing UI; collaborate with frontend development for final integration and functionality. (User has confirmed frontend and backend are connected, and basic chat flow is working).
10. **[ ] Deployment:** Choose a deployment strategy and deploy the backend application and coordinate with frontend deployment.
11. **[ ] Monitoring & Iteration:** Set up logging and monitoring. Gather feedback and iterate on prompts, tools, and agent performance.

## 6. Future Considerations

*   Finalize and enhance the existing Frontend UI, including full integration with the backend.
*   Integration with external APIs (e.g., flight booking, housing platforms, visa information sites).
*   More sophisticated personalization based on user profiles.
*   Proactive notifications (e.g., visa deadlines).
