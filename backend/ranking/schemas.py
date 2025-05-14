# This file will contain Pydantic models for the ranking feature. 

from pydantic import BaseModel
from typing import List

class RankRequest(BaseModel):
    user_id: str

class RankedUserProfile(BaseModel):
    user_id: str
    full_name: str
    summary: str # A short summary from the LLM about the match

class RankResponse(BaseModel):
    ranking: List[RankedUserProfile] 