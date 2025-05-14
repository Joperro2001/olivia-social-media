# This file will define the FastAPI router for the /rank endpoint.
from fastapi import APIRouter, HTTPException, Depends
from typing import List

from .schemas import RankRequest, RankResponse, RankedUserProfile
from .rank_logic import get_ranked_users

router = APIRouter()

@router.post("/", response_model=RankResponse)
async def rank_users_endpoint(request: RankRequest):
    """
    Endpoint to get a ranked list of similar users for the given user_id.
    The user_id is provided in the request body.
    """
    try:
        if not request.user_id:
            raise HTTPException(status_code=400, detail="user_id must be provided in the request body.")
        
        ranked_list: List[RankedUserProfile] = await get_ranked_users(request.user_id)
        return RankResponse(ranking=ranked_list)
    except HTTPException as he:
        # Re-raise HTTPExceptions directly as they are already well-formed
        raise he
    except Exception as e:
        # Log the exception e for server-side review
        print(f"Unexpected error in /rank endpoint: {type(e).__name__} - {e}")
        # Return a generic 500 error to the client
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred while ranking users. Details: {str(e)}") 