# This file will contain the core logic for the user ranking feature. 
import os
from typing import List, Dict, Any
from fastapi import HTTPException
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import json

# Attempt to import the supabase_client using an absolute path from backend
try:
    from chat.tools import supabase_client
except ImportError as e:
    # Log the original error for more context if this also fails
    print(f"ImportError with 'from backend.chat.tools': {e}")
    # Fallback or alternative initialization if needed
    # For now, we'll re-raise the custom error to indicate the primary expectation.
    raise ImportError("Could not import supabase_client from backend.chat.tools. Ensure it's accessible and PYTHONPATH is correct.")


from .schemas import RankedUserProfile

# Initialize the LLM
# Ensure OPENAI_API_KEY is set in your environment
RANKING_LLM_MODEL = "gpt-4o-mini"
llm = ChatOpenAI(model=RANKING_LLM_MODEL, temperature=0.2) # Slight increase in temperature for more natural summaries

# Define the fields to select from the profiles table
PROFILE_FIELDS_TO_SELECT = [
    "id", "full_name", "age", "university", "nationality", "current_city",
    "move_in_city", "about_me", "created_at", "updated_at", "avatar_url",
    "relocation_status", "relocation_timeframe", "relocation_interests"
]

PROFILE_FIELDS_FOR_LLM = [
    "id", "full_name", "age", "university", "current_city",
    "move_in_city", "about_me", "avatar_url",
    "relocation_status", "relocation_timeframe", "relocation_interests"
]


def _format_profile_for_llm(profile_data: Dict[str, Any]) -> str:
    """Helper function to format a user's profile data into a string for the LLM,
    selecting only the fields relevant for matching."""
    parts = []
    for key in PROFILE_FIELDS_FOR_LLM:
        # We include full_name here for the LLM to know the candidate's name for personalized summaries
        if key in profile_data and profile_data[key] is not None:
            parts.append(f"{key.replace('_', ' ').capitalize()}: {profile_data[key]}")
    return "\n".join(parts)

async def get_ranked_users(requesting_user_id: str) -> List[RankedUserProfile]:
    """
    Fetches user profiles, calls an LLM to rank them based on similarity to the requesting user,
    and returns the ranked list with summaries.
    """

    # 1. Fetch Requesting User's Profile
    try:
        requesting_user_response = supabase_client.table("profiles") \
            .select(", ".join(PROFILE_FIELDS_TO_SELECT)) \
            .eq("id", requesting_user_id) \
            .single() \
            .execute()
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=500, detail=f"Database error fetching requesting user: {str(e)}")

    if hasattr(requesting_user_response, 'error') and requesting_user_response.error:
        raise HTTPException(status_code=404, detail=f"Requesting user with ID {requesting_user_id} not found or error: {requesting_user_response.error.message}")
    if not requesting_user_response.data:
        raise HTTPException(status_code=404, detail=f"Requesting user with ID {requesting_user_id} not found.")
    
    requesting_user_profile_data = requesting_user_response.data
    # Extract requesting user's first name for more personalized LLM prompt, if available
    requesting_user_name = requesting_user_profile_data.get("full_name", "the user").split()[0]


    # 2. Fetch Candidate Users' Profiles
    try:
        candidate_users_response = supabase_client.table("profiles") \
            .select(", ".join(PROFILE_FIELDS_TO_SELECT)) \
            .neq("id", requesting_user_id) \
            .order("updated_at", desc=True) \
            .limit(50) \
            .execute()
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=500, detail=f"Database error fetching candidate users: {str(e)}")

    if hasattr(candidate_users_response, 'error') and candidate_users_response.error:
        raise HTTPException(status_code=500, detail=f"Error fetching candidate users: {candidate_users_response.error.message}")
    
    candidate_users_data = candidate_users_response.data if candidate_users_response.data else []

    if not candidate_users_data:
        return [] # No other users to rank

    # 3. Prepare Data for LLM
    requesting_user_llm_str = _format_profile_for_llm(requesting_user_profile_data)
    
    candidate_profiles_for_llm = []
    for profile in candidate_users_data:
        candidate_profiles_for_llm.append({
            "id": profile["id"], 
            "full_name": profile.get("full_name", "This user"), # Pass full_name for LLM to use in summary
            "details_string": _format_profile_for_llm(profile)
        })

    # 4. Construct LLM Prompt
    # Note: {requesting_user_name} is now used in the system prompt.
    prompt_template = ChatPromptTemplate.from_messages([
        ("system", f"""You are Olivia, a helpful AI assistant facilitating connections between users.
Your task is to rank a list of candidate users based on their similarity to {requesting_user_name} (the requesting user).
Consider all aspects of their profiles: age, university, current and desired cities, about me sections, relocation status, timeframe, and interests.

{requesting_user_name}'s profile is:
--- REQUESTING USER ({requesting_user_name}) ---
{{requesting_user_profile_str}}
--- END REQUESTING USER ---

Here is a list of candidate users. Each candidate has an 'id', 'full_name', and 'details_string':
--- CANDIDATE USERS ---
{{candidate_profiles_list_str}}
--- END CANDIDATE USERS ---

Please provide your ranking as a JSON array.
Each object in the array should represent a candidate user and must contain:
1.  "user_id": The 'id' of the candidate user from the input.
2.  "summary": A concise 1-2 sentence summary, as if you (Olivia) are telling {requesting_user_name} about this match. Use the candidate's first name in the summary. For example: "It looks like Leonardo is also..." or "You might find common ground with Sophia, as she's also...". Highlight key similarities or compatibilities.
    Example for a candidate named Priya: "It seems Priya is also planning a move to Berlin around the same time as you, {requesting_user_name}, and you both love exploring local cafes!"
    Another example for a candidate named Alex: "Alex could be a great connection! They're also a student, interested in tech meetups in Berlin, much like you, {requesting_user_name}."

The JSON array should be ordered from the best match (most similar) to the least compatible.
Output ONLY the JSON array, with no other text before or after it.
"""),
        ("human", f"Please rank these users for me, {requesting_user_name}, and tell me a bit about why each might be a good connection.")
    ])

    # Format candidate list for the prompt
    formatted_candidate_list_str = json.dumps(candidate_profiles_for_llm, indent=2)

    # 5. Call LLM
    chain = prompt_template | llm | StrOutputParser()
    
    llm_response_str = ""
    try:
        llm_response_str = await chain.ainvoke({
            "requesting_user_profile_str": requesting_user_llm_str,
            "candidate_profiles_list_str": formatted_candidate_list_str
            # requesting_user_name is already part of the f-string in the prompt template
        })
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=500, detail=f"LLM call failed: {str(e)}")

    # 6. Parse LLM Response
    try:
        # The LLM should output ONLY the JSON string.
        # Remove potential markdown fences if present
        if llm_response_str.startswith("```json"):
            llm_response_str = llm_response_str[7:]
        if llm_response_str.endswith("```"):
            llm_response_str = llm_response_str[:-3]
        
        llm_response_str = llm_response_str.strip()
        ranked_list_from_llm = json.loads(llm_response_str)
        
        if not isinstance(ranked_list_from_llm, list):
            raise ValueError("LLM did not return a list.")
        for item in ranked_list_from_llm:
            if not isinstance(item, dict) or "user_id" not in item or "summary" not in item:
                raise ValueError("LLM list items are not in the expected format (dict with 'user_id' and 'summary').")

    except (json.JSONDecodeError, ValueError) as e:
        # Log the exception e and llm_response_str for debugging
        print(f"Error parsing LLM response: {e}")
        print(f"LLM Raw Response:\n{llm_response_str}")
        raise HTTPException(status_code=500, detail=f"Error parsing ranking from LLM: {str(e)}. LLM response: {llm_response_str[:500]}") # Show only first 500 chars

    # 7. Combine LLM Output with Full Names
    # Create a lookup for candidate full names by their ID
    candidate_full_names_map = {user["id"]: user["full_name"] for user in candidate_users_data}
    
    final_ranked_list: List[RankedUserProfile] = []
    for ranked_item in ranked_list_from_llm:
        user_id = ranked_item.get("user_id")
        summary = ranked_item.get("summary")
        # The LLM's summary should be user-facing. We still need the full_name for the RankedUserProfile model.
        full_name = candidate_full_names_map.get(user_id)

        if user_id and summary and full_name: # Ensure all parts are present
            final_ranked_list.append(
                RankedUserProfile(user_id=user_id, full_name=full_name, summary=summary)
            )
        else:
            # Log a warning: LLM mentioned a user_id not in our candidate list or missing summary/full_name
            print(f"Warning: LLM output item for user_id '{user_id}' could not be fully processed. Full name found: {bool(full_name)}. Summary present: {bool(summary)}")


    return final_ranked_list 