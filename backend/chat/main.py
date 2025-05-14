from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# Assuming agent.py is in the same directory or adjust path accordingly
from .agent import invoke_agent_turn 

# --- Pydantic Models for Request and Response ---

class ChatRequest(BaseModel):
    user_id: str
    session_id: str
    message: str

class ChatResponse(BaseModel):
    user_id: str
    session_id: str
    ai_response: Optional[str] = None
    error: Optional[str] = None

# --- FastAPI App Instance ---
app = FastAPI(
    title="Olivia Relocation Assistant API",
    description="API for interacting with Olivia, your AI-powered relocation assistant.",
    version="0.1.0",
)

# --- CORS Configuration ---
# Adjust origins as needed for your Vercel deployment and local development
origins = [
    "http://localhost",         # Common local dev origin
    "http://localhost:3000",    # Common React/Vue/Angular local dev origin
    "http://localhost:8000",    # If frontend and backend are on same local port (less common for dev)
    "https://olivia-social-spark.lovable.app", # Vercel deployment URL (no trailing slash)
    "https://6b04-212-114-183-164.ngrok-free.app", # ngrok URL for backend (no trailing slash)
    # Add any other origins you need
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows specific origins - Restored
    # allow_origins=["*"], # Or, allow all origins (less secure, use for initial testing if needed) - Commented out
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"], # Kept HEAD
    allow_headers=["*"]  # Allow all headers
)

# --- API Endpoints ---

@app.post("/chat/", response_model=ChatResponse)
async def handle_chat(request: ChatRequest):
    """
    Handles a single turn of conversation with Olivia.
    """
    print(f"[API] Received chat request for user_id: {request.user_id}, session_id: {request.session_id}")
    try:
        ai_message_content = invoke_agent_turn(
            user_id=request.user_id,
            session_id=request.session_id,
            user_message_content=request.message
        )
        
        if ai_message_content is None:
            print(f"[API] Agent returned None for user_id: {request.user_id}")
            # This case should ideally be handled within invoke_agent_turn to return a specific message
            # For now, we'll return a generic error if it's still None here.
            raise HTTPException(status_code=500, detail="Agent returned an empty response.")

        # Check if the response from invoke_agent_turn is an error message
        # (This check might need refinement based on how invoke_agent_turn signals errors)
        if isinstance(ai_message_content, str) and (
            ai_message_content.startswith("Error:") or 
            ai_message_content.startswith("Sorry, I encountered an error")
        ):
            print(f"[API] Agent returned an error message: {ai_message_content}")
            return ChatResponse(
                user_id=request.user_id,
                session_id=request.session_id,
                error=ai_message_content
            )
            
        print(f"[API] Successfully processed chat for user_id: {request.user_id}. AI response length: {len(ai_message_content)}")
        return ChatResponse(
            user_id=request.user_id,
            session_id=request.session_id,
            ai_response=ai_message_content
        )

    except HTTPException as http_exc:
        # Re-raise HTTPException to let FastAPI handle it
        print(f"[API] HTTPException for user_id: {request.user_id}: {http_exc.detail}")
        raise http_exc
    except Exception as e:
        print(f"[API] Error processing chat for user_id: {request.user_id}: {e}")
        # Log the full error for debugging
        import traceback
        traceback.print_exc()
        # For any other unhandled exceptions, return a generic 500 error
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")

# --- Health Check Endpoint (Optional but good practice) ---
@app.get("/health/")
async def health_check():
    return {"status": "healthy"}

# To run this application (from the backend directory):
# uvicorn chat.main:app --reload --port 8000
# Ensure agent.py and other dependencies are correctly structured for the import. 