
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
        
        print(f"Received request to rank profiles for user: {user_profile.get('full_name', 'Unknown')}")
        print(f"Number of profiles to rank: {len(profiles)}")
        
        # For demonstration, create a mock ranking response
        # In a real app, this would use AI to analyze compatibility
        mock_ranking = []
        
        for profile in profiles[:3]:  # Limit to first 3 profiles for demo
            user_id = profile.get("id")
            full_name = profile.get("full_name", "Unknown")
            
            # Create a personalized summary
            summary = f"{full_name} is interested in {', '.join(profile.get('relocation_interests', ['moving to Berlin']))}."
            
            mock_ranking.append({
                "user_id": user_id,
                "full_name": full_name,
                "summary": summary
            })
        
        return {"ranking": mock_ranking}
    except Exception as e:
        print(f"Error in rank_profiles: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check() -> Dict[str, str]:
    return {"status": "ok"}
