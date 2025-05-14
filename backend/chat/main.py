
from fastapi import FastAPI, HTTPException, Request
from .schemas import ChatRequest, ChatResponse
from typing import Dict, Any, List

app = FastAPI()

@app.post("/chat/")
async def chat_endpoint(request: ChatRequest) -> ChatResponse:
    try:
        # Simple chat processing - in a real app, this would call a language model
        ai_response = f"Hello! I received your message: '{request.message}'"
        
        return ChatResponse(
            user_id=request.user_id,
            session_id=request.session_id,
            ai_response=ai_response
        )
    except Exception as e:
        return ChatResponse(
            user_id=request.user_id,
            session_id=request.session_id,
            ai_response=None,
            error=str(e)
        )

@app.post("/rank")
async def rank_profiles(request: Request) -> Dict[str, Any]:
    try:
        data = await request.json()
        user_profile = data.get("userProfile", {})
        profiles = data.get("profiles", [])
        
        # In a real app, this would use AI to rank the profiles
        # For now, we'll just return the IDs in the same order
        ranked_profiles = [profile["id"] for profile in profiles]
        
        return {"rankedProfiles": ranked_profiles}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check() -> Dict[str, str]:
    return {"status": "ok"}
