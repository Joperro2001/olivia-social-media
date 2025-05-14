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
*   **Tool-Based Functionality:** Specific tasks like checklist management and history retrieval will be implemented as LangChain Tools, interacting with the Supabase database.
*   **History Management:** Conversation history will be stored per user ID in a Supabase table. A mechanism will be implemented to retrieve and inject relevant history into the prompt context.
*   **Summarization:** A separate LangChain chain (`LLMSummarizationChecker` or custom implementation) will be triggered periodically or based on token count thresholds to condense the conversation history stored in Supabase. This summarized history will be used in subsequent interactions to manage context window limitations.
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
*   **History Tool (`SupabaseHistoryTool`):**
    *   **Purpose:** Read and write conversation history from/to the `user_conversations` Supabase table.
    *   **Functionality:**
        *   `read_history(user_id, max_messages=10, include_summary=True)`: Fetches the most recent messages and the latest summary if available.
        *   `write_message(user_id, session_id, message_type, content)`: Writes a new message to the history.
        *   `write_summary(user_id, summary_content)`: Writes/updates the summary for a user.

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
*   **Checklist Tool (`SupabaseChecklistTool`):**
    *   **Purpose:** Create, read, update, and delete personalized moving checklists stored in the `user_checklists` Supabase table.
    *   **Interaction Flow:**
        1.  User expresses need for moving help or checklist.
        2.  Agent confirms destination, nationality, etc.
        3.  Agent calls `read_checklist(user_id)` to see if one exists.
        4.  Agent engages in conversation to refine/build the checklist points.
        5.  Agent calls `write_checklist(user_id, checklist_data)` to save/update the checklist (represented as JSON).
    *   **Functionality:**
        *   `read_checklist(user_id)`: Retrieves the checklist JSON for the user. Returns `None` if not found.
        *   `write_checklist(user_id, checklist_data)`: Creates or overwrites the checklist JSON for the user.
        *   `delete_checklist(user_id)`: Removes the checklist for the user.

## 5. Implementation Plan Checklist

1.  **[ ] Setup Project:** Initialize Python project, set up virtual environment, install LangChain, Supabase client, and other dependencies (`requirements.txt`).
2.  **[X] Setup Supabase:** Create Supabase project, define `user_conversations` and `user_checklists` tables with the specified schemas. Obtain API keys. (User confirmed done)
3.  **[X] Implement `SupabaseHistoryTool`:** Create the LangChain tool class to interact with the `user_conversations` table (read/write functions).
    *   Implemented as function-based tools (`write_conversation_message`, `write_conversation_summary`, `read_conversation_history`) in `backend/chat/tools.py` using LangChain's `@tool` decorator.
    *   Uses the `supabase-python` library for database interactions; client initialized in `tools.py`.
    *   Pydantic (v1) models for input argument schemas (e.g., `WriteMessageInput`) are defined in `backend/chat/schemas.py` and imported into `tools.py`.
    *   Connects to Supabase using URL and service key from environment variables loaded in `tools.py`.
4.  **[X] Implement `SupabaseChecklistTool`:** Create the LangChain tool class to interact with the `user_checklists` table (read/write/delete functions).
    *   Implemented as function-based tools (`read_user_checklist`, `write_user_checklist`, `delete_user_checklist`) in `backend/chat/tools.py` using LangChain's `@tool` decorator.
    *   These tools interact with the `user_checklists` table in Supabase (using `select`, `upsert`, `delete`).
    *   Pydantic (v1) models for input argument schemas (`ReadChecklistInput`, `WriteChecklistInput`, `DeleteChecklistInput`) are defined in `backend/chat/schemas.py`.
5.  **[X] Develop History Summarization Logic:** Implement the chain/mechanism for summarizing conversation history based on token count. Integrate it with history writing/reading.
    *   Implemented in `backend/chat/agent.py` within the `maintain_conversation_summary(user_id)` function.
    *   Uses `langchain_openai.ChatOpenAI` with the model specified by `SUMMARIZATION_LLM_MODEL` (e.g., "gpt-4o-mini") to generate summaries.
    *   **Trigger:** Summarization occurs if the total count of raw (non-summary) messages for a user exceeds `KEEP_RAW_RECENT_COUNT`.
    *   **Process:** When triggered, it takes the oldest `MESSAGES_TO_FOLD_INTO_SUMMARY_BATCH` raw message(s), combines them with the latest existing summary (if any), and prompts the LLM to create an updated, concise summary.
    *   **Storage:** The new summary is saved using the `write_conversation_summary` tool (which creates an `ai_summary` type message in `user_conversations`).
    *   **Context for Agent:** The main agent will use `read_conversation_history` to fetch the latest summary and the `KEEP_RAW_RECENT_COUNT` most recent raw messages.
6.  **[ ] Build Core Agent Logic:**
    *   **[X] 6.1. Agent Initialization & Basic Conversation Loop:**
        *   Goal: Get Olivia to respond to a user, incorporating conversation history, and save the exchange. No complex tool use by the LLM itself yet, but existing history tools will be used.
        *   Tasks: Set up main LLM (GPT-4o), define basic agent structure (e.g., LCEL chain), implement flow: save user message, retrieve history, format prompt, call LLM, save AI response, call summary maintenance.
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
        *   Tasks: Implement simple fallback responses. (Started)
7.  **[ ] Testing:** (Deferred to prioritize backend API and frontend integration) Write unit and integration tests for tools and agent logic. Conduct end-to-end conversational testing.
8.  **[~] Implement Backend API:** Wrap the LangChain agent in a FastAPI application to serve the frontend. (User has connected frontend and backend)
9.  **[~] Integrate Backend with Frontend:** Connect the FastAPI endpoints to the existing UI; collaborate with frontend development for final integration and functionality. (User has connected frontend and backend)
10. **[ ] Deployment:** Choose a deployment strategy and deploy the backend application and coordinate with frontend deployment.
11. **[ ] Monitoring & Iteration:** Set up logging and monitoring. Gather feedback and iterate on prompts, tools, and agent performance.

## 6. Future Considerations

*   Finalize and enhance the existing Frontend UI, including full integration with the backend.
*   Integration with external APIs (e.g., flight booking, housing platforms, visa information sites).
*   More sophisticated personalization based on user profiles.
*   Proactive notifications (e.g., visa deadlines).
