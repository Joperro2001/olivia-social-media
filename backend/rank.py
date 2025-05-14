
from fastapi import FastAPI, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import openai
import os
from fastapi.middleware.cors import CORSMiddleware
import json
import logging
import supabase
import re

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Supabase client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
if not supabase_url or not supabase_key:
    logger.error("Missing Supabase credentials")
    raise EnvironmentError("Missing Supabase credentials")
supabase_client = supabase.create_client(supabase_url, supabase_key)

# OpenAI client
openai_api_key = os.environ.get("OPENAI_API_KEY")
if not openai_api_key:
    logger.error("Missing OpenAI API key")
    raise EnvironmentError("Missing OpenAI API key")

client = openai.OpenAI(api_key=openai_api_key)

class ProfileData(BaseModel):
    id: str
    full_name: Optional[str] = None
    age: Optional[int] = None
    university: Optional[str] = None
    nationality: Optional[str] = None
    current_city: Optional[str] = None
    move_in_city: Optional[str] = None
    about_me: Optional[str] = None
    relocation_status: Optional[str] = None
    relocation_timeframe: Optional[str] = None
    relocation_interests: Optional[List[str]] = None

class RankRequest(BaseModel):
    userProfile: ProfileData
    profiles: List[ProfileData]

class RankResponse(BaseModel):
    rankedProfiles: List[str]
    
def extract_ids_from_json_response(response: str) -> List[str]:
    """Extract profile IDs from an LLM response that should be in JSON format."""
    try:
        # Try to find a JSON array in the response
        match = re.search(r'\[\s*"[^"]*"(?:\s*,\s*"[^"]*")*\s*\]', response)
        if match:
            json_array = match.group(0)
            return json.loads(json_array)
        
        # Alternative: look for a JSON object with a rankedProfiles field
        match = re.search(r'{\s*"rankedProfiles"\s*:\s*(\[\s*"[^"]*"(?:\s*,\s*"[^"]*")*\s*\])', response)
        if match:
            json_array = match.group(1)
            return json.loads(json_array)
        
        # If all else fails, look for UUIDs
        uuids = re.findall(r'[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}', response)
        if uuids:
            return uuids
            
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {e}")
    except Exception as e:
        logger.error(f"Unexpected error extracting IDs: {e}")
    
    return []

@app.post("/rank")
async def rank_profiles(request_data: RankRequest):
    try:
        user_profile = request_data.userProfile
        profiles_to_rank = request_data.profiles
        
        # Fetch user interests from Supabase
        user_interests_response = supabase_client.table("user_interests").select("interest").eq("user_id", user_profile.id).execute()
        user_interests = [item["interest"] for item in user_interests_response.data] if user_interests_response.data else []
        
        # Fetch interests for each profile to rank
        for profile in profiles_to_rank:
            profile_interests_response = supabase_client.table("user_interests").select("interest").eq("user_id", profile.id).execute()
            profile_interests = [item["interest"] for item in profile_interests_response.data] if profile_interests_response.data else []
            # Add interests to profile object
            setattr(profile, "interests", profile_interests)
        
        # Prepare the prompt
        prompt = f"""
        You are an AI matching algorithm for a relocation social network. Your task is to rank profiles based on compatibility with a user.
        
        User Profile:
        - Name: {user_profile.full_name or "Unknown"}
        - Age: {user_profile.age or "Unknown"}
        - Current Location: {user_profile.current_city or "Unknown"}
        - Moving to: {user_profile.move_in_city or "Berlin"}
        - Nationality: {user_profile.nationality or "Unknown"}
        - University: {user_profile.university or "Unknown"}
        - About: {user_profile.about_me or "No information provided"}
        - Interests: {", ".join(user_interests) if user_interests else "No interests provided"}
        - Relocation Timeframe: {user_profile.relocation_timeframe or "Unknown"}
        
        Please rank the following profiles from most compatible to least compatible based on:
        1. Shared interests and hobbies
        2. Similar educational background
        3. Similar relocation timeframe
        4. Potentially complementary skills or experiences
        5. Similar age group (within 5 years is ideal)
        
        Profiles to rank:
        """
        
        for i, profile in enumerate(profiles_to_rank):
            profile_text = f"""
            Profile {i+1} (ID: {profile.id}):
            - Name: {profile.full_name or "Unknown"}
            - Age: {profile.age or "Unknown"}
            - Current Location: {profile.current_city or "Unknown"}
            - Moving to: {profile.move_in_city or "Berlin"}
            - Nationality: {profile.nationality or "Unknown"}
            - University: {profile.university or "Unknown"}
            - About: {profile.about_me or "No information provided"}
            - Interests: {", ".join(getattr(profile, "interests", [])) if hasattr(profile, "interests") else "No interests provided"}
            - Relocation Timeframe: {profile.relocation_timeframe or "Unknown"}
            """
            prompt += profile_text
        
        prompt += """
        Provide your ranking as a JSON array of profile IDs, from most to least compatible.
        Only include the IDs, no explanations needed. For example: ["id1", "id2", "id3"]
        """
        
        logger.info("Sending request to OpenAI...")
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a matching algorithm that ranks profiles by compatibility."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000
        )
        
        logger.info("Received response from OpenAI")
        
        # Extract the ranked profile IDs from the response
        ai_response = response.choices[0].message.content
        ranked_ids = extract_ids_from_json_response(ai_response)
        
        # Ensure we return all profiles, even if the AI missed some
        existing_ids = set(ranked_ids)
        for profile in profiles_to_rank:
            if profile.id not in existing_ids:
                ranked_ids.append(profile.id)
        
        # Send response
        return {"rankedProfiles": ranked_ids}
        
    except Exception as e:
        logger.error(f"Error in rank_profiles: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error ranking profiles: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
