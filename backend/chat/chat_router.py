# This file will define the FastAPI router for the chat endpoint.
from fastapi import APIRouter, HTTPException
from typing import Optional

from .schemas import ChatRequest, ChatResponse
from .agent import invoke_agent_turn # Assuming agent.py is in the same directory

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def handle_chat_endpoint(request: ChatRequest):
    """
    Handles a single turn of conversation with Olivia.
    """
    print(f"[ChatRouter] Received chat request for user_id: {request.user_id}, session_id: {request.session_id}")
    try:
        ai_message_content = invoke_agent_turn(
            user_id=request.user_id,
            session_id=request.session_id,
            user_message_content=request.message
        )
        
        if ai_message_content is None:
            print(f"[ChatRouter] Agent returned None for user_id: {request.user_id}")
            raise HTTPException(status_code=500, detail="Agent returned an empty response.")

        # Basic check for error messages from the agent
        if isinstance(ai_message_content, str) and (
            ai_message_content.startswith("Error:") or 
            ai_message_content.startswith("Sorry, I encountered an error") # Check for common error prefixes
        ):
            print(f"[ChatRouter] Agent returned an error message: {ai_message_content}")
            return ChatResponse(
                user_id=request.user_id,
                session_id=request.session_id,
                error=ai_message_content
            )
            
        print(f"[ChatRouter] Successfully processed chat for user_id: {request.user_id}. AI response length: {len(ai_message_content)}")
        return ChatResponse(
            user_id=request.user_id,
            session_id=request.session_id,
            ai_response=ai_message_content
        )

    except HTTPException as http_exc:
        print(f"[ChatRouter] HTTPException for user_id: {request.user_id}: {http_exc.detail}")
        raise http_exc
    except Exception as e:
        print(f"[ChatRouter] Error processing chat for user_id: {request.user_id}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An internal error occurred in chat router: {str(e)}") 