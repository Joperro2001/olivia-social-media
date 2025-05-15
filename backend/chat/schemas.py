from pydantic.v1 import BaseModel as BaseModelV1, Field
from pydantic import BaseModel # For new models, assuming V2 is preferred if not specified as V1
from typing import Dict, Any, Optional # Keep Any if used by future checklist schemas

# --- Pydantic Models for History Tool Inputs ---
class WriteMessageInput(BaseModelV1):
    user_id: str = Field(description="Identifier for the user.")
    session_id: str = Field(description="Identifier for the specific conversation session.")
    message_type: str = Field(description="Indicates if the message is from 'human' or 'ai'.")
    content: str = Field(description="The actual content of the message.")

class WriteSummaryInput(BaseModelV1):
    user_id: str = Field(description="Identifier for the user.")
    summary_content: str = Field(description="The content of the summary to be written.")

class ReadHistoryInput(BaseModelV1):
    user_id: str = Field(description="Identifier for the user.")
    max_messages: int = Field(default=10, description="Maximum number of messages to retrieve.")

# --- Pydantic Models for Checklist Tool Inputs ---
class ReadChecklistInput(BaseModelV1):
    user_id: str = Field(description="Identifier for the user whose checklist is to be read.")

class WriteChecklistInput(BaseModelV1):
    user_id: str = Field(description="Identifier for the user whose checklist is to be written.")
    checklist_data: Dict[str, Any] = Field(description="The checklist data in JSON format. This will overwrite any existing checklist for the user.")

class DeleteChecklistInput(BaseModelV1):
    user_id: str = Field(description="Identifier for the user whose checklist is to be deleted.")


# --- Pydantic Models for Chat API ---
class ChatRequest(BaseModel):
    user_id: str
    session_id: str
    message: str

class ChatResponse(BaseModel):
    user_id: str
    session_id: str
    ai_response: Optional[str] = None
    error: Optional[str] = None