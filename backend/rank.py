
from fastapi import APIRouter, HTTPException, Depends, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from backend.chat.schemas import UserProfileModel, OtherProfileModel
import logging
import json

# Set up logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()
security = HTTPBearer()

class RankProfilesRequest(BaseModel):
    userProfile: dict
    profiles: List[dict]

class RankedProfilesResponse(BaseModel):
    rankedProfiles: List[str]
    explanation: str

def calculate_compatibility_score(user_profile: dict, other_profile: dict) -> float:
    """
    Calculate a compatibility score between two users.
    Higher score means better compatibility.
    """
    score = 0.0
    
    # Age proximity (closer in age = higher score)
    if user_profile.get('age') and other_profile.get('age'):
        age_diff = abs(user_profile['age'] - other_profile['age'])
        # Score decreases as age difference increases
        score += max(0, 10 - age_diff*0.5)
    
    # Shared interests from relocation_interests
    user_interests = set(user_profile.get('relocation_interests', []))
    other_interests = set(other_profile.get('relocation_interests', []))
    if user_interests and other_interests:
        shared_interests = len(user_interests.intersection(other_interests))
        score += shared_interests * 5  # 5 points per shared interest
    
    # Relocation timeframe alignment
    if user_profile.get('relocation_timeframe') == other_profile.get('relocation_timeframe'):
        score += 15
    elif (user_profile.get('relocation_timeframe') == 'Next month' and 
          other_profile.get('relocation_timeframe') == 'Next 3 months'):
        score += 10
    
    # Relocation status alignment
    if user_profile.get('relocation_status') == other_profile.get('relocation_status'):
        score += 10
    
    # Nationality diversity (different nationality = points)
    if user_profile.get('nationality') != other_profile.get('nationality'):
        score += 5
    
    # About me length (more detailed profiles get slight boost)
    if other_profile.get('about_me'):
        about_me_length = len(other_profile['about_me'])
        if about_me_length > 100:
            score += 5
        elif about_me_length > 50:
            score += 3
    
    # University attendance (some boost for academic background)
    if user_profile.get('university') and other_profile.get('university'):
        score += 5
    
    logger.info(f"Compatibility score between {user_profile.get('full_name')} and {other_profile.get('full_name')}: {score}")
    return score

@router.post("/rank", response_model=RankedProfilesResponse)
async def rank_profiles(
    request: RankProfilesRequest = Body(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        user_id = credentials.credentials
        logger.info(f"Ranking profiles for user {user_id}")
        logger.info(f"User profile: {request.userProfile}")
        logger.info(f"Number of profiles to rank: {len(request.profiles)}")
        
        # Calculate compatibility scores
        scored_profiles = []
        for profile in request.profiles:
            score = calculate_compatibility_score(request.userProfile, profile)
            scored_profiles.append({
                "id": profile["id"],
                "score": score,
                "name": profile.get("full_name", "Unknown")
            })
        
        # Sort by score descending
        scored_profiles.sort(key=lambda x: x["score"], reverse=True)
        
        # Extract just the ordered profile IDs
        ranked_profile_ids = [profile["id"] for profile in scored_profiles]
        
        # Generate a simple explanation
        if scored_profiles:
            top_match = scored_profiles[0]["name"]
            explanation = f"Profiles have been ranked based on compatibility with your profile. {top_match} appears to be your best match based on shared interests, relocation timeline, and other factors."
        else:
            explanation = "No profiles were available for ranking."
        
        logger.info(f"Returning ranked profiles: {ranked_profile_ids}")
        
        return {
            "rankedProfiles": ranked_profile_ids,
            "explanation": explanation
        }
        
    except Exception as e:
        logger.error(f"Error ranking profiles: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to rank profiles: {str(e)}")
